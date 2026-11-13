"""
Every key an adapter requires must be a string constant defined in osdag_core.Common.

Keys written only in an adapter cannot be checked against the core and drift from
it silently. No database is used: get_required_keys() is pure.
"""
import importlib
from pathlib import Path

import pytest

from osdag_core import Common

BACKEND_DIR = Path(__file__).resolve().parents[3]
MODULES_DIR = BACKEND_DIR / "apps" / "modules"

CORE_VALUES = {v for k, v in vars(Common).items() if not k.startswith("_") and isinstance(v, str)}

# Adapters whose required-keys function is not called get_required_keys.
REQUIRED_KEYS_FUNCTION = {
    "shear_connection__cleat_angle": "get_required_keys_cleat_angle",
    "shear_connection__seated_angle": "get_required_keys_seated_angle",
}

# adapter slug -> {required key: why it is not a Common.py value}
KNOWN_EXCEPTIONS = {
    "compression_member__struts_bolted": {
        "Member.End_1": "web request name; the adapter copies it to the core key End_1",
        "Member.End_2": "web request name; the adapter copies it to the core key End_2",
    },
    "compression_member__struts_welded": {
        "Member.End_1": "web request name; the adapter copies it to the core key End_1",
        "Member.End_2": "web request name; the adapter copies it to the core key End_2",
    },
    "flexure_member__plate_girder": {
        "Design.Allow_Class": "web request name; the adapter maps it to KEY_ALLOW_CLASS",
        "Design.Design_Type_Flexure": "web request name; the adapter maps it to KEY_DESIGN_TYPE_FLEXURE",
        "Design.IntermediateStiffener": "web request name; the adapter maps it to KEY_IntermediateStiffener",
        "Design.IntermediateStiffener.Spacing": "web request name; the adapter maps it to KEY_IntermediateStiffener_spacing",
        "Design.IntermediateStiffener.Thickness": "web request name; the adapter maps it to KEY_IntermediateStiffener_thickness",
        "Design.LongitudnalStiffener": "web request name; the adapter maps it to KEY_LongitudnalStiffener",
        "Design.LongitudnalStiffener.Thickness": "web request name; the adapter maps it to KEY_LongitudnalStiffener_thickness",
        "Design.Max_Deflection": "web request name; the adapter maps it to KEY_MAX_DEFL",
        "Design.Support_Width": "web request name; the adapter maps it to KEY_SUPPORT_WIDTH",
        "Design.Torsional_Restraint": "web request name; the adapter maps it to KEY_TORSIONAL_RES",
        "Design.Warping_Restraint": "web request name; the adapter maps it to KEY_WARPING_RES",
        "Design.Web_Philosophy": "web request name; the adapter maps it to KEY_WEB_PHILOSOPHY",
        "Loading.Bending_Moment_Shape": "web request name; the adapter maps it to KEY_BENDING_MOMENT_SHAPE",
    },
}


def adapter_slug(adapter_file: Path) -> str:
    """apps/modules/<family>/submodules/<sub>/adapter.py -> '<family>__<sub>';
    apps/modules/<family>/adapter.py -> '<family>'."""
    parts = adapter_file.relative_to(MODULES_DIR).parts[:-1]
    return "__".join(p for p in parts if p != "submodules")


def adapter_import_path(slug: str) -> str:
    family, _, sub = slug.partition("__")
    if sub:
        return f"apps.modules.{family}.submodules.{sub}.adapter"
    return f"apps.modules.{family}.adapter"


ADAPTER_SLUGS = sorted(adapter_slug(p) for p in MODULES_DIR.rglob("adapter.py"))


def test_core_constants_were_collected():
    assert "Bolt.Diameter" in CORE_VALUES
    assert len(CORE_VALUES) > 1000


def test_exceptions_name_real_adapters():
    assert set(KNOWN_EXCEPTIONS) <= set(ADAPTER_SLUGS)


@pytest.mark.parametrize("slug", ADAPTER_SLUGS)
def test_required_keys_are_core_keys(slug):
    adapter = importlib.import_module(adapter_import_path(slug))
    required = getattr(adapter, REQUIRED_KEYS_FUNCTION.get(slug, "get_required_keys"))()
    allowed = KNOWN_EXCEPTIONS.get(slug, {})

    missing = sorted(k for k in required if k not in CORE_VALUES and k not in allowed)
    assert not missing, f"{slug}: required keys that are not Common.py values: {missing}"

    stale = sorted(k for k in allowed if k in CORE_VALUES or k not in required)
    assert not stale, f"{slug}: remove from KNOWN_EXCEPTIONS (now core keys or no longer required): {stale}"
