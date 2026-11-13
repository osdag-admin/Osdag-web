import json
import os
import time
import gevent
from locust import HttpUser, task, constant

# Load payload once at module level to minimize file I/O overhead during test
PAYLOAD_PATH = os.path.join(os.path.dirname(__file__), "payload.json")
with open(PAYLOAD_PATH, "r") as f:
    PAYLOAD_DATA = json.load(f)

class AxiallyLoadedColumnUser(HttpUser):
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

        # 2. Polling loop (GET requests)
        task_completed = False
        poll_url = f"/api/tasks/{task_id}/"
        
        while not task_completed:
            # Wait for 1 second between polls
            gevent.sleep(1)
            
            with self.client.get(
                poll_url,
                catch_response=True,
                name="GET task status"
            ) as poll_response:
                if poll_response.status_code != 200:
                    poll_response.failure(f"GET task status failed with status code {poll_response.status_code}")
                    total_time_ms = int((time.time() - start_time) * 1000)
                    self.environment.events.request.fire(
                        request_type="GET",
                        name="design_round_trip",
                        response_time=total_time_ms,
                        response_length=len(poll_response.content) if poll_response.content else 0,
                        exception=Exception(f"HTTP {poll_response.status_code} during poll")
                    )
                    break
                
                try:
                    status_data = poll_response.json()
                    status = status_data.get("status")
                except Exception as e:
                    poll_response.failure(f"GET task status response JSON parsing failed: {e}")
                    total_time_ms = int((time.time() - start_time) * 1000)
                    self.environment.events.request.fire(
                        request_type="GET",
                        name="design_round_trip",
                        response_time=total_time_ms,
                        response_length=len(poll_response.content) if poll_response.content else 0,
                        exception=e
                    )
                    break
                
                if status == "SUCCESS":
                    poll_response.success()
                    task_completed = True
                    total_time_ms = int((time.time() - start_time) * 1000)
                    self.environment.events.request.fire(
                        request_type="GET",
                        name="design_round_trip",
                        response_time=total_time_ms,
                        response_length=len(poll_response.content) if poll_response.content else 0,
                        exception=None
                    )
                elif status == "FAILURE":
                    poll_response.failure(f"Task {task_id} failed on the backend: {status_data.get('error')}")
                    task_completed = True
                    total_time_ms = int((time.time() - start_time) * 1000)
                    self.environment.events.request.fire(
                        request_type="GET",
                        name="design_round_trip",
                        response_time=total_time_ms,
                        response_length=len(poll_response.content) if poll_response.content else 0,
                        exception=Exception(status_data.get('error') or "Backend task failed")
                    )
                else:
                    # Task is still running (PENDING, STARTED, etc.)
                    poll_response.success()
