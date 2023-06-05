"""
    This file includes the Create Session and Delete Session API.
    Create Session API (class CreateSession(View)):
        Accepts POST requests.
        Accepts content-type/form-data.
        Request body must include module id.
        Creates a session object in db and returns session id as cookie.
    Delete Session API (class CreateSession(View)):
        Accepts POST requests.
        Requires no POST data.
        Requires design_session cookie.
        Deletes session object in db and deletes session id cookie.
"""
from django.shortcuts import render, redirect
from django.utils.html import escape, urlencode
from django.http import HttpResponse, HttpRequest
from django.views import View
from osdag.models import Design
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from osdag_api import developed_modules
import typing

# Author: Aaranyak Ghosh

@method_decorator(csrf_exempt, name='dispatch')
class CreateSession(View):
    """
        Create a session in database and set session cookie.
            Create Session API (class CreateSession(View)):
                Accepts POST requests..
                Accepts content-type/form-data.
                Request body must include module id.
                Creates a session object in db and returns session id as cookie.
    """
    def post(self,request: HttpRequest) -> HttpResponse:
        module_id = request.POST.get("module_id") # Type of Osdag Module
        if module_id == None or module_id == '': # Error Checking: If module id provided.
            return HttpResponse("Error: Please specify module id", status=400) # Returns error response.
        if request.COOKIES.get("design_session") is not None: # Error Checking: Already editing design.
            return HttpResponse("Error: Already editing module", status=400) # Returns error response.
        if module_id not in developed_modules: # Error Checking: Does module api exist
            return HttpResponse("Error: This module has not been developed yet", status=501) # Return error response.
        response = HttpResponse(status=201) # Statuscode 201 - Successfully created object.
        cookie_id = get_random_string(length=32) # Session Id - random string.
        response.set_cookie("design_session", cookie_id) # Set session id cookie.
        try: # Try creating session.
            session = Design(cookie_id = cookie_id, module_id = module_id) # Create design session object in db
            session.save()
        except Exception as e: # Error Checking: While saving design.
            return HttpResponse("Inernal Server Error: " + repr(e), status=500) # Return error response.
        response = HttpResponse(status=201) # Statuscode 201 - Successfully created object.
        response.set_cookie("design_session", cookie_id) # Set session id cookie
        return response

@method_decorator(csrf_exempt, name='dispatch')
class DeleteSession(View):
    """
        Delete session cookie and session data in db.
            Delete Session API (class CreateSession(View)):
                Accepts POST requests.
                Requires no POST data.
                Requires design_session cookie.
                Deletes session object in db and deletes session id cookie.
    """
    def post(self,request: HttpRequest) -> HttpResponse:
        cookie_id = request.COOKIES.get("design_session") # Get design session id.
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return HttpResponse("Error: Please open module", status=400) # Returns error response.
        if not Design.objects.filter(cookie_id=cookie_id).exists(): # Error Checking: If design session exists.
            return HttpResponse("Error: This design session does not exist", status=404) # Return error response.
        try: # Try deleting session.
            design_session = Design.objects.get(cookie_id=cookie_id) # Design session object in db.
            design_session.delete()
        except Exception as e: # Error Checking: While saving design.
            return HttpResponse("Inernal Server Error: " + repr(e), status=500) # Return error response.
        response = HttpResponse(status=200) # Status code 200 - Successfully deleted .
        response.delete_cookie("design_session")
        return response