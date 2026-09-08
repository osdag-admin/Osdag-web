"""
Merge authenticated users' `UserCustom*` designations into module `options` payloads.

Guests and anonymous requests: `data` is returned unchanged.
"""

from __future__ import annotations

from typing import Any, Dict, List

# Response key → catalog table name (matches `TABLE_TO_USER_MODEL` keys).
LIST_KEY_TO_TABLE: Dict[str, str] = {
    "beamList": "Beams",
    "columnList": "Columns",
    "angleList": "Angles",
    "channelList": "Channels",
    "topAngleList": "Angles",
}


def merge_user_sections_into_options(request: Any, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mutates lists in `data` in place for known section list keys, then returns `data`.

    Rule: designations already present (global catalog order preserved) are unchanged;
    user-only designations are appended. No duplicate strings after merge.
    """
    user = getattr(request, "user", None)
    if user is None or not getattr(user, "is_authenticated", False):
        return data

    try:
        ensure_custom_sections_in_sqlite(user)
    except Exception:
        pass

    for list_key, table in LIST_KEY_TO_TABLE.items():
        if list_key not in data:
            continue
        lst = data[list_key]
        if not isinstance(lst, list):
            continue
        _merge_table_designations_into_list(lst, table, user)

    # Base plate: single combined beam+column designation list.
    lst = data.get("sectionDesignation")
    if isinstance(lst, list):
        _merge_base_plate_section_designation(lst, user)

    return data


def ensure_custom_sections_in_sqlite(user: Any = None, designations: List[str] = None) -> None:
    """
    Ensures user's UserCustom* section rows exist in Intg_osdag.sqlite before osdag_core runs.
    Requires ZERO modifications to osdag_core.
    """
    if not user or not getattr(user, "is_authenticated", False):
        return

    import sqlite3
    from osdag_core.Common import PATH_TO_DATABASE
    from apps.sections.models import UserCustomColumn, UserCustomBeam, UserCustomAngle, UserCustomChannel

    try:
        conn = sqlite3.connect(str(PATH_TO_DATABASE))
        cursor = conn.cursor()

        models = [
            (UserCustomColumn, "Columns"),
            (UserCustomBeam, "Beams"),
            (UserCustomAngle, "Angles"),
            (UserCustomChannel, "Channels"),
        ]

        for Model, table in models:
            qs = Model.objects.filter(user=user, is_active=True)
            if designations:
                qs = qs.filter(Designation__in=designations)

            for obj in qs:
                if table in ("Columns", "Beams"):
                    cursor.execute(
                        f"""INSERT OR REPLACE INTO {table}
                        (Designation, Mass, Area, D, B, tw, T, FlangeSlope, R1, R2, Iz, Iy, rz, ry, Zz, Zy, Zpz, Zpy, It, Iw, Source, Type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            obj.Designation, float(obj.Mass), float(obj.Area) / 100.0 if float(obj.Area) > 1000 else float(obj.Area),
                            float(obj.D), float(obj.B), float(obj.tw), float(obj.T),
                            obj.FlangeSlope, float(obj.R1), float(obj.R2),
                            float(obj.Iz), float(obj.Iy), float(obj.rz), float(obj.ry),
                            float(obj.Zz), float(obj.Zy), float(obj.Zpz), float(obj.Zpy),
                            float(obj.It) if obj.It is not None else 0.0,
                            float(obj.Iw) if obj.Iw is not None else 0.0,
                            obj.Source or "Custom", obj.Type or "Rolled"
                        )
                    )
                elif table == "Angles":
                    cursor.execute(
                        """INSERT OR REPLACE INTO Angles 
                        (Designation, Mass, Area, a, b, t, R1, R2, Cz, Cy, Iz, Iy, Alpha, lumax, lvmin, rz, ry, rumax, rvmin, Zz, Zy, Zpz, Zpy, It, Source, Type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            obj.Designation, float(obj.Mass), float(obj.Area) / 100.0 if float(obj.Area) > 1000 else float(obj.Area),
                            float(obj.a), float(obj.b), float(obj.t), float(obj.R1), float(obj.R2),
                            float(obj.Cz), float(obj.Cy), float(obj.Iz), float(obj.Iy),
                            float(obj.Alpha), float(obj.lumax), float(obj.lvmin),
                            float(obj.rz), float(obj.ry), float(obj.rumax), float(obj.rvmin),
                            float(obj.Zz), float(obj.Zy), float(obj.Zpz), float(obj.Zpy),
                            float(obj.It) if obj.It is not None else 0.0,
                            obj.Source or "Custom", obj.Type or "Rolled"
                        )
                    )
                elif table == "Channels":
                    cursor.execute(
                        """INSERT OR REPLACE INTO Channels 
                        (Designation, Mass, Area, D, B, tw, T, FlangeSlope, R1, R2, Cy, Iz, Iy, rz, ry, Zz, Zy, Zpz, Zpy, It, Iw, Source, Type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            obj.Designation, float(obj.Mass), float(obj.Area) / 100.0 if float(obj.Area) > 1000 else float(obj.Area),
                            float(obj.D), float(obj.B), float(obj.tw), float(obj.T),
                            obj.FlangeSlope, float(obj.R1), float(obj.R2),
                            float(obj.Cy), float(obj.Iz), float(obj.Iy),
                            float(obj.rz), float(obj.ry), float(obj.Zz), float(obj.Zy),
                            float(obj.Zpz), float(obj.Zpy),
                            float(obj.It) if obj.It is not None else 0.0,
                            float(obj.Iw) if obj.Iw is not None else 0.0,
                            obj.Source or "Custom", obj.Type or "Rolled"
                        )
                    )

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ensure_custom_sections_in_sqlite] Exception: {e}")


def _merge_table_designations_into_list(lst: List[Any], table: str, user: Any) -> None:
    from apps.sections.models import TABLE_TO_USER_MODEL

    UserModel = TABLE_TO_USER_MODEL[table]
    seen = {str(x) for x in lst}
    for des in (
        UserModel.objects.filter(user=user, is_active=True)
        .values_list("Designation", flat=True)
        .iterator()
    ):
        d = str(des)
        if d not in seen:
            lst.append(d)
            seen.add(d)


def _merge_base_plate_section_designation(lst: List[Any], user: Any) -> None:
    from apps.sections.models import UserCustomBeam, UserCustomColumn

    seen = {str(x) for x in lst}
    for Model in (UserCustomBeam, UserCustomColumn):
        for des in (
            Model.objects.filter(user=user, is_active=True)
            .values_list("Designation", flat=True)
            .iterator()
        ):
            d = str(des)
            if d not in seen:
                lst.append(d)
                seen.add(d)
    lst.sort(key=lambda x: str(x))
