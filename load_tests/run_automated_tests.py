#!/usr/bin/env python3
import argparse
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime

# Default configuration
DEFAULT_HOST = "http://10.104.135.9:8000"
DEFAULT_SPAWN_RATE = 20
DEFAULT_DURATION = 180  # 3 minutes
DEFAULT_PAUSE = 30      # 30 seconds

TIERS = [
    (10, "10 Users (Tier 1)"),
    (50, "50 Users (Tier 2)"),
    (100, "100 Users (Tier 3)"),
    (200, "200 Users (Tier 4)"),
]

def run_locust_tier(locustfile, host, users, spawn_rate, duration, report_path):
    print(f"\n======================================================================")
    print(f"🚀 STARTING STRESS TEST: {users} users @ {spawn_rate}/s for {duration}s")
    print(f"======================================================================")
    print(f"Host: {host}")
    print(f"Report Output: {report_path}")

    SHUTDOWN_GRACE_SECONDS = 60

    cmd = [
        sys.executable, "-m", "locust",
        "-f", locustfile,
        "--host", host,
        "--headless",
        "-u", str(users),
        "-r", str(spawn_rate),
        "-t", f"{duration}s",
        "--html", report_path
    ]

    # Wall-clock deadline = test duration + grace period
    deadline = time.time() + duration + SHUTDOWN_GRACE_SECONDS

    # Run the locust process and print its output in real-time
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    # Read output line by line as it is executed
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            print(f"  [Locust] {line.strip()}")

        # Force-kill if Locust hangs past the deadline (e.g. stuck writing HTML)
        if time.time() > deadline:
            print(f"\n⏱️  Locust did not exit within {SHUTDOWN_GRACE_SECONDS}s after the test "
                  f"duration. Force-killing the process...")
            process.kill()
            # Drain any remaining buffered output so the pipe doesn't block
            try:
                process.stdout.read()
            except Exception:
                pass
            print("  Process killed. The HTML report may be incomplete.")
            break

    rc = process.poll()
    if rc is not None and rc != 0:
        print(f"❌ Locust execution failed with return code {rc}")
    else:
        print(f"✅ Locust tier completed successfully!")
    return rc == 0 or rc is None


