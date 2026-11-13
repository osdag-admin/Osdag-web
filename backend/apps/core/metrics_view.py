"""Prometheus /metrics endpoint, internal network only.

nginx never proxies /metrics, so public traffic cannot reach it. This view is a
second line of defence: nginx and cloudflared always add X-Forwarded-For, so a
request that carries it came through the public path and gets a 404. Prometheus
scrapes backend:8000 directly on the Docker network and sends no such header.
"""

from django.http import HttpResponseNotFound
from django_prometheus.exports import ExportToDjangoView


def internal_metrics(request):
    if 'HTTP_X_FORWARDED_FOR' in request.META or 'HTTP_CF_CONNECTING_IP' in request.META:
        return HttpResponseNotFound()
    return ExportToDjangoView(request)
