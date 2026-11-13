from django.contrib.auth.models import User
from django.test import TestCase

from apps.core.models import CustomMaterials
from apps.core.osdag_overrides import unknown_material_error, user_rows
from apps.sections.models import UserCustomAngle, UserCustomBeam
from osdag_core.Common import fetch_row, get_leg_lengths, row_override
from osdag_core.utils.common.component import Angle, Beam
from osdag_core.utils.common.material import Material

CATALOG_BEAM = "MB 300"       # in the bundled SQLite catalog, Mass 46.02
CATALOG_GRADE = "E 250 (Fe 410 W)A"


def make_beam(user, designation="MY 200", mass=30.0):
    return UserCustomBeam.objects.create(
        user=user, Designation=designation, Mass=mass, Area=38.0, D=250.0, B=125.0,
        tw=6.9, T=9.7, FlangeSlope=98, R1=10.0, R2=5.0, Iz=3000.0, Iy=300.0, rz=10.0,
        ry=2.8, Zz=240.0, Zy=48.0, Zpz=270.0, Zpy=80.0, It=None, Iw=None, Source="",
    )


class OsdagOverrideTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        self.other = User.objects.create_user(username="u2", email="u2@example.com", password="x")

    def test_catalog_lookup_without_override(self):
        row = fetch_row("Beams", CATALOG_BEAM)
        self.assertEqual(row[1], CATALOG_BEAM)
        self.assertAlmostEqual(row[2], 46.02)

    def test_custom_beam_visible_inside_context_only(self):
        make_beam(self.user)
        self.assertIsNone(fetch_row("Beams", "MY 200"))

        with user_rows(self.user.id):
            beam = Beam(designation="MY 200", material_grade=CATALOG_GRADE)
            self.assertEqual(beam.mass, 30.0)
            self.assertEqual(beam.source, "Custom")
            # It/Iw were not supplied, so osdag_core computes them from the geometry.
            self.assertGreater(beam.It, 0)
            # Catalog sections still resolve from SQLite.
            self.assertAlmostEqual(Beam(designation=CATALOG_BEAM, material_grade=CATALOG_GRADE).mass, 46.02)

        self.assertIsNone(row_override.get())
        self.assertIsNone(fetch_row("Beams", "MY 200"))

    def test_custom_row_overrides_same_designation(self):
        make_beam(self.user, designation=CATALOG_BEAM, mass=99.0)
        with user_rows(self.user.id):
            self.assertEqual(fetch_row("Beams", CATALOG_BEAM)[2], 99.0)
        self.assertAlmostEqual(fetch_row("Beams", CATALOG_BEAM)[2], 46.02)

    def test_users_do_not_see_each_others_rows(self):
        make_beam(self.user, mass=30.0)
        make_beam(self.other, mass=55.0)
        with user_rows(self.user.id):
            self.assertEqual(fetch_row("Beams", "MY 200")[2], 30.0)
        with user_rows(self.other.id):
            self.assertEqual(fetch_row("Beams", "MY 200")[2], 55.0)

    def test_inactive_rows_ignored(self):
        beam = make_beam(self.user)
        beam.is_active = False
        beam.save()
        with user_rows(self.user.id):
            self.assertIsNone(fetch_row("Beams", "MY 200"))

    def test_guests_resolve_only_well_formed_custom_grades(self):
        with user_rows(None):
            mat = Material("Cus_250_240_230_410", 10)
            self.assertEqual((mat.fy, mat.fu), (250, 410))
            # Below osdag's 165-1500 MPa range, and not numeric.
            self.assertIsNone(fetch_row("Material", "Cus_100_240_230_410", key="Grade"))
            self.assertIsNone(fetch_row("Material", "Cus_abc_1_2_3", key="Grade"))
            # Catalog sections still come from SQLite.
            self.assertAlmostEqual(fetch_row("Beams", CATALOG_BEAM)[2], 46.02)
        self.assertIsNone(row_override.get())

    def test_saved_custom_material_takes_precedence_over_name_parsing(self):
        CustomMaterials.objects.create(
            user=self.user, Grade="Cus_250_240_230_410", Yield_Stress_less_than_20=300,
            Yield_Stress_between_20_and_neg40=290, Yield_Stress_greater_than_40=280,
            Ultimate_Tensile_Stress=450, Elongation=0,
        )
        with user_rows(self.user.id):
            mat = Material("Cus_250_240_230_410", 10)
            self.assertEqual((mat.fy, mat.fu), (300, 450))
        with user_rows(self.other.id):
            mat = Material("Cus_250_240_230_410", 10)
            self.assertEqual((mat.fy, mat.fu), (250, 410))

    def test_custom_material_strengths(self):
        CustomMaterials.objects.create(
            user=self.user, Grade="My Steel", Yield_Stress_less_than_20=300,
            Yield_Stress_between_20_and_neg40=290, Yield_Stress_greater_than_40=280,
            Ultimate_Tensile_Stress=450, Elongation=20,
        )
        self.assertEqual(Material("My Steel", 10).fu, 0.0)
        with user_rows(self.user.id):
            mat = Material("My Steel", 10)
            self.assertEqual((mat.fy, mat.fu), (300, 450))
            self.assertEqual(Material("My Steel", 30).fy, 290)

    def test_custom_angle_column_order(self):
        UserCustomAngle.objects.create(
            user=self.user, Designation="MY L", Mass=5.0, Area=6.0, a=60.0, b=40.0, t=6.0,
            R1=6.5, R2=0.0, Cz=1.9, Cy=1.0, Iz=20.0, Iy=7.0, Alpha=0.4, lumax=23.0, lvmin=4.0,
            rz=1.9, ry=1.1, rumax=2.0, rvmin=0.8, Zz=5.0, Zy=2.3, Zpz=9.0, Zpy=4.0, It=0.7,
            Source="",
        )
        with user_rows(self.user.id):
            self.assertEqual(get_leg_lengths("MY L"), (60.0, 40.0, 6.0, 6.5))
            angle = Angle(designation="MY L", material_grade=CATALOG_GRADE)
            self.assertEqual((angle.a, angle.b, angle.thickness), (60.0, 40.0, 6.0))


class UnknownMaterialErrorTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        self.other = User.objects.create_user(username="u2", email="u2@example.com", password="x")
        for user, grade in ((self.user, "My Steel"), (self.other, "Their Steel")):
            CustomMaterials.objects.create(
                user=user, Grade=grade, Yield_Stress_less_than_20=300,
                Yield_Stress_between_20_and_neg40=290, Yield_Stress_greater_than_40=280,
                Ultimate_Tensile_Stress=450, Elongation=0,
            )

    def test_known_grades_give_no_error(self):
        for grade in (CATALOG_GRADE, "Cus_250_240_230_410", "My Steel"):
            self.assertIsNone(unknown_material_error({"Material": grade}, self.user.id), grade)

    def test_unknown_grade_gives_message(self):
        message = unknown_material_error({"Material": "No Such Steel"}, self.user.id)
        self.assertIn("No Such Steel", message)
        # Not a Cus_ name, so it only resolves for its owner.
        self.assertIn("Their Steel", unknown_material_error({"Material": "Their Steel"}, self.user.id))
        self.assertIn("My Steel", unknown_material_error({"Material": "My Steel"}, None))

    def test_only_grade_keys_are_checked(self):
        inputs = {
            "Material": "Select Material",
            "Member.Material": "",
            "Material.Fu": "410",
            "Bolt.Material_Grade_OverWrite": "No Such Steel",
            "Member.Designation": ["No Such Steel"],
        }
        self.assertIsNone(unknown_material_error(inputs, self.user.id))

    def test_dotted_material_keys_are_checked(self):
        inputs = {"Material": CATALOG_GRADE, "Connector.Material": "No Such Steel"}
        self.assertIn("No Such Steel", unknown_material_error(inputs, self.user.id))
