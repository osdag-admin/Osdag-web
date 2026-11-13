from django.contrib.auth.models import User
from django.test import TestCase

from apps.core import catalog
from apps.core.models import CustomMaterials
from apps.core.tests.auth_utils import authenticated_as

URL = "/api/materialDetails/"


def strengths(**extra):
    return dict(
        Yield_Stress_less_than_20=300, Yield_Stress_between_20_and_neg40=290,
        Yield_Stress_greater_than_40=280, Ultimate_Tensile_Stress=450, Elongation=0, **extra,
    )


class MaterialDetailsListTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        CustomMaterials.objects.create(user=self.user, Grade="Mine 1", **strengths())

    def test_guest_gets_catalog_grades_then_the_custom_sentinel(self):
        data = self.client.get(URL).json()
        grades = [m["Grade"] for m in data["materialList"]]
        self.assertEqual(grades, [m["Grade"] for m in catalog.rows("Material")] + ["Custom"])
        self.assertEqual(data["materialList"][-1], {"id": -1, "Grade": "Custom"})
        self.assertEqual(data["custom_materials"], [])
        self.assertEqual(data["material_details"][1]["Ultimate_Tensile_Stress"], 410)

    def test_signed_in_user_gets_own_grades_between_catalog_and_sentinel(self):
        with authenticated_as(self.user):
            data = self.client.get(URL).json()
        grades = [m["Grade"] for m in data["materialList"]]
        self.assertEqual(grades[-2:], ["Mine 1", "Custom"])
        self.assertEqual(len(grades), len(catalog.rows("Material")) + 2)
        self.assertEqual([m["Grade"] for m in data["custom_materials"]], ["Mine 1"])

    def test_material_filter_returns_one_catalog_grade(self):
        data = self.client.get(URL, {"material": "E 250 (Fe 410 W)A"}).json()
        self.assertEqual([m["Grade"] for m in data["material_details"]], ["E 250 (Fe 410 W)A"])


class MaterialDetailsConflictTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        self.first = CustomMaterials.objects.create(user=self.user, Grade="Mine 1", **strengths())
        self.second = CustomMaterials.objects.create(user=self.user, Grade="Mine 2", **strengths())

    def put(self, material, grade):
        with authenticated_as(self.user):
            return self.client.put(
                f"{URL}{material.pk}/", data={"Grade": grade}, content_type="application/json",
            )

    def test_post_with_catalog_grade_is_rejected(self):
        body = {"materialName": "E 250 (Fe 410 W)A", "fy_20": 300, "fy_20_40": 290, "fy_40": 280, "fu": 450}
        with authenticated_as(self.user):
            r = self.client.post(URL, data=body, content_type="application/json")
        self.assertEqual(r.status_code, 403)
        self.assertFalse(CustomMaterials.objects.filter(Grade="E 250 (Fe 410 W)A").exists())

    def test_post_with_new_grade_is_created(self):
        body = {"materialName": "Mine 3", "fy_20": 300, "fy_20_40": 290, "fy_40": 280, "fu": 450}
        with authenticated_as(self.user):
            r = self.client.post(URL, data=body, content_type="application/json")
        self.assertEqual(r.status_code, 201)

    def test_rename_to_catalog_grade_is_rejected(self):
        self.assertEqual(self.put(self.first, "E 250 (Fe 410 W)A").status_code, 403)
        self.first.refresh_from_db()
        self.assertEqual(self.first.Grade, "Mine 1")

    def test_rename_to_another_own_grade_is_rejected(self):
        self.assertEqual(self.put(self.first, "Mine 2").status_code, 403)

    def test_normal_rename_works(self):
        self.assertEqual(self.put(self.first, "Renamed").status_code, 200)
        self.first.refresh_from_db()
        self.assertEqual(self.first.Grade, "Renamed")

    def test_update_keeping_the_same_grade_works(self):
        self.assertEqual(self.put(self.first, "Mine 1").status_code, 200)
