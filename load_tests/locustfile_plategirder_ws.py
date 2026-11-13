import json
import os
import time
from urllib.parse import urlparse
import websocket
from locust import HttpUser, task, constant

PAYLOAD_PATH = os.path.join(os.path.dirname(__file__), "payload_plategirder_opt.json")
with open(PAYLOAD_PATH, "r") as f:
    PAYLOAD_DATA = json.load(f)

class PlateGirderOptimizationWSUser(HttpUser):
    wait_time = constant(0)

    @task
    def run_optimization_simulation(self):
        start_time = time.time()

        parsed_url = urlparse(self.host)
        ws_scheme = "wss" if parsed_url.scheme == "https" else "ws"
        ws_host = f"{ws_scheme}://{parsed_url.netloc}"
        ws_url = f"{ws_host}/ws/optimize/plate-girder/"

        ws_connect_start = time.time()
        ws = None
        try:
            ws = websocket.create_connection(ws_url, timeout=30.0)
            ws_connect_time_ms = int((time.time() - ws_connect_start) * 1000)
            
            self.environment.events.request.fire(
                request_type="WS_CONNECT",
                name="pso_ws_connect",
                response_time=ws_connect_time_ms,
                response_length=0,
                exception=None
            )
        except Exception as e:
            ws_connect_time_ms = int((time.time() - ws_connect_start) * 1000)
            self.environment.events.request.fire(
                request_type="WS_CONNECT",
                name="pso_ws_connect",
                response_time=ws_connect_time_ms,
                response_length=0,
                exception=e
            )
            return

        ws.sock.settimeout(600.0) # 10 mins timeout for heavy optimization

        # Send optimization request
        payload = {
            "type": "start_optimization",
            "data": PAYLOAD_DATA
        }
        
        try:
            ws.send(json.dumps(payload))
        except Exception as e:
            self.environment.events.request.fire(
                request_type="WS_SEND",
                name="pso_round_trip",
                response_time=int((time.time() - start_time) * 1000),
                response_length=0,
                exception=e
            )
            if ws:
                ws.close()
            return

        # Read loop
        try:
            while True:
                message = ws.recv()
                if not message:
                    raise websocket.WebSocketConnectionClosedException("Received empty message")
                
                data = json.loads(message)
                msg_type = data.get("type")
                
                if msg_type == "pso_complete":
                    total_time_ms = int((time.time() - start_time) * 1000)
                    self.environment.events.request.fire(
                        request_type="WS",
                        name="pso_round_trip",
                        response_time=total_time_ms,
                        response_length=len(message),
                        exception=None
                    )
                    break
                elif msg_type == "pso_error":
                    total_time_ms = int((time.time() - start_time) * 1000)
                    err_msg = data.get("data", {}).get("error", "Unknown PSO error")
                    self.environment.events.request.fire(
                        request_type="WS",
                        name="pso_round_trip",
                        response_time=total_time_ms,
                        response_length=len(message),
                        exception=Exception(err_msg)
                    )
                    break
                elif msg_type == "error":
                    total_time_ms = int((time.time() - start_time) * 1000)
                    err_msg = data.get("data", {}).get("message", "Unknown error")
                    self.environment.events.request.fire(
                        request_type="WS",
                        name="pso_round_trip",
                        response_time=total_time_ms,
                        response_length=len(message),
                        exception=Exception(err_msg)
                    )
                    break
        except Exception as e:
            total_time_ms = int((time.time() - start_time) * 1000)
            self.environment.events.request.fire(
                request_type="WS",
                name="pso_round_trip",
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
