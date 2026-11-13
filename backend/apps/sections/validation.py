"""
Section import helpers — single source of truth for headers and cell rules.

Ports behaviour from Osdag desktop:
- `osdag_core.Common.get_db_header` (SQLite column order → here: Django catalog field order)
- `MainWindow.import_db_validation` / `UI_DESIGN_PREFERENCE.import_db_validation`
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from apps.core import catalog
from apps.sections.models import TABLE_TO_USER_MODEL

ALLOWED_TABLES = frozenset(TABLE_TO_USER_MODEL.keys())
ALLOWED_CATALOG_TABLES = ALLOWED_TABLES | {"CHS", "SHS", "RHS"}

# Fields of a UserCustom* row that are not part of a catalog row.
_USER_ROW_FIELDS = frozenset({"user", "created_at", "updated_at", "is_active"})

# osdag_core looks I-sections up in Beams, then Columns (fetch_beam_or_column), so a
# designation must be unique across both or one row silently shadows the other.
_SHARED_DESIGNATION_TABLES: Dict[str, Tuple[str, ...]] = {
    "Beams": ("Beams", "Columns"),
    "Columns": ("Beams", "Columns"),
}

# Desktop `import_db_validation`: numeric keys must be int or float (openpyxl often uses float).
# We also allow `Decimal` (DB / API paths).
_NUMERIC_KEYS_BEAM_COLUMN: frozenset[str] = frozenset(
    {
        "Mass",
        "Area",
        "D",
        "B",
        "tw",
        "T",
        "FlangeSlope",
        "R1",
        "R2",
        "Iz",
        "Iy",
        "rz",
        "ry",
        "Zz",
        "Zy",
        "Zpz",
        "Zpy",
        "It",
        "Iw",
    }
)

_NUMERIC_KEYS_ANGLE: frozenset[str] = frozenset(
    {
        "Mass",
        "Area",
        "a",
        "b",
        "t",
        "R1",
        "R2",
        "Cz",
        "Cy",
        "Iz",
        "Iy",
        "Alpha",
        "lumax",
        "lvmin",
        "rz",
        "ry",
        "rumax",
        "rvmin",
        "Zz",
        "Zy",
        "Zpz",
        "Zpy",
        "It",
    }
)

_NUMERIC_KEYS_CHANNEL: frozenset[str] = frozenset(
    {
        "Mass",
        "Area",
        "D",
        "B",
        "tw",
        "T",
        "FlangeSlope",
        "R1",
        "R2",
        "Cy",
        "Iz",
        "Iy",
        "rz",
        "ry",
        "Zz",
        "Zy",
        "Zpz",
        "Zpy",
        "It",
        "Iw",
    }
)

TABLE_NUMERIC_KEYS: Dict[str, frozenset[str]] = {
    "Columns": _NUMERIC_KEYS_BEAM_COLUMN,
    "Beams": _NUMERIC_KEYS_BEAM_COLUMN,
    "Angles": _NUMERIC_KEYS_ANGLE,
    "Channels": _NUMERIC_KEYS_CHANNEL,
}


def assert_allowed_table(table: str) -> None:
    if table not in ALLOWED_TABLES:
        raise ValueError(
            f"Invalid table {table!r}; expected one of {sorted(ALLOWED_TABLES)}"
        )


def assert_allowed_catalog_table(table: str) -> None:
    if table not in ALLOWED_CATALOG_TABLES:
        raise ValueError(
            f"Invalid catalog table {table!r}; expected one of {sorted(ALLOWED_CATALOG_TABLES)}"
        )


def get_db_header(table: str) -> List[str]:
    """
    Canonical xlsx row-1 headers for `table`, matching catalog field names
    (same strings desktop import expects for `SELECT *`-style column names).

    Sections users can import take them from their `UserCustom*` model, whose fields
    mirror the catalog's; the others (CHS, SHS, RHS) from the catalog itself.
    """
    assert_allowed_catalog_table(table)
    if table in TABLE_TO_USER_MODEL:
        return [
            f.name
            for f in TABLE_TO_USER_MODEL[table]._meta.concrete_fields
            if not f.primary_key and f.name not in _USER_ROW_FIELDS
        ]
    return [name for name in catalog.fields(table) if name != "id"]


def headers_match_table(header_row: List[str], table: str) -> bool:
    """True if the first row contains all expected headers for `table`.

    Extra columns (e.g. `Id` from a catalog export) are allowed and ignored.
    """
    expected = set(get_db_header(table))
    got = {str(h).strip() for h in header_row if h is not None and str(h).strip()}
    return expected.issubset(got)


def import_db_validation(table: str, key: str, value: Any) -> bool:
    """
    Port of desktop `import_db_validation(tab, key, value)`.

    For known numeric columns, value must be int, float, or Decimal (not bool).
    Other keys always pass (desktop returned True).
    """
    assert_allowed_table(table)
    numeric_keys = TABLE_NUMERIC_KEYS.get(table, frozenset())
    if key not in numeric_keys:
        return True
    if isinstance(value, bool):
        return False
    if isinstance(value, (int, float, Decimal)):
        return True
    return False


def cell_problem(table: str, key: str, value: Any) -> Optional[str]:
    """
    Return None if the cell is acceptable, else one of `empty`, `text_number`
    (numeric text such as "12.5") or `not_a_number`. Agrees with `import_db_validation`.
    """
    if import_db_validation(table, key, value):
        return None
    if value is None or (isinstance(value, str) and not value.strip()):
        return "empty"
    if isinstance(value, str):
        try:
            float(value.strip())
        except ValueError:
            return "not_a_number"
        return "text_number"
    return "not_a_number"


def row_dict_to_create_kwargs(table: str, row: Dict[str, Any]) -> Dict[str, Any]:
    """
    Keep only catalog field keys for `UserCustom*` create/update (no user, no PK,
    no timestamps, no is_active). Unknown keys are dropped.
    """
    assert_allowed_table(table)
    allowed = frozenset(get_db_header(table))
    return {k: v for k, v in row.items() if k in allowed}


def can_insert_custom_section(
    table: str,
    designation: str,
    user: Any,
    *,
    exclude_user_section_pk: Optional[int] = None,
) -> Tuple[bool, str]:
    """
    Rule: block if designation exists in global catalog or in this
    user's custom rows for that section family (Beams and Columns count as one).

    `exclude_user_section_pk`: when updating an existing `UserCustom*` row,
    exclude that PK from the per-user duplicate check.

    Returns (allowed, reason_code) where reason_code is "" if allowed, else
    `catalog_duplicate` or `user_duplicate`.
    """
    assert_allowed_table(table)
    if not designation:
        return False, "missing_designation"

    tables = _SHARED_DESIGNATION_TABLES.get(table, (table,))
    if any(catalog.find(t, Designation=designation) for t in tables):
        return False, "catalog_duplicate"

    for t in tables:
        qs = TABLE_TO_USER_MODEL[t].objects.filter(user=user, Designation=designation)
        if exclude_user_section_pk is not None and t == table:
            qs = qs.exclude(pk=exclude_user_section_pk)
        if qs.exists():
            return False, "user_duplicate"

    return True, ""


def get_user_model_for_table(table: str):
    assert_allowed_table(table)
    return TABLE_TO_USER_MODEL[table]


_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def excel_safe(value: Any) -> Any:
    """Neutralise spreadsheet formula injection in exported text cells."""
    if isinstance(value, str) and value.startswith(_FORMULA_PREFIXES):
        return "'" + value
    return value
