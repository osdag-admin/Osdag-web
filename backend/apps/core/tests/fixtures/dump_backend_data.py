"""Dump the backend-side data the fixture generator needs.

Writes one JSON document to the path given as argv[1] (stdout is noisy: osdag_core
prints import-time INFO lines):

    {
      "osi": {"<file>": {"module_line": str, "dock": {...}, "pref": {...}, "flat": {...}}, ...},
      "catalog": {"beams": [...], "columns": [...], ..., "materials": [...]}
    }

"osi": every desktop example parsed with the backend's parse_osi(), the same step the
web app performs when a user opens an .osi file (OpenOsiUpload -> parse_osi ->
web-ready {dock, pref}).

"catalog": the realistic option values the options views serve, read through
apps.core.catalog (designations, bolt diameters, materials).

Usage:
    python dump_backend_data.py out.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))
sys.path.insert(0, os.path.join(REPO, "backend"))
sys.path.insert(0, REPO)

from apps.core import catalog  # noqa: E402
from apps.core.utils.osi_files import parse_osi  # noqa: E402

EXAMPLES = os.path.join(REPO, "osdag_core", "data", "ResourceFiles", "design_example")


def dump_osi():
    out = {}
    for name in sorted(os.listdir(EXAMPLES)):
        if not name.endswith(".osi"):
            continue
        with open(os.path.join(EXAMPLES, name), encoding="utf-8") as fh:
            module_line, _name, inputs = parse_osi(fh.read())
        out[name] = {"module_line": module_line, "dock": inputs["dock"], "pref": inputs["pref"], "flat": inputs["flat"]}
    return out


def dump_catalog():
    return {
        "beams": catalog.designations("Beams"),
        "columns": catalog.designations("Columns"),
        "angles": catalog.designations("Angles"),
        "channels": catalog.designations("Channels"),
        "rhs": catalog.designations("RHS"),
        "shs": catalog.designations("SHS"),
        "chs": catalog.designations("CHS"),
        "boltDiameters": catalog.bolt_diameters(),
        "materials": [{"id": r["id"], "Grade": r["Grade"]} for r in catalog.rows("Material")],
    }


def main():
    with open(sys.argv[1], "w", encoding="utf-8") as fh:
        json.dump({"osi": dump_osi(), "catalog": dump_catalog()}, fh)


if __name__ == "__main__":
    main()
