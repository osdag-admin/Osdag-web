import json
import os
import time
from urllib.parse import urlparse
import websocket
from locust import HttpUser, task, constant

# Load payload once at module level to minimize file I/O overhead during test
PAYLOAD_PATH = os.path.join(os.path.dirname(__file__), "payload.json")
with open(PAYLOAD_PATH, "r") as f:
    PAYLOAD_DATA = json.load(f)

class AxiallyLoadedColumnWSUser(HttpUser):
    # Continuous hammering: zero think time/delay between tasks
    wait_time = constant(0)

    @task
    def run_design_simulation(self):
        # Track start time of the entire round-trip
        start_time = time.time()
        
        # 1. Enqueue task (POST request)
        enqueue_start = time.time()
        headers = {"Content-Type": "application/json"}
        
        with self.client.post(
            "/api/modules/compression-member/axially-loaded-column/design/",
            json=PAYLOAD_DATA,
            headers=headers,
            catch_response=True,
            timeout=10.0,
            name="design_enqueue"
        ) as post_response:
            enqueue_time_ms = int((time.time() - enqueue_start) * 1000)
            
            if post_response.status_code != 202:
                post_response.failure(f"POST design failed with status code {post_response.status_code}")
                # Fire custom enqueue event as failed
                self.environment.events.request.fire(
                    request_type="POST",
                    name="design_enqueue",
                    response_time=enqueue_time_ms,
                    response_length=len(post_response.content) if post_response.content else 0,
                    exception=Exception(f"HTTP {post_response.status_code}")
                )
                return
            
            try:
                response_json = post_response.json()
                task_id = response_json.get("task_id")
            except Exception as e:
                post_response.failure(f"POST design response JSON parsing failed: {e}")
                self.environment.events.request.fire(
                    request_type="POST",
                    name="design_enqueue",
                    response_time=enqueue_time_ms,
                    response_length=len(post_response.content) if post_response.content else 0,
                    exception=e
                )
                return
            
            if not task_id:
                post_response.failure("POST design response did not contain 'task_id'")
                self.environment.events.request.fire(
                    request_type="POST",
                    name="design_enqueue",
                    response_time=enqueue_time_ms,
                    response_length=len(post_response.content) if post_response.content else 0,
                    exception=Exception("Missing task_id")
                )
                return
            
            # Successfully enqueued!
            post_response.success()
            self.environment.events.request.fire(
                request_type="POST",
                name="design_enqueue",
                response_time=enqueue_time_ms,
                response_length=len(post_response.content) if post_response.content else 0,
                exception=None
            )

        # 2. Establish WebSocket connection
        parsed_url = urlparse(self.host)
        ws_scheme = "wss" if parsed_url.scheme == "https" else "ws"
        ws_host = f"{ws_scheme}://{parsed_url.netloc}"
        ws_url = f"{ws_host}/ws/tasks/{task_id}/"
        
        ws_connect_start = time.time()
        ws = None
        try:
            ws = websocket.create_connection(ws_url, timeout=30.0)
            ws_connect_time_ms = int((time.time() - ws_connect_start) * 1000)
            
            self.environment.events.request.fire(
                request_type="WS_CONNECT",
                name="design_ws_connect",
                response_time=ws_connect_time_ms,
                response_length=0,
                exception=None
            )
        except Exception as e:
            ws_connect_time_ms = int((time.time() - ws_connect_start) * 1000)
            self.environment.events.request.fire(
                request_type="WS_CONNECT",
                name="design_ws_connect",
                response_time=ws_connect_time_ms,
                response_length=0,
                exception=e
            )
            # Cannot proceed if we failed to connect to WebSocket
            total_time_ms = int((time.time() - start_time) * 1000)
            self.environment.events.request.fire(
                request_type="WS",
                name="design_round_trip",
                response_time=total_time_ms,
                response_length=0,
                exception=e
            )
            return

        # Set a socket-level read timeout so a silent WS drop doesn't freeze
        # the greenlet indefinitely. 60s is generous for the heaviest tier.
        ws.sock.settimeout(60.0)

        # 3. Read loop waiting for completion
        try:
            while True:
                message = ws.recv()
                if not message:
                    raise websocket.WebSocketConnectionClosedException("Received empty message (socket closed)")
                
                # Parse message
                data = json.loads(message)
                status = data.get("status")
                
                if status == "SUCCESS":
                    total_time_ms = int((time.time() - start_time) * 1000)
                    self.environment.events.request.fire(
                        request_type="WS",
                        name="design_round_trip",
                        response_time=total_time_ms,
                        response_length=len(message),
                        exception=None
                    )
                    break
                elif status == "FAILURE":
                    total_time_ms = int((time.time() - start_time) * 1000)
                    error_msg = data.get("error") or "Calculation failed on backend"
                    self.environment.events.request.fire(
                        request_type="WS",
                        name="design_round_trip",
                        response_time=total_time_ms,
                        response_length=len(message),
                        exception=Exception(error_msg)
                    )
                    break
                else:
                    # Task is still running (PENDING, STARTED, etc.). Keep listening.
                    pass
        except Exception as e:
            total_time_ms = int((time.time() - start_time) * 1000)
            self.environment.events.request.fire(
                request_type="WS",
                name="design_round_trip",
                response_time=total_time_ms,
                response_length=0,
                exception=e
            )
        finally:
            if ws:
                try:
                    ws.close()
                except Exception:
                    pass
