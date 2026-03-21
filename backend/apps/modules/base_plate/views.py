"""
Base Plate ViewSet - design, options, and CAD endpoints.
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import Material, CustomMaterials, Columns, Beams
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.errors import format_error_response, get_error_status_code
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections

from .service import BasePlateService
from .adapter import create_from_input

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
        Request body: { "inputs": {...} } or raw dict.
        """
        inputs = request.data.get('inputs', request.data)
        project_id = request.data.get('project_id')

        context = handle_design_request(
            request=request,
            inputs=inputs,
            project_id=project_id,
            submodule_slug='base-plate',
            module_name='base-plate',
        )

        try:
            result = BasePlateService.calculate(
                inputs=inputs,
                request=request,
                project_id=project_id if not context.get('is_guest') else None,
                user_email=context.get('user_email'),
            )

            if context.get('project_result'):
                result['project_saved'] = context['project_result'].get('saved')
                if context['project_result'].get('project_id'):
                    result['project_id'] = context['project_result']['project_id']
                if context['project_result'].get('error'):
                    result['project_error'] = context['project_result']['error']

            status_code = 200 if result.get('success', True) else 400
            return Response(result, status=status_code)
        except Exception as exc:
            logger.error(f"Error in base plate design: {exc}", exc_info=True)
            error_response = format_error_response(exc)
            status_code = get_error_status_code(exc)
            return Response(error_response, status=status_code)

    @action(detail=False, methods=['get'], url_path='options')
    def options(self, request):
        """
        GET /api/modules/base-plate/options/
        Returns dropdown/options data for base plate (sectionDesignation, materialList, etc.).
        """
        email = request.query_params.get('email')

        def material_list():
            mats = list(Material.objects.all().values())
            if email:
                mats += list(CustomMaterials.objects.filter(email=email).values())
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
            return Response(data, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Base plate options failed")
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='cad')
    def cad(self, request):
        """
        POST /api/modules/base-plate/cad/
        Request body: { "inputs": {...}, "sections": ["Model", "Plate", ...] } (sections optional).
        Returns: { "status": "success"|"coming_soon", "files": {...}, "hover_dict": {...}, "warnings": [...] }
        """
        inputs = request.data.get('inputs', request.data)
        if not inputs:
            return Response({'error': 'inputs are required'}, status=status.HTTP_400_BAD_REQUEST)
        sections = request.data.get('sections')
        if not sections:
            sections = get_default_sections('base-plate', 'base-plate')
        if not sections:
            return Response(
                {'error': 'No sections defined for base-plate'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = generate_cad_models(
                service_class=BasePlateService,
                inputs=inputs,
                sections=sections,
                create_from_input_func=create_from_input,
            )
            if not result['files']:
                return Response(
                    {
                        'status': 'coming_soon',
                        'message': '3D model generation is coming soon for this module',
                        'files': {},
                        'hover_dict': result.get('hover_dict', {}),
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    'status': 'success',
                    'files': result['files'],
                    'hover_dict': result['hover_dict'],
                    'message': 'CAD models generated successfully',
                    'warnings': result.get('warnings', []),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            logger.exception("Base plate CAD failed: %s", exc)
            return Response(
                {
                    'status': 'coming_soon',
                    'message': '3D model generation is coming soon for this module',
                    'files': {},
                    'hover_dict': {},
                },
                status=status.HTTP_200_OK,
            )
