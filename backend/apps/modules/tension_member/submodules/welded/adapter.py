"""
Tension Member - Welded Design Adapter
Implements the business logic directly (not re-exporting from osdag_api)
"""
from osdag_core.Common import KEY_DISP_TENSION_WELDED
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    write_stl
)
from apps.modules.tension_member import shared as tbm
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.design_type.tension_member.tension_welded import Tension_welded
import sys
import os
import typing
from typing import Dict, Any, List
import json
import traceback

old_stdout = sys.stdout  # Backup logs
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log


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
    
    # Set weld defaults
    input_values["Weld.Material_Grade_OverWrite"] = "410"
    input_values["Weld.Fab"] = "Shop Weld"
    module.set_input_values(input_values)
    return module


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate, format and return the output values from the given input values."""
    output = {}
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
    if section not in ("Model", "Member", "Plate", "Endplate"):
        raise InvalidInputTypeError("section", "'Model', 'Member', 'Plate', 'Endplate'")
    
    module = create_from_input(input_values)
    
    # Object that will create the CAD model.
    try: 
        cld = CommonDesignLogic(None, None, '', KEY_DISP_TENSION_WELDED, module.mainmodule)
    except Exception as e : 
        print('error in cld e : ' , e)
        raise
    
    try: 
        # Setup the calculations object for generating CAD model.
        tbm.setup_for_cad(cld, module)
    except Exception as e : 
        traceback.print_exc()
        print('Error in setting up cad e : ' , e)
        raise
 
    # The section of the module that will be generated.
    cld.component = section

    # When section == "Model", also ensure per-part shapes exist and prepare a compound
    part_names = ["Member", "Plate", "Endplate"]
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
        print("Error in cld.create2Dcad() e : " , e)
        raise

    # check if the cad_models folder exists or not 
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    if not os.path.exists(cad_models_path):
        print("path does not exists cad_models , creating one")
        os.makedirs(cad_models_path, exist_ok=True)
      
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name

    try : 
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())

        # If it's "Model" section, write a manifest referencing per-part breps and save extra formats
        if section == "Model":
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
            # Write merged STL for Model
            try:
                merged_stl_rel = file_path.replace(".brep", ".stl")
                write_stl(model, os.path.join(os.getcwd(), merged_stl_rel))
                print(f"STL file saved at {os.path.join(os.getcwd(), merged_stl_rel)}")
            except Exception as stle:
                print(f"Warning: Failed to save merged STL: {stle}")
    except Exception as e : 
        print('Writing to BREP file failed e : ' , e)
        raise

    # For non-Model sections, export single STL next to BREP
    if section != "Model":
        try:
            single_stl_rel = file_path.replace(".brep", ".stl")
            write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
            print(f"STL file saved at {os.path.join(os.getcwd(), single_stl_rel)}")
        except Exception as stle:
            print(f"Warning: Failed to save STL for {section}: {stle}")

    return file_path
