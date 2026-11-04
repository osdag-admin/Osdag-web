"""
Unit tests for design preference sync merge and HTTP API.
"""

from django.contrib.auth.models import User
from django.test import TestCase

from apps.core.api.design.sync_merge import lookup_sources, merge_design_pref_sync, list_registered_session_names
from apps.core.models import CustomMaterials
from apps.core.tests.auth_utils import authenticated_as
from apps.core.tests.test_osdag_overrides import make_beam


class DesignPrefSyncMergeTests(TestCase):
    def test_fin_plate_open_copies_dock_material_to_pref_keys(self):
        inputs = {
            "material": "E 250 (Fe 410 W)A",
            "bolt_diameter": "12",
        }
        resolved, meta, _md, _sd = merge_design_pref_sync(
            "Fin Plate Connection",
            inputs,
            "open",
            design_pref_draft=None,
            material_model=None,
        )
        self.assertEqual(resolved["supporting_material"], "E 250 (Fe 410 W)A")
        self.assertEqual(resolved["supported_material"], "E 250 (Fe 410 W)A")
        self.assertEqual(resolved["connector_material"], "E 250 (Fe 410 W)A")
        self.assertIn("material", meta["copied_from_input_dock_keys"])

    def test_save_preserves_draft_overrides_without_forcing_dock_resync(self):
        inputs = {
            "material": "E 250 (Fe 410 W)A",
            "supporting_material": "E 250 (Fe 410 W)A",
            "supported_material": "E 250 (Fe 410 W)A",
            "connector_material": "E 250 (Fe 410 W)A",
        }
        draft = {"connector_material": "E 350 (Fe 490)"}
        resolved, _meta, _md, _sd = merge_design_pref_sync(
            "Fin Plate Connection",
            inputs,
            "save",
            design_pref_draft=draft,
            material_model=None,
        )
        self.assertEqual(resolved["connector_material"], "E 350 (Fe 490)")

    def test_reset_applies_driver_sync(self):
        inputs = {"material": "E 165 (Fe 290)"}
        resolved, _meta, _md, _sd = merge_design_pref_sync(
            "Fin Plate Connection",
            inputs,
            "reset",
            design_pref_draft=None,
            material_model=None,
        )
        self.assertEqual(resolved["connector_material"], "E 165 (Fe 290)")
        self.assertIn("linked_pref_keys", _meta)
        self.assertIn("connector_material", _meta["linked_pref_keys"])

    def test_mapping_covers_all_registered_names(self):
        names = list_registered_session_names()
        self.assertIn("Fin Plate Connection", names)
        self.assertIn("Purlin Design", names)


