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

    # Per-core CPU (non-blocking; uses the interval between calls for accuracy)
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

    # Temperatures
    if hasattr(psutil, "sensors_temperatures"):
        try:
            temps = psutil.sensors_temperatures()
            for name, entries in temps.items():
                for entry in entries:
                    if entry.label and 'core' in entry.label.lower():
                        core_label = entry.label.replace(" ", "_").lower()
                        points.append(
                            Point("osdag_system")
                            .tag("host", HOST_LABEL)
                            .tag("metric_type", "temperature")
                            .tag("cpu_core", core_label)
                            .field("temp_celsius", float(entry.current))
                            .time(ts, WritePrecision.NS)
                        )
        except Exception as e:
            pass

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
    Captured fields:
      - connected_clients       : open TCP connections to Redis
      - blocked_clients         : clients waiting on BLPOP etc.
      - used_memory_mb          : Redis heap usage
      - pubsub_channels         : active pub/sub channels (Django Channels)
      - pubsub_patterns         : active pub/sub patterns
      - keyspace_hits           : cache hit counter (delta is interesting)
      - keyspace_misses         : cache miss counter
      - instantaneous_ops_per_sec : current throughput
      - total_commands_processed : cumulative commands
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
            # Pub/Sub (Django Channels channel layer)
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
            # Persistence / replication
            .field("rdb_changes_since_last_save", int(info.get("rdb_changes_since_last_save", 0)))
            .time(ts, WritePrecision.NS)
        )
        return [p]
    except Exception as e:
        log.warning(f"Redis INFO poll failed: {e}")
        redis_client = None
        return []


# ─── Process thread analysis ────────────────────────────────────────────────────────────────────

# Map process name substrings to a human-readable role label
_PROCESS_ROLES = [
    ("gunicorn",     "gunicorn"),
    ("uvicorn",      "gunicorn"),     # gunicorn + uvicorn worker class
    ("daphne",       "daphne"),
    ("celery",       "celery-worker"),
    ("celerybeat",   "celery-beat"),  # must come before 'celery' check
]


def _classify_process(proc_name: str, cmdline: list) -> str:
    """
    Return the role label for a process.
    cmdline is checked first (more reliable), then proc_name.
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
    For each role, write one InfluxDB Point per tick with:
      - total_threads   : sum of threads across all processes in this role
      - process_count   : number of OS processes in this role
      - threads_running : threads in 'running' status
      - threads_sleeping: threads in 'sleeping' status
      - threads_other   : threads in any other status (disk-wait, zombie, etc.)

    Measurement: osdag_threads
    Tags:        host, role
    """
    # Accumulate stats per role
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

            # Get all threads of this process
            try:
                threads = proc.threads()
                role_stats[role]["total_threads"] += len(threads)

                # Thread status is not directly exposed by psutil.threads();
                # use the process status as a proxy for its threads.
                pstatus = (info.get("status") or "").lower()
                if pstatus in ("running",):
                    role_stats[role]["threads_running"]  += len(threads)
                elif pstatus in ("sleeping", "idle"):
                    role_stats[role]["threads_sleeping"] += len(threads)
                else:
                    role_stats[role]["threads_other"]    += len(threads)

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass  # process may have died mid-scan

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    # Also write a system-wide total
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

        # ── System metrics every tick (0.5 s) ────────────────────────────────
        points = collect_system_metrics()

        # ── Redis stats every ~1 s ──────────────────────────────────────────
        if redis_counter % REDIS_POLL_EVERY == 0:
            points.extend(collect_redis_queue_depths())  # per-queue LLEN
            points.extend(collect_redis_info())           # connected_clients, pubsub, memory...
        redis_counter += 1

        # ── Process thread counts every ~2 s ──────────────────────────────────
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
