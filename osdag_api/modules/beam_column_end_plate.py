from osdag_api.validation_utils import validate_arr, validate_num, validate_string
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
import osdag_api.modules.moment_connection_common as scc
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from design_type.connection.beam_column_end_plate import BeamColumnEndPlate
import sys
import os
import typing
import traceback
import logging
from typing import Dict, Any, List

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
# Create handlers
c_handler = logging.StreamHandler()
f_handler = logging.FileHandler('beam_column_endplate_module.log')
c_handler.setLevel(logging.INFO)
f_handler.setLevel(logging.DEBUG)
# Create formatters and add it to handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
c_handler.setFormatter(formatter)
f_handler.setFormatter(formatter)
# Add handlers to the logger
logger.addHandler(c_handler)
logger.addHandler(f_handler)

# Suppress output when necessary
old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log


def get_required_keys() -> List[str]:
    return [
        "Bolt.Bolt_Hole_Type",
        "Bolt.Diameter",
        "Bolt.Grade",
        "Bolt.Slip_Factor",
        "Bolt.TensionType",
        "Bolt.Type",
        "Connectivity",
        "EndPlateType",
        "Connector.Material",
        "Design.Design_Method",
        "Detailing.Corrosive_Influences",
        "Detailing.Edge_type",
        "Detailing.Gap",
        "Load.Axial",
        "Load.Shear",
        "Load.Moment",
        "Material",
        "Member.Supported_Section.Designation",
        "Member.Supported_Section.Material",
        "Member.Supporting_Section.Designation",
        "Member.Supporting_Section.Material",
        "Module",
        "Weld.Fab",
        "Weld.Material_Grade_OverWrite",
        "Weld.Type",
        "Connector.Plate.Thickness_List",
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""

    # Check if all required keys exist
    required_keys = get_required_keys()
    # Check if input_values contains all required keys.
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys != None:  # If keys are missing.
        # Raise error for the first missing key.
        raise MissingKeyError(missing_keys[0])

    # Validate key types one by one:

    # Validate Bolt.Bolt_Hole_Type.
    # Check if Bolt.Bolt_Hole_Type is a string.
    if not isinstance(input_values["Bolt.Bolt_Hole_Type"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type", "str")

     # Validate Bolt.Diameter.
    bolt_diameter = input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter, list)  # Check if Bolt.Diameter is a list.
            # Check if all items in Bolt.Diameter are str.
            or not validate_list_type(bolt_diameter, str)
            or not custom_list_validation(bolt_diameter, int_able)):  # Check if all items in Bolt.Diameter can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Bolt.Diameter", "non empty List[str] where all items can be converted to int")

    # Validate Bolt.Grade
    bolt_grade = input_values["Bolt.Grade"]
    if (not isinstance(bolt_grade, list)  # Check if Bolt.Grade is a list.
            # Check if all items in Bolt.Grade are str.
            or not validate_list_type(bolt_grade, str)
            or not custom_list_validation(bolt_grade, float_able)):  # Check if all items in Bolt.Grade can be converted to float.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Bolt.Grade", "non empty List[str] where all items can be converted to float")

    # Validate Bolt.Slip_Factor
    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor, str)  # Check if Bolt.Slip_Factor is a string.
            or not float_able(bolt_slipfactor)):  # Check if Bolt.Slip_Factor can be converted to float.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Bolt.Slip_Factor", "str where str can be converted to float")

    # Validate Bolt.TensionType
    # Check if Bolt.TensionType is a string.
    if not isinstance(input_values["Bolt.TensionType"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Bolt.TensionType", "str")

    # Validate Bolt.Type
    # Check if Bolt.Type is a string.
    if not isinstance(input_values["Bolt.Type"], str):
        raise InvalidInputTypeError("Bolt.Type", "str")  # If not, raise error.

    # Validate Connectivity
    # Check if Connectivity is a string.
    if not isinstance(input_values["Connectivity"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Connectivity", "str")

    # Validate EndPlateType
    # Check if EndPlateType is a string.
    if not isinstance(input_values["EndPlateType"], str):
        # If not, raise error.
        raise InvalidInputTypeError("EndPlateType", "str")

    # Validate Connector.Material
    # Check if Connector.Material is a string.
    if not isinstance(input_values["Connector.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Connector.Material", "str")

    # Validate Design.Design_Method
    # Check if Design.Design_Method is a string.
    if not isinstance(input_values["Design.Design_Method"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Design.Design_Method", "str")

    # Validate Detailing.Corrosive_Influences
    # Check if Detailing.Corrosive_Influences is 'Yes' or 'No'.
    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Detailing.Corrosive_Influences", "'Yes' or 'No'")

    # Validate Detailing.Edge_type
    # Check if Detailing.Edge_type is a string.
    if not isinstance(input_values["Detailing.Edge_type"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Detailing.Edge_type", "str")

    # Validate Detailing.Gap
    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str)  # Check if Detailing.Gap is a string.
            or not int_able(detailing_gap)):  # Check if Detailing.Gap can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Detailing.Gap", "str where str can be converted to int")

    # Validate Load.Axial
    load_axial = input_values["Load.Axial"]
    if (not isinstance(load_axial, str)  # Check if Load.Axial is a string.
            or not int_able(load_axial)):  # Check if Load.Axial can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Load.Axial", "str where str can be converted to int")

    # Validate Load.Shear
    load_shear = input_values["Load.Shear"]
    if (not isinstance(load_shear, str)  # Check if Load.Shear is a string.
            or not int_able(load_shear)):  # Check if Load.Shear can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Load.Shear", "str where str can be converted to int")

    # Validate Load.Moment
    load_moment = input_values["Load.Moment"]
    if (not isinstance(load_moment, str)  # Check if Load.Moment is a string.
            or not int_able(load_moment)):  # Check if Load.Moment can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Load.Moment", "str where str can be converted to int")

    # Validate Material
    # Check if Material is a string.
    if not isinstance(input_values["Material"], str):
        raise InvalidInputTypeError("Material", "str")  # If not, raise error.

    # Validate Member.Supported_Section.Designation
    # Check if Member.Supported_Section.Designation is a string.
    if not isinstance(input_values["Member.Supported_Section.Designation"], str):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Member.Supported_Section.Designation", "str")

    # Validate Member.Supported_Section.Material
    # Check if Member.Supported_Section.Material is a string.
    if not isinstance(input_values["Member.Supported_Section.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Member.Supported_Section.Material", "str")

    # Validate Member.Supporting_Section.Designation
    # Check if Member.Supporting_Section.Designation is a string.
    if not isinstance(input_values["Member.Supporting_Section.Designation"], str):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Member.Supporting_Section.Designation", "str")

    # Validate Member.Supporting_Section.Material
    # Check if Member.Supporting_Section.Material is a string.
    if not isinstance(input_values["Member.Supporting_Section.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Member.Supporting_Section.Material", "str")

    # Validate Module
    # Check if Module is a string.
    if not isinstance(input_values["Module"], str):
        raise InvalidInputTypeError("Module", "str")  # If not, raise error.

    # Validate Weld.Fab
    # Check if Weld.Fab is a string.
    if not isinstance(input_values["Weld.Fab"], str):
        raise InvalidInputTypeError("Weld.Fab", "str")  # If not, raise error.

    # Validate Weld.Type
    # Check if Weld.Type is a string.
    if not isinstance(input_values["Weld.Type"], str):
        raise InvalidInputTypeError("Weld.Type", "str")  # If not, raise error.

    # Validate Weld.Material_Grade_OverWrite
    weld_materialgradeoverwrite = input_values["Weld.Material_Grade_OverWrite"]
    if (not isinstance(weld_materialgradeoverwrite, str)  # Check if Weld.Material_Grade_OverwWite is a string.
            or not int_able(weld_materialgradeoverwrite)):  # Check if Weld.Material_Grade_OverWrite can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Weld.Material_Grade_OverWrite", "str where str can be converted to int.")

    # Validate Connector.Plate.Thickness_List
    connector_plate_thicknesslist = input_values["Connector.Plate.Thickness_List"]
    if (not isinstance(connector_plate_thicknesslist, list)  # Check if Connector.Plate.Thickness_List is a list.
            # Check if all items in Connector.Plate.Thickness_List are str.
            or not validate_list_type(connector_plate_thicknesslist, str)
            or not custom_list_validation(connector_plate_thicknesslist, int_able)):  # Check if all items in Connector.Plate.Thickness_List can be converted to int.
        raise InvalidInputTypeError(
            "Connector.Plate.Thickness_List", "List[str] where all items can be converted to int")


def validate_input_new(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    logger.info("Validating input values using new method")

    # Check if all required keys exist
    required_keys = get_required_keys()
    logger.debug(f"Required keys: {required_keys}")
    
    # Check if input_values contains all required keys.
    missing_keys = contains_keys(input_values, required_keys)
    logger.debug(f"Missing keys: {missing_keys}")
    
    if missing_keys is not None:  # If keys are missing.
        # Raise error for the first missing key.
        logger.error(f"Missing key detected: {missing_keys[0]}")
        raise MissingKeyError(missing_keys[0])

    # Validate key types using loops.
    try:
        # Validate all strings.
        str_keys = ["Bolt.Bolt_Hole_Type",  # List of all parameters that are strings
                    "Bolt.TensionType",
                    "Bolt.Type",
                    "Connectivity",
                    "EndPlateType",
                    "Connector.Material",
                    "Design.Design_Method",
                    "Detailing.Edge_type",
                    "Material",
                    "Member.Supported_Section.Designation",
                    "Member.Supported_Section.Material",
                    "Member.Supporting_Section.Designation",
                    "Member.Supporting_Section.Material",
                    "Module",
                    "Weld.Fab",
                    "Weld.Type"]
                    
        logger.debug(f"Validating string keys: {str_keys}")
        for key in str_keys:  # Loop through all keys.
            logger.debug(f"Validating string key: {key}")
            try:
                # Check if the value for the key is a string. If not, raise error.
                if key in input_values:
                    if not isinstance(input_values[key], str):
                        logger.error(f"Key {key} should be a string but got {type(input_values[key])}")
                        raise InvalidInputTypeError(key, "str")
                    logger.debug(f"Key {key} validated successfully")
                else:
                    logger.warning(f"Key {key} not found in input_values")
            except Exception as e:
                logger.error(f"Error validating string key {key}: {str(e)}")
                logger.error(traceback.format_exc())
                raise

        # Validate for keys that are numbers
        num_keys = [("Bolt.Slip_Factor", True),  # List of all parameters that are numbers (key, is_float)
                    ("Detailing.Gap", False),
                    ("Load.Axial", False),
                    ("Load.Shear", False),
                    ("Load.Moment", False),
                    ("Weld.Material_Grade_OverWrite", False)]
                    
        logger.debug(f"Validating number keys: {num_keys}")
        for key_info in num_keys:  # Loop through all keys.
            key, is_float = key_info
            logger.debug(f"Validating number key: {key}, is_float: {is_float}")
            try:
                # Check if key is a string that can be converted to a number. If not, raise error.
                if key in input_values:
                    value = input_values[key]
                    if not isinstance(value, str):
                        logger.error(f"Key {key} should be a string but got {type(value)}")
                        raise InvalidInputTypeError(key, "str where str can be converted to " + ("float" if is_float else "int"))
                    if is_float:
                        if not float_able(value):
                            logger.error(f"Key {key} should be convertible to float but got '{value}'")
                            raise InvalidInputTypeError(key, "str where str can be converted to float")
                    else:
                        if not int_able(value):
                            logger.error(f"Key {key} should be convertible to int but got '{value}'")
                            raise InvalidInputTypeError(key, "str where str can be converted to int")
                    logger.debug(f"Key {key} validated successfully")
                else:
                    logger.warning(f"Key {key} not found in input_values")
            except Exception as e:
                logger.error(f"Error validating number key {key}: {str(e)}")
                logger.error(traceback.format_exc())
                raise

        # Validate for keys that are arrays
        arr_keys = [("Bolt.Diameter", False),  # List of all parameters that can be converted to numbers (key, is_float)
                    ("Bolt.Grade", True),
                    ("Connector.Plate.Thickness_List", False)]
                    
        logger.debug(f"Validating array keys: {arr_keys}")
        for key_info in arr_keys:
            key, is_float = key_info
            logger.debug(f"Validating array key: {key}, is_float: {is_float}")
            try:
                # Check if key is a list where all items can be converted to numbers. If not, raise error.
                if key in input_values:
                    value = input_values[key]
                    if not isinstance(value, list):
                        logger.error(f"Key {key} should be a list but got {type(value)}")
                        raise InvalidInputTypeError(key, "list")
                    if not validate_list_type(value, str):
                        logger.error(f"Key {key} should be a list of strings")
                        raise InvalidInputTypeError(key, "list of strings")
                    if is_float:
                        if not custom_list_validation(value, float_able):
                            logger.error(f"Key {key} should be a list of strings convertible to float")
                            raise InvalidInputTypeError(key, "list of strings convertible to float")
                    else:
                        if not custom_list_validation(value, int_able):
                            logger.error(f"Key {key} should be a list of strings convertible to int")
                            raise InvalidInputTypeError(key, "list of strings convertible to int")
                    logger.debug(f"Key {key} validated successfully")
                else:
                    logger.warning(f"Key {key} not found in input_values")
            except Exception as e:
                logger.error(f"Error validating array key {key}: {str(e)}")
                logger.error(traceback.format_exc())
                raise
                
        logger.info("Input validation completed successfully")
        
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        logger.error(traceback.format_exc())
        raise


def create_module() -> BeamColumnEndPlate:
    """Create an instance of the Beam Column End plate connection module design class and set it up for use"""
    logger.info("Creating BeamColumnEndPlate module instance")
    try:
        module = BeamColumnEndPlate()  # Create an instance of the BeamColumnEndPlate
        logger.debug("BeamColumnEndPlate instance created successfully")
        module.set_osdaglogger(None)
        logger.debug("OSDAGLogger set to None")
        return module
    except Exception as e:
        logger.error(f"Error creating BeamColumnEndPlate module: {str(e)}")
        logger.error(traceback.format_exc())
        raise


def create_from_input(input_values: Dict[str, Any]) -> BeamColumnEndPlate:
    """Create an instance of the Beam Column End plate connection module design class from input values."""
    logger.info("Creating module from input values")
    
    # Validate input values first to catch issues early
    try:
        logger.debug("Validating input values")
        validate_input(input_values)
        logger.debug("Input validation successful")
    except Exception as e:
        logger.error(f"Input validation failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    try:
        logger.debug("Creating module instance")
        module = create_module()  # Create module instance.
        logger.debug("Module instance created successfully")
    except Exception as e:
        logger.error(f"Error in create_module: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    # Set the input values on the module instance.
    try:
        logger.debug("Setting input values on module instance")
        logger.debug(f"Input values: {input_values}")
        module.set_input_values(input_values)
        logger.debug("Input values set successfully")
    except Exception as e:
        logger.error(f"Error in set_input_values: {str(e)}")
        logger.error(traceback.format_exc())
        raise

    logger.info("Module created and initialized with input values successfully")
    return module

def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate, format and return formatted output"""
    output = {}
    module = create_from_input(input_values)

    # Get raw output data
    raw_output_text = module.output_values(True)
    detailing = module.detailing(True)
    continuity_plate_details = module.continuity_plate_details(True)
    stiffener_plate_details = module.web_stiffener_plate_details(True)
    stiffener_details = module.stiffener_details(True)
    stiffener_detailing = module.stiffener_detailing(True)
    weld_details = module.weld_details(True)

    logs = module.logs
    raw_output = (
        raw_output_text +
        detailing + continuity_plate_details +
        stiffener_plate_details + stiffener_details +
        stiffener_detailing + weld_details 
    )

    # Format output
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
    return output, logs



def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    logger.info(f"Creating CAD model for section: {section}, session: {session}")
    
    # Validate section value
    if section not in ("Model", "Beam", "Column", "EndPlate"):  # Error checking: If section is valid.
        logger.error(f"Invalid section: {section}")
        raise InvalidInputTypeError("section", "'Model', 'Beam', 'Column' or 'EndPlate'")
    
    try:
        # Create module from input
        logger.debug("Creating module from input values")
        module = create_from_input(input_values)
        logger.debug(f"Module created: {module}")
        logger.debug(f"Connectivity: {module.connectivity}")
        logger.debug(f"Module: {module.module}")
        logger.debug(f"Main module: {module.mainmodule}")
    except Exception as e:
        logger.error(f"Error creating module from input: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    try:
        # Object that will create the CAD model
        logger.debug("Creating CommonDesignLogic instance")
        cld = CommonDesignLogic(None, '', module.module, module.mainmodule)
        logger.debug("CommonDesignLogic instance created successfully")
    except Exception as e:
        logger.error(f"Error creating CommonDesignLogic: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    try:
        # Setup the calculations object for generating CAD model
        logger.debug("Setting up CAD model calculation")
        scc.setup_for_cad(cld, module)
        logger.debug("CAD model calculation setup successful")
    except Exception as e:
        logger.error(f"Error in setup_for_cad: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    # The section of the module that will be generated
    cld.component = section
    logger.debug(f"Set component to: {section}")
    
    try:
        # Generate CAD Model
        logger.debug("Creating 2D CAD model")
        model = cld.create2Dcad()
        logger.debug("2D CAD model created successfully")
    except Exception as e:
        logger.error(f"Error in create2Dcad: {str(e)}")
        logger.error(traceback.format_exc())
        # Return appropriate error to the caller
        return ""
    
    # Check if the cad_models folder exists or not
    # If no, then create one
    cad_models_dir = os.path.join(os.getcwd(), "file_storage/cad_models/")
    if not os.path.exists(cad_models_dir):
        logger.info(f"Creating directory: {cad_models_dir}")
        try:
            os.makedirs(cad_models_dir, exist_ok=True)
            logger.debug(f"Directory {cad_models_dir} created successfully")
        except Exception as e:
            logger.error(f"Error creating directory {cad_models_dir}: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    logger.debug(f"2D model object: {model}")
    
    # Generate file names and paths
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name
    logger.debug(f"BREP file path: {file_path}")
    
    try:
        # Write model to file
        logger.debug(f"Writing model to BREP file: {file_path}")
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())
        logger.info(f"CAD model successfully written to: {file_path}")
    except Exception as e:
        logger.error(f"Writing to BREP file failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    return file_path