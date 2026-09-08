"""
Dynamic Module Finder - Auto-discovers modules from parent module registries
Replaces the old osdag_api/module_finder.py with registry-based discovery
"""
import importlib
import pkgutil
from typing import Dict, Any, List, Protocol, Optional
from types import ModuleType


class ModuleApiType(Protocol):
    """Protocol for module API interface (backward compatibility)"""
    
    def validate_input(self, input_values: Dict[str, Any]) -> None:
        """Validate type for all values in design dict. Raise error when invalid"""
        pass
    
    def get_required_keys(self) -> List[str]:
        """Return all required input parameters for the module"""
        pass
    
    def create_module(self) -> Any:
        """Create an instance of the module design class and set it up for use"""
        pass
    
    def create_from_input(self, input_values: Dict[str, Any]) -> Any:
        """Create an instance of the module design class from input values."""
        pass
    
    def generate_output(self, input_values: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate, format and return the output values from the given input values.
        Output format (json): {
            "Bolt.Pitch": {
                "key": "Bolt.Pitch",
                "label": "Pitch Distance (mm)",
                "value": 40
            }
        }
        """
        pass
    
    def create_cad_model(
        self,
        input_values: Dict[str, Any],
        section: str,
        session: str,
        export_formats: Optional[List[str]] = None,
    ) -> str:
        """Generate the CAD model from input values as a BREP file. Return file path."""
        pass


class ModuleApiAdapter:
    """
    Adapter class that wraps adapter module functions to provide ModuleApiType interface
    This allows backward compatibility with code that expects the old module API
    """
    
    def __init__(self, adapter_module: ModuleType):
        """
        Initialize adapter with the adapter module
        
        Args:
            adapter_module: The adapter module (e.g., apps.modules.shear_connection.submodules.fin_plate.adapter)
        """
        self._adapter = adapter_module
    
    def validate_input(self, input_values: Dict[str, Any]) -> None:
        """Delegate to adapter's validate_input function"""
        return self._adapter.validate_input(input_values)
    
    def get_required_keys(self) -> List[str]:
        """Delegate to adapter's get_required_keys function"""
        return self._adapter.get_required_keys()
    
    def create_module(self) -> Any:
        """Delegate to adapter's create_module function"""
        return self._adapter.create_module()
    
    def create_from_input(self, input_values: Dict[str, Any]) -> Any:
        """Delegate to adapter's create_from_input function"""
        return self._adapter.create_from_input(input_values)
    
    def generate_output(self, input_values: Dict[str, Any]) -> Dict[str, Any]:
        """Delegate to adapter's generate_output function"""
        return self._adapter.generate_output(input_values)
    
    def create_cad_model(
        self,
        input_values: Dict[str, Any],
        section: str,
        session: str,
        export_formats: Optional[List[str]] = None,
    ) -> str:
        """Delegate to adapter's create_cad_model function (best-effort)."""
        try:
            return self._adapter.create_cad_model(input_values, section, session, export_formats=export_formats)
        except TypeError:
            return self._adapter.create_cad_model(input_values, section, session)


# Global module dictionary - auto-populated on import
_module_dict: Dict[str, ModuleApiType] = {}


def _discover_modules():
    """
    Auto-discover all modules from parent module registries
    Scans apps.modules.*.submodules.* for MODULE_ID and creates adapter wrappers
    Uses file reading to avoid import-time dependency issues
    """
    import os
    import re
    from pathlib import Path
    
    # Get the apps/modules directory
    backend_path = Path(__file__).resolve().parent.parent.parent
    modules_path = backend_path / 'apps' / 'modules'
    
    if not modules_path.exists():
        print("Warning: modules path does not exist:", modules_path)
        return
    
    # Iterate through all parent module directories
    for parent_module_dir in modules_path.iterdir():
        if not parent_module_dir.is_dir() or parent_module_dir.name.startswith('_'):
            continue
        
        submodules_path = parent_module_dir / 'submodules'
        if not submodules_path.exists():
            continue
        
        parent_module_name = parent_module_dir.name
        package_base = f'apps.modules.{parent_module_name}.submodules'
        
        # Iterate through all sub-module directories
        for submodule_dir in submodules_path.iterdir():
            if not submodule_dir.is_dir() or submodule_dir.name.startswith('_'):
                continue
            
            submodule_name = submodule_dir.name
            init_file = submodule_dir / '__init__.py'
            adapter_file = submodule_dir / 'adapter.py'
            
            # Skip if adapter doesn't exist
            if not adapter_file.exists():
                continue
            
            # Read MODULE_ID from __init__.py without importing
            module_id = None
            if init_file.exists():
                try:
                    content = init_file.read_text(encoding='utf-8')
                    # Look for MODULE_ID = '...' pattern
                    match = re.search(r"MODULE_ID\s*=\s*['\"]([^'\"]+)['\"]", content)
                    if match:
                        module_id = match.group(1)
                except Exception as e:
                    # If file reading fails, try importing (may fail due to dependencies)
                    try:
                        init_module_path = f'{package_base}.{submodule_name}'
                        init_module = importlib.import_module(init_module_path)
                        if hasattr(init_module, 'MODULE_ID'):
                            module_id = init_module.MODULE_ID
                    except:
                        pass
            
            if not module_id:
                continue
            
            # Import the adapter module (lazy - only when needed)
            adapter_module_path = f'{package_base}.{submodule_name}.adapter'
            try:
                adapter_module = importlib.import_module(adapter_module_path)
            except ImportError as e:
                # Adapter import failed - skip for now, will fall back to old system
                continue
            except Exception as e:
                # Other errors - skip
                continue
            
            # Create adapter wrapper
            try:
                adapter = ModuleApiAdapter(adapter_module)
                _module_dict[module_id] = adapter
            except Exception as e:
                print(f"Module finder adapter error for {module_id}: {e}")
                continue


# Auto-discover modules on import
_discover_modules()


def get_module_api(module_id: str) -> ModuleApiType:
    """
    Return the API adapter for the specified module by MODULE_ID
    Falls back to old osdag_api for modules not yet migrated
    
    Args:
        module_id: The MODULE_ID (e.g., 'FinPlateConnection', 'Beam-Beam-End-Plate-Connection')
    
    Returns:
        ModuleApiType adapter instance
    
    Raises:
        KeyError: If module_id is not found in either new or old system
    """
    # Try new registry-based discovery first
    if module_id in _module_dict:
        return _module_dict[module_id]
    
    # Fall back to old osdag_api for modules not yet migrated
    try:
        from osdag_api.module_finder import get_module_api as old_get_module_api
        return old_get_module_api(module_id)
    except (ImportError, KeyError):
        raise KeyError(
            f"Module '{module_id}' not found. "
            f"Available modules: {list(_module_dict.keys())}"
        )


# Export module_dict for backward compatibility (used by modules_api.py)
module_dict = _module_dict


# For backward compatibility with old imports
# Combine discovered modules with old modules (for modules not yet migrated)
def _get_developed_modules():
    """Get list of all available modules (new + old)"""
    new_modules = list(_module_dict.keys())
    try:
        from osdag_api.module_finder import module_dict as old_module_dict
        old_modules = list(old_module_dict.keys())
        # Combine and deduplicate
        all_modules = list(set(new_modules + old_modules))
        return all_modules
    except ImportError:
        return new_modules

developed_modules = _get_developed_modules()

