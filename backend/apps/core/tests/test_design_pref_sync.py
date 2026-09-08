"""
Unit tests for design preference sync merge and HTTP API.
"""

from django.test import TestCase

from apps.core.api.design.sync_merge import merge_design_pref_sync, list_registered_session_names


class DesignPrefSyncMergeTests(TestCase):
    def test_fin_plate_open_copies_dock_material_to_pref_keys(self):
        inputs = {
            "material": "E 250 (Fe 410 W)A",
            "bolt_diameter": "12",
        }
        resolved, meta, _md, _sd = merge_design_pref_sync(
            "FinPlateConnection",
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
            "FinPlateConnection",
            inputs,
            "save",
            design_pref_draft=draft,
            material_model=None,
        )
        self.assertEqual(resolved["connector_material"], "E 350 (Fe 490)")

    def test_reset_applies_driver_sync(self):
        inputs = {"material": "E 165 (Fe 290)"}
        resolved, _meta, _md, _sd = merge_design_pref_sync(
            "FinPlateConnection",
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
        self.assertIn("FinPlateConnection", names)
        self.assertIn("Purlin Design", names)


class DesignPrefSyncAPITests(TestCase):
    def test_defaults_post_returns_default_payload(self):
        body = {
            "module_session_name": "FinPlateConnection",
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
            "module_session_name": "FinPlateConnection",
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
                "module_session_name": "FinPlateConnection",
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
