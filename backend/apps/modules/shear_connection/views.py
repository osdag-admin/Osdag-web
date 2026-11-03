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
from osdag_core.Common import (
    KEY_DISP_FINPLATE, KEY_DISP_CLEATANGLE, KEY_DISP_HEADERPLATE, KEY_DISP_SEATED_ANGLE,
    VALUES_CONN, VALUES_CONN_1,
)
from .registry import ShearConnectionRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_report
)
from apps.core import catalog
from apps.core.models import CustomMaterials
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.sections.options_merge import merge_user_sections_into_options
from apps.core.utils.api_errors import error_response


SHEAR_REPORT_MODULE_ID_MAP = {
    "fin-plate": KEY_DISP_FINPLATE,
    "cleat-angle": KEY_DISP_CLEATANGLE,
    "header-plate": KEY_DISP_HEADERPLATE,
    "seated-angle": KEY_DISP_SEATED_ANGLE,
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
            mats = catalog.rows("Material")
            if hasattr(request, "user") and request.user.is_authenticated:
                mats += list(CustomMaterials.objects.filter(user=request.user).values())
            mats.append({"id": -1, "Grade": "Custom"})
            return mats

        def bolt_diameters():
            return catalog.bolt_diameters()

        property_classes = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']
        thickness_list = [
            '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50',
            '56', '63', '75', '80', '90', '100', '110', '120'
        ]
        connectivity_common = list(VALUES_CONN)

        try:
            if slug == 'fin-plate':
                data = {
                    'connectivityList': connectivity_common,
                    'columnList': catalog.designations("Columns"),
                    'beamList': catalog.designations("Beams"),
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
                    'columnList': catalog.designations("Columns"),
                    'beamList': catalog.designations("Beams"),
                    'materialList': material_list(),
                    'angleList': catalog.designations("Angles"),
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
                    'columnList': catalog.designations("Columns"),
                    'beamList': catalog.designations("Beams"),
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
                    'connectivityList': list(VALUES_CONN_1),
                    'columnList': catalog.designations("Columns"),
                    'beamList': catalog.designations("Beams"),
                    'materialList': material_list(),
                    'angleList': catalog.designations("Angles"),
                    'topAngleList': catalog.designations("Angles"),
                    'boltDiameterList': bolt_diameters(),
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            return error_response('submodule_not_found', f'Sub-module {slug} not found', 404)
        except Exception as e:
            return error_response('internal_error', str(e), 500)
    
