"""
Base Plate Adapter
Maps web API payload to osdag_core BasePlateConnection keys and back.
"""
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    write_stl,
)
from osdag_core.design_type.connection.base_plate_connection import BasePlateConnection
from osdag_core.custom_logger import CustomLogger
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.Common import KEY_DISP_BASE_PLATE
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
import sys
import os
from typing import Dict, Any, List
import traceback
import json

old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log

# Core expects these key names (from osdag_core.Common / base_plate_connection.set_input_values)
KEY_CONN = 'Connectivity *'
KEY_END_CONDITION = 'End Condition'
KEY_SECSIZE = 'Member.Designation'
KEY_MATERIAL = 'Material'
KEY_SEC_MATERIAL = 'Member.Material'
KEY_AXIAL = 'Load.Axial'
KEY_AXIAL_BP = 'Load.Axial_Compression'
KEY_AXIAL_TENSION_BP = 'Load.Axial_Tension'
KEY_SHEAR = 'Load.Shear'
KEY_MOMENT = 'Load.Moment'
KEY_SHEAR_MAJOR = 'Load.Shear.Major'
KEY_SHEAR_MINOR = 'Load.Shear.Minor'
KEY_MOMENT_MAJOR = 'Load.Moment.Major'
KEY_MOMENT_MINOR = 'Load.Moment.Minor'
KEY_DIA_ANCHOR_OCF = 'Anchor Bolt.OCF.Diameter'
KEY_GRD_ANCHOR_OCF = 'Anchor Bolt.OCF.Grade'
KEY_DIA_ANCHOR_ICF = 'Anchor Bolt.ICF.Diameter'
KEY_GRD_ANCHOR_ICF = 'Anchor Bolt.ICF.Grade'
KEY_TYP_ANCHOR = 'Anchor Bolt.Type'
KEY_GRD_FOOTING = 'Footing.Grade'
KEY_WELD_TYPE = 'Weld.Type'
KEY_BASE_PLATE_MATERIAL = 'Base_Plate.Material'
KEY_ST_KEY_MATERIAL = 'Stiffener_Key.Material'
KEY_DP_ANCHOR_BOLT_DESIGNATION_OCF = 'DesignPreferences.Anchor_Bolt.OCF.Designation'
KEY_DP_ANCHOR_BOLT_DESIGNATION_ICF = 'DesignPreferences.Anchor_Bolt.ICF.Designation'
KEY_DP_ANCHOR_BOLT_TYPE_OCF = 'DesignPreferences.Anchor_Bolt.OCF.Type'
KEY_DP_ANCHOR_BOLT_TYPE_ICF = 'DesignPreferences.Anchor_Bolt.ICF.Type'
KEY_DP_ANCHOR_BOLT_GALVANIZED_OCF = 'DesignPreferences.Anchor_Bolt.OCF.Galvanized'
KEY_DP_ANCHOR_BOLT_GALVANIZED_ICF = 'DesignPreferences.Anchor_Bolt.ICF.Galvanized'
KEY_DP_ANCHOR_BOLT_HOLE_TYPE_OCF = 'DesignPreferences.Anchor_Bolt.OCF.Bolt_Hole_Type'
KEY_DP_ANCHOR_BOLT_HOLE_TYPE_ICF = 'DesignPreferences.Anchor_Bolt.ICF.Bolt_Hole_Type'
KEY_DP_ANCHOR_BOLT_LENGTH_OCF = 'DesignPreferences.Anchor_Bolt.OCF.Length'
KEY_DP_ANCHOR_BOLT_LENGTH_ICF = 'DesignPreferences.Anchor_Bolt.ICF.Length'
KEY_DP_ANCHOR_BOLT_MATERIAL_G_O_OCF = 'DesignPreferences.Anchor_Bolt.OCF.Material_Grade_OverWrite'
KEY_DP_ANCHOR_BOLT_MATERIAL_G_O_ICF = 'DesignPreferences.Anchor_Bolt.ICF.Material_Grade_OverWrite'
KEY_DP_ANCHOR_BOLT_FRICTION = 'DesignPreferences.Anchor_Bolt.Friction_coefficient'
KEY_DP_WELD_FAB = 'Weld.Fab'
KEY_DP_WELD_MATERIAL_G_O = 'Weld.Material_Grade_OverWrite'
KEY_DP_WELD_TYPE = 'Weld.Type'
KEY_DP_DETAILING_EDGE_TYPE = 'Detailing.Edge_type'
KEY_DP_DETAILING_CORROSIVE_INFLUENCES = 'Detailing.Corrosive_Influences'
KEY_DP_DESIGN_METHOD = 'Design.Design_Method'
KEY_DP_DESIGN_BASE_PLATE = 'DesignPreferences.Design.Base_Plate'


