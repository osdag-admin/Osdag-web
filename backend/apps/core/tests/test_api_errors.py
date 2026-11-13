"""Tests for the standard API error format. No database needed."""
from django.http import Http404
from django.test import SimpleTestCase
from rest_framework import exceptions as drf
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView

from apps.core.utils.api_errors import (
    error_json_response,
    error_payload,
    error_response,
    exception_handler,
)
from apps.core.utils.errors import (
    InvalidInputTypeError,
    MissingKeyError,
    RangeValidationError,
)


def _view_raising(exc):
    class V(APIView):
        authentication_classes = []
        permission_classes = []

        def get(self, request):
            raise exc

    return V.as_view()


def _call(exc):
    response = _view_raising(exc)(APIRequestFactory().get("/x/"))
    response.render()
    return response


class ErrorHelperTests(SimpleTestCase):
    def test_payload_without_fields(self):
        self.assertEqual(
            error_payload("bad", "Bad"), {"error": {"code": "bad", "message": "Bad"}}
        )

    def test_payload_with_fields_and_extra(self):
        body = error_payload("bad", "Bad", {"a": "x"}, success=False)
        self.assertEqual(body["error"]["fields"], {"a": "x"})
        self.assertIs(body["success"], False)

    def test_error_response_and_json_response(self):
        r = error_response("bad", "Bad", 400)
        self.assertIsInstance(r, Response)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.data["error"]["code"], "bad")
        j = error_json_response("gone", "Gone", 404)
        self.assertEqual(j.status_code, 404)
        self.assertIn(b'"code": "gone"', j.content)


class ExceptionHandlerTests(SimpleTestCase):
    def test_drf_validation_error_fields(self):
        r = _call(drf.ValidationError({"Bolt.Diameter": ["Required.", "Must be a number."]}))
        self.assertEqual(r.status_code, 400)
        err = r.data["error"]
        self.assertEqual(err["code"], "validation_error")
        self.assertEqual(err["fields"], {"Bolt.Diameter": "Required. Must be a number."})

    def test_drf_validation_error_non_field(self):
        r = _call(drf.ValidationError("Nope"))
        err = r.data["error"]
        self.assertEqual(err["message"], "Nope")
        self.assertEqual(err["fields"], {"non_field_errors": "Nope"})

    def test_drf_nested_validation_error_uses_dotted_keys(self):
        r = _call(drf.ValidationError({"a": {"b": ["bad"]}}))
        self.assertEqual(r.data["error"]["fields"], {"a.b": "bad"})

    def test_missing_key_error(self):
        r = _call(MissingKeyError("Bolt.Diameter"))
        self.assertEqual(r.status_code, 400)
        err = r.data["error"]
        self.assertEqual(err["code"], "missing_key")
        self.assertEqual(err["message"], "Please specify Bolt.Diameter in input values.")
        self.assertEqual(err["fields"], {"Bolt.Diameter": err["message"]})

    def test_invalid_input_type_error(self):
        r = _call(InvalidInputTypeError("Bolt.Grade", "list"))
        err = r.data["error"]
        self.assertEqual((r.status_code, err["code"]), (400, "invalid_type"))
        self.assertIn("Bolt.Grade", err["fields"])

    def test_range_validation_error(self):
        r = _call(RangeValidationError("Load.Shear", -1, min_val=0))
        err = r.data["error"]
        self.assertEqual(err["code"], "out_of_range")
        self.assertIn("Load.Shear", err["fields"])

    def test_not_found(self):
        r = _call(drf.NotFound("No such thing."))
        self.assertEqual(r.status_code, 404)
        self.assertEqual(r.data["error"]["code"], "not_found")
        self.assertEqual(r.data["error"]["message"], "No such thing.")

    def test_django_http404(self):
        r = _call(Http404())
        self.assertEqual(r.status_code, 404)
        self.assertEqual(r.data["error"]["code"], "not_found")

    def test_not_authenticated_and_permission_denied(self):
        r = _call(drf.NotAuthenticated())
        self.assertEqual(r.data["error"]["code"], "not_authenticated")
        r = _call(drf.PermissionDenied("Verify your email."))
        self.assertEqual(r.status_code, 403)
        self.assertEqual(r.data["error"]["code"], "permission_denied")
        self.assertEqual(r.data["error"]["message"], "Verify your email.")

    def test_throttled_keeps_retry_after_header(self):
        r = _call(drf.Throttled(wait=30))
        self.assertEqual(r.status_code, 429)
        self.assertEqual(r.data["error"]["code"], "throttled")
        self.assertEqual(r["Retry-After"], "30")

    def test_unhandled_exception_is_generic_500(self):
        with self.assertLogs("apps.core.utils.api_errors", level="ERROR"):
            r = exception_handler(RuntimeError("secret internals"), {"view": None})
        self.assertEqual(r.status_code, 500)
        self.assertEqual(r.data["error"]["code"], "internal_error")
        self.assertNotIn("secret", str(r.data))
