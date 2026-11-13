import sqlite3

from django.test import SimpleTestCase

from apps.core import catalog
from osdag_core.Common import PATH_TO_DATABASE


def sqlite_designations(table):
    conn = sqlite3.connect(f"file:{PATH_TO_DATABASE}?mode=ro", uri=True)
    try:
        return [d for (d,) in conn.execute(f'SELECT Designation FROM "{table}" ORDER BY Id')]
    finally:
        conn.close()


class CatalogRowsTests(SimpleTestCase):
    def test_every_table_loads_and_has_an_id(self):
        for table in catalog.CATALOG_TABLES:
            rows = catalog.rows(table)
            self.assertTrue(rows, table)
            self.assertEqual([r["id"] for r in rows], sorted(r["id"] for r in rows), table)

    def test_material_columns_use_the_model_field_names(self):
        row = catalog.find("Material", Grade="E 250 (Fe 410 W)A")
        self.assertEqual(
            row,
            {
                "id": 2,
                "Grade": "E 250 (Fe 410 W)A",
                "Yield_Stress_less_than_20": 250,
                "Yield_Stress_between_20_and_neg40": 240,
                "Yield_Stress_greater_than_40": 230,
                "Ultimate_Tensile_Stress": 410,
                "Elongation": 23,
            },
        )

    def test_material_ids_come_from_rowid(self):
        self.assertEqual([r["id"] for r in catalog.rows("Material")], list(range(1, 11)))

    def test_equal_angle_columns_use_the_model_field_names(self):
        row = catalog.rows("EqualAngle")[0]
        for field in ("Iu_max", "Iv_min", "ru_max", "rv_min"):
            self.assertIn(field, row)
        self.assertNotIn("Iu(max)", row)
        self.assertEqual(catalog.fields("UnequalAngle"), catalog.fields("EqualAngle"))

    def test_angles_keep_the_lumax_spelling_of_the_user_model(self):
        row = catalog.rows("Angles")[0]
        self.assertIn("lumax", row)
        self.assertIn("lvmin", row)
        self.assertNotIn("Iumax", row)

    def test_values_are_not_rounded_to_two_decimals(self):
        # Postgres kept two decimals and turned 0.033 into 0.03.
        self.assertEqual(catalog.find("Angles", Designation="20 x 20 x 3")["It"], 0.033)

    def test_numbers_stay_numbers(self):
        row = catalog.find("Beams", Designation="MB 300")
        self.assertIsInstance(row["Mass"], float)
        self.assertIsInstance(row["FlangeSlope"], int)

    def test_rows_are_copies(self):
        catalog.rows("Material")[0]["Grade"] = "changed"
        catalog.find("Material", id=1)["Grade"] = "changed"
        self.assertEqual(catalog.find("Material", id=1)["Grade"], "E 165 (Fe 290)")


class CatalogLookupTests(SimpleTestCase):
    def test_find_returns_the_first_matching_row(self):
        # "WB 200" is listed twice; osdag_core only ever sees the first one.
        first = next(r for r in catalog.rows("Beams") if r["Designation"] == "WB 200")
        self.assertEqual(catalog.find("Beams", Designation="WB 200"), first)

    def test_find_matches_every_given_field(self):
        self.assertIsNone(catalog.find("Material", Grade="E 250 (Fe 410 W)A", Elongation=1))
        self.assertEqual(catalog.find("Material", Grade="E 250 (Fe 410 W)A", Elongation=23)["id"], 2)

    def test_find_without_a_match_is_none(self):
        self.assertIsNone(catalog.find("Beams", Designation="NOPE 1"))

    def test_unknown_table_is_rejected(self):
        with self.assertRaises(ValueError):
            catalog.rows("sqlite_master")
        with self.assertRaises(ValueError):
            catalog.find('Beams"; DROP TABLE Beams; --', Designation="x")


class CatalogDesignationTests(SimpleTestCase):
    def test_designations_follow_catalog_order_without_repeats(self):
        for table in ("Beams", "Columns", "Channels", "Angles", "SHS"):
            expected = list(dict.fromkeys(sqlite_designations(table)))
            self.assertEqual(catalog.designations(table), expected, table)

    def test_duplicate_designations_are_listed_once(self):
        raw = sqlite_designations("Beams")
        self.assertEqual(raw.count("WB 200"), 2)
        self.assertEqual(catalog.designations("Beams").count("WB 200"), 1)
        self.assertEqual(len(catalog.designations("Beams")), len(set(raw)))

    def test_bolt_diameters_are_sorted_strings(self):
        diameters = catalog.bolt_diameters()
        self.assertEqual(diameters, sorted(diameters))
        self.assertTrue(all(isinstance(d, str) for d in diameters))
        self.assertIn("16", diameters)


class CatalogReadOnlyTests(SimpleTestCase):
    def test_connection_cannot_write(self):
        conn = catalog.connect()
        try:
            with self.assertRaises(sqlite3.OperationalError):
                conn.execute('UPDATE "Material" SET Grade = \'x\'')
        finally:
            conn.close()
