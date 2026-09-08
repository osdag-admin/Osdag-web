import time
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.cache import cache

class EmailVerificationTests(TestCase):
    def setUp(self):
        # Clear cache before each test to ensure mock tokens aren't cached between tests
        cache.clear()

    @patch('firebase_admin.auth.verify_id_token')
    def test_unauthenticated_guest_access(self, mock_verify):
        # 1. Project API list -> should fail (401 Unauthorized because user is not authenticated)
        r = self.client.get("/api/projects/")
        self.assertEqual(r.status_code, 401)

        # 2. Save OSI as guest (no auth header, inline=True) -> should succeed
        osi_data = {
            "name": "Test Project",
            "module_id": "FinPlateConnection",
            "inputs": {"material": "E 250 (Fe 410 W)A"},
            "inline": True
        }
        r = self.client.post("/api/save-osi-from-inputs/", data=osi_data, content_type="application/json")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json().get("success"))

    @patch('firebase_admin.auth.verify_id_token')
    def test_authenticated_unverified_email_blocked(self, mock_verify):
        # Mock Firebase to return authenticated but unverified token
        mock_verify.return_value = {
            "uid": "user_unverified_123",
            "email": "unverified@example.com",
            "email_verified": False,
            "exp": int(time.time()) + 3600
        }

        headers = {"HTTP_AUTHORIZATION": "Bearer fake_unverified_token"}

        # 1. Project API list -> should return 403 Forbidden
        r = self.client.get("/api/projects/", **headers)
        self.assertEqual(r.status_code, 403)
        self.assertIn("verify your email", r.json().get("detail", ""))

        # 2. Save OSI even with inline=True -> should return 403 Forbidden
        osi_data = {
            "name": "Test Project",
            "module_id": "FinPlateConnection",
            "inputs": {"material": "E 250 (Fe 410 W)A"},
            "inline": True
        }
        r = self.client.post("/api/save-osi-from-inputs/", data=osi_data, content_type="application/json", **headers)
        self.assertEqual(r.status_code, 403)
        self.assertIn("verify your email", r.json().get("detail", ""))

        # 3. Design Preference Sync -> should return 403 Forbidden
        sync_data = {
            "module_session_name": "FinPlateConnection",
            "inputs": {"material": "E 250 (Fe 410 W)A"},
            "operation": "open"
        }
        r = self.client.post("/api/design-preferences/sync/", data=sync_data, content_type="application/json", **headers)
        self.assertEqual(r.status_code, 403)
        self.assertIn("verify your email", r.json().get("detail", ""))

    @patch('firebase_admin.auth.verify_id_token')
    def test_authenticated_verified_email_allowed(self, mock_verify):
        # Mock Firebase to return authenticated and verified token
        mock_verify.return_value = {
            "uid": "user_verified_123",
            "email": "verified@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }

        headers = {"HTTP_AUTHORIZATION": "Bearer fake_verified_token"}

        # 1. Project API list -> should succeed with 200 OK (returns empty projects list)
        r = self.client.get("/api/projects/", **headers)
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json().get("success"))

        # 2. Save OSI -> should succeed with 201 Created
        osi_data = {
            "name": "Test Project",
            "module_id": "FinPlateConnection",
            "inputs": {"material": "E 250 (Fe 410 W)A"}
        }
        r = self.client.post("/api/save-osi-from-inputs/", data=osi_data, content_type="application/json", **headers)
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json().get("success"))
