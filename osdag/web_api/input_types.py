from django.shortcuts import render, redirect
from django.utils.html import escape, urlencode
from django.http import HttpResponse, HttpRequest
from django.http import HttpResponse, JsonResponse
from django.views import View
from osdag.models import Design
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from osdag_api import developed_modules, get_module_api
from osdag_api.errors import OsdagApiException
import typing
import json
import os
from design_type.connection.fin_plate_connection import FinPlateConnection
from gui.ui_template import Window, Ui_ModuleWindow
from Common import *

# Author: Pallav Sharma

@method_decorator(csrf_exempt, name='dispatch')
class InputTypes(View):
    def get(self, request: HttpRequest):
        cookie_id = request.COOKIES.get("design_session") # Get design session id.
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return HttpResponse("Error: Please open module", status=400) # Returns error response.
        if not Design.objects.filter(cookie_id=cookie_id).exists(): # Error Checking: If design session exists.
            return HttpResponse("Error: This design session does not exist", status=404) # Return error response.
        try: # Error checking while loading input data
            design_session = Design.objects.get(cookie_id=cookie_id) # Get session object from db.
            module_api = get_module_api(design_session.module_id) # Get module api
            if not design_session.current_state: # Error Checking: If input data not entered.
                return HttpResponse("Error: Please enter input data first", status=409) # Return error response.
            input_values = json.loads(design_session.input_values) # Load input data into dictionary.
            
            response_data = {}  # Create an empty dictionary to store the response data
            
            for key, value in input_values.items():
                value_type = type(value)
                response_data[key] = (value_type._name_, value)
            
            return JsonResponse(response_data)
            
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.