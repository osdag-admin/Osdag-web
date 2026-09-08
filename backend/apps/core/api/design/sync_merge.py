"""
Design-preference sync merge for web and desktop-aligned semantics.

Pure functions + module rules keyed by sessionName (module string from EngineeringModule).
"""
from copy import deepcopy
from typing import Any, Dict, List, Optional, Tuple

# Operations: open = merge rules onto current inputs; refresh = driving-input wins (invalidates material copies);
# save = apply draft then preserve user choices; reset = contextual defaults from driver material only.
VALID_OPERATIONS = frozenset({"open", "refresh", "save", "reset"})


import importlib

_CORE_CLASS_MAP = {
    "FinPlateConnection": ("osdag_core.design_type.connection.fin_plate_connection", "FinPlateConnection"),
    "EndPlateConnection": ("osdag_core.design_type.connection.end_plate_connection", "EndPlateConnection"),
    "CleatAngleConnection": ("osdag_core.design_type.connection.cleat_angle_connection", "CleatAngleConnection"),
    "SeatedAngleConnection": ("osdag_core.design_type.connection.seated_angle_connection", "SeatedAngleConnection"),
    "Beam to Column End Plate Connection": ("osdag_core.design_type.connection.beam_column_end_plate", "BeamColumnEndPlate"),
    "Beam Beam End Plate Connection": ("osdag_core.design_type.connection.beam_beam_end_plate_splice", "BeamBeamEndPlateSplice"),
    "Column Cover Plate Bolted Connection": ("osdag_core.design_type.connection.column_cover_plate", "ColumnCoverPlate"),
    "Beam Cover Plate Bolted Connection": ("osdag_core.design_type.connection.beam_cover_plate", "BeamCoverPlate"),
    "Column Cover Plate Welded Connection": ("osdag_core.design_type.connection.column_cover_plate_weld", "ColumnCoverPlateWeld"),
    "Beam Cover Plate Welded Connection": ("osdag_core.design_type.connection.beam_cover_plate_weld", "BeamCoverPlateWeld"),
    "Column Column End Plate Connection": ("osdag_core.design_type.connection.column_end_plate", "ColumnEndPlate"),
    "Base Plate": ("osdag_core.design_type.connection.base_plate_connection", "BasePlateConnection"),
    "Simply Supported Beam Design": ("osdag_core.design_type.flexural_member.flexure", "Flexure"),
    "On Cantilever Beam Design": ("osdag_core.design_type.flexural_member.flexure_cantilever", "Flexure_Cantilever"),
    "Purlin Design": ("osdag_core.design_type.flexural_member.flexure_purlin", "Flexure_Purlin"),
    "Compression Member Design": ("osdag_core.design_type.compression_member.compression_welded", "Compression_welded"),
    "Axially Loaded Column": ("osdag_core.design_type.compression_member.compression_column", "ColumnDesign"),
    "Struts Bolted to End Gusset": ("osdag_core.design_type.compression_member.compression_bolted", "Compression_bolted"),
    "Struts Welded to End Gusset": ("osdag_core.design_type.compression_member.compression_welded", "Compression_welded"),
    "Tension Member Bolted Design": ("osdag_core.design_type.tension_member.tension_bolted", "Tension_bolted"),
    "Tension Member Welded Design": ("osdag_core.design_type.tension_member.tension_welded", "Tension_welded"),
    "Butt Joint Bolted": ("osdag_core.design_type.connection.butt_joint_bolted", "ButtJointBolted"),
    "Lap Joint Bolted": ("osdag_core.design_type.connection.lap_joint_bolted", "LapJointBolted"),
    "Butt Joint Welded": ("osdag_core.design_type.connection.butt_joint_welded", "ButtJointWelded"),
    "Lap Joint Welded": ("osdag_core.design_type.connection.lap_joint_welded", "LapJointWelded"),
}

