"""
Shared utilities for module endpoints
Handles authentication, guest mode, and project saving logic
Used by all parent module ViewSets (shear_connection, moment_connection, etc.)
"""
from typing import Optional, Dict, Any
from django.http import HttpRequest
from apps.core.models import Project


def is_guest_user(request: HttpRequest) -> bool:
    """
    Check if the current user is a guest user.
    Guests don't send authentication tokens, so they are unauthenticated.
    
    Args:
        request: Django HTTP request object
        
    Returns:
        bool: True if user is guest, False otherwise
    """
    return not (hasattr(request, 'user') and request.user.is_authenticated)


def get_user_email(request: HttpRequest) -> Optional[str]:
    """
    Get user email from request (JWT token or user object).
    
    Args:
        request: Django HTTP request object
        
    Returns:
        str or None: User email if available, None otherwise
    """
    user_email = getattr(request.user, 'email', None)
    if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
        user_email = request.auth.get('email')
    return user_email


def save_to_project(
    project_id: int,
    user_email: str,
    inputs: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Save design inputs to a project in the database.

    The project's module was set when it was created, and Recent Projects opens it by that
    module id, so saving inputs must not change it.
    
    Args:
        project_id: ID of the project to update
        user_email: Email of the project owner (for verification)
        inputs: Design input parameters (JSON-serializable dict)
        
    Returns:
        dict: Result dictionary with 'saved', 'project_id', and optional 'error' keys
    """
    try:
        project = Project.objects.get(id=project_id, user_email=user_email)
        
        # Update project with latest inputs
        project.inputs_json = inputs
        project.save(update_fields=['inputs_json', 'updated_at'])
        
        return {
            'saved': True,
            'project_id': project_id
        }
    except Project.DoesNotExist:
        return {
            'saved': False,
            'project_id': project_id,
            'error': 'Project not found or access denied'
        }
    except Exception as e:
        return {
            'saved': False,
            'project_id': project_id,
            'error': str(e)
        }


def handle_design_request(
    request: HttpRequest,
    inputs: Dict[str, Any],
    project_id: Optional[int],
    submodule_slug: str,
    module_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Handle authentication and project saving logic for design requests.
    This is a convenience function that combines guest checking and project saving.
    
    Args:
        request: Django HTTP request object
        inputs: Design input parameters
        project_id: Optional project ID to save to
        submodule_slug: URL slug of the sub-module
        module_name: Optional parent module name
        
    Returns:
        dict: Context dictionary with:
            - 'is_guest': bool
            - 'user_email': str or None
            - 'project_result': dict (if project_id provided)
    """
    is_guest = is_guest_user(request)
    user_email = get_user_email(request) if not is_guest else None
    
    context = {
        'is_guest': is_guest,
        'user_email': user_email,
        'project_result': None
    }
    
    # Handle project saving if project_id provided and user is authenticated
    if project_id:
        if is_guest:
            context['project_result'] = {
                'saved': False,
                'project_id': project_id,
                'error': 'Guest users cannot save to projects'
            }
        elif user_email:
            context['project_result'] = save_to_project(
                project_id=project_id,
                user_email=user_email,
                inputs=inputs,
            )
        else:
            context['project_result'] = {
                'saved': False,
                'project_id': project_id,
                'error': 'User email not found'
            }
    
    return context


from rest_framework.response import Response
from rest_framework import status
from apps.core.tasks import run_design_calculation_task, run_report_generation_task
from apps.core.osdag_overrides import unknown_material_error, user_id_from_request
from apps.core.utils.api_errors import error_response


def _unknown_material_response(inputs, user_id):
    """400 response when a material grade cannot be resolved, else None."""
    error = unknown_material_error(inputs, user_id)
    if error:
        return error_response('bad_request', error, status.HTTP_400_BAD_REQUEST, success=False)
    return None


def trigger_async_design(module_name: str, submodule_slug: str, ServiceClass, request) -> Response:
    """
    Triggers asynchronous design calculations using Celery.
    """
    if not ServiceClass:
        return error_response('submodule_not_found', f'Sub-module {submodule_slug} not found', 404)

    inputs = request.data.get('inputs', request.data)
    project_id = request.data.get('project_id')
    user_id = user_id_from_request(request)

    material_error = _unknown_material_response(inputs, user_id)
    if material_error:
        return material_error

    context = handle_design_request(
        request=request,
        inputs=inputs,
        project_id=project_id,
        submodule_slug=submodule_slug,
        module_name=module_name
    )
    
    task = run_design_calculation_task.delay(
        module_name=module_name,
        submodule_slug=submodule_slug,
        inputs=inputs,
        project_id=project_id if not context.get('is_guest') else None,
        user_email=context.get('user_email'),
        user_id=user_id,
    )
    
    response_data = {
        "success": True,
        "task_id": task.id,
        "status": "PENDING"
    }
    
    if context.get('project_result'):
        response_data['project_saved'] = context['project_result'].get('saved')
        if context['project_result'].get('project_id'):
            response_data['project_id'] = context['project_result']['project_id']
        if context['project_result'].get('error'):
            response_data['project_error'] = context['project_result']['error']
            
    return Response(response_data, status=status.HTTP_202_ACCEPTED)


def trigger_async_report(module_name: str, submodule_slug: str, module_id_map: dict, request) -> Response:
    """
    Triggers asynchronous LaTeX report generation using Celery.
    """
    module_id = module_id_map.get(submodule_slug) if module_id_map else submodule_slug
    if not module_id:
        return error_response('unsupported_report', f"Report generation is not supported for {module_name} sub-module '{submodule_slug}'", status.HTTP_400_BAD_REQUEST, success=False)

    input_values = request.data.get("input_values") or request.data.get("inputs")
    if not input_values:
        return error_response('missing_field', "input_values are required", status.HTTP_400_BAD_REQUEST, success=False)

    user_id = user_id_from_request(request)
    material_error = _unknown_material_response(input_values, user_id)
    if material_error:
        return material_error

    mapped_data = {
        "module_id": module_id,
        "input_values": input_values,
        "metadata": request.data.get("metadata"),
        "design_status": request.data.get("design_status", True),
        "logs": request.data.get("logs", []),
    }

    if "sections" in request.data:
        mapped_data["sections"] = request.data.get("sections")
    if "customization" in request.data:
        mapped_data["customization"] = request.data.get("customization")
    if "images" in request.data:
        mapped_data["images"] = request.data.get("images")

    task = run_report_generation_task.delay(mapped_data, user_id=user_id)
    
    return Response({
        "success": True,
        "task_id": task.id,
        "status": "PENDING"
    }, status=status.HTTP_202_ACCEPTED)


