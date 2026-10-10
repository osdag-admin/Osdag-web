"""
Supplies a user's custom sections and materials to osdag_core.

osdag_core looks rows up through `osdag_core.Common.fetch_row(table, value)`, which
asks `row_override` before reading the bundled SQLite catalog. `user_rows(user_id)`
installs an override for one design / CAD / report run so the user's rows (stored
only in Postgres) take precedence over the catalog.

Usage:
    with user_rows(user_id):
        ServiceClass.calculate(...)
"""

from contextlib import contextmanager
from decimal import Decimal
from typing import Any, Dict, Optional, Tuple

from osdag_core.Common import row_override

# Column order of the bundled SQLite tables after the leading "Id" column.
# osdag_core reads rows by position, so this order must match the SQLite schema.
_I_SECTION_COLUMNS = [
    "Designation", "Mass", "Area", "D", "B", "tw", "T", "FlangeSlope", "R1", "R2",
    "Iz", "Iy", "rz", "ry", "Zz", "Zy", "Zpz", "Zpy", "It", "Iw", "Source", "Type",
]
SECTION_COLUMNS = {
    "Beams": _I_SECTION_COLUMNS,
    "Columns": _I_SECTION_COLUMNS,
    "Channels": [
        "Designation", "Mass", "Area", "D", "B", "tw", "T", "FlangeSlope", "R1", "R2",
        "Cy", "Iz", "Iy", "rz", "ry", "Zz", "Zy", "Zpz", "Zpy", "It", "Iw", "Source", "Type",
    ],
    "Angles": [
        "Designation", "Mass", "Area", "a", "b", "t", "R1", "R2", "Cz", "Cy", "Iz", "Iy",
        "Alpha", "lumax", "lvmin", "rz", "ry", "rumax", "rvmin", "Zz", "Zy", "Zpz", "Zpy",
        "It", "Source", "Type",
    ],
}

# SQLite Material columns: Grade, fy (<20), fy (20-40), fy (>40), fu, elongation.
MATERIAL_COLUMNS = [
    "Grade",
    "Yield_Stress_less_than_20",
    "Yield_Stress_between_20_and_neg40",
    "Yield_Stress_greater_than_40",
    "Ultimate_Tensile_Stress",
    "Elongation",
]

RowKey = Tuple[str, str]


def _plain(value: Any) -> Any:
    # osdag_core mixes these values with floats; Decimal * float raises TypeError.
    return float(value) if isinstance(value, Decimal) else value


def _section_row(obj, columns) -> tuple:
    values = {col: _plain(getattr(obj, col)) for col in columns}
    # Area is stored in cm²; values above 1000 were entered in mm².
    if values["Area"] is not None and values["Area"] > 1000:
        values["Area"] = values["Area"] / 100.0
    values["Source"] = values["Source"] or "Custom"
    return (0, *(values[col] for col in columns))


def load_user_rows(user_id: Optional[int]) -> Dict[RowKey, tuple]:
    """Return {(table, designation_or_grade): row tuple} for the user's active custom data."""
    if not user_id:
        return {}

    from apps.core.models import CustomMaterials
    from apps.sections.models import TABLE_TO_USER_MODEL

    rows: Dict[RowKey, tuple] = {}
    for table, Model in TABLE_TO_USER_MODEL.items():
        columns = SECTION_COLUMNS[table]
        for obj in Model.objects.filter(user_id=user_id, is_active=True):
            rows[(table, obj.Designation)] = _section_row(obj, columns)

    for mat in CustomMaterials.objects.filter(user_id=user_id):
        rows[("Material", mat.Grade)] = tuple(_plain(getattr(mat, col)) for col in MATERIAL_COLUMNS)

    return rows


@contextmanager
def user_rows(user_id: Optional[int]):
    """Make the user's custom sections and materials visible to osdag_core inside the block."""
    rows = load_user_rows(user_id)
    if not rows:
        yield
        return
    token = row_override.set(lambda table, value: rows.get((table, value)))
    try:
        yield
    finally:
        row_override.reset(token)


def user_id_from_request(request) -> Optional[int]:
    """Authenticated user's id for DRF and plain Django views alike, else None."""
    user = getattr(request, "user", None)
    if user is not None and getattr(user, "is_authenticated", False):
        return user.id

    from apps.core.middleware.firebase_auth import FirebaseAuthentication

    try:
        result = FirebaseAuthentication().authenticate(request)
    except Exception:
        return None
    return result[0].id if result else None
