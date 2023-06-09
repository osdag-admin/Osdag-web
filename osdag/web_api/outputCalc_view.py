
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api

# importing models
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material


#########################################################
# Author : Sai Charan ( FOSSEE Summer Fellow '23 ) #
#########################################################

@method_decorator(csrf_exempt, name='dispatch')
class OutputData(APIView):

    def post(self, request):
        print("Inside post method of OutputData")

        module_api = get_module_api('Fin Plate Connection')
        print(module_api)
        output = module_api.generate_ouptut(request.data)

        return JsonResponse(output, safe=False)
