"""
Flexure Member ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .registry import FlexureMemberRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from rest_framework import status
from apps.core.models import Columns, Beams, Material, CustomMaterials
from apps.sections.options_merge import merge_user_sections_into_options


# Mapping from flexure-member submodule slug to legacy report module_id
FLEXURE_REPORT_MODULE_ID_MAP = {
    "simply-supported-beam": "Simply-Supported-Beam",
    "purlin": "Purlin",
    "on-cantilever": "On-Cantilever-Beam",
    "plate-girder": "Plate-Girder",
}


class FlexureMemberViewSet(viewsets.ViewSet):
    """
    Generic ViewSet that routes to specific sub-module services based on URL slug.
    Supports guest mode and optional project_id saving for authenticated users.
    """
    permission_classes = [AllowAny]  # Allow both authenticated and guest users
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/flexure-member/{submodule_slug}/design/
        Asynchronously runs calculation task.
        """
        ServiceClass = FlexureMemberRegistry.get_service_by_slug(submodule_slug)
        return trigger_async_design('flexure-member', submodule_slug, ServiceClass, request)
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/flexure-member/{submodule_slug}/options/

        Returns dropdown/options data for flexural sub-modules.
        """
        slug = submodule_slug

        # ---- Common Helpers ---- #

        def material_list():
            mats = list(Material.objects.all().values())
            if hasattr(request, "user") and request.user.is_authenticated:
                mats += list(CustomMaterials.objects.filter(user=request.user).values())
            mats.append({"id": -1, "Grade": "Custom"})
            return mats

        def beam_list():
            return list(Beams.objects.values_list('Designation', flat=True))

        def column_list():
            return list(Columns.objects.values_list('Designation', flat=True))

        support_types = [
            {'value': 'Laterally Supported', 'label': 'Laterally Supported'},
            {'value': 'Laterally Unsupported', 'label': 'Laterally Unsupported'}
        ]

        restraint_types = [
            {'value': 'Fixed', 'label': 'Fixed'},
            {'value': 'Free', 'label': 'Free'}
        ]

        allowable_class_list = [
            'Plastic',
            'Compact',
            'Semi-Compact',
            'Slender'
        ]

        design_methods = [
            {'value': 'Limit State Design', 'label': 'Limit State Design'}
        ]

        try:
            # -------------------------------
            # Simply Supported Beam
            # -------------------------------
            if slug == 'simply-supported-beam':
                data = {
                    'beamList': beam_list(),
                    'columnList': column_list(),  # Optional if profile switch supported
                    'sectionProfileList': ["Beams and Columns"],
                    'materialList': material_list(),
                    'designMethodList': design_methods,
                    'supportTypeList': support_types,
                    'torsionalRestraintList': restraint_types,
                    'warpingRestraintList': restraint_types,
                    'allowableClassList': allowable_class_list
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )
            if slug == 'purlin':
                data = {
                    'beamList': beam_list(),
                    'columnList': column_list(),
                    'sectionProfileList': ["Beams and Columns"],
                    'materialList': material_list(),
                    'designMethodList': design_methods,
                    'supportTypeList': support_types,
                    'torsionalRestraintList': restraint_types,
                    'warpingRestraintList': restraint_types,
                    'allowableClassList': allowable_class_list
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )
            if slug == 'on-cantilever':
                cantilever_support_types = [
                    {'value': 'Major Laterally Supported', 'label': 'Major Laterally Supported'},
                    {'value': 'Minor Laterally Unsupported', 'label': 'Minor Laterally Unsupported'},
                    {'value': 'Major Laterally Unsupported', 'label': 'Major Laterally Unsupported'},
                ]
                support_restraint_list = [
                    {'value': 'Continuous, with lateral restraint to top flange', 'label': 'Continuous, with lateral restraint to top flange'},
                    {'value': 'Continuous, with partial torsional restraint', 'label': 'Continuous, with partial torsional restraint'},
                    {'value': 'Continuous, with lateral and torsional restraint', 'label': 'Continuous, with lateral and torsional restraint'},
                    {'value': 'Restrained laterally, torsionally and against rotation on flange', 'label': 'Restrained laterally, torsionally and against rotation on flange'},
                ]
                top_restraint_list = [
                    {'value': 'Free', 'label': 'Free'},
                    {'value': 'Lateral restraint to top flange', 'label': 'Lateral restraint to top flange'},
                    {'value': 'Torsional restraint', 'label': 'Torsional restraint'},
                    {'value': 'Lateral and Torsional restraint', 'label': 'Lateral and Torsional restraint'},
                ]
                data = {
                    'beamList': beam_list(),
                    'columnList': column_list(),
                    'sectionProfileList': ["Beams and Columns"],
                    'materialList': material_list(),
                    'designMethodList': design_methods,
                    'supportTypeList': cantilever_support_types,
                    'supportRestraintList': support_restraint_list,
                    'topRestraintList': top_restraint_list,
                    'allowableClassList': allowable_class_list
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )
            if slug == 'plate-girder':
                # Delegate to the plate girder service which provides
                # material list + plate/stiffener thickness lists for PSO.
                ServiceClass = FlexureMemberRegistry.get_service_by_slug(slug)
                if ServiceClass and hasattr(ServiceClass, 'get_options'):
                    data = ServiceClass.get_options(request)
                    return Response(
                        merge_user_sections_into_options(request, data),
                        status=status.HTTP_200_OK,
                    )
            return Response(
                {'error': f'Sub-module {slug} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/flexure-member/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        ServiceClass = FlexureMemberRegistry.get_service_by_slug(submodule_slug)
        return trigger_async_cad('flexure-member', submodule_slug, ServiceClass, request)

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/flexure-member/{submodule_slug}/report/generate-initial/
        Asynchronously runs LaTeX report generation task.
        """
        return trigger_async_report('flexure-member', submodule_slug, FLEXURE_REPORT_MODULE_ID_MAP, request)
