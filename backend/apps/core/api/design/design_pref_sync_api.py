"""
POST /api/design-preferences/sync/

Design preference sync for web.
"""
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.core.models import Material, Beams, Columns
from apps.core.api.design.sync_merge import merge_design_pref_sync, VALID_OPERATIONS


class DesignPreferenceSync(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        body = request.data if isinstance(request.data, dict) else {}
        module_session_name = body.get("module_session_name") or body.get("module") or ""
        inputs = body.get("inputs") or {}
        design_pref_draft = body.get("design_pref_draft")
        operation = (body.get("operation") or "open").strip().lower()
        if operation not in VALID_OPERATIONS:
            return Response(
                {"error": "Invalid operation", "valid": list(VALID_OPERATIONS)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not module_session_name:
            return Response(
                {"error": "module_session_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            resolved_inputs, meta, material_details, section_details = merge_design_pref_sync(
                module_session_name=module_session_name,
                inputs=inputs,
                operation=operation,
                design_pref_draft=design_pref_draft,
                material_model=Material.objects,
                beams_model=Beams.objects,
                columns_model=Columns.objects,
            )
        except Exception as e:
            return Response(
                {"error": str(e), "success": False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "success": True,
                "resolved_inputs": resolved_inputs,
                "metadata": meta,
                "material_details": material_details,
                "section_details": section_details,
                "version": 1,
            },
            status=status.HTTP_200_OK,
        )
