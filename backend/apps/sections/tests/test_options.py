from django.contrib.auth.models import User
from django.test import TestCase

from apps.core import catalog
from apps.core.tests.auth_utils import authenticated_as
from apps.core.tests.test_osdag_overrides import make_beam

URL = "/api/modules/shear-connection/fin-plate/options/"


class OptionsCatalogTests(TestCase):
    """Dropdown lists are the SQLite catalog's designations plus the signed-in user's own."""

    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")

    def test_guest_gets_catalog_designations_once_each_in_catalog_order(self):
        data = self.client.get(URL).json()
        self.assertEqual(data["beamList"], catalog.designations("Beams"))
        self.assertEqual(data["columnList"], catalog.designations("Columns"))
        self.assertEqual(len(data["beamList"]), len(set(data["beamList"])))
        self.assertEqual(data["beamList"].count("WB 200"), 1)

    def test_guest_gets_catalog_bolt_diameters_and_materials(self):
        data = self.client.get(URL).json()
        self.assertEqual(data["boltDiameterList"], catalog.bolt_diameters())
        self.assertEqual(data["materialList"][-1], {"id": -1, "Grade": "Custom"})
        self.assertEqual(data["materialList"][0]["Grade"], "E 165 (Fe 290)")
        self.assertEqual(data["materialList"][0]["Yield_Stress_less_than_20"], 165)

    def test_signed_in_user_also_gets_own_designations_after_the_catalog(self):
        make_beam(self.user, designation="MY 200")
        with authenticated_as(self.user):
            data = self.client.get(URL).json()
        self.assertEqual(data["beamList"], catalog.designations("Beams") + ["MY 200"])
        self.assertEqual(data["columnList"], catalog.designations("Columns"))

    def test_own_designation_equal_to_a_catalog_one_is_not_listed_twice(self):
        make_beam(self.user, designation="MB 300")
        with authenticated_as(self.user):
            data = self.client.get(URL).json()
        self.assertEqual(data["beamList"], catalog.designations("Beams"))

    def test_other_users_designations_are_not_listed(self):
        make_beam(self.user, designation="MY 200")
        with authenticated_as(User.objects.create_user(username="u2", email="u2@example.com", password="x")):
            data = self.client.get(URL).json()
        self.assertNotIn("MY 200", data["beamList"])

    def test_base_plate_lists_beams_and_columns_together(self):
        data = self.client.get("/api/modules/base-plate/options/").json()
        expected = sorted(set(catalog.designations("Beams")) | set(catalog.designations("Columns")))
        self.assertEqual(data["sectionDesignation"], expected)
