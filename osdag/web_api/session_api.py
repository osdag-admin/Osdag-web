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
    Create a session in database and set session cookie.
        Create Session API (class CreateSession(View)):
            Accepts POST requests..
            Accepts content-type/form-data.
            Request body must include module id.
            Creates a session object in db and returns session id as cookie.
    """

    def post(self, request):
        print("CreateSession view reached")
        module_id = request.data.get("module_id")
        print("module_id in session : ", module_id)
        if (
            module_id == None or module_id == ""
        ):  # Error Checking: If module id provided.
            print("module is None or Empty")
            return JsonResponse(
                "Error: Please specify module id", status=400
            )  # Returns error response.
        if (
            request.COOKIES.get("end_plate_connection_session") is not None
        ):  # Error Checking: Already editing design.
            print("end_plate_connection is there")
            return JsonResponse(
                {"status": "set"}, status=200
            )  # Returns error response.
        elif request.COOKIES.get("fin_plate_connection_session") is not None:
            print("fin_plate_connection is there")
            return JsonResponse(
                {"status": "set"}, status=200
            )  # Returns error response.
        elif request.COOKIES.get("cleat_angle_connection_session") is not None:
            print("cleat_angle_connection_session is there")
            return JsonResponse(
                {"status": "set"}, status=200
            )  # Returns error response.
        elif request.COOKIES.get("seated_angle_connection") is not None:
            print("seated angle connection is there ")
            return JsonResponse({"status": "set"}, status=200)
        elif request.COOKIES.get("cover_plate_bolted_connection_session") is not None:
            print("cover plate bolted connection is there ")
            return JsonResponse({"status": "set"}, status=200)
        elif request.COOKIES.get("beam_beam_end_plate_connection_session") is not None:
            print("Beam Beam End Plate Connection is there ")
            return JsonResponse({"status": "set"}, status=200)
        elif request.COOKIES.get("cover_plate_welded_connection_session") is not None:
            print("Cover plate welded connection is there ")
            return JsonResponse({"status": "set"}, status=200)
        elif request.COOKIES.get("beam_to_column_end_plate_connection_session") is not None:
            print("beam to column end plate connection is there ")
            return JsonResponse({"status": "set"}, status=200)
        elif request.COOKIES.get("tension_member_bolted_design_session") is not None:
            print("Tension Member Bolted Design session is there")
            return JsonResponse({"status": "set"}, status=200)

        if module_id not in developed_modules:  # Error Checking: Does module api exist
            print("module_id not developed")
            return JsonResponse(
                "Error: This module has not been developed yet", status=501
            )  # Return error response.

        # Define cookie keys for each module
        cookie_keys = {
            "Fin Plate Connection": "fin_plate_connection_session",
            "End Plate Connection": "end_plate_connection_session",
            "Cleat Angle Connection": "cleat_angle_connection_session",
            "Seated Angle Connection": "seated_angle_connection",
            "Cover Plate Bolted Connection": "cover_plate_bolted_connection_session",
            "Beam Beam End Plate Connection": "beam_beam_end_plate_connection_session",
            "Cover Plate Welded Connection": "cover_plate_welded_connection_session",
            "Beam-to-Column End Plate Connection": "beam_to_column_end_plate_connection_session", 
            "Tension Member Bolted Design": "tension_member_bolted_design_session",
        }

        # Check for existing sessions
        for session_key in cookie_keys.values():
            if request.COOKIES.get(session_key):
                return Response({"status": "set"}, status=status.HTTP_200_OK)

        cookie_id = get_random_string(
            length=32
        )  # creting a session from a random string
        print("cookie id in session : *********************", cookie_id)
        tempData = {"cookie_id": cookie_id, "module_id": module_id, "input_values": {}}
        print("tempData : ", tempData)
        print("type of tempData  : ", type(tempData))
        serializer = Design_Serializer(data=tempData)
        print("serializers : ", serializer)
        if serializer.is_valid():
            print("serializer is valid")
            serializer.save()

            # create HTTPResponse and set the cookie
            response = JsonResponse({"status": "set"}, status=201)

            cookie_key = cookie_keys.get(module_id)
            print("cookie_key : ", cookie_keys)
            if cookie_key:
                response.set_cookie(
                    key=cookie_key, value=cookie_id, samesite="None", secure=True
                )
                print(f"Cookie Set: {cookie_key}")
            else:
                print(f"Warning: Unknown module_id: {module_id}")
                return Response(
                    {"error": "Invalid module_id"}, status=status.HTTP_400_BAD_REQUEST
                )
            return response
        else:
            print("serializer is invalid")
            print("serializer.errors : ", serializer.errors)
            return JsonResponse(
                "Inernal Server Error: ", status=500, safe=False
            )  # Return error response.


class DeleteSession(APIView):
    """
    Delete session cookie and session data in db.
        Delete Session API (class DeleteSession(APIView)):
            Accepts POST requests.
            Requires module_id in POST data.
            Requires corresponding session cookie.
            Deletes session object in db and deletes session id cookie.
    """
    @csrf_exempt
    def post(self, request):
        module_id = request.data.get("module_id")
        print("module_id in session : ", module_id)

        # Define cookie keys for each module
        cookie_keys = {
            "Fin Plate Connection": "fin_plate_connection_session",
            "End Plate Connection": "end_plate_connection_session",
            "Cleat Angle Connection": "cleat_angle_connection_session",
            "Seated Angle Connection": "seated_angle_connection",
            "Cover Plate Bolted Connection": "cover_plate_bolted_connection_session",
            "Beam Beam End Plate Connection": "beam_beam_end_plate_connection_session",
            "Cover Plate Welded Connection": "cover_plate_welded_connection_session",
            "Beam-to-Column End Plate Connection": "beam_to_column_end_plate_connection_session",
            "Tension Member Bolted Design": "tension_member_bolted_design_session",
        }

        if module_id not in cookie_keys:
            return JsonResponse("Error: Invalid module id", status=400, safe=False)

        cookie_key = cookie_keys[module_id]
        cookie_id = request.COOKIES.get(cookie_key)

        if cookie_id is None or cookie_id == "":
            return JsonResponse("Error: Please open module", status=400, safe=False)

        if not Design.objects.filter(cookie_id=cookie_id).exists():
            return JsonResponse(
                "Error: This design session does not exist", status=404, safe=False
            )

        try:
            connection_session = Design.objects.get(cookie_id=cookie_id)
            connection_session.delete()
        except Exception as e:
            return JsonResponse(
                f"Internal Server Error: {str(e)}", status=500, safe=False
            )

        # Create response
        response = JsonResponse({"status": "deleted"}, status=200)

        # Delete the cookie using the same parameters as when setting it
        response.delete_cookie(
            key=cookie_key, samesite="None"
        )

        return response
