from apps.core.utils import (
    InvalidInputTypeError,
    write_stl,
)
from ... import shared as mc_shared  # Use moment_connection shared utilities
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from osdag_core.cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from osdag_core.design_type.connection.beam_cover_plate import BeamCoverPlate
import sys
import os
from typing import Dict, Any, List
import traceback

def get_required_keys() -> List[str]:
    return mc_shared.COVER_PLATE_BOLTED_REQUIRED_KEYS


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    mc_shared.validate_cover_plate_bolted_input(input_values)


def create_module() -> BeamCoverPlate:
    """Create an instance of the BeamCoverPlate module design class and set it up for use"""
    return mc_shared.create_cover_plate_bolted_module(BeamCoverPlate)


def create_from_input(input_values: Dict[str, Any]) -> BeamCoverPlate:
    """Create an instance of the BeamCoverPlate module design class from input values."""
    return mc_shared.create_cover_plate_bolted_from_input(BeamCoverPlate, input_values)


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
    return mc_shared.generate_cover_plate_bolted_output(BeamCoverPlate, input_values)


def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    """Generate the CAD model from input values as a BREP/STL file.

    External API uses section names: "Model", "Beam", "CoverPlate", "Bolt", "Weld".
    Internally, the legacy CAD logic uses component name "Connector"
    for the cover plate + bolts assembly. Map CoverPlate -> Connector for CAD routing,
    but keep the external section name for file naming and response keys.
    """
    if section not in ("Model", "Beam", "CoverPlate", "Bolt", "Weld"):
        raise InvalidInputTypeError("section", "'Model', 'Beam', 'CoverPlate', 'Bolt' or 'Weld'")

    module = create_from_input(input_values)

    # Ensure correct display keys for CAD routing
    from osdag_core.Common import KEY_DISP_BEAMCOVERPLATE
    if getattr(module, "module", None) != KEY_DISP_BEAMCOVERPLATE:
        module.module = KEY_DISP_BEAMCOVERPLATE
    module.mainmodule = "Moment Connection"

    # Build CommonDesignLogic (display, cad_widget, folder, connection, mainmodule)
    print(f"[CAD DEBUG] BB cover plate bolted: module={module.module}, mainmodule={module.mainmodule}, section={section}")
    cld = CommonDesignLogic(None, "", "", module.module, module.mainmodule)

    # Setup module for CAD
    mc_shared.setup_for_cad(cld, module)

    # Map external section names to internal component names expected by CommonDesignLogic
    internal_section = section
    if section == "CoverPlate":
        # Legacy CAD uses component name "Connector" for cover plate + bolts
        internal_section = "Connector"

    cld.component = internal_section
    print(f"[cadissue] BB cover plate bolted: cld.component set to {internal_section} for section={section}")

    part_names = ["Beam", "Connector", "Bolt", "Weld"]
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
                    cld.component = part
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
                        print(f"Failed to write STL for part {part}: {stle}")
                except Exception as e:
                    print(f"Failed to build/write part {part}: {e}")

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


