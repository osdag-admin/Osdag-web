"""
    This file includes the Modules API
    Get Module Data.
        Get Modules API (class GetModules(View)):
            Accepts GET requests.
            Returns all developed modules in json format.
"""
from django.http import HttpResponse, HttpRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from osdag_api import module_dict
import json
import typing

# Author: Aaranyak Ghosh

@method_decorator(csrf_exempt, name='dispatch')
class GetModules(View):
    """
        Get Module Data.
            Get Modules API (class GetModules(View)):
                Accepts GET requests.
                Returns all developed modules in json format.
    """
    def get(self,request: HttpRequest) -> HttpResponse:
        if request.COOKIES.get("fin_plate_connection_session") is not None: # Error Checking: Already editing design.
            return HttpResponse("Error: Already editing module", status=400) # Returns error response.
        module_data = json.dumps(module_dict) # Convert module data to json.
        response = HttpResponse(status=200) # Status code 200 - success.
        response["content-type"] = "application/json" # Set content-type header to json.
        response.write(module_data) # Write module data to http response body.
        return response