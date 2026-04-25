import json
import re
from datetime import datetime
from typing import Any, Dict, Tuple

from django.core.files.base import ContentFile

OSI_SCHEMA_VERSION = "1.0"
SUPPORTED_VERSIONS = {"1.0"}


def validate_module_id(module_id: str) -> bool:
    if not isinstance(module_id, str):
        return False
    # allow letters, numbers, dashes and underscores
    return bool(re.fullmatch(r"[A-Za-z0-9_-]{2,64}", module_id))


def build_osi_payload(name: str, module_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    if not name or not isinstance(name, str):
        raise ValueError("Invalid project name")
    if not validate_module_id(module_id):
        raise ValueError("Invalid module_id")
    if not isinstance(inputs, dict):
        raise ValueError("Invalid inputs; expected object")
    return {
        "version": OSI_SCHEMA_VERSION,
        "name": name,
        "module_id": module_id,
        "inputs": inputs,
        "meta": {
            "saved_at": datetime.utcnow().isoformat() + "Z",
        },
    }


def _to_legacy_yaml(module_id: str, name: str, inputs: Dict[str, Any]) -> str:
    """Render inputs into legacy flat YAML with dotted, title-cased keys.

    This function implements the FinPlateConnection mapping now; for other modules
    it will fall back to a generic block under JSON if no mapping is present.
    """
    def qt(s: Any) -> str:
        # quote list items as strings in YAML as per legacy files
        return f"'{str(s)}'"

    legacy: Dict[str, Any] = {}

    # Common top-level entries
    legacy["Module"] = inputs.get("module") or module_id

    # FinPlateConnection mapping (expand as needed)
    if module_id == "FinPlateConnection":
        legacy.update({
            "Bolt.Bolt_Hole_Type": inputs.get("bolt_hole_type"),
            "Bolt.Diameter": inputs.get("bolt_diameter") or [],
            "Bolt.Grade": inputs.get("bolt_grade") or [],
            "Bolt.Slip_Factor": inputs.get("bolt_slip_factor"),
            "Bolt.TensionType": inputs.get("bolt_tension_type"),
            "Bolt.Type": (inputs.get("bolt_type") or "").replace("_", " ").title().replace("Bearing Bolt", "Bearing Bolt"),
            "Connectivity": inputs.get("connectivity") or inputs.get("Connectivity"),
            "Connector.Material": inputs.get("connector_material"),
            "Design.Design_Method": inputs.get("design_method"),
            "Detailing.Corrosive_Influences": inputs.get("detailing_corr_status"),
            "Detailing.Edge_type": inputs.get("detailing_edge_type"),
            "Detailing.Gap": inputs.get("detailing_gap"),
            "Load.Axial": inputs.get("load_axial"),
            "Load.Shear": inputs.get("load_shear"),
            "Material": inputs.get("material"),
            "Member.Supported_Section.Designation": inputs.get("beam_section") or inputs.get("supported_designation"),
            "Member.Supported_Section.Material": inputs.get("supported_material"),
            "Member.Supporting_Section.Designation": inputs.get("column_section") or inputs.get("supporting_designation") or inputs.get("primary_beam") or inputs.get("secondary_beam"),
            "Member.Supporting_Section.Material": inputs.get("supporting_material"),
            "Weld.Fab": inputs.get("weld_fab"),
            "Weld.Material_Grade_OverWrite": inputs.get("weld_material_grade"),
            "Connector.Plate.Thickness_List": inputs.get("plate_thickness") or [],
        })

    # Build YAML string manually to avoid new dependencies
    lines: list[str] = []
    for key, value in legacy.items():
        if value is None:
            continue
        if isinstance(value, list):
            if len(value) == 0:
                # skip empty lists to avoid saving default/blank arrays
                continue
            lines.append(f"{key}:")
            for item in value:
                lines.append(f"- {qt(item)}")
        else:
            # skip empty strings
            if isinstance(value, str) and value.strip() == "":
                continue
            lines.append(f"{key}: {value}")

    return "\n".join(lines) + "\n"


def serialize_osi(payload: Dict[str, Any]) -> str:
    module_id = payload.get("module_id") or ""
    name = payload.get("name") or "project"
    inputs = payload.get("inputs") or {}

    # Use legacy YAML for known modules; else JSON for safety
    if module_id in {"FinPlateConnection"}:
        return _to_legacy_yaml(module_id, name, inputs)

    # default JSON
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n"


def _parse_legacy_yaml(text: str) -> Dict[str, Any]:
    """Very small YAML reader for the flat legacy format we emit.

    Supports lines like:
      Key: value\n
      Key:\n
      - 'item'\n
    Returns a dict of key -> value (str or list[str]).
    """
    legacy: Dict[str, Any] = {}
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip() != ""]
    i = 0
    while i < len(lines):
        line = lines[i]
        if ":" in line:
            key, after = line.split(":", 1)
            key = key.strip()
            after = after.strip()
            if after == "":
                # list block
                i += 1
                items: list[str] = []
                while i < len(lines) and lines[i].lstrip().startswith("-"):
                    item = lines[i].lstrip()[1:].strip()
                    # strip optional quotes
                    if (item.startswith("'") and item.endswith("'")) or (item.startswith('"') and item.endswith('"')):
                        item = item[1:-1]
                    items.append(item)
                    i += 1
                legacy[key] = items
                continue  # already advanced i
            else:
                # scalar
                val = after
                # strip quotes
                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                    val = val[1:-1]
                legacy[key] = val
        i += 1
    return legacy


