"""
On-demand CAD export returns a valid file for every format the UI offers.

The model is regenerated from the fixture inputs of each module, so these run the real
CAD generation (flexure members, where the adapters share one writer, plus fin plate).
"""
import json
from pathlib import Path

from django.test import RequestFactory, SimpleTestCase

from apps.core.api.cad.cad_model_export import CADExport

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "design_inputs"

# format -> bytes the file must start with
SIGNATURES = {
    "brep": b"DBRep_DrawableShape",
    "stl": None,  # binary or ascii; only checked for being non-trivial
    "step": b"ISO-10303-21",
    "iges": None,  # fixed-width records; checked below
    "ifc": b"ISO-10303-21",
}

MODULES = [
    ("Flexural Members - Cantilever", "flexure_member__on_cantilever", "defaults-customized"),
    ("Flexural Members - Simply Supported", "flexure_member__simply_supported_beam", "defaults-customized"),
    ("Fin Plate Connection", "shear_connection__fin_plate", "osi-fin1"),
]


class CadExportFormatsTest(SimpleTestCase):
    def export(self, module_id, directory, fixture, fmt):
        inputs = json.loads((FIXTURES_DIR / directory / f"{fixture}.json").read_text(encoding="utf-8"))["inputs"]
        request = RequestFactory().post(
            "/api/design/exportCad",
            data=json.dumps({"module_id": module_id, "input_values": inputs, "format": fmt}),
            content_type="application/json",
        )
        response = CADExport.as_view()(request)
        body = b"".join(response.streaming_content) if response.streaming else response.content
        return response, body

    def test_every_format_is_exported_for_each_module(self):
        for module_id, directory, fixture in MODULES:
            for fmt, signature in SIGNATURES.items():
                with self.subTest(module=directory, format=fmt):
                    response, body = self.export(module_id, directory, fixture, fmt)
                    self.assertEqual(response.status_code, 200, body[:200])
                    self.assertGreater(len(body), 100)
                    if signature:
                        self.assertIn(signature, body[:200])
                    if fmt == "iges":
                        # IGES records are 80 columns wide and the first one is flagged "S"
                        self.assertEqual(body[72:73], b"S")
