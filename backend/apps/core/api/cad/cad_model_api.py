"""
    This file includes the CAD Model Generation and CAD Conversion API
    Update input values in database.
        CAD Model API (class CADGeneration(View)):
            Accepts GET requests.
            Saves obj file as output in frontend/public/output-obj.obj 
            Returns ouput dir name as content_type text/plain.
            Request must provide session cookie id.
"""
from django.http import HttpResponse, JsonResponse, HttpRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.core.module_finder import developed_modules, get_module_api
from apps.core.osdag_overrides import user_id_from_request, user_rows
import shutil
import json
import os
import subprocess
from io import BytesIO

# rest_framework
from rest_framework import status
from rest_framework.response import Response
from apps.core.utils.api_errors import error_json_response
from osdag_core.Common import (
    KEY_DISP_FINPLATE, KEY_DISP_CLEATANGLE, KEY_DISP_HEADERPLATE, KEY_DISP_SEATED_ANGLE,
    KEY_DISP_BEAMCOVERPLATE, KEY_DISP_BEAMCOVERPLATEWELD, KEY_DISP_BB_EP_SPLICE,
    KEY_DISP_BCENDPLATE, KEY_DISP_COLUMNCOVERPLATE, KEY_DISP_COLUMNCOVERPLATEWELD,
    KEY_DISP_COLUMNENDPLATE, KEY_DISP_TENSION_BOLTED, KEY_DISP_TENSION_WELDED,
    KEY_DISP_BUTTJOINTWELDED, KEY_DISP_BUTTJOINTBOLTED,
    KEY_DISP_LAPJOINTWELDED, KEY_DISP_LAPJOINTBOLTED,
)

