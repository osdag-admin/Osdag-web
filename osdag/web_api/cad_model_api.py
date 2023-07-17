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

# rest_framework
from rest_framework import status
from rest_framework.response import Response

# importing models 
from osdag.models import Design


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
        cookie_id = request.COOKIES.get("fin_plate_connection_session")
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
            try : 
                design_session = Design.objects.get(cookie_id=cookie_id)
            except : 
                print('Error in obtaining the fin_plate_connection_session')
            
            try : 
                module_api = get_module_api(
                    design_session.module_id)  # Get module api
            except : 
                print('error in obtaining modele_api from the design_session')
            # Error Checking: If input data not entered.


            #if not design_session.current_state:
            #    # Return error response.
            #    return HttpResponse("Error: Please enter input data first", status=409)
            # Load input data into dictionary.
            
            try : 
                input_values = design_session.input_values
            except : 
                print('error in loading the input_values from the design_session instance')
        except Exception as e:
            # Return error response.
            print('first erorr')
            return HttpResponse("Error: Internal server error: " + repr(e), status=500)
        section = "Model"  # Section of model to generate (default full model).
        if request.GET.get("section") != None:  # If section is specified,
            section = request.GET["section"]  # Set section
            print('section : ' , section)
        try:  # Error checking while Generating BREP File.
            # Generate CAD Model.
            print('creating cad model')
            path = module_api.create_cad_model(
                input_values, section, cookie_id)
            print('path : ' , path)
            designObject = Design.objects.get(cookie_id = cookie_id)
            try : 
                if(not path) : 
                    print('path is false')
                    # set the cad_design_status to False
                    designObject.cad_design_status = False
                    designObject.save()

                    return HttpResponse('CAD model generation failed' , status = 400)
                if(path) : 
                    # set the cad_design_status to True 
                    print('path is valid')
                    designObject.cad_design_status = True
                    designObject.save()
            except Exception as e :
                print('Exception found while saving the CAD design status : ' , e) 

        except OsdagApiException as e:  # If section does no exist
            return HttpResponse(repr(e), status=400)  # Return error response.
        except Exception as e:
            # Return error response.
            return HttpResponse("Error: Internal server error: " + repr(e), status=500)
        
        #try : 
        #    os.chdir('/home')
        #except Exception as e : 
        #    print('chdir e : ' , e)
        
        try : 
            # Pass the path variable as a command-line argument to the FreeCAD macro
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Get the path of the parent directory
            parent_dir = os.path.dirname(os.path.dirname(current_dir))
            macro_path = os.path.join(
                parent_dir, 'freecad_utils/open_brep_file.FCMacro')
            command = '/snap/bin/freecad.cmd'
            # path = 'file_storage/cad_models/Uv9aURCfBDmhoosxMUy2UT7P3ghXcvV3_Model.brep'
            path_to_file = os.path.join(parent_dir, path)
            output_dir = os.path.join(
                parent_dir, 'osdagclient/public/output-obj.obj')
        except Exception as e : 
            print('output dir e : ' , e)
        # Call the subprocess to create the empty output file
        try : 
            subprocess.run(["touch", output_dir])
        except Exception as e : 
            print('subprocess run e : ' , e)
        
        command_with_arg = f'{command} {macro_path} {path_to_file} {output_dir}'
        # Execute the command using subprocess.Popen()
        process = subprocess.Popen(command_with_arg.split())
        
        time.sleep(3)
        response = HttpResponse(output_dir, status=201)
        response["content-type"] = "text/plain"
        return response
