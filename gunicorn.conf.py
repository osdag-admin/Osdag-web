"""Gunicorn config (picked up automatically from the working dir, /app).

Prometheus multiprocess mode: with several workers, each worker would otherwise
keep its own counters and a scrape would hit a random one. prometheus_client
instead has every worker write to files in PROMETHEUS_MULTIPROC_DIR and the
/metrics view aggregates them. This file sets the dir for the master (workers
inherit it), wipes stale files on start, and cleans up after dead workers.
Command-line flags (workers, bind, worker class) still come from compose.
"""

import os
import shutil

os.environ.setdefault('PROMETHEUS_MULTIPROC_DIR', '/tmp/prometheus_multiproc')
_MULTIPROC_DIR = os.environ['PROMETHEUS_MULTIPROC_DIR']


def on_starting(server):
    shutil.rmtree(_MULTIPROC_DIR, ignore_errors=True)
    os.makedirs(_MULTIPROC_DIR, exist_ok=True)


def child_exit(server, worker):
    from prometheus_client import multiprocess
    multiprocess.mark_process_dead(worker.pid)
