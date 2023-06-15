"""
Api for Fin Plate Connection module
Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Go through all the input parameters.
        Check if all required parameters are given.
        Check if all parameters are of correct data type.
    create_module() -> FinPlateConnection:
        Create an instance of the fin plate connection module design class and set it up for use
    create_from_input(input_values: Dict[str, Any]) -> FinPlateConnection
        Create an instance of the fin plate connection module design class from input values.
    generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
        Generate, format and return the input values from the given output values.
            Output format (json): {
                "Bolt.Pitch": 
                    "key": "Bolt.Pitch",
                    "label": "Pitch Distance (mm)"
                    "value": 40
                }
            }
    create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
        Generate the CAD model from input values as a BREP file. Return file path.
"""
import sys
import os
import typing
from typing import Dict, Any, List
old_stdout = sys.stdout # Backup log
sys.stdout = open(os.devnull, "w") # redirect stdout
from design_type.connection.fin_plate_connection import FinPlateConnection # Will log a lot of unnessecary data.
from cad.common_logic import CommonDesignLogic
from OCC.Core import BRepTools
import osdag_api.modules.shear_connection_common as scc
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
from osdag_api.validation_utils import validate_arr, validate_num, validate_string
sys.stdout = old_stdout # Reset log

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
    num_keys = [("Bolt.Slip_Factor", True) # List of all parameters that are numbers (key, is_float)
                ("Detailing.Gap", False),
                ("Load.Axial", False),
                ("Load.Shear", False),
                ("Weld.Material_Grade_OverWrite", False)]
    for key in num_keys: # Loop through all keys.
        validate_num(key[0], key[1]) # Check if key is a number. If not, raise error.
    
    # Validate for keys that are arrays
    arr_keys = [("Bolt.Diameter", False), # List of all parameters that can be converted to numbers (key, is_float)
                ("Bolt.Grade", True),
                ("Connector.Plate.Thickness_List", False)]
    for key in arr_keys:
        validate_arr(key[0], key[1]) # Check if key is a list where all items can be converted to numbers. If not, raise error.

def create_module() -> FinPlateConnection:
    """Create an instance of the fin plate connection module design class and set it up for use"""
    module = FinPlateConnection() # Create an instance of the FinPlateConnection
    module.set_osdaglogger(None)
    return module

def create_from_input(input_values: Dict[str, Any]) -> FinPlateConnection:
    """Create an instance of the fin plate connection module design class from input values."""
    validate_input(input_values)
    module = create_module() # Create module instance.
    module.set_input_values(input_values) # Set the input values on the module instance.
    return module
def generate_ouptut(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate, format and return the input values from the given output values.
    Output format (json): {
        "Bolt.Pitch": 
            "key": "Bolt.Pitch",
            "label": "Pitch Distance (mm)"
            "value": 40
        }
    }
    """
    output = {} # Dictionary for formatted values
    module = create_from_input(input_values) # Create module from input.
    raw_output_text = module.output_values(True) # Generate output values in unformatted form.
    raw_output_spacing = module.spacing(True) # Generate output val
    raw_output_capacities = module.capacities(True)
    raw_output = raw_output_capacities + raw_output_spacing + raw_output_text
    os.system("clear")
    # Loop over all the text values and add them to ouptut dict.
    for param in raw_output:
        if param[2] == "TextBox": # If the parameter is a text output,
            key = param[0] # id/key
            label = param[1] # label text.
            value = param[3] # Value as string.
            output[key] = {
                "key": key,
                "label": label,
                "value": value
            } # Set label, key and value in output
    return output

def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    if section not in ("Model", "Beam", "Column", "Plate"): # Error checking: If section is valid.
        raise InvalidInputTypeError("section", "'Model', 'Beam', 'Column' or 'Plate'")
    module = create_from_input(input_values) # Create module from input.
    cld = CommonDesignLogic(None, '', module.module, module.mainmodule) # Object that will create the CAD model.
    scc.setup_for_cad(cld, module) # Setup the calculations object for generating CAD model.
    cld.component = section # The section of the module that will be generated.
    model = cld.create2Dcad() # Generate CAD Model.
    os.system("clear") # clear the terminal
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name
    BRepTools.breptools.Write(model, file_path) # Generate CAD Model
    return file_path

def generate_report(input_values: Dict[str, Any], metadata: Dict[str, Any], report_id: str) -> str:
    """Generate the design report from the input values as a PDF file. Return file path."""
    metadata_profile = { # List of all the required metadata (key: default value)
        "CompanyName": "Your Company",
        "CompanyLogo": "",
        "Group/TeamName": "Your Team",
        "Designer": "You",
    }
    metadata_other = { # List of all the required metadata (key: default value)
        "ProjectTitle": "Fin Plate Connection",
        "Subtitle": "",
        "JobNumber": "1",
        "AdditionalComments": "No Comments",
        "Client": "Someone Else",
    }
    if "Profile_Summary" in metadata.keys(): # Check if profile is provided
        profile = {}
        for key in metadata_profile.keys(): # Go through all the keys in given profile
            if key in metadata["ProfileSummary"].keys(): # if key exists
                profile[key] = metadata["ProfileSummary"][key] # use value
            else: # Otherwise, stick to default value.
                profile[key] = metadata_profile[key]
    else: # Otherwise, stick to default metadata
        profile = metadata_profile
    metadata_final = {"ProfileSummary": profile, "filename": file_path}
    # Add other metadata
    for key in metadata_other.keys(): # Go through all metadata keys
        if key in metadata.keys(): # if key exists
            metadata_final[key] = metadata[key] # Use key
        else: # if not, use default value
            metadata_final[key] = metadata_other[key]
    file_path = "file_storage/design_report/" + report_id
    module = create_from_input(input_values) # Create module from input
    module.save_design(metadata_final) # Create design report
    return file_path
    