from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    write_stl, build_raw_output_dict
)
from ...shared import setup_for_cad  # Use moment_connection shared utilities
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Core import BRepTools
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from osdag_core.custom_logger import CustomLogger
from osdag_core.design_type.connection.column_end_plate import ColumnEndPlate
import sys
import os
import typing
import traceback
import logging
import json
from typing import Dict, Any, List

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
# Create handlers
c_handler = logging.StreamHandler()
f_handler = logging.FileHandler('column_end_plate_module.log')
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
        "Load.Moment",
        "Material",
        "Member.Designation",
        "Member.Material",
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
    if not isinstance(input_values["Bolt.Bolt_Hole_Type"], str):
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type", "str")

     # Validate Bolt.Diameter.
    bolt_diameter = input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter, list)
            or not validate_list_type(bolt_diameter, str)
            or not custom_list_validation(bolt_diameter, int_able)):
        raise InvalidInputTypeError(
            "Bolt.Diameter", "non empty List[str] where all items can be converted to int")

    # Validate Bolt.Grade
    bolt_grade = input_values["Bolt.Grade"]
    if (not isinstance(bolt_grade, list)
            or not validate_list_type(bolt_grade, str)
            or not custom_list_validation(bolt_grade, float_able)):
        raise InvalidInputTypeError(
            "Bolt.Grade", "non empty List[str] where all items can be converted to float")

    # Validate Bolt.Slip_Factor
    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor, str)
            or not float_able(bolt_slipfactor)):
        raise InvalidInputTypeError(
            "Bolt.Slip_Factor", "str where str can be converted to float")

    # Validate Bolt.TensionType
    if not isinstance(input_values["Bolt.TensionType"], str):
        raise InvalidInputTypeError("Bolt.TensionType", "str")

    # Validate Bolt.Type
    if not isinstance(input_values["Bolt.Type"], str):
        raise InvalidInputTypeError("Bolt.Type", "str")

    # Validate Connectivity
    if not isinstance(input_values["Connectivity"], str):
        raise InvalidInputTypeError("Connectivity", "str")


    # Validate Connector.Material
    if not isinstance(input_values["Connector.Material"], str):
        raise InvalidInputTypeError("Connector.Material", "str")

    # Validate Design.Design_Method
    if not isinstance(input_values["Design.Design_Method"], str):
        raise InvalidInputTypeError("Design.Design_Method", "str")

    # Validate Detailing.Corrosive_Influences
    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]):
        raise InvalidInputTypeError(
            "Detailing.Corrosive_Influences", "'Yes' or 'No'")

    # Validate Detailing.Edge_type
    if not isinstance(input_values["Detailing.Edge_type"], str):
        raise InvalidInputTypeError("Detailing.Edge_type", "str")

    # Validate Detailing.Gap
    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str)
            or not int_able(detailing_gap)):
        raise InvalidInputTypeError(
            "Detailing.Gap", "str where str can be converted to int")

    # Validate Load.Axial
    load_axial = input_values["Load.Axial"]
    if (not isinstance(load_axial, str)
            or not int_able(load_axial)):
        raise InvalidInputTypeError(
            "Load.Axial", "str where str can be converted to int")

    # Validate Load.Shear
    load_shear = input_values["Load.Shear"]
    if (not isinstance(load_shear, str)
            or not int_able(load_shear)):
        raise InvalidInputTypeError(
            "Load.Shear", "str where str can be converted to int")

    # Validate Load.Moment
    load_moment = input_values["Load.Moment"]
    if (not isinstance(load_moment, str)
            or not int_able(load_moment)):
        raise InvalidInputTypeError(
            "Load.Moment", "str where str can be converted to int")

    # Validate Material
    if not isinstance(input_values["Material"], str):
        raise InvalidInputTypeError("Material", "str")

    # Validate Member.Designation
    if not isinstance(input_values["Member.Designation"], str):
        raise InvalidInputTypeError("Member.Designation", "str")

    # Validate Member.Material
    if not isinstance(input_values["Member.Material"], str):
        raise InvalidInputTypeError("Member.Material", "str")

    # Validate Module
    if not isinstance(input_values["Module"], str):
        raise InvalidInputTypeError("Module", "str")

    # Validate Weld.Fab
    if not isinstance(input_values["Weld.Fab"], str):
        raise InvalidInputTypeError("Weld.Fab", "str")

    # Validate Weld.Type
    if not isinstance(input_values["Weld.Type"], str):
        raise InvalidInputTypeError("Weld.Type", "str")

    # Validate Weld.Material_Grade_OverWrite
    weld_materialgradeoverwrite = input_values["Weld.Material_Grade_OverWrite"]
    if (not isinstance(weld_materialgradeoverwrite, str)
            or not int_able(weld_materialgradeoverwrite)):
        raise InvalidInputTypeError(
            "Weld.Material_Grade_OverWrite", "str where str can be converted to int.")

    # Validate Connector.Plate.Thickness_List
    connector_plate_thicknesslist = input_values["Connector.Plate.Thickness_List"]
    if (not isinstance(connector_plate_thicknesslist, list)
            or not validate_list_type(connector_plate_thicknesslist, str)
            or not custom_list_validation(connector_plate_thicknesslist, int_able)):
        raise InvalidInputTypeError(
            "Connector.Plate.Thickness_List", "List[str] where all items can be converted to int")