_FRONTEND_TO_CORE_KEY_MAP = {
    "bolt_tension_type": "Bolt.TensionType",
    "bolt_hole_type": "Bolt.Bolt_Hole_Type",
    "bolt_slip_factor": "Bolt.Slip_Factor",
    "weld_fab": "Weld.Fab",
    "weld_material_grade": "Weld.Material_Grade_OverWrite",
    "detailing_edge_type": "Detailing.Edge_type",
    "detailing_gap": "Detailing.Gap",
    "detailing_corr_status": "Detailing.Corrosive_Influences",
    "detailing_packing_plate": "Detailing.Packing_Plate",
    "design_method": "Design.Design_Method",
    "design_for": "Design.Design_For",
    
    # Base Plate specific:
    "DesignPreferences.Anchor_Bolt.OCF.Designation": "DesignPreferences.Anchor_Bolt.OCF.Designation",
    "DesignPreferences.Anchor_Bolt.OCF.Type": "DesignPreferences.Anchor_Bolt.OCF.Type",
    "DesignPreferences.Anchor_Bolt.OCF.Galvanized": "DesignPreferences.Anchor_Bolt.OCF.Galvanized",
    "DesignPreferences.Anchor_Bolt.OCF.Bolt_Hole_Type": "DesignPreferences.Anchor_Bolt.OCF.Bolt_Hole_Type",
    "DesignPreferences.Anchor_Bolt.OCF.Length": "DesignPreferences.Anchor_Bolt.OCF.Length",
    "DesignPreferences.Anchor_Bolt.OCF.Material_Grade_OverWrite": "DesignPreferences.Anchor_Bolt.OCF.Material_Grade_OverWrite",
    "DesignPreferences.Anchor_Bolt.ICF.Designation": "DesignPreferences.Anchor_Bolt.ICF.Designation",
    "DesignPreferences.Anchor_Bolt.ICF.Type": "DesignPreferences.Anchor_Bolt.ICF.Type",
    "DesignPreferences.Anchor_Bolt.ICF.Galvanized": "DesignPreferences.Anchor_Bolt.ICF.Galvanized",
    "DesignPreferences.Anchor_Bolt.ICF.Bolt_Hole_Type": "DesignPreferences.Anchor_Bolt.ICF.Bolt_Hole_Type",
    "DesignPreferences.Anchor_Bolt.ICF.Length": "DesignPreferences.Anchor_Bolt.ICF.Length",
    "DesignPreferences.Anchor_Bolt.ICF.Material_Grade_OverWrite": "DesignPreferences.Anchor_Bolt.ICF.Material_Grade_OverWrite",
    "DesignPreferences.Anchor_Bolt.Friction_coefficient": "DesignPreferences.Anchor_Bolt.Friction_coefficient",
    "DesignPreferences.Design.Base_Plate": "DesignPreferences.Design.Base_Plate",
}

def _get_core_defaults(module_session_name: str, inputs: Dict[str, Any], grade: str) -> Dict[str, Any]:
    defaults = {}
    if module_session_name not in _CORE_CLASS_MAP:
        return defaults

    try:
        material_grade = grade or inputs.get("connector_material") or inputs.get("material") or inputs.get("member_material") or "E 250 (Fe 410 W)A"
        if not material_grade or material_grade == "Select Material":
            material_grade = "E 250 (Fe 410 W)A"
            
        core_inputs = {
            "Material": material_grade,
            "Stiffener_Key.Material": material_grade,
            "Anchor Bolt.OCF.Diameter": [20],
            "Anchor Bolt.ICF.Diameter": [20],
            "Base_Plate.Material_St_Sk": material_grade,
            "Material_St_Sk": material_grade,
        }
        for k, v in inputs.items():
            if k in _FRONTEND_TO_CORE_KEY_MAP:
                core_inputs[_FRONTEND_TO_CORE_KEY_MAP[k]] = v
            else:
                core_inputs[k] = v

        module_path, class_name = _CORE_CLASS_MAP[module_session_name]
        mod = importlib.import_module(module_path)
        cls = getattr(mod, class_name)
        instance = cls()
        if hasattr(instance, "set_osdaglogger"):
            instance.set_osdaglogger(None, id="web")
        
        # Set missing attributes to prevent AttributeError in get_values_for_design_pref
        if not hasattr(instance, "design_status"):
            instance.design_status = False
        if not hasattr(instance, "load_axial_tension"):
            instance.load_axial_tension = 0.0
        if not hasattr(instance, "load_moment_minor"):
            instance.load_moment_minor = 0.0

        for frontend_key, core_key in _FRONTEND_TO_CORE_KEY_MAP.items():
            try:
                val = instance.get_values_for_design_pref(core_key, core_inputs)
                if val is not None:
                    if isinstance(val, str):
                        val = val.strip()
                    defaults[frontend_key] = val
            except Exception:
                pass
    except Exception as e:
        pass
    return defaults


def _material_row_for_grade(material_models, grade: str) -> List[Dict[str, Any]]:
    if not grade:
        return []
    qs = material_models.filter(Grade=grade)
    return list(qs.values()[:1])


