from celery import shared_task
import logging

logger = logging.getLogger(__name__)


def get_service_class(module_name: str, submodule_slug: str):
    """
    Helper to resolve the ServiceClass based on parent module and submodule slug.
    """
    from apps.core.registry import BaseModuleRegistry
    slug = submodule_slug.replace('_', '-')
    service_class = BaseModuleRegistry._global_registry.get(slug)
    if service_class:
        return service_class

    if module_name == 'shear-connection':
        from apps.modules.shear_connection.registry import ShearConnectionRegistry
        return ShearConnectionRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'moment-connection':
        from apps.modules.moment_connection.registry import MomentConnectionRegistry
        return MomentConnectionRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'simple-connection':
        from apps.modules.simple_connection.registry import SimpleConnectionRegistry
        return SimpleConnectionRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'tension-member':
        from apps.modules.tension_member.registry import TensionMemberRegistry
        return TensionMemberRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'flexure-member':
        from apps.modules.flexure_member.registry import FlexureMemberRegistry
        return FlexureMemberRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'compression-member':
        from apps.modules.compression_member.registry import CompressionMemberRegistry
        return CompressionMemberRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'base-plate':
        from apps.modules.base_plate.service import BasePlateService
        return BasePlateService
    else:
        raise ValueError(f"Unknown parent module: {module_name}")


@shared_task
def healthcheck_task():
    return {"status": "ok", "worker": "celery"}


# Status sent over the task's WebSocket group once the design is calculated, before the 3D
# model is built. The final message (task state SUCCESS) carries everything again.
DESIGN_READY_STATUS = "DESIGN_READY"


def _solved_module(instances):
    """The module the design ran on: the last recorded one that has a design_status."""
    for inst in reversed(instances):
        if hasattr(inst, 'design_status'):
            return inst
    return None


def _logs_from_instances(instances):
    from osdag_core.custom_logger import CustomLogger
    extracted_logs = []
    for inst in reversed(instances):
        if hasattr(inst, 'logger') and isinstance(inst.logger, CustomLogger):
            inst_logs = inst.logger.get_logs()
            if inst_logs:
                extracted_logs.extend(inst_logs)
        elif hasattr(inst, 'logs') and inst.logs:
            extracted_logs.extend(inst.logs)
    return extracted_logs


def _publish_design_ready(task_id, result):
    """Send the calculated design to clients waiting on this task, ahead of the 3D model.

    Clients that connect later miss this message; the task's final result has the
    same design data, so this is only a head start.
    """
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            f"task_{task_id}",
            {
                "type": "task.update",
                "status": DESIGN_READY_STATUS,
                "result": result,
                "error": None,
            },
        )
    except Exception as exc:
        logger.warning(f"Could not send the early design result for task {task_id}: {exc}")


@shared_task(bind=True)
def run_design_calculation_task(self, module_name: str, submodule_slug: str, inputs: dict, project_id=None, user_email=None, user_id=None):
    """
    Celery task to run the design calculation and build its 3D model.

    The design is calculated once. When it is safe, every CAD section and the hover
    text are built from that same solved module, as the desktop app does. The result
    holds the design outputs and logs plus the CAD files, so it is complete on its own;
    the outputs are also sent over the task's WebSocket group as soon as they exist.
    """
    logger.info(f"Starting calculation task: {module_name}/{submodule_slug} (Task ID: {self.request.id})")

    ServiceClass = get_service_class(module_name, submodule_slug)
    if not ServiceClass:
        raise ValueError(f"Service class for {module_name}/{submodule_slug} not found")

    from apps.core.main_registry import WebMainRegistry
    from apps.core.osdag_overrides import user_rows
    from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections

    with user_rows(user_id):
        WebMainRegistry.start_recording()
        try:
            result = ServiceClass.calculate(
                inputs=inputs,
                request=None,
                project_id=project_id,
                user_email=user_email
            )
        finally:
            instances = WebMainRegistry.stop_recording()

        solver = _solved_module(instances)
        design_status = bool(solver.design_status) if solver is not None else True

        if result and isinstance(result, dict):
            result['design_status'] = design_status
            logger.info(f"Calculation task design_status resolved to: {design_status}")

            # Extract logs from recorded instances if result logs is empty/falsy
            if not result.get('logs'):
                extracted_logs = _logs_from_instances(instances)
                if extracted_logs:
                    result['logs'] = extracted_logs
        else:
            # Fallback if result is None or not a dict
            result = {
                'success': False,
                'data': {},
                'logs': _logs_from_instances(instances),
                'design_status': design_status
            }

        result['files'] = {}
        result['hover_dict'] = {}
        result['warnings'] = []

        # Same condition the frontend applied before it asked for a 3D model.
        build_cad = (
            result.get('success') is not False
            and bool(result.get('data'))
            and design_status
        )
        if not build_cad:
            return result

        _publish_design_ready(self.request.id, dict(result))

        if solver is None:
            result['cad_error'] = 'The solved design was not available for the 3D model'
            return result

        try:
            cad = generate_cad_models(
                service_class=ServiceClass,
                inputs=inputs,
                module=solver,
                sections=get_default_sections(module_name, submodule_slug),
                session_id=self.request.id,
            )
            result['files'] = cad['files']
            result['hover_dict'] = cad['hover_dict']
            result['warnings'] = cad['warnings']
        except Exception as exc:
            logger.exception(f"CAD generation failed for task {self.request.id}")
            result['cad_error'] = str(exc) or type(exc).__name__

    return result


@shared_task(bind=True)
def run_report_generation_task(self, mapped_data: dict, user_id=None):
    """
    Celery task to build initial reports.
    """
    logger.info(f"Starting report generation task (Task ID: {self.request.id})")

    from apps.core.api.design.report_customization_api import generate_initial_report_core
    from apps.core.osdag_overrides import user_rows
    with user_rows(user_id):
        payload, status_code = generate_initial_report_core(mapped_data)
    
    return {
        "payload": payload,
        "status_code": status_code
    }


@shared_task
def clean_temporary_files(max_age_hours=24):
    """
    Safety net cleanup - removes CAD files and leftover report folders
    older than max_age_hours. Runs daily via Celery Beat.
    Reports should already be gone (deleted in-memory on serve),
    but this catches any failures.
    """
    import os
    import time
    import shutil
    from django.conf import settings

    now = time.time()
    max_age_sec = max_age_hours * 3600
    file_storage_root = settings.FILE_STORAGE_ROOT

    targets = {
        'cad_models': 'file',
        'design_report': 'dir',
    }

    for folder_name, item_type in targets.items():
        target_dir = os.path.join(file_storage_root, folder_name)
        if not os.path.exists(target_dir):
            continue

        for item in os.listdir(target_dir):
            item_path = os.path.join(target_dir, item)
            try:
                age = now - os.path.getmtime(item_path)
                if age < max_age_sec:
                    continue

                if item_type == 'file' and os.path.isfile(item_path):
                    os.remove(item_path)
                    logger.info(f"[cleanup] Deleted CAD file: {item_path}")
                elif item_type == 'dir' and os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                    logger.info(f"[cleanup] Deleted report folder: {item_path}")

            except Exception as e:
                logger.warning(f"[cleanup] Failed to delete {item_path}: {e}")


