"""
CAD Generation Helper Functions
Extracted from legacy cad_model_api.py for reuse in new module-based endpoints
"""
import os
import uuid
import base64
import json as json_module
from typing import Dict, List, Any, Optional


# Sections mapping for each module/submodule
SECTION_MAPPINGS = {
    'shear-connection': {
        'fin-plate': ['Beam', 'Column', 'Plate'],
        'cleat-angle': ['Model', 'Beam', 'Column', 'cleatAngle'],
        'end-plate': ['Model', 'Beam', 'Column', 'Plate'],
        'seated-angle': ['Model', 'Beam', 'Column', 'SeatedAngle'],
    },
    'moment-connection': {
        'beam-beam-cover-plate-bolted': ['Model', 'Beam', 'CoverPlate'],
        'beam-beam-cover-plate-welded': ['Model', 'Beam', 'CoverPlate'],
        'beam-beam-end-plate': ['Model', 'Beam', 'EndPlate'],
        'beam-column-end-plate': ['Model', 'Beam', 'Column', 'Connector'],
        'column-column-cover-plate-bolted': ['Model', 'Column', 'CoverPlate'],
        'column-column-cover-plate-welded': ['Model', 'Column', 'CoverPlate'],
        'column-column-end-plate': ['Model', 'Column', 'Connector'],
    },
    'simple-connection': {
        'lap-joint-bolted': ['Model', 'Plate 1', 'Plate 2', 'Bolts'],
        'lap-joint-welded': ['Model', 'Plate 1', 'Plate 2', 'Welds'],
        'butt-joint-bolted': ['Model', 'Plate 1', 'Plate 2', 'Cover Plate', 'Bolts'],
        'butt-joint-welded': ['Model', 'Plate 1', 'Plate 2', 'Cover Plate', 'Welds'],
    },
    'tension-member': {
        'bolted': ['Model', 'Member', 'Plate', 'Endplate'],
        'welded': ['Model', 'Member', 'Plate', 'Endplate'],
    },
    'flexure-member': {
        'simply-supported-beam': [],  # TODO: Add sections when available
    },
    'base-plate': {
        'base-plate': ['Model', 'Column', 'Plate'],
    },
    'compression-member': {
        'struts-bolted': ['Model', 'Member'],
        'axially-loaded-column': ['Model'],
    },
}


def get_default_sections(module_name: str, submodule_slug: str) -> List[str]:
    """
    Get default sections for a module/submodule combination.
    
    Args:
        module_name: Parent module name (e.g., 'shear-connection')
        submodule_slug: Submodule slug (e.g., 'fin-plate')
        
    Returns:
        List of section names to generate
    """
    return SECTION_MAPPINGS.get(module_name, {}).get(submodule_slug, ['Model'])


def resolve_file_path(path: str, repo_root: str, backend_root: str) -> tuple[str, str]:
    """
    Resolve a relative or absolute file path to an absolute path.
    
    Args:
        path: File path (relative or absolute)
        repo_root: Repository root directory
        backend_root: Backend root directory
        
    Returns:
        Tuple of (absolute_path, base_root)
    """
    if os.path.isabs(path):
        return path, repo_root
    
    # Try repo root first, then backend root
    path_repo_root = os.path.join(repo_root, path)
    path_backend_root = os.path.join(backend_root, path)
    
    if os.path.exists(path_repo_root):
        return path_repo_root, repo_root
    elif os.path.exists(path_backend_root):
        return path_backend_root, backend_root
    else:
        # Default to repo root for error reporting
        return path_repo_root, repo_root