def create_module() -> ColumnEndPlate:
    """Create an instance of the Column End Plate connection module design class and set it up for use"""
    logger.info("Creating ColumnEndPlate module instance")
    try:
        module = ColumnEndPlate()
        logger.debug("ColumnEndPlate instance created successfully")
        module.set_osdaglogger(None, id="web")
        logger.debug("OSDAGLogger set to None")
        return module
    except Exception as e:
        logger.error(f"Error creating ColumnEndPlate module: {str(e)}")
        logger.error(traceback.format_exc())
        raise


def create_from_input(input_values: Dict[str, Any]) -> ColumnEndPlate:
    """Create an instance of the Column End Plate connection module design class from input values."""
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
        module = create_module()
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
    logger.info("Generating output for Column-to-Column End Plate")
    output = {}
    logs = []  # Initialize logs
    raw_csv = {}

    module = create_from_input(input_values)

    # Only call output methods with flag=True if design succeeded
    design_ok = getattr(module, 'design_status', False)

    raw_output_text = module.output_values(design_ok)
    raw_output_flange = module.flange_bolt_spacing(design_ok)
    raw_output_web = module.web_bolt_spacing(design_ok)

    if hasattr(module, 'logger') and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs() or []
        print(f'Retrieved {len(logs)} logs from custom logger')
    else:
        print('Logger is not CustomLogger instance or logger not found')
        print(f'Logger type: {type(module.logger) if hasattr(module, "logger") else "No logger"}')
        logs = getattr(module, "logs", []) or []

    raw_output = (
        raw_output_text +
        raw_output_flange + raw_output_web
    )
    raw_csv = build_raw_output_dict(raw_output)

    # Format output
    for param in raw_output:
        if len(param) >= 4 and param[2] == "TextBox":
            key = param[0]
            label = param[1]
            value = param[3]

            # Handle numpy types
            if hasattr(value, 'item'):
                value = value.item()

            output[key] = {
                "key": key,
                "label": label,
                "val": value
            }

    # Extra keys needed by the frontend spacing diagram. Not exposed via the
    # standard TextBox flattening above because they'd collide: both
    # web_bolt_spacing() and flange_bolt_spacing() emit *multiple* rows under
    # the same shared KEY_OUT_PITCH ('Bolt.Pitch') key (one per bolt gap,
    # distinguished only by their label, e.g. "Pitch 1-2"), so flattening by
    # key silently keeps only the last one. Reading the underlying attributes
    # directly off the already-instantiated module sidesteps that collision.
    # (Traced c2c_end_plate.py's own drawing formula: every bolt-row gap is
    # either the regular pitch or, for the single center gap, p_2_web -- and
    # the flange view's row spacing reuses these same two web-side values,
    # not a separate flange pitch.)
    try:
        extra_keys = {
            "ColumnEndPlate.Pitch": ("Pitch (regular)", getattr(module, "pitch", None)),
            "ColumnEndPlate.MidPitch": ("Pitch (center gap)", getattr(module, "p_2_web", None)),
            "ColumnEndPlate.WebThickness": ("Web Thickness (mm)", getattr(getattr(module, "section", None), "web_thickness", None)),
            "ColumnEndPlate.FlangeThickness": ("Flange Thickness (mm)", getattr(getattr(module, "section", None), "flange_thickness", None)),
        }
        for key, (label, val) in extra_keys.items():
            if val is not None:
                if hasattr(val, 'item'):
                    val = val.item()
                output[key] = {"key": key, "label": label, "val": val}
    except Exception as e:
        logger.warning(f"Could not add extra diagram keys: {e}")

    logger.info(f"Output generation completed. Generated {len(output)} output fields and {len(logs)} log messages")
    logger.debug(f"Final logs being returned: {logs}")
    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv



