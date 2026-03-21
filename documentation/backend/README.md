# Core Utilities

Shared utilities for all Django apps in the project.

## `module_helpers.py`

Shared authentication, guest mode, and project saving logic for all module endpoints.

### Functions

#### `is_guest_user(request) -> bool`
Check if the current user is a guest user.

```python
from apps.core.utils.module_helpers import is_guest_user

if is_guest_user(request):
    # Handle guest user
```

#### `get_user_email(request) -> Optional[str]`
Get user email from JWT token or user object.

```python
from apps.core.utils.module_helpers import get_user_email

user_email = get_user_email(request)
```

#### `save_to_project(project_id, user_email, inputs, submodule_slug, module_name=None) -> dict`
Save design inputs to a project in the database.

```python
from apps.core.utils.module_helpers import save_to_project

result = save_to_project(
    project_id=123,
    user_email='user@example.com',
    inputs={'Bolt.Diameter': '16', ...},
    submodule_slug='fin-plate',
    module_name='shear-connection'
)
# Returns: {'saved': True, 'project_id': 123} or {'saved': False, 'error': '...'}
```

#### `handle_design_request(request, inputs, project_id, submodule_slug, module_name=None) -> dict`
**Convenience function** that combines guest checking and project saving.

```python
from apps.core.utils.module_helpers import handle_design_request

context = handle_design_request(
    request=request,
    inputs=inputs,
    project_id=project_id,
    submodule_slug='fin-plate',
    module_name='shear-connection'
)

# context contains:
# {
#     'is_guest': bool,
#     'user_email': str or None,
#     'project_result': dict or None
# }
```

### Usage in ViewSets

**Example for any parent module (shear_connection, moment_connection, etc.):**

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.core.utils.module_helpers import handle_design_request
from .registry import MyModuleRegistry

class MyModuleViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        # Get service from registry
        ServiceClass = MyModuleRegistry.get_service_by_slug(submodule_slug)
        if not ServiceClass:
            return Response({'error': 'Module not found'}, status=404)
        
        # Extract inputs
        inputs = request.data.get('inputs', request.data)
        project_id = request.data.get('project_id')
        
        # Handle auth and project saving (shared logic)
        context = handle_design_request(
            request=request,
            inputs=inputs,
            project_id=project_id,
            submodule_slug=submodule_slug,
            module_name='my-module'  # e.g., 'moment-connection'
        )
        
        try:
            # Call service
            result = ServiceClass.calculate(
                inputs=inputs,
                request=request,
                project_id=project_id if not context['is_guest'] else None,
                user_email=context['user_email']
            )
            
            # Add project result to response
            if context['project_result']:
                result['project_saved'] = context['project_result']['saved']
                if context['project_result'].get('project_id'):
                    result['project_id'] = context['project_result']['project_id']
                if context['project_result'].get('error'):
                    result['project_error'] = context['project_result']['error']
            
            return Response(result, status=200)
        except Exception as e:
            return Response({'error': str(e), 'success': False}, status=400)
```

### Benefits

1. **DRY Principle**: No code duplication across modules
2. **Consistency**: All modules handle auth/projects the same way
3. **Maintainability**: Fix bugs or add features in one place
4. **Testability**: Test shared logic once, reuse everywhere

