from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from apps.core.models import Project
from apps.core.permissions import IsEmailVerified
import json

@method_decorator(csrf_exempt, name='dispatch')
class ProjectAPI(APIView):
    """API for managing user projects"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user-specific projects (for recent projects list)"""
        try:
            # if not request.user or not request.user.is_authenticated:
            #     return JsonResponse({'success': False, 'error': 'Authentication required'}, safe=False, status=401)

            # Disallow guest users from listing projects (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot access projects'}, safe=False, status=403)

            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')
            # Filter projects by user
            projects = Project.objects.filter(user_email=user_email).order_by('-updated_at')[:10]
            print(f"Found {projects.count()} projects for user {user_email}")
            
            project_list = []
            for project in projects:
                project_list.append({
                    'id': project.id,
                    'name': project.name,
                    'module': getattr(project, 'module', None),
                    'submodule': getattr(project, 'submodule', None),
                    # keep legacy field for existing frontend behavior
                    'module_id': getattr(project, 'submodule', None),
                    'osi_file_path': project.osi_file_path,
                    'created_at': project.created_at.isoformat(),
                    'updated_at': project.updated_at.isoformat(),
                })
            
            print(f"Returning {len(project_list)} projects")
            return JsonResponse({
                'success': True,
                'projects': project_list
            }, safe=False)
            
        except Exception as e:
            print(f"Error getting projects: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400)
    
    def post(self, request):
        """Create a new project"""
        try:
            # Check email verification status (set by FirebaseAuthentication middleware)
            email_verified = getattr(request, 'email_verified', False)
            if not email_verified:
                return JsonResponse({
                    'success': False, 
                    'error': 'Please verify your email to create projects. Check your inbox for the verification link.'
                }, safe=False, status=403)

            # Disallow guest users from creating projects (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot create projects'}, safe=False, status=403)

            data = request.data
            print(f"Creating project with data: {data}")
            
            # Validate required fields
            required_fields = ['name']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, safe=False, status=400)
            
            # Determine user email from authenticated user or JWT claims
            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')
            if not user_email:
                return JsonResponse({'success': False, 'error': 'Authenticated user email not found'}, safe=False, status=400)

            # Create new project with user email
            project = Project.objects.create(
                name=data['name'],
                module=data.get('module'),
                submodule=data.get('submodule') or data.get('module_id'),
                inputs_json=data.get('inputs_json'),
                outputs_json=data.get('outputs_json'),
                osi_file_path=data.get('osi_file_path'),
                user_email=user_email
            )
            
            return JsonResponse({
                'success': True,
                'project_id': project.id,
                'message': 'Project created successfully'
            }, safe=False, status=201)
            
        except Exception as e:
            print(f"Error creating project: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ProjectDetailAPI(APIView):
    """API for individual project operations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, project_id):
        """Get a specific project"""
        try:
            # if not request.user or not request.user.is_authenticated:
            #     return JsonResponse({'success': False, 'error': 'Authentication required'}, safe=False, status=401)
            # Disallow guest users from reading projects (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot access projects'}, safe=False, status=403)
            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')
            
            # Get project and verify ownership
            project = Project.objects.get(id=project_id, user_email=user_email)
            print(f"Found project: {project.name}")
            
            return JsonResponse({
                'success': True,
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'module': getattr(project, 'module', None),
                    'submodule': getattr(project, 'submodule', None),
                    'module_id': getattr(project, 'submodule', None),
                    'inputs_json': getattr(project, 'inputs_json', None),
                    'outputs_json': getattr(project, 'outputs_json', None),
                    'osi_file_path': project.osi_file_path,
                    'created_at': project.created_at.isoformat(),
                    'updated_at': project.updated_at.isoformat()
                }
            }, safe=False)
            
        except Project.DoesNotExist:
            print(f"Project {project_id} not found or access denied")
            return JsonResponse({
                'success': False,
                'error': 'Project not found or access denied'
            }, safe=False, status=404)
        except Exception as e:
            print(f"Error getting project {project_id}: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400)
    
    def put(self, request, project_id):
        """Update project data (name, inputs_json, osi_file_path)"""
        try:
            # Check email verification status (set by FirebaseAuthentication middleware)
            email_verified = getattr(request, 'email_verified', False)
            if not email_verified:
                return JsonResponse({
                    'success': False, 
                    'error': 'Please verify your email to save projects. Check your inbox for the verification link.'
                }, safe=False, status=403)

            # Disallow guest users from updating projects (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot update projects'}, safe=False, status=403)
            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')

            print(f"Project API PUT - Project ID: {project_id}, User email: {user_email}")
            print(f"Request data: {request.data}")
            
            # Get project and verify ownership
            project = Project.objects.get(id=project_id, user_email=user_email)
            data = request.data
            
            print(f"Found project: {project.name}")
            print(f"Updating with data: {data}")
            
            # Update fields if provided
            if 'name' in data:
                project.name = data['name']
            if 'module' in data:
                project.module = data['module']
            if 'submodule' in data or 'module_id' in data:
                project.submodule = data.get('submodule') or data.get('module_id')
            if 'inputs_json' in data:
                project.inputs_json = data['inputs_json']
            if 'outputs_json' in data:
                project.outputs_json = data['outputs_json']
            if 'osi_file_path' in data:
                project.osi_file_path = data['osi_file_path']
            
            project.save()
            print(f"Project {project_id} updated successfully")
            
            return JsonResponse({
                'success': True,
                'message': 'Project updated successfully'
            }, safe=False)
            
        except Project.DoesNotExist:
            print(f"Project {project_id} not found or access denied")
            return JsonResponse({
                'success': False,
                'error': 'Project not found or access denied'
            }, safe=False, status=404)
        except Exception as e:
            print(f"Error updating project {project_id}: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400)
    
    def delete(self, request, project_id):
        """Delete a project"""
        try:
            # if not request.user or not request.user.is_authenticated:
            #     return JsonResponse({'success': False, 'error': 'Authentication required'}, safe=False, status=401)
            # Disallow guest users from deleting projects (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot delete projects'}, safe=False, status=403)
            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')
            
            # Get project and verify ownership
            project = Project.objects.get(id=project_id, user_email=user_email)
            project.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Project deleted successfully'
            }, safe=False)
            
        except Project.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Project not found or access denied'
            }, safe=False, status=404)
        except Exception as e:
            print(f"Error deleting project {project_id}: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400) 

@method_decorator(csrf_exempt, name='dispatch')
class ProjectByNameAPI(APIView):
    """API for finding and updating projects by name"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, project_name):
        """Get a specific project by name"""
        try:
            # if not request.user or not request.user.is_authenticated:
            #     return JsonResponse({'success': False, 'error': 'Authentication required'}, safe=False, status=401)
            # Disallow guest users from reading projects by name (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot access projects'}, safe=False, status=403)
            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')
            
            # Get project by name and verify ownership
            project = Project.objects.get(name=project_name, user_email=user_email)
            print(f"Found project: {project.name}")
            
            return JsonResponse({
                'success': True,
                'data': {
                    'id': project.id,
                    'name': project.name,
                    'osi_file_path': project.osi_file_path,
                    'created_at': project.created_at.isoformat(),
                    'updated_at': project.updated_at.isoformat()
                }
            }, safe=False)
            
        except Project.DoesNotExist:
            print(f"Project '{project_name}' not found or access denied")
            return JsonResponse({
                'success': False,
                'error': 'Project not found or access denied'
            }, safe=False, status=404)
        except Exception as e:
            print(f"Error getting project '{project_name}': {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400) 

    def put(self, request, project_name):
        """Update project data (name, osi_file_path) by name"""
        try:
            # if not request.user or not request.user.is_authenticated:
            #     return JsonResponse({'success': False, 'error': 'Authentication required'}, safe=False, status=401)
            # Disallow guest users from updating projects by name (guests don't send authentication tokens)
            if not (hasattr(request, 'user') and request.user.is_authenticated):
                return JsonResponse({'success': False, 'error': 'Guest users cannot update projects'}, safe=False, status=403)
            user_email = getattr(request.user, 'email', None)
            if not user_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')

            # Get project and verify ownership by name
            project = Project.objects.get(name=project_name, user_email=user_email)
            data = request.data

            # Update fields if provided
            if 'name' in data:
                project.name = data['name']
            if 'osi_file_path' in data:
                project.osi_file_path = data['osi_file_path']
            project.save()
            return JsonResponse({
                'success': True,
                'message': 'Project updated successfully'
            }, safe=False)
        except Project.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Project not found or access denied'
            }, safe=False, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, safe=False, status=400) 
