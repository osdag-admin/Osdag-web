"""
Adapter for Butt Joint Bolted module
"""
from typing import Dict, Any, List
import os
import json
import traceback
from osdag_core.design_type.connection.butt_joint_bolted import ButtJointBolted
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from osdag_core.Common import KEY_DISP_BUTTJOINTBOLTED
from osdag_core.custom_logger import CustomLogger
from apps.core.utils import (
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, validate_list_type, write_stl
)
from ...shared import setup_for_cad
from ...shared_validation import create_bolted_validator

def get_required_keys() -> List[str]:
    return [
        "Module",
        "Material",
        "Load.Axial",
        "Plate1Thickness",
        "Plate2Thickness",
        "PlateWidth",
        "ButtJoint.CoverPlate",
        "Bolt.Diameter",
        "Bolt.Grade",
        "Bolt.Type",
        "Bolt.Bolt_Hole_Type",
        "Bolt.Slip_Factor",
        "Design.For",
    ]

# Create shared validator instance
_validator = create_bolted_validator(get_required_keys(), "ButtJointBolted")

def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate input values using shared validator"""
    _validator.validate(input_values)

def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate output from input values"""
    output = {}
    logs = []
    
    try:
        module = ButtJointBolted()
        module.set_osdaglogger(None, id="web")

        validate_input(input_values)
        module.set_input_values(input_values)

        for runner in ("design", "design_main", "design_module", "run_design"):
            design_fn = getattr(module, runner, None)
            if callable(design_fn):
                design_fn()
                break

        # Collect outputs via core tuple APIs
        mapped_output = {}
        def map_tuple_list(tuple_list):
            key_map = {
                # Bolt details
                "Bolt.Diameter_Provided": "Bolt.Diameter",
                "Bolt.Grade_Provided": "Bolt.Grade_Provided",
                "Bolt.Type_Provided": "Bolt.Type_Provided",
                "Bolt.Shear": "Bolt.Shear",
                "Bolt.Bearing": "Bolt.Bearing",
                "Bolt.Capacity": "Bolt.Capacity",
                # Bolt design
                "Bolt.Total_Number": "Bolt.number",
                "PackingPlate.Thickness": "PackingPlate thk",
                "Bolt.Rows_Provided": "Bolt.Rows",
                "Bolt.Columns_Provided": "Bolt.Cols",
                "Utilization.Ratio": "Bolt.UtilizationRatio",
                "Design.For": "Design For",
                "Plate.BaseCapacity": "Plate.BaseCapacity",
                "Plate.BaseUtilization": "Plate.BaseUtilization",
                "Bolt.Utilization": "Bolt.Utilization",
                "Bolt.Connection_Length": "Bolt.ConnLength",
                "Bolt.Pitch": "Bolt.Pitch",
                "Bolt.EndDist": "Bolt.EndDist",
                "Bolt.Gauge": "Bolt.Gauge",
                "Bolt.EdgeDist": "Bolt.EdgeDist",
            }
            label_map = {
                "Bolt.Diameter": "Diameter (mm)",
                "Bolt.Grade_Provided": "Property Class",
                "Bolt.Type_Provided": "Type",
                "Bolt.Shear": "Shear Capacity (kN)",
                "Bolt.Bearing": "Bearing Capacity (kN)",
                "Bolt.Capacity": "Capacity (kN)",
                "Bolt.number": "Number of Bolts",
                "PackingPlate thk": "Packing Plate Thickness (mm)",
                "Bolt.Rows": "Rows of Bolts",
                "Bolt.Cols": "Columns of Bolts",
                "Bolt.UtilizationRatio": "Utilisation Ratio",
                "Design For": "Design For",
                "Plate.BaseCapacity": "Connected Plate Capacity (kN)",
                "Plate.BaseUtilization": "Connected Plate Utilization",
                "Bolt.Utilization": "Bolt Utilization",
                "Bolt.ConnLength": "Length of Connection (mm)",
                "Bolt.Pitch": "Pitch Distance (mm)",
                "Bolt.EndDist": "End Distance (mm)",
                "Bolt.Gauge": "Gauge Distance (mm)",
                "Bolt.EdgeDist": "Edge Distance (mm)",
            }
            for tup in tuple_list or []:
                if len(tup) < 4:
                    continue
                src_key, label, param_type, val = tup[:4]
                # Skip buttons, notes, section images, and callables (but include actual spacing values)
                if param_type in ("OutButton", "Button", "Note", "Section", "Title", "Popup_Section") or callable(val):
                    continue
                # Skip None keys (used for titles/notes)
                if src_key is None:
                    continue
                target_key = key_map.get(src_key, src_key)
                display_label = label_map.get(target_key, label or target_key)
                mapped_output[target_key] = {"key": target_key, "label": display_label, "val": val}

        if hasattr(module, "output_values"):
            map_tuple_list(module.output_values(True))
        if hasattr(module, "spacing") and callable(getattr(module, "spacing", None)):
            map_tuple_list(module.spacing(True))

        # Spacing diagram expects PlateWidth; module has self.width from input
        if "PlateWidth" not in mapped_output:
            plate_width = None
            if hasattr(module, "width") and module.width is not None:
                try:
                    plate_width = float(module.width)
                except (TypeError, ValueError):
                    pass
            if plate_width is None:
                plate_width = input_values.get("PlateWidth")
            if plate_width is not None:
                mapped_output["PlateWidth"] = {"key": "PlateWidth", "label": "Plate Width (mm)", "val": plate_width}

        # If nothing mapped and module exposes a raw output dict, keep it
        if mapped_output:
            output = mapped_output
        elif hasattr(module, "get_output_values"):
            output = module.get_output_values()
        elif hasattr(module, "output"):
            output = module.output

        # Get logs from the custom logger (same as fin_plate and butt_joint_welded)
        logs = []
        if hasattr(module, 'logger'):
            if isinstance(module.logger, CustomLogger):
                try:
                    logs = module.logger.get_logs()
                except Exception as e:
                    print(f"[ButtJointBolted] Error getting logs: {e}")
                    logs = []
            else:
                logs = getattr(module, "logs", [])
        else:
            logs = getattr(module, "logs", [])
    except Exception as e:
        error_msg = f"Error in design: {str(e)}"
        if 'logs' not in locals():
            logs = []
        logs.append(error_msg)
        traceback.print_exc()
    return output, logs

