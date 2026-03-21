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
print("[CompressionMemberRegistry] Starting auto_discover...")
_package_name = 'apps.modules.compression_member.submodules'
_package_path = os.path.join(os.path.dirname(__file__), 'submodules')
print(f"[CompressionMemberRegistry] Package path: {_package_path}")
CompressionMemberRegistry.auto_discover(_package_name, _package_path)

# Debug: print registered modules
print(f"[CompressionMemberRegistry] Registered slugs: {list(CompressionMemberRegistry._registry.keys())}")
print(f"[CompressionMemberRegistry] Module ID map: {CompressionMemberRegistry._module_id_map}")

