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
