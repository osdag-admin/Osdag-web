"""
Shear Connection ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
import traceback
from .registry import ShearConnectionRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Columns, Beams, Bolt, Material, CustomMaterials, Angles
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.sections.options_merge import merge_user_sections_into_options


SHEAR_REPORT_MODULE_ID_MAP = {
    "fin-plate": "FinPlateConnection",
    "cleat-angle": "CleatAngleConnection",
    # "end-plate": "EndPlateConnection",
    "header-plate": "HeaderPlateConnection",
    "seated-angle": "Seated-Angle-Connection",
}

# design/cad accept any registry-resolvable slug unless restricted — this is the
# same set of slugs options() actually serves data for, reused here so a
# submodule folder that exists on disk but was never wired into options()
# can't be reached through design/cad either.
SHEAR_CONNECTION_ALLOWED_SLUGS = frozenset(SHEAR_REPORT_MODULE_ID_MAP.keys())


class ShearConnectionViewSet(viewsets.ViewSet):
    """
    Generic ViewSet that routes to specific sub-module services based on URL slug.
    Supports guest mode and optional project_id saving for authenticated users.
    """
    permission_classes = [AllowAny]  # Allow both authenticated and guest users
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/shear-connection/{submodule_slug}/design/
        Asynchronously runs calculation task.
        """
        ServiceClass = ShearConnectionRegistry.get_service_by_slug_or_404(submodule_slug, SHEAR_CONNECTION_ALLOWED_SLUGS)
        return trigger_async_design('shear-connection', submodule_slug, ServiceClass, request)

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/shear-connection/{submodule_slug}/report/generate-initial/
        Asynchronously runs LaTeX report generation task.
        """
        return trigger_async_report('shear-connection', submodule_slug, SHEAR_REPORT_MODULE_ID_MAP, request)
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/shear-connection/{submodule_slug}/options/
        Returns dropdown/options data for the sub-module.
        """
        slug = submodule_slug

        # Common data helpers
        def material_list():
            mats = list(Material.objects.all().values())
            if hasattr(request, "user") and request.user.is_authenticated:
                mats += list(CustomMaterials.objects.filter(user=request.user).values())
            mats.append({"id": -1, "Grade": "Custom"})
            return mats

        def bolt_diameters():
            lst = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
            lst.sort()
            return lst

        property_classes = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']
        thickness_list = [
            '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50',
            '56', '63', '75', '80', '90', '100', '110', '120'
        ]
        connectivity_common = ['Column Flange-Beam-Web', 'Column Web-Beam-Web', 'Beam-Beam']

        try:
            if slug == 'fin-plate':
                data = {
                    'connectivityList': connectivity_common,
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                merged_data = merge_user_sections_into_options(request, data)
                return Response(
                    merged_data,
                    status=status.HTTP_200_OK,
                )

            if slug == 'cleat-angle':
                data = {
                    'connectivityList': connectivity_common,
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'angleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            if slug == 'header-plate':
                data = {
                    'connectivityList': connectivity_common,
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            if slug == 'seated-angle':
                data = {
                    'connectivityList': ['Column Flange-Beam-Web', 'Column Web-Beam-Web'],
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'angleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'topAngleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'boltDiameterList': bolt_diameters(),
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            return Response({'error': f'Sub-module {slug} not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/shear-connection/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        ServiceClass = ShearConnectionRegistry.get_service_by_slug_or_404(submodule_slug, SHEAR_CONNECTION_ALLOWED_SLUGS)
        return trigger_async_cad('shear-connection', submodule_slug, ServiceClass, request)