# (session_name) -> (supporting_key, supporting_source, supported_key, supported_source, connector_key, connector_source)
# source is one of: "columns", "beams", "angles"
_SECTION_KEY_MAP: Dict[str, Tuple[Optional[str], Optional[str], Optional[str], Optional[str], Optional[str], Optional[str]]] = {
    "FinPlateConnection": ("column_section", "columns", "beam_section", "beams", None, None),
    "HeaderPlateConnection": ("column_section", "columns", "beam_section", "beams", None, None),
    "CleatAngleConnection": ("column_section", "columns", "beam_section", "beams", "cleat_section", "angles"),
    "SeatedAngleConnection": ("column_section", "columns", "beam_section", "beams", "seated_section", "angles"),
    "Beam to Column End Plate Connection": ("column_section", "columns", "beam_section", "beams", None, None),
    "Beam Beam End Plate Connection": ("primary_beam", "beams", "secondary_beam", "beams", None, None),
    "Column Cover Plate Bolted Connection": ("member_designation", "columns", None, None, None, None),
    "Beam Cover Plate Bolted Connection": (None, None, "member_designation", "beams", None, None),
    "Column Cover Plate Welded Connection": ("member_designation", "columns", None, None, None, None),
    "Beam Cover Plate Welded Connection": (None, None, "member_designation", "beams", None, None),
    "Column Column End Plate Connection": ("member_designation", "columns", None, None, None, None),
    "Base Plate": ("member_designation", "columns", None, None, None, None),
    "Simply Supported Beam Design": (None, None, "section_designation", "beams", None, None),
    "On Cantilever Beam Design": (None, None, "section_designation", "beams", None, None),
    "Purlin Design": (None, None, "section_designation", "beams", None, None),
    "Compression Member Design": (None, None, "section_designation", "angles", None, None),
    "Axially Loaded Column": ("section_designation", "columns", None, None, None, None),
    "Struts Bolted to End Gusset": (None, None, "section_designation", "angles_channels", None, None),
    "Struts Welded to End Gusset": (None, None, "section_designation", "angles_channels", None, None),
    "Tension Member Bolted Design": (None, None, "section_designation", "angles_channels", None, None),
    "Tension Member Welded Design": (None, None, "section_designation", "angles_channels", None, None),
}


def _section_row_for_designation(section_model, designation: str) -> Dict[str, Any]:
    if section_model is None or not designation:
        return {}
    row = section_model.filter(Designation=designation).values().first()
    return row or {}


def _resolve_section_details(
    module_session_name: str,
    inputs: Dict[str, Any],
    beams_model=None,
    columns_model=None,
    angles_model=None,
    channels_model=None,
) -> Dict[str, Dict[str, Any]]:
    details: Dict[str, Dict[str, Any]] = {"supporting": {}, "supported": {}, "connector": {}}
    mapping = _SECTION_KEY_MAP.get(module_session_name)
    if not mapping:
        return details

    support_key, support_source, supported_key, supported_source, connector_key, connector_source = mapping

    def get_model(source_str):
        if source_str == "columns":
            return columns_model
        elif source_str == "beams":
            return beams_model
        elif source_str == "angles":
            return angles_model
        elif source_str == "channels":
            return channels_model
        elif source_str == "angles_channels":
            profile = str(inputs.get("section_profile") or "").lower()
            if "channel" in profile:
                return channels_model
            else:
                return angles_model
        return None

    if support_key and support_source:
        support_val = inputs.get(support_key)
        support_designation = ""
        if isinstance(support_val, list) and len(support_val) > 0:
            support_designation = str(support_val[0])
        elif support_val:
            support_designation = str(support_val)

        support_model = get_model(support_source)
        if support_model:
            details["supporting"] = _section_row_for_designation(support_model, support_designation)

    if supported_key and supported_source:
        supported_val = inputs.get(supported_key)
        supported_designation = ""
        if isinstance(supported_val, list) and len(supported_val) > 0:
            supported_designation = str(supported_val[0])
        elif supported_val:
            supported_designation = str(supported_val)

        supported_model = get_model(supported_source)
        if supported_model:
            # Normalize designation if it is an angle
            is_angle = (supported_source == "angles") or (
                supported_source == "angles_channels"
                and "channel" not in str(inputs.get("section_profile") or "").lower()
            )
            if is_angle:
                parts = supported_designation.replace("ISA ", "").replace("X", "x").split("x")
                norm_desig = " x ".join([p.strip() for p in parts])
                details["supported"] = _section_row_for_designation(supported_model, norm_desig)
            else:
                details["supported"] = _section_row_for_designation(supported_model, supported_designation)

    if connector_key and connector_source:
        connector_val = inputs.get(connector_key)
        connector_designation = ""
        if isinstance(connector_val, list) and len(connector_val) > 0:
            connector_designation = str(connector_val[0])
        elif connector_val:
            connector_designation = str(connector_val)
            
        connector_model = get_model(connector_source)
        if connector_model:
            is_angle = (connector_source == "angles") or (
                connector_source == "angles_channels"
                and "channel" not in str(inputs.get("section_profile") or "").lower()
            )
            if is_angle:
                parts = connector_designation.replace("ISA ", "").replace("X", "x").split("x")
                norm_desig = " x ".join([p.strip() for p in parts])
                details["connector"] = _section_row_for_designation(connector_model, norm_desig)
            else:
                details["connector"] = _section_row_for_designation(connector_model, connector_designation)

    return details


