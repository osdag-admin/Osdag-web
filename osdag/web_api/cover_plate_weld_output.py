from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api
from django.http import HttpResponse, HttpRequest
from osdag_api.modules.cover_plate_welded_connection import *

# importing from DRF
from rest_framework.response import Response
from rest_framework import status

# importing models
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material
from osdag.models import Design

# importing serializers
from osdag.serializers import Design_Serializer
"""
Author : Raghav Sharma ( FOSSEE'25 )

Example input:
{
    INPUT VALUES :  {
         'Module': 'Cover Plate Welded',
         'Section.Designation': 'JB 175',
         'Section.Material': 'E 250 (Fe 410 W)A',
         'Weld.Type': 'Fillet Weld',
         'Load.Moment': '10',
         'Load.Shear': '15',
         'Load.Axial': '20',
         'FlangePlate.Preference': 'Outside',
         'FlangePlate.Thickness': [],
         'WebPlate.Thickness': [],
         'Design.DesignMethod': 'Limit State Design',
         'Weld.Fab': 'Shop Weld',
         'Weld.MaterialGrade': '410'
    }
}
"""


@method_decorator(csrf_exempt, name='dispatch')
class CoverPlateWeldedOutputData(APIView):
    def post(self, request):
        # Get input values and module from request
        input_values = request.data
        module_name = input_values.get('Module', 'Cover-Plate-Welded-Connection')
        
        print('Module name:', module_name)
        print('Input values received:', input_values)
        
        # Get module API
        try:
            module_api = get_module_api(module_name)
        except Exception as e:
            print('Error getting module API:', e)
            return JsonResponse({"data": {}, "logs": [], "success": False, "error": "Module not found"}, safe=False, status=400)

        output = {}
        logs = []
        new_logs = []
        
        try:
            output, logs = module_api.generate_output(input_values)
            for log in logs:
                if log not in new_logs:
                    new_logs.append(log)
        except Exception as e:
            print('Exception raised:', e)
            return JsonResponse({"data": {}, "logs": new_logs, "success": False, "error": str(e)}, safe=False, status=400)

        return JsonResponse({"data": output, "logs": new_logs, "success": True}, safe=False, status=201)

    def combine_logs(self, logs):
        # Match bolted connection log format
        finalLogsString = ""
        for item in logs:
            msg = item['msg']
            finalLogsString = finalLogsString + msg + '\n'
        return finalLogsString

    def check_output_validity(self, output):
        # Check weld-specific outputs in addition to general checks
        if not output:
            return False
            
        required_keys = [
            'Weld.Size',
            'Weld.Length',
            'Weld.Strength'
        ]
        
        # Check if required weld outputs exist and are non-zero
        for key in required_keys:
            if key not in output:
                return False
            try:
                value = float(output[key]['value'])
                if abs(value) < 1e-9:
                    return False
            except (ValueError, KeyError):
                return False
                
        return True
