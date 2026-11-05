"""Saved projects keep a module id that Recent Projects can open."""
import re
from pathlib import Path

from django.test import TestCase

from apps.core.models import Project
from apps.core.utils.module_helpers import save_to_project

FRONTEND = Path(__file__).resolve().parents[4] / "frontend" / "src"
REGISTRY = FRONTEND / "modules" / "registry.js"
CORE_KEYS = FRONTEND / "constants" / "generated" / "coreKeys.js"


def _value(token, core_keys):
    token = token.strip()
    return token.strip('"') if token.startswith('"') else core_keys.get(token)


def _registry_entries():
    core_keys = dict(re.findall(r'export const (\w+) = "([^"]*)"', CORE_KEYS.read_text(encoding="utf-8")))
    entries = re.finditer(
        r'\{\s*id:\s*([^,]+),\s*path:\s*"[^"]+".*?load:\s*\(\)\s*=>\s*loadConfigs\(\s*import\("([^"]+)"\)',
        REGISTRY.read_text(encoding="utf-8"),
        re.S,
    )
    for match in entries:
        config = (REGISTRY.parent / match.group(2)).with_suffix(".js").read_text(encoding="utf-8")
        design_type = re.search(r'designType:\s*([A-Za-z_0-9]+|"[^"]*")', config)
        yield _value(match.group(1), core_keys), _value(design_type.group(1), core_keys) if design_type else None


class ProjectModuleIdTests(TestCase):
    def test_every_module_saves_its_registry_id(self):
        # A new project stores the module config's designType; Recent Projects looks it up by registry id.
        entries = list(_registry_entries())
        self.assertGreaterEqual(len(entries), 20)
        for module_id, design_type in entries:
            self.assertEqual(design_type, module_id)

    def test_saving_inputs_keeps_the_project_module(self):
        project = Project.objects.create(
            name="p", module="connections", submodule="Fin Plate Connection", user_email="a@example.com",
        )
        result = save_to_project(project.id, "a@example.com", {"Bolt.Diameter": ["20"]})
        project.refresh_from_db()
        self.assertTrue(result["saved"])
        self.assertEqual(project.submodule, "Fin Plate Connection")
        self.assertEqual(project.module, "connections")
        self.assertEqual(project.inputs_json, {"Bolt.Diameter": ["20"]})
