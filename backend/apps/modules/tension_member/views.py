"""
Tension Member ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .registry import TensionMemberRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Material, CustomMaterials, Bolt, Angles, Channels
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.sections.options_merge import merge_user_sections_into_options


# Mapping from tension-member slug to legacy report module_id
TENSION_REPORT_MODULE_ID_MAP = {
    "bolted": "Tension-Member-Bolted-Design",
    "welded": "Tension-Member-Welded-Design",
}

# design/cad accept any registry-resolvable slug unless restricted — reuse the
# same allowlist options() already serves data for.
TENSION_MEMBER_ALLOWED_SLUGS = frozenset(TENSION_REPORT_MODULE_ID_MAP.keys())


class TensionMemberViewSet(viewsets.ViewSet):
    """
    Generic ViewSet that routes to specific sub-module services based on URL slug.
    Supports guest mode and optional project_id saving for authenticated users.
    """
    permission_classes = [AllowAny]  # Allow both authenticated and guest users

    @staticmethod
    def _normalize_slug(raw_slug: str) -> str:
        """
        Accept both URL slugs and MODULE_ID values from legacy/frontend calls.
        Example inputs:
          - 'bolted', 'welded' (preferred)
          - 'Tension-Member-Bolted-Design', 'Tension-Member-Welded-Design' (legacy)
        """
        if not raw_slug:
            return raw_slug
        slug_lower = raw_slug.lower()
        module_id_map = {
            'tension-member-bolted-design': 'bolted',
            'tension-member-welded-design': 'welded',
        }
        return module_id_map.get(slug_lower, raw_slug)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/tension-member/{submodule_slug}/design/
        Asynchronously runs calculation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        ServiceClass = TensionMemberRegistry.get_service_by_slug_or_404(normalized_slug, TENSION_MEMBER_ALLOWED_SLUGS)
        return trigger_async_design('tension-member', normalized_slug, ServiceClass, request)

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/tension-member/{submodule_slug}/report/generate-initial/
        Asynchronously runs LaTeX report generation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        # Note: trigger_async_report takes mapped data. We pass the slug normalization.
        # Since trigger_async_report checks the map, we should pass the normalized slug.
        return trigger_async_report('tension-member', normalized_slug, TENSION_REPORT_MODULE_ID_MAP, request)
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/tension-member/{submodule_slug}/options/
        
        Returns input options for the sub-module (e.g., section lists, materials)
        """
        slug = self._normalize_slug(submodule_slug)

        # Shared helpers
        def material_list():
            mats = list(Material.objects.all().values())
            if hasattr(request, "user") and request.user.is_authenticated:
                mats += list(CustomMaterials.objects.filter(user=request.user).values())
            mats.append({"id": -1, "Grade": "Custom"})
            return mats

        def bolt_diameters():
            lst = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
            lst.sort()
            return [str(x) for x in lst]

        property_classes = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']
        thickness_list = [
            '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50',
            '56', '63', '75', '80', '90', '100', '110', '120'
        ]
        section_profiles = ["Angles", "Back to Back Angles", "Star Angles", "Channels"]
        bolt_hole_type_list = ["Standard", "Oversized", "Short Slotted", "Long Slotted"]
        bolt_type_list = ["Bearing Bolt", "Friction Grip Bolt"]
        bolt_slip_factor_list = ["0.3", "0.5"]
        design_method_list = ["Limit State Design", "Working Stress Design"]
        edge_type_list = ["Rolled, machine-flame cut, sawn and planed"]
        corrosive_influences_list = ["Yes", "No"]

        try:
            if slug == 'bolted':
                data = {
                    'materialList': material_list(),
                    'connectorMaterialList': material_list(),
                    'sectionProfileList': section_profiles,
                    'angleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'channelList': list(Channels.objects.values_list('Designation', flat=True)),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                    'boltHoleTypeList': bolt_hole_type_list,
                    'boltTypeList': bolt_type_list,
                    'boltSlipFactorList': bolt_slip_factor_list,
                    'designMethodList': design_method_list,
                    'edgeTypeList': edge_type_list,
                    'corrosiveInfluencesList': corrosive_influences_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            if slug == 'welded':
                data = {
                    'materialList': material_list(),
                    'connectorMaterialList': material_list(),
                    'sectionProfileList': section_profiles,
                    'angleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'channelList': list(Channels.objects.values_list('Designation', flat=True)),
                    'thicknessList': thickness_list,
                    'designMethodList': design_method_list,
                    'edgeTypeList': edge_type_list,
                    'corrosiveInfluencesList': corrosive_influences_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            return Response({'error': f'Sub-module {slug} not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/tension-member/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        ServiceClass = TensionMemberRegistry.get_service_by_slug_or_404(normalized_slug, TENSION_MEMBER_ALLOWED_SLUGS)
        return trigger_async_cad('tension-member', normalized_slug, ServiceClass, request)
