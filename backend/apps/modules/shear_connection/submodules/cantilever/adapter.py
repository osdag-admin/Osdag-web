"""
Api for CantileverConnection module
Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Go through all the input parameters.
        Check if all required parameters are given.
        Check if all parameters are of correct data type.
    create_module() -> CantileverConnection:
        Create an instance of the CantileverConnection module design class and set it up for use
    create_from_input(input_values: Dict[str, Any]) -> CantileverConnection
        Create an instance of the CantileverConnection module design class from input values.
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
from osdag_core.design_type.connection.cantilever_connection import CantileverConnection
from osdag_core.Common import KEY_DISP_Cantilever, KEY_CONN
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


def create_module() -> CantileverConnection:
    """Create an instance of the CantileverConnection module design class and set it up for use"""
    print("\n[create_module] Creating CantileverConnection instance...")
    try:
        module = CantileverConnection()  # Create an instance of the CantileverConnection
        print(f"   ✅ CantileverConnection instance created: {id(module)}")
        
        print(f"   Setting logger with id='web'...")
        module.set_osdaglogger(None, id="web")
        print(f"   ✅ Logger set successfully")
        print(f"   Logger name: {getattr(module.logger, 'name', 'N/A') if hasattr(module, 'logger') else 'No logger'}")
        
        return module
    except Exception as e:
        print(f"   ❌ ERROR in create_module: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise


def create_from_input(input_values: Dict[str, Any]) -> CantileverConnection:
    """Create an instance of the cantilever connection module design class from input values."""
    print("\n" + "=" * 60)
    print("create_from_input() called")
    print("=" * 60)
    print(f"Input values received: {len(input_values)} keys")
    print(f"Sample keys: {list(input_values.keys())[:5]}")
    
    module = None
    print("\n[create_from_input] Step 1: Creating module instance...")
    try:
        module = create_module()
        print("   ✅ Module instance created")
    except Exception as e:
        print(f"   ❌ ERROR creating module: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise

    print("\n[create_from_input] Step 2: Setting input values...")
    try:
        module.set_input_values(input_values)
        print("   ✅ Input values set successfully")
    except Exception as e:
        print(f"   ❌ ERROR setting input values: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise

    print(f"\n✅ create_from_input() completed successfully. Module: {id(module)}")
    return module


def generate_output(input_values: Dict[str, Any]) -> tuple:
    """Generate formatted output from input values."""
    print("\n" + "=" * 60)
    print("generate_output() called")
    print("=" * 60)
    
    logs = []
    output = {}
    
    try:
        print("\n[generate_output] Step 1: Creating and calculating module...")
        module = create_from_input(input_values)
        print("   ✅ Module created and calculated")
        
        print("\n[generate_output] Step 2: Extracting output values...")
        output = module.output_values(True)
        print(f"   ✅ Output values extracted: {len(output)} items")
        
        print("\n[generate_output] Step 3: Extracting logs...")
        logs = module.logs if hasattr(module, 'logs') else []
        print(f"   ✅ Logs extracted: {len(logs)} items")
        
        print("\n✅ generate_output() completed successfully")
        return output, logs
        
    except Exception as e:
        print(f"\n❌ ERROR in generate_output(): {type(e).__name__}: {e}")
        traceback.print_exc()
        logs.append({"msg": f"Error in generate_output: {str(e)}", "type": "error"})
        return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    print("\n" + "=" * 60)
    print("create_cad_model() called")
    print("=" * 60)
    print(f"Section: {section}, Session: {session}")
    
    try:
        print("\n[create_cad_model] Step 1: Creating module from input...")
        module = create_from_input(input_values)
        print("   ✅ Module created")
        
        print("\n[create_cad_model] Step 2: Generating CAD model...")
        # Ensure module.module is set correctly for CAD generation
        if hasattr(module, 'module') and module.module != KEY_DISP_Cantilever:
            print(f'WARNING: module.module is {repr(module.module)}, setting to KEY_DISP_Cantilever')
            module.module = KEY_DISP_Cantilever
        
        # connection should be KEY_DISP_Cantilever for proper CAD generation
        connection_key = KEY_DISP_Cantilever
        
        print(f'KEY_DISP_Cantilever value: {repr(KEY_DISP_Cantilever)}')
        
        # Generate CAD model
        cad_file_path = module.create_3d_model(connection_key, section, session)
        print(f"   ✅ CAD model generated: {cad_file_path}")
        
        print("\n✅ create_cad_model() completed successfully")
        return cad_file_path
        
    except Exception as e:
        print(f"\n❌ ERROR in create_cad_model(): {type(e).__name__}: {e}")
        traceback.print_exc()
        raise