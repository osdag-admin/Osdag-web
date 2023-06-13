
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api
from django.http import HttpResponse, HttpRequest
from osdag_api.modules.fin_plate_connection import *

# importing models
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material

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
        "Module" : "Fin Plate Connection",
        "Weld.Fab" : "Shop Weld",
        "Weld.Material_Grade_OverWrite" : "410",
        "Connector.Plate.Thickness_List" : ["10" , "12" , "16" , "18" , "20"],
        "KEY_CONNECTOR_MATERIAL": "E 250 (Fe 410 W)A",
        "KEY_DP_WELD_MATERIAL_G_O": "E 250 (Fe 410 W)A"
    }
"""


@method_decorator(csrf_exempt, name='dispatch')
class OutputData(APIView):

    def post(self, request):
        print("Inside post method of OutputData")

        module_api = get_module_api('Fin Plate Connection')

        print(module_api)

        # validate_input(())

        try:
            output = module_api.generate_ouptut(request.data)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500)

        return JsonResponse({"data": output, "success": True}, safe=False)
