from django.http import HttpResponse, HttpRequest
from osdag.models import Design
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from osdag.models import Beams
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.views import APIView


class DesignPreference(APIView): 

    @api_view(['GET'])
    def get(self, request):
        supported_section = request.GET.get("supported_section")
        cookie_id = request.COOKIES.get('fin_plate_connection_session')
        print(supported_section)

        #if cookie_id == None or cookie_id == '': 
            #return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) 

        supported_section_results = Beams.objects.filter(Designation=supported_section).values()
        print(supported_section_results)

        return Response(supported_section_results, status=status.HTTP_200_OK)