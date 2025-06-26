from Common import KEY_DISP_FLEXURE
from osdag_api.validation_utils import validate_arr, validate_num, validate_string
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from cad.common_logic import CommonDesignLogic
from design_type.flexural_member.flexure import Flexure
import sys
import os
from typing import Dict, Any, List

old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log

def get_required_keys() -> List[str]:
    # These should match the keys expected by Flexure.input_values()
    return [
        "Module",
        "Member.Profile",           # KEY_SEC_PROFILE
        "Member.Designation",       # KEY_SECSIZE
        "Material",                 # KEY_MATERIAL
        "Member.Material",          # KEY_SEC_MATERIAL
        "Design.Design_Method",     # KEY_DP_DESIGN_METHOD
        "Design.Allowable_Class",   # KEY_ALLOW_CLASS
        "Design.Effective_Area_Parameter", # KEY_EFFECTIVE_AREA_PARA
        "Design.Length_Overwrite",  # KEY_LENGTH_OVERWRITE
        "Design.Bearing_Length",    # KEY_BEARING_LENGTH
        "Load.Shear",               # KEY_SHEAR
        "Load.Moment",              # KEY_MOMENT
        "Member.Length",            # KEY_LENGTH
        "Support.Type",             # KEY_SUPPORT
        "Torsional.Restraint",      # KEY_TORSIONAL_RES
        "Warping.Restraint",        # KEY_WARPING_RES
    ]

def validate_input(input_values: Dict[str, Any]) -> None:
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys is not None:
        raise MissingKeyError(missing_keys[0])
    # Add type checks as needed (example: string, float, etc.)
    # For brevity, only presence is checked here.

def create_module() -> Flexure:
    module = Flexure()
    module.set_osdaglogger(None)
    return module

def create_from_input(input_values: Dict[str, Any]) -> Flexure:
    module = create_module()
    # Map input_values to Flexure expected keys
    # This mapping may need to be adjusted based on actual frontend/backend contract
    design_dict = {
        # These keys must match what Flexure.set_input_values expects
        'Module': input_values.get('Module', 'Simply-Supported-Beam'),
        'SectionProfile': input_values.get('Member.Profile', ''),
        'SectionList': input_values.get('Member.Designation', ''),
        'Material': input_values.get('Material', ''),
        'SectionMaterial': input_values.get('Member.Material', ''),
        'DesignTypeFlexure': input_values.get('Design.Design_Method', ''),
        'AllowClass': input_values.get('Design.Allowable_Class', ''),
        'EffectiveAreaPara': input_values.get('Design.Effective_Area_Parameter', ''),
        'LengthOverwrite': input_values.get('Design.Length_Overwrite', ''),
        'BearingLength': input_values.get('Design.Bearing_Length', ''),
        'Shear': input_values.get('Load.Shear', ''),
        'Moment': input_values.get('Load.Moment', ''),
        'Length': input_values.get('Member.Length', ''),
        'Support': input_values.get('Support.Type', ''),
        'TorsionalRestraint': input_values.get('Torsional.Restraint', ''),
        'WarpingRestraint': input_values.get('Warping.Restraint', ''),
    }
    # The actual keys must match those used in Flexure.set_input_values
    # You may need to adjust the above mapping
    module.set_input_values(design_dict)
    return module

def generate_output(input_values: Dict[str, Any]):
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
                "value": value
            }
    return output, logs

def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    # Stub for now
    return "" 