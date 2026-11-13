"""
Read-only access to the steel-section, bolt and material catalog.

The catalog lives in the SQLite file bundled with osdag_core
(`osdag_core.Common.PATH_TO_DATABASE`), the same file the calculation engine reads,
so the web UI and the engine can never disagree. It is static at runtime, so every
table is loaded once and cached. User data (custom sections and materials) stays in
Postgres and is merged in by the callers.

Rows are plain dicts keyed by the field names the API has always returned (the names
the old Postgres models used), which differ from the SQLite column names in a few
tables; see `_FIELD_NAMES`.
"""

import sqlite3
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

from osdag_core.Common import PATH_TO_DATABASE

CATALOG_TABLES = (
    "Anchor_Bolt",
    "Angle_Pitch",
    "Angles",
    "Beams",
    "Bolt",
    "Bolt_fy_fu",
    "CHS",
    "Channels",
    "Columns",
    "EqualAngle",
    "Material",
    "RHS",
    "SHS",
    "UnequalAngle",
)

_ANGLE_FIELD_NAMES = {
    "Iu(max)": "Iu_max",
    "Iv(min)": "Iv_min",
    "ru(max)": "ru_max",
    "rv(min)": "rv_min",
}

# SQLite column -> API field name, for the columns where they differ.
_FIELD_NAMES: Dict[str, Dict[str, str]] = {
    "Material": {
        "Yield Stress (< 20)": "Yield_Stress_less_than_20",
        "Yield Stress (20 -40)": "Yield_Stress_between_20_and_neg40",
        "Yield Stress (> 40)": "Yield_Stress_greater_than_40",
        "Ultimate Tensile Stress": "Ultimate_Tensile_Stress",
        "Elongation ": "Elongation",
    },
    "EqualAngle": _ANGLE_FIELD_NAMES,
    "UnequalAngle": _ANGLE_FIELD_NAMES,
    # The "l" is a lowercase L, as in UserCustomAngle.
    "Angles": {"Iumax": "lumax", "Ivmin": "lvmin"},
}


def connect() -> sqlite3.Connection:
    """Open the catalog read-only."""
    return sqlite3.connect(f"file:{PATH_TO_DATABASE}?mode=ro", uri=True)


def _check_table(table: str) -> None:
    if table not in CATALOG_TABLES:
        raise ValueError(f"Unknown catalog table {table!r}; expected one of {CATALOG_TABLES}")


@lru_cache(maxsize=None)
def _load(table: str) -> Tuple[Dict[str, Any], ...]:
    _check_table(table)
    names = _FIELD_NAMES.get(table, {})
    conn = connect()
    try:
        cursor = conn.execute(f'SELECT rowid, * FROM "{table}"')
        columns = [c[0] for c in cursor.description[1:]]
        raw_rows = cursor.fetchall()
    finally:
        conn.close()

    rows = []
    for raw in raw_rows:
        # Tables without an "Id" column ("ID" in Angle_Pitch) get their rowid as `id`.
        row = {"id": raw[0]}
        for column, value in zip(columns, raw[1:]):
            if isinstance(value, float):
                # Some stored values carry float noise (0.033 is stored as 0.03300000000000001).
                value = float(f"{value:.12g}")
            row["id" if column.lower() == "id" else names.get(column, column)] = value
        rows.append(row)
    rows.sort(key=lambda row: row["id"])
    return tuple(rows)


def rows(table: str) -> List[Dict[str, Any]]:
    """Every row of `table` in catalog (Id) order, as new dicts."""
    return [dict(row) for row in _load(table)]


def fields(table: str) -> List[str]:
    """Field names of `table`, `id` first."""
    return list(_load(table)[0])


def find(table: str, **lookup: Any) -> Optional[Dict[str, Any]]:
    """First row of `table` whose fields equal `lookup`, or None."""
    for row in _load(table):
        if all(row.get(key) == value for key, value in lookup.items()):
            return dict(row)
    return None


def designations(table: str) -> List[str]:
    """
    Designations of `table` in catalog order, each once.

    The catalog repeats a few designations (e.g. "WB 200"); osdag_core only ever
    uses the first row, so a dropdown must list each name once.
    """
    return list(dict.fromkeys(row["Designation"] for row in _load(table)))


def bolt_diameters() -> List[str]:
    """Bolt diameters as strings, sorted as strings."""
    return sorted(str(row["Bolt_diameter"]) for row in _load("Bolt"))
