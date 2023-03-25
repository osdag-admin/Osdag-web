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
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
from osdag_api.validation_utils import validate_arr, validate_num, validate_string
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
    if (not isinstance(bolt_slipfactor, str) # Check if Bolt.Slip_Factor is a string.
            or not float_able(bolt_slipfactor)): # Check if Bolt.Slip_Factor can be converted to float.
        raise InvalidInputTypeError("Bolt.Slip_Factor", "str where str can be converted to float") # If any of these conditions fail, raise error.
    
    # Validate Bolt.TensionType
    if not isinstance(input_values["Bolt.TensionType"], str): # Check if Bolt.TensionType is a string.
        raise InvalidInputTypeError("Bolt.TensionType", "str") # If not, raise error.

    # Validate Bolt.Type
    if not isinstance(input_values["Bolt.Type"], str): # Check if Bolt.Type is a string.
        raise InvalidInputTypeError("Bolt.Type", "str") # If not, raise error.
    
    # Validate Connectivity
    if not isinstance(input_values["Connectivity"], str): # Check if Connectivity is a string.
        raise InvalidInputTypeError("Connectivity", "str") # If not, raise error.

    # Validate Connector.Material
    if not isinstance(input_values["Connector.Material"], str): # Check if Connector.Material is a string.
        raise InvalidInputTypeError("Connector.Material", "str") # If not, raise error.
    
    # Validate Design.Design_Method
    if not isinstance(input_values["Design.Design_Method"], str): # Check if Design.Design_Method is a string.
        raise InvalidInputTypeError("Design.Design_Method", "str") # If not, raise error.

    # Validate Detailing.Corrosive_Influences
    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]): # Check if Detailing.Corrosive_Influences is 'Yes' or 'No'.
        raise InvalidInputTypeError("Detailing.Corrosive_Influences", "'Yes' or 'No'") # If not, raise error.

    # Validate Detailing.Edge_type
    if not isinstance(input_values["Detailing.Edge_type"], str): # Check if Detailing.Edge_type is a string.
        raise InvalidInputTypeError("Detailing.Edge_type", "str") # If not, raise error.

    # Validate Detailing.Gap
    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str) # Check if Detailing.Gap is a string.
            or not int_able(detailing_gap)): # Check if Detailing.Gap can be converted to int.
        raise InvalidInputTypeError("Detailing.Gap", "str where str can be converted to int") # If any of these conditions fail, raise error.

    # Validate Load.Axial
    load_axial = input_values["Load.Axial"]
    if (not isinstance(load_axial, str) # Check if Load.Axial is a string.
            or not int_able(load_axial)): # Check if Load.Axial can be converted to int.
        raise InvalidInputTypeError("Load.Axial", "str where str can be converted to int") # If any of these conditions fail, raise error.

    # Validate Load.Shear
    load_shear = input_values["Load.Shear"]
    if (not isinstance(load_shear, str) # Check if Load.Shear is a string.
            or not int_able(load_shear)): # Check if Load.Shear can be converted to int.
        raise InvalidInputTypeError("Load.Shear", "str where str can be converted to int") # If any of these conditions fail, raise error.

    # Validate Material
    if not isinstance(input_values["Material"], str): # Check if Material is a string.
        raise InvalidInputTypeError("Material", "str") # If not, raise error.

    # Validate Member.Supported_Section.Designation
    if not isinstance(input_values["Member.Supported_Section.Designation"], str): # Check if Member.Supported_Section.Designation is a string.
        raise InvalidInputTypeError("Member.Supported_Section.Designation", "str") # If not, raise error.

    # Validate Member.Supported_Section.Material
    if not isinstance(input_values["Member.Supported_Section.Material"], str): # Check if Member.Supported_Section.Material is a string.
        raise InvalidInputTypeError("Member.Supported_Section.Material", "str") # If not, raise error.
    
    # Validate Member.Supporting_Section.Designation
    if not isinstance(input_values["Member.Supporting_Section.Designation"], str): # Check if Member.Supporting_Section.Designation is a string.
        raise InvalidInputTypeError("Member.Supporting_Section.Designation", "str") # If not, raise error.

    # Validate Member.Supporting_Section.Material
    if not isinstance(input_values["Member.Supporting_Section.Material"], str): # Check if Member.Supporting_Section.Material is a string.
        raise InvalidInputTypeError("Member.Supporting_Section.Material", "str") # If not, raise error.

    # Validate Module
    if not isinstance(input_values["Module"], str): # Check if Module is a string.
        raise InvalidInputTypeError("Module", "str") # If not, raise error.

    # Validate Weld.Fab
    if not isinstance(input_values["Weld.Fab"], str): # Check if Weld.Fab is a string.
        raise InvalidInputTypeError("Weld.Fab", "str") # If not, raise error.

    # Validate Weld.Material_Grade_OverWrite
    weld_materialgradeoverwrite = input_values["Weld.Material_Grade_OverWrite"]
    if (not isinstance(weld_materialgradeoverwrite, str) # Check if Weld.Material_Grade_OverwWite is a string.
            or not int_able(weld_materialgradeoverwrite)): # Check if Weld.Material_Grade_OverWrite can be converted to int.
        raise InvalidInputTypeError("Weld.Material_Grade_OverWrite", "str where str can be converted to int.") # If any of these conditions fail, raise error.

    # Validate Connector.Plate.Thickness_List
    connector_plate_thicknesslist = input_values["Connector.Plate.Thickness_List"]
    if (not isinstance(connector_plate_thicknesslist, list) # Check if Connector.Plate.Thickness_List is a list.
            or not validate_list_type(connector_plate_thicknesslist, str) # Check if all items in Connector.Plate.Thickness_List are str.
            or not custom_list_validation(connector_plate_thicknesslist, int_able)): # Check if all items in Connector.Plate.Thickness_List can be converted to int.
        raise InvalidInputTypeError("Connector.Plate.Thickness_List", "List[str] where all items can be converted to int")

def validate_input_new(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""

    # Check if all required keys exist
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys) # Check if input_values contains all required keys.
    if missing_keys != None: # If keys are missing.
        raise MissingKeyError(missing_keys[0]) # Raise error for the first missing key.
    
    # Validate key types using loops.

    # Validate all strings.
    str_keys = ["Bolt.Bolt_Hole_Type", # List of all parameters that are strings
                "Bolt.TensionType",
                "Bolt.Type",
                "Bolt.Connectivity",
                "Bolt.Connector_Material",
                "Design.Design_Method",
                "Detailing.Edge_type",
                "Material",
                "Member.Supported_Section.Designation",
                "Member.Supported_Section.Material",
                "Member.Supporting_Section.Designation",
                "Member.Supporting_Section.Material",
                "Module",
                "Weld.Fab"]
    for key in str_keys: # Loop through all keys.
        validate_string(key) # Check if key is a string. If not, raise error.
    
    # Validate for keys that are numbers
    num_keys = [("Bolt.Slip_Factor", True) # List of all parameters that are numbers (key,)
                ("Detailing.Gap", False),
                ("Load.Axial", False),
                ("Load.Shear", False),
                ("Weld.Material_Grade_OverWrite", False)]
    for key in num_keys: # Loop through all keys.
        validate_num(key[0], key[1]) # Check if key is a number. If not, raise error.
    
    # Validate for keys that are arrays
    arr_keys = [("Bolt.Diameter", False),
                ("Bolt.Grade", True),
                ("Connector.Plate.Thickness_List", False)]
    for key in arr_keys:
        validate_arr(key[0], key[1]) # Check if key is a list where all items can be converted to numbers. If not, raise error.
