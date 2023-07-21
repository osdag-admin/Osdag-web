
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

        # obtaining the session, module_id, input_values
        cookie_id = request.COOKIES.get('fin_plate_connection_session')
        module_api = get_module_api('Fin Plate Connection')
        input_values = request.data
        tempData = {
            'cookie_id': cookie_id,
            'module_id': 'Fin Plate Connection',
            'input_values': input_values
        }
        print('tempData : ', tempData)
        print('type of input_values : ', type(input_values))
        # obtaining the record from the Design model
        designRecord = Design.objects.get(cookie_id=cookie_id)
        serailizer = Design_Serializer(designRecord, data=tempData)

        # checking the validtity of the serializer
        if serailizer.is_valid():
            print('serializer is valid')
            try:  # try saving the serializer
                serailizer.save()
                print('serializer saved')
            except:
                print('Error in saving the serializer')

        else:
            print('serializer is invalid')
            return Response('Serializer is invalid', status=status.HTTP_400_BAD_REQUEST)

        output = {}
        logs = []
        new_logs = []
        try:
            try:
                output, logs = module_api.generate_output(input_values)
            except Exception as e : 
                print('e : ' , e)
                print('Error in generating the output and logs')
            # print('output : ', output)
            # new_logs = []
            for log in logs:
                # removing duplicates
                if log not in new_logs:
                    new_logs.append(log)

            # print('new_logs : ', new_logs)
        except Exception as e:
            print('Exception raised : ' , e)
            return JsonResponse({"data": {}, "logs": new_logs,
                                "success": False}, safe=False , status = 400)
        
        print('new_logs : ' , new_logs)
        print('type of new_logs : ' , type(new_logs))
        finalLogsString = self.combine_logs(new_logs)

        try : 
            # save the logs, output, design_status in the Design table for that specific cookie_id
            designObject = Design.objects.get(cookie_id = cookie_id)
            designObject.logs = finalLogsString
            designObject.output_values = output
            print('output outside the condition  : ', output)
            output_result = self.check_non_zero_output(output)
            print('output_result : ' , output_result)

            if(output is "" or output is 0 or output_result is False) :
                print('output is empty string or output_result is False')
                print('output : ' , output)
                designObject.design_status = False
            else : 
                print('output is true')
                # if the output is successfully generated, then set the design_status to True 
                designObject.design_status = True

            designObject.save()
        except Exception as e : 
            print('Error in saving the logs in Design table : ' , e)

        return JsonResponse({"data": output, "logs": new_logs, "success": True}, safe=False , status = 201)
    
    
    def combine_logs(self , logs) : 
        # the logs here is an array of objects 
        # this function extracts the objects to string and combines them into a single string 
        # also converting the type key value to upper case 
        finalLogsString = ""
        #print('temp :  ', logs[0])

        for item in logs : 
            print('item : ' , item)
            print('item.keys : ' , item.keys())
            item['type'] = item['type'].upper()
            msg = item['msg']
            finalLogsString = finalLogsString + item['type'] + " : " + msg + '\n'

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

