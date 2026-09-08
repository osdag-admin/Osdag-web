# Chapter 13: System Telemetry & Metrics Collection

This chapter provides a detailed examination of the monitoring infrastructure, time-series data schemas, collection mechanisms, and configuration details of Osdag-Web's observability pipeline. Monitoring system telemetry is essential to identify resource leaks, database locks, thread starvation, and queue congestion in a production engineering application.

---

## 13.1 Telemetry Infrastructure Overview

Osdag-Web relies on a **telemetry sidecar pattern** to monitor performance without impacting application calculations. Instead of embedding telemetry hooks within the core engineering execution blocks, a lightweight helper container runs alongside the core services to gather system metrics, message broker states, database indicators, and thread-level process allocations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Osdag-Web Application Node                      │
│                                                                        │
│  ┌─────────────────┐    ┌────────────────┐    ┌─────────────────────┐  │
│  │   ASGI Daphne   │    │  Celery Worker │    │ Redis Broker        │  │
│  │  (HTTP / WS)    │    │ (Physics/CAD)  │    │ (Queues & Channels) │  │
│  └────────┬────────┘    └────────┬───────┘    └──────────┬──────────┘  │
│           │                      │                       │             │
└───────────┼──────────────────────┼───────────────────────┼─────────────┘
            │                      │                       │
            │ HTTP/WS Telemetry    │ Task Complete Hooks   │ Stats / Queue Depth
            ▼                      ▼                       ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │                    InfluxDB Client Write API                     │
   └────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │ InfluxDB TimeSeries│◄──── [ Grafana Dashboard ]
                         └────────────────────┘
