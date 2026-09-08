"""
Compression Member ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .registry import CompressionMemberRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.core.constants import get_report_module_id
from apps.core.models import Material, CustomMaterials, Bolt, Angles, Channels, Beams, Columns, RHS, SHS, CHS
from apps.sections.options_merge import merge_user_sections_into_options


# Mapping from compression-member submodule slug to legacy report module_id
COMPRESSION_REPORT_MODULE_ID_MAP = {
    "axially-loaded-column": "AxiallyLoadedColumn",
    "struts-bolted": "Struts-Bolted-Design",
    "struts-welded": "Struts-Welded-Design",
}

# design/cad accept any registry-resolvable slug unless restricted — reuse the
# same allowlist options() already serves data for.
COMPRESSION_MEMBER_ALLOWED_SLUGS = frozenset(COMPRESSION_REPORT_MODULE_ID_MAP.keys())


class CompressionMemberViewSet(viewsets.ViewSet):
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
          - 'struts_bolted' -> 'struts-bolted' (preferred)
          - 'Struts-Bolted-Design' (legacy)
        """
        if not raw_slug:
            return raw_slug
        # Convert underscores to hyphens (URL format to registry format)
        normalized = raw_slug.replace('_', '-').lower()
        module_id_map = {
            'struts-bolted-design': 'struts-bolted',
            'struts-welded-design': 'struts-welded',
            'compression-member-design': 'struts-bolted',  # Legacy support for old compression-member
            'axially-loaded-column': 'axially-loaded-column',
            'axially_loaded_column': 'axially-loaded-column',
            'axiallyloadedcolumn': 'axially-loaded-column',
        }
        return module_id_map.get(normalized, normalized)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/compression-member/{submodule_slug}/design/
        Asynchronously runs calculation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        ServiceClass = CompressionMemberRegistry.get_service_by_slug_or_404(normalized_slug, COMPRESSION_MEMBER_ALLOWED_SLUGS)
        return trigger_async_design('compression-member', normalized_slug, ServiceClass, request)

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/compression-member/{submodule_slug}/report/generate-initial/
        Asynchronously runs LaTeX report generation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        return trigger_async_report('compression-member', normalized_slug, COMPRESSION_REPORT_MODULE_ID_MAP, request)

    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/compression-member/{submodule_slug}/options/
        
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
        section_profiles = ["Angles", "Back to Back Angles", "Star Angles", "Channels", "Back to Back Channels"]
        bolt_hole_type_list = ["Standard", "Oversized", "Short Slotted", "Long Slotted"]
        bolt_type_list = ["Bearing Bolt", "Friction Grip Bolt"]
        bolt_slip_factor_list = ["0.2", "0.3", "0.48", "0.5"]
        design_method_list = ["Limit State Design"]
        edge_type_list = ["Rolled, machine-flame cut, sawn and planed"]
        corrosive_influences_list = ["Yes", "No"]
        end_condition_list = ["Fixed", "Hinged", "Free"]
        load_type_list = ["Concentric Load", "Leg Load"]
        conn_location_list = ["Long Leg", "Short Leg"]

        try:
            if slug == 'struts-bolted':
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
                    'endConditionList': end_condition_list,
                    'loadTypeList': load_type_list,
                    'connLocationList': conn_location_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            if slug == 'struts-welded':
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
                    'endConditionList': end_condition_list,
                    'loadTypeList': load_type_list,
                    'connLocationList': conn_location_list,
                }
                return Response(
                    merge_user_sections_into_options(request, data),
                    status=status.HTTP_200_OK,
                )

            if slug == 'axially-loaded-column':
                section_profile_list = [
                    "Beams and Columns",
                    "RHS and SHS",
                    "CHS",
                    "Angles",
                    "Back to Back Angles",
                    "Channels",
                    "Back to Back Channels",
                ]
                beams_list = list(Beams.objects.values_list("Designation", flat=True))
                columns_list = list(Columns.objects.values_list("Designation", flat=True))
                rhs_list = list(RHS.objects.values_list("Designation", flat=True))
                shs_list = list(SHS.objects.values_list("Designation", flat=True))
                chs_list = list(CHS.objects.values_list("Designation", flat=True))
                angles_list = list(Angles.objects.values_list("Designation", flat=True))
                channels_list = list(Channels.objects.values_list("Designation", flat=True))

                end_condition_list = ["Fixed", "Free", "Hinged", "Roller"]

                data = {
                    "materialList": material_list(),  # for Member/section material
                    "sectionProfileList": section_profile_list,
                    "beamList": [str(x) for x in beams_list],
                    "columnList": [str(x) for x in columns_list],
                    "rhsList": [str(x) for x in rhs_list],
                    "shsList": [str(x) for x in shs_list],
                    "chsList": [str(x) for x in chs_list],
                    "angleList": [str(x) for x in angles_list],
                    "channelList": [str(x) for x in channels_list],
                    "endConditionList": end_condition_list,
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
        POST /api/modules/compression-member/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        ServiceClass = CompressionMemberRegistry.get_service_by_slug_or_404(normalized_slug, COMPRESSION_MEMBER_ALLOWED_SLUGS)

        if not ServiceClass:
            return Response(
                {'error': f'Sub-module {normalized_slug} not found'},
                status=404
            )
        
        # Extract inputs
        inputs = request.data.get('inputs', request.data)
        
        if not inputs:
            return Response(
                {'error': 'inputs are required'},
                status=400
            )
        
        # Get sections from request or use defaults
        sections = request.data.get('sections')
        if not sections:
            sections = get_default_sections('compression-member', normalized_slug)
        
        if not sections:
            return Response(
                {'error': f'No sections defined for {normalized_slug}'},
                status=400
            )
        
        try:
            # Import adapter to get create_from_input function for hover_dict
            create_from_input_func = None
            try:
                if normalized_slug in ('struts-bolted', 'struts_bolted'):
                    from .submodules.struts_bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif normalized_slug in ('struts-welded', 'struts_welded'):
                    from .submodules.struts_welded.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif normalized_slug == 'axially-loaded-column':
                    from .submodules.axially_loaded_column.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[CompressionMemberViewSet] Could not import create_from_input for {normalized_slug}: {e}")
            
            result = generate_cad_models(
                service_class=ServiceClass,
                inputs=inputs,
                sections=sections,
                create_from_input_func=create_from_input_func
            )
            
            if not result['files']:
                return Response(
                    {
                        'status': 'error',
                        'message': 'No CAD models were generated',
                        'errors': result['warnings']
                    },
                    status=422
                )
            
            return Response({
                'status': 'success',
                'files': result['files'],
                'hover_dict': result['hover_dict'],
                'message': 'CAD models generated successfully',
                'warnings': result['warnings']
            }, status=201)
            
        except Exception as e:
            print(f"[CompressionMemberViewSet] Error generating CAD: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'status': 'error'},
                status=500
            )

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/compression-member/{submodule_slug}/report/generate-initial/

        Request body:
        {
            "metadata": {...},
            "input_values": {...},      # Or "inputs": {...}
            "design_status": boolean,
            "logs": [...],
            "sections": [...],          # Optional
            "customization": {...},     # Optional
            "images": {...}             # Optional CAD captures (iso/front/side/top)
        }
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        module_id = get_report_module_id(normalized_slug)
        if not module_id:
            return Response(
                {
                    "success": False,
                    "error": f"Report generation is not supported for compression-member sub-module '{normalized_slug}'",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        input_values = request.data.get("input_values") or request.data.get("inputs")
        if not input_values:
            return Response(
                {"success": False, "error": "input_values are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mapped_data = {
            "module_id": module_id,
            "input_values": input_values,
            "metadata": request.data.get("metadata"),
            "design_status": request.data.get("design_status", True),
            "logs": request.data.get("logs", []),
        }

        if "sections" in request.data:
            mapped_data["sections"] = request.data.get("sections")
        if "customization" in request.data:
            mapped_data["customization"] = request.data.get("customization")
        if "images" in request.data:
            mapped_data["images"] = request.data.get("images")

        payload, status_code = generate_initial_report_core(mapped_data)
        return Response(payload, status=status_code)
