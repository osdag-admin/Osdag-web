"""
Osdag-web InfluxDB Metrics Middleware
======================================
Captures every Django HTTP request and writes a data point to InfluxDB with:
  - path, method, HTTP status code
  - duration in milliseconds
  - module/submodule tags extracted from the URL path
  - user email (if authenticated) as a tag for per-user analysis

Measurement: osdag_requests

Design-click paths currently tracked:
  /api/design/         → tagged as design_event=True
  /api/tasks/<id>/     → task status polls
  Any other /api/      → generic API call

The write is done in a fire-and-forget background thread to avoid
adding any latency to the actual response.
"""

import time
import threading
import logging
import os
import re

logger = logging.getLogger(__name__)

# ─── Lazy InfluxDB client (initialised once on first request) ─────────────────
_influx_write_api = None
_influx_lock = threading.Lock()

INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "osdag_metrics")
INFLUXDB_ORG    = os.getenv("INFLUXDB_ORG",    "osdag")


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
            logger.info("[InfluxMetrics] Connected to InfluxDB at %s", url)
        except Exception as exc:
            logger.warning("[InfluxMetrics] Could not connect to InfluxDB: %s", exc)
            _influx_write_api = None
        return _influx_write_api

_DESIGN_PATTERNS = [
    (re.compile(r"^/api/([^/]+)/([^/]+)/design"), "design_calculation"),
    (re.compile(r"^/api/tasks/([^/]+)/"),          "task_poll"),
    (re.compile(r"^/api/design/cad"),               "cad_generation"),
    (re.compile(r"^/api/design/downloadCad"),       "cad_download"),
    (re.compile(r"^/api/projects/"),                "project_api"),
    (re.compile(r"^/api/report/"),                  "report_api"),
    (re.compile(r"^/api/design-preferences/"),      "design_preferences"),
]

_MODULE_SLUG_RE = re.compile(
    r"^/api/(shear-connection|moment-connection|tension-member|flexure-member|"
    r"base-plate|compression-member)/([^/]+)/"
)


def _extract_tags(path: str):
    """Return (module, submodule, event_type) strings from the request path."""
    m = _MODULE_SLUG_RE.match(path)
    if m:
        return m.group(1), m.group(2), "design_calculation"

    for pattern, event_type in _DESIGN_PATTERNS:
        if pattern.match(path):
            return "unknown", "unknown", event_type

    return "unknown", "unknown", "other"


# ─── Middleware ───────────────────────────────────────────────────────────────
class InfluxMetricsMiddleware:
    """
    WSGI/ASGI compatible middleware.
    Add to settings.MIDDLEWARE (after CorsMiddleware, before SilkyMiddleware).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = (time.perf_counter() - start) * 1000.0

        # Skip non-API paths and static/silk/admin noise
        path = request.path
        if not path.startswith("/api/") and not path.startswith("/osdag-web/"):
            return response

        # Skip silk profiling endpoints themselves
        if path.startswith("/silk/"):
            return response

        # Fire & forget — never block the response
        threading.Thread(
            target=self._write_point,
            args=(request, response.status_code, duration_ms),
            daemon=True,
        ).start()

        return response

    def _write_point(self, request, status_code: int, duration_ms: float):
        write_api = _get_write_api()
        if write_api is None:
            return
        try:
            from influxdb_client import Point, WritePrecision
            import time as _time

            path       = request.path
            method     = request.method
            module, submodule, event_type = _extract_tags(path)

            # Try to get user email from Firebase auth header or request.user
            user_email = "anonymous"
            try:
                if hasattr(request, "user") and request.user and request.user.is_authenticated:
                    user_email = getattr(request.user, "email", "authenticated")
                elif "HTTP_X_USER_EMAIL" in request.META:
                    user_email = request.META["HTTP_X_USER_EMAIL"]
            except Exception:
                pass

            p = (
                Point("osdag_requests")
                .tag("method",      method)
                .tag("path",        path[:120])       # truncate very long paths
                .tag("status_code", str(status_code))
                .tag("module",      module)
                .tag("submodule",   submodule)
                .tag("event_type",  event_type)
                .tag("user_email",  user_email)
                .field("duration_ms", float(duration_ms))
                .field("count",       1)
                .time(_time.time_ns(), WritePrecision.NANOSECONDS)
            )
            write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=p)
        except Exception as exc:
            logger.debug("[InfluxMetrics] Write failed: %s", exc)
