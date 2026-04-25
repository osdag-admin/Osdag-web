"""
Flexure Member Registry - Auto-discovers sub-modules
Inherits from BaseModuleRegistry (DRY principle)
"""
import os
from apps.core.registry import BaseModuleRegistry


class FlexureMemberRegistry(BaseModuleRegistry):
    """Registry for flexure member sub-modules"""
    pass


# Auto-discover sub-modules
_package_name = 'apps.modules.flexure_member.submodules'
_package_path = os.path.join(os.path.dirname(__file__), 'submodules')
FlexureMemberRegistry.auto_discover(_package_name, _package_path)

