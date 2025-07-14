from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api

# importing from DRF
from rest_framework.response import Response
from rest_framework import status

# importing models
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material
from osdag.models import Design

# importing serializers
from osdag.serializers import Design_Serializer

"""
    Author : Sai Charan ( FOSSEE'23 )

    Example input:
    {
        "Bolt.Bolt_Hole_Type" : "Standard",
        "Bolt.Diameter" : ["12" , "16" , "20" , "24" , "30"],
        "Bolt.Grade" : ["4.6" , "4.8" , "5.6" , "6.8" , "8.8"],
        "Bolt.Slip_Factor" : "0.3",
        "Bolt.TensionType" : "Pre-tensioned",
        "Bolt.Type" : "Friction Grip Bolt",
        "Connectivity" : "Flange-Beam Web",
        "Connector.Material" : "E 250 (Fe 410 W)A",
        "Design.Design_Method" : "Limit State Design",
        "Detailing.Corrosive_Influences" : "No",
        "Detailing.Edge_type" : "Rolled",
        "Detailing.Gap" : "15",
        "Load.Axial" : "50",
        "Load.Shear" : "180",
        "Material" : "E 250 (Fe 410 W)A",
        "Member.Supported_Section.Designation" : "MB 350",
        "Member.Supported_Section.Material" : "E 250 (Fe 410 W)A",
        "Member.Supporting_Section.Designation" : "JB 150",
        "Member.Supporting_Section.Material" : "E 250 (Fe 410 W)A",
        "Module" : "End Plate Connection",
        "Weld.Fab" : "Shop Weld",
        "Weld.Material_Grade_OverWrite" : "410",
        "Connector.Plate.Thickness_List" : ["10" , "12" , "16" , "18" , "20"],
        "KEY_CONNECTOR_MATERIAL": "E 250 (Fe 410 W)A",
        "KEY_DP_WELD_MATERIAL_G_O": "E 250 (Fe 410 W)A"
    }
"""


@method_decorator(csrf_exempt, name='dispatch')
class EndPLateOutputData(APIView):

    def post(self, request):
        print("Inside post method of EndPLateOutputData")

        # Get input values and module from request
        input_values = request.data
        module_name = input_values.get('Module', 'End-Plate-Connection')
        
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
            try:
                output, logs = module_api.generate_output(input_values)
            except Exception as e : 
                print('e : ' , e)
                print('Error in generating the output and logs')
            
            for log in logs:
                # removing duplicates
                if log not in new_logs:
                    new_logs.append(log)

        except Exception as e:
            print('Exception raised : ' , e)
            return JsonResponse({"data": {}, "logs": new_logs,
                                "success": False, "error": str(e)}, safe=False , status = 400)
        
        print('new_logs : ' , new_logs)
        print('type of new_logs : ' , type(new_logs))

        return JsonResponse({"data": output, "logs": new_logs, "success": True}, safe=False , status = 201)

