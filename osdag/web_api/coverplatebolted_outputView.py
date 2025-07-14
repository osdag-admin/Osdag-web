from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api
from django.http import HttpResponse, HttpRequest
from osdag_api.modules.cover_plate_bolted_connection import *

# importing from DRF
from rest_framework.response import Response
from rest_framework import status

# importing models
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material
from osdag.models import Design

# importing serializers
from osdag.serializers import Design_Serializer

@method_decorator(csrf_exempt, name='dispatch')
class CoverPlateBoltedOutputData(APIView):

    def post(self, request):
        # Get input values and module from request
        input_values = request.data
        module_name = input_values.get('Module', 'Cover-Plate-Bolted-Connection')
        
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
    
    
    def combine_logs(self , logs) : 
        # the logs here is an array of objects 
        # this function extracts the objects to string and combines them into a single string 
        # also converting the type key value to upper case 
        finalLogsString = ""
        #print('temp :  ', logs[0])

        for item in logs : 
            print('item : ' , item)
            print('item.keys : ' , item.keys())
            msg = item['msg']
            finalLogsString = finalLogsString + msg + '\n'

        print('finalLogsString : ' , finalLogsString)
        return finalLogsString 

    def check_non_zero_output(self , output): 
        flag = False
        for item in output : 
            # comparing the float values 
            if(abs(output[item]['value'] - 0.0 ) > 1e-9) : 
                flag = True
                break
        
        return flag

