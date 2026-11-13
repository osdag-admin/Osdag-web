"""Run each adapter's validate_input() over a fixture tree and report the outcome.

Used by generate_design_fixtures.mjs to decide which freshly generated payloads the
backend accepts today. Not a test (see ../test_design_input_fixtures.py for that).

Usage:
    python check_fixtures.py <fixtures_dir> <out.json>

<fixtures_dir> holds <module-slug>/<name>.json files; the output maps
"<module-slug>/<name>" to null (accepted) or "<ExceptionType>: <message>".
"""
import importlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))
sys.path.insert(0, os.path.join(REPO, "backend"))
sys.path.insert(0, REPO)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()  # adapters import apps.core.models; no database connection is made


def adapter_import_path(slug):
    family, _, sub = slug.partition("__")
    if sub:
        return f"apps.modules.{family}.submodules.{sub}.adapter"
    return f"apps.modules.{family}.adapter"


def main():
    root, out_path = sys.argv[1], sys.argv[2]
    results = {}
    for slug in sorted(os.listdir(root)):
        slug_dir = os.path.join(root, slug)
        if not os.path.isdir(slug_dir):
            continue
        adapter = importlib.import_module(adapter_import_path(slug))
        for name in sorted(os.listdir(slug_dir)):
            if not name.endswith(".json"):
                continue
            with open(os.path.join(slug_dir, name), encoding="utf-8") as fh:
                inputs = json.load(fh)["inputs"]
            try:
                adapter.validate_input(inputs)
                results[f"{slug}/{name[:-5]}"] = None
            except Exception as exc:  # noqa: BLE001 - we want every failure mode
                results[f"{slug}/{name[:-5]}"] = f"{type(exc).__name__}: {exc}"
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(results, fh, indent=1)


if __name__ == "__main__":
    main()
