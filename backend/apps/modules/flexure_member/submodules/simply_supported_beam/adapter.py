"""
Simply Supported Beam Adapter
Implements the business logic directly (not re-exporting from osdag_api)
"""
from osdag_core.Common import KEY_DISP_FLEXURE
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
)
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.design_type.flexural_member.flexure import Flexure
import sys
import os
from typing import Dict, Any, List
import json

old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log


def get_required_keys() -> List[str]:
    """Return all required input parameters for the module."""
    return [
        "Module",                   # KEY_MODULE
        "Member.Profile",           # KEY_SEC_PROFILE
        "Member.Designation",       # KEY_SECSIZE
        "Material",                 # KEY_MATERIAL
        "Member.Material",          # KEY_SEC_MATERIAL
        "Design.Design_Method",     # KEY_DESIGN_TYPE_FLEXURE
        "Design.Allowable_Class",   # KEY_ALLOW_CLASS
        "Design.Effective_Area_Parameter", # KEY_EFFECTIVE_AREA_PARA
        "Length.Overwrite",         # KEY_LENGTH_OVERWRITE
        "Bearing.Length",           # KEY_BEARING_LENGTH
        "Load.Shear",               # KEY_SHEAR
        "Load.Moment",              # KEY_MOMENT
        "Member.Length",            # KEY_LENGTH
        "Support.Type",             # KEY_SUPPORT
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
        'Design.Allowable_Class': input_values.get('Design.Allowable_Class', ''),
        'Design.Effective_Area_Parameter': input_values.get('Design.Effective_Area_Parameter', ''),
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
    """Generate, format and return the output values from the given input values."""
    module = create_from_input(input_values)
    output = {}
    logs = getattr(module, 'logs', []) if hasattr(module, 'logs') else []
    raw_output_text = module.output_values(True)
    raw_output_spacing = module.spacing(True)
    raw_output = raw_output_spacing + raw_output_text
    for param in raw_output:
        if len(param) > 2 and param[2] == "TextBox":
            key = param[0]
            label = param[1]
            value = param[3]
            output[key] = {
                "key": key,
                "label": label,
                "val": value
            }
    return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    # CAD generation not yet implemented for Simply Supported Beam
    # Return empty string as per osdag_api implementation
    return ""
