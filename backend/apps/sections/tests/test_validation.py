from django.contrib.auth.models import User
from django.test import SimpleTestCase, TestCase

from apps.core import catalog
from apps.core.tests.test_osdag_overrides import make_beam
from apps.sections.models import TABLE_TO_USER_MODEL, UserCustomColumn
from apps.sections.validation import can_insert_custom_section, get_db_header

SECTION = dict(
    Mass=30.0, Area=38.0, D=250.0, B=125.0, tw=6.9, T=9.7, FlangeSlope=98, R1=10.0, R2=5.0,
    Iz=3000.0, Iy=300.0, rz=10.0, ry=2.8, Zz=240.0, Zy=48.0, Zpz=270.0, Zpy=80.0,
)


def make_column(user, designation):
    return UserCustomColumn.objects.create(user=user, Designation=designation, It=None, Iw=None, Source="", **SECTION)


class CanInsertCustomSectionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="x")
        self.other = User.objects.create_user(username="u2", email="u2@example.com", password="x")

    def test_new_designation_allowed(self):
        self.assertEqual(can_insert_custom_section("Beams", "NEW 1", self.user), (True, ""))

    def test_column_named_like_catalog_beam_is_a_catalog_duplicate(self):
        self.assertEqual(can_insert_custom_section("Columns", "MB 300", self.user), (False, "catalog_duplicate"))

    def test_beam_named_like_catalog_column_is_a_catalog_duplicate(self):
        self.assertEqual(can_insert_custom_section("Beams", "HB 150", self.user), (False, "catalog_duplicate"))

    def test_angle_named_like_catalog_angle_is_a_catalog_duplicate(self):
        self.assertEqual(can_insert_custom_section("Angles", "20 x 20 x 3", self.user), (False, "catalog_duplicate"))
        self.assertEqual(can_insert_custom_section("Channels", "20 x 20 x 3", self.user), (True, ""))

    def test_column_named_like_own_beam_is_a_user_duplicate(self):
        make_beam(self.user, designation="X")
        self.assertEqual(can_insert_custom_section("Columns", "X", self.user), (False, "user_duplicate"))

    def test_other_users_rows_do_not_conflict(self):
        make_beam(self.other, designation="X")
        self.assertEqual(can_insert_custom_section("Columns", "X", self.user), (True, ""))

    def test_updating_a_row_excludes_itself(self):
        column = make_column(self.user, "X")
        self.assertEqual(
            can_insert_custom_section("Columns", "X", self.user, exclude_user_section_pk=column.pk),
            (True, ""),
        )
        self.assertEqual(can_insert_custom_section("Columns", "X", self.user), (False, "user_duplicate"))


class DbHeaderTests(SimpleTestCase):
    def test_user_tables_use_the_catalog_field_names_in_catalog_order(self):
        for table in TABLE_TO_USER_MODEL:
            self.assertEqual(get_db_header(table), [f for f in catalog.fields(table) if f != "id"], table)

    def test_catalog_only_tables_take_their_header_from_the_catalog(self):
        self.assertEqual(get_db_header("CHS")[:3], ["Designation", "NB", "OD"])
        self.assertEqual(get_db_header("SHS")[-1], "Source")
