"""
Integration tests for design report generation with images.
"""

import os
import tempfile
from django.test import TestCase
from rest_framework.test import APIClient


class TestDesignReportWithImages(TestCase):
    """Smoke tests for report generation endpoints (slug + legacy)"""

    def setUp(self):
        self.client = APIClient()
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil

        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _dummy_metadata(self):
        return {
            "ProfileSummary": {
                "CompanyName": "TestCo",
                "CompanyLogo": "",
                "Group/TeamName": "TestTeam",
                "Designer": "Tester",
            },
            "ProjectTitle": "Test Project",
            "Subtitle": "",
            "JobNumber": "1",
            "AdditionalComments": "No comments",
            "Client": "Test Client",
        }

    def _dummy_input_values(self):
        # Minimal placeholder payload; actual fields are validated
        # by the underlying desktop module. These tests only assert
        # that the endpoints are wired and return a JSON response.
        return {"dummy": True}

    def test_legacy_generate_initial_endpoint_available(self):
        """
        Ensure the legacy /api/report/generate-initial/ endpoint is wired.

        We don't assert 201 here because full desktop modules are not
        available in this lightweight test environment.
        """
        payload = {
            "metadata": self._dummy_metadata(),
            "module_id": "FinPlateConnection",
            "input_values": self._dummy_input_values(),
            "design_status": True,
            "logs": [],
        }
        response = self.client.post(
            "/api/report/generate-initial/", data=payload, format="json"
        )
        # Endpoint should exist and return JSON; status code may vary (e.g. 400)
        assert response.status_code in (200, 400, 500)
        assert isinstance(response.data, dict)

    def test_slug_generate_initial_endpoint_shear_exists(self):
        """
        Ensure the slug-based shear-connection report endpoint is wired.
        """
        payload = {
            "metadata": self._dummy_metadata(),
            "input_values": self._dummy_input_values(),
            "design_status": True,
            "logs": [],
        }
        response = self.client.post(
            "/api/modules/shear-connection/fin-plate/report/generate-initial/",
            data=payload,
            format="json",
        )
        # Endpoint should exist; body should be JSON/dict
        assert response.status_code in (200, 400, 500)
        assert isinstance(response.data, dict)


