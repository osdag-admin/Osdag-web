import os
import json
import re
from datetime import datetime

# Define files and labels
report_files = [
    ('10 Users (Tier 1)', 'load_tests/Locust_2026-06-23-14h32_locustfile.py_http___10.104.135.9_8000_10users.html'),
    ('50 Users (Tier 2)', 'load_tests/Locust_2026-06-23-14h35_locustfile.py_http___10.104.135.9_8000_50users.html'),
    ('100 Users (Tier 3)', 'load_tests/Locust_2026-06-23-14h37_locustfile.py_http___10.104.135.9_8000_100users.html'),
    ('200 Users (Tier 4)', 'load_tests/Locust_2026-06-23-14h42_locustfile.py_http___10.104.135.9_8000_200users.html')
]

combined_data = {
    'tiers': []
}

for label, filepath in report_files:
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} does not exist. Skipping.")
        continue
        
    with open(filepath, 'r') as f:
        text = f.read()
        
    idx = text.find('window.templateArgs =')
    if idx == -1:
        print(f"Warning: templateArgs not found in {filepath}. Skipping.")
        continue
        
    start_idx = idx + len('window.templateArgs =')
    data, _ = json.JSONDecoder().raw_decode(text[start_idx:].strip())
    
    # Process history times to relative seconds
    raw_history = data.get('history', [])
    processed_history = []
    if raw_history:
        # Base time parse
        def parse_time(t_str):
            try:
                # e.g., '2026-06-23T09:02:45Z'
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

