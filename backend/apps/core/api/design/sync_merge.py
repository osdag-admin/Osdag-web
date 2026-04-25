"""
Design-preference sync merge for web and desktop-aligned semantics.

Pure functions + module rules keyed by sessionName (module string from EngineeringModule).
"""
from copy import deepcopy
from typing import Any, Dict, List, Optional, Tuple

# Operations: open = merge rules onto current inputs; refresh = driving-input wins (invalidates material copies);
# save = apply draft then preserve user choices; reset = contextual defaults from driver material only.
VALID_OPERATIONS = frozenset({"open", "refresh", "save", "reset"})


def _material_row_for_grade(material_models, grade: str) -> List[Dict[str, Any]]:
    if not grade:
        return []
    qs = material_models.filter(Grade=grade)
    return list(qs.values()[:1])


# (session_name) -> (supporting_key, supporting_source, supported_key, supported_source)
# source is one of: "columns", "beams"
_SECTION_KEY_MAP: Dict[str, Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]] = {
    "FinPlateConnection": ("column_section", "columns", "beam_section", "beams"),
    "EndPlateConnection": ("column_section", "columns", "beam_section", "beams"),
    "CleatAngleConnection": ("column_section", "columns", "beam_section", "beams"),
    "SeatedAngleConnection": ("column_section", "columns", "beam_section", "beams"),
    "Beam to Column End Plate Connection": ("column_section", "columns", "beam_section", "beams"),
    "Beam Beam End Plate Connection": ("beam_section", "beams", "beam_section", "beams"),
    "Column Cover Plate Bolted Connection": ("member_designation", "columns", None, None),
    "Beam Cover Plate Bolted Connection": (None, None, "member_designation", "beams"),
    "Column Cover Plate Welded Connection": ("member_designation", "columns", None, None),
    "Beam Cover Plate Welded Connection": (None, None, "member_designation", "beams"),
    "Column Column End Plate Connection": ("member_designation", "columns", None, None),
    "Base Plate": ("member_designation", "columns", None, None),
    "Simply Supported Beam Design": (None, None, "member_designation", "beams"),
    "On Cantilever Beam Design": (None, None, "member_designation", "beams"),
    "Compression Member Design": (None, None, "member_designation", "beams"),
    "Axially Loaded Column": ("member_designation", "columns", None, None),
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
) -> Dict[str, Dict[str, Any]]:
    details: Dict[str, Dict[str, Any]] = {"supporting": {}, "supported": {}}
    mapping = _SECTION_KEY_MAP.get(module_session_name)
    if not mapping:
        return details

    support_key, support_source, supported_key, supported_source = mapping
    if support_key and support_source:
        support_designation = str(inputs.get(support_key) or "")
        support_model = columns_model if support_source == "columns" else beams_model
        details["supporting"] = _section_row_for_designation(support_model, support_designation)

    if supported_key and supported_source:
        supported_designation = str(inputs.get(supported_key) or "")
        supported_model = columns_model if supported_source == "columns" else beams_model
        details["supported"] = _section_row_for_designation(supported_model, supported_designation)

    return details


# (session_name) -> driver field -> list of target pref keys to sync when driver changes / refresh / reset
# Aligns with osdag_core input_dictionary_without_design_pref "Input Dock" rows where applicable.
_MATERIAL_SYNC_RULES: Dict[str, Dict[str, List[str]]] = {
    "FinPlateConnection": {"connector_material": ["supporting_material", "supported_material"]},
    "EndPlateConnection": {"connector_material": ["supporting_material", "supported_material"]},
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
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Simply Supported Beam Design": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "On Cantilever Beam Design": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Purlin Design": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Compression Member Design": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
    },
    "Axially Loaded Column": {
        "member_material": ["supported_material", "connector_material"],
        "material": ["supported_material", "connector_material"],
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
    if m and "material" in rules:
        return "material", list(rules["material"]), str(m)
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
        _, _, grade = _resolve_driver_and_targets(module_session_name, out)
        if design_pref_draft:
            out.update(design_pref_draft)
    else:
        # refresh / reset: dock driver wins and propagates to all targets.
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
    )


def list_registered_session_names() -> List[str]:
    return sorted(_MATERIAL_SYNC_RULES.keys())