class DesignPrefSyncAPITests(TestCase):
    def test_defaults_post_returns_default_payload(self):
        body = {
            "module_session_name": "Fin Plate Connection",
            "inputs": {"material": "E 250 (Fe 410 W)A"},
        }
        r = self.client.post(
            "/api/design-preferences/defaults/",
            data=body,
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(data.get("success"))
        self.assertIn("default_pref_inputs", data)
        self.assertIn("metadata", data)
        self.assertIn("material_details", data)

    def test_sync_post_returns_resolved_payload(self):
        body = {
            "module_session_name": "Fin Plate Connection",
            "inputs": {"material": "E 250 (Fe 410 W)A"},
            "operation": "open",
        }
        r = self.client.post(
            "/api/design-preferences/sync/",
            data=body,
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(data.get("success"))
        self.assertIn("resolved_inputs", data)
        self.assertIn("metadata", data)
        self.assertIn("material_details", data)
        self.assertIn("copied_from_input_dock_keys", data["metadata"])
        self.assertIn("linked_pref_keys", data["metadata"])

    def test_sync_rejects_bad_operation(self):
        r = self.client.post(
            "/api/design-preferences/sync/",
            data={
                "module_session_name": "Fin Plate Connection",
                "inputs": {},
                "operation": "not-an-operation",
            },
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 400)

    def test_sync_requires_module(self):
        r = self.client.post(
            "/api/design-preferences/sync/",
            data={"inputs": {}, "operation": "open"},
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 400)


class DesignPrefCustomRowsTests(TestCase):
    """Custom sections and materials reach the design preference dialog for their owner only."""

    INPUTS = {"material": "My Steel", "section_designation": ["MY 200"]}

    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        self.other = User.objects.create_user(username="u2", email="u2@example.com", password="x")
        make_beam(self.user, mass=30.0)
        CustomMaterials.objects.create(
            user=self.user, Grade="My Steel", Yield_Stress_less_than_20=300,
            Yield_Stress_between_20_and_neg40=290, Yield_Stress_greater_than_40=280,
            Ultimate_Tensile_Stress=450, Elongation=0,
        )

    def merge(self, user):
        return merge_design_pref_sync(
            "Simply Supported Beam Design", self.INPUTS, "open", **lookup_sources(user),
        )

    def test_owner_gets_custom_rows(self):
        _resolved, _meta, material_details, section_details = self.merge(self.user)
        self.assertEqual(section_details["supporting"]["Designation"], "MY 200")
        self.assertEqual(float(section_details["supporting"]["Mass"]), 30.0)
        self.assertEqual(material_details["connector"][0]["Grade"], "My Steel")
        self.assertEqual(material_details["connector"][0]["Ultimate_Tensile_Stress"], 450)

    def test_other_user_and_guest_get_nothing(self):
        for user in (self.other, None):
            _resolved, _meta, material_details, section_details = self.merge(user)
            self.assertEqual(section_details["supporting"], {})
            self.assertEqual(material_details["connector"], [])

    def test_sync_api_returns_custom_details(self):
        body = {"module_session_name": "Simply Supported Beam Design", "inputs": self.INPUTS, "operation": "open"}
        with authenticated_as(self.user):
            r = self.client.post("/api/design-preferences/sync/", data=body, content_type="application/json")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["section_details"]["supporting"]["Designation"], "MY 200")
        self.assertEqual(data["material_details"]["connector"][0]["Grade"], "My Steel")

    def test_defaults_api_returns_custom_details(self):
        body = {"module_session_name": "Simply Supported Beam Design", "inputs": self.INPUTS}
        with authenticated_as(self.user):
            r = self.client.post("/api/design-preferences/defaults/", data=body, content_type="application/json")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["section_details"]["supporting"]["Designation"], "MY 200")
        self.assertEqual(data["material_details"]["connector"][0]["Grade"], "My Steel")


class DesignPrefCatalogTests(TestCase):
    """Without custom rows, section and material details come from the SQLite catalog."""

    INPUTS = {"material": "E 250 (Fe 410 W)A", "section_designation": ["MB 300"]}

    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")

    def merge(self, user):
        return merge_design_pref_sync(
            "Simply Supported Beam Design", self.INPUTS, "open", **lookup_sources(user),
        )

    def test_guest_gets_catalog_rows(self):
        _resolved, _meta, material_details, section_details = self.merge(None)
        self.assertEqual(section_details["supporting"]["Designation"], "MB 300")
        self.assertAlmostEqual(section_details["supporting"]["Mass"], 46.02)
        self.assertEqual(material_details["connector"][0]["Grade"], "E 250 (Fe 410 W)A")
        self.assertEqual(material_details["connector"][0]["Yield_Stress_less_than_20"], 250)

    def test_custom_row_wins_over_catalog_row_of_the_same_designation(self):
        make_beam(self.user, designation="MB 300", mass=99.0)
        _resolved, _meta, _md, section_details = self.merge(self.user)
        self.assertEqual(float(section_details["supporting"]["Mass"]), 99.0)

    def test_catalog_row_is_found_after_the_users_rows(self):
        make_beam(self.user, designation="MY 200")
        _resolved, _meta, _md, section_details = self.merge(self.user)
        self.assertAlmostEqual(section_details["supporting"]["Mass"], 46.02)

    def test_design_preferences_api_returns_catalog_row(self):
        r = self.client.get("/api/design-preferences/", {"section_type": "angles", "supported_section": "20 x 20 x 3"})
        self.assertEqual(r.status_code, 200)
        row = r.json()["supported_section_results"][0]
        self.assertEqual(row["Designation"], "20 x 20 x 3")
        self.assertEqual(row["It"], 0.033)
        self.assertIn("lumax", row)
