"""
    This file includes the Input Values API
    InputValues API (class InputValues(View)):
        Update input values in database.
        Accepts POST requests.
        Accepts content_type application/json
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

# Author: Aaranyak Ghosh

@method_decorator(csrf_exempt, name='dispatch')
class InputValues(View):
    """
        Update input values in database.
        InputValues API (class InputValues(View)):
            Accepts POST requests.
            Accepts content_type application/json
            Request must provide session cookie id.
    """
    def post(self, request: HttpRequest):
        cookie_id = request.COOKIES.get("design_session") # Get design session id.
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return HttpResponse("Error: Please open module", status=400) # Returns error response.
        if not Design.objects.filter(cookie_id=cookie_id).exists(): # Error Checking: If design session exists.
            return HttpResponse("Error: This design session does not exist", status=404) # Return error response.
        if not request.content_type == "application/json": # Error checking: If content/type is not json.
            return HttpResponse("Error: Content type has to be text/json") # Return error response.
        try: # Error checking while loading body.
            body_unicode = request.body.decode('utf-8')
            input_data = json.loads(body_unicode)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        try: # Error checking while getting module api
            design_session = Design.objects.get(cookie_id=cookie_id) # Get the design session from the db.
            module_api = get_module_api(design_session.module_id) # Get the module api using the module id.
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        try:
            module_api.validate_input(input_data) # Check if input data is valid.
        except OsdagApiException as e: # Catch input validation error.
            return HttpResponse("Error: " + repr(e), status=400) # Return error response
        except Exception as e: # Catch other error.
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        try: # Error checking while saving input values
            json_data = json.dumps(input_data) # Convert dict to json string
            Design.objects.filter(cookie_id=cookie_id).update(input_values=json_data)
            Design.objects.filter(cookie_id=cookie_id).update(current_state=True)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        response = HttpResponse(status=200) # Status code 200 - Success!
        return response