# (session_name) -> driver field -> list of target pref keys to sync when driver changes / refresh / reset
# Aligns with osdag_core input_dictionary_without_design_pref "Input Dock" rows where applicable.
_MATERIAL_SYNC_RULES: Dict[str, Dict[str, List[str]]] = {
    "FinPlateConnection": {"connector_material": ["supporting_material", "supported_material"]},
    "HeaderPlateConnection": {"connector_material": ["supporting_material", "supported_material"]},
    "CleatAngleConnection": {"connector_material": ["supporting_material", "supported_material"]},
    "SeatedAngleConnection": {"connector_material": ["supporting_material", "supported_material"]},
    "Beam to Column End Plate Connection": {
        "connector_material": ["supporting_material", "supported_material"],
    },
    "Beam Beam End Plate Connection": {"connector_material": ["supported_material"]},
    "Column Cover Plate Bolted Connection": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Beam Cover Plate Bolted Connection": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Column Cover Plate Welded Connection": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Beam Cover Plate Welded Connection": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Column Column End Plate Connection": {
        "material": ["supporting_material", "supported_material", "connector_material"],
        "member_material": ["supported_material", "connector_material"],
    },
    "Base Plate": {"material": ["supporting_material", "connector_material"]},
    "Tension Member Bolted Design": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Tension Member Welded Design": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Struts Bolted to End Gusset": {
        "member_material": ["supporting_material", "supported_material", "connector_material"],
        "material": ["supporting_material", "supported_material", "connector_material"],
    },
    "Simply Supported Beam Design": {
        "member_material": ["supporting_material", "supported_material", "connector_material"],
        "material": ["supporting_material", "supported_material", "connector_material"],
    },
    "On Cantilever Beam Design": {
        "member_material": ["supporting_material", "supported_material", "connector_material"],
        "material": ["supporting_material", "supported_material", "connector_material"],
    },
    "Purlin Design": {
        "member_material": ["supporting_material", "supported_material", "connector_material"],
        "material": ["supporting_material", "supported_material", "connector_material"],
    },
    "Compression Member Design": {
        "member_material": ["supporting_material", "supported_material", "connector_material"],
        "material": ["supporting_material", "supported_material", "connector_material"],
    },
    "Axially Loaded Column": {
        "member_material": ["supporting_material", "supported_material", "connector_material"],
        "material": ["supporting_material", "supported_material", "connector_material"],
    },
    "Butt Joint Bolted": {},
    "Lap Joint Bolted": {},
    "Butt Joint Welded": {},
    "Lap Joint Welded": {},
}


def _resolve_driver_and_targets(module_session_name: str, inputs: Dict[str, Any]) -> Tuple[Optional[str], List[str], str]:
    """
    Returns (driver_key, target_keys, grade_value).
    Picks first rule entry whose driver key exists and is non-empty in inputs.
    """
    rules = _MATERIAL_SYNC_RULES.get(module_session_name)
    if rules is None:
        m = inputs.get("material")
        if m:
            return "material", ["supporting_material", "supported_material", "connector_material"], str(m)
        return None, [], ""
    if not rules:
        return None, [], ""

    for driver, targets in rules.items():
        val = inputs.get(driver)
        if val:
            return driver, list(targets), str(val)
    m = inputs.get("material")
    if m:
        if "material" in rules:
            return "material", list(rules["material"]), str(m)
        else:
            first_targets = list(rules.values())[0] if rules else ["supporting_material", "supported_material", "connector_material"]
            extended_targets = list(first_targets)
            if "connector_material" not in extended_targets:
                extended_targets.append("connector_material")
            return "material", extended_targets, str(m)
    return None, [], ""


def _apply_material_sync(out: Dict[str, Any], module_session_name: str) -> Tuple[Dict[str, List[str]], str]:
    """Mutates out; returns (copied_from_dock, grade) for metadata."""
    driver_key, targets, grade = _resolve_driver_and_targets(module_session_name, out)
    copied: Dict[str, List[str]] = {}
    if driver_key and targets and grade:
        for t in targets:
            out[t] = grade
        copied[driver_key] = list(targets)
    return copied, grade


