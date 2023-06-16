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
        cookie_id = request.COOKIES.get("design_session") # Get design session id.
        print(cookie_id)
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

        os.chdir('/home')
        # Pass the path variable as a command-line argument to the FreeCAD macro
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Get the path of the parent directory
        parent_dir = os.path.dirname(os.path.dirname(current_dir))
        macro_path = os.path.join(parent_dir,'freecad_utils/open_brep_file.FCMacro')
        command = '/snap/bin/freecad.cmd'
        #path = 'file_storage/cad_models/Uv9aURCfBDmhoosxMUy2UT7P3ghXcvV3_Model.brep'
        path_to_file = os.path.join(parent_dir,path)
        output_dir = os.path.join(parent_dir,'3D_WebGL/model_files/output-obj.obj')
        # Call the subprocess to create the empty output file
        subprocess.run(["touch", output_dir])
        command_with_arg = f'{command} {macro_path} {path_to_file} {output_dir}'
        # Execute the command using subprocess.Popen()
        process = subprocess.Popen(command_with_arg.split())
        #print("CAD File dir",output_dir)
        os.remove(path_to_file) #deleting the temporary cad file
        response = HttpResponse(output_dir,status=200)
        response["content-type"] = "text/plain"
        # response.write(cad_model)
        #response.write(output_dir)
        return response 
        #return HttpResponse(path, content_type='text/plain')# Add freecad file converter shell instruction here file located at path


        