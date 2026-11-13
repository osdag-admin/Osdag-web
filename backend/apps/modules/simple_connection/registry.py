"""
Simple Connection Registry - auto-discovers sub-modules
"""
import os
from apps.core.registry import BaseModuleRegistry


class SimpleConnectionRegistry(BaseModuleRegistry):
    """Registry for simple-connection sub-modules"""
    pass


# Auto-discover sub-modules (expects MODULE_ID and Service in each __init__.py)
_package_name = 'apps.modules.simple_connection.submodules'
_package_path = os.path.join(os.path.dirname(__file__), 'submodules')
SimpleConnectionRegistry.auto_discover(_package_name, _package_path)