```

The stack consists of five key components:
1. **Sidecar Collector (`metrics_collector.py`):** An independent Python process that polls system statistics every 0.5s, Redis queues every 1.0s, and thread counts every 2.0s, pushing batches to InfluxDB.
2. **Django Middleware:** A custom request-response tracking layer inside the main web server that records HTTP API request durations.
3. **ASGI WebSocket Consumers:** Real-time state trackers that write live WebSocket connection counts.
4. **InfluxDB Enterprise v2:** A time-series database optimized for high-write telemetry throughput.
5. **Grafana Dashboards:** A visualization interface that queries InfluxDB in real-time.

---

## 13.2 System Metrics Schema Definition (`osdag_system`)

The `osdag_system` measurement aggregates hardware resource usage metrics on the host machine. Because calculations on the Osdag backend can consume substantial CPU power, this schema monitors both individual CPU cores and aggregate system metrics.

### Fields and Tags:
* **Measurement Name:** `osdag_system`
* **Tags:**
  * `host`: The hostname of the container/VM (e.g., `osdag-server`).
  * `metric_type`: Type of hardware metric (e.g., `cpu`, `ram`, `swap`).
  * `cpu_core`: CPU core identifier (e.g., `core_0`, `core_1`, or `total_avg`).
* **Fields:**
  * `cpu_percent` (float): CPU core utilization percentage.
  * `ram_used_mb` (float): Memory consumed by processes in Megabytes.
  * `ram_available_mb` (float): Unallocated physical memory in Megabytes.
  * `ram_total_mb` (float): Total physical memory installed.
  * `ram_percent` (float): Memory utilization percentage.
  * `swap_used_mb` (float): Pagefile disk storage consumed.
  * `swap_total_mb` (float): Total swap disk space allocated.
  * `swap_percent` (float): Swap utilization percentage.

---

## 13.3 Celery Task Queue Metrics Schema (`osdag_tasks`)

The `osdag_tasks` measurement tracks execution queues. When users request calculation jobs, the task is routed to a Celery worker. This schema helps spot calculations backing up in queue backlogs.

### Fields and Tags:
* **Measurement Name:** `osdag_tasks`
* **Tags:**
  * `host`: Host identity tag.
  * `queue`: The Celery queue being monitored (`calculations`, `cad`, `reports`, or `celery`).
  * `task_name`: The monitoring metric label (`queue_depth`).
  * `status`: Task state (e.g., `queued`).
* **Fields:**
  * `queue_depth` (integer): The number of tasks currently waiting in the Redis queue for that specific queue name.

---

## 13.4 Redis In-Memory Store Telemetry Schema (`osdag_redis`)

Redis acts as both the task broker and the channel backend. Under load, it must handle both fast task insertions and WebSocket pub/sub messaging.

### Fields and Tags:
* **Measurement Name:** `osdag_redis`
* **Tags:**
  * `host`: Host identity tag.
* **Fields:**
  * `connected_clients` (integer): Number of active TCP socket connections to Redis.
  * `blocked_clients` (integer): Clients blocked waiting on list operations (e.g., Celery workers waiting for tasks).
  * `used_memory_mb` (float): Memory consumed by Redis keys and structures in Megabytes.
  * `used_memory_rss_mb` (float): Memory allocated to Redis by the operating system.
  * `mem_fragmentation_ratio` (float): Ratio of RSS memory to virtual memory. High ratios indicate memory fragmentation.
  * `pubsub_channels` (integer): Number of active pub/sub channels (corresponds to active Django Channels groups).
  * `pubsub_patterns` (integer): Active pub/sub pattern matching counts.
  * `keyspace_hits` (integer): Successful key lookups from caching logic.
  * `keyspace_misses` (integer): Key lookups that returned null/miss.
  * `instantaneous_ops_per_sec` (integer): Current command execution rate.
  * `total_commands_processed` (integer): Cumulative count of all commands executed.
  * `total_connections_received` (integer): Cumulative client connections count.
  * `rejected_connections` (integer): Connections refused due to limits.

---

## 13.5 Process Thread Telemetry Schema (`osdag_threads`)

The `osdag_threads` schema monitors thread allocation by system role. Because Python processes are subject to the Global Interpreter Lock (GIL), Osdag uses separate processes rather than single-process threads. Monitoring thread allocations per service role ensures the worker pool isn't suffering from thread starvation.

### Fields and Tags:
* **Measurement Name:** `osdag_threads`
* **Tags:**
  * `host`: Host identity tag.
  * `role`: Process role class (`gunicorn`, `daphne`, `celery-worker`, `celery-beat`, `python-other`, or `all-osdag`).
* **Fields:**
  * `total_threads` (integer): Sum of all threads active in this role.
  * `process_count` (integer): Number of operating system processes running under this role.
  * `threads_running` (integer): Threads in an active CPU execution state.
  * `threads_sleeping` (integer): Idle threads waiting on I/O.
  * `threads_other` (integer): Threads in zombie, disk-sleep, or stopped states.

---

## 13.6 In-Depth Analysis of the Sidecar Script

The metrics collection agent is implemented in `monitoring/metrics_collector.py`. It runs as a standalone Python process, periodically polling system APIs and batch-writing measurements to InfluxDB.

### Complete Sidecar Script: `metrics_collector.py`

Below is the complete implementation of the sidecar script:

```python
"""
Osdag-web Metrics Collector Sidecar
====================================
Runs as a separate Docker container. Collects and writes to InfluxDB v2:

  osdag_system   — per-core CPU %, total CPU avg, RAM, swap   (every 0.5 s)
  osdag_tasks    — Celery queue depths per queue name          (every ~1 s)
  osdag_redis    — Redis INFO: connected_clients, pubsub_channels,
                   used_memory, keyspace hits/misses, ops/sec  (every ~1 s)
  osdag_threads  — Per-process-role thread counts + states     (every ~2 s)
                   Roles: gunicorn, celery-worker, celery-beat, daphne, python-other
                   Fields: total_threads, process_count,
                           threads_running, threads_sleeping, threads_other

WebSocket connection counts come from the Django process itself
(apps.core.consumers) and are written to osdag_websockets directly.

Environment variables:
  INFLUXDB_URL        - e.g. http://influxdb:8086
  INFLUXDB_TOKEN      - all-access token
  INFLUXDB_ORG        - e.g. osdag
  INFLUXDB_BUCKET     - e.g. osdag_metrics
  REDIS_URL           - e.g. redis://redis:6379/0
  SAMPLE_INTERVAL_S   - default 0.5
  HOST_LABEL          - label for the 'host' tag (default: osdag-server)
"""

import os
import time
import socket
import logging
import threading

import psutil
import redis as redis_lib
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("metrics_collector")

# ─── Config ───────────────────────────────────────────────────────────────────
INFLUXDB_URL    = os.getenv("INFLUXDB_URL",    "http://influxdb:8086")
INFLUXDB_TOKEN  = os.getenv("INFLUXDB_TOKEN",  "osdag-super-secret-token")
INFLUXDB_ORG    = os.getenv("INFLUXDB_ORG",    "osdag")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "osdag_metrics")
REDIS_URL       = os.getenv("REDIS_URL",       "redis://redis:6379/0")
SAMPLE_INTERVAL = float(os.getenv("SAMPLE_INTERVAL_S", "0.5"))
HOST_LABEL      = os.getenv("HOST_LABEL",      socket.gethostname())

