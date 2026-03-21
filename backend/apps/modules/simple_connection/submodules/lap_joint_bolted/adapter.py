"""
Adapter for Lap Joint Bolted module
"""
from typing import Dict, Any, List
import os
import json
import traceback
from osdag_core.design_type.connection.lap_joint_bolted import LapJointBolted
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
from osdag_core.Common import KEY_DISP_LAPJOINTBOLTED
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
        "Bolt.Diameter",
        "Bolt.Grade",
        "Bolt.Type",
        "Bolt.Bolt_Hole_Type",
        "Bolt.Slip_Factor",
        "Design.For",
    ]

# Create shared validator instance
_validator = create_bolted_validator(get_required_keys(), "LapJointBolted")

def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate input values using shared validator"""
    _validator.validate(input_values)

def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """Generate output from input values"""
    output = {}
    logs = []
    try:
        module = LapJointBolted()
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
                "Bolt.Diameter_Provided": "Bolt.Diameter",
                "Bolt.Grade_Provided": "Bolt.Grade_Provided",
                "Bolt.Type_Provided": "Bolt.Type_Provided",
                "Bolt.Shear": "Bolt.Shear",
                "Bolt.Bearing": "Bolt.Bearing",
                "Bolt.Capacity": "Bolt.Capacity",
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
                "Member.Depth": "PlateWidth",
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
                "Plate.BaseCapacity": "Base Metal Capacity (kN)",
                "Plate.BaseUtilization": "Base Metal Utilization",
                "Bolt.Utilization": "Bolt Utilization",
                "Bolt.ConnLength": "Length of Connection (mm)",
                "Bolt.Pitch": "Pitch Distance (mm)",
                "Bolt.EndDist": "End Distance (mm)",
                "Bolt.Gauge": "Gauge Distance (mm)",
                "Bolt.EdgeDist": "Edge Distance (mm)",
                "PlateWidth": "Member Depth (mm)",
            }
            for tup in tuple_list or []:
                if len(tup) < 4:
                    continue
                src_key, label, param_type, val = tup[:4]
                param_type_lower = str(param_type).lower() if param_type else ""
                if param_type in ("OutButton", "Button", "Note", "Section", "Title", "Popup_Section") or "button" in param_type_lower or callable(val):
                    continue
                if src_key is None:
                    continue
                target_key = key_map.get(src_key, src_key)
                display_label = label_map.get(target_key, label or target_key)
                mapped_output[target_key] = {"key": target_key, "label": display_label, "val": val}

        if hasattr(module, "output_values"):
            map_tuple_list(module.output_values(True))
        if hasattr(module, "spacing") and callable(getattr(module, "spacing", None)):
            map_tuple_list(module.spacing(True))

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
                    print(f"[LapJointBolted] Error getting logs: {e}")
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
    """Generate the CAD model from input values as a BREP file. Return file path."""
    print(f"[LapJointBolted CAD] Starting CAD generation for section='{section}', session='{session}'")
    # Two separate plate options: Plate 1 and Plate 2 (each returns only that plate's geometry)
    valid_sections = ("Model", "Plate 1", "Plate 2", "Bolts", "Plate", "Bolt", "Connector")
    if section not in valid_sections:
        raise InvalidInputTypeError("section", "'Model', 'Plate 1', 'Plate 2', 'Bolts'")

    print(f"[LapJointBolted CAD] Creating module instance")
    module = LapJointBolted()
    print(f"[LapJointBolted CAD] Initializing logger")
    module.set_osdaglogger(None, id="web")
    print(f"[LapJointBolted CAD] Setting input values")
    module.set_input_values(input_values)
    print(f"[LapJointBolted CAD] Input values set successfully")
    if getattr(module, "module", None) != KEY_DISP_LAPJOINTBOLTED:
        print(f"[CAD DEBUG] Adjusting module.module from {getattr(module, 'module', None)} to {KEY_DISP_LAPJOINTBOLTED}")
        module.module = KEY_DISP_LAPJOINTBOLTED

    print(f"[LapJointBolted CAD] Initializing CommonDesignLogic")
    try:
        connection_key = KEY_DISP_LAPJOINTBOLTED
        mainmodule = "Moment Connection"
        folder = ""
        print(f"[LapJointBolted CAD] CommonDesignLogic params: connection={connection_key}, mainmodule={mainmodule}, folder='{folder}'")
        cdl = CommonDesignLogic(None, '', folder, connection_key, mainmodule)
        print(f"[LapJointBolted CAD] CommonDesignLogic initialized successfully")
    except Exception as e:
        print(f'[LapJointBolted CAD] Error initializing CommonDesignLogic: {e}')
        traceback.print_exc()
        return ""

    print(f"[LapJointBolted CAD] Setting up CAD")
    try:
        setup_for_cad(cdl, module)
        print(f"[LapJointBolted CAD] CAD setup completed")
    except Exception as e:
        traceback.print_exc()
        print(f'[LapJointBolted CAD] Error in setup_for_cad: {e}')

    # Call CAD method directly (bypassing create2Dcad since it doesn't have a branch for LapJointBolted)
    print(f"[LapJointBolted CAD] Calling createBoltedLapJoint()")
    try:
        lap_joint, plate1, plate2, bolts, nuts = cdl.createBoltedLapJoint()
        print(f"[LapJointBolted CAD] CAD components created -> lap_joint:{type(lap_joint)}, plate1:{type(plate1)}, plate2:{type(plate2)}, bolts:{type(bolts)}, nuts:{type(nuts)}")
    except Exception as exc:
        print(f"[LapJointBolted CAD] CAD build failed: {exc}")
        traceback.print_exc()
        return ""

    # Helper to flatten lists of shapes
    def _flatten_shapes(items):
        flat = []
        for m in items if isinstance(items, (list, tuple)) else [items]:
            if isinstance(m, (list, tuple)):
                flat.extend([x for x in m if x])
            elif m:
                flat.append(m)
        return flat

    # Helper to fuse shapes
    def _fuse_shapes(shapes):
        shapes = [s for s in shapes if s]
        if not shapes:
            return None
        if len(shapes) == 1:
            return shapes[0]
        fused = shapes[0]
        for s in shapes[1:]:
            fused = BRepAlgoAPI_Fuse(fused, s).Shape()
        return fused

    # Helper to create compound
    def _compound_shapes(shapes):
        shapes = [s for s in shapes if s]
        if not shapes:
            return None
        builder = BRep_Builder()
        comp = TopoDS_Compound()
        builder.MakeCompound(comp)
        for s in shapes:
            builder.Add(comp, s)
        return comp

    # Route components based on section
    print(f"[LapJointBolted CAD] Processing section: {section}")
    part_files = {}
    model = None

    print(f"[LapJointBolted CAD] Building model for section: {section}")
    try:
        if section == "Model":
            print(f"[LapJointBolted CAD] Building compound Model")
            # Combine all parts for Model
            fused_main = _fuse_shapes([p for p in [lap_joint, plate1, plate2] if p])
            bolts_comp = _compound_shapes(_flatten_shapes([bolts, nuts]))
            
            if fused_main and bolts_comp:
                model = BRepAlgoAPI_Fuse(fused_main, bolts_comp).Shape()
            elif fused_main:
                model = fused_main
            elif bolts_comp:
                model = bolts_comp
            
            # Write Plate part (combined plate1 + plate2)
            if plate1 or plate2:
                print(f"[LapJointBolted CAD] Writing Plate part")
                plate_combined = _fuse_shapes([p for p in [plate1, plate2] if p])
                if plate_combined:
                    part_file_name = f"{session}_Plate.brep"
                    part_file_path_rel = os.path.join("file_storage", "cad_models", part_file_name)
                    print(f"[LapJointBolted CAD] Writing Plate BREP: {part_file_path_rel}")
                    BRepTools.breptools.Write(plate_combined, part_file_path_rel, Message_ProgressRange())
                    part_files["Plate"] = part_file_path_rel
                    try:
                        part_stl_rel = part_file_path_rel.replace(".brep", ".stl")
                        print(f"[LapJointBolted CAD] Writing Plate STL: {part_stl_rel}")
                        write_stl(plate_combined, os.path.join(os.getcwd(), part_stl_rel))
                    except Exception as stle:
                        print(f"[LapJointBolted CAD] Failed to write STL for Plate: {stle}")
            
            # Write Bolts part
            if bolts_comp:
                print(f"[LapJointBolted CAD] Writing Bolts part")
                part_file_name = f"{session}_Bolts.brep"
                part_file_path_rel = os.path.join("file_storage", "cad_models", part_file_name)
                print(f"[LapJointBolted CAD] Writing Bolts BREP: {part_file_path_rel}")
                BRepTools.breptools.Write(bolts_comp, part_file_path_rel, Message_ProgressRange())
                part_files["Bolts"] = part_file_path_rel
                try:
                    part_stl_rel = part_file_path_rel.replace(".brep", ".stl")
                    print(f"[LapJointBolted CAD] Writing Bolts STL: {part_stl_rel}")
                    write_stl(bolts_comp, os.path.join(os.getcwd(), part_stl_rel))
                except Exception as stle:
                    print(f"[LapJointBolted CAD] Failed to write STL for Bolts: {stle}")
        
        elif section == "Plate 1":
            print(f"[LapJointBolted CAD] Building Plate 1 section (first plate only)")
            model = plate1
            print(f"[LapJointBolted CAD] Plate 1 model type: {type(model).__name__ if model else 'None'}")
        elif section == "Plate 2":
            print(f"[LapJointBolted CAD] Building Plate 2 section (second plate only)")
            model = plate2
            print(f"[LapJointBolted CAD] Plate 2 model type: {type(model).__name__ if model else 'None'}")
        elif section == "Plate":
            print(f"[LapJointBolted CAD] Building Plate section (combined plates)")
            model = _fuse_shapes([p for p in [plate1, plate2] if p])
            print(f"[LapJointBolted CAD] Plate model type: {type(model).__name__ if model else 'None'}")
        
        elif section in ("Bolt", "Bolts", "Connector"):
            print(f"[LapJointBolted CAD] Building {section} section (bolts/nuts)")
            # Return bolts/nuts as compound
            model = _compound_shapes(_flatten_shapes([bolts, nuts]))
            print(f"[LapJointBolted CAD] {section} model type: {type(model).__name__ if model else 'None'}")
        
        else:
            print(f"[LapJointBolted CAD] Building default section (lap_joint)")
            # Default: return lap_joint
            model = lap_joint
            print(f"[LapJointBolted CAD] Default model type: {type(model).__name__ if model else 'None'}")
        
    except Exception as e:
        print(f"[LapJointBolted CAD] Error processing CAD components: {e}")
        traceback.print_exc()
        return ""

    print(f"[LapJointBolted CAD] Creating CAD directory")
    cad_dir = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_dir, exist_ok=True)

    # Safe filename: replace spaces so "Plate 1" -> "Plate_1"
    section_safe = section.replace(" ", "_")
    file_name = f"{session}_{section_safe}.brep"
    file_path = os.path.join("file_storage", "cad_models", file_name)
    print(f"[LapJointBolted CAD] Target file path: {file_path}")

    if model is None:
        print(f"[LapJointBolted CAD] No model generated for section={section}; skipping write.")
        return ""

    print(f"[LapJointBolted CAD] Writing BREP file: {file_path}")
    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())
        print(f"[LapJointBolted CAD] BREP file written successfully")

        if section == "Model":
            print(f"[LapJointBolted CAD] Generating additional formats for Model")
            try:
                manifest = {
                    "session": session,
                    "mergedBrep": file_path,
                    "parts": [{"name": name, "brepPath": part_files.get(name)} for name in part_files.keys()]
                }
                for entry in manifest["parts"]:
                    if entry.get("brepPath"):
                        entry["stlPath"] = entry["brepPath"].replace(".brep", ".stl")
                manifest_path = file_path.replace(".brep", ".parts.json")
                full_manifest_path = os.path.join(os.getcwd(), manifest_path)
                with open(full_manifest_path, "w", encoding="utf-8") as mf:
                    json.dump(manifest, mf)
                print(f"[LapJointBolted CAD] Manifest written: {manifest_path}")
            except Exception as me:
                print(f"[LapJointBolted CAD] Warning: Failed to write manifest: {me}")

            try:
                print(f"[LapJointBolted CAD] Exporting STEP format")
                step_writer = STEPControl_Writer()
                step_writer.Transfer(model, STEPControl_AsIs)
                step_file_path = file_path.replace(".brep", ".step")
                full_step_file_path = os.path.join(os.getcwd(), step_file_path)
                if step_writer.Write(full_step_file_path) != 1:
                    print(f"[LapJointBolted CAD] Warning: Failed to save STEP file")
                else:
                    print(f"[LapJointBolted CAD] STEP file written: {step_file_path}")
            except Exception as stepe:
                print(f"[LapJointBolted CAD] Warning: STEP export failed: {stepe}")

            try:
                print(f"[LapJointBolted CAD] Exporting IGES format")
                iges_writer = IGESControl_Writer()
                iges_writer.AddShape(model)
                iges_file_path = file_path.replace(".brep", ".iges")
                full_iges_file_path = os.path.join(os.getcwd(), iges_file_path)
                if iges_writer.Write(full_iges_file_path) != 1:
                    print(f"[LapJointBolted CAD] Warning: Failed to save IGES file")
                else:
                    print(f"[LapJointBolted CAD] IGES file written: {iges_file_path}")
            except Exception as igee:
                print(f"[LapJointBolted CAD] Warning: IGES export failed: {igee}")

            try:
                merged_stl_rel = file_path.replace(".brep", ".stl")
                print(f"[LapJointBolted CAD] Writing merged STL: {merged_stl_rel}")
                write_stl(model, os.path.join(os.getcwd(), merged_stl_rel))
                print(f"[LapJointBolted CAD] Merged STL written successfully")
            except Exception as stle:
                print(f"[LapJointBolted CAD] Warning: Failed to save merged STL: {stle}")

    except Exception as e:
        print(f"[LapJointBolted CAD] Writing to BREP file failed: {e}")
        traceback.print_exc()

    if section != "Model":
        try:
            single_stl_rel = file_path.replace(".brep", ".stl")
            print(f"[LapJointBolted CAD] Writing single STL: {single_stl_rel}")
            write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
            print(f"[LapJointBolted CAD] Single STL written successfully")
        except Exception as stle:
            print(f"[LapJointBolted CAD] Warning: Failed to save STL for {section}: {stle}")

    print(f"[LapJointBolted CAD] CAD generation completed successfully. Returning path: {file_path}")
    return file_path

def create_from_input(input_values: Dict[str, Any]) -> Any:
    """Create module instance from input"""
    module = LapJointBolted()
    module.set_osdaglogger(None, id="web")
    validate_input(input_values)
    module.set_input_values(input_values)
    return module
