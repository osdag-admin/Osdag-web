"""
Tension Member - Welded Design Adapter
Implements the business logic directly (not re-exporting from osdag_api)
"""
from osdag_core.Common import KEY_DISP_TENSION_WELDED
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    build_raw_output_dict,
)
from apps.modules.tension_member import shared as tbm
from osdag_core.design_type.tension_member.tension_welded import Tension_welded
import sys
import typing
from typing import Dict, Any, List

def get_required_keys() -> List[str]:
    """Return all required input parameters for the module."""
    return [
        "Member.Profile",           # KEY_SEC_PROFILE
        "Member.Designation",       # KEY_SECSIZE
        "Material",                 # KEY_MATERIAL
        "Member.Material",          # KEY_SEC_MATERIAL
        "Connector.Plate.Thickness_List",  # KEY_PLATETHK
        "Connector.Material",      # KEY_CONNECTOR_MATERIAL
        "Design.Design_Method",    # KEY_DP_DESIGN_METHOD
        "Detailing.Corrosive_Influences",  # KEY_DP_DETAILING_CORROSIVE_INFLUENCES
        "Detailing.Edge_type",     # KEY_DP_DETAILING_EDGE_TYPE
        "Detailing.Gap",          # KEY_DP_DETAILING_GAP
        "Load.Axial",             # KEY_AXIAL
        "Member.Length",          # KEY_LENGTH
        "Conn_Location",          # KEY_LOCATION
        "Module"                  # KEY_MODULE
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys is not None:
        raise MissingKeyError(missing_keys[0])

    # Validate Connector.Material
    if not isinstance(input_values["Connector.Material"], str):
        raise InvalidInputTypeError("Connector.Material", "str")

    # Validate Design.Design_Method
    if not isinstance(input_values["Design.Design_Method"], str):
        raise InvalidInputTypeError("Design.Design_Method", "str")

    # Validate Detailing.Corrosive_Influences
    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]):
        raise InvalidInputTypeError("Detailing.Corrosive_Influences", "'Yes' or 'No'")

    # Validate Detailing.Edge_type
    if not isinstance(input_values["Detailing.Edge_type"], str):
        raise InvalidInputTypeError("Detailing.Edge_type", "str")

    # Validate Detailing.Gap
    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str)
            or not int_able(detailing_gap)):
        raise InvalidInputTypeError("Detailing.Gap", "str where str can be converted to int")

    # Validate Load.Axial
    load_axial = input_values["Load.Axial"]
    if (not isinstance(load_axial, str)
            or not int_able(load_axial)):
        raise InvalidInputTypeError("Load.Axial", "str where str can be converted to int")

    # Validate Material
    if not isinstance(input_values["Material"], str):
        raise InvalidInputTypeError("Material", "str")

    # Validate Member.Profile
    if not isinstance(input_values["Member.Profile"], str):
        raise InvalidInputTypeError("Member.Profile", "str")

    # Validate Member.Designation
    section_designation = input_values["Member.Designation"]

    if (not isinstance(section_designation, list)
            or not validate_list_type(section_designation, str)):
        raise InvalidInputTypeError("Member.Designation", "List[str]")

    # Validate Member.Length
    if not isinstance(input_values["Member.Length"], str):
        raise InvalidInputTypeError("Member.Length", "str")

    # Validate Conn_Location
    if not isinstance(input_values["Conn_Location"], str):
        raise InvalidInputTypeError("Conn_Location", "str")

    # Validate Module
    if not isinstance(input_values["Module"], str):
        raise InvalidInputTypeError("Module", "str")

    # Validate Connector.Plate.Thickness_List
    connector_plate_thicknesslist = input_values["Connector.Plate.Thickness_List"]
    if (not isinstance(connector_plate_thicknesslist, list)
            or not validate_list_type(connector_plate_thicknesslist, str)
            or not custom_list_validation(connector_plate_thicknesslist, int_able)):
        raise InvalidInputTypeError("Connector.Plate.Thickness_List", "List[str] where all items can be converted to int")


def create_module() -> Tension_welded:
    """Create an instance of the Tension_welded module design class and set it up for use"""
    module = Tension_welded()
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]) -> Tension_welded:
    """Create an instance of the Tension_welded module design class from input values."""
    module = create_module()
    # Plate.Thickness expects a list, take the first value if present, else ""
    if isinstance(input_values.get("Connector.Plate.Thickness_List", None), list) and input_values["Connector.Plate.Thickness_List"]:
        input_values["Plate.Thickness"] = input_values["Connector.Plate.Thickness_List"][0]
    else:
        input_values["Plate.Thickness"] = ""
    
    # Auto-normalize Conn_Location for Channels / Angles
    profile = input_values.get("Member.Profile", "")
    if profile in ["Channels", "Back to Back Channels"]:
        input_values["Conn_Location"] = "Web"
    elif profile in ["Angles", "Back to Back Angles", "Star Angles"] and input_values.get("Conn_Location") not in ["Long Leg", "Short Leg"]:
        input_values["Conn_Location"] = "Long Leg"

    # Set weld defaults
    input_values["Weld.Material_Grade_OverWrite"] = "410"
    input_values["Weld.Fab"] = "Shop Weld"
    module.set_input_values(input_values)
    return module


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate, format and return the output values from the given input values."""
    output = {}
    raw_csv = {}
    module = create_from_input(input_values)

    # Get raw output data
    raw_output_text = module.output_values(True)
    raw_output_spacing = module.spacing(True)

    from osdag_core.custom_logger import CustomLogger

    if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs() or []
    else:
        logs = getattr(module, "logs", []) or []

    raw_output = raw_output_spacing + raw_output_text
    raw_csv = build_raw_output_dict(raw_output)

    for param in raw_output:
        if param[2] == "TextBox":
            key = param[0]
            label = param[1]
            value = param[3]
            output[key] = {
                "key": key,
                "label": label,
                "val": value
            }
    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv


def _get_connector_shape(t_obj):
    """Connector part shape for welded: weld model."""
    shapes = []
    if hasattr(t_obj, "get_welded_models"):
        w = t_obj.get_welded_models()
        if w is not None:
            shapes.append(w)
    return tbm.fuse_shapes(shapes)


def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    module = create_from_input(input_values)
    return tbm.create_cad_model(module, KEY_DISP_TENSION_WELDED, _get_connector_shape, section, session, export_formats)
