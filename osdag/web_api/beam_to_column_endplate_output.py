from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api
from django.http import HttpResponse, HttpRequest
from osdag_api.modules.beam_column_end_plate import *
from osdag_api.errors import MissingKeyError, InvalidInputTypeError, OsdagApiException
import logging
import traceback
import json

# importing from DRF
from rest_framework.response import Response
from rest_framework import status

# importing models
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material
from osdag.models import Design

# importing serializers
from osdag.serializers import Design_Serializer

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
# Create handlers
c_handler = logging.StreamHandler()
f_handler = logging.FileHandler('beam_column_endplate.log')
c_handler.setLevel(logging.DEBUG)
f_handler.setLevel(logging.DEBUG)
# Create formatters and add it to handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
c_handler.setFormatter(formatter)
f_handler.setFormatter(formatter)
# Add handlers to the logger
logger.addHandler(c_handler)
logger.addHandler(f_handler)

"""
    Author : Raghav Sharma ( FOSSEE'25 )

    Example input:
    {
        "Bolt.Bolt_Hole_Type": "Standard",
        "Bolt.Diameter": [
            "8", "10", "12", "14", "16", "18", "20", "22", "24", "27", "30",
            "33", "36", "39", "42", "45", "48", "52", "56", "60", "64"
        ],
        "Bolt.Grade": [
            "3.6", "4.6", "4.8", "5.6", "5.8", "6.8", "8.8", "9.8", "10.9", "12.9"
        ],
        "Bolt.Slip_Factor": "0.3",
        "Bolt.TensionType": "Pre-tensioned",
        "Bolt.Type": "Bearing Bolt",
        "Connectivity": "Column-Flange-Beam-Web",
        "EndPlateType": "Flushed - Reversible",
        "Connector.Material": "E 165 (Fe 290)",
        "Design.Design_Method": "Limit State Design",
        "Detailing.Corrosive_Influences": "No",
        "Detailing.Edge_type": "Rolled, machine-flame cut, sawn and planed",
        "Detailing.Gap": "10",
        "Load.Axial": "0",
        "Load.Shear": "2",
        "Load.Moment": "2",
        "Material": "E 165 (Fe 290)",
        "Member.Supported_Section.Designation": "JB 150",
        "Member.Supported_Section.Material": "E 165 (Fe 290)",
        "Member.Supporting_Section.Designation": "HB 150",
        "Member.Supporting_Section.Material": "E 165 (Fe 290)",
        "Module": "Beam-to-Column End Plate Connection",
        "Weld.Fab": "Shop Weld",
        "Weld.Material_Grade_OverWrite": "410",
        "Weld.Type": "Groove Weld",
        "Connector.Plate.Thickness_List": [
            "8", "10", "12", "14", "16", "18", "20", "22", "25", "28", "32",
            "36", "40", "45", "50", "56", "63", "75", "80", "90", "100", "110", "120"
        ]
    }
"""


@method_decorator(csrf_exempt, name='dispatch')
class BeamToColumnEndPlateOutputData(APIView):
    def post(self, request):
        # Get input values and module from request
        input_values = request.data
        module_name = input_values.get('Module', 'Beam-to-Column-End-Plate-Connection')
        
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