def generate_cad_models(
    service_class,
    inputs: Dict[str, Any],
    sections: Optional[List[str]] = None,
    session_id: Optional[str] = None,
    create_from_input_func=None
) -> Dict[str, Any]:
    """
    Generate CAD models for given sections using a service class.
    
    Args:
        service_class: Service class with get_cad_model method
        inputs: Design input parameters
        sections: List of sections to generate (if None, uses default)
        session_id: Session identifier (if None, generates UUID)
        create_from_input_func: Optional function to create module instance for hover_dict
        
    Returns:
        Dictionary with:
        - 'files': Dict mapping section names to base64-encoded file data
        - 'hover_dict': Dict mapping part names to hover tooltip text
        - 'warnings': List of warning/error dicts
    """
    # Get repository and backend roots
    current_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(current_dir, "../../../../"))
    backend_root = os.path.join(repo_root, "backend")
    
    # Generate session ID if not provided
    if session_id is None:
        session_id = str(uuid.uuid4())
    
    # Initialize output
    output_files = {}
    error_details = []
    
    # Generate CAD for each section
    for section in sections:
        print(f"[cad_helpers] Generating section: {section}")
        try:
            # Check if service has get_cad_model method
            if not hasattr(service_class, 'get_cad_model'):
                error_details.append({
                    "section": section,
                    "error": "get_cad_model not implemented in service"
                })
                continue
            
            # Call service to generate CAD
            print(f"[cad_helpers] Calling get_cad_model for section '{section}'")
            path = service_class.get_cad_model(inputs, section, session_id)
            
            if not path:
                print(f'[cad_helpers] Error generating {section}: get_cad_model() returned None or empty string')
                error_details.append({
                    "section": section,
                    "error": "get_cad_model returned empty path"
                })
                continue
            
            print(f'[cad_helpers] {section} generated successfully, returned path: {path}')
            
            # Resolve file path
            path_to_file, base_root = resolve_file_path(path, repo_root, backend_root)
            print(f"[cad_helpers] Resolved path for section '{section}': {path_to_file}")
            
            if not os.path.exists(path_to_file):
                msg = f'Generated file for {section} does not exist at: {path_to_file}'
                print(msg)
                error_details.append({"section": section, "error": msg})
                continue
            
            # Try STL first, fall back to BREP
            stl_path = path_to_file.replace(".brep", ".stl")
            try:
                if os.path.exists(stl_path):
                    print(f"[cad_helpers] Using STL for section '{section}': {stl_path}")
                    with open(stl_path, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode("ascii")
                    output_files[section] = f"data:application/octet-stream;base64,{b64}"
                    print(f"[cad_helpers] Loaded STL for {section}")
                else:
                    print(f"[cad_helpers] STL missing for section '{section}', falling back to BREP")
                    with open(path_to_file, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode("ascii")
                    output_files[section] = f"data:application/octet-stream;base64,{b64}"
                    print(f"[cad_helpers] Loaded BREP for {section}")
                
                # If this is the merged Model, also try to include per-part STLs from manifest
                if section == "Model":
                    try:
                        manifest_path = path_to_file.replace(".brep", ".parts.json")
                        if os.path.exists(manifest_path):
                            print(f"[cad_helpers] Found manifest at {manifest_path}")
                            with open(manifest_path, "r", encoding="utf-8") as mf:
                                manifest = json_module.load(mf)
                            parts = manifest.get("parts", [])
                            print(f"[cad_helpers] Manifest parts count: {len(parts)}")
                            
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
                                            print(f"[cad_helpers] Part '{name}' using STL {candidate}")
                                            break
                                
                                if not part_file_abs and brep_rel:
                                    for root in part_base_roots:
                                        candidate = os.path.join(root, brep_rel)
                                        if os.path.exists(candidate):
                                            part_file_abs = candidate
                                            print(f"[cad_helpers] Part '{name}' using BREP {candidate}")
                                            break
                                
                                if part_file_abs:
                                    with open(part_file_abs, "rb") as pf:
                                        b64p = base64.b64encode(pf.read()).decode("ascii")
                                    output_files[name] = f"data:application/octet-stream;base64,{b64p}"
                                    print(f"[cad_helpers] Loaded part {name} from manifest")
                    except Exception as me:
                        print(f"[cad_helpers] Failed to load parts from manifest: {me}")
                        
            except Exception as e:
                print(f"[cad_helpers] Failed reading model file for {section}: {e}")
                error_details.append({
                    "section": section,
                    "error": f"Failed reading file: {str(e)}"
                })
                continue
                
        except Exception as e:
            print(f"[cad_helpers] Exception while generating {section}: {e}")
            import traceback
            traceback.print_exc()
            error_details.append({"section": section, "error": str(e)})
    
    print(f"[cad_helpers] Final output_files keys: {list(output_files.keys())}")
    
    # Build hover_dict if create_from_input function is provided
    hover_dict = {}
    if create_from_input_func:
        try:
            mdl = create_from_input_func(inputs)
            
            # Call output_values() to populate hover_dict
            if hasattr(mdl, 'output_values') and callable(mdl.output_values):
                try:
                    mdl.output_values(True)
                    print(f"[cad_helpers] Called output_values(), hover_dict populated")
                except Exception as output_err:
                    print(f"[cad_helpers] Error calling output_values(): {output_err}")
                    import traceback
                    traceback.print_exc()
            
            # Get hover_dict after it's been populated
            cand = getattr(mdl, 'hover_dict', None)
            if isinstance(cand, dict) and len(cand) > 0:
                hover_dict = cand
                if "Weld" in hover_dict and "Welds" not in hover_dict:
                    hover_dict["Welds"] = hover_dict["Weld"]
                print(f"[cad_helpers] Retrieved hover_dict: {hover_dict}")
            else:
                print(f"[cad_helpers] hover_dict is empty or not a dict: {cand}")
                # Minimal fallback for Bolt info
                bolt_grade = None
                bolt_dia = None
                try:
                    grades = inputs.get('Bolt.Grade') or []
                    dias = inputs.get('Bolt.Diameter') or []
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
        except Exception as e:
            print(f"[cad_helpers] Error building hover_dict: {e}")
            import traceback
            traceback.print_exc()
    
    return {
        'files': output_files,
        'hover_dict': hover_dict,
        'warnings': error_details
    }

