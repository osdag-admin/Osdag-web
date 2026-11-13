from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsEmailVerified
from django.http import HttpResponse
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder
from apps.core.models import Project, CustomMaterials
from apps.core.utils.api_errors import error_response
import json
import logging

logger = logging.getLogger(__name__)

class ExportUserDataAPIView(APIView):
    """
    Endpoint for users to bulk export all of their personal data (data portability).
    Queries projects and custom materials using optimized values queries and returns them in JSON.
    """
    permission_classes = [IsAuthenticated, IsEmailVerified]

    def get(self, request):
        user_email = request.user.email
        if not user_email:
            # Fallback to claim email if auth has it
            if hasattr(request, 'auth') and isinstance(request.auth, dict):
                user_email = request.auth.get('email')
        
        if not user_email:
            return error_response('missing_email', "No email address found for the authenticated user.", 400)

        try:
            # 1. Fetch user projects efficiently (skipping heavy model instantiations)
            projects = list(Project.objects.filter(user_email=user_email).values(
                'id', 'name', 'module', 'submodule', 'inputs_json', 'outputs_json', 'created_at', 'updated_at'
            ))

            # 2. Fetch custom materials
            custom_materials = list(CustomMaterials.objects.filter(user=request.user).values(
                'id', 'Grade', 'Yield_Stress_less_than_20', 'Yield_Stress_between_20_and_neg40',
                'Yield_Stress_greater_than_40', 'Ultimate_Tensile_Stress', 'Elongation'
            ))

            # 3. Build the export payload
            export_payload = {
                "exported_at": timezone.now(),
                "user": {
                    "email": user_email,
                    "username": request.user.username,
                },
                "projects": projects,
                "custom_materials": custom_materials
            }

            # 4. Serialize to JSON using Django's encoder (handles dates/datetimes)
            serialized_data = json.dumps(export_payload, cls=DjangoJSONEncoder, indent=2)

            # 5. Build and return the attachment file response
            response = HttpResponse(serialized_data, content_type='application/json')
            filename = f"osdag_user_data_{user_email.split('@')[0]}.json"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            logger.info(f"User data exported successfully for: {user_email}")
            return response

        except Exception as e:
            logger.error(f"Error during user data export for {user_email}: {e}", exc_info=True)
            return error_response('internal_error', f"Failed to generate data export: {str(e)}", 500)