def compile_dashboard(report_files, host, output_path):
    print("\n📊 Compiling dashboard report...")
    combined_data = {
        'tiers': []
    }
    
    for label, filepath in report_files:
        if not os.path.exists(filepath):
            print(f"⚠️ Warning: Report {filepath} not found. Skipping.")
            continue
            
        with open(filepath, 'r') as f:
            text = f.read()
            
        idx = text.find('window.templateArgs =')
        if idx == -1:
            print(f"⚠️ Warning: templateArgs not found in {filepath}. Skipping.")
            continue
            
        start_idx = idx + len('window.templateArgs =')
        try:
            data, _ = json.JSONDecoder().raw_decode(text[start_idx:].strip())
        except Exception as e:
            print(f"❌ Error parsing JSON from {filepath}: {e}")
            continue
            
        # Process history times to relative seconds
        raw_history = data.get('history', [])
        processed_history = []
        if raw_history:
            def parse_time(t_str):
                try:
                    return datetime.strptime(t_str, '%Y-%m-%dT%H:%M:%SZ')
                except ValueError:
                    try:
                        return datetime.fromisoformat(t_str.replace('Z', '+00:00'))
                    except Exception:
                        return None

            start_time_obj = parse_time(raw_history[0].get('time', ''))
            
            for item in raw_history:
                item_time_obj = parse_time(item.get('time', ''))
                if start_time_obj and item_time_obj:
                    rel_sec = int((item_time_obj - start_time_obj).total_seconds())
                else:
                    rel_sec = 0
                    
                processed_history.append({
                    'rel_sec': rel_sec,
                    'user_count': item.get('user_count', [None, 0])[1] if isinstance(item.get('user_count'), list) else item.get('user_count', 0),
                    'current_rps': item.get('current_rps', [None, 0])[1] if isinstance(item.get('current_rps'), list) else item.get('current_rps', 0),
                    'current_fail_per_sec': item.get('current_fail_per_sec', [None, 0])[1] if isinstance(item.get('current_fail_per_sec'), list) else item.get('current_fail_per_sec', 0),
                    'response_time_percentile_0.5': item.get('response_time_percentile_0.5', [None, 0])[1] if isinstance(item.get('response_time_percentile_0.5'), list) else item.get('response_time_percentile_0.5', 0),
                    'response_time_percentile_0.95': item.get('response_time_percentile_0.95', [None, 0])[1] if isinstance(item.get('response_time_percentile_0.95'), list) else item.get('response_time_percentile_0.95', 0),
                    'total_avg_response_time': item.get('total_avg_response_time', [None, 0])[1] if isinstance(item.get('total_avg_response_time'), list) else item.get('total_avg_response_time', 0),
                })
                
        # Process request statistics
        req_stats = data.get('requests_statistics', [])
        processed_stats = []
        for r in req_stats:
            processed_stats.append({
                'name': r.get('name'),
                'method': r.get('method'),
                'num_requests': r.get('num_requests', 0),
                'num_failures': r.get('num_failures', 0),
                'avg_response_time': r.get('avg_response_time', 0),
                'min_response_time': r.get('min_response_time', 0),
                'max_response_time': r.get('max_response_time', 0),
                'median_response_time': r.get('median_response_time', 0),
                'response_time_percentile_0.95': r.get('response_time_percentile_0.95', 0),
                'response_time_percentile_0.99': r.get('response_time_percentile_0.99', 0),
                'total_rps': r.get('total_rps', 0)
            })
            
        combined_data['tiers'].append({
            'label': label,
            'user_count': len(processed_history) and processed_history[-1]['user_count'] or int(label.split()[0]),
            'duration': data.get('duration', 'N/A'),
            'start_time': data.get('start_time', 'N/A'),
            'end_time': data.get('end_time', 'N/A'),
            'requests_statistics': processed_stats,
            'history': processed_history
        })

    # Read server specs from existing dashboard or environment
    # Using placeholders/defaults matching current server configuration
    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Axially Loaded Column WebSocket Load Test Dashboard</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        :root {
            --bg-base: #ffffff;
            --bg-surface: #ffffff;
            --bg-card: #ffffff;
            --bg-card-hover: #f9fafb;
            --border-color: #000000;
            --border-light: #e5e7eb;
            
            --text-primary: #000000;
            --text-secondary: #374151;
            --text-muted: #6b7280;
            
            --accent-black: #000000;
            --accent-green: #16a34a;
            --accent-red: #dc2626;
            --accent-orange: #d97706;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-primary);
            line-height: 1.5;
            padding: 2.5rem;
            min-height: 100vh;
        }

        h1, h2, h3, h4 {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: -0.01em;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            margin-bottom: 2.5rem;
            position: relative;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid var(--border-color);
        }

        .header-title-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
        }

        header h1 {
            font-size: 2rem;
            color: var(--text-primary);
            letter-spacing: -0.025em;
        }

        header p {
            color: var(--text-secondary);
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .server-badge {
            background: #ffffff;
            border: 2px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.35rem 0.85rem;
            font-family: 'Outfit', sans-serif;
            font-size: 0.875rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .server-badge::before {
            content: '';
            width: 8px;
            height: 8px;
            background-color: var(--accent-green);
            border-radius: 50%;
            display: inline-block;
        }

        .nav-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }

        .tab-btn {
            background: #ffffff;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.6rem 1.25rem;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .tab-btn:hover {
            background: var(--bg-card-hover);
        }

        .tab-btn.active {
            color: #ffffff;
            background: var(--accent-black);
        }

        .tab-content {
            display: none;
            animation: fadeIn 0.3s ease-out forwards;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .kpi-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 1.5rem;
        }

        .kpi-label {
            color: var(--text-secondary);
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .kpi-val {
            font-size: 2rem;
            font-weight: 800;
            font-family: 'Outfit', sans-serif;
            margin-top: 0.5rem;
        }

        .kpi-card.accent-teal .kpi-val {
            color: var(--accent-green);
        }

        .kpi-card.accent-red .kpi-val {
            color: var(--accent-red);
        }

        .chart-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        @media (max-width: 1024px) {
            .chart-grid {
                grid-template-columns: 1fr;
            }
        }

        .card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 1.75rem;
        }

        .card-header {
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card h2 {
            font-size: 1.15rem;
        }

        .chart-container {
            position: relative;
            height: 320px;
            width: 100%;
        }

        .table-wrapper {
            overflow-x: auto;
            margin-top: 1rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.9rem;
            border: 1px solid var(--border-color);
        }

        th {
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            padding: 0.85rem 1rem;
            border-bottom: 2px solid var(--border-color);
            background: #f3f4f6;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
        }

        td {
            padding: 0.85rem 1rem;
            border-bottom: 1px solid var(--border-light);
            font-weight: 500;
        }

        tr:hover td {
            background: var(--bg-card-hover);
        }

        .status-badge {
            padding: 0.2rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            display: inline-block;
            text-transform: uppercase;
        }

        .status-badge.success {
            background: #dcfce7;
            color: var(--accent-green);
            border: 1px solid var(--accent-green);
        }

        .status-badge.danger {
            background: #fee2e2;
            color: var(--accent-red);
            border: 1px solid var(--accent-red);
        }

        .status-badge.warn {
            background: #fef3c7;
            color: var(--accent-orange);
            border: 1px solid var(--accent-orange);
        }

        .inference-card {
            background: #ffffff;
            border: 2px solid var(--border-color);
            padding: 2.25rem;
            margin-bottom: 2.5rem;
        }

        .inference-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }

        .inference-icon {
            font-size: 1.5rem;
        }

        .inference-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
        }

        @media (max-width: 1100px) {
            .inference-grid {
                grid-template-columns: 1fr;
            }
        }

        .inference-text p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.975rem;
            line-height: 1.6;
        }

        .recommendation-list {
            margin-top: 1.5rem;
            padding-left: 1.25rem;
        }

        .recommendation-list li {
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .metrics-summary-table {
            background: #f9fafb;
            padding: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .metrics-summary-table h3 {
            font-size: 0.95rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.5rem;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            font-size: 0.85rem;
            border-bottom: 1px solid var(--border-light);
        }

        .summary-row:last-child {
            border-bottom: none;
        }

        .summary-label {
            color: var(--text-secondary);
            font-weight: 600;
        }

        .summary-val {
            font-weight: 700;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="header-title-wrapper">
            <div>
                <h1>WebSocket Load Test Dashboard</h1>
                <p>Osdag-Web Django Channels / Celery Stress Test Results</p>
            </div>
            <div class="server-badge">Target Host: """ + host + """</div>
        </div>
    </header>

    <div class="nav-tabs">
        <button class="tab-btn active" onclick="switchTab(this, 'overview')">System Overview</button>
        <button class="tab-btn" onclick="switchTab(this, 'tier1')">Tier 1 (10 Users)</button>
        <button class="tab-btn" onclick="switchTab(this, 'tier2')">Tier 2 (50 Users)</button>
        <button class="tab-btn" onclick="switchTab(this, 'tier3')">Tier 3 (100 Users)</button>
        <button class="tab-btn" onclick="switchTab(this, 'tier4')">Tier 4 (200 Users)</button>
    </div>

    <!-- INFERENCE SECTION -->
    <div class="inference-card">
        <div class="inference-header">
            <span class="inference-icon">🔍</span>
            <h2>WebSocket Architectural Performance Inference</h2>
        </div>
        <div class="inference-grid">
            <div class="inference-text">
                <p>
                    <strong>1. Concurrency Limits vs. Request-Response Overhead</strong><br>
                    In this WebSocket test, the clients did not perform polling `GET` requests. Instead, after a task was enqueued (via a single POST request), users opened a persistent WebSocket channel. This eliminates HTTP header parse overhead and connection teardown bottlenecks. The server stress shifts entirely to **maintaining open concurrent connections** at the ASGI (Daphne/Uvicorn) layer.
                </p>
                <p>
                    <strong>2. Pub/Sub Broker Latency</strong><br>
                    When a Celery worker completes a calculation, it broadcasts the results to the client's respective Channels group using the Redis Pub/Sub layer. At higher VUs (100 and 200 users), internal pub/sub queues and event dispatch loops in the ASGI layer dictate the latency.
                </p>
                <p>
                    <strong>3. OS Limit Configuration (ulimit)</strong><br>
                    Running thousand-concurrency WebSockets requires high file descriptor limits. If file descriptors are exhausted on the server, you will see a spike in WebSocket connection failures (`design_ws_connect`). Ensure the server has `ulimit -n` set to at least 65536.
                </p>
                
                <h3 style="font-size: 1rem; color: #000; margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase;">WebSocket Recommendations</h3>
                <ul class="recommendation-list">
                    <li><strong>ASGI Server Tuning:</strong> Tune Daphne or Uvicorn worker counts and event loops to handle high concurrency. Use Uvicorn with the `uvloop` policy.</li>
                    <li><strong>Redis Pub/Sub Tuning:</strong> Monitor Redis memory usage and CPU usage, as it handles the ASGI Channel layer backend. Consider clustering Redis if memory or processing bottlenecks emerge.</li>
                    <li><strong>Optimize WebSocket Message Size:</strong> Ensure task results sent over WebSockets do not exceed 500KB. (Large results are already omitted by our Celery signal handler to prevent network saturation).</li>
                </ul>
            </div>

            <div class="metrics-summary-table">
                <h3>Stress Test Architecture</h3>
                <div class="summary-row">
                    <span class="summary-label">API Server Gateway</span>
                    <span class="summary-val">Uvicorn / Daphne (ASGI)</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Channel Layer</span>
                    <span class="summary-val">channels_redis</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Task Queue</span>
                    <span class="summary-val">Redis Broker</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Celery Workers</span>
                    <span class="summary-val">18 Workers</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Spawn Rate</span>
                    <span class="summary-val">20 Users/sec</span>
                </div>
            </div>
        </div>
    </div>

    <!-- OVERVIEW TAB -->
    <div id="overview" class="tab-content active">
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">Peak Concurrency</div>
                <div class="kpi-val">200 Users</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Spawn Rate</div>
                <div class="kpi-val">20 users/s</div>
            </div>
            <div class="kpi-card accent-teal">
                <div class="kpi-label">Target Host</div>
                <div class="kpi-val" style="font-size: 1.2rem; margin-top: 0.85rem;">""" + host + """</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Test Type</div>
                <div class="kpi-val">WebSocket</div>
            </div>
        </div>

        <div class="chart-grid">
            <div class="card">
                <div class="card-header">
                    <h2>Latency vs. Concurrency Tiers (Round-Trip)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="latencyCompareChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2>Task/Connection Failures by Concurrency</h2>
                </div>
                <div class="chart-container">
                    <canvas id="failuresCompareChart"></canvas>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 2.5rem;">
            <div class="card-header">
                <h2>Cross-Tier Latency & Failure Comparisons</h2>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Tier / Load</th>
                            <th>Total POST Req</th>
                            <th>Enqueue Fail Rate</th>
                            <th>Avg Enqueue Time</th>
                            <th>Total WS Sessions</th>
                            <th>WS Task Fail Rate</th>
                            <th>Median Round-Trip</th>
                            <th>95%ile Round-Trip</th>
                            <th>Avg Round-Trip</th>
                        </tr>
                    </thead>
                    <tbody id="comparison-table-body">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- INDIVIDUAL TIER TABS -->
    <div id="tier1" class="tab-content">
        <div class="chart-grid">
            <div class="card">
                <div class="card-header">
                    <h2>RPS & Active Users Over Time (Tier 1)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier1HistoryChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2>Response Time Percentiles (Tier 1)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier1PercentileChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div id="tier2" class="tab-content">
        <div class="chart-grid">
            <div class="card">
                <div class="card-header">
                    <h2>RPS & Active Users Over Time (Tier 2)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier2HistoryChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2>Response Time Percentiles (Tier 2)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier2PercentileChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div id="tier3" class="tab-content">
        <div class="chart-grid">
            <div class="card">
                <div class="card-header">
                    <h2>RPS & Active Users Over Time (Tier 3)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier3HistoryChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2>Response Time Percentiles (Tier 3)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier3PercentileChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div id="tier4" class="tab-content">
        <div class="chart-grid">
            <div class="card">
                <div class="card-header">
                    <h2>RPS & Active Users Over Time (Tier 4)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier4HistoryChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2>Response Time Percentiles (Tier 4)</h2>
                </div>
                <div class="chart-container">
                    <canvas id="tier4PercentileChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const loadTestData = %%%DATA_PLACEHOLDER%%%;
    const initializedTabs = {};

    Chart.defaults.color = '#000000';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    function initComparisonTable() {
        const body = document.getElementById('comparison-table-body');
        body.innerHTML = '';
        
        loadTestData.tiers.forEach(tier => {
            const enqueue = tier.requests_statistics.find(r => r.name === 'design_enqueue') || {};
            const roundTrip = tier.requests_statistics.find(r => r.name === 'design_round_trip') || {};
            
            const postFailRate = enqueue.num_requests ? ((enqueue.num_failures / enqueue.num_requests) * 100).toFixed(1) + '%' : '0%';
            const getFailRate = roundTrip.num_requests ? ((roundTrip.num_failures / roundTrip.num_requests) * 100).toFixed(1) + '%' : '0%';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: #000000;">${tier.label}</td>
                <td>${enqueue.num_requests || 0}</td>
                <td><span class="status-badge ${enqueue.num_failures > 0 ? (parseFloat(postFailRate) > 10 ? 'danger' : 'warn') : 'success'}">${postFailRate}</span></td>
                <td>${(enqueue.avg_response_time || 0).toFixed(1)} ms</td>
                <td>${roundTrip.num_requests || 0}</td>
                <td><span class="status-badge ${roundTrip.num_failures > 0 ? (parseFloat(getFailRate) > 10 ? 'danger' : 'warn') : 'success'}">${getFailRate}</span></td>
                <td>${((roundTrip.median_response_time || 0)/1000).toFixed(2)}s</td>
                <td>${((roundTrip['response_time_percentile_0.95'] || 0)/1000).toFixed(2)}s</td>
                <td>${((roundTrip.avg_response_time || 0)/1000).toFixed(2)}s</td>
            `;
            body.appendChild(tr);
        });
    }

    function initComparisonCharts() {
        const labels = loadTestData.tiers.map(t => t.label.split(' ')[0] + ' VUs');
        
        const latMedians = loadTestData.tiers.map(t => {
            const rt = t.requests_statistics.find(r => r.name === 'design_round_trip') || {};
            return (rt.median_response_time || 0) / 1000;
        });
        const latAverages = loadTestData.tiers.map(t => {
            const rt = t.requests_statistics.find(r => r.name === 'design_round_trip') || {};
            return (rt.avg_response_time || 0) / 1000;
        });
        const lat95th = loadTestData.tiers.map(t => {
            const rt = t.requests_statistics.find(r => r.name === 'design_round_trip') || {};
            return (rt['response_time_percentile_0.95'] || 0) / 1000;
        });

        new Chart(document.getElementById('latencyCompareChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Median Latency (s)', data: latMedians, backgroundColor: '#000000', borderColor: '#000000', borderWidth: 1 },
                    { label: 'Average Latency (s)', data: latAverages, backgroundColor: '#6b7280', borderColor: '#6b7280', borderWidth: 1 },
                    { label: '95th Percentile (s)', data: lat95th, backgroundColor: '#dc2626', borderColor: '#dc2626', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { color: '#000000' } } },
                scales: {
                    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#000000' } },
                    y: { 
                        grid: { color: '#e5e7eb' },
                        ticks: { color: '#000000' },
                        title: { display: true, text: 'Time (seconds)', color: '#000000' }
                    }
                }
            }
        });

        const enqueueFailRates = loadTestData.tiers.map(t => {
            const enq = t.requests_statistics.find(r => r.name === 'design_enqueue') || {};
            return enq.num_requests ? (enq.num_failures / enq.num_requests) * 100 : 0;
        });
        const roundTripFailRates = loadTestData.tiers.map(t => {
            const rt = t.requests_statistics.find(r => r.name === 'design_round_trip') || {};
            return rt.num_requests ? (rt.num_failures / rt.num_requests) * 100 : 0;
        });

        new Chart(document.getElementById('failuresCompareChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Enqueue Fail Rate (%)', data: enqueueFailRates, borderColor: '#dc2626', backgroundColor: 'transparent', tension: 0.1, borderWidth: 3, pointBackgroundColor: '#dc2626' },
                    { label: 'Round-Trip Fail Rate (%)', data: roundTripFailRates, borderColor: '#000000', backgroundColor: 'transparent', tension: 0.1, borderWidth: 3, pointBackgroundColor: '#000000' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { color: '#000000' } } },
                scales: {
                    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#000000' } },
                    y: { 
                        grid: { color: '#e5e7eb' },
                        ticks: { color: '#000000' },
                        title: { display: true, text: 'Percentage (%)', color: '#000000' },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    function initIndividualChartsForTier(tierNum) {
        const tier = loadTestData.tiers[tierNum - 1];
        const history = tier.history || [];
        
        const relSecs = history.map(h => h.rel_sec + 's');
        const userCounts = history.map(h => h.user_count);
        const rps = history.map(h => h.current_rps);
        
        const medianLats = history.map(h => h['response_time_percentile_0.5'] / 1000);
        const p95Lats = history.map(h => h['response_time_percentile_0.95'] / 1000);
        const avgLats = history.map(h => h.total_avg_response_time / 1000);

        new Chart(document.getElementById(`tier${tierNum}HistoryChart`), {
            type: 'line',
            data: {
                labels: relSecs,
                datasets: [
                    { label: 'Active Users', data: userCounts, borderColor: '#000000', yAxisID: 'y1', tension: 0.1, borderWidth: 2, pointRadius: 0 },
                    { label: 'Current RPS', data: rps, borderColor: '#16a34a', yAxisID: 'y', tension: 0.1, borderWidth: 2, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#000000' } },
                    y: { 
                        grid: { color: '#e5e7eb' },
                        ticks: { color: '#16a34a' },
                        title: { display: true, text: 'Throughput (RPS)', color: '#16a34a' }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#000000' },
                        title: { display: true, text: 'Users', color: '#000000' }
                    }
                }
            }
        });

        new Chart(document.getElementById(`tier${tierNum}PercentileChart`), {
            type: 'line',
            data: {
                labels: relSecs,
                datasets: [
                    { label: 'Median Latency (s)', data: medianLats, borderColor: '#000000', tension: 0.1, borderWidth: 2, pointRadius: 0 },
                    { label: 'Average Latency (s)', data: avgLats, borderColor: '#6b7280', tension: 0.1, borderWidth: 2, pointRadius: 0 },
                    { label: '95th Percentile Latency (s)', data: p95Lats, borderColor: '#dc2626', tension: 0.1, borderWidth: 2, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#000000' } },
                    y: { 
                        grid: { color: '#e5e7eb' },
                        ticks: { color: '#000000' },
                        title: { display: true, text: 'Latency (seconds)', color: '#000000' }
                    }
                }
            }
        });
    }

    function switchTab(btn, tabId) {
        document.querySelectorAll('.nav-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        if (!initializedTabs[tabId]) {
            if (tabId === 'overview') {
                initComparisonCharts();
            } else if (tabId.startsWith('tier')) {
                const tierNum = parseInt(tabId.replace('tier', ''));
                initIndividualChartsForTier(tierNum);
            }
            initializedTabs[tabId] = true;
        }
    }

    window.onload = function() {
        initComparisonTable();
        const overviewBtn = document.querySelector('.nav-tabs .tab-btn');
        switchTab(overviewBtn, 'overview');
    }
</script>
</body>
</html>
"""

    html_output = html_template.replace('%%%DATA_PLACEHOLDER%%%', json.dumps(combined_data))
    
    with open(output_path, 'w') as f:
        f.write(html_output)
    print(f"🎉 Successfully generated unified WebSocket dashboard: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Automate 4-tier Locust WebSocket load tests.")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Target host URL (default: {DEFAULT_HOST})")
    parser.add_argument("--locustfile", default="locustfile_ws.py", help="Path to the WebSocket locustfile")
    parser.add_argument("--duration", type=int, default=DEFAULT_DURATION, help="Duration for each tier in seconds")
    parser.add_argument("--pause", type=int, default=DEFAULT_PAUSE, help="Pause/cooldown between tiers in seconds")
    parser.add_argument("--dry-run", action="store_true", help="Run short dry-run (10s duration, 5s pause) to test plumbing")
    
    args = parser.parse_args()
    
    # Override for dry-run
    duration = 10 if args.dry_run else args.duration
    pause = 5 if args.dry_run else args.pause
    
    print("======================================================================")
    print("             OSDAG-WEB WEB-SOCKET LOAD TEST AUTOMATION")
    print("======================================================================")
    print(f"Target Host:     {args.host}")
    print(f"Locust File:     {args.locustfile}")
    print(f"Duration/Tier:   {duration} seconds")
    print(f"Pause/Cooldown:  {pause} seconds")
    print(f"Running Mode:    {'DRY-RUN (Plumbing check)' if args.dry_run else 'FULL MEASUREMENT'}")
    print("======================================================================")
    
    report_files = []
    
    for i, (users, label) in enumerate(TIERS, 1):
        report_path = f"report_ws_tier_{i}.html"
        
        # Execute the tier
        success = run_locust_tier(
            locustfile=args.locustfile,
            host=args.host,
            users=users,
            spawn_rate=DEFAULT_SPAWN_RATE,
            duration=duration,
            report_path=report_path
        )
        
        if not success:
            print(f"⚠️ Tier {i} ({users} users) encountered failures during run.")
            
        report_files.append((label, report_path))
        
        # Pause between tiers
        if i < len(TIERS):
            print(f"\n💤 Pausing for {pause} seconds to let queues drain and stabilize...")
            for remaining in range(pause, 0, -1):
                sys.stdout.write(f"\r  Cooldown remaining: {remaining}s...   ")
                sys.stdout.flush()
                time.sleep(1)
            print("\n  Cooldown complete.")
            
    # Compile the final report dashboard
    dashboard_path = "report_dashboard_ws.html"
    compile_dashboard(report_files, args.host, dashboard_path)
    
    # Remove temporary tier reports to keep directory clean
    print("\n🧹 Cleaning up temporary tier HTML reports...")
    for _, filepath in report_files:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
                print(f"  Removed {filepath}")
            except Exception as e:
                print(f"  Failed to remove {filepath}: {e}")
                
    print("\n✅ Automated load test run completed!")
    print(f"Open '{os.path.abspath(dashboard_path)}' in your browser to inspect the results.")

if __name__ == "__main__":
    main()