# Write the data out to a JS file for local loading if needed, or directly embed in HTML
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plate-Girder Backend Load Test Dashboard</title>
    
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
            
            --shadow-sm: none;
            --shadow-md: none;
            --shadow-lg: none;
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

        /* Layout */
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
            font-size: 1rem;
            margin-top: 0.25rem;
            text-transform: uppercase;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.05em;
        }

        .server-badge {
            background: #ffffff;
            border: 2px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.35rem 0.85rem;
            border-radius: 0;
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

        /* Navigation Toggles */
        .nav-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            background: transparent;
            padding: 0;
            border-radius: 0;
            width: fit-content;
            border: none;
        }

        .tab-btn {
            background: #ffffff;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.6rem 1.25rem;
            border-radius: 0;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .tab-btn:hover {
            color: var(--text-primary);
            background: var(--bg-card-hover);
        }

        .tab-btn.active {
            color: #ffffff;
            background: var(--accent-black);
            border: 1px solid var(--border-color);
        }

        /* Dashboard Grid */
        .dashboard-section {
            display: none;
            animation: fadeIn 0.3s ease-out forwards;
        }

        .dashboard-section.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .kpi-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 0;
            padding: 1.5rem;
            transition: background 0.15s ease;
        }

        .kpi-card:hover {
            background: var(--bg-card-hover);
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
            color: var(--text-primary);
        }

        .kpi-card.accent-purple .kpi-val {
            color: var(--text-primary);
        }

        .kpi-card.accent-teal .kpi-val {
            color: var(--accent-green);
        }

        .kpi-card.accent-red .kpi-val {
            color: var(--accent-red);
        }

        /* Main Grid */
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
            border-radius: 0;
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
            font-weight: 700;
            color: var(--text-primary);
        }

        .chart-container {
            position: relative;
            height: 320px;
            width: 100%;
        }

        /* Tables */
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
            color: var(--text-primary);
            font-weight: 500;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover td {
            background: var(--bg-card-hover);
        }

        .status-badge {
            padding: 0.2rem 0.5rem;
            border-radius: 0;
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

        /* Inference Panel */
        .inference-card {
            background: #ffffff;
            border: 2px solid var(--border-color);
            border-radius: 0;
            padding: 2.25rem;
            margin-bottom: 2.5rem;
        }

        .inference-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }

        .inference-header h2 {
            font-size: 1.35rem;
            color: var(--text-primary);
        }

        .inference-icon {
            font-size: 1.5rem;
        }

        .inference-grid {
            display: grid;
            grid-template-columns: 2fr 1.1fr 0.9fr;
            gap: 2rem;
        }

        @media (max-width: 1100px) {
            .inference-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
        }

        .inference-text p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-size: 0.975rem;
            line-height: 1.6;
        }

        .inference-text strong {
            color: var(--text-primary);
            font-weight: 700;
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

        .recommendation-list li strong {
            color: var(--text-primary);
        }

        .metrics-summary-table {
            background: #f9fafb;
            border-radius: 0;
            padding: 1.25rem;
            border: 1px solid var(--border-color);
        }

        .metrics-summary-table h3 {
            font-size: 0.95rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
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
            color: var(--text-primary);
        }

        .summary-val.danger {
            color: var(--accent-red);
        }

        .summary-val.success {
            color: var(--accent-green);
        }
        
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="header-title-wrapper">
            <div>
                <h1>Load Test Dashboard</h1>
                <p>Plate-Girder Backend Stress Test Results Analysis</p>
            </div>
            <div class="server-badge">Target Host: http://10.104.135.9:8000</div>
        </div>
    </header>

    <!-- Navigation Tabs -->
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
            <h2>Architectural Performance Inference & Server Specs</h2>
        </div>
        <div class="inference-grid">
            <div class="inference-text">
                <p>
                    <strong>1. Core Calculation Performance (CPU-Bound)</strong><br>
                    At the baseline load of <strong>10 concurrent users</strong>, the design simulation finishes in an average of <strong>1.24s</strong> with 0% failures. Since the active worker pool size is 18, all tasks execute immediately. 1.24 seconds is the raw, single-threaded processing limit of the calculation algorithm.
                </p>
                <p>
                    <strong>2. Queue Backlog Degradation</strong><br>
                    Once concurrency increases to <strong>50 users</strong> (exceeding the Celery concurrency limit of 18), execution times begin to scale up. The average round-trip time jumps to <strong>2.36s</strong> (95th percentile is 4.7s) as tasks must queue in Redis until workers become available.
                </p>
                <p>
                    <strong>3. Server Resource Bottlenecks</strong><br>
                    The host machine is heavily memory-constrained, running at <strong>99% RAM utilization</strong> (30.52 GiB / 30.97 GiB) and <strong>100% Swap utilization</strong> (14.90 GiB / 14.90 GiB). Under concurrency (100+ and 200 users), severe disk thrashing/paging occurs. This increases Celery worker computation time drastically, contributing to the <strong>14.7s</strong> average round-trip latencies and <strong>36.8%</strong> failures seen at 200 users.
                </p>
                
                <h3 style="font-size: 1rem; color: #000; margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase;">Key Recommendations</h3>
                <ul class="recommendation-list">
                    <li><strong>Resolve Memory & Swap Thrashing:</strong> Release system memory or upgrade RAM. The 100% Swap usage causes massive disk I/O wait times during CPU-bound numeric calculations.</li>
                    <li><strong>Increase Worker Concurrency:</strong> Scale up Celery concurrency (e.g. from 18 to 32 or deploy workers across multiple server nodes) once memory pressure is alleviated.</li>
                    <li><strong>Gunicorn Backlog Configuration:</strong> Tune Gunicorn/Uvicorn worker count and connection backlog boundaries to handle larger bursts of enqueuing POST connections.</li>
                </ul>
            </div>

            <div class="metrics-summary-table">
                <h3>Server Specifications</h3>
                <div class="summary-row">
                    <span class="summary-label">Host</span>
                    <span class="summary-val">ThinkStation P2 Tower</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">OS</span>
                    <span class="summary-val">Ubuntu 24.04.4 LTS</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Kernel</span>
                    <span class="summary-val">Linux 6.17.0-35-generic</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">CPU</span>
                    <span class="summary-val">Intel Core i7-14700 (28 Cores)</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Memory</span>
                    <span class="summary-val danger">30.52 / 30.97 GiB (99%)</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Swap</span>
                    <span class="summary-val danger">14.90 / 14.90 GiB (100%)</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Local IP</span>
                    <span class="summary-val">10.104.135.9</span>
                </div>
            </div>
            
            <div class="metrics-summary-table">
                <h3>Stress Test Summary</h3>
                <div class="summary-row">
                    <span class="summary-label">Celery Concurrency</span>
                    <span class="summary-val">18 Workers</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Baseline (10 VUs)</span>
                    <span class="summary-val success">1.24s avg</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Queued (50 VUs)</span>
                    <span class="summary-val">2.36s avg</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Saturated (100 VUs)</span>
                    <span class="summary-val danger">7.65s avg (17.7% fails)</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Exhausted (200 VUs)</span>
                    <span class="summary-val danger">14.69s avg (42.8% fails)</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Peak Throughput</span>
                    <span class="summary-val">31.8 RPS</span>
                </div>
            </div>
        </div>
    </div>

    <!-- SPECIFICATIONS & METRICS GLOSSARY -->
    <div class="card" style="margin-bottom: 2.5rem;">
        <h2 style="margin-bottom: 1.25rem;">Stress Test Methodology, Statistics Glossary & Hardware Sizing Guide</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem;">
            <div>
                <h3 style="font-size: 1.05rem; margin-bottom: 0.75rem; border-bottom: 2px solid #000; padding-bottom: 0.25rem;">1. Statistics Glossary (How to Read the Metrics)</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Median (50%ile Latency):</strong> The response time experienced by the middle user. 50% of the requests were faster than this value, and 50% were slower. This represents your average, normal user experience.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>95%ile (95th Percentile Latency):</strong> The threshold below which 95% of all requests fall. Only 5% of requests took longer than this. It represents "tail latency" and is crucial because it measures the experience of users who hit early system congestion.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>99%ile (99th Percentile Latency):</strong> Only 1% of requests were slower than this threshold. It exposes extreme lag spikes caused by system queuing, CPU scheduling delays, or disk swap page faults.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>RPS (Requests Per Second):</strong> Total request throughput. It measures how many operations the server is handling simultaneously.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Enqueue Latency (POST):</strong> The time it takes Gunicorn/Uvicorn to process and register the task into Redis. It should be virtually instant (&lt;100ms) since enqueuing is a non-blocking check. Spikes here indicate the web server itself is choking.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Round-Trip Latency (GET status):</strong> The total user-facing wait time (initial POST request + waiting in Redis + Celery calculation execution).
                </p>

                <h3 style="font-size: 1.05rem; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #000; padding-bottom: 0.25rem;">2. Ramp-Up Rates & Methodology</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    To evaluate how the server handles bursts of users, we configured different ramp-up spawn rates. **Tiers 1, 2, and 3 used a consistent 10 users/second ramp-up, while Tier 4 used a 20 users/second ramp-up**:
                </p>
                <ul style="font-size: 0.9rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.6;">
                    <li><strong>Tier 1 (10 Users):</strong> Spawned at <strong>10 users/sec</strong>. Reached full capacity in 1 second.</li>
                    <li><strong>Tier 2 (50 Users):</strong> Spawned at <strong>10 users/sec</strong>. Reached full capacity in 5 seconds.</li>
                    <li><strong>Tier 3 (100 Users):</strong> Spawned at <strong>10 users/sec</strong>. Reached full capacity in 10 seconds.</li>
                    <li><strong>Tier 4 (200 Users):</strong> Spawned at <strong>20 users/sec</strong> (last stress burst). Reached full capacity in 10 seconds.</li>
                </ul>
            </div>

            <div>
                <h3 style="font-size: 1.05rem; margin-bottom: 0.75rem; border-bottom: 2px solid #000; padding-bottom: 0.25rem;">3. Case-by-Case Analysis & Hardware Purchasing Guide</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Case 1 (10 Users):</strong> Complete success. The system resources and worker limits are under-utilized. 1.24s is the baseline computational time.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Case 2 (50 Users):</strong> Calculations begin queueing in Redis because we only have 18 worker threads. Median round-trip climbs to 2s, and 95%ile is 4.7s. <em>Inference:</em> The current 18 Celery workers are fully utilized, but Gunicorn is still healthy.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Case 3 (100 Users):</strong> The web gateway (Gunicorn) starts failing to handle enqueues (17.7% drop rate) because Gunicorn's thread backlog is saturated. celerey tasks wait up to 16.0s. 
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Case 4 (200 Users):</strong> The system collapses. 42.8% of enqueues fail. Active tasks fail at 36.8% due to memory exhaustion. The 95%ile latency spikes to 43.0s.
                </p>

                <div style="background: #f9fafb; border: 1.5px solid #000; padding: 1rem; margin-top: 1rem;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; text-transform: uppercase; color: #dc2626;">Server Purchasing Recommendations:</h4>
                    <ul style="font-size: 0.85rem; color: var(--text-primary); padding-left: 1rem; line-height: 1.6;">
                        <li><strong>Primary Need: RAM Upgrade (CRITICAL)</strong><br>
                            The server has <strong>99% RAM usage and 100% swap usage</strong>. The SSD/HDD swap space is acting as RAM, which runs 100x slower. You must buy at least <strong>64 GB or 128 GB of RAM</strong> to prevent swapping.
                        </li>
                        <li><strong>Secondary Need: CPU Cores</strong><br>
                            Each concurrent calculation requires 1 CPU thread. Since Intel i7-14700 has 28 cores (20 physical), it can support 18-20 workers. To scale smoothly to 50 concurrent calculations with &lt;3s latency, upgrade the processor to an <strong>Intel Xeon / AMD EPYC with 32 to 64 physical cores</strong>.
                        </li>
                        <li><strong>Storage Strategy:</strong><br>
                            Use high-speed PCIe NVMe SSDs to reduce any residual swapping delay.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- OVERVIEW TAB -->
    <div id="overview" class="tab-content active">
        <!-- KPI Row -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">Peak Concurrency</div>
                <div class="kpi-val">200 Users</div>
            </div>
            <div class="kpi-card accent-purple">
                <div class="kpi-label">Max Task Throughput</div>
                <div class="kpi-val">31.8 RPS</div>
            </div>
            <div class="kpi-card accent-teal">
                <div class="kpi-label">Optimal Latency (10 VU)</div>
                <div class="kpi-val">1.24 s</div>
            </div>
            <div class="kpi-card accent-red">
                <div class="kpi-label">Exhausted Latency (200 VU)</div>
                <div class="kpi-val">14.69 s</div>
            </div>
        </div>

        <!-- Comparative Charts -->
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
                    <h2>Enqueue Failure Rate by Concurrency</h2>
                </div>
                <div class="chart-container">
                    <canvas id="failuresCompareChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Comparison Table -->
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
                            <th>Total Get Poll Req</th>
                            <th>Task Fail Rate</th>
                            <th>Median Round-Trip</th>
                            <th>95%ile Round-Trip</th>
                            <th>Avg Round-Trip</th>
                        </tr>
                    </thead>
                    <tbody id="comparison-table-body">
                        <!-- Filled dynamically -->
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
    // Embedded parsed load test statistics
    const loadTestData = %%%DATA_PLACEHOLDER%%%;

    // Track initialized tabs to prevent double-initialization bugs and layout shifts
    const initializedTabs = {};

    // Chart customization globals (Monochrome theme settings)
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
        
        // 1. Latency Compare Chart
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

        // 2. Failures Compare Chart
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

        // History Chart (RPS & Users)
        new Chart(document.getElementById(`tier${tierNum}HistoryChart`), {
            type: 'line',
            data: {
                labels: relSecs,
                datasets: [
                    { label: 'Active Users', data: userCounts, borderColor: '#000000', yAxisID: 'y1', tension: 0.1, borderWidth: 2, pointStyle: 'none', pointRadius: 0 },
                    { label: 'Current RPS', data: rps, borderColor: '#16a34a', yAxisID: 'y', tension: 0.1, borderWidth: 2, pointStyle: 'none', pointRadius: 0 }
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

        // Percentiles Latency Chart
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
        // Remove active class from all buttons
        document.querySelectorAll('.nav-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        
        // Remove active class from all tab contents
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and target tab content
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        // Initialize charts for this tab if not already done
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
        // Load the overview tab by default
        const overviewBtn = document.querySelector('.nav-tabs .tab-btn');
        switchTab(overviewBtn, 'overview');
    }
</script>
</body>
</html>
"""

# Inject data into HTML
html_output = html_content.replace('%%%DATA_PLACEHOLDER%%%', json.dumps(combined_data))

with open('load_tests/report_dashboard.html', 'w') as f:
    f.write(html_output)

print("Successfully generated report_dashboard.html!")