def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    if section not in ("Model", "Column", "Connector"):  # Error checking: If section is valid.
        raise InvalidInputTypeError(
            "section", "'Model', 'Column' or 'Connector'")
    module = create_from_input(input_values)  # Create module from input.

    # Ensure correct display keys for CAD routing
    from osdag_core.Common import KEY_DISP_COLUMNENDPLATE
    if getattr(module, "module", None) != KEY_DISP_COLUMNENDPLATE:
        print(f"[CAD DEBUG] Adjusting module.module from {getattr(module,'module',None)} to {KEY_DISP_COLUMNENDPLATE}")
        module.module = KEY_DISP_COLUMNENDPLATE
    if getattr(module, "mainmodule", None) != "Moment Connection":
        print(f"[CAD DEBUG] Adjusting module.mainmodule from {getattr(module,'mainmodule',None)} to Moment Connection")
        module.mainmodule = "Moment Connection"

    print(f"[CAD DEBUG] building CommonDesignLogic with module={module.module}, mainmodule={module.mainmodule}, section={section}")
    # Object that will create the CAD model.
    try:
        # CommonDesignLogic(display, cad_widget, folder, connection, mainmodule)
        cld = CommonDesignLogic(None, '', "", module.module , module.mainmodule)
    except Exception as e : 
        print('error in cld e : ' , e)
    
    try : 
        # Setup the calculations object for generating CAD model.
        setup_for_cad(cld, module)
    except Exception as e : 
        traceback.print_exc()
        print('Error in setting up cad e : ' , e)

    # The section of the module that will be generated.
    cld.component = section

    # When section == "Model", also ensure per-part shapes exist and prepare a compound
    part_names = ["Column", "Connector"]
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
                    BRepTools.breptools.Write(part_shape, part_file_path_rel, Message_ProgressRange())
                    part_files[part] = part_file_path_rel
                    # Also write STL for this part
                    try:
                        part_stl_rel = part_file_path_rel.replace(".brep", ".stl")
                        write_stl(part_shape, os.path.join(os.getcwd(), part_stl_rel))
                    except Exception as stle:
                        print(f"Failed to write STL for part {part}: {stle}")
                except Exception as e:
                    print(f"Failed to build/write part {part}: {e}")

            # Reset component to Model and set compound as the model to write
            cld.component = section
            compound_model = compound
        # Generate model for non-Model sections (or fallback)
        if compound_model is not None:
            model = compound_model
        else:
            model = cld.create2Dcad()
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
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange()) # Generate CAD Model

        # Always try to write STL for the requested section
        try:
            stl_rel = file_path.replace(".brep", ".stl")
            full_stl = os.path.join(os.getcwd(), stl_rel)
            write_stl(model, full_stl)
            print(f"STL file saved at {full_stl}")
        except Exception as stle:
            print(f"Warning: Failed to save STL at {file_path}: {stle}")

        # If it's 'Model' section, write a manifest referencing per-part breps and save extra formats
        if section == "Model":
            export_formats_lc = {f.lower() for f in export_formats} if export_formats else set()
            try:
                manifest = {
                    "session": session,
                    "mergedBrep": file_path,
                    "parts": [
                        {"name": name, "brepPath": part_files.get(name)} for name in part_names if part_files.get(name)
                    ]
                }
                # add stlPath for parts
                for entry in manifest["parts"]:
                    if entry.get("brepPath"):
                        entry["stlPath"] = entry["brepPath"].replace(".brep", ".stl")
                manifest_path = file_path.replace(".brep", ".parts.json")
                full_manifest_path = os.path.join(os.getcwd(), manifest_path)
                with open(full_manifest_path, "w", encoding="utf-8") as mf:
                    json.dump(manifest, mf)
                print(f"Parts manifest saved at {full_manifest_path}")
            except Exception as me:
                print(f"Warning: Failed to write manifest: {me}")

            # Optional on-demand STEP/IGES exports
            if export_formats_lc:
                try:
                    from apps.core.utils.cad_export import export_step, export_iges

                    if "step" in export_formats_lc:
                        step_rel = file_path.replace(".brep", ".step")
                        export_step(model, os.path.join(os.getcwd(), step_rel))
                    if "iges" in export_formats_lc:
                        iges_rel = file_path.replace(".brep", ".iges")
                        export_iges(model, os.path.join(os.getcwd(), iges_rel))
                except Exception as e:
                    print(f"Warning: Optional STEP/IGES export failed: {e}")
            # Write merged STL for Model
            try:
                merged_stl_rel = file_path.replace(".brep", ".stl")
                write_stl(model, os.path.join(os.getcwd(), merged_stl_rel))
                print(f"STL file saved at {os.path.join(os.getcwd(), merged_stl_rel)}")
            except Exception as stle:
                print(f"Warning: Failed to save merged STL: {stle}")
    except Exception as e : 
        print('Writing to BREP file failed e : ' , e)

    # For non-Model sections, export single STL next to BREP
    if section != "Model":
        try:
            single_stl_rel = file_path.replace(".brep", ".stl")
            write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
            print(f"STL file saved at {os.path.join(os.getcwd(), single_stl_rel)}")
        except Exception as stle:
            print(f"Warning: Failed to save STL for {section}: {stle}")

    return file_path

