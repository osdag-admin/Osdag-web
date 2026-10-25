"""
Compression Member ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from osdag_core.Common import (
    KEY_DISP_STRUT_BOLTED_END_GUSSET, KEY_DISP_STRUT_WELDED_END_GUSSET, KEY_DISP_COMPRESSION_COLUMN,
)
from .registry import CompressionMemberRegistry
from apps.core.utils.module_helpers import (
    handle_design_request,
    trigger_async_design,
    trigger_async_cad,
    trigger_async_report
)
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.core import catalog
from apps.core.models import CustomMaterials
from apps.core.osdag_overrides import unknown_material_error, user_id_from_request, user_rows
from apps.sections.options_merge import merge_user_sections_into_options
from apps.core.utils.api_errors import error_response


# Mapping from compression-member submodule slug to report module_id
COMPRESSION_REPORT_MODULE_ID_MAP = {
    "axially-loaded-column": KEY_DISP_COMPRESSION_COLUMN,
    "struts-bolted": KEY_DISP_STRUT_BOLTED_END_GUSSET,
    "struts-welded": KEY_DISP_STRUT_WELDED_END_GUSSET,
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
        Accept URL slugs written with underscores, e.g. 'struts_bolted' -> 'struts-bolted'.
        """
        if not raw_slug:
            return raw_slug
        return raw_slug.replace('_', '-').lower()

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
                    'angleList': catalog.designations("Angles"),
                    'channelList': catalog.designations("Channels"),
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
                    'angleList': catalog.designations("Angles"),
                    'channelList': catalog.designations("Channels"),
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
                beams_list = catalog.designations("Beams")
                columns_list = catalog.designations("Columns")
                rhs_list = catalog.designations("RHS")
                shs_list = catalog.designations("SHS")
                chs_list = catalog.designations("CHS")
                angles_list = catalog.designations("Angles")
                channels_list = catalog.designations("Channels")

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

            return error_response('submodule_not_found', f'Sub-module {slug} not found', status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return error_response('internal_error', str(exc), status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/compression-member/{submodule_slug}/cad/
        Asynchronously runs CAD generation task.
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        ServiceClass = CompressionMemberRegistry.get_service_by_slug_or_404(normalized_slug, COMPRESSION_MEMBER_ALLOWED_SLUGS)

        if not ServiceClass:
            return error_response('submodule_not_found', f'Sub-module {normalized_slug} not found', 404)
        
        # Extract inputs
        inputs = request.data.get('inputs', request.data)
        
        if not inputs:
            return error_response('missing_field', 'inputs are required', 400)
        
        # Get sections from request or use defaults
        sections = request.data.get('sections')
        if not sections:
            sections = get_default_sections('compression-member', normalized_slug)
        
        if not sections:
            return error_response('no_sections', f'No sections defined for {normalized_slug}', 400)

        user_id = user_id_from_request(request)
        material_error = unknown_material_error(inputs, user_id)
        if material_error:
            return error_response('bad_request', material_error, 400)

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
            
            # Runs in the web process (not Celery), so the user's custom rows are installed here.
            with user_rows(user_id):
                result = generate_cad_models(
                    service_class=ServiceClass,
                    inputs=inputs,
                    sections=sections,
                    create_from_input_func=create_from_input_func
                )
            
            if not result['files']:
                return error_response(
                    'cad_generation_failed',
                    'No CAD models were generated',
                    422,
                    errors=result['warnings'],
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
            return error_response('internal_error', str(e), 500)

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
        module_id = COMPRESSION_REPORT_MODULE_ID_MAP.get(normalized_slug)
        if not module_id:
            return error_response('unsupported_report', f"Report generation is not supported for compression-member sub-module '{normalized_slug}'", status.HTTP_400_BAD_REQUEST, success=False)

        input_values = request.data.get("input_values") or request.data.get("inputs")
        if not input_values:
            return error_response('missing_field', "input_values are required", status.HTTP_400_BAD_REQUEST, success=False)

        user_id = user_id_from_request(request)
        material_error = unknown_material_error(input_values, user_id)
        if material_error:
            return error_response('bad_request', material_error, status.HTTP_400_BAD_REQUEST, success=False)

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

        # Runs in the web process (not Celery), so the user's custom rows are installed here.
        with user_rows(user_id):
            payload, status_code = generate_initial_report_core(mapped_data)
        if status_code >= 400:
            return error_response('report_generation_failed', payload.get('error', 'Failed to generate report'),
                                  status_code, success=False)
        return Response(payload, status=status_code)
