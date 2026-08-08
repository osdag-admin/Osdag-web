"""
Simple Connection ViewSet - routes to sub-module services via slug.
Mirrors shear_connection pattern (design + options endpoints).
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import Material, CustomMaterials, Bolt
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.utils.errors import format_error_response, get_error_status_code
from apps.core.api.design.report_customization_api import generate_initial_report_core
from .registry import SimpleConnectionRegistry

logger = logging.getLogger(__name__)


# Mapping from simple-connection slug to module_id used by CreateDesignReport
SIMPLE_CONNECTION_REPORT_MODULE_ID_MAP = {
    "butt-joint-bolted": "ButtJointBolted",
    "butt-joint-welded": "ButtJointWelded",
    "lap-joint-bolted": "LapJointBolted",
    "lap-joint-welded": "LapJointWelded",
}

# design/cad accept any registry-resolvable slug unless restricted — reuse the
# same allowlist options() already serves data for.
SIMPLE_CONNECTION_ALLOWED_SLUGS = frozenset(SIMPLE_CONNECTION_REPORT_MODULE_ID_MAP.keys())


class SimpleConnectionViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/simple-connection/{slug}/design/
        Asynchronously runs calculation task.
        """
        ServiceClass = SimpleConnectionRegistry.get_service_by_slug_or_404(submodule_slug, SIMPLE_CONNECTION_ALLOWED_SLUGS)
        return trigger_async_design('simple-connection', submodule_slug, ServiceClass, request)

    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/simple-connection/{slug}/options/
        Provides dropdown/options data for simple connections.
        """
        slug = submodule_slug

        def material_list():
            mats = list(Material.objects.all().values())
            if hasattr(request, "user") and request.user.is_authenticated:
                mats += list(CustomMaterials.objects.filter(user=request.user).values())
            mats.append({"id": -1, "Grade": "Custom"})
            return mats

        def bolt_diameters():
            lst = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
            lst.sort()
            # frontend expects strings convertible to numbers
            return [str(x) for x in lst]

        property_classes = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']
        thickness_list = [
            '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50',
            '56', '63', '75', '80', '90', '100', '110', '120'
        ]
        cover_plate_list = ['Single-Cover', 'Double-Cover']
        weld_size_list = ['4', '5', '6', '8', '10', '12']

        # Design preferences options
        bolt_type_list = ['Non Pre-tensioned', 'Pre-tensioned']
        bolt_hole_type_list = ['Standard', 'Over-sized']
        slip_factor_list = ['0.3', '0.45', '0.5']
        edge_type_list = ['Sheared or hand flame cut', 'Rolled, machine-flame cut, sawn and planed']
        weld_type_list = ['Shop weld', 'Field weld']
        design_for_list = ['Tension', 'Compression']
        packing_plate_list = ['Yes', 'No']

        try:
            if slug in ('butt-joint-bolted', 'lap-joint-bolted'):
                data = {
                    'materialList': material_list(),
                    'thicknessList': thickness_list,
                    'coverPlateList': cover_plate_list,
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    # Design preferences
                    'designPreferences': {
                        'bolt': {
                            'boltType': bolt_type_list,
                            'boltHoleType': bolt_hole_type_list,
                            'slipFactor': slip_factor_list,
                        },
                        'detailing': {
                            'edgeType': edge_type_list,
                        },
                        'design': {
                            'designFor': design_for_list,
                        }
                    }
                }
                return Response(data, status=status.HTTP_200_OK)

            if slug in ('butt-joint-welded', 'lap-joint-welded'):
                data = {
                    'materialList': material_list(),
                    'thicknessList': thickness_list,
                    'coverPlateList': cover_plate_list,
                    'weldSizeList': weld_size_list,
                    # Design preferences
                    'designPreferences': {
                        'weld': {
                            'weldType': weld_type_list,
                            # weldMaterialGradeOverwrite is a text input (Fu in MPa)
                        },
                        'detailing': {
                            'edgeType': edge_type_list,
                            'packingPlate': packing_plate_list if slug == 'butt-joint-welded' else None,
                        },
                        'design': {
                            'designFor': design_for_list,
                        }
                    }
                }
                return Response(data, status=status.HTTP_200_OK)

            return Response({'error': f'Sub-module {slug} not found'}, status=404)
        except Exception as exc:
            return Response({'error': str(exc)}, status=500)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/simple-connection/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        ServiceClass = SimpleConnectionRegistry.get_service_by_slug_or_404(submodule_slug, SIMPLE_CONNECTION_ALLOWED_SLUGS)
        return trigger_async_cad('simple-connection', submodule_slug, ServiceClass, request)

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/simple-connection/{submodule_slug}/report/generate-initial/
        Asynchronously runs LaTeX report generation task.
        """
        return trigger_async_report('simple-connection', submodule_slug, SIMPLE_CONNECTION_REPORT_MODULE_ID_MAP, request)
