import json
import threading
import time
import os
import logging

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from celery.result import AsyncResult

logger = logging.getLogger(__name__)

# ─── Shared active-connection counter (atomic via threading.Lock) ─────────────
_active_ws_lock  = threading.Lock()
_active_ws_count = 0  # live gauge: total open WS connections across all workers

INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "osdag_metrics")
INFLUXDB_ORG    = os.getenv("INFLUXDB_ORG",    "osdag")


@database_sync_to_async
def _check_task_status_sync(task_id: str):
    """Query Celery result backend synchronously in a thread pool."""
    task_result = AsyncResult(task_id)
    if task_result.ready():
        state      = task_result.status
        result_val = None
        error_val  = None
        if task_result.successful():
            result_val = task_result.result
        else:
            error_val = str(task_result.result)
        return {
            "ready": True,
            "status": state,
            "result": result_val,
            "error": error_val
        }
    return {"ready": False}


def _write_ws_point_sync(event: str, task_id: str, channel_name: str,
                          active_count: int, close_code: int = 0):
    """Synchronous InfluxDB write — runs in a daemon thread."""
    from django.conf import settings
    url   = os.getenv("INFLUXDB_URL", "http://influxdb:8086")
    token = settings.INFLUXDB_TOKEN
    if not token:
        return
    try:
        from influxdb_client import InfluxDBClient, Point, WritePrecision
        from influxdb_client.client.write_api import SYNCHRONOUS
        with InfluxDBClient(url=url, token=token, org=INFLUXDB_ORG) as client:
            write_api = client.write_api(write_options=SYNCHRONOUS)
            p = (
                Point("osdag_websockets")
                .tag("event",      event)           # "connect" | "disconnect"
                .tag("task_id",    task_id[:40])    # truncate long UUIDs
                .tag("close_code", str(close_code))
                .field("active_connections", int(active_count))
                .field("count", 1)
                .time(time.time_ns(), WritePrecision.NANOSECONDS)
            )
            write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=p)
    except Exception as exc:
        logger.debug("[WSMetrics] write failed: %s", exc)


def _fire_ws_metric(event: str, task_id: str, channel_name: str,
                     active_count: int, close_code: int = 0):
    """Start a daemon thread so we never block the async event loop."""
    threading.Thread(
        target=_write_ws_point_sync,
        args=(event, task_id, channel_name, active_count, close_code),
        daemon=True,
    ).start()


class TaskStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        global _active_ws_count

        self.task_id    = self.scope['url_route']['kwargs']['task_id']
        self.group_name = f"task_{self.task_id}"

        # Join the task group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        # ── Track active connections ──────────────────────────────────────────
        with _active_ws_lock:
            _active_ws_count += 1
            current_count = _active_ws_count

        _fire_ws_metric(
            event="connect",
            task_id=self.task_id,
            channel_name=self.channel_name,
            active_count=current_count,
        )
        logger.debug("[WSMetrics] connect: task=%s  active=%d", self.task_id, current_count)

        # Check if the task is already completed (race condition mitigation)
        status_data = await _check_task_status_sync(self.task_id)
        if status_data["ready"]:
            await self.send(text_data=json.dumps({
                "status": status_data["status"],
                "result": status_data["result"],
                "error":  status_data["error"],
            }))

    async def disconnect(self, close_code):
        global _active_ws_count

        # Leave the task group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        # ── Track active connections ──────────────────────────────────────────
        with _active_ws_lock:
            _active_ws_count = max(0, _active_ws_count - 1)
            current_count = _active_ws_count

        _fire_ws_metric(
            event="disconnect",
            task_id=self.task_id,
            channel_name=self.channel_name,
            active_count=current_count,
            close_code=close_code,
        )
        logger.debug("[WSMetrics] disconnect: task=%s  code=%s  active=%d",
                     self.task_id, close_code, current_count)

    # Receive message from task group and forward it to WebSocket client
    async def task_update(self, event):
        await self.send(text_data=json.dumps({
            "status": event["status"],
            "result": event.get("result"),
            "error":  event.get("error"),
        }))


class PSOOptimizationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time Plate Girder PSO optimization.

    Receives start_optimization requests, dispatches the heavy work to a Celery
    task, forwards streamed particle/heartbeat/completion updates back to the
    client, and revokes the running task on disconnect to avoid zombie tasks.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.task_id = None

    async def connect(self):
        logger.info(f"PSO WebSocket connecting: {self.channel_name}")
        await self.accept()

    async def disconnect(self, close_code):
        logger.info(f"PSO WebSocket disconnected: {self.channel_name}, code: {close_code}")
        if self.task_id:
            logger.warning(f"Disconnect detected. Revoking task {self.task_id} to prevent zombie task")
            try:
                from config.celery import app

                def revoke_task():
                    app.control.revoke(self.task_id, terminate=True)

                await sync_to_async(revoke_task)()
            except Exception as e:
                logger.error(f"Error revoking task {self.task_id}: {e}")

    async def receive_json(self, content):
        message_type = content.get('type')

        if message_type == 'start_optimization':
            input_data = content.get('data', {})
            from apps.modules.flexure_member.submodules.plate_girder.tasks import run_pso_optimization
            try:
                task_result = run_pso_optimization.delay(self.channel_name, input_data)
                self.task_id = task_result.id
                logger.info(f"PSO Celery task triggered: {self.task_id}")
                await self.send_json({
                    'type': 'task_started',
                    'data': {'task_id': self.task_id, 'channel_name': self.channel_name}
                })
            except Exception as e:
                logger.error(f"Error triggering PSO task: {e}")
                await self.send_json({
                    'type': 'error',
                    'data': {'message': f'Failed to start optimization: {str(e)}'}
                })
        else:
            logger.warning(f"Unknown message type: {message_type}")

    async def pso_update(self, event):
        await self.send_json({'type': 'pso_update', 'data': event.get('data', {})})

    async def pso_complete(self, event):
        self.task_id = None
        await self.send_json({'type': 'pso_complete', 'data': event.get('data', {})})

    async def pso_heartbeat(self, event):
        await self.send_json({'type': 'pso_heartbeat', 'data': event.get('data', {})})

    async def pso_error(self, event):
        self.task_id = None
        await self.send_json({'type': 'pso_error', 'data': event.get('data', {})})
