"""
Api for FinPlateConnection module
Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Go through all the input parameters.
        Check if all required parameters are given.
        Check if all parameters are of correct data type.
    create_module() -> FinPlateConnection:
        Create an instance of the FinPlateConnection module design class and set it up for use
    create_from_input(input_values: Dict[str, Any]) -> FinPlateConnection
        Create an instance of the FinPlateConnection module design class from input values.
    generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
        Generate, format and return the input values from the given output values.
            Output format (json): {
                "Bolt.Pitch": 
                    "key": "Bolt.Pitch",
                    "label": "Pitch Distance (mm)"
                    "val": 40
                }
            }
    create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
        Generate the CAD model from input values as a BREP file. Return file path.
"""
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
)
from apps.modules.shear_connection import shared as scc
from OCC.Core import BRepTools
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer

# from OCC.Core.StlAPI import StlAPI_Writer
# from OCC.Core.TopoDS import TopoDS_Solid, TopoDS_Shell
from osdag_core.cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from osdag_core.design_type.connection.fin_plate_connection import FinPlateConnection
from osdag_core.Common import KEY_DISP_FINPLATE, KEY_CONN
from osdag_core.custom_logger import CustomLogger
import sys
import os
import typing
from typing import Dict, Any, List
import traceback
import json
from apps.core.utils import write_stl

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

    # Check if all required keys exist
    required_keys = get_required_keys()
    print('required_keys : ' , required_keys)
    # Check if input_values contains all required keys.
    missing_keys = contains_keys(input_values, required_keys)
    print('missing keys : ' , missing_keys)
    if missing_keys != None:  # If keys are missing.
        # Raise error for the first missing key.
        print("missing keys is not None")
        raise MissingKeyError(missing_keys[0])

    # Validate key types using loops.

    # Validate all strings.
    str_keys = ["Bolt.Bolt_Hole_Type",  # List of all parameters that are strings
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
    for key in str_keys:  # Loop through all keys.
        print('validating string key')
        
        try : 
            validate_string(key) # Check if key is a string. If not, raise error.
        except : 
            print('error in validating string keys')
            print('string key passed  : ' , key )

    # Validate for keys that are numbers
    num_keys = [("Bolt.Slip_Factor", True),  # List of all parameters that are numbers (key, is_float)
                ("Detailing.Gap", False),
                ("Load.Axial", False),
                ("Load.Shear", False),
                ("Weld.Material_Grade_OverWrite", False)]
    for key in num_keys:  # Loop through all keys.
        # Check if key is a number. If not, raise error.
        print('validating num keys')
        validate_num(key[0], key[1])

    # Validate for keys that are arrays
    arr_keys = [("Bolt.Diameter", False),  # List of all parameters that can be converted to numbers (key, is_float)
                ("Bolt.Grade", True),
                ("Connector.Plate.Thickness_List", False)]
    for key in arr_keys:
        print('validating arr key')
        # Check if key is a list where all items can be converted to numbers. If not, raise error.
        validate_arr(key[0], key[1])


def create_module() -> FinPlateConnection:
    """Create an instance of the FinPlateConnection module design class and set it up for use"""
    print("\n[create_module] Creating FinPlateConnection instance...")
    try:
        module = FinPlateConnection()  # Create an instance of the FinPlateConnection
        print(f"   ✅ FinPlateConnection instance created: {id(module)}")
        
        print(f"   Setting logger with id='web'...")
        module.set_osdaglogger(None, id="web")
        print(f"   ✅ Logger set successfully")
        print(f"   Logger name: {getattr(module.logger, 'name', 'N/A') if hasattr(module, 'logger') else 'No logger'}")
        
        return module
    except Exception as e:
        print(f"   ❌ ERROR in create_module: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise


def create_from_input(input_values: Dict[str, Any]) -> FinPlateConnection:
    """Create an instance of the beam beam end plate connection module design class from input values."""
    print("\n" + "=" * 60)
    print("create_from_input() called")
    print("=" * 60)
    print(f"Input values received: {len(input_values)} keys")
    print(f"Sample keys: {list(input_values.keys())[:5]}")
    
    module = None
    print("\n[create_from_input] Step 1: Creating module instance...")
    try:
        module = create_module()  # Create module instance.
        print(f"✅ Module created successfully: {type(module).__name__}")
        print(f"   Module ID: {id(module)}")
    except Exception as e:
        print(f"❌ ERROR in create_module: {type(e).__name__}: {e}")
        print('error in creating module')
        traceback.print_exc()
        raise
    
    # Map frontend keys to osdag_core keys
    # Frontend sends 'Connectivity' but osdag_core expects 'Connectivity *' (KEY_CONN)
    print(f"\n[create_from_input] Step 2: Mapping frontend keys to osdag_core keys...")
    print(f"   KEY_CONN constant value: '{KEY_CONN}'")
    print(f"   'Connectivity' in input_values: {'Connectivity' in input_values}")
    print(f"   KEY_CONN in input_values: {KEY_CONN in input_values}")
    
    design_dictionary = input_values.copy()
    if 'Connectivity' in design_dictionary and KEY_CONN not in design_dictionary:
        connectivity_value = design_dictionary.pop('Connectivity')
        design_dictionary[KEY_CONN] = connectivity_value
        print(f"   ✅ Mapped 'Connectivity' -> '{KEY_CONN}'")
        print(f"   Connectivity value: '{connectivity_value}'")
    else:
        print(f"   ℹ️  No mapping needed (Connectivity already mapped or not present)")
        if KEY_CONN in design_dictionary:
            print(f"   KEY_CONN value: '{design_dictionary[KEY_CONN]}'")
    
    print(f"   Final design_dictionary has {len(design_dictionary)} keys")
    print(f"   Key check - KEY_CONN present: {KEY_CONN in design_dictionary}")
    
    # Set the input values on the module instance.
    print(f"\n[create_from_input] Step 3: Setting input values on module...")
    print(f"   Module is None: {module is None}")
    try:
        if module is None:
            raise RuntimeError('Module instance was not created')
        
        print(f"   Calling module.set_input_values() with {len(design_dictionary)} keys...")
        print(f"   Sample keys being passed: {list(design_dictionary.keys())[:5]}")
        
        module.set_input_values(design_dictionary)
        print(f"   ✅ set_input_values() completed successfully")
        
        # Verify key was set correctly
        if hasattr(module, 'connectivity'):
            print(f"   ✅ Module connectivity attribute: '{module.connectivity}'")
        else:
            print(f"   ⚠️  Module has no 'connectivity' attribute")
            
    except Exception as e:
        print(f"\n❌ ERROR in set_input_values:")
        print(f"   Exception type: {type(e).__name__}")
        print(f"   Exception message: {str(e)}")
        print(f"   Design dictionary keys: {list(design_dictionary.keys())[:10]}")
        print(f"   KEY_CONN in design_dictionary: {KEY_CONN in design_dictionary}")
        if KEY_CONN in design_dictionary:
            print(f"   KEY_CONN value: '{design_dictionary[KEY_CONN]}'")
        traceback.print_exc()
        print('error in setting the input values')
        raise

    print("=" * 60)
    return module


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate, format and return the input values from the given output values.
    Output format (json): {
        "Bolt.Pitch": 
            "key": "Bolt.Pitch",
            "label": "Pitch Distance (mm)"
            "val": 40
        }
    }
    """
    print("\n" + "=" * 60)
    print("generate_output() called")
    print("=" * 60)
    print(f"Input values keys (first 10): {list(input_values.keys())[:10]}")
    
    output = {}  # Dictionary for formatted values
    
    print("\n[Step 1] Creating module from input...")
    try:
        module = create_from_input(input_values)  # Create module from input.
        print(f"✅ Module created: {type(module).__name__}")
        print(f"Module object: {module}")
    except Exception as e:
        print(f"Failed to create module: {e}")
        raise
    
    # Initialize logs variable first
    logs = []
    
    try:
        print("\n[Step 2] Calling module.output_values(True)...")
        print(f"   Module type: {type(module)}")
        print(f"   Module has output_values method: {hasattr(module, 'output_values')}")
        try:
            raw_output_text = module.output_values(True)
            print(f"✅ output_values() returned {len(raw_output_text)} parameters")
            if len(raw_output_text) > 0:
                print(f"   First parameter sample: {raw_output_text[0] if isinstance(raw_output_text[0], (list, tuple)) else 'N/A'}")
        except Exception as e:
            print(f"❌ ERROR in output_values(): {type(e).__name__}: {e}")
            traceback.print_exc()
            raise
        
        print("\n[Step 3] Calling module.spacing(True)...")
        print(f"   Module has spacing method: {hasattr(module, 'spacing')}")
        try:
            raw_output_spacing = module.spacing(True)
            print(f"✅ spacing() returned {len(raw_output_spacing)} parameters")
            if len(raw_output_spacing) > 0:
                print(f"   First spacing parameter: {raw_output_spacing[0] if isinstance(raw_output_spacing[0], (list, tuple)) else 'N/A'}")
        except Exception as e:
            print(f"❌ ERROR in spacing(): {type(e).__name__}: {e}")
            print(f"   Error details: {str(e)}")
            traceback.print_exc()
            raise
        
        print("\n[Step 4] Calling module.capacities(True)...")
        print(f"   Module has capacities method: {hasattr(module, 'capacities')}")
        try:
            raw_output_capacities = module.capacities(True)
            print(f"✅ capacities() returned {len(raw_output_capacities)} parameters")
            if len(raw_output_capacities) > 0:
                print(f"   First capacity parameter: {raw_output_capacities[0] if isinstance(raw_output_capacities[0], (list, tuple)) else 'N/A'}")
        except Exception as e:
            print(f"❌ ERROR in capacities(): {type(e).__name__}: {e}")
            traceback.print_exc()
            raise
        
        print("\n[Step 5] Calling module.section_capacities(True)...")
        print(f"   Module has section_capacities method: {hasattr(module, 'section_capacities')}")
        try:
            raw_output_section_capacities = module.section_capacities(True)
            print(f"✅ section_capacities() returned {len(raw_output_section_capacities)} parameters")
            if len(raw_output_section_capacities) > 0:
                print(f"   First section_capacity parameter: {raw_output_section_capacities[0] if isinstance(raw_output_section_capacities[0], (list, tuple)) else 'N/A'}")
        except Exception as e:
            print(f"❌ ERROR in section_capacities(): {type(e).__name__}: {e}")
            traceback.print_exc()
            raise
        
        print("\n[Step 6] Retrieving logs from logger...")
        # Get logs from the custom logger
        if hasattr(module, 'logger'):
            print(f"   Logger exists: {type(module.logger)}")
            print(f"   Logger name: {getattr(module.logger, 'name', 'N/A')}")
            if isinstance(module.logger, CustomLogger):
                try:
                    logs = module.logger.get_logs()
                    print(f"   ✅ Retrieved {len(logs) if logs else 0} logs from custom logger")
                    if logs and len(logs) > 0:
                        print(f"   First log entry: {logs[0] if isinstance(logs[0], (str, dict)) else 'N/A'}")
                except Exception as e:
                    print(f"   ⚠️ Error getting logs: {e}")
                    logs = []
            else:
                print(f"   ⚠️ Logger is not CustomLogger instance, type: {type(module.logger)}")
                logs = []
        else:
            print("   ⚠️ Module has no logger attribute")
            logs = []

        print("\n[Step 7] Combining all raw outputs...")
        print(f"   raw_output_text length: {len(raw_output_text)}")
        print(f"   raw_output_spacing length: {len(raw_output_spacing)}")
        print(f"   raw_output_capacities length: {len(raw_output_capacities)}")
        print(f"   raw_output_section_capacities length: {len(raw_output_section_capacities)}")
        raw_output = raw_output_text + raw_output_spacing + raw_output_capacities + raw_output_section_capacities
        print(f"✅ Combined raw_output length: {len(raw_output)}")

        print("\n[Step 8] Processing parameters into output dict...")
        processed_count = 0
        skipped_count = 0
        
        # Process each parameter with handling for both 4 and 5 element tuples
        for i, param in enumerate(raw_output):
            if i < 5 or i % 50 == 0:  # Print first 5 and every 50th
                print(f"  Processing param {i}/{len(raw_output)}: {param[:2] if len(param) >= 2 else param}")
            
            # Handle both 4-element and 5-element tuples
            if len(param) >= 4:
                key = param[0]
                label = param[1] 
                param_type = param[2]
                value = param[3]
                
                # Check if it's a TextBox type and has a valid key
                if param_type == "TextBox" and key is not None:
                    # Handle numpy types
                    if hasattr(value, 'item'):  # numpy scalar
                        value = value.item()
                    
                    output[key] = {
                        "key": key,
                        "label": label,
                        "val": value
                    }
                    processed_count += 1
                else:
                    skipped_count += 1
                    if i < 5:  # Only print details for first few
                        print(f"    ⚠️ Skipped: type={param_type}, key={key}")
        
        print(f"✅ Processed {processed_count} parameters, skipped {skipped_count}")
    except Exception as e:
        print("\n" + "=" * 60)
        print("ERROR in generate_output()")
        print("=" * 60)
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print(f"Exception args: {e.args if hasattr(e, 'args') else 'N/A'}")
        
        print(f"\nModule state at error:")
        if 'module' in locals():
            print(f"   Module exists: {module is not None}")
            if module:
                print(f"   Module type: {type(module)}")
                print(f"   Module has logger: {hasattr(module, 'logger')}")
                if hasattr(module, 'connectivity'):
                    print(f"   Module connectivity: {module.connectivity}")
                if hasattr(module, 'design_status'):
                    print(f"   Module design_status: {module.design_status}")
        
        # Check if exception has error attribute
        if hasattr(e, 'error'):
            print(f"Exception has 'error' attribute: {e.error}")
            if e.error is None:
                print("⚠️ WARNING: Exception.error is None!")
        
        print(f"\nFull traceback:")
        traceback.print_exc()
        print("=" * 60)
        raise
        
        print("\nFull traceback:")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        
        # Re-raise the exception so service layer can handle it
        raise
    
    print("\n" + "=" * 60)
    print("✅ generate_output() completed successfully")
    print("=" * 60)
    print(f"Final output dict has {len(output)} keys")
    print(f"Output keys (first 10): {list(output.keys())[:10]}")
    print(f"Logs count: {len(logs) if logs else 0}")
    if logs:
        print(f"First log entry (original order): {logs[0] if len(logs) > 0 else 'N/A'}")
        print(f"Last log entry (original order):  {logs[-1] if len(logs) > 0 else 'N/A'}")

    print("=" * 60)
    
    return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    if section not in ("Model", "Beam", "Column", "Plate"):  # Error checking: If section is valid.
        raise InvalidInputTypeError(
            "section", "'Model', 'Beam', 'Column' or 'Plate'")
    module = create_from_input(input_values)  # Create module from input.
    print('module from input values : ' , module)
    print('module.module value:', repr(module.module))
    # IMPORTANT: Ensure module.module is set to KEY_DISP_FINPLATE for CAD generation
    # module.module might be overwritten by input dictionary value
    if module.module != KEY_DISP_FINPLATE:
        print(f'WARNING: module.module is {repr(module.module)}, setting to KEY_DISP_FINPLATE')
        module.module = KEY_DISP_FINPLATE
    # Object that will create the CAD model.
    # CommonDesignLogic signature: (display, cad_widget, folder, connection, mainmodule)
    # connection should be KEY_DISP_FINPLATE ('FinPlateConnection') for proper CAD generation
    # Force use of KEY_DISP_FINPLATE since module.module might be set to input value (e.g., "FinPlateConnection")
    # instead of the display constant ("FinPlateConnection")
    connection_key = KEY_DISP_FINPLATE
    print('Using connection key:', repr(connection_key))
    print('KEY_DISP_FINPLATE value:', repr(KEY_DISP_FINPLATE))
    try : 
        cld = CommonDesignLogic(None, None, '', connection_key, module.mainmodule)
        print('CommonDesignLogic created, cdl.connection:', cld.connection)
    except Exception as e : 
        print('error in cld e : ' , e)
        traceback.print_exc()
        raise  # Re-raise to prevent using undefined cld
    
    try : 
        # Setup the calculations object for generating CAD model.
        scc.setup_for_cad(cld, module)
    except Exception as e : 
        traceback.print_exc()
        print('Error in setting up cad e : ' , e)
        raise  # Re-raise to prevent using undefined cld

    # The section of the module that will be generated.
    # Explicitly skip merged Model generation; only per-part files are needed.
    if section == "Model":
        print("[CAD Adapter] Skipping Model generation (per requirement: only per-part files)")
        return None

    cld.component = section
    print(f'[CAD Adapter] Setting cld.component = {section}')

    # Only per-part generation
    part_names = []
    part_files = {}
    compound_model = None

    try:
        print(f'[CAD Adapter] Generating individual part: cld.component = {cld.component}')
        model = cld.create2Dcad()
        print(f'[CAD Adapter] Generated model type: {type(model)}')
    except Exception as e :
        print('Error in cld.create2Dcad() e : ' , e)
        return False

    # check if the cad_models folder exists or not 
    # if no, then create one 
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    if not os.path.exists(cad_models_path):
        print('path does not exists cad_models , creating one')
        os.makedirs(cad_models_path, exist_ok=True)
      
    print('2d model : ' , model)
    # os.system("clear")  # clear the terminal
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name
    print('brep file path in create_cad_model : ' , file_path)

    try : 
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange()) # Generate CAD Model
    except Exception as e : 
        print('Writing to BREP file failed e : ' , e)

    # Export single STL next to BREP
    try:
        single_stl_rel = file_path.replace(".brep", ".stl")
        write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
        print(f"STL file saved at {os.path.join(os.getcwd(), single_stl_rel)}")
    except Exception as stle:
        print(f"Warning: Failed to save STL for {section}: {stle}")

    return file_path
