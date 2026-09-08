"""
Base Module Registry - DRY principle for all parent module registries
"""
from typing import Dict, Type, Any
import importlib
import pkgutil


class BaseModuleRegistry:
    """Base registry class for auto-discovering sub-modules"""
    _registry: Dict[str, Type] = {}  # Maps slug -> Service class
    _module_id_map: Dict[str, str] = {}  # Maps MODULE_ID -> slug
    
    _global_registry: Dict[str, Type] = {}
    _global_module_id_map: Dict[str, str] = {}
    _global_metadata: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def register(cls, slug: str, module_id: str, service_class: Type):
        """Register a sub-module by URL slug and MODULE_ID"""
        cls._registry[slug] = service_class
        cls._module_id_map[module_id] = slug
        
        BaseModuleRegistry._global_registry[slug] = service_class
        BaseModuleRegistry._global_module_id_map[module_id] = slug
        if module_id not in BaseModuleRegistry._global_metadata:
            BaseModuleRegistry._global_metadata[module_id] = {
                'slug': slug,
                'parent_module': '',
                'service_class': service_class,
                'adapter_func': None
            }
    
    @classmethod
    def get_service_by_slug(cls, slug: str):
        """Get service class by URL slug (e.g., 'fin-plate')"""
        return cls._registry.get(slug)

    @classmethod
    def get_service_by_slug_or_404(cls, slug: str, allowed_slugs):
        """Get service class by URL slug, but only if slug is in the caller's
        public allowlist (the same slugs its options() endpoint serves).

        Unlike get_service_by_slug(), this doesn't trust the full registry —
        auto_discover() registers every folder under submodules/, so a
        submodule that exists on disk but was never wired into options()
        (dead, orphaned, or simply not ready) would otherwise still be
        reachable via design/cad. Returns None if slug isn't allowed, whether
        or not it happens to be registered.
        """
        if slug not in allowed_slugs:
            return None
        return cls.get_service_by_slug(slug)

    @classmethod
    def get_service_by_module_id(cls, module_id: str):
        """Get service class by MODULE_ID (e.g., 'FinPlateConnection')"""
        slug = cls._module_id_map.get(module_id)
        return cls._registry.get(slug) if slug else None

    @classmethod
    def get_metadata_by_module_id(cls, module_id: str):
        """Get metadata (slug, parent_module, service_class, adapter_func) by MODULE_ID (supports aliases)"""
        if not module_id:
            return None
        clean_id = module_id.strip()
        
        if clean_id in cls._global_metadata:
            return cls._global_metadata[clean_id]
            
        def simplify(s: str) -> str:
            return s.lower().replace('-', '').replace('_', '')
            
        target = simplify(clean_id)
        for registered_id, meta in cls._global_metadata.items():
            if simplify(registered_id) == target:
                return meta
                
        aliases = {
            'Beam-to-Beam-Cover-Plate-Bolted-Connection': 'Cover-Plate-Bolted-Connection',
            'Beam-to-Beam-Cover-Plate-Welded-Connection': 'Cover-Plate-Welded-Connection',
            'Column-to-Column-Cover-Plate-Bolted-Connection': 'ColumnCoverPlateBolted',
            'Column-to-Column-Cover-Plate-Welded-Connection': 'Column-to-Column-Cover-Plate-Welded-Connection',
            'ColumnCoverPlateWelded': 'Column-to-Column-Cover-Plate-Welded-Connection',
            'AxiallyLoadedColumn': 'Axially-Loaded-Column',
            'Seated-Angle-Connection': 'SeatedAngleConnection',
        }
        normalized_id = aliases.get(clean_id)
        if normalized_id and normalized_id in cls._global_metadata:
            return cls._global_metadata[normalized_id]
            
        if normalized_id:
            target_alias = simplify(normalized_id)
            for registered_id, meta in cls._global_metadata.items():
                if simplify(registered_id) == target_alias:
                    return meta
                    
        return None
    
    @classmethod
    def auto_discover(cls, package_name: str, package_path: str):
        """Auto-discover sub-modules in a package"""
        parts = package_name.split('.')
        parent_module = parts[2] if len(parts) > 2 else ''
        
        for _, name, _ in pkgutil.iter_modules([package_path]):
            try:
                mod = importlib.import_module(f'{package_name}.{name}')
                if hasattr(mod, 'MODULE_ID') and hasattr(mod, 'Service'):
                    slug = name.replace('_', '-')
                    cls.register(slug, mod.MODULE_ID, mod.Service)
                    
                    adapter_func = None
                    try:
                        adapter_mod = importlib.import_module(f'{package_name}.{name}.adapter')
                        adapter_func = getattr(adapter_mod, 'create_from_input', None)
                    except (ImportError, AttributeError):
                        pass
                        
                    BaseModuleRegistry._global_metadata[mod.MODULE_ID] = {
                        'slug': slug,
                        'parent_module': parent_module,
                        'service_class': mod.Service,
                        'adapter_func': adapter_func
                    }
            except Exception as exc:
                print(f"Module discovery error in {package_name}.{name}: {exc}")
                continue


try:
    from apps.modules.base_plate.adapter import create_from_input as base_plate_create_from_input
    from apps.modules.base_plate.service import BasePlateService
    BaseModuleRegistry._global_registry['base-plate'] = BasePlateService
    BaseModuleRegistry._global_module_id_map['Base-Plate'] = 'base-plate'
    BaseModuleRegistry._global_metadata['Base-Plate'] = {
        'slug': 'base-plate',
        'parent_module': 'base-plate',
        'service_class': BasePlateService,
        'adapter_func': base_plate_create_from_input
    }
except Exception as e:
    import logging
    logging.getLogger(__name__).warning(f"Failed to auto-register BasePlate in registry: {e}")


