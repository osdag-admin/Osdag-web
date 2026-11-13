"""
Moment Connection Registry - Auto-discovers sub-modules
Inherits from BaseModuleRegistry (DRY principle)
"""
import os
from apps.core.registry import BaseModuleRegistry


class MomentConnectionRegistry(BaseModuleRegistry):
    """Registry for moment connection sub-modules"""
    pass


# Auto-discover sub-modules
_package_name = 'apps.modules.moment_connection.submodules'
_package_path = os.path.join(os.path.dirname(__file__), 'submodules')
MomentConnectionRegistry.auto_discover(_package_name, _package_path)

