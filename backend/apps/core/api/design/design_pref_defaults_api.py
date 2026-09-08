"""
POST /api/design-preferences/defaults/

Resolve Additional Inputs defaults from current module + dock inputs.
"""
from apps.core.permissions import IsEmailVerifiedIfAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.core.models import Material, Beams, Columns, Angles, Channels
from apps.core.api.design.sync_merge import build_design_pref_defaults


class DesignPreferenceDefaults(APIView):
    permission_classes = [IsEmailVerifiedIfAuthenticated]

    def post(self, request):
        body = request.data if isinstance(request.data, dict) else {}
        module_session_name = body.get("module_session_name") or body.get("module") or ""
        inputs = body.get("inputs") or {}
        if not module_session_name:
            return Response(
                {"error": "module_session_name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            default_pref_inputs, metadata, material_details, section_details = build_design_pref_defaults(
                module_session_name=module_session_name,
                inputs=inputs,
                material_model=Material.objects,
                beams_model=Beams.objects,
                columns_model=Columns.objects,
                angles_model=Angles.objects,
                channels_model=Channels.objects,
            )
        except Exception as exc:
            return Response(
                {"error": str(exc), "success": False},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "success": True,
                "default_pref_inputs": default_pref_inputs,
                "metadata": metadata,
                "material_details": material_details,
                "section_details": section_details,
                "version": 1,
            },
            status=status.HTTP_200_OK,
        )
