from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core.models import Beams, Columns, Material, Angles, Channels


class DesignPreference(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        supported_section = request.GET.get("supported_section")
        supporting_section = request.GET.get("supporting_section")
        connectivity = request.GET.get("connectivity")
        material = request.GET.get("material")
        section_type = request.GET.get("section_type")
        # Session validation removed - now stateless

        connector_material_details = []
        if material:
            connector_material_details = Material.objects.filter(Grade=material).values()
            return Response({"connector_material_details": connector_material_details }, status=status.HTTP_200_OK)
        
        if section_type:
            model_map = {
                "angles": Angles.objects,
                "channels": Channels.objects,
                "columns": Columns.objects,
                "beams": Beams.objects,
            }
            target_model = model_map.get(section_type.lower())
            if target_model:
                supported_section_results = target_model.filter(Designation=supported_section).values()
                return Response({"supported_section_results": supported_section_results}, status=status.HTTP_200_OK)

        if connectivity == 'Beam-Beam':
            supported_section_results = Beams.objects.filter(Designation=supported_section).values()
            supporting_section_results = Beams.objects.filter(Designation=supporting_section).values()
        elif not connectivity:
            supported_section_results = Beams.objects.filter(Designation=supported_section).values()
            return Response({"supported_section_results": supported_section_results}, status=status.HTTP_200_OK)
        else :
            supported_section_results = Beams.objects.filter(Designation=supported_section).values()
            supporting_section_results = Columns.objects.filter(Designation=supporting_section).values()

        return Response({"supported_section_results": supported_section_results, "supporting_section_results":supporting_section_results}, status=status.HTTP_200_OK)
