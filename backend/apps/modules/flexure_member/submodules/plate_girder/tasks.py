"""
Celery task for Plate Girder PSO optimization.

Runs PlateGirderWelded.optimized_method() inside a Celery worker and streams
progress updates to a WebSocket channel via Django Channels. Task execution
supports `.delay()` with revocation on client disconnect; particle updates are
batched (via DataProcessor) for smooth real-time graph updates on the client.
"""
import time
import json
import logging
import os
import sys
import traceback
from contextlib import contextmanager, redirect_stdout
from typing import Any, Dict, List, Tuple

from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import numpy as np

# Add project root to sys.path to access osdag_core
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../../"))
if project_root not in sys.path:
    sys.path.append(project_root)

from osdag_core.design_type.plate_girder.visualization.pso_visualizer import DataProcessor

from apps.modules.flexure_member.submodules.plate_girder.adapter import (
    create_optimization_input,
    determine_optimization_flags,
    create_module,
)
from osdag_core.Common import (
    KEY_MATERIAL, KEY_LENGTH, KEY_SHEAR, KEY_MOMENT, KEY_WEB_PHILOSOPHY,
    KEY_TOP_FLANGE_THICKNESS_PG, KEY_BOTTOM_FLANGE_THICKNESS_PG, KEY_WEB_THICKNESS_PG
)

logger = logging.getLogger(__name__)

SEND_INTERVAL = 0.08  # Stream particle batches at ~12 FPS for responsive UI updates.
MAX_PARTICLES_PER_BATCH = 50  # One full 50-particle swarm per message at most.
HEARTBEAT_INTERVAL = 2.0  # seconds


@contextmanager
def _suppress_core_stdout():
    """Prevent verbose core PSO print/log output from blocking realtime streaming."""
    previous_disable_level = logging.root.manager.disable
    logging.disable(logging.WARNING)
    try:
        with open(os.devnull, "w") as devnull, redirect_stdout(devnull):
            yield
    finally:
        logging.disable(previous_disable_level)


