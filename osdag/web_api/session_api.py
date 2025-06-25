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
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# importing serializers
from osdag.serializers import Design_Serializer

# Author: Aaranyak Ghosh


class CreateSession(APIView):
    """
    Create a session in database without cookies.
        Create Session API (class CreateSession(View)):
            Accepts POST requests.
            Request body must include module id.
            Returns success status without creating actual sessions.
    """

    def post(self, request):
        print("CreateSession view reached")
        module_id = request.data.get("module_id")
        print("module_id in session : ", module_id)
        
        if not module_id:
            print("module is None or Empty")
            return JsonResponse(
                {"error": "Please specify module id"}, status=400
            )

        if module_id not in developed_modules:
            print("module_id not developed")
            return JsonResponse(
                {"error": "This module has not been developed yet"}, status=501
            )

        # Return success without actually creating a session
        # since we're working without cookies now
        print(f"Session creation simulated for module: {module_id}")
        return JsonResponse({"status": "set"}, status=201)


class DeleteSession(APIView):
    """
    Delete session endpoint (simplified without cookies).
        Delete Session API (class DeleteSession(APIView)):
            Accepts POST requests.
            Returns success status without actually deleting sessions.
    """
    
    def post(self, request):
        print("Delete session request received")
        module_id = request.data.get("module_id")
        print("module_id in session : ", module_id)

        # Return success without actually deleting anything
        # since we're working without cookies/sessions now
        return JsonResponse({"status": "deleted"}, status=200)
