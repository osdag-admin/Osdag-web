"""
Known-good design inputs for every module adapter.

Each JSON file under fixtures/design_inputs/<module-slug>/ holds a flat dotted-key
request body that the web app sends today. These tests assert that the matching
adapter's validate_input() accepts it, so later refactors (e.g. Pydantic models) can
prove they did not change which inputs are accepted.

No database is used: validate_input() is pure, and no test here requests the `db`
fixture, so pytest-django never creates one.

A fixture may carry an optional "xfail": "<reason>" field. It marks a payload the
real frontend sends but today's validator rejects (a bug to fix, not a fixture to
drop); the test is then expected to fail and is reported as xfail.
"""
import importlib
import json
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[3]
MODULES_DIR = BACKEND_DIR / "apps" / "modules"
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "design_inputs"


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
FIXTURE_FILES = sorted(FIXTURES_DIR.glob("*/*.json"))


def _load(path: Path) -> dict:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _param(path: Path):
    marks = []
    reason = _load(path).get("xfail")
    if reason:
        marks.append(pytest.mark.xfail(reason=reason, strict=True))
    return pytest.param(path, id=f"{path.parent.name}/{path.stem}", marks=marks)


def test_every_adapter_has_a_fixture():
    assert len(ADAPTER_SLUGS) == 25, ADAPTER_SLUGS
    missing = [s for s in ADAPTER_SLUGS if not list((FIXTURES_DIR / s).glob("*.json"))]
    assert not missing, f"adapters without a design-input fixture: {missing}"


def test_every_fixture_directory_matches_an_adapter():
    dirs = sorted(p.name for p in FIXTURES_DIR.iterdir() if p.is_dir())
    assert dirs == ADAPTER_SLUGS


@pytest.mark.parametrize("path", [_param(p) for p in FIXTURE_FILES])
def test_adapter_accepts_fixture(path: Path):
    fixture = _load(path)
    assert set(fixture) - {"xfail"} == {"source", "notes", "inputs"}
    assert isinstance(fixture["inputs"], dict) and fixture["inputs"]

    adapter = importlib.import_module(adapter_import_path(path.parent.name))
    adapter.validate_input(fixture["inputs"])  # raises on bad input
