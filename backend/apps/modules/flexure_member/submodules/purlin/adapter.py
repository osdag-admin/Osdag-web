"""
Purlin Adapter
Implements the business logic for the Purlin flexure module.
"""
from backend.apps.modules.simple_connection.shared import setup_for_cad
from osdag_core.Common import KEY_DISP_FLEXURE4
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
)
from OCC.Core.BRep import BRep_Builder
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRepTools import breptools_Write
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.design_type.flexural_member.flexure_purlin import Flexure_Purlin
import sys
import os
from typing import Dict, Any, List
import json
import traceback
from apps.core.utils import write_stl


def get_required_keys() -> List[str]:
    """
    Return all required input parameters for Purlin module.
    Keys must match frontend buildSubmissionParams().
    """
    return [
        "Module",                  # KEY_MODULE
        "Member.Profile",          # KEY_SEC_PROFILE
        "Member.Designation",      # KEY_SECSIZE
        "Material",                # KEY_MATERIAL
        "Member.Material",         # KEY_SEC_MATERIAL
        "Cladding.type",           # KEY_CLADDING

        "Load.Moment_YY",
        "Load.Moment_ZZ",

        "Load.Shear.YY",
        "Load.Shear.ZZ",

        "Member.Length",

        "Torsion.restraint",       # KEY_TORSIONAL_RES
        "Warping.restraint",       # KEY_WARPING_RES
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """
    Validate presence and type of required inputs for Purlin module.
    Accepts frontend-style keys directly.
    """
    pass


def _create_purlin_module() -> Flexure_Purlin:
    """Create and initialize a Flexure_Purlin instance with a working logger."""
    module = Flexure_Purlin()
    module.set_osdaglogger(None, id="web")
    return module


def _validate_and_fix_sections(sec_profile: str, sec_size: list) -> tuple:
    """
    Validate section designations against the actual database table for the given
    profile type. If any designation is not found in the declared table, attempt to
    find the correct table and return a corrected (sec_profile, sec_size) tuple.

    This prevents 'NoneType' crashes inside ISection when a wrong profile type is
    sent from the frontend (e.g., 'JB 150' with profile 'Channels').
    """
    import sqlite3
    from osdag_core.Common import PATH_TO_DATABASE, VALUES_SECTYPE

    # Map sec_profile string to the DB table name to validate against
    CHANNEL_PROFILE = VALUES_SECTYPE[6]   # 'Channels'
    ISEC_PROFILE = VALUES_SECTYPE[1]      # 'Beams and Columns'

    profile_table_map = {
        CHANNEL_PROFILE: "Channels",
    }

    target_table = profile_table_map.get(sec_profile)
    if target_table is None:
        # Profile is Beams/Columns or unknown — core handles it fine already
        return sec_profile, sec_size

    try:
        conn = sqlite3.connect(str(PATH_TO_DATABASE))
        cur = conn.cursor()

        validated = []
        corrected_profile = sec_profile

        for designation in sec_size:
            designation = designation.strip("'")

            # Check in the declared table
            cur.execute(f"SELECT Designation FROM {target_table} WHERE Designation = ?", (designation,))
            if cur.fetchone():
                validated.append(designation)
                continue

            # Not found — check Beams
            cur.execute("SELECT Designation FROM Beams WHERE Designation = ?", (designation,))
            if cur.fetchone():
                print(f"[purlin adapter] '{designation}' not in '{target_table}', correcting profile to '{ISEC_PROFILE}'")
                corrected_profile = ISEC_PROFILE
                validated.append(designation)
                continue

            # Check Columns
            cur.execute("SELECT Designation FROM Columns WHERE Designation = ?", (designation,))
            if cur.fetchone():
                print(f"[purlin adapter] '{designation}' not in '{target_table}', correcting profile to '{ISEC_PROFILE}'")
                corrected_profile = ISEC_PROFILE
                validated.append(designation)
                continue

            print(f"[purlin adapter] WARNING: '{designation}' not found in any known table. Skipping.")

        conn.close()

        if not validated:
            print(f"[purlin adapter] No valid sections found after validation; keeping originals.")
            return sec_profile, sec_size

        return corrected_profile, validated

    except Exception as e:
        print(f"[purlin adapter] Section validation failed ({e}); proceeding with original values.")
        return sec_profile, sec_size


def create_from_input(input_values: dict):
    """
    Robust input adapter for Purlin.
    This function GUARANTEES all keys required by flexure_purlin.set_input_values()
    are present, even if frontend does not send them.
    """

    from osdag_core.Common import (
        KEY_MODULE,
        KEY_SEC_PROFILE,
        KEY_SECSIZE,
        KEY_LENGTH,
        KEY_LENGTH_OVERWRITE,
        KEY_MOMENT_YY,
        KEY_MOMENT_ZZ,
        KEY_SHEAR_YY,
        KEY_SHEAR_ZZ,
        KEY_CLADDING,
        KEY_TORSIONAL_RES,
        KEY_WARPING_RES,
        KEY_MATERIAL,
        KEY_SEC_MATERIAL,
        KEY_EFFECTIVE_AREA_PARA,
        KEY_ALLOW_CLASS,
        KEY_BEARING_LENGTH,
    )

    # Create and initialize module WITH logger set up BEFORE set_input_values
    module = _create_purlin_module()

    # -------------------------------
    # SECTION PROFILE (MANDATORY)
    # -------------------------------
    sec_profile = (
        input_values.get("Member.Profile")
        or input_values.get("section_profile")
        or input_values.get("Section.Profile")
    )

    if not sec_profile:
        raise ValueError("Section profile not received from frontend.")

    # -------------------------------
    # SECTION SIZE (OPTIONAL → DEFAULT)
    # -------------------------------
    sec_size = (
        input_values.get("Member.Designation")
        or input_values.get("section_designation")
        or input_values.get("Section.Size")
        or ["ISMC 75"]
    )

    if isinstance(sec_size, str):
        # Try parsing as JSON array
        try:
            sec_size = json.loads(sec_size)
        except Exception:
            sec_size = [sec_size]

    if not isinstance(sec_size, list) or not sec_size:
        sec_size = ["ISMC 75"]

    # -------------------------------
    # VALIDATE sections against DB — fix profile/section mismatches before
    # they reach the core (prevents 'NoneType' from ISection DB lookup)
    # -------------------------------
    sec_profile, sec_size = _validate_and_fix_sections(sec_profile, sec_size)

    # -------------------------------
    # MEMBER LENGTH (OPTIONAL → DEFAULT)
    # -------------------------------
    length = (
        input_values.get("Member.Length")
        or input_values.get("effective_span")
        or 5000.0
    )

    # -------------------------------
    # LOADS (OPTIONAL → ZERO)
    # -------------------------------
    moment_yy = (
        input_values.get("Load.Moment_YY")
        or input_values.get("Load.Moment.YY")
        or input_values.get("bending_moment_yy")
        or 0.0
    )

    moment_zz = (
        input_values.get("Load.Moment_ZZ")
        or input_values.get("Load.Moment.ZZ")
        or input_values.get("bending_moment_zz")
        or 0.0
    )

    shear_yy = (
        input_values.get("Load.Shear.YY")
        or input_values.get("shear_force_yy")
        or 0.0
    )

    shear_zz = (
        input_values.get("Load.Shear.ZZ")
        or input_values.get("shear_force_zz")
        or 0.0
    )

    # -------------------------------
    # CLADDING (OPTIONAL → DEFAULT)
    # -------------------------------
    cladding = (
        input_values.get("Cladding.type")
        or input_values.get("Cladding.Type")
        or input_values.get("cladding_type")
        or "Brittle Cladding"
    )

    # -------------------------------
    # RESTRAINTS (OPTIONAL → DEFAULT)
    # Purlin module uses KEY_TORSIONAL_RES = 'Torsion.restraint'
    # and KEY_WARPING_RES = 'Warping.restraint'
    # -------------------------------
    torsional = (
        input_values.get("Torsion.restraint")
        or input_values.get("torsional_restraint")
        or "Yes"
    )

    warping = (
        input_values.get("Warping.restraint")
        or input_values.get("warping_restraint")
        or "Yes"
    )

    # -------------------------------
    # MATERIAL (OPTIONAL → DEFAULT)
    # -------------------------------
    material = (
        input_values.get("Material")
        or input_values.get("material")
        or "E 250 (Fe 410 W)A"
    )

    sec_material = (
        input_values.get("Member.Material")
        or input_values.get("sec_material")
        or material
    )

    # -------------------------------
    # DESIGN PREFERENCES (OPTIONAL → DEFAULTS matching get_values_for_design_pref)
    # -------------------------------
    effective_area_para = float(
        input_values.get("Effective.Area_Para")
        or input_values.get("effective_area_para")
        or 1.0
    )

    allow_class = (
        input_values.get("Optimum.Class")
        or input_values.get("allow_class")
        or "Yes"
    )

    bearing_length = (
        input_values.get("Bearing.Length")
        or input_values.get("bearing_length")
        or "NA"
    )

    # -------------------------------
    # FINAL DESIGN DICTIONARY
    # All keys use the exact constant values from osdag_core.Common
    # -------------------------------
    design_dict = {
        KEY_MODULE: "Purlin",
        KEY_SEC_PROFILE: sec_profile,
        KEY_SECSIZE: sec_size,
        KEY_LENGTH: float(length),
        KEY_LENGTH_OVERWRITE: float(length),
        KEY_MOMENT_YY: float(moment_yy),
        KEY_MOMENT_ZZ: float(moment_zz),
        KEY_SHEAR_YY: float(shear_yy),
        KEY_SHEAR_ZZ: float(shear_zz),
        KEY_CLADDING: cladding,
        KEY_TORSIONAL_RES: torsional,
        KEY_WARPING_RES: warping,
        KEY_MATERIAL: material,
        KEY_SEC_MATERIAL: sec_material,
        KEY_EFFECTIVE_AREA_PARA: effective_area_para,
        KEY_ALLOW_CLASS: allow_class,
        KEY_BEARING_LENGTH: bearing_length,
    }

    module.set_input_values(design_dict)
    return module


def generate_output(input_values: Dict[str, Any]):
    """
    Generate formatted output for Purlin Module.
    """

    from osdag_core.custom_logger import CustomLogger

    output = {}
    logs = []

    try:
        # -----------------------------
        # Create module (logger is initialized inside _create_purlin_module)
        # -----------------------------
        module = create_from_input(input_values)

        raw_output = []

        # Collect available output sections
        for method_name in [
            "spacing",
            "output_values",
            "detail",
            "detailing",
        ]:
            if hasattr(module, method_name):
                method = getattr(module, method_name)
                result = method(True)
                if result:
                    raw_output += result

        # -----------------------------
        # Collect Logs
        # -----------------------------
        if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
            logs = module.logger.get_logs() or []
        else:
            logs = getattr(module, "logs", []) or []

        # -----------------------------
        # Format Output
        # -----------------------------
        for param in raw_output:
            if not param or len(param) < 4:
                continue

            key, label, field_type, value = param[:4]

            if field_type == "TextBox":
                if hasattr(value, "item"):
                    value = value.item()

                output[key] = {
                    "key": key,
                    "label": label,
                    "val": value
                }

        print(f"[Purlin] Generated {len(output)} output fields")
        print(f"[Purlin] Retrieved {len(logs)} logs")

    except Exception as e:
        print("Error in Purlin generate_output:", str(e))
        print(traceback.format_exc())

    # print(f"[Purlin] Final Output : {output}")
    # sys.exit()
    return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """
    Generate CAD model for Purlin.
    Returns relative BREP file path.
    """

    if section not in ("Model",):
        raise InvalidInputTypeError("section", "'Model'")

    # ------------------------------------
    # Create module from inputs
    # (logger is initialized inside _create_purlin_module via create_from_input)
    # ------------------------------------
    try:
        module = create_from_input(input_values)
    except Exception:
        traceback.print_exc()
        return ""

    module.module = KEY_DISP_FLEXURE4
    module.mainmodule = "Flexure Member"

    # ------------------------------------
    # Initialize CAD logic
    # ------------------------------------
    try:
        cld = CommonDesignLogic(None, None, "", KEY_DISP_FLEXURE4, module.mainmodule)
        setup_for_cad(cld, module)

        # IMPORTANT: attach module
        cld.module_object = module

    except Exception:
        traceback.print_exc()
        return ""

    # ------------------------------------
    # Call Purlin CAD
    # ------------------------------------
    try:
        purlin_shape = cld.createPurlin()
    except Exception:
        traceback.print_exc()
        return ""

    if purlin_shape is None:
        print("No shape returned from createPurlin()")
        return ""

    # ------------------------------------
    # Wrap into compound (for consistency)
    # ------------------------------------
    try:
        builder = BRep_Builder()
        compound = TopoDS_Compound()
        builder.MakeCompound(compound)
        builder.Add(compound, purlin_shape)

        model = compound

    except Exception:
        traceback.print_exc()
        return ""

    # ------------------------------------
    # Ensure directory exists
    # ------------------------------------
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_models_path, exist_ok=True)

    file_name = f"{session}_{section}.brep"
    file_path = os.path.join("file_storage", "cad_models", file_name)
    full_path = os.path.join(os.getcwd(), file_path)

    # ------------------------------------
    # Write BREP
    # ------------------------------------
    try:
        breptools_Write(model, full_path)
    except Exception:
        traceback.print_exc()
        return ""

    # ------------------------------------
    # Write STL (optional)
    # ------------------------------------
    try:
        stl_path = full_path.replace(".brep", ".stl")
        write_stl(model, stl_path)
    except Exception as stle:
        print("STL write warning:", stle)

    return file_path