"""
Base Plate ViewSet - design, options, and CAD endpoints.
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import Material, CustomMaterials, Columns, Beams
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.errors import format_error_response, get_error_status_code
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections

from .service import BasePlateService
from .adapter import create_from_input
from apps.sections.options_merge import merge_user_sections_into_options

logger = logging.getLogger(__name__)

# Desktop-matching option lists (Common.py VALUES_*)
CONNECTIVITY_LIST = ['Welded Column Base', 'Moment Base Plate', 'Hollow/Tubular Column Base']
FOOTING_GRADE_LIST = ['Select Grade', 'M10', 'M15', 'M20', 'M25', 'M30', 'M35', 'M40', 'M45', 'M50', 'M55']
ANCHOR_TYPE_LIST = ['End Plate Type', 'IS 5624-Type A', 'IS 5624-Type B']
WELD_TYPE_LIST = ['Fillet Weld']
# Anchor diameters: IS 5624 notation (must match osdag_core other_standards.table1 keys: M8..M72)
ANCHOR_DIAMETER_LIST = ['M8', 'M10', 'M12', 'M16', 'M20', 'M24', 'M30', 'M36', 'M42', 'M48', 'M56', 'M64', 'M72']
# Match desktop IS1367_Part3_2002.get_bolt_PC() (Table 1 of IS 1367 Part-3:2002)
ANCHOR_GRADE_LIST = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']


class BasePlateViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='design')
    def design(self, request):
        """
        POST /api/modules/base-plate/design/
        Asynchronously runs calculation task.
        """
        return trigger_async_design('base-plate', 'base-plate', BasePlateService, request)

    @action(detail=False, methods=['get'], url_path='options')
    def options(self, request):
        """
        GET /api/modules/base-plate/options/
        Returns dropdown/options data for base plate (sectionDesignation, materialList, etc.).
        """
        
        def material_list():
            mats = list(Material.objects.all().values())
            if hasattr(request, "user") and request.user.is_authenticated:
                mats += list(CustomMaterials.objects.filter(user=request.user).values())
            mats.append({'id': -1, 'Grade': 'Custom'})
            return mats

        # Beams and Columns: combine column and beam designations for section list (desktop VALUE_BEAM_COL)
        def section_designation():
            cols = list(Columns.objects.values_list('Designation', flat=True).distinct())
            beams = list(Beams.objects.values_list('Designation', flat=True).distinct())
            combined = sorted(set(cols) | set(beams))
            return combined

        try:
            data = {
                'sectionDesignation': section_designation(),
                'profileList': ['Columns', 'Beams'],
                'materialList': material_list(),
                'anchorDiameterList': ANCHOR_DIAMETER_LIST,
                'anchorGradeList': ANCHOR_GRADE_LIST,
                'footingGradeList': FOOTING_GRADE_LIST,
                'connectivityList': CONNECTIVITY_LIST,
                'weldTypeList': WELD_TYPE_LIST,
                'anchorTypeList': ANCHOR_TYPE_LIST,
            }
            return Response(
                merge_user_sections_into_options(request, data),
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            logger.exception("Base plate options failed")
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='cad')
    def cad(self, request):
        """
        POST /api/modules/base-plate/cad/
        Asynchronously runs CAD generation task.
        """
        return trigger_async_cad('base-plate', 'base-plate', BasePlateService, request)
