"""
Moment Connection ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .registry import MomentConnectionRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Columns, Beams, Bolt, Material, CustomMaterials
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.sections.options_merge import merge_user_sections_into_options


# Mapping from moment-connection submodule slug to legacy report module_id
MOMENT_REPORT_MODULE_ID_MAP = {
    "beam-beam-cover-plate-bolted": "Beam-to-Beam-Cover-Plate-Bolted-Connection",
    "beam-beam-cover-plate-welded": "Beam-to-Beam-Cover-Plate-Welded-Connection",
    "beam-beam-end-plate": "Beam-Beam-End-Plate-Connection",
    "beam-column-end-plate": "Beam-to-Column-End-Plate-Connection",
    "column-column-cover-plate-bolted": "Column-to-Column-Cover-Plate-Bolted-Connection",
    "column-column-cover-plate-welded": "Column-to-Column-Cover-Plate-Welded-Connection",
    "column-column-end-plate": "Column-to-Column-End-Plate-Connection",
}

# design/cad accept any registry-resolvable slug unless restricted — reuse the
# same allowlist options() already serves data for (see shear_connection for
# the same pattern and why it matters).
MOMENT_CONNECTION_ALLOWED_SLUGS = frozenset(MOMENT_REPORT_MODULE_ID_MAP.keys())


class MomentConnectionViewSet(viewsets.ViewSet):
    """
    Generic ViewSet that routes to specific sub-module services based on URL slug.
    Supports guest mode and optional project_id saving for authenticated users.
    """
    permission_classes = [AllowAny]  # Allow both authenticated and guest users
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/moment-connection/{submodule_slug}/design/
        Asynchronously runs calculation task.
        """
        ServiceClass = MomentConnectionRegistry.get_service_by_slug_or_404(submodule_slug, MOMENT_CONNECTION_ALLOWED_SLUGS)
        return trigger_async_design('moment-connection', submodule_slug, ServiceClass, request)

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/moment-connection/{submodule_slug}/report/generate-initial/
        Asynchronously runs LaTeX report generation task.
        """
        return trigger_async_report('moment-connection', submodule_slug, MOMENT_REPORT_MODULE_ID_MAP, request)
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/moment-connection/{submodule_slug}/options/
        
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

        try:
            # Beam-to-Beam Cover Plate Bolted
            if slug == 'beam-beam-cover-plate-bolted':
                data = {
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

            # Beam-to-Beam Cover Plate Welded
            if slug == 'beam-beam-cover-plate-welded':
                data = {
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'weldTypes': [
                        {'value': 'Fillet Weld', 'label': 'Fillet Weld'},
                        {'value': 'Groove Weld', 'label': 'Groove Weld'}
                    ],
                    'weldFab': [
                        {'value': 'Shop Weld', 'label': 'Shop Weld'},
                        {'value': 'Field Weld', 'label': 'Field Weld'}
                    ],
                    'thicknessList': thickness_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            # Beam-Beam End Plate
            if slug == 'beam-beam-end-plate':
                data = {
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

            # Beam-Column End Plate
            if slug == 'beam-column-end-plate':
                data = {
                    'connectivityList': ['Column-Flange-Beam-Web', 'Column Web-Beam Web'],
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            # Column-to-Column Cover Plate Bolted
            if slug == 'column-column-cover-plate-bolted':
                data = {
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            # Column-to-Column Cover Plate Welded
            if slug == 'column-column-cover-plate-welded':
                data = {
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'weldTypes': [
                        {'value': 'Fillet Weld', 'label': 'Fillet Weld'},
                        {'value': 'Groove Weld', 'label': 'Groove Weld'}
                    ],
                    'weldFab': [
                        {'value': 'Shop Weld', 'label': 'Shop Weld'},
                        {'value': 'Field Weld', 'label': 'Field Weld'}
                    ],
                    'thicknessList': thickness_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            # Column-to-Column End Plate
            if slug == 'column-column-end-plate':
                data = {
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
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
        POST /api/modules/moment-connection/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        ServiceClass = MomentConnectionRegistry.get_service_by_slug_or_404(submodule_slug, MOMENT_CONNECTION_ALLOWED_SLUGS)
        return trigger_async_cad('moment-connection', submodule_slug, ServiceClass, request)
