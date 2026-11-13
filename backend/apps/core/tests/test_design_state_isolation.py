"""
Designs must not keep state between runs.

A Celery calculation worker runs many designs in one process, so a design that
leaves state behind (a shared logger that keeps its messages, a mutated class
attribute, a module-level cache) would change the result of whichever design
runs next.

Every non-xfail design-input fixture is run through its adapter's
generate_output() twice in this one process: once in sorted order and once in
reversed order. Both orders run each design after a different set of earlier
designs, so every result must be identical in both passes. A design that crashes
today must crash the same way in both passes.

No database is used.
"""
import copy
import importlib
import json
import re

import pytest

from apps.core.tests.test_design_input_fixtures import (
    FIXTURE_FILES,
    _load,
    adapter_import_path,
)

TIMESTAMP = re.compile(r"\d{4}-\d\d-\d\d \d\d:\d\d:\d\d")


def _fixture_id(path) -> str:
    return f"{path.parent.name}/{path.stem}"


def _runnable():
    return [p for p in FIXTURE_FILES if not _load(p).get("xfail")]


def _run(path) -> str:
    inputs = copy.deepcopy(_load(path)["inputs"])
    adapter = importlib.import_module(adapter_import_path(path.parent.name))
    try:
        result = adapter.generate_output(inputs)
    except Exception as exc:  # a design that crashes must crash identically
        result = {"raised": repr(exc)}
    # Log timestamps differ between runs; everything else must not.
    return TIMESTAMP.sub("<time>", json.dumps(result, sort_keys=True, default=str))


@pytest.fixture(scope="module")
def passes():
    fixtures = _runnable()
    sorted_pass = {_fixture_id(p): _run(p) for p in fixtures}
    reversed_pass = {_fixture_id(p): _run(p) for p in reversed(fixtures)}
    return sorted_pass, reversed_pass


@pytest.mark.parametrize("path", _runnable(), ids=_fixture_id)
def test_result_does_not_depend_on_earlier_designs(path, passes):
    sorted_pass, reversed_pass = passes
    name = _fixture_id(path)
    assert sorted_pass[name] == reversed_pass[name]
