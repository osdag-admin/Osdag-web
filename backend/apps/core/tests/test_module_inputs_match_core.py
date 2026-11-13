"""CAD section lists and submitted input values must be ones the modules accept."""
import json
import re
from pathlib import Path

import pytest

from apps.core.tasks import get_service_class
from apps.core.utils.cad_helpers import SECTION_MAPPINGS
from apps.core.utils.errors import InvalidInputTypeError
from apps.modules.base_plate.adapter import create_from_input, hollow_section_designations
from osdag_core.Common import VALUES_CONN_3

BACKEND = Path(__file__).resolve().parents[3]
REGISTRY = BACKEND.parent / "frontend" / "src" / "modules" / "registry.js"
FIXTURES = BACKEND / "apps" / "core" / "tests" / "fixtures" / "design_inputs"

# Values osdag_core's bolt hole table (IS 800 table 19) has a clearance for.
BOLT_HOLE_TYPES = {"Standard", "Over-sized"}


def _module(api_slug):
    """(parent module, submodule slug) the same way the module views normalize them."""
    family, _, submodule = api_slug.partition("/")
    return family, (submodule or family).replace("_", "-")


# Purlin is still under development.
EXCLUDED_SUBMODULE = "purlin"

API_SLUGS = sorted(
    slug
    for slug in set(re.findall(r'apiSlug:\s*"([^"]+)"', REGISTRY.read_text(encoding="utf-8")))
    if _module(slug)[1] != EXCLUDED_SUBMODULE
)
SECTIONS = [
    (family, submodule, section)
    for family, submodules in SECTION_MAPPINGS.items()
    for submodule, sections in submodules.items()
    if submodule != EXCLUDED_SUBMODULE
    for section in sections
]


def _fixtures():
    return [(path, json.loads(path.read_text(encoding="utf-8"))) for path in sorted(FIXTURES.glob("*/*.json"))]


@pytest.mark.parametrize("api_slug", API_SLUGS)
def test_every_module_has_a_section_list(api_slug):
    family, submodule = _module(api_slug)
    assert submodule in SECTION_MAPPINGS.get(family, {}), f"{api_slug} would build only the default section"


@pytest.mark.parametrize("family,submodule,section", SECTIONS)
def test_module_accepts_each_listed_section(family, submodule, section):
    service = get_service_class(family, submodule)
    try:
        # A bare object has none of a solved module's attributes, so building stops right after
        # the section name is checked. Only a rejected name is a failure here.
        service.get_cad_model({}, section, "test-session", module=object())
    except InvalidInputTypeError as exc:
        pytest.fail(f"{family}/{submodule} rejects section {section!r}: {exc}")
    except Exception:
        pass


def test_fixtures_send_bolt_hole_types_core_knows():
    sent = {
        fixture["inputs"]["Bolt.Bolt_Hole_Type"]
        for _, fixture in _fixtures()
        if "Bolt.Bolt_Hole_Type" in fixture["inputs"]
    }
    assert sent, "no fixture sends a bolt hole type"
    assert sent <= BOLT_HOLE_TYPES


def test_column_end_plate_fixtures_send_a_connectivity_core_handles():
    fixtures = [f for p, f in _fixtures() if p.parent.name == "moment_connection__column_column_end_plate"]
    assert fixtures
    for fixture in fixtures:
        assert fixture["inputs"]["Connectivity"] in VALUES_CONN_3


def test_hollow_section_list_has_every_shape_without_leading_spaces():
    names = hollow_section_designations()
    assert names == [name.strip() for name in names]
    assert {name[:3] for name in names} == {"RHS", "SHS", "CHS"}


@pytest.mark.parametrize("designation", ["CHS 355.6 x 12", " CHS 355.6 x 12"])
def test_hollow_base_plate_reaches_core_with_the_catalog_spelling(designation):
    fixture = json.loads((FIXTURES / "base_plate" / "osi-baseplate-2.json").read_text(encoding="utf-8"))
    module = create_from_input({**fixture["inputs"], "Member.Designation": designation})
    assert module.dp_column_designation == " CHS 355.6 x 12"
    assert module.column_properties is not None


def test_hollow_base_plate_ignores_a_moment_left_in_the_form():
    fixture = json.loads((FIXTURES / "base_plate" / "osi-baseplate-2.json").read_text(encoding="utf-8"))
    module = create_from_input({**fixture["inputs"], "Load.Moment.Major": "40", "Load.Moment.Minor": "20"})
    assert module.load_moment_major == 0
    assert module.load_moment_minor == 0


def test_opening_a_moment_base_plate_osi_keeps_its_moments():
    # The .osi key map comes from running buildSubmissionParams on mock inputs, so a field the
    # function hides behind a condition on other inputs is silently dropped when a file is opened.
    fixture = json.loads((FIXTURES / "base_plate" / "osi-baseplate-4.json").read_text(encoding="utf-8"))
    assert fixture["inputs"]["Load.Moment.Major"] == "180"
    assert fixture["inputs"]["Load.Moment.Minor"] == "45"
