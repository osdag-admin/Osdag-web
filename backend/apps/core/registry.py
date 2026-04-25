"""
Base Module Registry - DRY principle for all parent module registries
"""
import importlib
import pkgutil
from typing import Dict, Type


class BaseModuleRegistry:
    """Base registry class for auto-discovering sub-modules"""
    _registry: Dict[str, Type] = {}  # Maps slug -> Service class
    _module_id_map: Dict[str, str] = {}  # Maps MODULE_ID -> slug
    
    @classmethod
    def register(cls, slug: str, module_id: str, service_class: Type):
        """Register a sub-module by URL slug and MODULE_ID"""
        cls._registry[slug] = service_class
        cls._module_id_map[module_id] = slug
    
    @classmethod
    def get_service_by_slug(cls, slug: str):
        """Get service class by URL slug (e.g., 'fin-plate')"""
        return cls._registry.get(slug)
    
    @classmethod
    def get_service_by_module_id(cls, module_id: str):
        """Get service class by MODULE_ID (e.g., 'FinPlateConnection')"""
        slug = cls._module_id_map.get(module_id)
        return cls._registry.get(slug) if slug else None
    
    @classmethod
    def auto_discover(cls, package_name: str, package_path: str):
        """Auto-discover sub-modules in a package"""
        print(f"[auto_discover] Starting for {package_name} at {package_path}")
        for _, name, _ in pkgutil.iter_modules([package_path]):
            print(f"[auto_discover] Found module: {name}")
            try:
                mod = importlib.import_module(f'{package_name}.{name}')
                print(f"[auto_discover] Imported {name}, has MODULE_ID: {hasattr(mod, 'MODULE_ID')}, has Service: {hasattr(mod, 'Service')}")
                if hasattr(mod, 'MODULE_ID') and hasattr(mod, 'Service'):
                    # Convert module name to slug (e.g., 'fin_plate' -> 'fin-plate')
                    slug = name.replace('_', '-')
                    cls.register(slug, mod.MODULE_ID, mod.Service)
                    print(f"[auto_discover] Registered: {slug}")
            except ImportError as e:
                print(f"[auto_discover] ImportError for {name}: {e}")
                import traceback
                traceback.print_exc()
                continue