def get_required_keys() -> List[str]:
    """Return required input parameters matching desktop Base Plate input dock only."""
    return [
        "Module",
        "Connectivity",
        "End Condition",
        "Member.Designation",
        "Material",
        "Load.Axial",
        "Load.Axial_Tension",
        "Load.Shear.Major",
        "Load.Shear.Minor",
        "Load.Moment.Major",
        "Load.Moment.Minor",
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for values; only keys present in desktop Base Plate input dock."""
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys is not None:
        raise MissingKeyError(missing_keys[0])

    str_keys = ["Module", "Material", "Connectivity", "End Condition"]
    for key in str_keys:
        if not isinstance(input_values.get(key), str):
            raise InvalidInputTypeError(key, "str")

    load_keys = [
        "Load.Axial", "Load.Axial_Tension",
        "Load.Shear.Major", "Load.Shear.Minor",
        "Load.Moment.Major", "Load.Moment.Minor",
    ]
    for key in load_keys:
        val = input_values.get(key)
        if val is not None and val != "":
            if not isinstance(val, str) or not float_able(val):
                raise InvalidInputTypeError(key, "str (number)")

    member_designation = input_values.get("Member.Designation")
    if isinstance(member_designation, list):
        if not validate_list_type(member_designation, str):
            raise InvalidInputTypeError("Member.Designation", "List[str]")
    elif not isinstance(member_designation, str):
        raise InvalidInputTypeError("Member.Designation", "str or List[str]")


def create_module() -> BasePlateConnection:
    """Create an instance of the BasePlateConnection module design class and set it up for use"""
    module = BasePlateConnection()
    module.set_osdaglogger(None, id="web")
    return module


def _ensure_list(val, default=None):
    if val is None:
        return default if default is not None else []
    if isinstance(val, list):
        return val
    return [val] if val != "" and val != "All" else []


def _normalize_anchor_diameter(dia):
    """Ensure core format: 'M20', 'M24' etc. Accepts 20, '20', 'M20'."""
    if dia is None or dia == "":
        return "M20"
    s = str(dia).strip()
    if s.upper().startswith("M"):
        return s if s[1:].isdigit() else "M20"
    if s.isdigit():
        return f"M{int(s)}"
    return "M20"


def _normalize_anchor_diameter_list(lst, default=None):
    """Return list of anchor diameter strings in core format (e.g. ['M20'])."""
    if not lst:
        return [default or "M20"]
    out = []
    for x in lst:
        out.append(_normalize_anchor_diameter(x))
    return out if out else [default or "M20"]


def _first_or_str(val):
    """Return first element if list, else string value. For single section used by core."""
    if isinstance(val, list):
        return val[0] if len(val) > 0 else "Select Section"
    if val == "All" or val == "[]" or (isinstance(val, str) and val.startswith("[") and val.endswith("]")):
        return "Select Section"
    return str(val) if val is not None else "Select Section"


def create_from_input(input_values: Dict[str, Any]) -> BasePlateConnection:
    """Create BasePlateConnection from web input and run set_input_values with full design_dict."""
    module = create_module()

    member_designation = input_values.get("Member.Designation", "")
    if isinstance(member_designation, str):
        if member_designation in ("[]", "All", ""):
            member_designation = []
        elif member_designation.startswith("[") and member_designation.endswith("]"):
            try:
                member_designation = json.loads(member_designation)
            except Exception:
                member_designation = [member_designation]
        else:
            member_designation = [member_designation]
    elif not isinstance(member_designation, list):
        member_designation = [str(member_designation)]

    # Single section string for core (core expects one section per design run)
    section_str = _first_or_str(member_designation) if member_designation else "Select Section"

    material = input_values.get("Material", "E 250 (Fe 410 W)A")
    if isinstance(material, dict):
        material = material.get("Grade", material.get("grade", str(material)))
    member_material = input_values.get("Member.Material", material)
    if isinstance(member_material, dict):
        member_material = member_material.get("Grade", member_material.get("grade", str(member_material)))

    # Anchor: core expects list of strings like ['M20'], ['8.8'] (IS 5624 format)
    anchor_dia_ocf = input_values.get("Anchor.Diameter", input_values.get("Anchor.Diameter.OCF", input_values.get("Bolt.Diameter", [])))
    anchor_grd_ocf = input_values.get("Anchor.Grade", input_values.get("Anchor.Grade.OCF", input_values.get("Bolt.Grade", [])))
    anchor_dia_icf = input_values.get("Anchor.Diameter.ICF", anchor_dia_ocf)
    anchor_grd_icf = input_values.get("Anchor.Grade.ICF", anchor_grd_ocf)
    anchor_dia_ocf = _normalize_anchor_diameter_list(anchor_dia_ocf, "M20")
    anchor_grd_ocf = _ensure_list(anchor_grd_ocf, ["8.8"])
    anchor_dia_icf = _normalize_anchor_diameter_list(anchor_dia_icf, "M20")
    anchor_grd_icf = _ensure_list(anchor_grd_icf, anchor_grd_ocf)

    connectivity = input_values.get("Connectivity", input_values.get("Connectivity *", "Welded Column Base"))
    axial = input_values.get("Load.Axial", "100")
    shear = input_values.get("Load.Shear", "50")
    shear_major = input_values.get("Load.Shear.Major", shear)
    shear_minor = input_values.get("Load.Shear.Minor", "0")
    moment = input_values.get("Load.Moment", "20")
    moment_major = input_values.get("Load.Moment.Major", moment)
    moment_minor = input_values.get("Load.Moment.Minor", "0")
    axial_tension = input_values.get("Load.Axial_Tension", "0")
    if connectivity == "Welded Column Base":
        moment_major = "Disabled"
        moment_minor = "Disabled"
    if connectivity != "Moment Base Plate" or axial_tension == "":
        axial_tension = "Disabled"

    footing_grade = input_values.get("Footing.Grade", "M20")
    if footing_grade == "" or footing_grade is None:
        footing_grade = "M20"
    weld_type = input_values.get("Weld.Type", "Fillet Weld")
    anchor_type = input_values.get("Anchor Bolt.Type", input_values.get("Anchor.Type", "End Plate Type"))

    # Design preferences defaults (desktop get_values_for_design_pref / init)
    bp_material = input_values.get("Base_Plate.Material", member_material)
    st_key_material = input_values.get("Stiffener_Key.Material", member_material)
    length_ocf = input_values.get("DesignPreferences.Anchor_Bolt.OCF.Length", "0")
    length_icf = input_values.get("DesignPreferences.Anchor_Bolt.ICF.Length", "0")
    designation_ocf = input_values.get("DesignPreferences.Anchor_Bolt.OCF.Designation", "")
    designation_icf = input_values.get("DesignPreferences.Anchor_Bolt.ICF.Designation", "")
    if not designation_ocf and anchor_dia_ocf:
        designation_ocf = f"{anchor_dia_ocf[0]}X{length_ocf} IS5624 GALV"
    if not designation_icf and anchor_dia_icf:
        designation_icf = f"{anchor_dia_icf[0]}X{length_icf} IS5624 GALV"

    # Parent MomentConnection.set_input_values() -> Load() requires numeric strings; use "0" when "Disabled"
    shear_for_load = "0" if shear_major == "Disabled" else str(shear_major)
    moment_for_load = "0" if moment_major == "Disabled" else str(moment_major)
    design_dict = {
        KEY_CONN: connectivity,
        KEY_END_CONDITION: "Pinned",
        KEY_SECSIZE: section_str,
        KEY_MATERIAL: material,
        KEY_SEC_MATERIAL: member_material,
        KEY_AXIAL: str(axial),
        KEY_AXIAL_BP: str(axial),
        KEY_AXIAL_TENSION_BP: str(axial_tension),
        KEY_SHEAR: shear_for_load,
        KEY_MOMENT: moment_for_load,
        KEY_SHEAR_MAJOR: str(shear_major),
        KEY_SHEAR_MINOR: str(shear_minor),
        KEY_MOMENT_MAJOR: str(moment_major),
        KEY_MOMENT_MINOR: str(moment_minor),
        KEY_DIA_ANCHOR_OCF: anchor_dia_ocf,
        KEY_GRD_ANCHOR_OCF: anchor_grd_ocf,
        KEY_DIA_ANCHOR_ICF: anchor_dia_icf,
        KEY_GRD_ANCHOR_ICF: anchor_grd_icf,
        KEY_TYP_ANCHOR: anchor_type,
        KEY_GRD_FOOTING: str(footing_grade),
        KEY_WELD_TYPE: weld_type,
        KEY_BASE_PLATE_MATERIAL: bp_material,
        KEY_ST_KEY_MATERIAL: st_key_material,
        KEY_DP_ANCHOR_BOLT_DESIGNATION_OCF: designation_ocf or f"{anchor_dia_ocf[0] if anchor_dia_ocf else 20}X{length_ocf} IS5624 GALV",
        KEY_DP_ANCHOR_BOLT_DESIGNATION_ICF: designation_icf or f"{anchor_dia_icf[0] if anchor_dia_icf else 20}X{length_icf} IS5624 GALV",
        KEY_DP_ANCHOR_BOLT_TYPE_OCF: anchor_type,
        KEY_DP_ANCHOR_BOLT_TYPE_ICF: anchor_type,
        KEY_DP_ANCHOR_BOLT_GALVANIZED_OCF: input_values.get("DesignPreferences.Anchor_Bolt.OCF.Galvanized", "Yes"),
        KEY_DP_ANCHOR_BOLT_GALVANIZED_ICF: input_values.get("DesignPreferences.Anchor_Bolt.ICF.Galvanized", "Yes"),
        KEY_DP_ANCHOR_BOLT_HOLE_TYPE_OCF: input_values.get("DesignPreferences.Anchor_Bolt.OCF.Bolt_Hole_Type", "Over-sized"),
        KEY_DP_ANCHOR_BOLT_HOLE_TYPE_ICF: input_values.get("DesignPreferences.Anchor_Bolt.ICF.Bolt_Hole_Type", "Over-sized"),
        KEY_DP_ANCHOR_BOLT_LENGTH_OCF: str(length_ocf),
        KEY_DP_ANCHOR_BOLT_LENGTH_ICF: str(length_icf),
        KEY_DP_ANCHOR_BOLT_MATERIAL_G_O_OCF: float(input_values.get("DesignPreferences.Anchor_Bolt.OCF.Material_Grade_OverWrite", 0) or 0),
        KEY_DP_ANCHOR_BOLT_MATERIAL_G_O_ICF: float(input_values.get("DesignPreferences.Anchor_Bolt.ICF.Material_Grade_OverWrite", 0) or 0),
        KEY_DP_ANCHOR_BOLT_FRICTION: input_values.get("DesignPreferences.Anchor_Bolt.Friction_coefficient", "0.30"),
        KEY_DP_WELD_FAB: input_values.get("Weld.Fab", "Shop Weld"),
        KEY_DP_WELD_MATERIAL_G_O: float(input_values.get("Weld.Material_Grade_OverWrite", 0) or 0),
        KEY_DP_WELD_TYPE: weld_type,
        KEY_DP_DETAILING_EDGE_TYPE: input_values.get("Detailing.Edge_type", "b - Machine flame cut"),
        KEY_DP_DETAILING_CORROSIVE_INFLUENCES: input_values.get("Detailing.Corrosive_Influences", "No"),
        KEY_DP_DESIGN_METHOD: input_values.get("Design.Design_Method", "Limit State Design"),
        KEY_DP_DESIGN_BASE_PLATE: input_values.get("DesignPreferences.Design.Base_Plate", "Effective Area Method"),
    }

    try:
        module.set_input_values(design_dict)
        # Run the actual design (bp_parameters); desktop calls this via func_for_validation
        validation_errors = module.func_for_validation(design_dict)
        if validation_errors is not None and len(validation_errors) > 0:
            raise ValueError(validation_errors[0] if validation_errors else "Validation failed")
    except Exception as e:
        traceback.print_exc()
        raise

    return module


def _append_detail_list(output: dict, detail_list: list):
    """Append TYPE_TEXTBOX entries from a detail method (e.g. stiffener_flange_details) into output."""
    if not detail_list:
        return
    for param in detail_list:
        if len(param) >= 4:
            key, label, param_type, value = param[0], param[1], param[2], param[3]
            if key is None or param_type != "TextBox":
                continue
            if hasattr(value, "item"):
                value = value.item()
            output[key] = {"key": key, "label": label, "val": value}


def generate_output(input_values: Dict[str, Any]):
    """Run design and return output dict + logs. Output keys match desktop output_values keys."""
    output = {}
    module = create_from_input(input_values)
    logs = []

    try:
        raw_output = module.output_values(True)
        if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
            logs = module.logger.get_logs()

        for param in raw_output:
            if len(param) >= 4:
                key, label, param_type, value = param[0], param[1], param[2], param[3]
                if key is None or param_type != "TextBox":
                    continue
                if hasattr(value, "item"):
                    value = value.item()
                output[key] = {"key": key, "label": label, "val": value}

        # Stiffener detail modals: merge flange, along web, across web details into output
        if hasattr(module, "stiffener_flange_details"):
            _append_detail_list(output, module.stiffener_flange_details(True))
        if hasattr(module, "stiffener_along_web_details"):
            _append_detail_list(output, module.stiffener_along_web_details(True))
        if hasattr(module, "stiffener_across_web_details"):
            _append_detail_list(output, module.stiffener_across_web_details(True))
        if hasattr(module, "stiffener_hollow_details"):
            _append_detail_list(output, module.stiffener_hollow_details(True))
    except Exception as e:
        traceback.print_exc()
        raise

    return output, logs


BASE_PLATE_CAD_SECTIONS = ("Model", "Column", "Plate")


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate CAD model from input values as BREP/STL. Returns file path or empty string.
    Desktop options: Model, Column, Base Plate (Plate).
    """
    if section not in BASE_PLATE_CAD_SECTIONS:
        raise InvalidInputTypeError(
            "section",
            "'Model', 'Column', 'Plate'",
        )

    try:
        module = create_from_input(input_values)
    except Exception as e:
        traceback.print_exc()
        print(f"[BasePlate CAD] create_from_input failed: {e}")
        return ""

    try:
        cdl = CommonDesignLogic(
            None, None, "", KEY_DISP_BASE_PLATE, "Moment Connection",
        )
        cdl.module_object = module
        base_plate = cdl.createBasePlateCAD()
    except Exception as e:
        traceback.print_exc()
        print(f"[BasePlate CAD] createBasePlateCAD failed: {e}")
        return ""

    # Section -> getter on base_plate (desktop: Model, Column, Base Plate only)
    section_getters = {
        "Model": lambda: base_plate.get_models(),
        "Column": lambda: base_plate.get_column_model(),
        "Plate": lambda: base_plate.get_plate_connector_models(),
    }
    get_shape = section_getters.get(section)
    if not get_shape:
        return ""

    try:
        model = get_shape()
    except Exception as e:
        traceback.print_exc()
        print(f"[BasePlate CAD] getter for section '{section}' failed: {e}")
        return ""

    if model is None:
        print(f"[BasePlate CAD] No shape for section '{section}'; skipping write.")
        return ""

    cad_dir = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_dir, exist_ok=True)
    section_safe = section.replace(" ", "_")
    file_name = f"{session}_{section_safe}.brep"
    file_path = os.path.join("file_storage", "cad_models", file_name)

    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())
    except Exception as e:
        print(f"[BasePlate CAD] BREP write failed for {section}: {e}")
        return ""

    try:
        stl_path = os.path.join(os.getcwd(), file_path.replace(".brep", ".stl"))
        write_stl(model, stl_path)
    except Exception as stle:
        print(f"[BasePlate CAD] Warning: STL write failed for {section}: {stle}")

    return file_path
