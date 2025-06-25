"""
    This file includes the CAD Model Generation and CAD Conversion API
    Update input values in database.
        CAD Model API (class CADGeneration(View)):
            Accepts POST requests.
            Saves obj file as output in osdagclient/public/output-obj.obj 
            Returns ouput dir name as content_type text/plain.
            Request must provide module identifier in POST data.
"""
from django.http import HttpResponse, JsonResponse, HttpRequest
from django.views import View
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
            Accepts POST requests.
            Returns BREP file as content_type text/plain.
            Request must provide module identifier and input values in POST data.
    """

    def post(self, request: HttpRequest):
        try:
            # Parse request data
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST.dict()
            
            module_name = data.get('Module')
            input_values = data
            
            if not module_name:
                return JsonResponse({"status": "error", "message": "Module name is required"}, status=400)
            
            print(f"CAD Generation for module: {module_name}")
            print(f"Input values: {input_values}")
            
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Error parsing request data: {str(e)}"}, status=400)
        
        # Get module API
        try:
            module_api = get_module_api(module_name)
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Module not found: {str(e)}"}, status=404)
        
        # Check for FreeCAD availability
        command = "D:\\Program Files\\FreeCAD 1.0\\bin\\freecadcmd.exe"
        if not command:
            return JsonResponse({"status": "error", "message": "FreeCAD is not installed or not in system PATH."}, status=500)
        
        # Directory setup
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(os.path.dirname(current_dir))
        macro_path = os.path.join(parent_dir, 'freecad_utils/open_brep_file.FCMacro')
    
        # Determine sections based on the module name
        if "Fin-Plate" in module_name or "Fin Plate" in module_name:
            sections = ["Model", "Beam", "Column", "Plate"]
        elif "Cleat-Angle" in module_name or "Cleat Angle" in module_name:
            sections = ["Model", "Beam", "Column", "cleatAngle"]
        elif "End-Plate" in module_name or "End Plate" in module_name and "Beam-Beam" not in module_name:
            sections = ["Model", "Beam", "Column", "Plate"]
        elif "Seated-Angle" in module_name or "Seated Angle" in module_name:
            sections = ["Model", "Beam", "Column", "SeatAngle"]
        elif "Cover-Plate-Bolted" in module_name or "Cover Plate Bolted" in module_name:
            sections = ["Model", "Beam", "Connector"]
        elif "Beam-Beam-End-Plate" in module_name or "Beam Beam End Plate" in module_name:
            sections = ["Model", "Beam", "Connector"]
        elif "Cover-Plate-Welded" in module_name or "Cover Plate Welded" in module_name:
            sections = ["Model", "Beam", "Connector"]
        elif "Beam-to-Column-End-Plate" in module_name or "Beam-to-Column End Plate" in module_name:
            sections = ["Model", "Beam", "Column", "Connector"]
        elif "Tension-Member-Bolted" in module_name or "Tension Member Bolted" in module_name:
            sections = ["Model", "Member", "Plate", "Endplate"]
        else:
            return JsonResponse({"status": "error", "message": "Unknown module type"}, status=400)
        
        # initialize the empty dictionary to hold model data
        output_files = {}
        
        # Generate a unique identifier for this request (can use timestamp or uuid)
        import uuid
        request_id = str(uuid.uuid4())[:8]
        
        print("Design sections: ", sections)
        for section in sections:
            print(f'Generating section: {section}')
            try:
                path = module_api.create_cad_model(input_values, section, request_id)

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