@method_decorator(csrf_exempt, name='dispatch')
class CADGeneration(View):
    """
        CAD Model API (class CADGeneration(View)):
            Accepts POST requests with input data and module information.
            Generates CAD models directly from input data without requiring sessions.
    """

    def dispatch(self, request, *args, **kwargs):
        # Make the requesting user's custom sections/materials visible to osdag_core.
        with user_rows(user_id_from_request(request)):
            return super().dispatch(request, *args, **kwargs)

    def post(self, request: HttpRequest):
        try:
            # Parse JSON request body
            import json
            request_data = json.loads(request.body)
            
            # Get module information and input values from request
            module_id = request_data.get('module_id')
            input_values = request_data.get('input_values')
            
            if not module_id:
                return error_json_response('missing_field', "module_id is required", 400)
            
            if not input_values:
                return error_json_response('missing_field', "input_values are required", 400)
            
            # Get module API
            module_api = get_module_api(module_id)
            
            # Determine session type from module id
            module_type_mapping = {
                KEY_DISP_FINPLATE: "FinPlateConnection",
                KEY_DISP_CLEATANGLE: "CleatAngle",
                KEY_DISP_HEADERPLATE: "HeaderPlate",
                KEY_DISP_SEATED_ANGLE: "SeatedAngleConnection",
                KEY_DISP_BEAMCOVERPLATE: "CoverPlateBolted",
                KEY_DISP_BB_EP_SPLICE: "BeamBeamEndPlate",
                KEY_DISP_BEAMCOVERPLATEWELD: "CoverPlateWelded",
                KEY_DISP_BCENDPLATE: "BeamToColumnEndPlate",
                KEY_DISP_COLUMNCOVERPLATE: "ColumnCoverPlateBolted",
                KEY_DISP_COLUMNCOVERPLATEWELD: "ColumnCoverPlateWelded",
                KEY_DISP_COLUMNENDPLATE: "ColumnEndPlate",
                KEY_DISP_TENSION_BOLTED: "TensionMember",
                KEY_DISP_TENSION_WELDED: "TensionMember",
                KEY_DISP_BUTTJOINTWELDED: "ButtJointWelded",
                KEY_DISP_BUTTJOINTBOLTED: "ButtJointBolted",
                KEY_DISP_LAPJOINTWELDED: "LapJointWelded",
                KEY_DISP_LAPJOINTBOLTED: "LapJointBolted",
            }
            print("module_type_mapping: ", module_type_mapping)
            print("module_id: ", module_id)
            session_type = module_type_mapping.get(module_id)
            if not session_type:
                return error_json_response('unknown_module', f"Unknown module type: {module_id}", 400)
                
        except json.JSONDecodeError:
            return error_json_response('invalid_json', "Invalid JSON in request body", 400)
        except Exception as e:
            return error_json_response('internal_error', f"Error parsing request: {str(e)}", 500)
        
        # Directory setup
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # repo_root points to project root (.../Osdag-web)
        repo_root = os.path.abspath(os.path.join(current_dir, "../../../../../"))
        backend_root = os.path.join(repo_root, "backend")
    
        # Determine sections based on the session type and what each backend module expects
        if session_type == "FinPlateConnection":
            sections = ["Model", "Beam", "Column", "Plate", "Bolt", "Weld"]
        elif session_type == "CleatAngle":
            sections = ["Model", "Beam", "Column", "cleatAngle", "Bolt", "Weld"]
        elif session_type == "EndPlate":
            sections = ["Model", "Beam", "Column", "Plate", "Bolt", "Weld"]
        elif session_type == "SeatedAngleConnection":
            sections = ["Model", "Beam", "Column", "SeatedAngle", "Bolt", "Weld"]
        elif session_type == "CoverPlateBolted":
            sections = ["Model", "Beam", "CoverPlate", "Bolt"]
        elif session_type == "BeamBeamEndPlate":
            sections = ["Model", "Beam", "Connector", "Bolt", "Weld"]
        elif session_type == "CoverPlateWelded":
            sections = ["Model", "Beam", "Connector", "Weld"]
        elif session_type == "BeamToColumnEndPlate":
            sections = ["Model", "Beam", "Column", "Connector", "Bolt", "Weld"]
        elif session_type == "ColumnCoverPlateBolted":
            sections = ["Model", "Column", "CoverPlate", "Bolt"]
        elif session_type == "ColumnCoverPlateWelded":
            sections = ["Model", "Column", "CoverPlate", "Weld"]
        elif session_type == "ColumnEndPlate":
            sections = ["Model", "Column", "Connector", "Bolt", "Weld"]
        elif session_type == "TensionMember":
            sections = ["Model", "Member", "Plate", "Endplate"]
        elif session_type in ("ButtJointWelded", "ButtJointBolted", "LapJointWelded", "LapJointBolted"):
            sections = ["Model", "Column", "Plate"]
        else:
            return error_json_response('unknown_module', "Unknown module type", 400)
        
        print(f"[cadissue] cad_model_api: module_id={module_id}, session_type={session_type}, sections={sections}")

        # initialize the empty dictionary to hold model data and collect errors
        output_files = {}
        error_details = []
        print("Design sections: ", sections)
        
        # Generate a unique session identifier for this CAD generation
        import uuid
        session_id = str(uuid.uuid4())
        
        for section in sections:
            print(f"[cadissue] Generating section: {section}")
            try:
                if not hasattr(module_api, 'create_cad_model'):
                    error_details.append({"section": section, "error": "create_cad_model not implemented"})
                    continue
                print(f"[cad_model_api] Calling create_cad_model for section '{section}' with session_id={session_id}")
                path = module_api.create_cad_model(input_values, section, session_id)

                if not path:
                    print(f'[cad_model_api] Error generating {section}: create_cad_model() returned None or empty string')
                    continue  # Skip to the next section
                
                print(f'[cad_model_api] {section} generated successfully, returned path: {path}')
                print(f"[cadissue] create_cad_model returned path for section={section}: {path}")

                # Resolve returned path. Modules typically return "file_storage/..."
                base_root = repo_root
                if os.path.isabs(path):
                    path_to_file = path
                else:
                    # Prefer project root; fall back to backend root (where CAD generators write)
                    path_repo_root = os.path.join(repo_root, path)
                    path_backend_root = os.path.join(backend_root, path)
                    if os.path.exists(path_repo_root):
                        path_to_file = path_repo_root
                    elif os.path.exists(path_backend_root):
                        path_to_file = path_backend_root
                        base_root = backend_root
                    else:
                        # Default to repo root for error reporting
                        path_to_file = path_repo_root
                print(f"[cad_model_api] Resolved path for section '{section}': {path_to_file} (base_root={base_root})")
                print(f"[cadissue] Path resolution for section={section}: {path_to_file}, exists={os.path.exists(path_to_file)}")
                if not os.path.exists(path_to_file):
                    msg = f'Generated file for {section} does not exist at: {path_to_file}'
                    print(msg)
                    error_details.append({"section": section, "error": msg})
                    continue

                stl_path = path_to_file.replace(".brep", ".stl")
                print(f"[cadissue] Looking for STL for section={section} at: {stl_path}")
                import base64
                try:
                    if os.path.exists(stl_path):
                        print(f"[cad_model_api] Using STL for section '{section}': {stl_path}")
                        with open(stl_path, "rb") as f:
                            b64 = base64.b64encode(f.read()).decode("ascii")
                        output_files[section] = f"data:application/octet-stream;base64,{b64}"
                        print(f"[cad_model_api] Loaded STL for {section}")
                        print(f"[cadissue] Stored STL entry for section={section}")
                    else:
                        print(f"[cad_model_api] STL missing for section '{section}', falling back to BREP: {path_to_file}")
                        with open(path_to_file, "rb") as f:
                            b64 = base64.b64encode(f.read()).decode("ascii")
                        output_files[section] = f"data:application/octet-stream;base64,{b64}"
                        print(f"[cad_model_api] Loaded BREP for {section}")
                        print(f"[cadissue] Stored BREP entry for section={section}")

                    # If this is the merged Model, also try to include per-part STLs from manifest
                    if section == "Model":
                        try:
                            manifest_path = path_to_file.replace(".brep", ".parts.json")
                            if os.path.exists(manifest_path):
                                print(f"[cad_model_api] Found manifest at {manifest_path}")
                                import json as _json
                                with open(manifest_path, "r", encoding="utf-8") as mf:
                                    manifest = _json.load(mf)
                                parts = manifest.get("parts", [])
                                print(f"[cad_model_api] Manifest parts count: {len(parts)}")
                                for entry in parts:
                                    name = entry.get("name")
                                    stl_rel = entry.get("stlPath")
                                    brep_rel = entry.get("brepPath")
                                    if not name:
                                        continue
                                    # Prefer STL
                                    part_file_abs = None
                                    part_base_roots = [base_root, repo_root]
                                    if stl_rel:
                                        for root in part_base_roots:
                                            candidate = os.path.join(root, stl_rel)
                                            if os.path.exists(candidate):
                                                part_file_abs = candidate
                                                print(f"[cad_model_api] Part '{name}' using STL {candidate}")
                                                break
                                    if not part_file_abs and brep_rel:
                                        for root in part_base_roots:
                                            candidate = os.path.join(root, brep_rel)
                                            if os.path.exists(candidate):
                                                part_file_abs = candidate
                                                print(f"[cad_model_api] Part '{name}' using BREP {candidate}")
                                                break
                                    if part_file_abs:
                                        # Prefer manifest part files for accuracy, even if section already populated
                                        with open(part_file_abs, "rb") as pf:
                                            b64p = base64.b64encode(pf.read()).decode("ascii")
                                        output_files[name] = f"data:application/octet-stream;base64,{b64p}"
                                        print(f"[cad_model_api] Loaded part {name} from manifest (overrides section if existed)")
                        except Exception as me:
                            print(f"Failed to load parts from manifest: {me}")
                except Exception as e:
                    print(f"Failed reading model file for {section}: {e}")
                    error_details.append({"section": section, "error": f"Failed reading file: {str(e)}"})
                    continue
                
            except Exception as e:
                print(f"Exception while generating {section}: {e}")
                error_details.append({"section": section, "error": str(e)})
                
        print(f"[cad_model_api] Final output_files keys: {list(output_files.keys())}")
        print(f"[cadissue] Final output_files keys: {list(output_files.keys())}")

        if not output_files:
            # Unprocessable due to inputs or environment; include details to aid debugging
            return error_json_response('cad_generation_failed', "No CAD models were generated.", 422, errors=error_details)
                
        # Build hover_dict if possible using module APIs (e.g., FinPlateConnection)
        # hover_dict is populated in output_details() which is called from output_values()
        hover_dict = {}
        try:
            if hasattr(module_api, 'create_from_input') and callable(module_api.create_from_input):
                mdl = module_api.create_from_input(input_values)
                
                # Call output_values() to populate hover_dict (output_details is called internally)
                # This ensures hover_dict is populated before we try to access it
                if hasattr(mdl, 'output_values') and callable(mdl.output_values):
                    try:
                        # Call output_values with flag=True to populate hover_dict
                        mdl.output_values(True)
                        print(f"[cad_model_api] Called output_values(), hover_dict populated: {getattr(mdl, 'hover_dict', None)}")
                    except Exception as output_err:
                        print(f"[cad_model_api] Error calling output_values(): {output_err}")
                        import traceback
                        traceback.print_exc()
                
                # Now get hover_dict after it's been populated
                cand = getattr(mdl, 'hover_dict', None)
                if isinstance(cand, dict) and len(cand) > 0:
                    hover_dict = cand
                    print(f"[cad_model_api] Retrieved hover_dict: {hover_dict}")
                else:
                    print(f"[cad_model_api] hover_dict is empty or not a dict: {cand}")
                    # Minimal fallback for Bolt info when detailed dict is not available
                    bolt_grade = None
                    bolt_dia = None
                    try:
                        grades = input_values.get('Bolt.Grade') or []
                        dias = input_values.get('Bolt.Diameter') or []
                        if isinstance(grades, list) and grades:
                            bolt_grade = grades[-1]
                        if isinstance(dias, list) and dias:
                            bolt_dia = dias[-1]
                    except Exception:
                        pass
                    if bolt_grade or bolt_dia:
                        parts = []
                        if bolt_grade:
                            parts.append(f"Grade: {bolt_grade}")
                        if bolt_dia:
                            parts.append(f"Diameter: {bolt_dia} mm")
                        hover_dict['Bolt'] = ' '.join(parts)
        except Exception as _e:
            # Log the error but don't fail the request
            print(f"[cad_model_api] Error building hover_dict: {_e}")
            import traceback
            traceback.print_exc()
        return JsonResponse({
            "status": "success",
            "files": output_files,
            "message": "CAD models generated successfully",
            "warnings": error_details,  # include any partial failures
            "hover_dict": hover_dict
        }, status=201)
