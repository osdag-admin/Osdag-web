"""
Opening .osi files saved by desktop Osdag.

The desktop design examples under osdag_core/data/ResourceFiles/design_example/ are
real desktop saves. Each one must parse, name a module the backend serves, carry no
unresolved YAML anchors and use a connectivity the desktop defines. Whether the web
form accepts the inputs it loads from them is pinned by the design-input fixtures
(fixtures/design_inputs/*/osi-*.json, checked in test_design_input_fixtures.py);
this module checks that every example is accounted for there.

No database is used.
"""
import ast
import json
import re
from pathlib import Path

import pytest

from apps.core.utils.osi_files import _parse_flat_yaml, parse_osi
from osdag_core import Common

BACKEND_DIR = Path(__file__).resolve().parents[3]
REPO_DIR = BACKEND_DIR.parent
EXAMPLES_DIR = REPO_DIR / "osdag_core" / "data" / "ResourceFiles" / "design_example"
MODULES_DIR = BACKEND_DIR / "apps" / "modules"
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "design_inputs"

EXAMPLE_FILES = sorted(EXAMPLES_DIR.glob("*.osi"))

# Examples saved by an older desktop release under a module name the desktop has
# since renamed. Old names are not supported.
LEGACY_MODULE_NAME = {
    "bb_ep_splice_1.osi": "Beam-Beam End Plate Splice",
    "bb_ep_splice_2.osi": "Beam-Beam End Plate Splice",
}

# Examples whose required loads are blank in the desktop file itself (the desktop lets a
# user save before entering loads), so the web validator rightly rejects them.
BLANK_LOADS = {
    "baseplate_1.osi": ["Load.Axial_Compression"],
    "baseplate_3.osi": ["Load.Shear.Major"],
    "beam_bolted1.osi": ["Load.Moment", "Load.Shear"],
    "beam_bolted2.osi": ["Load.Moment", "Load.Shear"],
    "beam_bolted3.osi": ["Load.Moment", "Load.Shear"],
    "column_bolted1.osi": ["Load.Moment", "Load.Shear"],
    "ccep2.osi": ["Load.Shear"],
    "cleat_4.osi": ["Load.Shear"],
}

ANCHOR_OR_ALIAS = re.compile(r"^[&*]\w+")


def backend_module_ids() -> set:
    """Every MODULE_ID the backend declares, resolved to its desktop module name."""
    ids = set()
    for path in MODULES_DIR.rglob("*.py"):
        for node in ast.parse(path.read_text(encoding="utf-8")).body:
            if not (isinstance(node, ast.Assign) and any(
                isinstance(t, ast.Name) and t.id == "MODULE_ID" for t in node.targets
            )):
                continue
            if isinstance(node.value, ast.Constant):
                ids.add(node.value.value)
            elif isinstance(node.value, ast.Name):
                ids.add(getattr(Common, node.value.id))
    return ids


MODULE_IDS = backend_module_ids()

KNOWN_CONNECTIVITY = set(
    Common.VALUES_CONN
    + Common.VALUES_CONN_BP
    + Common.VALUES_CONN_SPLICE
    + Common.VALUES_CONN_3
)


def read_example(path: Path):
    return parse_osi(path.read_text(encoding="utf-8"))


def all_values(inputs: dict):
    for value in inputs.values():
        if isinstance(value, list):
            yield from value
        else:
            yield value


def test_all_desktop_examples_are_present():
    assert len(EXAMPLE_FILES) == 66


def test_backend_declares_module_ids():
    assert Common.KEY_DISP_FINPLATE in MODULE_IDS
    assert Common.KEY_DISP_BB_EP_SPLICE in MODULE_IDS


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=lambda p: p.name)
def test_example_parses_and_resolves_to_a_module(path: Path):
    module_id, name, inputs = read_example(path)

    assert name == module_id
    assert set(inputs) == {"dock", "pref", "flat"}
    if path.name in LEGACY_MODULE_NAME:
        assert module_id == LEGACY_MODULE_NAME[path.name]
        assert module_id not in MODULE_IDS
    else:
        assert module_id in MODULE_IDS


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=lambda p: p.name)
def test_example_has_no_unresolved_yaml_anchors(path: Path):
    _, _, inputs = read_example(path)

    for section in ("flat", "dock"):
        for value in all_values(inputs[section]):
            assert not (isinstance(value, str) and ANCHOR_OR_ALIAS.match(value)), (section, value)


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=lambda p: p.name)
def test_example_connectivity_is_a_desktop_value(path: Path):
    _, _, inputs = read_example(path)
    flat = inputs["flat"]

    connectivity = flat.get("Connectivity *") or flat.get("Connectivity")
    if connectivity is None:
        pytest.skip("module has no connectivity")
    assert connectivity in KNOWN_CONNECTIVITY
    assert inputs["dock"]["connectivity"] == connectivity