# Celery queue names to monitor (must match docker-compose celery command)
CELERY_QUEUES = ["calculations", "cad", "reports", "celery"]

# ─── InfluxDB client ──────────────────────────────────────────────────────────
influx_client = InfluxDBClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUXDB_ORG,
)
write_api = influx_client.write_api(write_options=SYNCHRONOUS)

# ─── Redis client ─────────────────────────────────────────────────────────────
def get_redis_client():
    try:
        r = redis_lib.from_url(REDIS_URL, socket_connect_timeout=2, socket_timeout=2)
        r.ping()
        return r
    except Exception as e:
        log.warning(f"Redis not available: {e}")
        return None

redis_client = None

# ─── Helpers ──────────────────────────────────────────────────────────────────
def write_points(points: list):
    """Batch write points to InfluxDB, swallow transient errors."""
    try:
        write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=points)
    except Exception as e:
        log.warning(f"InfluxDB write failed: {e}")


def collect_system_metrics():
    """Collect per-core CPU % and RAM stats. Returns list of InfluxDB Points."""
    points = []
    ts = time.time_ns()

    # Per-core CPU (non-blocking)
    cpu_percents = psutil.cpu_percent(percpu=True)
    for core_idx, cpu_pct in enumerate(cpu_percents):
        p = (
            Point("osdag_system")
            .tag("host", HOST_LABEL)
            .tag("metric_type", "cpu")
            .tag("cpu_core", f"core_{core_idx}")
            .field("cpu_percent", float(cpu_pct))
            .time(ts, WritePrecision.NS)
        )
        points.append(p)

    # Aggregate CPU
    cpu_total = sum(cpu_percents) / len(cpu_percents) if cpu_percents else 0.0
    points.append(
        Point("osdag_system")
        .tag("host", HOST_LABEL)
        .tag("metric_type", "cpu")
        .tag("cpu_core", "total_avg")
        .field("cpu_percent", float(cpu_total))
        .time(ts, WritePrecision.NS)
    )

    # RAM
    ram = psutil.virtual_memory()
    points.append(
        Point("osdag_system")
        .tag("host", HOST_LABEL)
        .tag("metric_type", "ram")
        .tag("cpu_core", "n/a")
        .field("ram_used_mb",      float(ram.used / 1024 / 1024))
        .field("ram_available_mb", float(ram.available / 1024 / 1024))
        .field("ram_total_mb",     float(ram.total / 1024 / 1024))
        .field("ram_percent",      float(ram.percent))
        .time(ts, WritePrecision.NS)
    )

    # Swap
    swap = psutil.swap_memory()
    points.append(
        Point("osdag_system")
        .tag("host", HOST_LABEL)
        .tag("metric_type", "swap")
        .tag("cpu_core", "n/a")
        .field("swap_used_mb",  float(swap.used / 1024 / 1024))
        .field("swap_total_mb", float(swap.total / 1024 / 1024))
        .field("swap_percent",  float(swap.percent))
        .time(ts, WritePrecision.NS)
    )

    return points


def collect_redis_queue_depths():
    """Poll Redis LLEN for each Celery queue → osdag_tasks measurement."""
    global redis_client
    if redis_client is None:
        redis_client = get_redis_client()
    if redis_client is None:
        return []

    points = []
    ts = time.time_ns()
    try:
        for queue_name in CELERY_QUEUES:
            depth = redis_client.llen(queue_name)
            p = (
                Point("osdag_tasks")
                .tag("host",      HOST_LABEL)
                .tag("queue",     queue_name)
                .tag("task_name", "queue_depth")
                .tag("status",    "queued")
                .field("queue_depth", int(depth))
                .time(ts, WritePrecision.NS)
            )
            points.append(p)
    except Exception as e:
        log.warning(f"Redis LLEN poll failed: {e}")
        redis_client = None
    return points


