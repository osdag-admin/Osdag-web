from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api

@method_decorator(csrf_exempt, name='dispatch')
class SimplySupportedBeamOutputData(APIView):
    def post(self, request):
        input_values = request.data
        module_name = input_values.get('Module', 'Simply-Supported-Beam')
        print('in simplysupportedbeam_outputView.py: Processing request for module:', module_name)
        print('in simplysupportedbeam_outputView.py: Input values keys:', list(input_values.keys()))
        print('in simplysupportedbeam_outputView.py: Module field value:', input_values.get('Module', 'NOT_FOUND'))
        required_fields = ["Member.Profile", "Member.Designation", "Material", "Module"]
        missing_fields = [field for field in required_fields if field not in input_values]
        if missing_fields:
            print('in simplysupportedbeam_outputView.py: Missing required fields:', missing_fields)
        try:
            module_api = get_module_api(module_name)
        except Exception as e:
            print('in simplysupportedbeam_outputView.py: Error getting module API:', e)
            return JsonResponse({"data": {}, "logs": [], "success": False, "error": "Module not found"}, safe=False, status=400)
        output = {}
        logs = []
        new_logs = []
        try:
            print('in simplysupportedbeam_outputView.py: Trying to generate output')
            output, logs = module_api.generate_output(input_values)
            print('in simplysupportedbeam_outputView.py: Output generated successfully')
            for log in logs:
                if log not in new_logs:
                    new_logs.append(log)
        except Exception as e:
            print('in simplysupportedbeam_outputView.py: Exception raised:', e)
            return JsonResponse({"data": {}, "logs": new_logs, "success": False, "error": str(e)}, safe=False, status=400)
        print('in simplysupportedbeam_outputView.py: Returning final response')
        return JsonResponse({"data": output, "logs": new_logs, "success": True}, safe=False, status=201) 