"""
    This file includes the CAD Model Generation and CAD Conversion API
    Update input values in database.
        CAD Model API (class CADGeneration(View)):
            Accepts GET requests.
            Saves obj file as output in osdagclient/public/output-obj.obj 
            Returns ouput dir name as content_type text/plain.
            Request must provide session cookie id.
"""
from django.http import HttpResponse, JsonResponse, HttpRequest
from django.views import View
from osdag.models import Design
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from osdag_api import developed_modules, get_module_api
import shutil
import json
import os
import subprocess
from io import BytesIO

# rest_framework
from rest_framework import status
from rest_framework.response import Response

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
        # Get design session id
        fin_plate_cookie_id = request.COOKIES.get("fin_plate_connection_session")
        cleat_angle_cookie_id = request.COOKIES.get("cleat_angle_connection_session")
        end_plate_cookie_id = request.COOKIES.get("end_plate_connection_session")
        seated_angle_cookie_id = request.COOKIES.get("seated_angle_connection")
        cover_plate_bolted_cookie_id = request.COOKIES.get("cover_plate_bolted_connection_session")
        cover_plate_welded_cookie_id = request.COOKIES.get("cover_plate_welded_connection_session")
        beam_column_end_plate_cookie_id = request.COOKIES.get("beam_to_column_end_plate_connection_session")
        beam_beam_end_plate_cookie_id = request.COOKIES.get("beam_beam_end_plate_connection_session")
        tension_member_bolted_cookie_id = request.COOKIES.get("tension_member_bolted_design_session")
        print("cookieeeeee ", request.COOKIES)
        #Ensure that at least one session exists
        if not fin_plate_cookie_id and not cleat_angle_cookie_id and not seated_angle_cookie_id and not end_plate_cookie_id and not cover_plate_bolted_cookie_id and not beam_beam_end_plate_cookie_id and not cover_plate_welded_cookie_id and not beam_column_end_plate_cookie_id and not tension_member_bolted_cookie_id:
            return JsonResponse({"status": "error", "message": "Please open a module"}, status=400)
    
        #determine the correct sessionId and fetch design session
        if fin_plate_cookie_id:
            cookie_id = fin_plate_cookie_id
            session_type = "FinPlate"
        elif cleat_angle_cookie_id:
            cookie_id = cleat_angle_cookie_id
            session_type = "CleatAngle"
        elif end_plate_cookie_id:
            cookie_id = end_plate_cookie_id
            session_type = "EndPlate"
        elif seated_angle_cookie_id:
            cookie_id = seated_angle_cookie_id
            session_type = "SeatedAngle"
        elif cover_plate_bolted_cookie_id:
            cookie_id = cover_plate_bolted_cookie_id
            session_type = "CoverPlateBolted"
        elif beam_beam_end_plate_cookie_id:
            cookie_id = beam_beam_end_plate_cookie_id
            session_type = "BeamBeamEndPlate"
        elif cover_plate_welded_cookie_id:
            cookie_id = cover_plate_welded_cookie_id
            session_type = "CoverPlateWelded"
        elif beam_column_end_plate_cookie_id:
            cookie_id = beam_column_end_plate_cookie_id
            session_type = "BeamToColumnEndPlate"
        elif tension_member_bolted_cookie_id:
            cookie_id = tension_member_bolted_cookie_id
            session_type = "TensionMemberBoltedDesign"
        print("session_type", session_type)
        # # Error Checking: If design session exists.
        # if not Design.objects.filter(cookie_id=cookie_id).exists():
        #     # Return error response.
        #     return HttpResponse("Error: This design session does not exist", status=404)
        
        try:
            design_session = Design.objects.get(cookie_id=cookie_id)
            print(f"Design session found: {design_session}")
            module_api = get_module_api(design_session.module_id)
            print(f"Module API: {module_api}")
            input_values = design_session.input_values
            print(f"Input values: {input_values}")
        except Design.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Design session not found"}, status=404)
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Unable to retrieve session - {repr(e)}"}, status=500)
        
        # Check for FreeCAD availability
        command = shutil.which("FreeCADCmd")
        print(f"Detected FreeCADCmd path: {command}")
        command = "D:\\Program Files\\FreeCAD 1.0\\bin\\freecadcmd.exe"

        if not command:
            return JsonResponse({"status": "error", "message": "FreeCAD is not installed or not in system PATH."}, status=500)
        
        # Directory setup
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(os.path.dirname(current_dir))
        macro_path = os.path.join(parent_dir, 'freecad_utils/open_brep_file.FCMacro')
    
        # Determine sections based on the session type
        if session_type == "FinPlate":
            sections = ["Model", "Beam", "Column", "Plate"]
        elif session_type == "CleatAngle":
            sections = ["Model", "Beam", "Column", "cleatAngle"]
        elif session_type == "EndPlate":
            sections = ["Model", "Beam", "Column", "Plate"]
        elif session_type == "SeatedAngle":
            sections = ["Model", "Beam", "Column", "SeatAngle"]
        elif session_type == "CoverPlateBolted":
            sections = ["Model", "Beam", "Connector"]
        elif session_type == "BeamBeamEndPlate":
            sections = ["Model", "Beam", "Connector"]
        elif session_type == "CoverPlateWelded":
            sections = ["Model", "Beam", "Connector"]
        elif session_type == "BeamToColumnEndPlate":
            sections = ["Model", "Beam", "Column", "Connector"]
        elif session_type == "TensionMemberBoltedDesign":
            # sections = ["Plate"]
            sections = ["Member","Model","Plate", "Endplate"]
        else:
            return JsonResponse({"status": "error", "message": "Unknown module type"}, status=400)
        
        # initialize the empty dictionary to hold model data
        output_files = {}
        # Fetch Design object once
        designObject = design_session
        print("Design sections: ", sections)
        for section in sections:
            print(f'Generating section: {section}')
            try:
                path = module_api.create_cad_model(input_values, section, cookie_id)

                if not path:
                    print(f'Error generating {section}: create_cad_model() returned None or empty string')
                    continue  # Skip to the next section
                
                # Mark this section as successfully generated
                print(f'{section} generated successfully')
                designObject.cad_design_status = True
                designObject.save()

                # Convert and store file paths
                path_to_file = os.path.join(parent_dir, path)
                if not os.path.exists(path_to_file):
                    print(f'Generated file for {section} does not exist at: {path_to_file}')
                    continue
                # output_obj_path = os.path.join(parent_dir, f'osdagclient/public/output-{section.lower()}.obj')
                output_obj_path = path_to_file.replace(".brep", ".obj")

                # Convert .brep to .obj using FreeCAD
                command_with_arg = f'{command} {macro_path} {path_to_file} {output_obj_path}'
                process = subprocess.Popen(command_with_arg.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                stdout, stderr = process.communicate()

                if process.returncode != 0:
                    print(f"FreeCAD conversion failed for {section}: {stderr.decode().strip()}")
                    continue
                
                # Read the generated .obj file into BytesIO
                output_obj = BytesIO() # create an in-memory buffer
                with open(output_obj_path, "rb") as obj_file:
                    output_obj.write(obj_file.read()) # Store the file inside memory
                
                output_files[section] = output_obj.getvalue().decode("utf-8") # Converts the file's content into a readable string for json
                
            except Exception as e:
                print(f"Exception while generating {section}: {e}")
                
        if not output_files:
            return JsonResponse({"status": "error", "message": "No CAD models were generated."}, status=500)
                
        return JsonResponse({
            "status": "success",
            "files": output_files,
            "message": "CAD models generated successfully"
        }, status=201)
