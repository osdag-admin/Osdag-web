"""
Section import helpers — single source of truth for headers and cell rules.

Ports behaviour from Osdag desktop:
- `osdag_core.Common.get_db_header` (SQLite column order → here: Django catalog field order)
- `MainWindow.import_db_validation` / `UI_DESIGN_PREFERENCE.import_db_validation`
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple, Type

from django.db import models

from apps.core.models import Angles, Beams, Channels, Columns
from apps.sections.models import TABLE_TO_USER_MODEL

ALLOWED_TABLES = frozenset(TABLE_TO_USER_MODEL.keys())

TABLE_TO_CATALOG_MODEL: Dict[str, Type[models.Model]] = {
    "Columns": Columns,
    "Beams": Beams,
    "Angles": Angles,
    "Channels": Channels,
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


def get_db_header(table: str) -> List[str]:
    """
    Canonical xlsx row-1 headers for `table`, matching catalog field names
    (same strings desktop import expects for `SELECT *`-style column names).
    """
    assert_allowed_table(table)
    model = TABLE_TO_CATALOG_MODEL[table]
    return [
        f.name
        for f in model._meta.concrete_fields
        if not getattr(f, "primary_key", False)
    ]


def headers_match_table(header_row: List[str], table: str) -> bool:
    """True if the first row of an import sheet matches `get_db_header(table)`."""
    expected = get_db_header(table)
    got = [str(h).strip() if h is not None else "" for h in header_row]
    exp = [str(h).strip() for h in expected]
    return got == exp


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
    user's custom rows for that section family.

    `exclude_user_section_pk`: when updating an existing `UserCustom*` row,
    exclude that PK from the per-user duplicate check.

    Returns (allowed, reason_code) where reason_code is "" if allowed, else
    `catalog_duplicate` or `user_duplicate`.
    """
    assert_allowed_table(table)
    if not designation:
        return False, "missing_designation"

    catalog = TABLE_TO_CATALOG_MODEL[table]
    if catalog.objects.filter(Designation=designation).exists():
        return False, "catalog_duplicate"

    UserModel = TABLE_TO_USER_MODEL[table]
    qs = UserModel.objects.filter(user=user, Designation=designation)
    if exclude_user_section_pk is not None:
        qs = qs.exclude(pk=exclude_user_section_pk)
    if qs.exists():
        return False, "user_duplicate"

    return True, ""


def get_user_model_for_table(table: str):
    assert_allowed_table(table)
    return TABLE_TO_USER_MODEL[table]


def get_catalog_model_for_table(table: str):
    assert_allowed_table(table)
    return TABLE_TO_CATALOG_MODEL[table]
