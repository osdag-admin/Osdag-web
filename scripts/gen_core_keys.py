#!/usr/bin/env python
"""Generate frontend/src/constants/generated/coreKeys.js from osdag_core/Common.py.

Every module-level string constant named KEY_*, DISP_* or CONN_* is written out as an
exported JS constant, sorted by name. Run from the repository root:

    python scripts/gen_core_keys.py
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "frontend" / "src" / "constants" / "generated" / "coreKeys.js"
PREFIXES = ("KEY_", "DISP_", "CONN_")

HEADER = """\
// Generated from osdag_core/Common.py by scripts/gen_core_keys.py.
// Do not edit by hand; run `python scripts/gen_core_keys.py` to regenerate.
"""


def collect_keys():
    os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
    sys.path.insert(0, str(ROOT))
    from osdag_core import Common

    return {
        name: value
        for name, value in vars(Common).items()
        if name.startswith(PREFIXES) and isinstance(value, str)
    }


def render(keys):
    lines = [HEADER]
    for name in sorted(keys):
        lines.append(f"export const {name} = {json.dumps(keys[name], ensure_ascii=False)};")
    return "\n".join(lines) + "\n"


def main():
    keys = collect_keys()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(render(keys), encoding="utf-8", newline="\n")
    print(f"Wrote {len(keys)} constants to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
