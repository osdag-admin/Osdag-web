"""
Api for Column Cover Plate Welded Connection module
Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Go through all the input parameters.
        Check if all required parameters are given.
        Check if all parameters are of correct data type.
    create_module() -> ColumnCoverPlateWeld:
        Create an instance of the column cover plate welded connection module design class and set it up for use
    create_from_input(input_values: Dict[str, Any]) -> ColumnCoverPlateWeld
        Create an instance of the column cover plate welded connection module design class from input values.
    generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
        Generate, format and return the output values from the given input values.
    create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
        Generate the CAD model from input values as a BREP file. Return file path.
"""

from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    write_stl, build_raw_output_dict,
)

from ...shared import setup_for_cad  # Use moment_connection shared utilities
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.design_type.connection.column_cover_plate_weld import ColumnCoverPlateWeld
import sys
import os
import typing
from typing import Dict, Any, List
import traceback

def get_required_keys() -> List[str]:
    return [
        "Module",
        "Member.Designation",  
        "Member.Material",
        "Material",
        "Load.Moment",
        "Load.Shear", 
        "Load.Axial",
        "Weld.Type",
        "Weld.Fab",
        "Weld.Material_Grade_OverWrite",
        "Design.Design_Method",
        "Detailing.Gap",
        "Connector.Material",
        "Connector.Flange_Plate.Preferences", 
        "Connector.Flange_Plate.Thickness_list",
        "Connector.Web_Plate.Thickness_List"
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    try:
        required_keys = get_required_keys()
        
        # Filter out UI-specific keys that are not required by the backend module
        filtered_input = {k: v for k, v in input_values.items() if k != "out_titles_status"}
        
        missing_keys = contains_keys(filtered_input, required_keys)
        if missing_keys != None:
            raise MissingKeyError(f"Required key '{missing_keys[0]}' is missing from input")

        # Validate string fields
        string_fields = [
            "Module",
            "Member.Designation",
            "Member.Material",
            "Material",
            "Weld.Type",
            "Weld.Fab", 
            "Design.Design_Method",
            "Connector.Material",
            "Connector.Flange_Plate.Preferences"
        ]
        for key in string_fields:
            if key in filtered_input and not isinstance(filtered_input[key], str):
                raise InvalidInputTypeError(
                    f"Field '{key}' must be a string, got {type(filtered_input[key]).__name__}"
                )

        # Validate numeric fields
        numeric_fields = [
            "Load.Moment",
            "Load.Shear",
            "Load.Axial",
            "Weld.Material_Grade_OverWrite",
            "Detailing.Gap"
        ]
        for key in numeric_fields:
            if key in filtered_input:
                value = filtered_input[key]
                if not isinstance(value, str) or not float_able(value):
                    raise InvalidInputTypeError(
                        f"Field '{key}' must be a string that can be converted to float, got '{value}'"
                    )
                # Additional numeric validation
                float_val = float(value)
                if key == "Detailing.Gap" and float_val < 0:
                    raise ValueError(f"Gap value must be non-negative, got {float_val}")

        # Validate plate thickness lists
        thickness_lists = [
            "Connector.Flange_Plate.Thickness_list",
            "Connector.Web_Plate.Thickness_List"
        ]
        for key in thickness_lists:
            if key in filtered_input:
                thickness = filtered_input[key]
                if not isinstance(thickness, list):
                    raise InvalidInputTypeError(
                        f"Field '{key}' must be a list, got {type(thickness).__name__}"
                    )
                if not validate_list_type(thickness, str):
                    raise InvalidInputTypeError(
                        f"All items in '{key}' must be strings"
                    )
                if not custom_list_validation(thickness, float_able):
                    invalid_items = [x for x in thickness if not float_able(x)]
                    raise InvalidInputTypeError(
                        f"All items in '{key}' must be convertible to float. Invalid items: {invalid_items}"
                    )

    except Exception as e:
        raise type(e)(f"Input validation failed: {str(e)}")


def create_module() -> ColumnCoverPlateWeld:
    """Create an instance of the column cover plate welded connection module design class and set it up for use"""
    module = ColumnCoverPlateWeld()
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]) -> ColumnCoverPlateWeld:
    """Create an instance of the column cover plate welded connection module design class from input values."""
    module = create_module()
    module.set_input_values(input_values)
    return module


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate, format and return formatted output"""
    output = {}
    raw_csv = {}
    module = create_from_input(input_values)

    # Get raw output data
    raw_output_text = module.output_values(True)
    raw_member_capacity = module.member_capacityoutput(True)
    flange_weld_details = module.flange_weld_details(True)
    web_weld_details = module.web_weld_details(True)
    web_capacity = module.webcapacity(True)
    flange_capacity = module.flangecapacity(True)
    web_block_shear_pattern = module.web_pattern(True)

    raw_csv = build_raw_output_dict(
        raw_output_text + raw_member_capacity + flange_weld_details + web_weld_details +
        web_capacity + flange_capacity + web_block_shear_pattern
    )

    from osdag_core.custom_logger import CustomLogger
    if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs() or []
    else:
        logs = getattr(module, "logs", []) or []

    # Process standard text parameters
    for param in raw_output_text + raw_member_capacity + web_capacity + flange_capacity + web_block_shear_pattern:
        if param[2] == "TextBox":
            key = param[0]
            output[key] = {
                "key": key,
                "label": param[1],
                "val": param[3]
            }

    # Process flange weld details and map colliding keys
    for param in flange_weld_details:
        if param[2] == "TextBox":
            key = param[0]
            if key == "bolt.long_joint":
                key = "Flange_Weld.Reduction"
            elif key == "Weld.Strength_red":
                key = "Flange_Weld.Strength_red"
            output[key] = {
                "key": key,
                "label": param[1],
                "val": param[3]
            }

    # Process web weld details and map colliding keys
    for param in web_weld_details:
        if param[2] == "TextBox":
            key = param[0]
            if key == "bolt.long_joint":
                key = "Web_Weld.Reduction"
            elif key == "Weld.Strength_red":
                key = "Web_Weld.Strength_red"
            output[key] = {
                "key": key,
                "label": param[1],
                "val": param[3]
            }

    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv


def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    """Generate the CAD model from input values as a BREP/STL file.

    External API uses section names: "Model", "Column", "CoverPlate", "Weld".
    """
    if section not in ("Model", "Column", "CoverPlate", "Weld"):
        raise InvalidInputTypeError("section", "'Model', 'Column', 'CoverPlate' or 'Weld'")

    module = create_from_input(input_values)

    # Ensure correct display keys for CAD routing
    from osdag_core.Common import KEY_DISP_COLUMNCOVERPLATEWELD
    if getattr(module, "module", None) != KEY_DISP_COLUMNCOVERPLATEWELD:
        print(f"[CAD DEBUG] Adjusting module.module from {getattr(module,'module',None)} to {KEY_DISP_COLUMNCOVERPLATEWELD}")
        module.module = KEY_DISP_COLUMNCOVERPLATEWELD
    if getattr(module, "mainmodule", None) != "Moment Connection":
        print(f"[CAD DEBUG] Adjusting module.mainmodule from {getattr(module,'mainmodule',None)} to Moment Connection")
        module.mainmodule = "Moment Connection"

    print(f"[CAD DEBUG] building CommonDesignLogic with module={module.module}, mainmodule={module.mainmodule}, section={section}")
    try:
        cld = CommonDesignLogic(None, '', "", module.module , module.mainmodule)
    except Exception as e:
        print('error in cld e : ' , e)
    
    try:
        setup_for_cad(cld, module)
    except Exception as e:
        traceback.print_exc()
        print('Error in setting up cad e : ' , e)

    # Map external section names to internal component names expected by CommonDesignLogic
    internal_section = section
    if section == "CoverPlate":
        internal_section = "Cover Plate"

    cld.component = internal_section
    print(f"[cadissue] CC cover plate welded: cld.component set to {internal_section} for section={section}")

    def normalize_and_fuse(obj):
        if obj is None:
            return None
        from OCC.Core.TopoDS import TopoDS_Shape
        def _flatten(o):
            if o is None:
                return []
            if isinstance(o, dict):
                out = []
                for v in o.values():
                    out.extend(_flatten(v))
                return out
            if isinstance(o, (list, tuple)):
                out = []
                for i in o:
                    out.extend(_flatten(i))
                return out
            return [o]
        def _explode_compound(shape):
            from OCC.Core.TopExp import TopExp_Explorer
            from OCC.Core.TopAbs import TopAbs_SOLID
            solids = []
            exp = TopExp_Explorer(shape, TopAbs_SOLID)
            while exp.More():
                solids.append(exp.Current())
                exp.Next()
            return solids if solids else [shape]
        shapes = []
        for s in _flatten(obj):
            if isinstance(s, TopoDS_Shape):
                shapes.extend(_explode_compound(s))
        if not shapes:
            return None
        from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
        result = shapes[0]
        for shp in shapes[1:]:
            result = BRepAlgoAPI_Fuse(result, shp).Shape()
        return result

    def get_shape_for_part(part_name):
        if part_name == "Column":
            return normalize_and_fuse(cld.CPObj.get_column_models())
        elif part_name in ("CoverPlate", "Cover Plate"):
            return normalize_and_fuse(cld.CPObj.get_plate_models())
        elif part_name == "Weld":
            return normalize_and_fuse(cld.CPObj.get_welded_modules())
        return None

    part_names = ["Column", "CoverPlate", "Weld"]
    part_files = {}

    try:
        if section == "Model":
            from OCC.Core.TopoDS import TopoDS_Compound
            from OCC.Core.BRep import BRep_Builder
            import json

            builder = BRep_Builder()
            compound = TopoDS_Compound()
            builder.MakeCompound(compound)

            for part in part_names:
                try:
                    part_shape = get_shape_for_part(part)
                    if part_shape is None:
                        continue

                    # Add to compound
                    builder.Add(compound, part_shape)

                    # Ensure per-part BREP file exists
                    part_file_name = f"{session}_{part}.brep"
                    part_file_path_rel = os.path.join("file_storage", "cad_models", part_file_name)
                    BRepTools.breptools.Write(part_shape, part_file_path_rel, Message_ProgressRange())
                    part_files[part] = part_file_path_rel

                    # Write STL for this part
                    try:
                        part_stl_rel = part_file_path_rel.replace(".brep", ".stl")
                        write_stl(part_shape, os.path.join(os.getcwd(), part_stl_rel))
                    except Exception as stle:
                        print(f"Failed to write STL for part {part}: {stle}")
                except Exception as e:
                    print(f"Failed to build/write part {part}: {e}")

            model = compound
        else:
            model = get_shape_for_part(section)
    except Exception as e:
        print('Error in resolving component shape e : ', e)
        traceback.print_exc()
        raise

    # check if the cad_models folder exists or not 
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    if not os.path.exists(cad_models_path):
        print('path does not exists cad_models , creating one')
        os.makedirs(cad_models_path, exist_ok=True)
      
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name

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
            try:
                import json
                manifest = {
                    "session": session,
                    "mergedBrep": file_path,
                    "parts": [
                        {"name": name, "brepPath": part_files.get(name)} for name in part_names if part_files.get(name)
                    ]
                }
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

            export_formats_lc = {f.lower() for f in export_formats} if export_formats else set()
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

    except Exception as e:
        print('Writing to BREP/STL file failed e : ', e)
    
    return file_path