def parse_osi(text: str) -> Tuple[str, str, Dict[str, Any]]:
    # Try modern JSON first
    try:
        data = json.loads(text)
        version = data.get("version")
        if version not in SUPPORTED_VERSIONS:
            raise ValueError("Unsupported OSI version")
        name = data.get("name")
        module_id = data.get("module_id")
        inputs = data.get("inputs")
        if not name or not validate_module_id(module_id) or not isinstance(inputs, dict):
            raise ValueError("Malformed OSI payload")
        return module_id, name, inputs
    except Exception:
        # Fallback to legacy flat YAML
        legacy = _parse_legacy_yaml(text)
        module_id = legacy.get("Module") or legacy.get("module") or ""
        if not module_id:
            raise ValueError("Module missing in OSI")

        def g(key: str, default: Any = None) -> Any:
            return legacy.get(key, default)

        inputs: Dict[str, Any] = {}
        if module_id == "FinPlateConnection":
            # Reverse mapping for FinPlateConnection
            inputs.update({
                "bolt_hole_type": g("Bolt.Bolt_Hole_Type"),
                "bolt_diameter": g("Bolt.Diameter", []),
                "bolt_grade": g("Bolt.Grade", []),
                "bolt_slip_factor": g("Bolt.Slip_Factor"),
                "bolt_tension_type": g("Bolt.TensionType"),
                "bolt_type": (g("Bolt.Type") or "").replace(" ", "_"),
                "connectivity": g("Connectivity"),
                "connector_material": g("Connector.Material"),
                "design_method": g("Design.Design_Method"),
                "detailing_corr_status": g("Detailing.Corrosive_Influences"),
                "detailing_edge_type": g("Detailing.Edge_type"),
                "detailing_gap": g("Detailing.Gap"),
                "load_axial": g("Load.Axial"),
                "load_shear": g("Load.Shear"),
                "material": g("Material"),
                "beam_section": g("Member.Supported_Section.Designation"),
                "supported_material": g("Member.Supported_Section.Material"),
                "column_section": g("Member.Supporting_Section.Designation"),
                "supporting_material": g("Member.Supporting_Section.Material"),
                "weld_fab": g("Weld.Fab"),
                "weld_material_grade": g("Weld.Material_Grade_OverWrite"),
                "plate_thickness": g("Connector.Plate.Thickness_List", []),
                "module": module_id,
            })

        name = legacy.get("name") or module_id
        return module_id, name, inputs


def make_osifile_contentfile(payload: Dict[str, Any]) -> ContentFile:
    content = serialize_osi(payload)
    return ContentFile(content.encode("utf-8"))