def collect_redis_info():
    """
    Pull Redis INFO stats → osdag_redis measurement.
    """
    global redis_client
    if redis_client is None:
        redis_client = get_redis_client()
    if redis_client is None:
        return []

    ts = time.time_ns()
    try:
        info = redis_client.info()   # dict with all sections merged
        p = (
            Point("osdag_redis")
            .tag("host", HOST_LABEL)
            # Client stats
            .field("connected_clients",          int(info.get("connected_clients",           0)))
            .field("blocked_clients",            int(info.get("blocked_clients",             0)))
            # Memory
            .field("used_memory_mb",             float(info.get("used_memory", 0) / 1024 / 1024))
            .field("used_memory_rss_mb",         float(info.get("used_memory_rss", 0) / 1024 / 1024))
            .field("mem_fragmentation_ratio",    float(info.get("mem_fragmentation_ratio",   1.0)))
            # Pub/Sub
            .field("pubsub_channels",            int(info.get("pubsub_channels",             0)))
            .field("pubsub_patterns",            int(info.get("pubsub_patterns",             0)))
            # Keyspace performance
            .field("keyspace_hits",              int(info.get("keyspace_hits",               0)))
            .field("keyspace_misses",            int(info.get("keyspace_misses",             0)))
            # Throughput
            .field("instantaneous_ops_per_sec",  int(info.get("instantaneous_ops_per_sec",   0)))
            .field("total_commands_processed",   int(info.get("total_commands_processed",    0)))
            # Connections
            .field("total_connections_received", int(info.get("total_connections_received",  0)))
            .field("rejected_connections",       int(info.get("rejected_connections",        0)))
            # Persistence
            .field("rdb_changes_since_last_save", int(info.get("rdb_changes_since_last_save", 0)))
            .time(ts, WritePrecision.NS)
        )
        return [p]
    except Exception as e:
        log.warning(f"Redis INFO poll failed: {e}")
        redis_client = None
        return []


# ─── Process thread analysis ──────────────────────────────────────────────────

def _classify_process(proc_name: str, cmdline: list) -> str:
    """
    Return the role label for a process.
    """
    cmd = " ".join(cmdline).lower()
    name = proc_name.lower()

    if "celerybeat" in cmd or "celery beat" in cmd:
        return "celery-beat"
    if "celery" in cmd or "celery" in name:
        return "celery-worker"
    if "daphne" in cmd or "daphne" in name:
        return "daphne"
    if "gunicorn" in cmd or "uvicorn" in cmd or "gunicorn" in name:
        return "gunicorn"
    if "python" in name:
        return "python-other"
    return None


def collect_process_threads() -> list:
    """
    Scan all running processes and group by role.
    """
    role_stats: dict[str, dict] = {}

    def _blank():
        return {
            "total_threads":    0,
            "process_count":    0,
            "threads_running":  0,
            "threads_sleeping": 0,
            "threads_other":    0,
        }

    ts = time.time_ns()

    for proc in psutil.process_iter(["pid", "name", "cmdline", "status"]):
        try:
            info     = proc.info
            pname    = info["name"] or ""
            cmdline  = info["cmdline"] or []
            role = _classify_process(pname, cmdline)
            if role is None:
                continue

            if role not in role_stats:
                role_stats[role] = _blank()

            role_stats[role]["process_count"] += 1

            try:
                threads = proc.threads()
                role_stats[role]["total_threads"] += len(threads)

                pstatus = (info.get("status") or "").lower()
                if pstatus in ("running",):
                    role_stats[role]["threads_running"]  += len(threads)
                elif pstatus in ("sleeping", "idle"):
                    role_stats[role]["threads_sleeping"] += len(threads)
                else:
                    role_stats[role]["threads_other"]    += len(threads)

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    # Write system-wide total
    system_total = sum(s["total_threads"]   for s in role_stats.values())
    proc_total   = sum(s["process_count"]   for s in role_stats.values())
    if system_total > 0:
        role_stats["all-osdag"] = {
            "total_threads":    system_total,
            "process_count":    proc_total,
            "threads_running":  sum(s["threads_running"]  for s in role_stats.values()),
            "threads_sleeping": sum(s["threads_sleeping"] for s in role_stats.values()),
            "threads_other":    sum(s["threads_other"]    for s in role_stats.values()),
        }

    points = []
    for role, stats in role_stats.items():
        p = (
            Point("osdag_threads")
            .tag("host", HOST_LABEL)
            .tag("role", role)
            .field("total_threads",    int(stats["total_threads"]))
            .field("process_count",    int(stats["process_count"]))
            .field("threads_running",  int(stats["threads_running"]))
            .field("threads_sleeping", int(stats["threads_sleeping"]))
            .field("threads_other",    int(stats["threads_other"]))
            .time(ts, WritePrecision.NS)
        )
        points.append(p)

    return points


