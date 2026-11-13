"""
signals.py — Osdag-web Celery signal handlers.

1. WebSocket broadcast (existing): pushes task result to frontend.
2. InfluxDB metrics (new): records task start/end/failure timing and counts
   to the osdag_metrics bucket so load-test data is queryable in Grafana.
"""

import time
import threading
import os
import logging

from celery.signals import task_prerun, task_postrun, task_failure, task_retry
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)

# ─── InfluxDB helpers (same lazy pattern as middleware) ───────────────────────
_influx_write_api = None
_influx_lock      = threading.Lock()

INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "osdag_metrics")
INFLUXDB_ORG    = os.getenv("INFLUXDB_ORG",    "osdag")

# In-process store for task start times: {task_id: monotonic_start_time}
_task_start_times: dict = {}
_task_start_lock  = threading.Lock()


def _get_write_api():
    global _influx_write_api
    if _influx_write_api is not None:
        return _influx_write_api
    with _influx_lock:
        if _influx_write_api is not None:
            return _influx_write_api
        from django.conf import settings
        url   = os.getenv("INFLUXDB_URL", "http://influxdb:8086")
        token = settings.INFLUXDB_TOKEN
        if not token:
            _influx_write_api = None
            return _influx_write_api
        try:
            from influxdb_client import InfluxDBClient
            from influxdb_client.client.write_api import ASYNCHRONOUS
            client = InfluxDBClient(url=url, token=token, org=INFLUXDB_ORG)
            _influx_write_api = client.write_api(write_options=ASYNCHRONOUS)
        except Exception as exc:
            logger.warning("[InfluxSignals] Could not connect to InfluxDB: %s", exc)
            _influx_write_api = None
        return _influx_write_api


def _write_influx(point):
    """Fire-and-forget InfluxDB write (daemon thread)."""
    def _do_write():
        api = _get_write_api()
        if api is None:
            return
        try:
            api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
        except Exception as exc:
            logger.debug("[InfluxSignals] Write failed: %s", exc)
    threading.Thread(target=_do_write, daemon=True).start()


def _make_task_point(task_name: str, task_id: str, status: str,
                     duration_ms: float | None = None,
                     queue: str = "unknown",
                     error_type: str = ""):
    """Build an InfluxDB Point for the osdag_tasks measurement."""
    import time as _time
    from influxdb_client import Point, WritePrecision
    p = (
        Point("osdag_tasks")
        .tag("task_name", task_name or "unknown")
        .tag("task_id",   task_id   or "unknown")
        .tag("status",    status)
        .tag("queue",     queue)
        .tag("error_type", error_type)
        .field("count", 1)
        .time(_time.time_ns(), WritePrecision.NANOSECONDS)
    )
    if duration_ms is not None:
        p = p.field("duration_ms", float(duration_ms))
    return p


def _resolve_queue(task) -> str:
    """Best-effort queue name from task routing config."""
    try:
        from django.conf import settings
        routes = getattr(settings, "CELERY_TASK_ROUTES", {})
        task_name = task.name if hasattr(task, "name") else str(task)
        info = routes.get(task_name, {})
        return info.get("queue", "celery")
    except Exception:
        return "unknown"


# ─── Signal: task started ─────────────────────────────────────────────────────
@task_prerun.connect
def on_task_prerun(task_id, task, **kwargs):
    with _task_start_lock:
        _task_start_times[task_id] = time.monotonic()

    try:
        queue = _resolve_queue(task)
        p = _make_task_point(
            task_name=task.name,
            task_id=task_id,
            status="STARTED",
            queue=queue,
        )
        _write_influx(p)
    except Exception as exc:
        logger.debug("[InfluxSignals] prerun write failed: %s", exc)


# ─── Signal: task completed (success OR failure) ──────────────────────────────
@task_postrun.connect
def on_task_postrun(task_id, task, retval, state, **kwargs):
    # ── 1. Existing WebSocket broadcast ──────────────────────────────────────
    channel_layer = get_channel_layer()
    if channel_layer:
        logger.info(
            f"Celery task {task_id} completed with state {state}. "
            "Broadcasting to channel layer."
        )
        result_val = None
        error_val  = None
        if state == "SUCCESS":
            import json
            try:
                serialized = json.dumps(retval)
                if len(serialized) > 500 * 1024:  # 500 KB
                    logger.info(
                        f"Celery task {task_id} result is large "
                        f"({len(serialized)} bytes). Omitting from WebSocket broadcast."
                    )
                else:
                    result_val = retval
            except Exception as e:
                logger.error(f"Failed to serialize Celery task {task_id} result: {e}")
        else:
            error_val = str(retval)

        async_to_sync(channel_layer.group_send)(
            f"task_{task_id}",
            {
                "type":   "task.update",
                "status": state,
                "result": result_val,
                "error":  error_val,
            },
        )
    else:
        logger.error("Could not obtain Channel Layer inside Celery task_postrun signal receiver.")

    # ── 2. InfluxDB metrics ───────────────────────────────────────────────────
    try:
        with _task_start_lock:
            start = _task_start_times.pop(task_id, None)
        duration_ms = (time.monotonic() - start) * 1000.0 if start is not None else None
        queue = _resolve_queue(task)
        p = _make_task_point(
            task_name=task.name,
            task_id=task_id,
            status=state,
            duration_ms=duration_ms,
            queue=queue,
        )
        _write_influx(p)
    except Exception as exc:
        logger.debug("[InfluxSignals] postrun write failed: %s", exc)


# ─── Signal: task raised an exception ────────────────────────────────────────
@task_failure.connect
def on_task_failure(task_id, exception, task, **kwargs):
    try:
        error_type = type(exception).__name__ if exception else "UnknownError"
        with _task_start_lock:
            start = _task_start_times.pop(task_id, None)
        duration_ms = (time.monotonic() - start) * 1000.0 if start is not None else None
        queue = _resolve_queue(task)
        p = _make_task_point(
            task_name=task.name,
            task_id=task_id,
            status="FAILURE",
            duration_ms=duration_ms,
            queue=queue,
            error_type=error_type,
        )
        _write_influx(p)
    except Exception as exc:
        logger.debug("[InfluxSignals] failure write failed: %s", exc)


# ─── Signal: task is being retried ───────────────────────────────────────────
@task_retry.connect
def on_task_retry(request, reason, **kwargs):
    try:
        task_id   = request.id
        task_name = request.task
        p = _make_task_point(
            task_name=task_name,
            task_id=task_id,
            status="RETRY",
            error_type=type(reason).__name__ if reason else "",
        )
        _write_influx(p)
    except Exception as exc:
        logger.debug("[InfluxSignals] retry write failed: %s", exc)

