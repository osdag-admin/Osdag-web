from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    write_stl,
)
from ...shared import setup_for_cad  # Use moment_connection shared utilities
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from osdag_core.cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from osdag_core.design_type.connection.column_cover_plate import ColumnCoverPlate
import sys
import os
from typing import Dict, Any, List
import traceback

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
        "Connector.Flange_Plate.Preferences",
        "Connector.Flange_Plate.Thickness_list",
        "Connector.Material",
        "Connector.Web_Plate.Thickness_List",
        "Design.Design_Method",
        "Detailing.Corrosive_Influences",
        "Detailing.Edge_type",
        "Detailing.Gap",
        "Load.Axial",
        "Load.Moment",
        "Load.Shear",
        "Material",
        "Member.Designation",
        "Member.Material",
        "Module",
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

     # Validate Connector.Flange_Plate.Preferences
    if not isinstance(input_values["Connector.Flange_Plate.Preferences"], str):
        raise InvalidInputTypeError("Connector.Flange_Plate.Preferences", "str")

    # Validate Connector.Flange_Plate.Thickness_list
    flange_thickness_list = input_values["Connector.Flange_Plate.Thickness_list"]
    if (not isinstance(flange_thickness_list, list)
            or not validate_list_type(flange_thickness_list, str)
            or not custom_list_validation(flange_thickness_list, int_able)):
        raise InvalidInputTypeError(
            "Connector.Flange_Plate.Thickness_list", "List[str] where all items can be converted to int")
    # Validate Connector.Material
    # Check if Connector.Material is a string.
    if not isinstance(input_values["Connector.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Connector.Material", "str")

     # Validate Connector.Web_Plate.Thickness_List
    web_thickness_list = input_values["Connector.Web_Plate.Thickness_List"]
    if (not isinstance(web_thickness_list, list)
            or not validate_list_type(web_thickness_list, str)
            or not custom_list_validation(web_thickness_list, int_able)):
        raise InvalidInputTypeError(
            "Connector.Web_Plate.Thickness_List", "List[str] where all items can be converted to int")
        
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
        
    # Validate Load.Moment
    load_moment = input_values["Load.Moment"]
    if not isinstance(load_moment, str) or not int_able(load_moment):
        raise InvalidInputTypeError("Load.Moment", "str where str can be converted to int")

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
    
    # Validate Member.Designation
    if not isinstance(input_values["Member.Designation"], str):
        raise InvalidInputTypeError("Member.Designation", "str")

    # Validate Member.Material
    if not isinstance(input_values["Member.Material"], str):
        raise InvalidInputTypeError("Member.Material", "str")

    # Check if Module is a string.
    if not isinstance(input_values["Module"], str):
        raise InvalidInputTypeError("Module", "str")  # If not, raise error.

def create_module() -> ColumnCoverPlate:
    """Create an instance of the ColumnCoverPlate module design class and set it up for use"""
    module = ColumnCoverPlate()  # Create an instance of the ColumnCoverPlate
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]) -> ColumnCoverPlate:
    """Create an instance of the ColumnCoverPlate module design class from input values."""
    try : 
        module = create_module()  # Create module instance.
    except Exception as e : 
        print('e in create_module : ' , e) 
        print('error in creating module')
    
    # Set the input values on the module instance.
    try : 
        print("INPUT SET FOR FINAL OUTPUT",input_values)
        module.set_input_values(input_values)
    except Exception as e : 
        traceback.print_exc()
        print('e in set_input_values : ' , e)
        print('error in setting the input values')

    return module


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
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
    print("************")
    output = {}  # Dictionary for formatted values
    module = create_from_input(input_values)  # Create module from input.
    print('module : ' , module)
    print('type of module : ' , type(module))

    # Generate output values in unformatted form.
    raw_output_text = module.output_values(True)
    raw_member_capacity = module.member_capacityoutput(True)
    raw_flange_bolt_capacity = [
        (f"{key}_flange_bolt_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in module.flange_bolt_capacity(True)
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_web_bolt_capacity = [
        (f"{key}_web_bolt_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in module.web_bolt_capacity(True)
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_flange_capacity = [
        (f"{key}_flange_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in module.flangecapacity(True)
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_web_capacity = [
        (f"{key}_web_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in module.webcapacity(True)
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_flange_spacing = [
        (f"{key}_flange_spacing", label, typ, value, visible if len(item) == 5 else True)
        for item in module.flangespacing(True)
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_web_spacing = [
        (f"{key}_web_spacing", label, typ, value, visible if len(item) == 5 else True)
        for item in module.webspacing(True)
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]
    
    from osdag_core.custom_logger import CustomLogger
    if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs() or []
    else:
        logs = getattr(module, "logs", []) or []
    raw_output = ( 
        raw_output_text +
        raw_member_capacity + 
        raw_flange_bolt_capacity +
        raw_web_bolt_capacity +
        raw_flange_capacity +
        raw_web_capacity +
        raw_flange_spacing +
        raw_web_spacing
    )
    # os.system("clear")
    # Loop over all the text values and add them to ouptut dict.
    for param in raw_output:
        if param[2] == "TextBox":  # If the parameter is a text output,
            key = param[0]  # id/key
            label = param[1]  # label text.
            value = param[3]  # Value as string.
            output[key] = {
                "key": key,
                "label": label,
                "val": value  # Changed from "value" to "val" to match frontend expectations
            }  # Set label, key and value in output
    return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP/STL file.

    External API uses section names: "Model", "Column", "CoverPlate".
    Internally, the legacy CAD logic for column cover plate uses component
    name "Connector" for the cover plate + bolts assembly. Map CoverPlate ->
    Connector for CAD routing, but keep the external section name for file
    naming and response keys.
    """
    if section == "Plate":
        section = "CoverPlate"
    if section not in ("Model", "Column", "CoverPlate"):
        raise InvalidInputTypeError("section", "'Model', 'Column' or 'CoverPlate'")

    module = create_from_input(input_values)
    from osdag_core.Common import KEY_DISP_COLUMNCOVERPLATE
    if getattr(module, "module", None) != KEY_DISP_COLUMNCOVERPLATE:
        print(f"[CAD DEBUG] Adjusting module.module from {getattr(module,'module',None)} to {KEY_DISP_COLUMNCOVERPLATE}")
        module.module = KEY_DISP_COLUMNCOVERPLATE
    if getattr(module, "mainmodule", None) != "Moment Connection":
        print(f"[CAD DEBUG] Adjusting module.mainmodule from {getattr(module,'mainmodule',None)} to Moment Connection")
        module.mainmodule = "Moment Connection"

    print(f"[CAD DEBUG] building CommonDesignLogic with module={module.module}, mainmodule={module.mainmodule}, section={section}")
    # CommonDesignLogic(display, cad_widget, folder, connection, mainmodule)
    cld = CommonDesignLogic(None, "", "", module.module, module.mainmodule)
    setup_for_cad(cld, module)

    # Map external section names to internal component names expected by CommonDesignLogic.
    # For column cover plate, the core CAD logic expects component name "Cover Plate"
    # (with a space) for the plate + bolts assembly. Using "Connector" here falls
    # through to CPObj.get_models(), which can later be treated like a list and
    # cause TypeErrors such as "object of type 'TopoDS_Compound' has no len()".
    internal_section = section
    if section == "CoverPlate":
        internal_section = "Cover Plate"

    cld.component = internal_section
    print(f"[cadissue] CC cover plate bolted: cld.component set to {internal_section} for section={section}")
    model = cld.create2Dcad()

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

    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())  # Generate CAD Model

        # Always try to write STL for the requested section
        try:
            stl_rel = file_path.replace(".brep", ".stl")
            full_stl = os.path.join(os.getcwd(), stl_rel)
            write_stl(model, full_stl)
            print(f"STL file saved at {full_stl}")
        except Exception as stle:
            print(f"Warning: Failed to save STL at {file_path}: {stle}")

        if section == "Model":
            # Save STEP
            step_writer = STEPControl_Writer()
            step_writer.Transfer(model, STEPControl_AsIs)
            step_file_path = file_path.replace(".brep", ".step")
            full_step_file_path = os.path.join(os.getcwd(), step_file_path)
            if step_writer.Write(full_step_file_path) == 1:
                print(f"STEP file saved at {full_step_file_path}")
            else:
                print("Warning: Failed to save STEP file!")

            # Save IGES
            iges_writer = IGESControl_Writer()
            iges_writer.AddShape(model)
            iges_file_path = file_path.replace(".brep", ".iges")
            full_iges_file_path = os.path.join(os.getcwd(), iges_file_path)
            if iges_writer.Write(full_iges_file_path) == 1:
                print(f"IGES file saved at {full_iges_file_path}")
            else:
                print("Warning: Failed to save IGES file!")

    except Exception as e:
        print('Writing to BREP/STL file failed e : ', e)
    
    return file_path

