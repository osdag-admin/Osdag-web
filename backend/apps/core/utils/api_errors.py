"""
One error format for every API response.

    {"error": {"code": "<snake_case>", "message": "<human readable>",
               "fields": {"<key>": "<message>"}}}

``fields`` is optional and keyed by the input key the message belongs to, so a
client can map it back to a form field.

- Use ``error_response`` in DRF views and ``error_json_response`` in plain
  Django views, instead of building ``{'error': ...}`` dicts by hand.
- ``exception_handler`` is wired up as ``REST_FRAMEWORK['EXCEPTION_HANDLER']``
  and turns DRF exceptions and the ``OsdagApiException`` family into the same
  shape. Anything else becomes a generic 500 (no traceback or exception text
  is returned).

Celery task results (``{'success': False, 'error': msg}`` sent over the task
WebSocket or ``/api/tasks/<id>/``) are a separate channel and keep their own
shape.
"""
import logging
from typing import Any, Dict, Optional

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404, JsonResponse
from rest_framework import exceptions as drf_exceptions
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from .errors import (
    InvalidInputTypeError,
    MissingKeyError,
    OsdagApiException,
    RangeValidationError,
    ValidationError as OsdagValidationError,
)

logger = logging.getLogger(__name__)

INTERNAL_ERROR_MESSAGE = "An unexpected error occurred."


def error_payload(
    code: str,
    message: str,
    fields: Optional[Dict[str, str]] = None,
    **extra: Any,
) -> Dict[str, Any]:
    """Build the error body. ``extra`` adds top-level keys next to ``error``
    (only for legacy flags such as ``success: False`` that clients still read)."""
    error: Dict[str, Any] = {"code": code, "message": str(message)}
    if fields:
        error["fields"] = {str(k): str(v) for k, v in fields.items()}
    return {"error": error, **extra}


def error_response(
    code: str,
    message: str,
    status: int,
    fields: Optional[Dict[str, str]] = None,
    headers: Optional[Dict[str, str]] = None,
    **extra: Any,
) -> Response:
    """DRF ``Response`` in the standard error format."""
    return Response(error_payload(code, message, fields, **extra), status=status, headers=headers)


def error_json_response(
    code: str,
    message: str,
    status: int,
    fields: Optional[Dict[str, str]] = None,
    **extra: Any,
) -> JsonResponse:
    """``JsonResponse`` in the standard error format, for plain Django views."""
    return JsonResponse(error_payload(code, message, fields, **extra), status=status)


def flatten_validation_errors(detail: Any, prefix: str = "") -> Dict[str, str]:
    """Flatten a DRF ValidationError detail into ``{field: message}``.

    Nested dicts use dotted keys; messages in a list are joined; errors that do
    not belong to a field (``non_field_errors`` or a bare list) use the key
    ``non_field_errors``.
    """
    if isinstance(detail, dict):
        out: Dict[str, str] = {}
        for key, value in detail.items():
            out.update(flatten_validation_errors(value, f"{prefix}.{key}" if prefix else str(key)))
        return out
    if isinstance(detail, (list, tuple)):
        if any(isinstance(item, dict) for item in detail):
            # list of nested serializers: key by index
            out = {}
            for index, item in enumerate(detail):
                if item:
                    out.update(flatten_validation_errors(item, f"{prefix}.{index}" if prefix else str(index)))
            return out
        messages = [str(item) for item in detail]
        return {prefix or "non_field_errors": " ".join(messages)}
    return {prefix or "non_field_errors": str(detail)}


def _message_from_fields(fields: Dict[str, str]) -> str:
    if len(fields) == 1:
        (key, msg), = fields.items()
        return msg if key == "non_field_errors" else f"{key}: {msg}"
    return "Invalid input."


def _osdag_exception_response(exc: OsdagApiException) -> Response:
    if isinstance(exc, MissingKeyError):
        return error_response("missing_key", str(exc), 400, fields={exc.key: str(exc)})
    if isinstance(exc, InvalidInputTypeError):
        return error_response("invalid_type", str(exc), 400, fields={exc.key: str(exc)})
    if isinstance(exc, RangeValidationError):
        return error_response("out_of_range", str(exc), 400, fields={exc.field: str(exc)})
    if isinstance(exc, OsdagValidationError):
        fields = {
            str(e.get("field", "non_field_errors")): str(e.get("message", ""))
            for e in exc.errors
        }
        return error_response("validation_error", str(exc), 400, fields=fields)
    return error_response("invalid_input", str(exc), 400)


def exception_handler(exc: Exception, context: Dict[str, Any]) -> Response:
    """DRF ``EXCEPTION_HANDLER`` that returns the standard error format."""
    if isinstance(exc, OsdagApiException):
        return _osdag_exception_response(exc)

    # DRF's own handler converts Http404 / PermissionDenied and sets headers
    # (WWW-Authenticate, Retry-After) and the DB rollback.
    response = drf_exception_handler(exc, context)
    if response is None:
        logger.exception("Unhandled exception in %s", context.get("view"), exc_info=exc)
        return error_response("internal_error", INTERNAL_ERROR_MESSAGE, 500)

    if isinstance(exc, drf_exceptions.ValidationError):
        fields = flatten_validation_errors(exc.detail)
        return error_response(
            "validation_error", _message_from_fields(fields), response.status_code, fields=fields
        )

    if isinstance(exc, Http404):
        code = "not_found"
    elif isinstance(exc, DjangoPermissionDenied):
        code = "permission_denied"
    elif isinstance(exc, drf_exceptions.APIException):
        code = exc.default_code
    else:
        code = "error"

    data = response.data
    message = data.get("detail") if isinstance(data, dict) else None
    new = error_response(code, message or str(exc), response.status_code)
    for header, value in response.items():
        if header.lower() != "content-type":
            new[header] = value
    return new
