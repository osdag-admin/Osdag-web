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
    elif module_name in ('compression-member', 'Compression-Member-Design'):
        from apps.modules.compression_member.registry import CompressionMemberRegistry
        return CompressionMemberRegistry.get_service_by_slug(submodule_slug)
    elif module_name == 'base-plate':
        from apps.modules.base_plate.service import BasePlateService
        return BasePlateService
    else:
        raise ValueError(f"Unknown parent module: {module_name}")


def get_create_from_input_func(module_name: str, submodule_slug: str):
    """
    Helper to resolve the create_from_input function for CAD hover_dict generation.
    """
    from apps.core.registry import BaseModuleRegistry
    slug = submodule_slug.replace('_', '-')
    for meta in BaseModuleRegistry._global_metadata.values():
        if meta.get('slug') == slug and meta.get('adapter_func'):
            return meta.get('adapter_func')

    try:
        if module_name == 'shear-connection':
            slug_clean = submodule_slug.replace('-', '_')
            mod = __import__(f"apps.modules.shear_connection.submodules.{slug_clean}.adapter", fromlist=["create_from_input"])
            return getattr(mod, "create_from_input", None)
        elif module_name == 'moment-connection':
            slug_clean = submodule_slug.replace('-', '_')
            mod = __import__(f"apps.modules.moment_connection.submodules.{slug_clean}.adapter", fromlist=["create_from_input"])
            return getattr(mod, "create_from_input", None)
        elif module_name == 'simple-connection':
            slug_clean = submodule_slug.replace('-', '_')
            mod = __import__(f"apps.modules.simple_connection.submodules.{slug_clean}.adapter", fromlist=["create_from_input"])
            return getattr(mod, "create_from_input", None)
        elif module_name == 'tension-member':
            slug_clean = submodule_slug.replace('-', '_')
            mod = __import__(f"apps.modules.tension_member.submodules.{slug_clean}.adapter", fromlist=["create_from_input"])
            return getattr(mod, "create_from_input", None)
        elif module_name == 'flexure-member':
            slug_clean = submodule_slug.replace('-', '_')
            mod = __import__(f"apps.modules.flexure_member.submodules.{slug_clean}.adapter", fromlist=["create_from_input"])
            return getattr(mod, "create_from_input", None)
        elif module_name in ('compression-member', 'Compression-Member-Design'):
            slug_clean = submodule_slug.replace('-', '_')
            mod = __import__(f"apps.modules.compression_member.submodules.{slug_clean}.adapter", fromlist=["create_from_input"])
            return getattr(mod, "create_from_input", None)
        elif module_name == 'base-plate':
            from apps.modules.base_plate.adapter import create_from_input
            return create_from_input
    except Exception as e:
        logger.warning(f"Could not dynamically import create_from_input for {module_name}/{submodule_slug}: {e}")
    return None



@shared_task
def healthcheck_task():
    return {"status": "ok", "worker": "celery"}


@shared_task(bind=True)
def run_design_calculation_task(self, module_name: str, submodule_slug: str, inputs: dict, project_id=None, user_email=None):
    """
    Celery task to run CPU-bound connection design calculations.
    """
    logger.info(f"Starting calculation task: {module_name}/{submodule_slug} (Task ID: {self.request.id})")
    
    ServiceClass = get_service_class(module_name, submodule_slug)
    if not ServiceClass:
        raise ValueError(f"Service class for {module_name}/{submodule_slug} not found")
        
    from apps.core.main_registry import WebMainRegistry
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
        
    design_status = True
    if result and isinstance(result, dict):
        for inst in reversed(instances):
            if hasattr(inst, 'design_status'):
                design_status = bool(inst.design_status)
                break
        result['design_status'] = design_status
        logger.info(f"Calculation task design_status resolved to: {design_status}")

        # Extract logs from recorded instances if result logs is empty/falsy
        if not result.get('logs'):
            extracted_logs = []
            from osdag_core.custom_logger import CustomLogger
            for inst in reversed(instances):
                if hasattr(inst, 'logger') and isinstance(inst.logger, CustomLogger):
                    inst_logs = inst.logger.get_logs()
                    if inst_logs:
                        extracted_logs.extend(inst_logs)
                elif hasattr(inst, 'logs') and inst.logs:
                    extracted_logs.extend(inst.logs)
            if extracted_logs:
                result['logs'] = extracted_logs
    else:
        # Fallback if result is None or not a dict
        for inst in reversed(instances):
            if hasattr(inst, 'design_status'):
                design_status = bool(inst.design_status)
                break
        extracted_logs = []
        from osdag_core.custom_logger import CustomLogger
        for inst in reversed(instances):
            if hasattr(inst, 'logger') and isinstance(inst.logger, CustomLogger):
                inst_logs = inst.logger.get_logs()
                if inst_logs:
                    extracted_logs.extend(inst_logs)
            elif hasattr(inst, 'logs') and inst.logs:
                extracted_logs.extend(inst.logs)
        result = {
            'success': False,
            'data': {},
            'logs': extracted_logs,
            'design_status': design_status
        }
    
    return result


@shared_task(bind=True)
def run_cad_generation_task(self, module_name: str, submodule_slug: str, inputs: dict, sections: list):
    """
    Celery task to generate CAD models.
    """
    logger.info(f"Starting CAD generation task: {module_name}/{submodule_slug} (Task ID: {self.request.id})")
    
    ServiceClass = get_service_class(module_name, submodule_slug)
    if not ServiceClass:
        raise ValueError(f"Service class for {module_name}/{submodule_slug} not found")
        
    create_from_input_func = get_create_from_input_func(module_name, submodule_slug)
    
    from apps.core.utils.cad_helpers import generate_cad_models
    result = generate_cad_models(
        service_class=ServiceClass,
        inputs=inputs,
        sections=sections,
        session_id=self.request.id,
        create_from_input_func=create_from_input_func
    )
    
    return result


@shared_task(bind=True)
def run_report_generation_task(self, mapped_data: dict):
    """
    Celery task to build initial reports.
    """
    logger.info(f"Starting report generation task (Task ID: {self.request.id})")
    
    from apps.core.api.design.report_customization_api import generate_initial_report_core
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


