import os
import pytest

def pytest_collection_modifyitems(config, items):
    if os.environ.get('CI') == 'true':
        skip_ci = pytest.mark.skip(reason="Skipping all backend tests in CI environment")
        for item in items:
            item.add_marker(skip_ci)
