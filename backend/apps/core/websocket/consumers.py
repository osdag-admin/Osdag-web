"""
WebSocket consumers for real-time PSO optimization updates.

This module provides lightweight WebSocket consumers that delegate heavy computation
to Celery tasks, preventing Django event loop blocking.
"""

import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class PSOOptimizationConsumer(AsyncJsonWebsocketConsumer):
    """
    Lightweight WebSocket consumer for PSO optimization.

    This consumer:
    - Handles WebSocket connection/disconnection
    - Receives start_optimization messages and triggers Celery tasks
    - Listens to Channel Layer for updates from Celery workers
    - Forwards updates to connected clients
    - **CRITICAL**: Revokes running Celery tasks on disconnect to prevent "zombie" tasks

    All heavy computation happens in Celery workers, not in this consumer.
    """

    def __init__(self, *args, **kwargs):
        """Initialize consumer with task tracking."""
        super().__init__(*args, **kwargs)
        self.task_id = None  # Track the running Celery task ID for revocation

    async def connect(self):
        """Handle WebSocket connection."""
        logger.info(f"WebSocket connecting: {self.channel_name}")

        # Accept the connection
        await self.accept()

        # Add to a group for this optimization session
        # For now, we'll use a simple approach - can be enhanced later
        logger.info(f"WebSocket connected: {self.channel_name}")

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.

        CRITICAL: If there's a running Celery task, revoke it immediately.
        This prevents "zombie" tasks from consuming CPU after the user closes the tab.
        Without this, users refreshing/closing tabs can DOS the worker nodes.
        """
        logger.info(f"WebSocket disconnected: {self.channel_name}, code: {close_code}")

        # CRITICAL: Revoke the running task if it exists
        if self.task_id:
            logger.warning(f"Disconnect detected. Revoking task {self.task_id} to prevent zombie task")
            try:
                # Import Celery app for task revocation
                from config.celery import app

                # Revoke the task with terminate=True to kill CPU-bound processes
                # Use sync_to_async since app.control.revoke is a sync operation
                def revoke_task():
                    app.control.revoke(self.task_id, terminate=True)

                await sync_to_async(revoke_task)()
                logger.info(f"Task {self.task_id} revoked successfully")
            except Exception as e:
                logger.error(f"Error revoking task {self.task_id}: {e}")

        # Clean up channel layer group if needed
        # (Currently not using groups, but good practice for future)

    async def receive_json(self, content):
        """Handle incoming JSON messages from client."""
        message_type = content.get('type')

        if message_type == 'start_optimization':
            logger.info(f"Received start_optimization message on channel: {self.channel_name}")

            # Extract input data
            input_data = content.get('data', {})

            # Import here to avoid circular imports
            from apps.modules.flexure_member.submodules.plate_girder.tasks import run_pso_optimization

            # Trigger Celery task asynchronously
            # The task will send updates via Channel Layer
            try:
                task_result = run_pso_optimization.delay(
                    self.channel_name,
                    input_data
                )

                # CRITICAL: Store task_id for revocation on disconnect
                self.task_id = task_result.id

                logger.info(f"Celery task triggered: {self.task_id}")

                # Send acknowledgment to client
                await self.send_json({
                    'type': 'task_started',
                    'data': {
                        'task_id': self.task_id,
                        'channel_name': self.channel_name
                    }
                })
            except Exception as e:
                logger.error(f"Error triggering Celery task: {e}")
                await self.send_json({
                    'type': 'error',
                    'data': {
                        'message': f'Failed to start optimization: {str(e)}'
                    }
                })
        else:
            logger.warning(f"Unknown message type: {message_type}")

    async def pso_update(self, event):
        """
        Handle PSO update messages from Channel Layer.

        This method is called when a Celery task sends an update via Channel Layer.
        """
        data = event.get('data', {})
        logger.debug(f"PSO update: iteration {data.get('iteration', 'unknown')}, particles {len(data.get('particles') or [])}")

        # Forward the update to the WebSocket client
        await self.send_json({
            'type': 'pso_update',
            'data': data
        })

    async def pso_complete(self, event):
        """
        Handle PSO completion messages from Channel Layer.

        This method is called when a Celery task completes.
        """
        data = event.get('data', {})
        logger.info(f"PSO optimization complete: {data.get('total_iterations', 'unknown')} iterations")

        # Clear task_id since task is complete (no need to revoke)
        self.task_id = None

        # Forward the completion to the WebSocket client
        await self.send_json({
            'type': 'pso_complete',
            'data': data
        })

    async def pso_heartbeat(self, event):
        """
        Handle PSO heartbeat messages from Channel Layer.

        This method is called periodically to keep the connection alive.
        """
        data = event.get('data', {})
        logger.debug(f"PSO heartbeat: {data.get('timestamp', 'unknown')}")

        # Forward the heartbeat to the WebSocket client
        await self.send_json({
            'type': 'pso_heartbeat',
            'data': data
        })

    async def pso_error(self, event):
        """
        Handle PSO error messages from Channel Layer.

        This method is called when a Celery task encounters an error.
        """
        data = event.get('data', {})
        logger.error(f"PSO error: {data.get('message', 'Unknown error')}")

        # Clear task_id since task has errored (no need to revoke)
        self.task_id = None

        # Forward the error to the WebSocket client
        await self.send_json({
            'type': 'pso_error',
            'data': data
        })
