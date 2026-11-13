from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from django.http import FileResponse, JsonResponse
import os
import uuid
from apps.core.utils.api_errors import error_json_response

class CADDownload(APIView):
    def post(self, request):
        try:
            # Parse format, section, and request_id from JSON body
            # data = JSONParser().parse(request)
            data = request.data
            format_type = data.get('format')
            section = data.get('section')
            request_id = data.get('request_id')  # Use request_id instead of session

            # If no request_id provided, generate a unique one for this request
            if not request_id:
                request_id = str(uuid.uuid4())

            if not format_type or not section:
                return error_json_response('missing_field', "Missing required parameters.", 400)

            allowed_formats = ["obj", "brep", "step", "iges"]
            if format_type.lower() not in allowed_formats:
                return error_json_response('invalid_format', "Invalid format type requested.", 400)

            # Path setup
            if format_type == "obj":
                file_path = os.path.join("frontend", "public", f"output-{section.lower()}.obj")
            else:
                file_path = os.path.join("file_storage", "cad_models", f"{request_id}_{section}.{format_type.lower()}")

            if not os.path.exists(file_path):
                return error_json_response('file_not_found', f"{format_type.upper()} file does not exist.", 404)

            # Serve file
            response = FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{request_id}_{section}.{format_type}"'
            return response

        except Exception as e:
            print(f"Download CAD error: {e}")
            return error_json_response('internal_error', "Internal server error", 500)
