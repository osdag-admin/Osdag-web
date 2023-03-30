"""
    This file includes the CAD Model API
    Update input values in database.
        CAD Model API (class CADGeneration(View)):
            Accepts GET requests.
            Returns BREP file as content_type text/plain.
            Request must provide session cookie id.
"""
from django.shortcuts import render, redirect
from django.utils.html import escape, urlencode
from django.http import HttpResponse, HttpRequest
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

@method_decorator(csrf_exempt, name='dispatch')
class CADGeneration(View):
    """
        Update input values in database.
            CAD Model API (class CADGeneration(View)):
                Accepts GET requests.
                Returns BREP file as content_type text/plain.
                Request must provide session cookie id.
    """
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
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.
        section = "Model" # Section of model to generate (default full model).
        if request.GET.get("section") != None: # If section is specified,
            section = request.GET["section"] # Set section
        try: # Error checking while Generating BREP File.
            path = module_api.create_cad_model(input_values, section, cookie_id) # Generate CAD Model.
        except OsdagApiException as e: # If section does no exist
            return HttpResponse(repr(e), status=400) # Return error response.
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.
        with open(path, 'r') as f: # Open CAD file
            cad_model = f.read() # Read CAD file Data
        os.remove(path) # Delete CAD File
        response = HttpResponse(status=200)
        response["content/type"] = "text/plain"
        response.write(cad_model)
        return response