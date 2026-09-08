from apps.core.utils import (
    InvalidInputTypeError,
    write_stl,
)
from ... import shared as mc_shared  # Use moment_connection shared utilities
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from osdag_core.cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from osdag_core.design_type.connection.column_cover_plate import ColumnCoverPlate
import sys
import os
from typing import Dict, Any, List
import traceback

def get_required_keys() -> List[str]:
    return mc_shared.COVER_PLATE_BOLTED_REQUIRED_KEYS


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    mc_shared.validate_cover_plate_bolted_input(input_values)


def create_module() -> ColumnCoverPlate:
    """Create an instance of the ColumnCoverPlate module design class and set it up for use"""
    return mc_shared.create_cover_plate_bolted_module(ColumnCoverPlate)


def create_from_input(input_values: Dict[str, Any]) -> ColumnCoverPlate:
    """Create an instance of the ColumnCoverPlate module design class from input values."""
    return mc_shared.create_cover_plate_bolted_from_input(ColumnCoverPlate, input_values)


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
    return mc_shared.generate_cover_plate_bolted_output(ColumnCoverPlate, input_values)


def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    """Generate the CAD model from input values as a BREP/STL file.

    External API uses section names: "Model", "Column", "CoverPlate".
    Internally, the legacy CAD logic for column cover plate uses component
    name "Connector" for the cover plate + bolts assembly. Map CoverPlate ->
    Connector for CAD routing, but keep the external section name for file
    naming and response keys.
    """
    if section == "Plate":
        section = "CoverPlate"
    if section not in ("Model", "Column", "CoverPlate", "Bolt", "Weld"):
        raise InvalidInputTypeError("section", "'Model', 'Column', 'CoverPlate', 'Bolt' or 'Weld'")

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
    mc_shared.setup_for_cad(cld, module)

    # Map external section names to internal component names expected by CommonDesignLogic.
    internal_section = section
    if section == "CoverPlate":
        internal_section = "Cover Plate"

    cld.component = internal_section
    print(f"[cadissue] CC cover plate bolted: cld.component set to {internal_section} for section={section}")

    part_names = ["Column", "CoverPlate", "Bolt"]
    part_files = {}
    compound_model = None

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
                    cld.component = "Cover Plate" if part == "CoverPlate" else part
                    part_shape = cld.create2Dcad()
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
                        print(f"Failed to write STL for part {part} (CC cover plate bolted): {stle}")
                except Exception as e:
                    print(f"Failed to build/write part {part} in CC cover plate bolted: {e}")

            cld.component = section
            compound_model = compound

        if compound_model is not None:
            model = compound_model
        else:
            model = cld.create2Dcad()
    except Exception as e:
        print('Error in cld.create2Dcad() e : ', e)
        traceback.print_exc()
        raise

    return mc_shared.write_cover_plate_cad_output(model, section, session, part_names, part_files, export_formats)

