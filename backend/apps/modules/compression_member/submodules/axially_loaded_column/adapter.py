"""
Axially Loaded Column - Design Adapter

Implements the business logic bridge between the generic module API and
the core osdag_web ColumnDesign implementation for axially loaded columns.

This adapter:
  - Validates inputs for type and presence.
  - Maps flat input dicts into ColumnDesign.set_input_values.
  - Runs the design and flattens ColumnDesign.output_values into
    { key: { key, label, val } } for the web frontend.
  - Generates CAD models using osdag_core.cad.common_logic.CommonDesignLogic.
"""

from typing import Dict, Any, List, Tuple
import os
import traceback

from apps.core.utils import (
    MissingKeyError,
    InvalidInputTypeError,
)

from osdag_core.design_type.compression_member.compression_column import ColumnDesign
from osdag_core.cad.common_logic import CommonDesignLogic

try:
    from OCC.Core.BRepTools import breptools_Write
    from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
    from OCC.Core.StlAPI import StlAPI_Writer
except ImportError:  # pragma: no cover - OCC may not be present in all environments
    breptools_Write = None
    STEPControl_Writer = None
    STEPControl_AsIs = None
    StlAPI_Writer = None
    StlAPI_Writer = None


def get_required_keys() -> List[str]:
    """
    Return all required input parameters for the module.

    Keys are chosen to match the frontend payload and what ColumnDesign
    expects in its design dictionary.
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


def _ensure_numeric(name: str, value: Any) -> float:
    """
    Convert a value to float, raising InvalidInputTypeError on failure.
    """
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            raise InvalidInputTypeError(
                name, "numeric (int/float) or numeric string"
            )
    raise InvalidInputTypeError(
        name, "numeric (int/float) or numeric string"
    )


def validate_input(input_values: Dict[str, Any]) -> None:
    """
    Validate that all required keys are present and of the correct type.

    This is intentionally strict to keep runtime errors closer to the
    user input, mirroring the behaviour of other adapters.
    """
    required = get_required_keys()
    missing = [k for k in required if k not in input_values]
    if missing:
        # raise the first missing key, consistent with other modules
        raise MissingKeyError(missing[0])

    # String keys that must be simple strings
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
        val = input_values.get(key)
        if not isinstance(val, str):
            raise InvalidInputTypeError(key, "str")

    # Member.Designation can be string or list[str]
    md = input_values.get("Member.Designation")
    if not isinstance(md, (str, list)):
        raise InvalidInputTypeError("Member.Designation", "str or List[str]")
    if isinstance(md, list):
        for item in md:
            if not isinstance(item, str):
                raise InvalidInputTypeError(
                    "Member.Designation",
                    "List[str] where each item is a string",
                )

    # Numeric keys: lengths and axial load
    for key in ["Actual.Length_zz", "Actual.Length_yy", "Load.Axial"]:
        _ensure_numeric(key, input_values.get(key))

    # Basic non-empty profile check
    if not input_values.get("Member.Profile"):
        raise InvalidInputTypeError("Member.Profile", "non-empty str")


def create_module() -> ColumnDesign:
    """
    Create and initialize a ColumnDesign instance for web usage.
    """
    module = ColumnDesign()
    # Use a generic logger id; the id string is only to keep instances distinct.
    try:
        module.set_osdaglogger(None, id="web")
    except Exception:
        # If logger setup fails, we still allow design to proceed.
        traceback.print_exc()
    return module


def create_from_input(input_values: Dict[str, Any]) -> ColumnDesign:
    """
    Create a ColumnDesign instance and populate it from flat input values.

    This function is the single place where we map frontend keys into the
    design dictionary expected by ColumnDesign.set_input_values.
    """
    # Validate strictly first
    validate_input(input_values)

    # Build a design dictionary matching compression_column.ColumnDesign expectations
    mapped: Dict[str, Any] = {
        "Module": input_values.get("Module", "Axially-Loaded-Column"),
        "Member.Profile": input_values.get("Member.Profile"),
        "Member.Designation": input_values.get("Member.Designation"),
        "Member.Material": input_values.get("Material"),
        # ColumnDesign uses unsupported lengths as base inputs; we also keep the
        # "Actual" keys around for completeness.
        "Actual.Length_zz": _ensure_numeric(
            "Actual.Length_zz", input_values.get("Actual.Length_zz")
        ),
        "Actual.Length_yy": _ensure_numeric(
            "Actual.Length_yy", input_values.get("Actual.Length_yy")
        ),
        "Unsupported.Length_zz": _ensure_numeric(
            "Actual.Length_zz", input_values.get("Actual.Length_zz")
        ),
        "Unsupported.Length_yy": _ensure_numeric(
            "Actual.Length_yy", input_values.get("Actual.Length_yy")
        ),
        "End_1": input_values.get("End_1"),
        "End_2": input_values.get("End_2"),
        "End_1_Y": input_values.get("End_1_Y"),
        "End_2_Y": input_values.get("End_2_Y"),
        "Load.Axial": _ensure_numeric(
            "Load.Axial", input_values.get("Load.Axial")
        ),
        "Optimum.AllowUR": str(input_values.get("Optimum.AllowUR", "1.0")),
        "Effective.Area_Para": str(input_values.get("Effective.Area_Para", "1.0")),
        "Optimum.Para": str(input_values.get("Optimum.Para", "Utilization Ratio")),
        "Steel.Cost": str(input_values.get("Steel.Cost", "50")),
        "Design.Design_Method": str(input_values.get("Design.Design_Method", "Limit State Design")),
    }

    module = create_module()
    module.set_input_values(mapped)
    return module


def generate_output(
    input_values: Dict[str, Any]
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Run the ColumnDesign calculation and flatten its outputs.

    Returns:
        output: dict of { key: { key, label, val } }
        logs: list of log strings
    """
    output: Dict[str, Any] = {}
    logs: List[str] = []

    try:
        module = create_from_input(input_values)
    except Exception as e:
        traceback.print_exc()
        return {}, [f"Error while creating ColumnDesign: {e}"]

    try:
        raw_output = module.output_values(True)
    except Exception as e:
        traceback.print_exc()
        return {}, [f"Error running ColumnDesign.output_values: {e}"]

    # Flatten only TextBox parameters
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

    # Logs from CustomLogger if available
    try:
        if hasattr(module, "logger") and hasattr(module.logger, "get_logs"):
            logs = module.logger.get_logs() or []
        else:
            logs = ["Axially Loaded Column computation completed."]
    except Exception:
        traceback.print_exc()
        logs = ["Axially Loaded Column computation completed."]

    return output, logs


