"""
The design task calculates once and builds the 3D model from that same solved module.

Real designs use the fixtures in fixtures/design_inputs; the failure paths use a stub
service so they stay fast. Celery runs the task eagerly and the Channels layer is the
in-memory one (conftest.py), so nothing here reaches Redis.
"""
import asyncio
import json
import uuid
from pathlib import Path
from unittest.mock import patch

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.test import SimpleTestCase

from apps.core import tasks
from apps.core.main_registry import WebMainRegistry
from apps.core.tasks import DESIGN_READY_STATUS, run_design_calculation_task
from apps.core.utils import cad_helpers
from osdag_core.design_type.main import Main

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "design_inputs"
FIN_PLATE = ("shear-connection", "fin-plate", "shear_connection__fin_plate", "osi-fin1")
FIN_PLATE_SECTIONS = {"Model", "Beam", "Column", "Plate", "Bolt", "Weld"}


def fixture_inputs(directory, name):
    return json.loads((FIXTURES_DIR / directory / f"{name}.json").read_text(encoding="utf-8"))["inputs"]


def run_task(module_name, submodule_slug, inputs, task_id=None):
    result = run_design_calculation_task.apply(
        kwargs={"module_name": module_name, "submodule_slug": submodule_slug, "inputs": inputs},
        task_id=task_id,
    )
    return result.get()


class FakeModule:
    """Stands in for a solved osdag_core module."""

    def __init__(self, design_status=True):
        self.design_status = design_status


class FakeService:
    """A service whose calculate() records a fake solved module, like the real ones record theirs."""

    design_status = True
    module = None

    @classmethod
    def calculate(cls, inputs, request=None, project_id=None, user_email=None):
        cls.module = FakeModule(cls.design_status)
        WebMainRegistry.record(cls.module)
        return {"data": {"Key": {"key": "Key", "label": "Key", "val": 1}}, "logs": [], "success": True}


class CountingMain:
    """Counts how many osdag_core modules get constructed."""

    def __enter__(self):
        self.count = 0
        original = Main.__init__
        counter = self

        def counting_init(module, *args, **kwargs):
            counter.count += 1
            return original(module, *args, **kwargs)

        self._patch = patch.object(Main, "__init__", counting_init)
        self._patch.start()
        return self

    def __exit__(self, *exc):
        self._patch.stop()


class RealDesignTests(SimpleTestCase):
    def test_fin_plate_calculates_once_and_builds_every_section(self):
        module_name, slug, directory, name = FIN_PLATE
        with CountingMain() as counter:
            result = run_task(module_name, slug, fixture_inputs(directory, name))
        self.assertTrue(result["design_status"])
        self.assertEqual(counter.count, 1)
        self.assertEqual(set(result["files"]), FIN_PLATE_SECTIONS)
        self.assertTrue(result["hover_dict"])
        self.assertNotIn("cad_error", result)

    def test_every_section_and_the_hover_text_use_the_solved_module(self):
        module_name, slug, directory, name = FIN_PLATE
        seen = {}
        real_generate = cad_helpers.generate_cad_models

        def spy(**kwargs):
            seen["module"] = kwargs["module"]
            return real_generate(**kwargs)

        recorded = []
        real_stop = WebMainRegistry.stop_recording

        def stop_and_keep():
            instances = real_stop()
            recorded.extend(instances)
            return instances

        with patch.object(cad_helpers, "generate_cad_models", spy), \
                patch.object(WebMainRegistry, "stop_recording", stop_and_keep):
            run_task(module_name, slug, fixture_inputs(directory, name))
        self.assertEqual(len(recorded), 1)
        self.assertIs(seen["module"], recorded[0])

    def test_adapter_builds_cad_from_the_given_module_without_recalculating(self):
        from apps.modules.shear_connection.submodules.fin_plate import adapter

        module_name, slug, directory, name = FIN_PLATE
        inputs = fixture_inputs(directory, name)
        solved = adapter.create_from_input(inputs)
        with patch.object(adapter, "create_from_input", side_effect=AssertionError("recalculated")):
            path = adapter.create_cad_model(inputs, "Plate", f"test_{uuid.uuid4().hex}", module=solved)
        self.assertTrue(path)

    def test_unsafe_design_builds_no_cad(self):
        with patch.object(cad_helpers, "generate_cad_models") as generate:
            result = run_task(
                "shear-connection", "fin-plate",
                fixture_inputs("shear_connection__fin_plate", "osi-fin4"),
            )
        generate.assert_not_called()
        self.assertIs(result["design_status"], False)
        self.assertTrue(result["success"])
        self.assertTrue(result["data"])
        self.assertEqual(result["files"], {})
        self.assertEqual(result["hover_dict"], {})


