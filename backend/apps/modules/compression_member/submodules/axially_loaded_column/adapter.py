"""
Axially Loaded Column - Design Adapter

Implements the business logic bridge between the generic module API and
the core osdag_web ColumnDesign implementation for axially loaded columns.

This adapter:
  - Validates inputs for type and presence (consistent with fin_plate / struts_bolted patterns).
  - Maps flat input dicts into the exact keys expected by ColumnDesign.set_input_values().
  - Runs the design and flattens ColumnDesign.output_values() into
    { key: { key, label, val } } for the web frontend.
  - Generates CAD models using CommonDesignLogic.

Key mappings (frontend key → core key from Common.py):
  "Actual.Length_zz"  → KEY_UNSUPPORTED_LEN_ZZ = 'Unsupported.Length_zz'
  "Actual.Length_yy"  → KEY_UNSUPPORTED_LEN_YY = 'Unsupported.Length_yy'
  "Material"          → KEY_MATERIAL = 'Material'  (also copied to KEY_SEC_MATERIAL = 'Member.Material')
  "Member.Designation"→ KEY_SECSIZE = 'Member.Designation'  (must be a non-empty list of str)
  "Load.Axial"        → KEY_AXIAL = 'Load.Axial'
"""

from typing import Dict, Any, List, Tuple
import os
import json
import traceback

from apps.core.utils import (
    MissingKeyError,
    InvalidInputTypeError,
    contains_keys,
    float_able,
    int_able,
    validate_list_type,
    custom_list_validation,
    build_raw_output_dict,
)
from osdag_core.design_type.compression_member.compression_column import ColumnDesign
from osdag_core.custom_logger import CustomLogger

try:
    from OCC.Core import BRepTools
    from OCC.Core.Message import Message_ProgressRange
    from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
    from OCC.Core.IGESControl import IGESControl_Writer
    from apps.core.utils import write_stl
    _OCC_AVAILABLE = True
except ImportError:  # pragma: no cover - OCC may not be present in all environments
    _OCC_AVAILABLE = False

try:
    from osdag_core.cad.common_logic import CommonDesignLogic
    _CDL_AVAILABLE = True
except ImportError:
    _CDL_AVAILABLE = False

# Module display name — must match CommonDesignLogic expectations
KEY_DISP_COMPRESSION_COLUMN = "Columns with known support conditions"


