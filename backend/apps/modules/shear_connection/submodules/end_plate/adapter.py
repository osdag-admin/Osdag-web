from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
)
from apps.modules.shear_connection import shared as scc
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.Common import KEY_DISP_ENDPLATE, KEY_CONN
from osdag_core.custom_logger import CustomLogger
# Will log a lot of unnessecary data.
from osdag_core.design_type.connection.fin_plate_connection import FinPlateConnection
from osdag_core.design_type.connection.end_plate_connection import EndPlateConnection
import sys
import os
import typing
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
        # Raise error for the first missing key.a
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
            validate_string(key)  # Check if key is a string. If not, raise error.
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


def create_module() -> EndPlateConnection:
    """Create an instance of the End plate connection module design class and set it up for use"""
    module = EndPlateConnection()  # Create an instance of the EndPlateConnection
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]) -> EndPlateConnection:
    """Create an instance of the End plate connection module design class from input values."""
    # validate_input(input_values)
    print("\n[EndPlateAdapter.create_from_input] called")
    print(f"[EndPlateAdapter.create_from_input] input keys={list(input_values.keys()) if isinstance(input_values, dict) else type(input_values)}")
    try:
        module = create_module()  # Create module instance.
        print(f"[EndPlateAdapter.create_from_input] module created={type(module).__name__}")
    except Exception as e:
        print('e in create_module : ' , e)
        print('error in creating module')
        traceback.print_exc()
        raise
    
    # Map frontend keys to osdag_core keys
    # Frontend sends 'Connectivity' but osdag_core expects 'Connectivity *' (KEY_CONN)
    design_dictionary = input_values.copy()
    if 'Connectivity' in design_dictionary and KEY_CONN not in design_dictionary:
        design_dictionary[KEY_CONN] = design_dictionary.pop('Connectivity')
        print(f"[EndPlateAdapter.create_from_input] mapped 'Connectivity' -> {KEY_CONN!r} value={design_dictionary.get(KEY_CONN)!r}")
    else:
        print(f"[EndPlateAdapter.create_from_input] connectivity mapping skipped; has KEY_CONN={KEY_CONN in design_dictionary}")
    
    # Set the input values on the module instance.
    try:
        print(f"[EndPlateAdapter.create_from_input] set_input_values with keys={list(design_dictionary.keys())[:20]}")
        module.set_input_values(design_dictionary)
        print("[EndPlateAdapter.create_from_input] set_input_values passed")
    except Exception as e:
        print('e in set_input_values : ' , e)
        print('error in setting the input values')
        traceback.print_exc()
        raise

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
    print("\n[EndPlateAdapter.generate_output] called")
    output = {}  # Dictionary for formatted values
    module = create_from_input(input_values)  # Create module from input.
    if module is None:
        raise RuntimeError("create_from_input returned None module")

    print(f"[EndPlateAdapter.generate_output] module={type(module).__name__}")
    print(f"[EndPlateAdapter.generate_output] has logger={hasattr(module, 'logger')}")
    # Generate output values in unformatted form.
    try:
        raw_output_text = module.output_values(True)
        print(f"[EndPlateAdapter.generate_output] raw_output_text={len(raw_output_text)}")
        raw_output_spacing = module.spacing(True)  # Generate output val
        print(f"[EndPlateAdapter.generate_output] raw_output_spacing={len(raw_output_spacing)}")
        raw_output_capacities = module.capacities(True)
        print(f"[EndPlateAdapter.generate_output] raw_output_capacities={len(raw_output_capacities)}")
        raw_output_bolt_capacity = module.bolt_capacity_details(True)
        print(f"[EndPlateAdapter.generate_output] raw_output_bolt_capacity={len(raw_output_bolt_capacity)}")
    except Exception as e:
        print(f"[EndPlateAdapter.generate_output] error while collecting raw outputs: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise

    # Prefer CustomLogger if attached
    if hasattr(module, 'logger') and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs()
    else:
        logs = module.logs if hasattr(module, 'logs') else []
    # Ensure logs is a list even if empty
    if not logs:
        logs = ["No logs generated"]

    raw_output = raw_output_capacities + raw_output_spacing + raw_output_text + raw_output_bolt_capacity
    print(f"[EndPlateAdapter.generate_output] total_raw_output={len(raw_output)}")
    # os.system("clear")
    # Loop over all the text values and add them to ouptut dict.
    for idx, param in enumerate(raw_output):
        if not isinstance(param, (tuple, list)):
            print(f"[EndPlateAdapter.generate_output] skipping non-sequence param at idx={idx}: {type(param)}")
            continue
        if len(param) < 4:
            print(f"[EndPlateAdapter.generate_output] skipping short param at idx={idx}: {param}")
            continue
        if param[2] == "TextBox":  # If the parameter is a text output,
            key = param[0]  # id/key
            label = param[1]  # label text.
            value = param[3]  # Value as string.
            output[key] = {
                "key": key,
                "label": label,
                "val": value  # Changed from "value" to "val" to match frontend expectations
            }  # Set label, key and value in output
    print(f"[EndPlateAdapter.generate_output] output keys count={len(output)}")
    return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    from apps.core.utils import write_stl
    from OCC.Core.BRep import BRep_Builder
    from OCC.Core.TopoDS import TopoDS_Compound
    from OCC.Core.Message import Message_ProgressRange

    if section not in ("Model", "Beam", "Column", "Plate"):  # Error checking: If section is valid.
        raise InvalidInputTypeError(
            "section", "'Model', 'Beam', 'Column' or 'Plate'")
    module = create_from_input(input_values)  # Create module from input.
    # Object that will create the CAD model.
    try :
        cld = CommonDesignLogic(None, None, '', KEY_DISP_ENDPLATE, module.mainmodule)
    except Exception as e : 
        print('error in cld e : ' , e)
    
    try : 
        # Setup the calculations object for generating CAD model.
        scc.setup_for_cad(cld, module)
    except Exception as e : 
        print('Error in setting up cad e : ' , e)

    # The section of the module that will be generated.
    cld.component = section

    part_names = ["Beam", "Column", "Plate", "Weld", "Welds", "Bolt", "Bolts"]
    part_files = {}
    compound_model = None

    try:
        if section == "Model":
            # Build compound by adding each part shape without fusing
            builder = BRep_Builder()
            compound = TopoDS_Compound()
            builder.MakeCompound(compound)

            for part in part_names:
                try:
                    # Generate shape for this part
                    cld.component = part
                    part_shape = cld.create2Dcad()
                    if part_shape is None:
                        continue
                    # Add to compound
                    builder.Add(compound, part_shape)
                    # Ensure per-part BREP file exists (write or overwrite)
                    part_file_name = f"{session}_{part}.brep"
                    part_file_path_rel = os.path.join("file_storage", "cad_models", part_file_name)
                    full_brep_path = os.path.join(os.getcwd(), part_file_path_rel)
                    # Write per-part BREP
                    from OCC.Core import BRepTools
                    BRepTools.breptools.Write(part_shape, full_brep_path, Message_ProgressRange())
                    try:
                        module.logs.append(f"Wrote {part} BREP: {full_brep_path}")
                    except Exception:
                        pass
                    # Ensure per-part STL as well
                    part_stl_file = part_file_path_rel.replace(".brep", ".stl")
                    full_stl_path = os.path.join(os.getcwd(), part_stl_file)
                    try:
                        write_stl(part_shape, full_stl_path)
                        try:
                            module.logs.append(f"Wrote {part} STL: {full_stl_path}")
                        except Exception:
                            pass
                    except Exception as e:
                        print(f"Failed to write STL for part {part}:", e)
                except Exception as e:
                    print(f"Failed generating cad part {part} in EndPlate: {e}")
            
            # Now write the compound as the Model
            cld.component = "Model"  # Optionally switch context
            model = compound
            compound_file_name = f"{session}_Model.brep"
            compound_file_path_rel = os.path.join("file_storage", "cad_models", compound_file_name)
            BRepTools.breptools.Write(model, os.path.join(os.getcwd(), compound_file_path_rel), Message_ProgressRange())
            try:
                module.logs.append(f"Wrote Model BREP: {os.path.join(os.getcwd(), compound_file_path_rel)}")
            except Exception:
                pass
            # Compound/model STL (for completeness, but will not be loaded in UI)
            compound_stl_file = compound_file_path_rel.replace(".brep", ".stl")
            try:
                write_stl(model, os.path.join(os.getcwd(), compound_stl_file))
                try:
                    module.logs.append(f"Wrote Model STL: {os.path.join(os.getcwd(), compound_stl_file)}")
                except Exception:
                    pass
            except Exception as e:
                print("Failed to write Model STL for EndPlate:", e)
            return compound_file_path_rel
        else:
            try : 
                model = cld.create2Dcad()  # Generate CAD Model.
            except Exception as e :
                print('Error in cld.create2Dcad() e : ' , e)
                return False
            # check if the cad_models folder exists or not 
            # if no, then create one 
            cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
            if not os.path.exists(cad_models_path):
                print('path does not exists cad_models , creating one')
                os.makedirs(cad_models_path, exist_ok=True)
            file_name = session + "_" + section + ".brep"
            file_path = "file_storage/cad_models/" + file_name
            try : 
                from OCC.Core import BRepTools
                full_brep = os.path.join(os.getcwd(), file_path)
                BRepTools.breptools.Write(model, full_brep, Message_ProgressRange()) # Generate CAD Model
                try:
                    module.logs.append(f"Wrote {section} BREP: {full_brep}")
                except Exception:
                    pass
                # Write STL too
                stl_file_path = file_path.replace(".brep", ".stl")
                full_stl = os.path.join(os.getcwd(), stl_file_path)
                write_stl(model, full_stl)
                try:
                    module.logs.append(f"Wrote {section} STL: {full_stl}")
                except Exception:
                    pass
            except Exception as e : 
                print('Writing to BREP or STL file failed e : ' , e)
            return file_path
    except Exception as top_e:
        print('Top-level error in EndPlate create_cad_model:', top_e)
        return False