def create_cad_model(
    input_values: Dict[str, Any], section: str, session: str
) -> str:
    """
    Generate a CAD model for the given section and return the file path.

    Args:
        input_values: Design input parameters (same dict used for design).
        section: One of 'Model' or 'Column' (others are rejected).
        session: Session identifier (used to build file names).
    """
    if section not in ("Model", "Column"):
        raise InvalidInputTypeError(
            "section", "'Model' or 'Column'"
        )

    try:
        module = create_from_input(input_values)
    except Exception as e:
        traceback.print_exc()
        raise InvalidInputTypeError(
            "input_values", f"Invalid design inputs for CAD generation: {e}"
        )

    base_tmp = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "tmp_cad",
    )
    session_folder = os.path.join(base_tmp, session)
    os.makedirs(session_folder, exist_ok=True)

    brep_path = os.path.join(session_folder, f"{section}.brep")
    stl_path = os.path.join(session_folder, f"{section}.stl")
    step_path = os.path.join(session_folder, f"{section}.step")

    # Try to obtain a shape from ColumnDesign via CommonDesignLogic
    final_shape = None
    try:
        try:
            cd = CommonDesignLogic(
                None, None, "", module.module if hasattr(module, "module") else "", module.mainmodule
            )
        except Exception:
            cd = CommonDesignLogic(None, None, "", "", getattr(module, "mainmodule", None))

        # Best-effort: call the 3D setup and 2D cad creation
        try:
            module.call_3DModel(True, module.__class__)
        except Exception:
            pass

        try:
            cd.module = getattr(module, "module", "")
            cd.mainmodule = getattr(module, "mainmodule", None)
            cd.module_object = module
            cd.component = section
            final_shape = cd.create2Dcad()
        except Exception:
            final_shape = None
    except Exception:
        traceback.print_exc()
        final_shape = None

    # Fallback: if no shape, write a small placeholder file
    if final_shape is None:
        with open(brep_path, "w", encoding="utf-8") as f:
            f.write("No CAD model produced for this input (empty).")
        return brep_path

    wrote_any = False

    # Prefer CommonDesignLogic's writers if available
    try:
        if hasattr(CommonDesignLogic, "write_brep"):
            cd.write_brep(final_shape, brep_path)  # type: ignore[attr-defined]
            wrote_any = True
    except Exception:
        traceback.print_exc()

    # Fallback: pythonOCC writers
    if not wrote_any and breptools_Write is not None:
        try:
            breptools_Write(final_shape, brep_path)
            wrote_any = True
        except Exception:
            traceback.print_exc()

    if not wrote_any and STEPControl_Writer is not None:
        try:
            writer = STEPControl_Writer()
            writer.Transfer(final_shape, STEPControl_AsIs)
            writer.Write(step_path)
            wrote_any = os.path.exists(step_path)
        except Exception:
            traceback.print_exc()

    # Try writing STL as well
    if StlAPI_Writer is not None:
        try:
            stl_writer = StlAPI_Writer()
            ok = stl_writer.Write(final_shape, stl_path)
            wrote_any = wrote_any or ok
        except Exception:
            traceback.print_exc()

    # Final fallback: if nothing wrote, return a tiny placeholder BREP
    if not wrote_any:
        with open(brep_path, "w", encoding="utf-8") as f:
            f.write("Failed to export true CAD model. This is a fallback placeholder.")

    # Prefer STL > STEP > BREP
    if os.path.exists(stl_path):
        return stl_path
    if os.path.exists(step_path):
        return step_path
    return brep_path

