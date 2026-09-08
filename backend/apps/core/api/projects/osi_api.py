from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.core.permissions import IsEmailVerified, IsEmailVerifiedIfAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.core.files.base import ContentFile

from apps.core.models import OsiFile
from apps.core.serializers import OsiFileSerializer
from apps.core.utils.osi_files import build_osi_payload, make_osifile_contentfile, parse_osi
from apps.core.models import Project


@method_decorator(csrf_exempt, name='dispatch')
class SaveOsiFromInputs(APIView):
    permission_classes = [IsEmailVerifiedIfAuthenticated]  # Allow guests to generate OSI, but require verified email if logged in

    def post(self, request):
        try:
            name = request.data.get('name')
            module_id = request.data.get('module_id')
            inputs = request.data.get('inputs')

            payload = build_osi_payload(name=name, module_id=module_id, inputs=inputs or {})
            
            import base64
            content_file = make_osifile_contentfile(payload)
            content_bytes = content_file.read()
            content_base64 = base64.b64encode(content_bytes).decode('ascii')
            safe_name = (name or 'project').replace(' ', '_')[:50]
            filename = f"{safe_name}_{module_id}.osi"
            
            return JsonResponse({
                'success': True,
                'is_guest': True,
                'filename': filename,
                'content_base64': content_base64,
                'message': 'OSI file generated. Download available.'
            }, safe=False, status=200)
        except Exception as e:
            print('Error in SaveOsiFromInputs:', e)
            return JsonResponse({'success': False, 'error': str(e)}, safe=False, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class OpenOsiUpload(APIView):
    # Allow OSI load without auth so inputs can be populated directly
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            # Optional policy: guests may open uploads read-only; configurable. For now allow.
            uploaded = request.FILES.get('file')
            if not uploaded:
                return JsonResponse({'success': False, 'error': 'No file provided under field "file"'}, safe=False, status=400)

            content = uploaded.read().decode('utf-8', errors='replace')
            module_id, name, inputs = parse_osi(content)
            # Map to new response contract as well
            mapped = {
                'success': True,
                'module_id': module_id,
                'name': name,
                'inputs': inputs,
                'module': None,
                'submodule': module_id,
                'inputs_json': inputs,
            }
            return JsonResponse(mapped, safe=False)
        except Exception as e:
            print('Error in OpenOsiUpload:', e)
            return JsonResponse({'success': False, 'error': str(e)}, safe=False, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class OpenOsiById(APIView):
    permission_classes = [IsEmailVerified]

    def get(self, request, osifile_id):
        try:
            osifile = OsiFile.objects.get(id=osifile_id)
            # permission: only owner can read if owner_email set
            owner_email = osifile.owner_email
            requester_email = getattr(request.user, 'email', None)
            if not requester_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                requester_email = request.auth.get('email')
            if owner_email and requester_email != owner_email:
                return JsonResponse({'success': False, 'error': 'Access denied'}, safe=False, status=403)
            content = osifile.file.read().decode('utf-8', errors='replace')
            module_id, name, inputs = parse_osi(content)
            return JsonResponse({'success': True, 'module_id': module_id, 'name': name, 'inputs': inputs, 'module': None, 'submodule': module_id, 'inputs_json': inputs, 'url': osifile.file.url}, safe=False)
        except OsiFile.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'OSI file not found'}, safe=False, status=404)
        except Exception as e:
            print('Error in OpenOsiById:', e)
            return JsonResponse({'success': False, 'error': str(e)}, safe=False, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class ModuleRoutes(APIView):
    def get(self, request):
        # central mapping (backend source of truth) used by frontend to route modules
        routes = {
            'fp': '/design/connections/shear/fin_plate',
            'ca': '/design/connections/shear/cleat_angle',
            'ep': '/design/connections/shear/end_plate',
            'sa': '/design/connections/shear/seatAngle',
            'cpb': '/design/connections/beam-to-beam-splice/cover_plate_bolted',
            'cpw': '/design/connections/beam-to-beam-splice/cover_plate_welded',
            'boltedtoendplate': '/design/tension-member/bolted_to_end_gusset',
            'ssb': '/design/FlexureMember/simply_supported_beam',
        }
        return JsonResponse({'success': True, 'routes': routes}, safe=False)


@method_decorator(csrf_exempt, name='dispatch')
class ProjectOsiDownload(APIView):
    permission_classes = [IsEmailVerified]

    def get(self, request, project_id):
        try:
            # Determine requester email
            requester_email = getattr(request.user, 'email', None)
            if not requester_email and hasattr(request, 'auth') and isinstance(request.auth, dict):
                requester_email = request.auth.get('email')

            project = Project.objects.get(id=project_id, user_email=requester_email)

            inputs = getattr(project, 'inputs_json', None) or {}
            module_id = getattr(project, 'submodule', None) or getattr(project, 'module', None) or 'FinPlateConnection'

            payload = build_osi_payload(name=project.name or 'project', module_id=module_id, inputs=inputs)
            content_file = make_osifile_contentfile(payload)

            safe_name = (project.name or 'project').replace(' ', '_')[:50]
            filename = f"{safe_name}.osi"

            from django.http import HttpResponse
            resp = HttpResponse(content_file.read(), content_type='text/plain')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp
        except Project.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Project not found or access denied'}, safe=False, status=404)
        except Exception as e:
            print('Error generating OSI for project:', e)
            return JsonResponse({'success': False, 'error': str(e)}, safe=False, status=400)

