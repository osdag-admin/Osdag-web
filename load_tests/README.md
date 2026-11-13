# Axially Loaded Column Backend Load Tests

This load testing suite measures the performance and concurrency limits of the **Axially Loaded Column** calculation module.

Two test modes are available:

| Mode | Locustfile | Description |
| :--- | :--- | :--- |
| **HTTP Polling** | `locustfile.py` | POST to enqueue, then poll `GET /api/tasks/{id}/` every 1 s until done |
| **WebSocket** | `locustfile_ws.py` | POST to enqueue, then open a persistent WebSocket and wait for the result message |

Both modes track two custom aggregated metrics in Locust:
* `design_enqueue` — Latency of the initial `POST` request (queuing phase only).
* `design_round_trip` — Total time from `POST` to final `SUCCESS`/`FAILURE` (queuing + calculation time).

The WebSocket mode additionally tracks:
* `design_ws_connect` — WS handshake latency, useful for spotting file-descriptor exhaustion under high load.

---

## Setup Instructions

### 1. Install dependencies
It is recommended to run this inside a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run interactively via the Locust Web UI

**HTTP Polling mode:**
```bash
locust -f locustfile.py --host http://10.104.135.9:8000
```

**WebSocket mode:**
```bash
locust -f locustfile_ws.py --host http://10.104.135.9:8000
```

Open your browser and navigate to **[http://localhost:8089](http://localhost:8089)**.

---

## Automated 4-Tier Run (`run_automated_tests.py`)

`run_automated_tests.py` orchestrates the full 4-tier stress test automatically (no UI needed) and produces a single self-contained HTML dashboard.

### Usage

```bash
# Full WebSocket run against the default host (http://10.104.135.9:8000)
python run_automated_tests.py

# Point at a different host
python run_automated_tests.py --host http://localhost:8000

# Use the HTTP polling locustfile instead of the default WebSocket one
python run_automated_tests.py --locustfile locustfile.py

# Quick smoke-test (10 s/tier, 5 s cooldown) to verify plumbing before a real run
python run_automated_tests.py --dry-run

# All options
python run_automated_tests.py --help
```

After the run completes, open **`report_dashboard_ws.html`** (or `report_dashboard.html` for HTTP mode) in a browser to inspect the results.

---

## Load Test Methodology (4-Tier Progression)

Each tier runs for **3 minutes** with a **30-second cooldown** between tiers so the Celery queue fully drains before the next tier begins.

| Tier | Concurrent Users | Spawn Rate (users/sec) | Purpose |
| :--- | :--- | :--- | :--- |
| **Tier 1** | 10 | 20 | **Baseline** — Standard operational behaviour. |
| **Tier 2** | 50 | 20 | **Light Load** — Approaching Celery worker concurrency (18). |
| **Tier 3** | 100 | 20 | **Moderate Load** — Queue begins to build; tests backlog processing. |
| **Tier 4** | 200 | 20 | **Full Stress** — Maximum load; identifies capacity ceiling and bottlenecks. |

### Manual tier run (Web UI)
1. In the Locust Web UI, enter the **Number of users** and **Spawn rate** from the table above.
2. Click **Start swarming**.
3. Let it run for 3 minutes.
4. Click **Stop**.
5. **CRITICAL**: Wait for all active Celery tasks to finish (verify in Grafana or by checking the active tasks count drops to 0) before starting the next tier.

---

## Metrics to Monitor

### 1. Locust Web UI / Reports (`http://localhost:8089`)
- **`design_enqueue`** — Should stay fast (< 500 ms) regardless of tier; it only enqueues to Redis.
- **`design_round_trip`** — Will increase as concurrency exceeds the Celery worker pool (18 workers). Watch how it scales across tiers.
- **`design_ws_connect`** *(WebSocket mode only)* — Spike here signals file-descriptor exhaustion; ensure `ulimit -n ≥ 65536` on the server.
- **Failures / Errors** — Watch for backend timeouts, connection errors, or calculation failures.

### 2. Grafana Dashboard (`http://10.104.135.9:3001`)
- **Host CPU / RAM** — Celery worker calculations are CPU-intensive; watch for saturation and OOM events.
- **Redis Queue Depth** — Monitor queued task count during Tiers 3 & 4 to observe backlog behaviour.
- **DB Connection Pool** — Check that PostgreSQL connections aren't exhausted by the API or workers.
