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
        CAD Model API (class CADGeneration(View)):
            Accepts POST requests with input data and module information.
            Generates CAD models directly from input data without requiring sessions.
    """

    def post(self, request: HttpRequest):
        try:
            # Parse JSON request body
            import json
            request_data = json.loads(request.body)
            
            # Get module information and input values from request
            module_id = request_data.get('module_id')
            input_values = request_data.get('input_values')
            
            if not module_id:
                return JsonResponse({"status": "error", "message": "module_id is required"}, status=400)
            
            if not input_values:
                return JsonResponse({"status": "error", "message": "input_values are required"}, status=400)
            
            # Get module API
            module_api = get_module_api(module_id)
            
            # Determine session type from module_id
            module_type_mapping = {
                "Fin-Plate-Connection": "FinPlate",
                "Cleat-Angle-Connection": "CleatAngle", 
                "End-Plate-Connection": "EndPlate",
                "Seated-Angle-Connection": "SeatedAngle",
                "Cover-Plate-Bolted-Connection": "CoverPlateBolted",
                "Beam-Beam-End-Plate-Connection": "BeamBeamEndPlate",
                "Cover-Plate-Welded-Connection": "CoverPlateWelded",
                "Beam-to-Column-End-Plate-Connection": "BeamToColumnEndPlate",
                "Tension-Member-Bolted-Design": "TensionMember"
            }
            
            session_type = module_type_mapping.get(module_id)
            if not session_type:
                return JsonResponse({"status": "error", "message": f"Unknown module type: {module_id}"}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Error parsing request: {str(e)}"}, status=500)
        
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
    
        # Determine sections based on the session type and what each backend module expects
        if session_type == "FinPlate":
            sections = ["Model", "Beam", "Column", "Plate"]
        elif session_type == "CleatAngle":
            sections = ["Model", "Beam", "Column", "CleatAngle"]
        elif session_type == "EndPlate":
            sections = ["Model", "Beam", "Column", "Plate"]
        elif session_type == "SeatedAngle":
            sections = ["Model", "Beam", "Column", "SeatedAngle"]
        elif session_type == "CoverPlateBolted":
            sections = ["Model", "Beam", "Plate"]
        elif session_type == "BeamBeamEndPlate":
            sections = ["Model", "Beam", "EndPlate"]
        elif session_type == "CoverPlateWelded":
            sections = ["Model", "Beam", "Plate"]
        elif session_type == "BeamToColumnEndPlate":
            sections = ["Model", "Beam", "Column", "EndPlate"]
        elif session_type == "TensionMember":
            sections = ["Model", "Member", "Plate", "Endplate"]
        else:
            return JsonResponse({"status": "error", "message": "Unknown module type"}, status=400)
        
        # initialize the empty dictionary to hold model data
        output_files = {}
        print("Design sections: ", sections)
        
        # Generate a unique session identifier for this CAD generation
        import uuid
        session_id = str(uuid.uuid4())
        
        for section in sections:
            print(f'Generating section: {section}')
            try:
                path = module_api.create_cad_model(input_values, section, session_id)

                if not path:
                    print(f'Error generating {section}: create_cad_model() returned None or empty string')
                    continue  # Skip to the next section
                
                print(f'{section} generated successfully')

                # Convert and store file paths
                path_to_file = os.path.join(parent_dir, path)
                if not os.path.exists(path_to_file):
                    print(f'Generated file for {section} does not exist at: {path_to_file}')
                    continue
                    
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
