"""
Compression Member Registry - Auto-discovers sub-modules
Inherits from BaseModuleRegistry (DRY principle)
"""
import os
from apps.core.registry import BaseModuleRegistry


class CompressionMemberRegistry(BaseModuleRegistry):
    """Registry for compression member sub-modules"""
    # Each registry needs its own dictionaries (class-level inheritance quirk)
    _registry = {}
    _module_id_map = {}


# Auto-discover sub-modules
_package_name = 'apps.modules.compression_member.submodules'
_package_path = os.path.join(os.path.dirname(__file__), 'submodules')
CompressionMemberRegistry.auto_discover(_package_name, _package_path)