def merge_design_pref_sync(
    module_session_name: str,
    inputs: Dict[str, Any],
    operation: str,
    design_pref_draft: Optional[Dict[str, Any]] = None,
    material_model=None,
    beams_model=None,
    columns_model=None,
    angles_model=None,
    channels_model=None,
) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, List[Dict[str, Any]]], Dict[str, Dict[str, Any]]]:
    """
    Returns (resolved_inputs, metadata, material_details_by_role, section_details_by_role).
    """
    if operation not in VALID_OPERATIONS:
        operation = "open"

    out = deepcopy(inputs) if inputs else {}
    copied: Dict[str, List[str]] = {}
    defaulted_keys: List[str] = []
    overridden_keys: List[str] = []
    grade = ""
    _driver_key, linked_targets, _driver_grade = _resolve_driver_and_targets(module_session_name, out)

    if operation == "save":
        # Draft carries explicit user choices; merge them and preserve.
        if design_pref_draft:
            out.update(design_pref_draft)
        _, _, grade = _resolve_driver_and_targets(module_session_name, out)
    elif operation == "open":
        # Preserve saved pref overrides — do NOT force-sync targets from driver.
        # Only resolve driver so material_details are populated correctly.
        _driver_key, linked_targets, grade = _resolve_driver_and_targets(module_session_name, out)
        if grade and linked_targets:
            copied_targets = []
            for t in linked_targets:
                if t not in out:
                    out[t] = grade
                    copied_targets.append(t)
            if copied_targets and _driver_key:
                copied[_driver_key] = copied_targets
        if design_pref_draft:
            out.update(design_pref_draft)
        
        # Populate defaults for missing keys
        core_defaults = _get_core_defaults(module_session_name, out, grade)
        for k, v in core_defaults.items():
            if k not in out:
                out[k] = v
                if k not in defaulted_keys:
                    defaulted_keys.append(k)
    elif operation == "reset":
        # reset: dock driver wins, targets are updated, and design prefs are reset to defaults
        copied, grade = _apply_material_sync(out, module_session_name)
        core_defaults = _get_core_defaults(module_session_name, out, grade)
        for k, v in core_defaults.items():
            out[k] = v
            if k not in defaulted_keys:
                defaulted_keys.append(k)
    else:
        # refresh: dock driver wins and propagates to all targets.
        copied, grade = _apply_material_sync(out, module_session_name)

    material_details = {"connector": [], "supported": [], "supporting": []}
    conn_grade = str(out.get("connector_material") or grade or "")
    supd_grade = str(out.get("supported_material") or grade or "")
    supg_grade = str(out.get("supporting_material") or grade or "")
    if material_model is not None:
        material_details["connector"] = _material_row_for_grade(material_model, conn_grade)
        material_details["supported"] = _material_row_for_grade(material_model, supd_grade)
        material_details["supporting"] = _material_row_for_grade(material_model, supg_grade)
    section_details = _resolve_section_details(
        module_session_name=module_session_name,
        inputs=out,
        beams_model=beams_model,
        columns_model=columns_model,
        angles_model=angles_model,
        channels_model=channels_model,
    )

    metadata = {
        "copied_from_input_dock_keys": copied,
        "linked_input_dock_keys": [k for k in copied.keys()] if copied else ([_driver_key] if _driver_key else []),
        "linked_pref_keys": list(linked_targets),
        "defaulted_keys": defaulted_keys,
        "overridden_keys": overridden_keys,
        "operation": operation,
        "module_session_name": module_session_name,
    }
    return out, metadata, material_details, section_details


def build_design_pref_defaults(
    module_session_name: str,
    inputs: Dict[str, Any],
    material_model=None,
    beams_model=None,
    columns_model=None,
    angles_model=None,
    channels_model=None,
) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, List[Dict[str, Any]]], Dict[str, Dict[str, Any]]]:
    """
    Returns defaults for Additional Inputs using current dock driver values.
    Shape mirrors sync merge response to keep frontend handling consistent.
    """
    return merge_design_pref_sync(
        module_session_name=module_session_name,
        inputs=inputs,
        operation="reset",
        design_pref_draft=None,
        material_model=material_model,
        beams_model=beams_model,
        columns_model=columns_model,
        angles_model=angles_model,
        channels_model=channels_model,
    )


def list_registered_session_names() -> List[str]:
    return sorted(_MATERIAL_SYNC_RULES.keys())
