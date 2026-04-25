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
from apps.core.models import Design
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.core.module_finder import developed_modules, get_module_api
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
            
            # Normalize hyphenated ids to backend ids
            module_aliases = {
                # legacy hyphenated
                "ButtJointWelded": "ButtJointWelded",
                "ButtJointBolted": "ButtJointBolted",
                "LapJointWelded": "LapJointWelded",
                "LapJointBolted": "LapJointBolted",
                "Beam-to-Beam-Cover-Plate-Bolted-Connection": "Cover-Plate-Bolted-Connection",
                "Beam-to-Beam-Cover-Plate-Welded-Connection": "Cover-Plate-Welded-Connection",
                "Beam-Beam-End-Plate-Connection": "Beam-Beam-End-Plate-Connection",
                "Beam-to-Column-End-Plate-Connection": "Beam-to-Column-End-Plate-Connection",
                "Column-to-Column-Cover-Plate-Bolted-Connection": "ColumnCoverPlateBolted",
                "Column-to-Column-Cover-Plate-Welded-Connection": "Column-to-Column-Cover-Plate-Welded-Connection",
                "Column-to-Column-End-Plate-Connection": "Column-to-Column-End-Plate-Connection",
                # slug forms
                "butt-joint-welded": "ButtJointWelded",
                "butt-joint-bolted": "ButtJointBolted",
                "lap-joint-welded": "LapJointWelded",
                "lap-joint-bolted": "LapJointBolted",
                # shear slugs
                "shear-connection/fin-plate": "FinPlateConnection",
                "shear-connection/cleat-angle": "CleatAngleConnection",
                "shear-connection/end-plate": "EndPlateConnection",
                "shear-connection/seated-angle": "SeatedAngleConnection",
                # moment slugs
                "moment-connection/beam-beam-cover-plate-bolted": "Cover-Plate-Bolted-Connection",
                "moment-connection/beam-beam-cover-plate-welded": "Cover-Plate-Welded-Connection",
                "moment-connection/beam-beam-end-plate": "Beam-Beam-End-Plate-Connection",
                "moment-connection/beam-column-end-plate": "Beam-to-Column-End-Plate-Connection",
                "moment-connection/column-column-cover-plate-bolted": "ColumnCoverPlateBolted",
                "moment-connection/column-column-cover-plate-welded": "Column-to-Column-Cover-Plate-Welded-Connection",
                "moment-connection/column-column-end-plate": "Column-to-Column-End-Plate-Connection",
                # moment keys
                "CoverPlateBolted": "Cover-Plate-Bolted-Connection",
                "CoverPlateWelded": "Cover-Plate-Welded-Connection",
                "BeamBeamEndPlate": "Beam-Beam-End-Plate-Connection",
                "BeamColumnEndPlate": "Beam-to-Column-End-Plate-Connection",
                "CCCoverPlateBolted": "ColumnCoverPlateBolted",
                "CCCoverPlateWelded": "Column-to-Column-Cover-Plate-Welded-Connection",
                "CCEndPlate": "Column-to-Column-End-Plate-Connection",
                # simple slugs already mapped above
            }
            resolved_module_id = module_aliases.get(module_id, module_id)

            # Get module API
            module_api = get_module_api(resolved_module_id)
            
            # Determine session type from resolved module id
            module_type_mapping = {
                "FinPlateConnection": "FinPlateConnection",
                "CleatAngleConnection": "CleatAngle", 
                "EndPlateConnection": "EndPlate",
                "SeatedAngleConnection": "SeatedAngleConnection",
                "Cover-Plate-Bolted-Connection": "CoverPlateBolted",
                "Beam-Beam-End-Plate-Connection": "BeamBeamEndPlate",
                "Cover-Plate-Welded-Connection": "CoverPlateWelded",
                "Beam-to-Column-End-Plate-Connection": "BeamToColumnEndPlate",
                "ColumnCoverPlateBolted": "ColumnCoverPlateBolted",
                "Column-to-Column-Cover-Plate-Welded-Connection": "ColumnCoverPlateWelded",
                "Column-to-Column-End-Plate-Connection": "ColumnEndPlate",
                "Tension-Member-Bolted-Design": "TensionMember",
                "Tension-Member-Welded-Design": "TensionMember",
                "ButtJointWelded": "ButtJointWelded",
                "ButtJointBolted": "ButtJointBolted",
                "LapJointWelded": "LapJointWelded",
                "LapJointBolted": "LapJointBolted",
            }
            print("module_type_mapping: ", module_type_mapping)
            print("resolved_module_id: ", resolved_module_id)
            session_type = module_type_mapping.get(resolved_module_id)
            if not session_type:
                return JsonResponse({"status": "error", "message": f"Unknown module type: {module_id}"}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Error parsing request: {str(e)}"}, status=500)
        
        # Directory setup
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # repo_root points to project root (.../Osdag-web)
        repo_root = os.path.abspath(os.path.join(current_dir, "../../../../../"))
        backend_root = os.path.join(repo_root, "backend")
    
        # Determine sections based on the session type and what each backend module expects
        if session_type == "FinPlateConnection":
            sections = ["Beam", "Column", "Plate"]
        elif session_type == "CleatAngle":
            sections = ["Model", "Beam", "Column", "cleatAngle"]
        elif session_type == "EndPlate":
            sections = ["Model", "Beam", "Column", "Plate"]
        elif session_type == "SeatedAngleConnection":
            sections = ["Model", "Beam", "Column", "SeatedAngle"]
        elif session_type == "CoverPlateBolted":
            sections = ["Model", "Beam", "CoverPlate"]
        elif session_type == "BeamBeamEndPlate":
            sections = ["Model", "Beam", "Connector"]
        elif session_type == "CoverPlateWelded":
            sections = ["Model", "Beam", "Connector"]
        elif session_type == "BeamToColumnEndPlate":
            sections = ["Model", "Beam", "Column", "Connector"]
        elif session_type == "ColumnCoverPlateBolted":
            sections = ["Model", "Column", "CoverPlate"]
        elif session_type == "ColumnCoverPlateWelded":
            sections = ["Model", "Column", "CoverPlate"]
        elif session_type == "ColumnEndPlate":
            sections = ["Model", "Column", "Connector"]
        elif session_type == "TensionMember":
            sections = ["Model", "Member", "Plate", "Endplate"]
        elif session_type in ("ButtJointWelded", "ButtJointBolted", "LapJointWelded", "LapJointBolted"):
            sections = ["Model", "Column", "Plate"]
        else:
            return JsonResponse({"status": "error", "message": "Unknown module type"}, status=400)
        
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
            return JsonResponse({"status": "error", "message": "No CAD models were generated.", "errors": error_details}, status=422)
                
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
