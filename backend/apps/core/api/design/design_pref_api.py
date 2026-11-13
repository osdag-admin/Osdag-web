from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core.api.design.sync_merge import first_row, lookup_sources


class DesignPreference(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        supported_section = request.GET.get("supported_section")
        supporting_section = request.GET.get("supporting_section")
        connectivity = request.GET.get("connectivity")
        material = request.GET.get("material")
        section_type = request.GET.get("section_type")
        # Session validation removed - now stateless

        # Signed-in users' custom rows are searched before the catalog.
        sources = lookup_sources(request.user)

        def matching(key, **lookup):
            row = first_row(sources[key], **lookup)
            return [row] if row else []

        if material:
            connector_material_details = matching("material_model", Grade=material)
            return Response({"connector_material_details": connector_material_details }, status=status.HTTP_200_OK)

        if section_type:
            model_map = {
                "angles": "angles_model",
                "channels": "channels_model",
                "columns": "columns_model",
                "beams": "beams_model",
            }
            target_key = model_map.get(section_type.lower())
            if target_key:
                supported_section_results = matching(target_key, Designation=supported_section)
                return Response({"supported_section_results": supported_section_results}, status=status.HTTP_200_OK)

        if connectivity == 'Beam-Beam':
            supported_section_results = matching("beams_model", Designation=supported_section)
            supporting_section_results = matching("beams_model", Designation=supporting_section)
        elif not connectivity:
            supported_section_results = matching("beams_model", Designation=supported_section)
            return Response({"supported_section_results": supported_section_results}, status=status.HTTP_200_OK)
        else :
            supported_section_results = matching("beams_model", Designation=supported_section)
            supporting_section_results = matching("columns_model", Designation=supporting_section)

        return Response({"supported_section_results": supported_section_results, "supporting_section_results":supporting_section_results}, status=status.HTTP_200_OK)
