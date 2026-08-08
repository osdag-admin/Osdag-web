"""
Simply Supported Beam Adapter
Implements the business logic directly (not re-exporting from osdag_api)
"""
from osdag_core.Common import KEY_DISP_FLEXURE
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    build_raw_output_dict
)
from osdag_core.design_type.flexural_member.flexure import Flexure
from apps.modules.flexure_member import shared as fm_shared
import sys
from typing import Dict, Any, List
import json
import traceback

def get_required_keys() -> List[str]:
    """Return all required input parameters for the module."""
    return [
        "Module",                   # KEY_MODULE
        "Member.Profile",           # KEY_SEC_PROFILE
        "Member.Designation",       # KEY_SECSIZE
        "Material",                 # KEY_MATERIAL
        "Member.Material",          # KEY_SEC_MATERIAL
        "Design.Design_Method",     # KEY_DESIGN_TYPE_FLEXURE
        "Optimum.Class",   # KEY_ALLOW_CLASS
        "Effective.Area_Para", # KEY_EFFECTIVE_AREA_PARA
        "Length.Overwrite",         # KEY_LENGTH_OVERWRITE
        "Bearing.Length",           # KEY_BEARING_LENGTH
        "Load.Shear",               # KEY_SHEAR
        "Load.Moment",              # KEY_MOMENT
        "Member.Length",            # KEY_LENGTH
        "Flexure.Type",             # KEY_SUPPORT
        "Torsion.restraint",        # KEY_TORSIONAL_RES
        "Warping.restraint",        # KEY_WARPING_RES
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys is not None:
        raise MissingKeyError(missing_keys[0])


def create_module() -> Flexure:
    """Create an instance of the Flexure module design class and set it up for use"""
    module = Flexure()
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]) -> Flexure:
    """Create an instance of the Flexure module design class from input values."""
    module = create_module()
    
    # Handle array conversion for Member.Designation
    member_designation = input_values.get('Member.Designation', '')
    if isinstance(member_designation, str):
        if member_designation == '[]':
            member_designation = []
        elif member_designation.startswith('[') and member_designation.endswith(']'):
            # Try to parse as JSON array
            try:
                member_designation = json.loads(member_designation)
            except:
                member_designation = [member_designation]  # Fallback to single item array
    elif not isinstance(member_designation, list):
        member_designation = [str(member_designation)]
    
    # Validate that section designations are provided  
    if not member_designation or member_designation == []:
        print(f"ERROR: No section designations provided! Frontend should populate this from beamList/columnList.")
        member_designation = []
    
    # Map input_values to exact keys expected by Flexure.set_input_values
    design_dict = {
        'Module': input_values.get('Module', 'Simply-Supported-Beam'),
        'Member.Profile': input_values.get('Member.Profile', ''),
        'Member.Designation': member_designation,  # Use processed array
        'Material': input_values.get('Material', ''),
        'Member.Material': input_values.get('Member.Material', ''),
        'Flexure.Type': input_values.get('Flexure.Type', 'Major Laterally Supported'),
        'Optimum.Class': input_values.get('Optimum.Class', ''),
        'Effective.Area_Para': input_values.get('Effective.Area_Para', ''),
        'Length.Overwrite': input_values.get('Length.Overwrite', ''),
        'Bearing.Length': input_values.get('Bearing.Length', ''),
        'Load.Shear': input_values.get('Load.Shear', ''),
        'Load.Moment': input_values.get('Load.Moment', ''),
        'Member.Length': input_values.get('Member.Length', ''),
        'Flexure.Support': input_values.get('Flexure.Support', ''),
        'Torsion.restraint': input_values.get('Torsion.restraint', ''),
        'Warping.restraint': input_values.get('Warping.restraint', ''),
        'Loading.Condition': 'Normal',  # Default loading condition for simply supported beams
    }
    
    module.set_input_values(design_dict)
    return module


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate, format and return formatted output for Flexure Members
    (Simply Supported Beam / Cantilever Beam).
    """

    import traceback
    from osdag_core.custom_logger import CustomLogger

    output = {}
    logs = []
    raw_csv = {}

    try:
        # ------------------------------------
        # Create module from inputs
        # ------------------------------------
        module = create_from_input(input_values)

        # ------------------------------------
        # Collect all output sections safely
        # ------------------------------------
        raw_output = []

        if hasattr(module, "spacing"):
            raw_output += module.spacing(True) or []

        if hasattr(module, "output_values"):
            raw_output += module.output_values(True) or []

        # Optional sections (if exist)
        if hasattr(module, "detail"):
            raw_output += module.detail(True) or []

        if hasattr(module, "detailing"):
            raw_output += module.detailing(True) or []

        raw_csv = build_raw_output_dict(raw_output)

        # ------------------------------------
        # Collect logs properly
        # ------------------------------------
        if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
            logs = module.logger.get_logs() or []
        else:
            logs = getattr(module, "logs", []) or []

        # ------------------------------------
        # Format Output Fields
        # ------------------------------------
        for param in raw_output:
            if not param or len(param) < 4:
                continue

            if param[2] == "TextBox":
                key = param[0]
                label = param[1]
                value = param[3]

                # Convert numpy values safely
                if hasattr(value, "item"):
                    value = value.item()

                output[key] = {
                    "key": key,
                    "label": label,
                    "val": value
                }

        print(f"[generate_output] Generated {len(output)} fields")
        print(f"[generate_output] Retrieved {len(logs)} logs")

    except Exception as e:
        print("Error in generate_output:", str(e))
        print(traceback.format_exc())

    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv


def _get_shapes(cld):
    components = cld.createSimplySupportedBeam()
    return list(components.values()) if components else []


def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    """
    Generate CAD model for Simply Supported Beam.
    Returns relative BREP file path.
    """

    if section not in ("Model", "Beam"):
        raise InvalidInputTypeError("section", "'Model' or 'Beam'")

    # ------------------------------------
    # Create module from inputs
    # ------------------------------------
    module = create_from_input(input_values)

    return fm_shared.create_cad_model(
        module, KEY_DISP_FLEXURE, section, session, _get_shapes,
        no_shapes_message="No components returned from createSimplySupportedBeam()",
    )
