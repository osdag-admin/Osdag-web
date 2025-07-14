from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag.models import Project
import json

@method_decorator(csrf_exempt, name='dispatch')
class ProjectAPI(APIView):
    """API for managing user projects"""
    
    def get(self, request):
        """Get user-specific projects (for recent projects list)"""
        try:
            # Get user email from query params only
            user_email = request.GET.get('user_email')
            
            print(f"Project API GET - User email: {user_email}")
            print(f"Request GET params: {dict(request.GET)}")
            
            if not user_email:
                print("No user email provided")
                return JsonResponse({
                    'success': False,
                    'error': 'User email is required'
                }, safe=False, status=400)
            
            # Filter projects by user email
            projects = Project.objects.filter(user_email=user_email).order_by('-updated_at')[:10]
            print(f"Found {projects.count()} projects for user {user_email}")
            
            project_list = []
            for project in projects:
                project_list.append({
                    'id': project.id,
                    'name': project.name,
                    'module_id': project.module_id,
                    'module_name': project.module_name,
                    'created_at': project.created_at.isoformat(),
                    'updated_at': project.updated_at.isoformat(),
                    'has_output': bool(project.output_values),
                    'has_logs': bool(project.logs)
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
            data = request.data
            print(f"Creating project with data: {data}")
            
            # Validate required fields
            required_fields = ['name', 'module_id', 'module_name', 'user_email']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }, safe=False, status=400)
            
            # Create new project with user email
            project = Project.objects.create(
                name=data['name'],
                module_id=data['module_id'],
                module_name=data['module_name'],
                user_email=data['user_email']
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
    
    def get(self, request, project_id):
        """Get a specific project with all its data"""
        try:
            # Get user email from query params only
            user_email = request.GET.get('user_email')
            
            print(f"Project API GET - Project ID: {project_id}, User email: {user_email}")
            
            if not user_email:
                print("No user email provided")
                return JsonResponse({
                    'success': False,
                    'error': 'User email is required'
                }, safe=False, status=400)
            
            # Get project and verify ownership
            project = Project.objects.get(id=project_id, user_email=user_email)
            print(f"Found project: {project.name}")
            print(f"Project has input_values: {bool(project.input_values)}")
            print(f"Project has output_values: {bool(project.output_values)}")
            print(f"Project has logs: {bool(project.logs)}")
            
            return JsonResponse({
                'success': True,
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'module_id': project.module_id,
                    'module_name': project.module_name,
                    'input_values': project.input_values or {},
                    'output_values': project.output_values or {},
                    'logs': project.logs or [],
                    'created_at': project.created_at.isoformat(),
                    'updated_at': project.updated_at.isoformat()
                }
            }, safe=False)
            
        except Project.DoesNotExist:
            print(f"Project {project_id} not found for user {user_email}")
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
        """Update project data (inputs, outputs, logs)"""
        try:
            # Get user email from query params only
            user_email = request.GET.get('user_email')
            
            print(f"Project API PUT - Project ID: {project_id}, User email: {user_email}")
            print(f"Request data: {request.data}")
            
            if not user_email:
                print("No user email provided")
                return JsonResponse({
                    'success': False,
                    'error': 'User email is required'
                }, safe=False, status=400)
            
            # Get project and verify ownership
            project = Project.objects.get(id=project_id, user_email=user_email)
            data = request.data
            
            print(f"Found project: {project.name}")
            print(f"Updating with data: {data}")
            
            # Update fields if provided
            if 'input_values' in data:
                project.input_values = data['input_values']
                if data['input_values'] is not None:
                    print(f"Updated input_values: {len(data['input_values'])} keys")
                else:
                    print("Updated input_values: None")
            if 'output_values' in data:
                project.output_values = data['output_values']
                if data['output_values'] is not None:
                    print(f"Updated output_values: {len(data['output_values'])} keys")
                else:
                    print("Updated output_values: None")
            if 'logs' in data:
                project.logs = data['logs']
                if data['logs'] is not None:
                    print(f"Updated logs: {len(data['logs'])} items")
                else:
                    print("Updated logs: None")
            
            project.save()
            print(f"Project {project_id} updated successfully")
            
            return JsonResponse({
                'success': True,
                'message': 'Project updated successfully'
            }, safe=False)
            
        except Project.DoesNotExist:
            print(f"Project {project_id} not found for user {user_email}")
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
            # Get user email from query params only
            user_email = request.GET.get('user_email')
            
            if not user_email:
                return JsonResponse({
                    'success': False,
                    'error': 'User email is required'
                }, safe=False, status=400)
            
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
    
    def get(self, request, project_name):
        """Get a specific project by name"""
        try:
            # Get user email from query params only
            user_email = request.GET.get('user_email')
            
            print(f"ProjectByName API GET - Project name: {project_name}, User email: {user_email}")
            
            if not user_email:
                print("No user email provided")
                return JsonResponse({
                    'success': False,
                    'error': 'User email is required'
                }, safe=False, status=400)
            
            # Get project by name and verify ownership
            project = Project.objects.get(name=project_name, user_email=user_email)
            print(f"Found project: {project.name}")
            print(f"Project has input_values: {bool(project.input_values)}")
            print(f"Project has output_values: {bool(project.output_values)}")
            print(f"Project has logs: {bool(project.logs)}")
            
            return JsonResponse({
                'success': True,
                'data': {
                    'id': project.id,
                    'name': project.name,
                    'module_id': project.module_id,
                    'module_name': project.module_name,
                    'inputs': project.input_values or {},
                    'output': project.output_values or {},
                    'logs': project.logs or [],
                    'created_at': project.created_at.isoformat(),
                    'updated_at': project.updated_at.isoformat()
                }
            }, safe=False)
            
        except Project.DoesNotExist:
            print(f"Project '{project_name}' not found for user {user_email}")
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
        """Update project data (inputs, outputs, logs) by name"""
        try:
            user_email = request.GET.get('user_email')
            if not user_email:
                return JsonResponse({
                    'success': False,
                    'error': 'User email is required'
                }, safe=False, status=400)

            # Get project and verify ownership by name
            project = Project.objects.get(name=project_name, user_email=user_email)
            data = request.data

            # Update fields if provided
            if 'input_values' in data:
                project.input_values = data['input_values']
            if 'output_values' in data:
                project.output_values = data['output_values']
            if 'logs' in data:
                project.logs = data['logs']
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