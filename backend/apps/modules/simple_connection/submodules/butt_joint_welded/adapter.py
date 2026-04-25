"""
Adapter for Butt Joint Welded module
"""
from typing import Dict, Any, List
import os
import json
import traceback
from osdag_core.design_type.connection.butt_joint_welded import ButtJointWelded
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from osdag_core.Common import KEY_DISP_BUTTJOINTWELDED
from osdag_core.custom_logger import CustomLogger
from apps.core.utils import (
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, validate_list_type, write_stl
)
from ...shared import setup_for_cad
from ...shared_validation import create_welded_validator

def get_required_keys() -> List[str]:
    return [
        "Module",
        "Material",
        "Load.Axial",
        "Plate1Thickness",
        "Plate2Thickness",
        "PlateWidth",
        "ButtJoint.CoverPlate",
        "Weld.Size",
        "Weld.Material_Grade_OverWrite",
        "Weld.Fab",
        "Design.For",
    ]

# Create shared validator instance
_validator = create_welded_validator(get_required_keys(), "ButtJointWelded")

def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate required inputs for ButtJointWelded using shared validator."""
    iv = dict(input_values or {})
    # Provide legacy defaults for weld metadata if omitted by caller or empty string
    if not iv.get("Weld.Material_Grade_OverWrite") or iv.get("Weld.Material_Grade_OverWrite", "").strip() == "":
        iv["Weld.Material_Grade_OverWrite"] = "410"
    if not iv.get("Weld.Fab") or iv.get("Weld.Fab", "").strip() == "":
        iv["Weld.Fab"] = "Shop Weld"
    if not iv.get("Weld.Type") or iv.get("Weld.Type", "").strip() == "":
        iv["Weld.Type"] = iv.get("Weld.Fab", "Shop Weld")
    # Persist defaults back to caller dict so downstream set_input_values sees them
    input_values.update(iv)
    # Use shared validator for validation
    _validator.validate(input_values)


def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate output from input values"""
    output = {}
    logs = []
    try:
        module = ButtJointWelded()
        module.set_osdaglogger(None, id="web")

        validate_input(input_values)
        module.set_input_values(input_values)

        for runner in ("design", "design_main", "design_module", "run_design"):
            design_fn = getattr(module, runner, None)
            if callable(design_fn):
                design_fn()
                break

        mapped_output = {}
        def map_tuple_list(tuple_list):
            key_map = {
                "Weld.Type": "Weld.Type",
                "Weld.Size": "Weld.Size",
                "Weld.EffLength": "Weld.EffLength",
                "Utilisation Ratio": "Utilisation Ratio",
                "No Cover Plate": "No Cover Plate",
                "Width of Cover Plate": "Width of Cover Plate",
                "Length of Cover Plate": "Length of Cover Plate",
                "Thickness of Cover Plate": "Thickness of Cover Plate",
                # Spacing details (for Butt Joint Welded)
                "Bolt.Pitch": "Bolt.Pitch",
                "Bolt.EndDist": "Bolt.EndDist",
                "Bolt.Gauge": "Bolt.Gauge",
                "Bolt.EdgeDist": "Bolt.EdgeDist",
            }
            label_map = {
                "Weld.Type": "Type",
                "Weld.Size": "Size (mm)",
                "Weld.EffLength": "Eff.Length (mm)",
                "Utilisation Ratio": "Utilisation Ratio",
                "No Cover Plate": "No Cover Plate",
                "Width of Cover Plate": "Width of Cover Plate",
                "Length of Cover Plate": "Length of Cover Plate",
                "Thickness of Cover Plate": "Thickness of Cover Plate",
                # Spacing details
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
        # Include spacing details for Butt Joint Welded (it has spacing() method in Osdag)
        if hasattr(module, "spacing") and callable(getattr(module, "spacing", None)):
            try:
                map_tuple_list(module.spacing(True))
            except (TypeError, AttributeError, ImportError) as e:
                # Resource file access may fail in web environment
                print(f"[ButtJointWelded] Could not load spacing diagram: {e}")
                # Continue without spacing diagram

        # Supplement with scalars if not already mapped
        def add_scalar(src_attr, target_key, label):
            if target_key in mapped_output:
                return
            if hasattr(module, src_attr):
                mapped_output[target_key] = {"key": target_key, "label": label, "val": getattr(module, src_attr)}

        add_scalar("weld_size", "Weld.Size", "Size (mm)")
        # Weld strength in Osdag is in kN (converted from N in output_values)
        if hasattr(module, 'weld_strength') and module.weld_strength:
            weld_strength_kn = round(module.weld_strength / 1000, 2) if module.weld_strength > 1000 else module.weld_strength
            mapped_output["Weld.Strength"] = {"key": "Weld.Strength", "label": "Strength (kN)", "val": weld_strength_kn}
        add_scalar("weld_length_effective", "Weld.EffLength", "Eff.Length (mm)")
        add_scalar("design_for", "Design For", "Design For")
        add_scalar("weld_length_provided", "Bolt.ConnLength", "Length of Connection (mm)")  # reused key for length

        if mapped_output:
            output = mapped_output
        elif hasattr(module, "output_values_dict") and isinstance(module.output_values_dict, dict):
            output = module.output_values_dict
        else:
            output = {}

        # Get logs from the custom logger (same as fin_plate)
        logs = []
        if hasattr(module, 'logger'):
            if isinstance(module.logger, CustomLogger):
                try:
                    logs = module.logger.get_logs()
                except Exception as e:
                    print(f"[ButtJointWelded] Error getting logs: {e}")
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
    Desktop options: Model, Plate 1, Plate 2, Cover Plate, Welds.
    """
    valid_sections = ("Model", "Plate 1", "Plate 2", "Cover Plate", "Welds")
    if section not in valid_sections:
        raise InvalidInputTypeError("section", "'Model', 'Plate 1', 'Plate 2', 'Cover Plate', 'Welds'")

    module = ButtJointWelded()
    module.set_osdaglogger(None, id="web")
    validate_input(input_values)
    module.set_input_values(input_values)
    if getattr(module, "module", None) != KEY_DISP_BUTTJOINTWELDED:
        module.module = KEY_DISP_BUTTJOINTWELDED

    try:
        connection_key = KEY_DISP_BUTTJOINTWELDED
        mainmodule = getattr(module, "mainmodule", "Moment Connection")
        folder = ""
        cdl = CommonDesignLogic(None, '', folder, connection_key, mainmodule)
    except Exception as e:
        print('Error initializing CommonDesignLogic:', e)
        return ""

    try:
        setup_for_cad(cdl, module)
    except Exception as e:
        traceback.print_exc()
        print('Error in setup_for_cad:', e)
        return ""

    try:
        (cdl.assembly, cdl.plate1_model, cdl.plate2_model, cdl.platec_model, cdl.platec2_model,
         cdl.weld_models, cdl.packing1_model, cdl.packing2_model) = cdl.createButtJointWeldedCAD()
    except Exception as e:
        print(f"Error in createButtJointWeldedCAD: {e}")
        traceback.print_exc()
        return ""

    def _compound_shapes(shapes):
        from OCC.Core.BRep import BRep_Builder
        from OCC.Core.TopoDS import TopoDS_Compound
        shapes = [s for s in (shapes if isinstance(shapes, (list, tuple)) else [shapes]) if s]
        if not shapes:
            return None
        if len(shapes) == 1:
            return shapes[0]
        builder = BRep_Builder()
        comp = TopoDS_Compound()
        builder.MakeCompound(comp)
        for s in shapes:
            builder.Add(comp, s)
        return comp

    model = None
    part_files = {}
    part_names = []

    if section == "Model":
        builder = BRep_Builder()
        compound = TopoDS_Compound()
        builder.MakeCompound(compound)
        for shape in [cdl.plate1_model, cdl.plate2_model, cdl.platec_model,
                      cdl.platec2_model if getattr(cdl, 'platec2_model', None) else None,
                      cdl.packing1_model if getattr(cdl, 'packing1_model', None) else None,
                      cdl.packing2_model if getattr(cdl, 'packing2_model', None) else None] + (list(cdl.weld_models) if cdl.weld_models else []):
            if shape:
                builder.Add(compound, shape)
        model = compound
        part_names = ["Plate_1", "Plate_2", "Cover_Plate", "Welds"]
    elif section == "Plate 1":
        model = cdl.plate1_model
    elif section == "Plate 2":
        model = cdl.plate2_model
    elif section == "Cover Plate":
        cover_parts = [cdl.platec_model]
        if getattr(cdl, 'platec2_model', None):
            cover_parts.append(cdl.platec2_model)
        if getattr(cdl, 'packing1_model', None):
            cover_parts.append(cdl.packing1_model)
        if getattr(cdl, 'packing2_model', None):
            cover_parts.append(cdl.packing2_model)
        model = _compound_shapes(cover_parts)
    elif section == "Welds":
        model = _compound_shapes(cdl.weld_models)

    if model is None:
        print(f"[CAD DEBUG] No model generated for section={section}; skipping write.")
        return ""

    cad_dir = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_dir, exist_ok=True)

    section_safe = section.replace(" ", "_")
    file_name = f"{session}_{section_safe}.brep"
    file_path = os.path.join("file_storage", "cad_models", file_name)

    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())

        if section == "Model":
            try:
                manifest = {
                    "session": session,
                    "mergedBrep": file_path,
                    "parts": [{"name": name, "brepPath": part_files.get(name)} for name in part_names if part_files.get(name)]
                }
                for entry in manifest["parts"]:
                    if entry.get("brepPath"):
                        entry["stlPath"] = entry["brepPath"].replace(".brep", ".stl")
                manifest_path = file_path.replace(".brep", ".parts.json")
                full_manifest_path = os.path.join(os.getcwd(), manifest_path)
                with open(full_manifest_path, "w", encoding="utf-8") as mf:
                    json.dump(manifest, mf)
            except Exception as me:
                print(f"Warning: Failed to write manifest: {me}")

            try:
                step_writer = STEPControl_Writer()
                step_writer.Transfer(model, STEPControl_AsIs)
                step_file_path = file_path.replace(".brep", ".step")
                full_step_file_path = os.path.join(os.getcwd(), step_file_path)
                if step_writer.Write(full_step_file_path) != 1:
                    print("Warning: Failed to save STEP file")
            except Exception as stepe:
                print(f"Warning: STEP export failed: {stepe}")

            try:
                iges_writer = IGESControl_Writer()
                iges_writer.AddShape(model)
                iges_file_path = file_path.replace(".brep", ".iges")
                full_iges_file_path = os.path.join(os.getcwd(), iges_file_path)
                if iges_writer.Write(full_iges_file_path) != 1:
                    print("Warning: Failed to save IGES file")
            except Exception as igee:
                print(f"Warning: IGES export failed: {igee}")

            try:
                merged_stl_rel = file_path.replace(".brep", ".stl")
                write_stl(model, os.path.join(os.getcwd(), merged_stl_rel))
            except Exception as stle:
                print(f"Warning: Failed to save merged STL: {stle}")

    except Exception as e:
        print("Writing to BREP file failed:", e)

    if section != "Model":
        try:
            single_stl_rel = file_path.replace(".brep", ".stl")
            write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
        except Exception as stle:
            print(f"Warning: Failed to save STL for {section}: {stle}")

    return file_path

def create_from_input(input_values: Dict[str, Any]) -> Any:
    """Create module instance from input"""
    module = ButtJointWelded()
    module.set_osdaglogger(None, id="web")
    validate_input(input_values)
    module.set_input_values(input_values)
    return module
