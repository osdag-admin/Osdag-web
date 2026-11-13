"""
Designs that no combination of the selected sections, bolts or plates can satisfy.

Each fixture narrows a customizable list to explicit values so that the design
fails. The design task must still finish, returning the logs that explain the
failure and design_status False, instead of raising while the outputs are read.
"""
import json
from pathlib import Path

from django.test import TestCase

from apps.core.tasks import run_design_calculation_task
from apps.core.utils.raw_output_export import build_raw_output_dict
from osdag_core.Common import TYPE_OUT_BUTTON, TYPE_TEXTBOX

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "design_inputs"

# (fixture directory, fixture file) pairs whose design finishes unsafe.
UNSAFE_DESIGNS = [
    ("moment_connection__beam_beam_cover_plate_bolted", "defaults-customized"),
    ("moment_connection__beam_beam_cover_plate_welded", "defaults-customized"),
    ("moment_connection__beam_beam_end_plate", "defaults-customized"),
    ("shear_connection__seated_angle", "defaults-customized__column-flange-beam-web"),
    ("tension_member__bolted", "defaults-customized"),
    ("moment_connection__column_column_cover_plate_bolted", "defaults-customized"),
    ("moment_connection__column_column_cover_plate_welded", "defaults-customized"),
    ("moment_connection__column_column_end_plate", "defaults-customized__flush-end-plate"),
    ("moment_connection__beam_column_end_plate", "defaults-customized"),
    ("shear_connection__cleat_angle", "defaults-customized__column-flange-beam-web"),
    ("compression_member__struts_bolted", "defaults-customized"),
    ("compression_member__struts_welded", "defaults-customized"),
]


def run_design(slug: str, name: str) -> dict:
    inputs = json.loads((FIXTURES_DIR / slug / f"{name}.json").read_text(encoding="utf-8"))["inputs"]
    family, _, sub = slug.partition("__")
    result = run_design_calculation_task.apply(
        kwargs={
            "module_name": family.replace("_", "-"),
            "submodule_slug": (sub or family).replace("_", "-"),
            "inputs": inputs,
        }
    )
    result.get()  # re-raises anything the design task raised
    return result.result


class UnsafeDesignTests(TestCase):
    def test_unsafe_design_returns_logs_and_status_instead_of_raising(self):
        for slug, name in UNSAFE_DESIGNS:
            with self.subTest(fixture=f"{slug}/{name}"):
                result = run_design(slug, name)
                self.assertTrue(result["success"], result.get("error"))
                self.assertIs(result["design_status"], False)
                self.assertIsInstance(result["data"], dict)
                self.assertTrue(result["logs"])
                self.assertIsInstance(result["raw_csv"], dict)


class RawOutputExportTests(TestCase):
    def test_button_functions_are_only_called_for_a_finished_design(self):
        def detail_rows(status):
            return [("Detail.Key", "Detail", TYPE_TEXTBOX, 5 if status else "")]

        rows = [
            ("Plain.Key", "Plain", TYPE_TEXTBOX, 7),
            ("Detail.Button", "Details", TYPE_OUT_BUTTON, ["Details", detail_rows]),
        ]
        self.assertEqual(build_raw_output_dict(rows, True), {"Plain.Key": 7, "Detail.Key": 5})
        self.assertEqual(build_raw_output_dict(rows, False), {"Plain.Key": 7})