def _to_output_dict(raw_output: List[List[Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Convert PlateGirderWelded.output_values(True) result to a dict.
    """
    output: Dict[str, Dict[str, Any]] = {}
    for param in raw_output or []:
        if len(param) >= 4:
            key, label, param_type, value = param[0], param[1], param[2], param[3]
            if param_type == "TextBox" and key is not None:
                if hasattr(value, "item"):
                    value = value.item()
                output[key] = {"key": key, "label": label, "val": value}
    return output


def _sanitize_for_channels(obj: Any) -> Any:
    """
    Recursively convert objects to msgpack-serializable types.
    - numpy scalars -> Python scalars
    - numpy arrays -> lists of scalars
    """
    if isinstance(obj, dict):
        return {k: _sanitize_for_channels(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_channels(v) for v in obj]
    if isinstance(obj, tuple):
        return tuple(_sanitize_for_channels(v) for v in obj)

    # Numpy scalar
    if isinstance(obj, np.generic):
        return obj.item()

    # Numpy array
    if isinstance(obj, np.ndarray):
        return [_sanitize_for_channels(v) for v in obj.tolist()]

    return obj


@shared_task(bind=True, max_retries=3)
def run_pso_optimization(self, channel_name: str, input_data: Dict[str, Any]):
    """
    Celery task that runs Plate Girder PSO optimization and streams results
    to a WebSocket channel identified by `channel_name`.
    """
    # Track statistics for logging
    update_count = 0
    throttled_count = 0

    task_start_time = time.time()
    logger.info("=" * 80)
    logger.info("PSO Optimization Task STARTED")
    logger.info("=" * 80)
    logger.info(f"Task ID: {getattr(self.request, 'id', 'local')}")
    logger.info(f"Channel: {channel_name}")
    logger.info(f"Input keys: {list(input_data.keys())[:10]}...")

    channel_layer = get_channel_layer()
    seq = 0
    last_send = 0.0
    last_heartbeat = 0.0
    current_iteration = -1  # Track current iteration
    particles_in_batch = 0

    # Initialize the real-time visualizer data processor
    data_processor = DataProcessor()

    def send_update_event(payload: Dict[str, Any]):
        nonlocal seq, last_send, update_count, current_iteration, particles_in_batch
        seq += 1
        payload["sequence"] = seq
        update_count += 1
        current_iteration = payload.get("iteration", current_iteration)
        particles_in_batch += len(payload.get("particles") or [payload])

        try:
            async_to_sync(channel_layer.send)(
                channel_name,
                {
                    "type": "pso_update",
                    "data": _sanitize_for_channels(payload),
                },
            )
        except Exception as e:
            logger.error(f"Failed to send update to channel: {e}")
            traceback.print_exc()

        last_send = time.time()

        logger.debug(
            f"PSO Update #{update_count} sent | "
            f"Iteration: {current_iteration}, "
            f"Particles in payload: {len(payload.get('particles') or [payload])}"
        )

    def send_heartbeat_if_needed():
        nonlocal last_heartbeat
        now = time.time()
        if now - last_heartbeat >= HEARTBEAT_INTERVAL:
            async_to_sync(channel_layer.send)(
                channel_name,
                {
                    "type": "pso_heartbeat",
                    "data": {
                        "sequence": seq + 1,
                        "status": "alive",
                        "timestamp": now,
                    },
                },
            )
            last_heartbeat = now
            logger.debug(f"Heartbeat sent | Iteration: {current_iteration}, Updates sent: {update_count}")

    try:
        # Build design dictionary and flags
        logger.info("Building design dictionary from input data...")
        design_dict = create_optimization_input(input_data)
        is_thick_web, is_symmetric = determine_optimization_flags(input_data)

        # Log input summary
        logger.info("INPUT SUMMARY:")
        logger.info(f"  Member Length: {input_data.get('Member.Length', 'N/A')} mm")
        logger.info(f"  Load - Moment: {input_data.get('Load.Moment', 'N/A')} kNm")
        logger.info(f"  Load - Shear: {input_data.get('Load.Shear', 'N/A')} kN")
        logger.info(f"  Material: {input_data.get('Material', 'N/A')}")
        logger.info(f"  Web Philosophy: {input_data.get('Design.Web_Philosophy', 'N/A')}")
        logger.info(f"  Is Thick Web: {is_thick_web}")
        logger.info(f"  Is Symmetric: {is_symmetric}")

        logger.info("Creating PlateGirderWelded module...")
        module = create_module()

        # Apply custom optimization bounds if provided
        from .adapter import apply_optimization_bounds
        apply_optimization_bounds(module, input_data)

        # CRITICAL: For optimization, we need to call set_input_values() BUT with scalar
        # thickness values, then override the thickness lists for PSO to use.
        logger.info("Calling set_input_values with scalar thickness values...")

        scalar_design_dict = design_dict.copy()
        scalar_design_dict[KEY_TOP_FLANGE_THICKNESS_PG] = (
            design_dict[KEY_TOP_FLANGE_THICKNESS_PG][0]
            if isinstance(design_dict[KEY_TOP_FLANGE_THICKNESS_PG], list)
            else design_dict[KEY_TOP_FLANGE_THICKNESS_PG]
        )
        scalar_design_dict[KEY_BOTTOM_FLANGE_THICKNESS_PG] = (
            design_dict[KEY_BOTTOM_FLANGE_THICKNESS_PG][0]
            if isinstance(design_dict[KEY_BOTTOM_FLANGE_THICKNESS_PG], list)
            else design_dict[KEY_BOTTOM_FLANGE_THICKNESS_PG]
        )
        scalar_design_dict[KEY_WEB_THICKNESS_PG] = (
            design_dict[KEY_WEB_THICKNESS_PG][0]
            if isinstance(design_dict[KEY_WEB_THICKNESS_PG], list)
            else design_dict[KEY_WEB_THICKNESS_PG]
        )

        # Call set_input_values with scalar values to initialize all attributes
        # (suppress verbose core stdout so realtime streaming stays responsive)
        with _suppress_core_stdout():
            module.set_input_values(scalar_design_dict)

        # Now override the thickness lists for PSO optimization
        logger.info("Overriding thickness lists for PSO optimization...")
        module.top_flange_thickness_list = design_dict[KEY_TOP_FLANGE_THICKNESS_PG]
        module.bottom_flange_thickness_list = design_dict[KEY_BOTTOM_FLANGE_THICKNESS_PG]
        module.web_thickness_list = design_dict[KEY_WEB_THICKNESS_PG]

        # Import stiffener thickness keys
        from osdag_core.Common import (
            KEY_IntermediateStiffener_thickness_val,
            KEY_LongitudnalStiffener_thickness_val,
        )

        # Override stiffener thickness lists
        module.int_thickness_list = design_dict.get(KEY_IntermediateStiffener_thickness_val, [])
        module.long_thickness_list = design_dict.get(KEY_LongitudnalStiffener_thickness_val, [])

        logger.info(f"  Top flange thicknesses: {module.top_flange_thickness_list}")
        logger.info(f"  Bottom flange thicknesses: {module.bottom_flange_thickness_list}")
        logger.info(f"  Web thicknesses: {module.web_thickness_list}")
        logger.info(f"  Intermediate stiffener thicknesses: {module.int_thickness_list}")
        logger.info(f"  Longitudinal stiffener thicknesses: {module.long_thickness_list}")

        # Log initial bounds (if available from module)
        if hasattr(module, 'bounds_map'):
            logger.info("OPTIMIZATION BOUNDS:")
            for var, bounds in module.bounds_map.items():
                if len(bounds) >= 2:
                    logger.info(f"  {var}: [{bounds[0]}, {bounds[1]}]" +
                                (f" step={bounds[2]}" if len(bounds) > 2 else ""))

        # Particle buffer for batched sending (smooths real-time graph updates)
        particle_buffer = []

        # Progress callback from optimized_method
        def viz_callback(depth, ur, weight_kg, iteration, particle_idx, position, variable_list, lb, ub):
            nonlocal last_send, throttled_count, current_iteration
            now = time.time()

            # Create particle data object
            particle_data = {
                "iteration": iteration,
                "particle_index": particle_idx,
                "depth": depth,
                "ur": ur,
                "weight_kg": weight_kg,
                "variables": position,
                "variable_names": variable_list,
                "bounds": {"lb": lb, "ub": ub},
                "plot_image": None,
            }

            # Update the data processor for server-side state (if needed)
            data_processor.add_particle_data(
                depth, ur, weight_kg, iteration, particle_idx,
                position=position, variables=variable_list, lb=lb, ub=ub
            )

            # Add to buffer
            particle_buffer.append(particle_data)

            if (
                update_count == 0
                or now - last_send >= SEND_INTERVAL
                or len(particle_buffer) >= MAX_PARTICLES_PER_BATCH
            ):
                # Send every computed particle, but coalesce them into frame-sized
                # batches so the browser is not asked to redraw once per particle.
                if particle_buffer:
                    send_update_event({
                        "iteration": iteration,
                        "batch": True,
                        "particles": list(particle_buffer),
                    })
                    particle_buffer.clear()
                    last_send = now
                    current_iteration = iteration
            else:
                throttled_count += 1

            send_heartbeat_if_needed()

        # Run optimization
        logger.info("Starting PSO optimization...")
        logger.info(f"  PSO Type: {'IntelligentPSO' if getattr(module, 'use_intelligent_pso', False) else 'GlobalBestPSO'}")
        logger.info(f"  Max Iterations: 100 (hardcoded in optimized_method)")
        logger.info(f"  Particles: 50 (hardcoded in optimized_method)")
        optimization_start = time.time()

        logger.debug("Calling module.optimized_method...")
        with _suppress_core_stdout():
            result = module.optimized_method(
                design_dict,
                is_thick_web=is_thick_web,
                is_symmetric=is_symmetric,
                viz_callback=viz_callback,
            )
        logger.debug("Optimization finished with result: %s", result is not None)

        # Flush any particles that were still buffered when optimization ended.
        if particle_buffer:
            send_update_event({
                "iteration": current_iteration,
                "batch": True,
                "particles": list(particle_buffer),
            })
            particle_buffer.clear()

        optimization_duration = time.time() - optimization_start
        logger.info(f"PSO optimization completed in {optimization_duration:.2f} seconds")
        logger.info(f"  Final Iteration: {current_iteration}")
        logger.info(f"  Total Updates Sent: {update_count}")
        logger.info(f"  Throttled (dropped): {throttled_count}")
        logger.info(f"  PSO Result: {result}")

        # Prepare final output
        logger.info("Preparing final output...")
        with _suppress_core_stdout():
            raw_output = module.output_values(True)
        output = _to_output_dict(raw_output)

        logger.info(f"  Output parameters: {len(output)}")
        logger.info("  Key outputs:")
        for key in list(output.keys())[:5]:  # Log first 5 output keys
            logger.info(f"    - {key}: {output[key].get('val', 'N/A')}")

        # Generate CAD for the optimized section (the module now holds the
        # optimized dimensions). Best-effort: never fail the run over CAD.
        # The frontend renders a base64 STL data URI (same as the /cad flow),
        # so read the generated STL and encode it — not the raw file path.
        cad_paths = {}
        try:
            import base64 as _b64
            from apps.modules.flexure_member.submodules.plate_girder.adapter import (
                build_plate_girder_cad,
            )
            cad_session = f"pso_{getattr(self.request, 'id', 'local')}"
            for cad_section in ("Model", "Web", "Top Flange", "Bottom Flange", "Stiffeners"):
                try:
                    rel_path = build_plate_girder_cad(module, cad_section, cad_session)
                    if not rel_path:
                        continue
                    abs_path = os.path.join(os.getcwd(), rel_path)
                    stl_path = abs_path.replace(".brep", ".stl")
                    src = stl_path if os.path.exists(stl_path) else abs_path
                    with open(src, "rb") as fh:
                        b64 = _b64.b64encode(fh.read()).decode("ascii")
                    cad_paths[cad_section] = f"data:application/octet-stream;base64,{b64}"
                except Exception as cad_e:
                    logger.warning(f"CAD generation for '{cad_section}' failed: {cad_e}")
            logger.info(f"Optimized CAD sections generated: {list(cad_paths.keys())}")
        except Exception as cad_outer:
            logger.warning(f"CAD generation skipped: {cad_outer}")

        # Final completion message
        seq += 1
        async_to_sync(channel_layer.send)(
            channel_name,
            {
                "type": "pso_complete",
                "data": {
                    "sequence": seq,
                    "cad_paths": cad_paths,
                    "result": _sanitize_for_channels(
                        {
                            "design": output,
                            "raw": raw_output,
                            "pso_result": result,
                        }
                    ),
                },
            },
        )

        total_duration = time.time() - task_start_time
        logger.info("=" * 80)
        logger.info("PSO Optimization Task COMPLETED")
        logger.info("=" * 80)
        logger.info(f"Total Duration: {total_duration:.2f} seconds")
        logger.info(f"Optimization Duration: {optimization_duration:.2f} seconds")
        logger.info(f"Total Updates Sent: {update_count}")
        logger.info(f"Throttled Updates: {throttled_count}")
        logger.info(f"Final Sequence Number: {seq}")
        logger.info("=" * 80)

    except Exception as e:
        total_duration = time.time() - task_start_time
        error_traceback = traceback.format_exc()

        logger.error("=" * 80)
        logger.error("PSO Optimization Task FAILED")
        logger.error("=" * 80)
        logger.error(f"Task ID: {getattr(self.request, 'id', 'local')}")
        logger.error(f"Channel: {channel_name}")
        logger.error(f"Duration before failure: {total_duration:.2f} seconds")
        logger.error(f"Exception Type: {type(e).__name__}")
        logger.error(f"Exception Message: {str(e)}")
        logger.error("Full Traceback:")
        logger.error(error_traceback)
        logger.error("=" * 80)

        async_to_sync(channel_layer.send)(
            channel_name,
            {
                "type": "pso_error",
                "data": {
                    "sequence": seq + 1,
                    "message": str(e),
                    "traceback": error_traceback,
                },
            },
        )
        raise