# ─── Main loop ────────────────────────────────────────────────────────────────
def main():
    log.info(f"Osdag metrics collector starting.")
    log.info(f"  InfluxDB : {INFLUXDB_URL}  org={INFLUXDB_ORG}  bucket={INFLUXDB_BUCKET}")
    log.info(f"  Redis    : {REDIS_URL}")
    log.info(f"  Interval : {SAMPLE_INTERVAL}s")
    log.info(f"  Host tag : {HOST_LABEL}")

    # Wait for InfluxDB to be ready
    for attempt in range(30):
        try:
            health = influx_client.health()
            if health.status == "pass":
                log.info("InfluxDB is healthy. Starting collection.")
                break
        except Exception:
            pass
        log.info(f"Waiting for InfluxDB... ({attempt + 1}/30)")
        time.sleep(2)
    else:
        log.error("InfluxDB not ready after 60 s. Exiting.")
        return

    # Pre-warm psutil CPU measurement (first call always returns 0.0)
    psutil.cpu_percent(percpu=True)
    time.sleep(SAMPLE_INTERVAL)

    redis_counter   = 0
    thread_counter  = 0
    REDIS_POLL_EVERY   = max(1, int(1.0 / SAMPLE_INTERVAL))   # every ~1 s
    THREAD_POLL_EVERY  = max(1, int(2.0 / SAMPLE_INTERVAL))   # every ~2 s

    while True:
        loop_start = time.monotonic()

        # System metrics every tick (0.5 s)
        points = collect_system_metrics()

        # Redis stats every ~1 s
        if redis_counter % REDIS_POLL_EVERY == 0:
            points.extend(collect_redis_queue_depths())
            points.extend(collect_redis_info())
        redis_counter += 1

        # Process thread counts every ~2 s
        if thread_counter % THREAD_POLL_EVERY == 0:
            points.extend(collect_process_threads())
        thread_counter += 1

        if points:
            write_points(points)

        elapsed = time.monotonic() - loop_start
        sleep_for = max(0.0, SAMPLE_INTERVAL - elapsed)
        time.sleep(sleep_for)


if __name__ == "__main__":
    main()
```

---

## 13.7 Django Application Telemetry Integration

For client requests, we need deeper request-level logging. Osdag-Web tracks these metrics directly within the Django framework using custom middleware and ASGI consumer overrides.

### 1. HTTP Request Middleware
A custom Django middleware calculates request duration and writes data directly to InfluxDB:

```python
import time
from influxdb_client import Point, WritePrecision
from django.utils.deprecation import MiddlewareMixin
from monitoring.metrics_collector import write_api, INFLUXDB_BUCKET, INFLUXDB_ORG

class InfluxDBRequestMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()

    def process_response(self, request, response):
        if not hasattr(request, "start_time"):
            return response
            
        duration_ms = (time.time() - request.start_time) * 1000
        
        # Build Point
        p = (
            Point("osdag_requests")
            .tag("path", request.path)
            .tag("method", request.method)
            .tag("status_code", str(response.status_code))
            .field("duration_ms", float(duration_ms))
            .time(time.time_ns(), WritePrecision.NS)
        )
        
        # Write asynchronously to prevent slowing down request response times
        try:
            write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=p)
        except Exception:
            pass # Fail silently
            
        return response
```

### 2. WebSocket Connection Tracking
Within `apps.core.consumers`, connection increments and decrements are recorded directly when channels open and close:

```python
class TaskProgressConsumer(AsyncWebsocketConsumer):
    active_connections = 0

    async def connect(self):
        await self.accept()
        TaskProgressConsumer.active_connections += 1
        self.write_ws_telemetry()

    async def disconnect(self, close_code):
        TaskProgressConsumer.active_connections = max(0, TaskProgressConsumer.active_connections - 1)
        self.write_ws_telemetry()

    def write_ws_telemetry(self):
        p = (
            Point("osdag_websockets")
            .field("active_connections", int(TaskProgressConsumer.active_connections))
            .time(time.time_ns(), WritePrecision.NS)
        )
        # Call non-blocking client write
```

---

## 13.8 Telemetry Stack Deployment & Configuration

Osdag-Web uses Grafana provisioning files to automatically configure datasources and dashboards when containers start.

### 1. The Sidecar Container Build Schema (`Dockerfile`)
The collector is containerized using a multi-runtime Alpine stack:
```dockerfile
FROM mirror.gcr.io/library/node:20.11.1-alpine3.19

RUN apk add --no-cache python3 py3-psutil py3-pip

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

COPY metrics_collector.py .