class StubbedServiceTests(SimpleTestCase):
    def setUp(self):
        FakeService.design_status = True
        patcher = patch.object(tasks, "get_service_class", return_value=FakeService)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_cad_failure_still_returns_the_design(self):
        with patch.object(cad_helpers, "generate_cad_models", side_effect=RuntimeError("OCC crashed")):
            result = run_task("shear-connection", "fin-plate", {})
        self.assertTrue(result["success"])
        self.assertTrue(result["design_status"])
        self.assertEqual(result["data"]["Key"]["val"], 1)
        self.assertEqual(result["files"], {})
        self.assertEqual(result["cad_error"], "OCC crashed")

    def test_cad_is_built_from_the_recorded_module(self):
        cad = {"files": {"Model": "data:x"}, "hover_dict": {"Bolt": "M16"}, "warnings": [{"section": "Weld"}]}
        with patch.object(cad_helpers, "generate_cad_models", return_value=cad) as generate:
            result = run_task("shear-connection", "fin-plate", {})
        self.assertIs(generate.call_args.kwargs["module"], FakeService.module)
        self.assertEqual(generate.call_args.kwargs["sections"], cad_helpers.get_default_sections("shear-connection", "fin-plate"))
        self.assertEqual(result["files"], cad["files"])
        self.assertEqual(result["hover_dict"], cad["hover_dict"])
        self.assertEqual(result["warnings"], cad["warnings"])

    def test_unsafe_design_builds_no_cad(self):
        FakeService.design_status = False
        with patch.object(cad_helpers, "generate_cad_models") as generate:
            result = run_task("shear-connection", "fin-plate", {})
        generate.assert_not_called()
        self.assertIs(result["design_status"], False)
        self.assertEqual(result["files"], {})

    def test_failed_calculation_builds_no_cad(self):
        with patch.object(FakeService, "calculate", return_value={"data": {}, "logs": [], "success": False, "error": "bad"}), \
                patch.object(cad_helpers, "generate_cad_models") as generate:
            result = run_task("shear-connection", "fin-plate", {})
        generate.assert_not_called()
        self.assertFalse(result["success"])
        self.assertEqual(result["files"], {})


class EarlyMessageTests(SimpleTestCase):
    """The outputs go out over the task's group before the 3D model; the final result has both."""

    def setUp(self):
        FakeService.design_status = True
        patcher = patch.object(tasks, "get_service_class", return_value=FakeService)
        patcher.start()
        self.addCleanup(patcher.stop)

    def listen(self, task_id):
        layer = get_channel_layer()
        channel = async_to_sync(layer.new_channel)()
        async_to_sync(layer.group_add)(f"task_{task_id}", channel)
        return layer, channel

    def messages(self, layer, channel):
        async def drain():
            received = []
            while True:
                try:
                    received.append(await asyncio.wait_for(layer.receive(channel), timeout=0.2))
                except asyncio.TimeoutError:
                    return received

        return async_to_sync(drain)()

    def test_outputs_are_sent_first_and_the_final_result_holds_everything(self):
        task_id = str(uuid.uuid4())
        layer, channel = self.listen(task_id)
        cad = {"files": {"Model": "data:x"}, "hover_dict": {"Bolt": "M16"}, "warnings": []}
        with patch.object(cad_helpers, "generate_cad_models", return_value=cad):
            result = run_task("shear-connection", "fin-plate", {}, task_id=task_id)

        messages = self.messages(layer, channel)
        statuses = [m["status"] for m in messages]
        self.assertEqual(statuses, [DESIGN_READY_STATUS, "SUCCESS"])

        early, final = messages[0]["result"], messages[1]["result"]
        self.assertEqual(early["data"], result["data"])
        self.assertTrue(early["design_status"])
        self.assertEqual(early["files"], {})  # the 3D model is not part of the early message

        # A client that only sees the final message still gets the outputs and the 3D model.
        self.assertEqual(final["data"], result["data"])
        self.assertEqual(final["files"], cad["files"])
        self.assertEqual(final["hover_dict"], cad["hover_dict"])

    def test_no_early_message_when_there_is_no_3d_model_to_wait_for(self):
        FakeService.design_status = False
        task_id = str(uuid.uuid4())
        layer, channel = self.listen(task_id)
        run_task("shear-connection", "fin-plate", {}, task_id=task_id)
        statuses = [m["status"] for m in self.messages(layer, channel)]
        self.assertEqual(statuses, ["SUCCESS"])
