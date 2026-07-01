from django.urls import path, re_path
from . import consumers
from .websocket import consumers as pso_consumers

websocket_urlpatterns = [
    path('ws/tasks/<str:task_id>/', consumers.TaskStatusConsumer.as_asgi()),
    # Real-time PSO optimization for Plate Girder
    re_path(r'^ws/optimize/plate-girder/$', pso_consumers.PSOOptimizationConsumer.as_asgi()),
]
