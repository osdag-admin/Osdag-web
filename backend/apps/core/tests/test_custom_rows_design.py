"""Custom sections and materials in the module APIs and the design task."""

from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase

from apps.core.models import CustomMaterials
from apps.core.osdag_overrides import SECTION_COLUMNS
from apps.core.tasks import run_design_calculation_task
from apps.core.tests.auth_utils import authenticated_as
from apps.modules.flexure_member.submodules.plate_girder.service import PlateGirderService
from apps.sections.models import UserCustomBeam
from osdag_core.Common import fetch_row

DESIGN_URL = "/api/modules/flexure-member/simply-supported-beam/design/"
CATALOG_GRADE = "E 250 (Fe 410 W)A"
CUSTOM_GRADE = "Cus_300_290_280_450"  # fy 300 / fu 450 (catalog grade is 250 / 410)

BEAM_INPUTS = {
    "Module": "Flexural Members - Simply Supported", "Member.Profile": "Beams and Columns",
    "Member.Designation": ["MB 400"], "Material": CATALOG_GRADE, "Member.Material": CATALOG_GRADE,
    "Design.Design_Method": "Limit State Design", "Optimum.Class": "Yes",
    "Effective.Area_Para": "1.0", "Length.Overwrite": "NA", "Bearing.Length": "NA",
    "Load.Shear": "50", "Load.Moment": "100", "Member.Length": "6000",
    "Flexure.Type": "Major Laterally Supported", "Flexure.Support": "Simply Supported",
    "Torsion.restraint": "Fully Restrained", "Warping.restraint": "Both flanges fully restrained",
    "Loading.Condition": "Normal",
}


class UnknownMaterialTriggerTests(TestCase):
    def test_unknown_material_is_a_400_and_nothing_is_enqueued(self):
        inputs = dict(BEAM_INPUTS, Material="Deleted Steel", **{"Member.Material": "Deleted Steel"})
        with patch.object(run_design_calculation_task, "delay") as delay:
            r = self.client.post(DESIGN_URL, data={"inputs": inputs}, content_type="application/json")
        self.assertEqual(r.status_code, 400)
        self.assertFalse(r.json()["success"])
        self.assertIn("Deleted Steel", r.json()["error"]["message"])
        delay.assert_not_called()


class CustomRowsDesignTests(TestCase):
    """A real Simply Supported Beam design through the API, with Celery running eagerly."""

    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        # A copy of catalog MB 400 under a new name and a different mass.
        row = dict(zip(SECTION_COLUMNS["Beams"], fetch_row("Beams", "MB 400")[1:]))
        row.update(Designation="MY 400", Mass=99.0, Source="")
        UserCustomBeam.objects.create(user=self.user, **row)

    def design(self, **overrides):
        """POST the design and return the task's result (eager results are not stored by Celery)."""
        results = []

        def delay(**kwargs):
            results.append(run_design_calculation_task.apply(kwargs=kwargs))
            return results[-1]

        inputs = dict(BEAM_INPUTS, **overrides)
        with authenticated_as(self.user), patch.object(run_design_calculation_task, "delay", side_effect=delay):
            r = self.client.post(DESIGN_URL, data={"inputs": inputs}, content_type="application/json")
        self.assertEqual(r.status_code, 202)
        return results[0].result

    def moment_strength(self, result):
        return result["data"]["Moment.Strength"]["val"]

    def test_catalog_run_baseline(self):
        result = self.design()
        self.assertTrue(result["design_status"])
        self.assertEqual(result["data"]["Optimum.Designation"]["val"], "MB 400")
        self.assertAlmostEqual(self.moment_strength(result), 265.91, places=2)

    def test_custom_beam_is_designed(self):
        result = self.design(**{"Member.Designation": ["MY 400"]})
        self.assertTrue(result["design_status"])
        self.assertEqual(result["data"]["Optimum.Designation"]["val"], "MY 400")

    def test_unknown_designation_fails_the_design(self):
        result = self.design(**{"Member.Designation": ["NO 400"]})
        self.assertFalse(result["design_status"])
        self.assertEqual(result["data"], {})

    def test_custom_grade_name_sets_the_strength(self):
        result = self.design(Material=CUSTOM_GRADE, **{"Member.Material": CUSTOM_GRADE})
        self.assertTrue(result["design_status"])
        # Plastic moment capacity scales with fy: 300 / 250 of the catalog run.
        self.assertAlmostEqual(self.moment_strength(result), 265.91 * 300 / 250, places=1)

    def test_custom_beam_and_custom_grade_together(self):
        result = self.design(Material=CUSTOM_GRADE, **{"Member.Material": CUSTOM_GRADE, "Member.Designation": ["MY 400"]})
        self.assertTrue(result["design_status"])
        self.assertEqual(result["data"]["Optimum.Designation"]["val"], "MY 400")
        self.assertAlmostEqual(self.moment_strength(result), 265.91 * 300 / 250, places=1)

    def test_custom_beam_is_not_visible_to_another_user(self):
        other = User.objects.create_user(username="u2", email="u2@example.com", password="x")
        self.user = other
        result = self.design(**{"Member.Designation": ["MY 400"]})
        self.assertFalse(result["design_status"])


class PlateGirderOptionsTests(TestCase):
    def test_options_list_only_the_requesting_users_custom_materials(self):
        user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        other = User.objects.create_user(username="u2", email="u2@example.com", password="x")
        for owner, grade in ((user, "My Steel"), (other, "Their Steel")):
            CustomMaterials.objects.create(
                user=owner, Grade=grade, Yield_Stress_less_than_20=300,
                Yield_Stress_between_20_and_neg40=290, Yield_Stress_greater_than_40=280,
                Ultimate_Tensile_Stress=450, Elongation=0,
            )

        class Request:
            pass

        request = Request()
        request.user = user
        grades = [m["Grade"] for m in PlateGirderService.get_options(request)["materialList"]]
        self.assertIn("My Steel", grades)
        self.assertNotIn("Their Steel", grades)

        request.user = None
        grades = [m["Grade"] for m in PlateGirderService.get_options(request)["materialList"]]
        self.assertNotIn("My Steel", grades)