def get_required_keys() -> List[str]:
    """
    Return all required input parameters for the module.

    Keys are what the frontend sends (buildSubmissionParams in axiallyLoadedColumnConfig.js).
    The adapter maps these to the exact keys ColumnDesign.set_input_values() reads.
    """
    return [
        "Module",
        "Member.Profile",
        "Member.Designation",
        "Material",
        "Actual.Length_zz",
        "Actual.Length_yy",
        "End_1",
        "End_2",
        "End_1_Y",
        "End_2_Y",
        "Load.Axial",
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """
    Validate that all required keys are present and of the correct type.

    Pattern mirrors fin_plate and struts_bolted adapters:
    - String fields: isinstance(x, str)
    - Numeric fields (as strings): isinstance(x, str) and float_able/int_able(x)
    - List fields: isinstance(x, list) and all items are str
    """
    required = get_required_keys()
    missing = contains_keys(input_values, required)
    if missing is not None:
        raise MissingKeyError(missing[0])

    # --- String fields ---
    str_keys = [
        "Module",
        "Member.Profile",
        "Material",
        "End_1",
        "End_2",
        "End_1_Y",
        "End_2_Y",
    ]
    for key in str_keys:
        if not isinstance(input_values.get(key), str):
            raise InvalidInputTypeError(key, "str")

    # --- Member.Designation: must be a non-empty list of strings ---
    md = input_values.get("Member.Designation")
    if not isinstance(md, list):
        raise InvalidInputTypeError("Member.Designation", "List[str]")
    if not validate_list_type(md, str):
        raise InvalidInputTypeError("Member.Designation", "List[str] where each item is a string")
    cleaned = [s.strip() for s in md if s.strip()]
    if not cleaned:
        raise InvalidInputTypeError(
            "Member.Designation",
            "non-empty List[str] — at least one section must be selected",
        )

    # --- Numeric fields (frontend sends strings or numbers) ---
    for key in ["Actual.Length_zz", "Actual.Length_yy"]:
        val = input_values.get(key)
        if not (isinstance(val, str) and float_able(val)) and not isinstance(val, (int, float)):
            raise InvalidInputTypeError(
                key, "str convertible to float, or a numeric value"
            )

    val_axial = input_values.get("Load.Axial")
    if not (isinstance(val_axial, str) and float_able(str(val_axial))) and not isinstance(val_axial, (int, float)):
        raise InvalidInputTypeError(
            "Load.Axial", "str convertible to float, or a numeric value"
        )

    # --- Member.Profile must be non-empty ---
    if not input_values.get("Member.Profile"):
        raise InvalidInputTypeError("Member.Profile", "non-empty str")


def create_module() -> ColumnDesign:
    """
    Create and initialize a ColumnDesign instance for web usage.
    """
    module = ColumnDesign()
    try:
        module.set_osdaglogger(None, id="web")
    except Exception:
        traceback.print_exc()
    return module


def _to_float(val: Any) -> float:
    """Safely convert a value to float."""
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0


def create_from_input(input_values: Dict[str, Any]) -> ColumnDesign:
    """
    Create a ColumnDesign instance and populate it from flat frontend input values.

    This is the single place where frontend key names are translated into the
    exact keys that ColumnDesign.set_input_values() reads from Common.py constants.
    """
    # Validate first
    validate_input(input_values)

    # Normalize Member.Designation to a clean list of stripped strings
    md_raw = input_values.get("Member.Designation", [])
    if isinstance(md_raw, str):
        # Should not normally happen given validate_input above, but guard it
        try:
            md_raw = json.loads(md_raw)
        except Exception:
            md_raw = [md_raw]
    member_designation = [str(x).strip() for x in md_raw if str(x).strip()]

    # Build design dictionary with the exact key names ColumnDesign.set_input_values() reads:
    #   KEY_MODULE         = 'Module'
    #   KEY_SEC_PROFILE    = 'Member.Profile'
    #   KEY_SECSIZE        = 'Member.Designation'         ← must be a list
    #   KEY_SEC_MATERIAL   = 'Member.Material'            ← used at set_input_values line 679
    #   KEY_MATERIAL       = 'Material'
    #   KEY_UNSUPPORTED_LEN_ZZ = 'Unsupported.Length_zz' ← NOT 'Actual.Length_zz'
    #   KEY_UNSUPPORTED_LEN_YY = 'Unsupported.Length_yy' ← NOT 'Actual.Length_yy'
    #   KEY_END1           = 'End_1'
    #   KEY_END2           = 'End_2'
    #   KEY_END1_Y         = 'End_1_Y'
    #   KEY_END2_Y         = 'End_2_Y'
    #   KEY_AXIAL          = 'Load.Axial'
    #   KEY_ALLOW_UR       = 'Optimum.AllowUR'
    #   KEY_EFFECTIVE_AREA_PARA = 'Effective.Area_Para'
    #   KEY_DP_DESIGN_METHOD    = 'Design.Design_Method'
    material = str(input_values.get("Material", "E 250 (Fe 410 W)A"))

    design_dict: Dict[str, Any] = {
        "Module":                    str(input_values.get("Module", "Axially-Loaded-Column")),
        "Member.Profile":            str(input_values.get("Member.Profile", "Beams and Columns")),
        "Member.Designation":        member_designation,
        "Material":                  material,
        "Member.Material":           material,                          # KEY_SEC_MATERIAL
        "Unsupported.Length_zz":     _to_float(input_values.get("Actual.Length_zz", 3000)),
        "Unsupported.Length_yy":     _to_float(input_values.get("Actual.Length_yy", 3000)),
        "End_1":                     str(input_values.get("End_1", "Fixed")),
        "End_2":                     str(input_values.get("End_2", "Fixed")),
        "End_1_Y":                   str(input_values.get("End_1_Y", "Fixed")),
        "End_2_Y":                   str(input_values.get("End_2_Y", "Fixed")),
        "Load.Axial":                str(_to_float(input_values.get("Load.Axial", 100))),
        # Design preference keys with sensible defaults (core reads in try/except)
        "Optimum.AllowUR":           str(input_values.get("Optimum.AllowUR", "1.0")),
        "Effective.Area_Para":       str(input_values.get("Effective.Area_Para", "1.0")),
        "Optimum.Para":              str(input_values.get("Optimum.Para", "Utilization Ratio")),
        "Steel.Cost":                str(input_values.get("Steel.Cost", "50")),
        "Design.Design_Method":      str(input_values.get("Design.Design_Method", "Limit State Design")),
    }

    module = create_module()
    module.set_input_values(design_dict)
    # Restore the display name for reports (set_input_values overrides self.module with the raw KEY_MODULE value)
    module.module = "Columns with known support conditions"
    return module


def generate_output(
    input_values: Dict[str, Any]
) -> Tuple[Dict[str, Any], List[str], Dict[str, Any]]:
    """
    Run the ColumnDesign calculation and flatten its outputs.

    Returns:
        output: dict of { key: { key, label, val } }
        logs: list of log strings
    """
    output: Dict[str, Any] = {}
    logs: List[str] = []

    # Step 1: Create and run design — let exceptions propagate so the service
    # layer can catch them and return success=False correctly.
    module = create_from_input(input_values)

    # Step 2: Get logs from CustomLogger
    try:
        if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
            logs = module.logger.get_logs() or []
        else:
            logs = ["Axially Loaded Column computation completed."]
    except Exception:
        logs = ["Axially Loaded Column computation completed."]

    # Step 3: Flatten output.
    # Always pass True so output_values() returns actual computed values
    # (False returns empty strings for every field).
    # Unrecognised sections are now skipped inside section_classification(),
    # so design_status=False only means no valid section was found.
    design_status = getattr(module, "design_status", False)
    if not design_status:
        logs = logs + ["Design failed or no valid section found. Check inputs."]
        try:
            logs = list(reversed(logs))
        except Exception:
            pass
        return {}, logs, {}

    raw_output = module.output_values(True)
    raw_csv = build_raw_output_dict(raw_output)

    for param in raw_output:
        if not isinstance(param, (list, tuple)) or len(param) < 4:
            continue
        key = param[0]
        label = param[1]
        ptype = param[2]
        val = param[3]
        if key is None or ptype != "TextBox":
            continue
        # Unwrap numpy scalars if present
        if hasattr(val, "item"):
            try:
                val = val.item()
            except Exception:
                pass
        output[key] = {"key": key, "label": label, "val": val}

    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv


def create_cad_model(
    input_values: Dict[str, Any], section: str, session: str, export_formats=None
) -> str:
    """
    Generate a CAD model for the given section and return the file path.

    Args:
        input_values: Design input parameters (same dict used for design).
        section: Section name — currently only 'Model' is meaningful for this module.
        session: Session identifier used to build file names.
    """
    if section not in ("Model", "Column"):
        raise InvalidInputTypeError("section", "'Model' or 'Column'")

    if not _OCC_AVAILABLE or not _CDL_AVAILABLE:
        # OCC not installed — write placeholder
        cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
        os.makedirs(cad_models_path, exist_ok=True)
        placeholder = os.path.join(cad_models_path, f"{session}_{section}.brep")
        with open(placeholder, "w", encoding="utf-8") as f:
            f.write("OCC not available — placeholder CAD file.")
        return f"file_storage/cad_models/{session}_{section}.brep"

    try:
        module = create_from_input(input_values)
    except Exception as e:
        traceback.print_exc()
        raise InvalidInputTypeError(
            "input_values", f"Invalid design inputs for CAD generation: {e}"
        )

    # Ensure output directory
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_models_path, exist_ok=True)

    file_name = f"{session}_{section}.brep"
    file_path = f"file_storage/cad_models/{file_name}"

    try:
        cld = CommonDesignLogic(None, None, "", KEY_DISP_COMPRESSION_COLUMN, module.mainmodule)
    except Exception as e:
        traceback.print_exc()
        raise

    # Setup CAD
    try:
        cld.module = getattr(module, "module", KEY_DISP_COMPRESSION_COLUMN)
        cld.mainmodule = getattr(module, "mainmodule", None)
        cld.module_object = module
        cld.call_3DModel(True, module)
    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"[AxiallyLoadedColumn CAD] call_3DModel failed: {e}") from e

    cld.component = section
    try:
        model = cld.create2Dcad()
    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"[AxiallyLoadedColumn CAD] create2Dcad failed: {e}") from e

    if model is None:
        raise RuntimeError(
            f"[AxiallyLoadedColumn CAD] create2Dcad() returned None for section '{section}'. "
            "The 3D model could not be built — check call_3DModel logs above."
        )

    # Write BREP
    try:
        BRepTools.breptools.Write(model, os.path.join(os.getcwd(), file_path), Message_ProgressRange())
    except Exception as e:
        print(f"[AxiallyLoadedColumn CAD] BREP write failed: {e}")
        traceback.print_exc()

    # Write STL
    try:
        stl_path = file_path.replace(".brep", ".stl")
        write_stl(model, os.path.join(os.getcwd(), stl_path))
    except Exception as e:
        print(f"[AxiallyLoadedColumn CAD] STL write failed: {e}")

    # Optional STEP/IGES
    export_formats_lc = {f.lower() for f in export_formats} if export_formats else set()
    try:
        if export_formats_lc:
            from apps.core.utils.cad_export import export_step, export_iges
            if "step" in export_formats_lc:
                step_path = file_path.replace(".brep", ".step")
                export_step(model, os.path.join(os.getcwd(), step_path))
            if "iges" in export_formats_lc:
                iges_path = file_path.replace(".brep", ".iges")
                export_iges(model, os.path.join(os.getcwd(), iges_path))
    except Exception as e:
        print(f"[AxiallyLoadedColumn CAD] Optional export failed: {e}")

    return file_path