CMD ["python3", "-u", "metrics_collector.py"]
```

### 2. First-Boot Initialisation Script (`influxdb-init.sh`)
To bypass manual user configuration interfaces upon container deployment, the InfluxDB container executes a bootstrapping script on first initialization:
```bash
#!/bin/bash
# InfluxDB v2 first-boot initialisation script.
# Sets up the org, bucket, and a token with known values
# so the rest of the stack can connect without manual steps.
#
# This is mounted into the influxdb container as an init script at
# /docker-entrypoint-initdb.d/ — InfluxDB runs it automatically on first start.

set -e

INFLUX_ORG="${DOCKER_INFLUXDB_INIT_ORG:-osdag}"
INFLUX_BUCKET="${DOCKER_INFLUXDB_INIT_BUCKET:-osdag_metrics}"
INFLUX_TOKEN="${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN:-osdag-super-secret-token}"

echo "[influxdb-init] Organisation : $INFLUX_ORG"
echo "[influxdb-init] Bucket       : $INFLUX_BUCKET"
echo "[influxdb-init] Token        : $INFLUX_TOKEN"
echo "[influxdb-init] InfluxDB ready."
```

### 3. Datasource Provisioning: `influxdb.yaml`
Saved in `monitoring/grafana/provisioning/datasources/influxdb.yaml`:
```yaml
apiVersion: 1

datasources:
  - name: InfluxDB
    type: influxdb
    uid: InfluxDB
    access: proxy
    url: http://influxdb:8086
    jsonData:
      version: Flux
      organization: osdag
      defaultBucket: osdag_metrics
      tlsSkipVerify: true
    secureJsonData:
      token: osdag-super-secret-token
    isDefault: true
    editable: true
```

### 4. Dashboard Provider Config: `dashboards.yaml`
Saved in `monitoring/grafana/provisioning/dashboards/dashboards.yaml`:
```yaml
apiVersion: 1

providers:
  - name: Osdag Dashboards
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

---

## 13.9 Time-Series Data Querying and Offline Exporting

When analyzing load test results, you can run queries in InfluxDB using the Flux scripting language.

### Useful Flux Queries

#### Get Host RAM Usage (Last 1 Hour)
```flux
from(bucket: "osdag_metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "osdag_system")
  |> filter(fn: (r) => r.metric_type == "ram")
  |> filter(fn: (r) => r._field == "ram_percent")
  |> aggregateWindow(every: 10s, fn: mean, createEmpty: false)
  |> yield(name: "ram_usage")
```

#### Get Celery Queue Depth Backlog
```flux
from(bucket: "osdag_metrics")
  |> range(start: -15m)
  |> filter(fn: (r) => r._measurement == "osdag_tasks")
  |> filter(fn: (r) => r._field == "queue_depth")
  |> aggregateWindow(every: 5s, fn: max, createEmpty: false)
```

### Troubleshooting Metric Collection Failures
1. **Empty Dashboards:** Check if `metrics_collector` can connect to InfluxDB. Look at container logs:
   ```bash
   docker compose logs metrics-collector
   ```
2. **Missing Redis Telemetry:** Verify that the `REDIS_URL` in the environment points to the correct Redis port. If connection timeouts occur, the sidecar will fail gracefully, sleep, and try again on the next tick.
3. **Invalid Token Errors:** If InfluxDB returns unauthorized warnings, verify that the `INFLUXDB_TOKEN` in the sidecar config matches the token generated when initializing the database container.
4. **WebSocket Counts Not Updating:** If WebSocket active connection gauges show 0 during a test run, ensure that Daphne is routing ASGI requests correctly, and that the consumer connection methods are firing without exception.

---

## 13.10 Advanced Scaling Strategies and High-Availability Recommendations

When taking Osdag-Web to production, the monitoring topology should be scaled to handle persistent traffic:

### 1. Prometheus vs InfluxDB
For cloud deployments, Osdag can be adapted to expose a Prometheus `/metrics` endpoint on the Django and Celery nodes. While InfluxDB (Push model) is ideal for discrete event tracking (like individual calculation jobs), Prometheus (Pull model) reduces database ingestion limits on the application node by scraping pre-aggregated counters.

### 2. Redis HA Clustering
In multi-node worker pools, Redis must be configured with replication (Sentinel) or clustered backends. To prevent ASGI broadcast traffic from blocking Celery tasks, split the system into two distinct Redis deployments:
* **Broker Redis:** Dedicated exclusively to handling Celery job queues (`calculations`, `cad`, `reports`).
* **State Redis:** Dedicated exclusively to Django Channels WebSocket group routing and server sessions cache.
This separation ensures that high WebSocket event throughput does not block Celery calculations.
