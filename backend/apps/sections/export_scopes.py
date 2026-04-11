"""
Extensible export handlers: `scope` query param → callable(table, user) → FileResponse.
"""

from __future__ import annotations

from io import BytesIO
from typing import Any, Callable, Dict, List

from django.http import FileResponse

from apps.sections.validation import get_db_header, get_user_model_for_table

# Increase only when product adds `global` / `effective` handlers.
EXPORT_SCOPE_REGISTRY: Dict[str, Callable[..., FileResponse]] = {}


def register_export_scope(name: str, handler: Callable[..., FileResponse]) -> None:
    EXPORT_SCOPE_REGISTRY[name] = handler


def build_user_scope_xlsx(table: str, user: Any) -> FileResponse:
    """Export current user's custom rows for `table` (v1 `scope=user`)."""
    from openpyxl import Workbook

    headers = get_db_header(table)
    UserModel = get_user_model_for_table(table)
    qs = UserModel.objects.filter(user=user, is_active=True).order_by("id")

    wb = Workbook()
    ws = wb.active
    ws.title = table
    ws.append(headers)
    for obj in qs.iterator(chunk_size=500):
        ws.append([getattr(obj, h) for h in headers])

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    filename = f"{table}_UserCustom_Export.xlsx"
    return FileResponse(
        buf,
        as_attachment=True,
        filename=filename,
        content_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
    )


def _register_defaults() -> None:
    register_export_scope("user", build_user_scope_xlsx)


_register_defaults()


def get_allowed_export_scopes() -> List[str]:
    return sorted(EXPORT_SCOPE_REGISTRY.keys())
