"""
On-demand CAD export endpoint.

This regenerates the merged CAD shape from `input_values` in the module adapter and
exports the requested format (step/iges/brep/stl/ifc). IFC is produced in this view
from the generated BREP via `cad_export.export_ifc` (IfcOpenShell mesh).
"""

import json
import logging
import os
import uuid
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

from django.http import FileResponse, JsonResponse, HttpRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from apps.core.module_finder import get_module_api
from .cad_module_aliases import resolve_module_id


def _resolve_file_path(path: str, repo_root: str, backend_root: str) -> str:
    """Resolve a relative or absolute file path to an absolute path."""
    if os.path.isabs(path):
        return path

    candidate_repo = os.path.join(repo_root, path)
    if os.path.exists(candidate_repo):
        return candidate_repo

    candidate_backend = os.path.join(backend_root, path)
    if os.path.exists(candidate_backend):
        return candidate_backend

    return candidate_repo


@method_decorator(csrf_exempt, name="dispatch")
class CADExport(View):
    """
    POST /api/design/exportCad

    Body:
      {
        "module_id": "...",
        "input_values": {...},
        "section": "Model" (optional),
        "format": "step" | "iges" | "brep" | "stl" | "ifc"
      }
    """

    def post(self, request: HttpRequest):
        try:
            request_data = json.loads(request.body)
        except Exception:
            return JsonResponse({"status": "error", "message": "Invalid JSON body"}, status=400)

        module_id = request_data.get("module_id")
        input_values = request_data.get("input_values") or request_data.get("inputs")
        section = request_data.get("section") or "Model"
        format_type = (request_data.get("format") or "").lower()

        if not module_id:
            return JsonResponse({"status": "error", "message": "module_id is required"}, status=400)
        if not input_values:
            return JsonResponse({"status": "error", "message": "input_values are required"}, status=400)
        if not format_type:
            return JsonResponse({"status": "error", "message": "format is required"}, status=400)
        if format_type not in ("step", "iges", "brep", "stl", "ifc"):
            return JsonResponse({"status": "error", "message": "Invalid format type requested"}, status=400)

        resolved_module_id = resolve_module_id(module_id)

        # Resolve repo/back roots for file path handling
        current_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.abspath(os.path.join(current_dir, "../../../../../"))
        backend_root = os.path.join(repo_root, "backend")

        session_id = str(uuid.uuid4())

        module_api = get_module_api(resolved_module_id)

        export_formats = [format_type]

        # Call adapter to regenerate CAD and export requested format.
        # Adapter is expected to still write a merged brep and return its path.
        try:
            brep_path = module_api.create_cad_model(input_values, section, session_id, export_formats=export_formats)
        except TypeError:
            brep_path = module_api.create_cad_model(input_values, section, session_id)

        if not brep_path:
            return JsonResponse(
                {"status": "error", "message": "CAD export failed: adapter returned empty brep_path"},
                status=422,
            )

        brep_abs = _resolve_file_path(brep_path, repo_root, backend_root)

        # Derive output path even if adapter returns non-brep (some adapters prefer STL/STEP).
        def _swap_ext(abs_path: str, new_ext: str) -> str:
            for ext in (".brep", ".stl", ".step", ".iges", ".ifc"):
                if abs_path.lower().endswith(ext):
                    return abs_path[: -len(ext)] + new_ext
            # Fallback: attempt brep replace
            if ".brep" in abs_path:
                return abs_path.replace(".brep", new_ext)
            return abs_path

        if format_type == "ifc":
            from apps.core.utils.cad_export import export_ifc
            from apps.core.utils.report_image_generator import read_brep_file

            out_abs_path = os.path.normpath(_swap_ext(brep_abs, ".ifc"))
            try:
                shape = read_brep_file(brep_abs)
                export_ifc(shape, out_abs_path)
            except Exception as e:
                logger.exception(
                    "IFC export failed (module_id=%s, brep=%s, out=%s)",
                    module_id,
                    brep_abs,
                    out_abs_path,
                )
                return JsonResponse(
                    {"status": "error", "message": f"IFC export failed: {e!s}"},
                    status=500,
                )
        elif format_type == "brep":
            out_abs_path = _swap_ext(brep_abs, ".brep")
        elif format_type == "stl":
            out_abs_path = _swap_ext(brep_abs, ".stl")
        elif format_type == "step":
            out_abs_path = _swap_ext(brep_abs, ".step")
        elif format_type == "iges":
            out_abs_path = _swap_ext(brep_abs, ".iges")
        else:
            out_abs_path = _swap_ext(brep_abs, f".{format_type}")

        if not os.path.exists(out_abs_path):
            return JsonResponse(
                {
                    "status": "error",
                    "message": f"{format_type.upper()} file does not exist.",
                    "expected_path": out_abs_path,
                },
                status=404,
            )

        # Read into memory then delete - zero disk accumulation for on-demand exports
        from io import BytesIO
        with open(out_abs_path, "rb") as f:
            file_bytes = f.read()
        try:
            os.remove(out_abs_path)
            logger.info(f"[CADExport] Deleted temp file: {out_abs_path}")
        except Exception as e:
            logger.warning(f"[CADExport] Could not delete temp file {out_abs_path}: {e}")

        response = FileResponse(BytesIO(file_bytes), content_type="application/octet-stream")
        response["Content-Disposition"] = f'attachment; filename="{session_id}_{section}.{format_type}"'
        return response

