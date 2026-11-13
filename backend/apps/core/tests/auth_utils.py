"""Test helper: authenticate API requests as a given user without a Firebase token."""

from contextlib import contextmanager
from unittest.mock import patch

from apps.core.middleware.firebase_auth import FirebaseAuthentication


@contextmanager
def authenticated_as(user):
    """Make FirebaseAuthentication accept every request as `user` (email verified)."""

    def authenticate(request):
        request.email_verified = True
        return (user, None)

    with patch.object(FirebaseAuthentication, "authenticate", side_effect=authenticate):
        yield