@pytest.mark.parametrize("path", EXAMPLE_FILES, ids=lambda p: p.name)
def test_example_is_covered_by_the_web_import_fixtures(path: Path):
    """Each example is validated through the web form path, rejected for blank loads,
    or uses a legacy module name."""
    fixture_sources = {
        json.loads(f.read_text(encoding="utf-8"))["source"] for f in FIXTURES_DIR.glob("*/osi-*.json")
    }
    rejected = json.loads((FIXTURES_DIR / "osi_rejected.json").read_text(encoding="utf-8"))

    in_fixtures = f"osi:{path.name}" in fixture_sources
    in_rejected = path.name in rejected
    legacy = path.name in LEGACY_MODULE_NAME

    assert [in_fixtures, in_rejected, legacy].count(True) == 1, path.name


@pytest.mark.parametrize("name", sorted(BLANK_LOADS))
def test_rejected_examples_have_blank_loads(name: str):
    rejected = json.loads((FIXTURES_DIR / "osi_rejected.json").read_text(encoding="utf-8"))
    flat = read_example(EXAMPLES_DIR / name)[2]["flat"]

    assert name in rejected
    assert rejected[name]["error"].startswith("MissingKeyError")
    for key in BLANK_LOADS[name]:
        assert flat[key] == "", key


def test_only_blank_load_examples_are_rejected():
    rejected = json.loads((FIXTURES_DIR / "osi_rejected.json").read_text(encoding="utf-8"))

    assert sorted(rejected) == sorted(BLANK_LOADS)


class TestFlatYamlReader:
    def test_anchored_list_is_resolved_for_every_use(self):
        text = (
            "Thickness_A: &id001\n- '8'\n- '10'\n"
            "Thickness_B: *id001\n"
        )
        data = _parse_flat_yaml(text)

        assert data["Thickness_A"] == ["8", "10"]
        assert data["Thickness_B"] == ["8", "10"]
        assert data["Thickness_A"] is not data["Thickness_B"]

    def test_values_stay_strings(self):
        data = _parse_flat_yaml("A: No\nB: 08\nC: 1.0\nD: 'x'\nE: ''\nF: true\n")

        assert data == {"A": "No", "B": "08", "C": "1.0", "D": "x", "E": "", "F": "true"}

    def test_list_items_stay_strings(self):
        assert _parse_flat_yaml("Bolt.Diameter:\n- 16\n- '20'\n") == {"Bolt.Diameter": ["16", "20"]}

    def test_comments_are_ignored(self):
        assert _parse_flat_yaml("# header\nModule: Fin Plate Connection  # note\n") == {
            "Module": "Fin Plate Connection"
        }

    def test_empty_value_is_an_empty_list(self):
        assert _parse_flat_yaml("Bolt.Grade:\nModule: M\n") == {"Bolt.Grade": [], "Module": "M"}

    def test_keys_stay_flat_and_dotted(self):
        assert _parse_flat_yaml("Anchor Bolt.OCF.Diameter:\n- M20\n") == {"Anchor Bolt.OCF.Diameter": ["M20"]}

    def test_text_that_is_not_a_mapping_is_rejected(self):
        with pytest.raises(ValueError):
            _parse_flat_yaml("just some text")

    def test_missing_module_is_rejected(self):
        with pytest.raises(ValueError):
            parse_osi("Bolt.Grade:\n- '8.8'\n")


@pytest.mark.parametrize("name", ["EP-1.osi", "EP-2.osi", "EP-3.osi", "EP-4.osi", "EP-5.osi"])
def test_desktop_end_plate_connection_opens_the_header_plate_module(name: str):
    module_id, _, inputs = read_example(EXAMPLES_DIR / name)

    assert inputs["flat"]["Module"] == "End Plate Connection"
    assert module_id == Common.KEY_DISP_HEADERPLATE
