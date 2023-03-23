"""
Api for Fin Plate Connection module
Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Go through all the input parameters.
        Check if all required parameters are given.
        Check if all parameters are of correct data type.
"""
from design_type.connection.fin_plate_connection import FinPlateConnection
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, validate_list_type
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
import typing
from typing import Dict, Any, List
import os
os.system("clear") # Clear terminal

def get_required_keys() -> List[str]:
    return [
        "Bolt.Bolt_Hole_Type",
        "Bolt.Diameter",
        "Bolt.Grade",
        "Bolt.Slip_Factor",
        "Bolt.TensionType",
        "Bolt.Type",
        "Connectivity",
        "Connector.Material",
        "Design.Design_Method",
        "Detailing.Corrosive_Influences",
        "Detailing.Edge_type",
        "Detailing.Gap",
        "Load.Axial",
        "Load.Shear",
        "Material",
        "Member.Supported_Section.Designation",
        "Member.Supported_Section.Material",
        "Member.Supporting_Section.Designation",
        "Member.Supporting_Section.Material",
        "Module",
        "Weld.Fab",
        "Weld.Material_Grade_OverWrite",
        "Connector.Plate.Thickness_List",
    ]

def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""

    # Check if all required keys exist
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys) # Check if input_values contains all required keys.
    if missing_keys != None: # If keys are missing.
        raise MissingKeyError(missing_keys[0]) # Raise error for the first missing key.
    
    # Validate key types one by one:
    # Validate Bolt.Bolt_Hole_Type.
    if not isinstance(input_values["Bolt.Bolt_Hole_Type"], str): # Check if Bolt.Bolt_Hole_Type is a string.
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type", "str") # If not, raise error.
    
     # Validate Bolt.Diameter.
    bolt_diameter = input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter, list) # Check if Bolt.Diameter is a list.
            or not validate_list_type(bolt_diameter, str) # Check if all items in Bolt.Diameter are str.
            or not custom_list_validation(bolt_diameter, int_able)): # Check if all items in Bolt.Diameter can be converted to int.
        raise InvalidInputTypeError("Bolt.Diameter", "non empty List[str] where all items can be converted to int") # If any of these conditions fail, raise error.
    
    # Validate Bolt.Grade
    bolt_grade = input_values["Bolt.Grade"]
    if (not isinstance(bolt_grade, list) # Check if Bolt.Grade is a list.
            or not validate_list_type(bolt_grade, str) # Check if all items in Bolt.Grade are str.
            or not custom_list_validation(bolt_grade, float_able)): # Check if all items in Bolt.Grade can be converted to float.
        raise InvalidInputTypeError("Bolt.Grade", "non empty List[str] where all items can be converted to float") # If any of these conditions fail, raise error.

    # Validate Bolt.Slip_Factor
    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor, str) # Check if Bolt.Slip_Factor is str.
            or not float_able(bolt_slipfactor)): # Check if Bolt.Slip_Factor can be converted to float.
        raise InvalidInputTypeError("Bolt.Slip_Factor", "str where str can be converted to float") # If any of these conditions fail, raise error.
    
