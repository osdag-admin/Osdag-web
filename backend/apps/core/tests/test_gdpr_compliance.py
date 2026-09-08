import time
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from apps.core.models import UserAccount, Project, CustomMaterials

class GDPRComplianceTests(TestCase):
    def setUp(self):
        cache.clear()
        # Create a standard user and user account
        self.user = User.objects.create_user(
            username="test_uid_123",
            email="test@example.com",
            password="testpassword"
        )
        self.user_account = UserAccount.objects.create(
            user=self.user,
            username="test_uid_123",
            email="test@example.com"
        )

    @patch('firebase_admin.auth.verify_id_token')
    @patch('firebase_admin.auth.delete_user')
    def test_delete_account_success(self, mock_delete_user, mock_verify):
        Project.objects.create(
            name="Project Alpha",
            module="Shear Connection",
            submodule="FinPlateConnection",
            inputs_json={"material": "Fe 410"},
            outputs_json={"status": "pass"},
            user_email="test@example.com"
        )
        
        # Setup authentication
        mock_verify.return_value = {
            "uid": "test_uid_123",
            "email": "test@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # Call delete account API
        response = self.client.delete("/api/auth/delete-account/", **headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))

        # Verify DB updates User, UserAccount and associated data are completely purged
        self.assertFalse(User.objects.filter(username="test_uid_123").exists())
        self.assertFalse(UserAccount.objects.filter(username="test_uid_123").exists())
        self.assertFalse(Project.objects.filter(user_email="test@example.com").exists())
        
        # Verify Firebase deletion call
        mock_delete_user.assert_called_once_with("test_uid_123")

    @patch('firebase_admin.auth.verify_id_token')
    def test_data_portability_export(self, mock_verify):
        # Create some projects for the user
        Project.objects.create(
            name="Project Alpha",
            module="Shear Connection",
            submodule="FinPlateConnection",
            inputs_json={"material": "Fe 410"},
            outputs_json={"status": "pass"},
            user_email="test@example.com"
        )
        Project.objects.create(
            name="Project Beta",
            module="Tension Member",
            submodule="LugAngle",
            inputs_json={"material": "Fe 410"},
            outputs_json={"status": "fail"},
            user_email="test@example.com"
        )

        # Create custom material for the user
        CustomMaterials.objects.create(
            user=self.user,
            Grade="Grade E250",
            Yield_Stress_less_than_20=250,
            Yield_Stress_between_20_and_neg40=240,
            Yield_Stress_greater_than_40=230,
            Ultimate_Tensile_Stress=410,
            Elongation=23
        )

        # Mock authentication
        mock_verify.return_value = {
            "uid": "test_uid_123",
            "email": "test@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # Export user data
        response = self.client.get("/api/auth/export-data/", **headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertIn("attachment", response.headers["Content-Disposition"])

        data = response.json()
        self.assertEqual(data.get("user", {}).get("email"), "test@example.com")
        self.assertEqual(data.get("user", {}).get("username"), "test_uid_123")
        
        projects = data.get("projects", [])
        self.assertEqual(len(projects), 2)
        project_names = [p["name"] for p in projects]
        self.assertIn("Project Alpha", project_names)
        self.assertIn("Project Beta", project_names)

        custom_materials = data.get("custom_materials", [])
        self.assertEqual(len(custom_materials), 1)
        self.assertEqual(custom_materials[0]["Grade"], "Grade E250")
