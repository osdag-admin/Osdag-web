# Adding New Modules and Submodules to Osdag-Web

This guide explains how to add new parent modules and submodules to the Osdag-Web application using the current architecture with auto-discovery and registry patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Adding a New Parent Module](#adding-a-new-parent-module)
3. [Adding a New Submodule](#adding-a-new-submodule)
4. [File Structure Reference](#file-structure-reference)
5. [Registry System](#registry-system)
6. [URL Routing](#url-routing)
7. [Service and Adapter Pattern](#service-and-adapter-pattern)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The Osdag-Web backend uses a hierarchical module structure:

- **Parent Modules**: Top-level categories (e.g., `shear_connection`, `moment_connection`, `tension_member`, `flexure_member`)
- **Submodules**: Specific design implementations within a parent module (e.g., `fin_plate`, `cleat_angle` under `shear_connection`)

### Directory Structure

```
backend/apps/modules/
├── shear_connection/          # Parent module
│   ├── __init__.py
│   ├── apps.py                # Django app config
│   ├── registry.py            # Submodule registry
│   ├── urls.py                # URL routing
│   ├── views.py               # ViewSet for routing
│   ├── shared.py              # Shared utilities (optional)
│   └── submodules/            # Submodule directory
│       ├── __init__.py
│       ├── fin_plate/         # Submodule
│       │   ├── __init__.py    # Must define MODULE_ID and Service
│       │   ├── adapter.py     # API adapter (input validation, output formatting)
│       │   └── service.py     # Service class (business logic)
│       └── cleat_angle/
│           └── ...
└── moment_connection/
    └── ...
```

### Key Concepts

1. **Auto-Discovery**: Submodules are automatically discovered by the registry system
2. **Registry Pattern**: Each parent module has a registry that inherits from `BaseModuleRegistry`
3. **Service Layer**: Each submodule exposes a `Service` class with a `calculate()` method
4. **Adapter Layer**: Handles input validation, output formatting, and CAD model generation
5. **URL Routing**: Uses URL slugs (e.g., `fin-plate`) to route to the correct submodule

---

## Adding a New Parent Module

To add a completely new parent module (e.g., `base_plate`):

### Step 1: Create Directory Structure

```bash
backend/apps/modules/your_module/
├── __init__.py
├── apps.py
├── registry.py
├── urls.py
├── views.py
└── submodules/
    └── __init__.py
```

### Step 2: Create `apps.py`

```python
from django.apps import AppConfig

class YourModuleConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.modules.your_module'
    verbose_name = 'Your Module'
```

### Step 3: Create `registry.py`

```python
"""
Your Module Registry - Auto-discovers sub-modules
Inherits from BaseModuleRegistry (DRY principle)
"""
import os
from apps.core.registry import BaseModuleRegistry


class YourModuleRegistry(BaseModuleRegistry):
    """Registry for your module sub-modules"""
    pass


# Auto-discover sub-modules
_package_name = 'apps.modules.your_module.submodules'
_package_path = os.path.join(os.path.dirname(__file__), 'submodules')
YourModuleRegistry.auto_discover(_package_name, _package_path)
```

### Step 4: Create `urls.py`

```python
"""
Your Module URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import YourModuleViewSet

router = DefaultRouter()
router.register(r'', YourModuleViewSet, basename='your-module')

urlpatterns = router.urls
```

### Step 5: Create `views.py`

```python
"""
Your Module ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .registry import YourModuleRegistry
from apps.core.utils.module_helpers import handle_design_request


class YourModuleViewSet(viewsets.ViewSet):
    """
    Generic ViewSet that routes to specific sub-module services based on URL slug.
    Supports guest mode and optional project_id saving for authenticated users.
    """
    permission_classes = [AllowAny]  # Allow both authenticated and guest users
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/your-module/{submodule_slug}/design/
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "project_id": 123  # Optional: Save results to project if user is authenticated
        }
        
        Example: POST /api/modules/your-module/your-submodule/design/
        """
        # Use URL slug to find service (not POST body)
        ServiceClass = YourModuleRegistry.get_service_by_slug(submodule_slug)
        
        if not ServiceClass:
            return Response(
                {'error': f'Sub-module {submodule_slug} not found'}, 
                status=404
            )
        
        # Extract inputs and optional project_id
        inputs = request.data.get('inputs', request.data)  # Support both formats
        project_id = request.data.get('project_id')
        
        # Handle authentication and project saving (shared logic)
        context = handle_design_request(
            request=request,
            inputs=inputs,
            project_id=project_id,
            submodule_slug=submodule_slug,
            module_name='your-module'
        )
        
        try:
            # Call the service with request context
            result = ServiceClass.calculate(
                inputs=inputs,
                request=request,
                project_id=project_id if not context['is_guest'] else None,
                user_email=context['user_email']
            )
            
            # Add project saving result to response
            if context['project_result']:
                result['project_saved'] = context['project_result']['saved']
                if context['project_result'].get('project_id'):
                    result['project_id'] = context['project_result']['project_id']
                if context['project_result'].get('error'):
                    result['project_error'] = context['project_result']['error']
            
            return Response(result, status=200)
        except Exception as e:
            return Response(
                {'error': str(e), 'success': False}, 
                status=400
            )
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/your-module/{submodule_slug}/options/
        
        Returns input options for the sub-module (e.g., beam list, column list)
        """
        # TODO: Implement options endpoint if needed
        return Response({'message': 'Options endpoint not yet implemented'}, status=501)
```

### Step 6: Register in Django Settings

Add your module to `INSTALLED_APPS` in `backend/config/settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'apps.modules.your_module',
    # ... other apps
]
```

### Step 7: Add URL Route

Add your module to `backend/apps/modules/urls.py`:

```python
urlpatterns = [
    # ... existing modules
    path('your-module/', include('apps.modules.your_module.urls')),
]
```

---

## Adding a New Submodule

To add a new submodule to an existing parent module (e.g., adding `new_connection` to `shear_connection`):

### Step 1: Create Submodule Directory

```bash
backend/apps/modules/shear_connection/submodules/new_connection/
├── __init__.py
├── adapter.py
└── service.py
```

### Step 2: Create `__init__.py`

This file is critical for auto-discovery. It must define `MODULE_ID` and export `Service`:

```python
"""
NewConnection Sub-module
"""
MODULE_ID = 'NewConnection'  # Must match the module identifier used in osdag_core
from .service import NewConnectionService as Service
```

**Important Notes:**
- `MODULE_ID` must be a unique string identifier (typically matches the osdag_core class name)
- `Service` must be exported and point to your service class
- The directory name (`new_connection`) will be converted to URL slug (`new-connection`)

### Step 3: Create `adapter.py`

The adapter handles:
- Input validation
- Output formatting
- CAD model generation
- Integration with osdag_core design engines

```python
"""
API adapter for NewConnection module

Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Validate all input parameters (required keys, data types).
    create_module() -> NewConnection:
        Create an instance of the NewConnection module design class.
    create_from_input(input_values: Dict[str, Any]) -> NewConnection:
        Create an instance from input values.
    generate_output(input_values: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
        Generate, format and return the output values.
        Output format: {
            "Bolt.Pitch": {
                "key": "Bolt.Pitch",
                "label": "Pitch Distance (mm)",
                "val": 40
            }
        }
    create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
        Generate the CAD model from input values as a BREP file. Return file path.
"""
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
)
from osdag_core.design_type.connection.new_connection import NewConnection
from osdag_core.custom_logger import CustomLogger
from typing import Dict, Any, List, Tuple
import traceback


def get_required_keys() -> List[str]:
    """
    Return all required input parameters for the module.
    These keys must be present in the input dictionary.
    """
    return [
        "Member.Profile",
        "Member.Designation",
        # ... add all required keys
        "Module"
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """
    Validate all input parameters.
    Raises MissingKeyError or InvalidInputTypeError if validation fails.
    """
    required_keys = get_required_keys()
    
    # Check for missing keys
    if not contains_keys(input_values, required_keys):
        missing = [key for key in required_keys if key not in input_values]
        raise MissingKeyError(f"Missing required keys: {missing}")
    
    # Validate data types
    # Example: validate_num(input_values.get("Bolt.Pitch"), "Bolt.Pitch")
    # Example: validate_string(input_values.get("Member.Profile"), "Member.Profile")
    
    # Add your specific validation logic here
    pass


def create_module() -> NewConnection:
    """
    Create an instance of the NewConnection module design class.
    """
    logger = CustomLogger()
    module = NewConnection(logger=logger)
    return module


def create_from_input(input_values: Dict[str, Any]) -> NewConnection:
    """
    Create an instance of the NewConnection module from input values.
    Maps input dictionary to module's set_input_values() method.
    """
    module = create_module()
    
    # Map input_values to the format expected by osdag_core
    # Example:
    # module.set_input_values({
    #     "Member.Profile": input_values.get("Member.Profile"),
    #     "Member.Designation": input_values.get("Member.Designation"),
    #     # ... map all inputs
    # })
    
    return module


def generate_output(input_values: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Generate formatted output from input values.
    
    Returns:
        Tuple of (output_dict, logs_list)
        - output_dict: Flattened dictionary with format {key: {key, label, val}}
        - logs_list: List of calculation log messages
    """
    try:
        # Create module instance
        module = create_from_input(input_values)
        
        # Get raw outputs from osdag_core
        raw_output = module.output_values(True)  # True = include TextBox entries
        raw_spacing = module.spacing(True) if hasattr(module, 'spacing') else []
        raw_capacities = module.capacities(True) if hasattr(module, 'capacities') else []
        
        # Format outputs into flat dictionary
        output = {}
        logs = []
        
        # Process output_values (list of tuples)
        # Format: (key, label, value, type, ...)
        for param in raw_output:
            if len(param) >= 3:
                key = param[0]
                label = param[1]
                val = param[2]
                output[key] = {
                    "key": key,
                    "label": label,
                    "val": val
                }
        
        # Process spacing if available
        for param in raw_spacing:
            if len(param) >= 3:
                key = param[0]
                label = param[1]
                val = param[2]
                output[key] = {
                    "key": key,
                    "label": label,
                    "val": val
                }
        
        # Process capacities if available
        for param in raw_capacities:
            if len(param) >= 3:
                key = param[0]
                label = param[1]
                val = param[2]
                output[key] = {
                    "key": key,
                    "label": label,
                    "val": val
                }
        
        # Get logs from module if available
        if hasattr(module, 'logger') and hasattr(module.logger, 'get_logs'):
            logs = module.logger.get_logs()
        
        return output, logs
        
    except Exception as e:
        error_msg = f"Error generating output: {str(e)}\n{traceback.format_exc()}"
        return {}, [error_msg]


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """
    Generate CAD model from input values.
    
    Args:
        input_values: Design input parameters
        section: Section name (e.g., "Model", "Beam", "Column")
        session: Session ID for file naming
    
    Returns:
        File path to generated CAD file (BREP format)
    """
    from osdag_core.cad.common_logic import CommonDesignLogic
    from OCC.Core import BRepTools
    from OCC.Core.TopoDS import TopoDS_Compound
    from OCC.Core.BRep import BRep_Builder
    import os
    
    # Create module instance
    module = create_from_input(input_values)
    
    # Setup CAD logic
    cad_logic = CommonDesignLogic(module)
    cad_logic.setup_for_cad()
    
    # Get CAD geometry for the requested section
    if section == "Model":
        # Get merged/complete model
        shape = cad_logic.get_model_shape()
    elif section == "Beam":
        shape = cad_logic.get_beam_shape()
    elif section == "Column":
        shape = cad_logic.get_column_shape()
    # ... add other sections as needed
    else:
        raise ValueError(f"Unknown section: {section}")
    
    # Create output directory
    output_dir = os.path.join(settings.FILE_STORAGE_ROOT, 'cad_models')
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate file path
    file_name = f"{session}_{section}.brep"
    file_path = os.path.join(output_dir, file_name)
    
    # Write BREP file
    BRepTools.Write(shape, file_path)
    
    return file_path
```

### Step 4: Create `service.py`

The service class provides the business logic interface:

```python
"""
New Connection Service - Business logic layer
Bridges between API and osdag_core
"""
from osdag_core.design_type.connection.new_connection import NewConnection
from .adapter import validate_input, generate_output, create_cad_model
import traceback


class NewConnectionService:
    """Service class for NewConnection module"""
    
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """
        Run design calculation and return results.
        
        Args:
            inputs: Dictionary of input parameters
            request: Optional Django request object (for future use)
            project_id: Optional project ID (for saving results)
            user_email: Optional user email (for saving results)
            
        Returns:
            Dictionary with 'data' (results), 'logs' (calculation logs), and 'success' flag
        """
        try:
            # Validate inputs
            validate_input(inputs)
            
            # Generate formatted output (this handles module creation and calculation)
            output, logs = generate_output(inputs)
            
            # Prepare response
            result = {
                'data': output,
                'logs': logs or [],  # Ensure logs is always a list
                'success': True
            }
            
            return result
            
        except MissingKeyError as e:
            return {
                'error': str(e),
                'success': False,
                'logs': [str(e)]
            }
        except InvalidInputTypeError as e:
            return {
                'error': str(e),
                'success': False,
                'logs': [str(e)]
            }
        except Exception as e:
            error_msg = f"Calculation error: {str(e)}\n{traceback.format_exc()}"
            return {
                'error': error_msg,
                'success': False,
                'logs': [error_msg]
            }
    
    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str) -> str:
        """
        Generate CAD model for a specific section.
        
        Args:
            inputs: Design input parameters
            section: Section name (e.g., "Model", "Beam", "Column")
            session: Session ID for file naming
            
        Returns:
            File path to generated CAD file
        """
        return create_cad_model(inputs, section, session)
```

### Step 5: Verify Auto-Discovery

The submodule should be automatically discovered when the Django app starts. Check the console output for:

```
✅ Discovered module: NewConnection from shear_connection/new_connection
```

If you don't see this message, check:
1. `__init__.py` has `MODULE_ID` and `Service` exported correctly
2. Directory name matches the submodule name
3. No import errors in `adapter.py` or `service.py`

---

## File Structure Reference

### Parent Module Files

#### `apps.py`
Django app configuration. Required for Django to recognize the module.

#### `registry.py`
Submodule registry that auto-discovers submodules. Must:
- Inherit from `BaseModuleRegistry`
- Call `auto_discover()` with package name and path

#### `urls.py`
URL routing configuration. Uses Django REST Framework router.

#### `views.py`
ViewSet that routes requests to submodule services. Handles:
- URL slug parsing
- Service lookup via registry
- Request/response handling
- Guest mode and authentication

### Submodule Files

#### `__init__.py` (Required)
Must define:
- `MODULE_ID`: Unique module identifier (string)
- `Service`: Reference to service class

#### `adapter.py` (Required)
Contains:
- `get_required_keys()`: List of required input keys
- `validate_input()`: Input validation logic
- `create_module()`: Create osdag_core module instance
- `create_from_input()`: Create module from input dictionary
- `generate_output()`: Generate and format output
- `create_cad_model()`: Generate CAD files (optional but recommended)

#### `service.py` (Required)
Contains:
- `Service` class with `calculate()` method
- Business logic layer between API and osdag_core

---

## Registry System

The registry system uses auto-discovery to find submodules automatically.

### How It Works

1. **BaseModuleRegistry**: Base class in `apps/core/registry.py` that provides:
   - `register()`: Register a submodule
   - `get_service_by_slug()`: Get service by URL slug
   - `get_service_by_module_id()`: Get service by MODULE_ID
   - `auto_discover()`: Automatically discover submodules

2. **Parent Module Registry**: Each parent module has its own registry:
   ```python
   class ShearConnectionRegistry(BaseModuleRegistry):
       pass
   ```

3. **Auto-Discovery**: Scans `submodules/` directory and imports each submodule:
   - Checks for `MODULE_ID` and `Service` in `__init__.py`
   - Converts directory name to URL slug (e.g., `fin_plate` → `fin-plate`)
   - Registers the service class

### URL Slug Conversion

Directory names use underscores (`fin_plate`), but URL slugs use hyphens (`fin-plate`). The registry automatically converts:
- `fin_plate` → `fin-plate`
- `cleat_angle` → `cleat-angle`
- `new_connection` → `new-connection`

---

## URL Routing

### URL Structure

```
/api/modules/{parent-module}/{submodule-slug}/design/
```

Examples:
- `/api/modules/shear-connection/fin-plate/design/`
- `/api/modules/moment-connection/beam-column-end-plate/design/`
- `/api/modules/tension-member/bolted/design/`

### Request Format

```json
POST /api/modules/shear-connection/fin-plate/design/
Content-Type: application/json

{
    "inputs": {
        "Member.Profile": "I",
        "Member.Designation": "ISMB 200",
        "Bolt.Pitch": 40,
        // ... other inputs
    },
    "project_id": 123  // Optional: Save to project if authenticated
}
```

### Response Format

```json
{
    "data": {
        "Bolt.Pitch": {
            "key": "Bolt.Pitch",
            "label": "Pitch Distance (mm)",
            "val": 40
        },
        // ... other outputs
    },
    "logs": [
        "Calculation started...",
        "Design check passed...",
        // ... other log messages
    ],
    "success": true,
    "project_saved": true,  // If project_id was provided
    "project_id": 123       // If project was saved
}
```

---

## Service and Adapter Pattern

### Service Layer (`service.py`)

**Purpose**: Business logic interface between API and osdag_core

**Responsibilities**:
- Call adapter functions
- Handle errors and exceptions
- Format responses
- Optional: Project saving, logging, caching

**Interface**:
```python
class YourService:
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        # Validate, calculate, return results
        pass
```

### Adapter Layer (`adapter.py`)

**Purpose**: Bridge between API format and osdag_core format

**Responsibilities**:
- Input validation
- Input mapping/transformation
- Output formatting
- CAD model generation
- Direct interaction with osdag_core classes

**Key Functions**:
- `get_required_keys()`: Define required inputs
- `validate_input()`: Validate inputs before calculation
- `create_from_input()`: Map API inputs to osdag_core format
- `generate_output()`: Format osdag_core outputs to API format
- `create_cad_model()`: Generate CAD files

---

## Examples

### Example 1: Adding `seated_angle` to `shear_connection`

1. Create directory: `backend/apps/modules/shear_connection/submodules/seated_angle/`
2. Create `__init__.py`:
   ```python
   MODULE_ID = 'SeatedAngleConnection'
   from .service import SeatedAngleService as Service
   ```
3. Create `adapter.py` with functions for SeatedAngleConnection
4. Create `service.py` with SeatedAngleService class
5. Auto-discovery will register it automatically
6. Access via: `POST /api/modules/shear-connection/seated-angle/design/`

### Example 2: Adding `bolted` to `tension_member`

1. Create directory: `backend/apps/modules/tension_member/submodules/bolted/`
2. Create `__init__.py`:
   ```python
   MODULE_ID = 'BoltedTensionMember'
   from .service import BoltedTensionMemberService as Service
   ```
3. Create adapter and service files
4. Access via: `POST /api/modules/tension-member/bolted/design/`

### Example 3: Complete New Parent Module `base_plate`

1. Create `backend/apps/modules/base_plate/` with all required files
2. Add to `INSTALLED_APPS` in settings
3. Add URL route in `apps/modules/urls.py`
4. Create submodules under `base_plate/submodules/`
5. Access via: `POST /api/modules/base-plate/{submodule}/design/`

---

## Troubleshooting

### Submodule Not Discovered

**Problem**: Submodule doesn't appear in registry

**Solutions**:
1. Check `__init__.py` has `MODULE_ID` and `Service` exported
2. Verify directory name doesn't start with `_` (underscore)
3. Check for import errors in `adapter.py` or `service.py`
4. Restart Django server to trigger auto-discovery
5. Check console output for discovery messages

### 404 Error on API Request

**Problem**: `POST /api/modules/.../design/` returns 404

**Solutions**:
1. Verify URL slug matches directory name (with hyphens)
2. Check parent module is registered in `apps/modules/urls.py`
3. Verify ViewSet is correctly configured
4. Check registry has the submodule: `YourModuleRegistry.get_service_by_slug('submodule-slug')`

### Import Errors

**Problem**: Import errors when accessing submodule

**Solutions**:
1. Check all imports in `adapter.py` are available
2. Verify osdag_core module exists and is importable
3. Check Python path includes backend directory
4. Verify dependencies are installed

### Validation Errors

**Problem**: Input validation fails

**Solutions**:
1. Check `get_required_keys()` includes all required fields
2. Verify `validate_input()` checks match actual input types
3. Check input dictionary keys match expected format
4. Review error messages for specific missing/invalid keys

### Output Format Issues

**Problem**: Output doesn't match expected format

**Solutions**:
1. Verify `generate_output()` returns `(dict, list)` tuple
2. Check output dictionary has `{key: {key, label, val}}` format
3. Ensure all output keys are strings
4. Check osdag_core output format matches expectations

### CAD Model Generation Fails

**Problem**: CAD model creation fails

**Solutions**:
1. Verify `create_cad_model()` returns file path string
2. Check file storage directory exists and is writable
3. Verify section names match expected values
4. Check osdag_core CAD logic is properly initialized
5. Review file permissions and disk space

---

## Best Practices

1. **Naming Conventions**:
   - Directory names: use underscores (`fin_plate`)
   - URL slugs: automatically converted to hyphens (`fin-plate`)
   - MODULE_ID: use PascalCase (`FinPlateConnection`)
   - Service class: use PascalCase with "Service" suffix (`FinPlateService`)

2. **Error Handling**:
   - Always validate inputs before calculation
   - Return meaningful error messages
   - Log errors for debugging
   - Handle exceptions gracefully

3. **Output Formatting**:
   - Always return consistent output format
   - Include all relevant calculation results
   - Provide clear labels for output values
   - Include calculation logs when available

4. **Code Organization**:
   - Keep adapter functions focused on I/O transformation
   - Keep service class focused on business logic
   - Use shared utilities from `apps.core.utils`
   - Follow existing patterns in similar modules

5. **Testing**:
   - Test input validation with various inputs
   - Test output formatting matches expected format
   - Test error handling with invalid inputs
   - Test CAD generation for all supported sections

---

## Additional Resources

- Existing module examples:
  - `backend/apps/modules/shear_connection/submodules/fin_plate/`
  - `backend/apps/modules/moment_connection/submodules/beam_column_end_plate/`
  - `backend/apps/modules/tension_member/submodules/bolted/`

- Core utilities:
  - `backend/apps/core/registry.py` - Base registry class
  - `backend/apps/core/utils/` - Validation and helper functions
  - `backend/apps/core/module_finder.py` - Module discovery logic

- Related documentation:
  - `documentation/NEW_MODULE_GUIDE.md` - Legacy module guide (old architecture)
  - `documentation/DEPLOYMENT_GUIDE.md` - Deployment instructions

---

## Summary Checklist

### Adding a New Parent Module:
- [ ] Create directory structure
- [ ] Create `apps.py`
- [ ] Create `registry.py` with auto-discovery
- [ ] Create `urls.py` with router
- [ ] Create `views.py` with ViewSet
- [ ] Register in `INSTALLED_APPS`
- [ ] Add URL route in `apps/modules/urls.py`
- [ ] Create `submodules/` directory

### Adding a New Submodule:
- [ ] Create submodule directory
- [ ] Create `__init__.py` with `MODULE_ID` and `Service`
- [ ] Create `adapter.py` with required functions
- [ ] Create `service.py` with `Service` class
- [ ] Verify auto-discovery works
- [ ] Test API endpoint
- [ ] Test input validation
- [ ] Test output formatting
- [ ] Test CAD generation (if applicable)

---

*Last updated: Based on current architecture as of 2024*