def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path.
    Desktop options: Model, Plate 1, Plate 2, Cover Plate, Bolts.
    """
    print(f"[ButtJointBolted CAD] Starting CAD generation for section='{section}', session='{session}'")
    valid_sections = ("Model", "Plate 1", "Plate 2", "Cover Plate", "Bolts")
    if section not in valid_sections:
        raise InvalidInputTypeError("section", "'Model', 'Plate 1', 'Plate 2', 'Cover Plate', 'Bolts'")

    print(f"[ButtJointBolted CAD] Creating module instance")
    module = ButtJointBolted()
    print(f"[ButtJointBolted CAD] Initializing logger")
    module.set_osdaglogger(None, id="web")
    print(f"[ButtJointBolted CAD] Setting input values")
    module.set_input_values(input_values)
    print(f"[ButtJointBolted CAD] Input values set successfully")
    # Force correct display key for CAD, mirroring fin plate behavior
    if getattr(module, "module", None) != KEY_DISP_BUTTJOINTBOLTED:
        print(f"[CAD DEBUG] Adjusting module.module from {getattr(module, 'module', None)} to {KEY_DISP_BUTTJOINTBOLTED}")
        module.module = KEY_DISP_BUTTJOINTBOLTED

    # Setup CAD helper (following fin_plate pattern)
    print(f"[ButtJointBolted CAD] Initializing CommonDesignLogic")
    try:
        connection_key = KEY_DISP_BUTTJOINTBOLTED
        folder = ""
        print(f"[ButtJointBolted CAD] CommonDesignLogic params: connection={connection_key}, mainmodule={module.mainmodule}, folder='{folder}'")
        cdl = CommonDesignLogic(None, None, folder, connection_key, module.mainmodule)
        print(f"[ButtJointBolted CAD] CommonDesignLogic initialized successfully")
        print(f"[ButtJointBolted CAD] cdl.mainmodule={cdl.mainmodule}, cdl.connection={cdl.connection}")
    except Exception as e:
        print(f'[ButtJointBolted CAD] Error initializing CommonDesignLogic: {e}')
        traceback.print_exc()
        return ""

    print(f"[ButtJointBolted CAD] Setting up CAD")
    try:
        setup_for_cad(cdl, module)
        print(f"[ButtJointBolted CAD] CAD setup completed")
    except Exception as e:
        traceback.print_exc()
        print(f'[ButtJointBolted CAD] Error in setup_for_cad: {e}')

    # Create CAD models first (populates cdl.assembly, cdl.plate1_model, etc.)
    print(f"[ButtJointBolted CAD] Creating CAD models")
    try:
        # Unpack tuple and assign to cdl attributes (same as line 3221 in common_logic.py)
        cdl.assembly, cdl.plate1_model, cdl.plate2_model, cdl.platec_model, cdl.platec2_model, cdl.bolt_models, cdl.nuts_models, cdl.packing1_model, cdl.packing2_model = cdl.createButtJointBoltedCAD()
        print(f"[ButtJointBolted CAD] CAD models created and assigned successfully")
        print(f"[ButtJointBolted CAD] assembly type: {type(cdl.assembly).__name__ if cdl.assembly else 'None'}")
        print(f"[ButtJointBolted CAD] plate1_model type: {type(cdl.plate1_model).__name__ if cdl.plate1_model else 'None'}")
        print(f"[ButtJointBolted CAD] platec_model type: {type(cdl.platec_model).__name__ if cdl.platec_model else 'None'}")
    except Exception as exc:
        print(f"[ButtJointBolted CAD] CAD build failed: {exc}")
        traceback.print_exc()
        return ""

    # Map desktop section names to create2Dcad() component names (Plate1, Plate2, Cover Plate, Connector)
    section_to_component = {
        "Plate 1": "Plate1",
        "Plate 2": "Plate2",
        "Cover Plate": "Cover Plate",
        "Bolts": "Connector",
    }
    cdl.component = section_to_component.get(section, "")

    print(f"[ButtJointBolted CAD] Setting component='{cdl.component}' for section='{section}'")

    # Generate model using create2Dcad()
    print(f"[ButtJointBolted CAD] Calling create2Dcad()")
    try:
        model = cdl.create2Dcad()
        print(f"[ButtJointBolted CAD] Generated model type: {type(model).__name__ if model else 'None'}")
    except Exception as e:
        print(f"[ButtJointBolted CAD] Error in create2Dcad(): {e}")
        traceback.print_exc()
        return ""

    # create2Dcad() returns a list for Connector (bolts+nuts); compound them
    if isinstance(model, (list, tuple)) and model:
        print(f"[ButtJointBolted CAD] Model is a list/tuple with {len(model)} items, building compound")
        from OCC.Core.BRep import BRep_Builder
        from OCC.Core.TopoDS import TopoDS_Compound
        builder = BRep_Builder()
        comp = TopoDS_Compound()
        builder.MakeCompound(comp)
        for shape in model:
            if shape:
                builder.Add(comp, shape)
        model = comp
        print(f"[ButtJointBolted CAD] Compound model type: {type(model).__name__}")

    if model is None:
        print(f"[ButtJointBolted CAD] No model generated for section={section}; skipping write.")
        return ""

    # Create CAD directory
    print(f"[ButtJointBolted CAD] Creating CAD directory")
    cad_dir = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_dir, exist_ok=True)

    section_safe = section.replace(" ", "_")
    file_name = f"{session}_{section_safe}.brep"
    file_path = os.path.join("file_storage", "cad_models", file_name)
    print(f"[ButtJointBolted CAD] Target file path: {file_path}")

    # Write BREP file (following fin_plate pattern)
    print(f"[ButtJointBolted CAD] Writing BREP file: {file_path}")
    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())
        print(f"[ButtJointBolted CAD] BREP file written successfully")
    except Exception as e:
        print(f"[ButtJointBolted CAD] Writing to BREP file failed: {e}")
        traceback.print_exc()
        return ""

    # Export STL next to BREP (following fin_plate pattern)
    try:
        single_stl_rel = file_path.replace(".brep", ".stl")
        print(f"[ButtJointBolted CAD] Writing STL: {single_stl_rel}")
        write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
        print(f"[ButtJointBolted CAD] STL file saved at {os.path.join(os.getcwd(), single_stl_rel)}")
    except Exception as stle:
        print(f"[ButtJointBolted CAD] Warning: Failed to save STL for {section}: {stle}")

    print(f"[ButtJointBolted CAD] CAD generation completed successfully. Returning path: {file_path}")
    return file_path

def create_from_input(input_values: Dict[str, Any]) -> Any:
    """Create module instance from input"""
    module = ButtJointBolted()
    module.set_osdaglogger(None, id="web")
    validate_input(input_values)
    module.set_input_values(input_values)
    return module
