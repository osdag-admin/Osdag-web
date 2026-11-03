import os
import pytest

def pytest_collection_modifyitems(config, items):
    if os.environ.get('SKIP_BACKEND_TESTS') == '1':
        skip_backend = pytest.mark.skip(reason="Skipping all backend tests (SKIP_BACKEND_TESTS=1)")
        for item in items:
            item.add_marker(skip_backend)


@pytest.fixture(autouse=True)
def in_memory_channel_layer(settings):
    """Tasks broadcast over Channels when they run; keep every test off Redis."""
    settings.CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}
