"""
    This file includes the CAD Model Generation and CAD Conversion API
    Update input values in database.
        CAD Model API (class CADGeneration(View)):
            Accepts GET requests.
            Saves obj file as output in osdagclient/public/output-obj.obj 
            Returns ouput dir name as content_type text/plain.
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
import subprocess
import time


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
        # Get design session id.
        cookie_id = request.COOKIES.get("design_session")
        print(cookie_id)
        # Error Checking: If design session id provided.
        if cookie_id == None or cookie_id == '':
            # Returns error response.
            return HttpResponse("Error: Please open module", status=400)
        # Error Checking: If design session exists.
        if not Design.objects.filter(cookie_id=cookie_id).exists():
            # Return error response.
            return HttpResponse("Error: This design session does not exist", status=404)
        try:  # Error checking while loading input data
            # Get session object from db.
            design_session = Design.objects.get(cookie_id=cookie_id)
            module_api = get_module_api(
                design_session.module_id)  # Get module api
            # Error Checking: If input data not entered.
            if not design_session.current_state:
                # Return error response.
                return HttpResponse("Error: Please enter input data first", status=409)
            # Load input data into dictionary.
            input_values = json.loads(design_session.input_values)
        except Exception as e:
            # Return error response.
            return HttpResponse("Error: Internal server error: " + repr(e), status=500)
        section = "Model"  # Section of model to generate (default full model).
        if request.GET.get("section") != None:  # If section is specified,
            section = request.GET["section"]  # Set section
        try:  # Error checking while Generating BREP File.
            # Generate CAD Model.
            path = module_api.create_cad_model(
                input_values, section, cookie_id)
        except OsdagApiException as e:  # If section does no exist
            return HttpResponse(repr(e), status=400)  # Return error response.
        except Exception as e:
            # Return error response.
            return HttpResponse("Error: Internal server error: " + repr(e), status=500)
        

        os.chdir('/home')
        # Pass the path variable as a command-line argument to the FreeCAD macro
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Get the path of the parent directory
        parent_dir = os.path.dirname(os.path.dirname(current_dir))
        macro_path = os.path.join(
            parent_dir, 'freecad_utils/open_brep_file.FCMacro')
        command = '/snap/bin/freecad.cmd'
        #path = 'file_storage/cad_models/Uv9aURCfBDmhoosxMUy2UT7P3ghXcvV3_Model.brep'
        path_to_file = os.path.join(parent_dir, path)
        output_dir = os.path.join(
            parent_dir, 'osdagclient/public/output-obj.obj')
        # Call the subprocess to create the empty output file
        subprocess.run(["touch", output_dir])
        command_with_arg = f'{command} {macro_path} {path_to_file} {output_dir}'
        # Execute the command using subprocess.Popen()
        process = subprocess.Popen(command_with_arg.split())
        os.remove(path_to_file)  # deleting the temporary cad file
        response = HttpResponse(output_dir, status=200)
        response["content-type"] = "text/plain"
        return response
