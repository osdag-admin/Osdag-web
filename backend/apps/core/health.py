"""
Liveness/readiness endpoint used by Docker healthchecks and the CD smoke test.

Kept dependency-light on purpose: it only checks that Postgres and Redis are
reachable, so it stays cheap enough to be polled every few seconds.
"""
import logging

import redis
from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET

logger = logging.getLogger(__name__)


def _check_database():
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()


def _check_redis():
    client = redis.Redis.from_url(
        settings.REDIS_URL, socket_connect_timeout=2, socket_timeout=2
    )
    try:
        client.ping()
    finally:
        client.close()


@require_GET
def health_view(request):
    checks = {}
    for name, check in (("database", _check_database), ("redis", _check_redis)):
        try:
            check()
            checks[name] = "ok"
        except Exception as exc:
            # Log the detail server-side; don't leak hostnames/credentials to callers.
            logger.error("Health check '%s' failed: %s", name, exc)
            checks[name] = "error"

    healthy = all(v == "ok" for v in checks.values())
    return JsonResponse(
        {"status": "ok" if healthy else "unavailable", "checks": checks},
        status=200 if healthy else 503,
    )
