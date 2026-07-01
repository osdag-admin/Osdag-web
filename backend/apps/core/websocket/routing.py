"""
WebSocket URL routing for real-time PSO optimization.

This module defines WebSocket URL patterns that map to consumers.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/optimize/plate-girder/$', consumers.PSOOptimizationConsumer.as_asgi()),
]
