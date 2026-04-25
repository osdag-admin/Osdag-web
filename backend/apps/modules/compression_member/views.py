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
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Material, CustomMaterials, Bolt, Angles, Channels, Beams, Columns, RHS, SHS, CHS
from apps.sections.options_merge import merge_user_sections_into_options


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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "project_id": 123  # Optional: Save results to project if user is authenticated
        }
        
        Example: POST /api/modules/compression-member/struts_bolted/design/
        
        Guest Mode:
        - Can calculate designs
        - Cannot save to projects (project_id is ignored)
        
        Authenticated Users:
        - Can calculate designs
        - Can save to projects if project_id is provided
        """
        # Debug: trace registry lookup
        print(f"[design] submodule_slug: {submodule_slug}")
        normalized_slug = self._normalize_slug(submodule_slug)
        print(f"[design] normalized_slug: {normalized_slug}")
        print(f"[design] Registry keys: {list(CompressionMemberRegistry._registry.keys())}")

        # Use URL slug to find service (not POST body)
        ServiceClass = CompressionMemberRegistry.get_service_by_slug(normalized_slug)
        print(f"[design] ServiceClass: {ServiceClass}")
        
        if not ServiceClass:
            return Response(
                {'error': f'Sub-module {normalized_slug} not found'}, 
                status=404
            )
        
        # Extract inputs and optional project_id
        inputs = request.data.get('inputs', request.data)  # Support both formats
        project_id = request.data.get('project_id')
        
        # Handle authentication and project saving (shared logic)
        context = handle_design_request(
            request=request,
            inputs=inputs,
            project_id=project_id,
            submodule_slug=normalized_slug,
            module_name='compression-member'
        )
        
        try:
            # Call the service with request context
            result = ServiceClass.calculate(
                inputs=inputs,
                request=request,
                project_id=project_id if not context['is_guest'] else None,
                user_email=context['user_email']
            )
            
            # Add project saving result to response
            if context['project_result']:
                result['project_saved'] = context['project_result']['saved']
                if context['project_result'].get('project_id'):
                    result['project_id'] = context['project_result']['project_id']
                if context['project_result'].get('error'):
                    result['project_error'] = context['project_result']['error']
            
            return Response(result, status=200)
        except Exception as e:
            return Response(
                {'error': str(e), 'success': False}, 
                status=400
            )
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/compression-member/{submodule_slug}/options/
        
        Returns input options for the sub-module (e.g., section lists, materials)
        """
        email = request.query_params.get("email")
        slug = self._normalize_slug(submodule_slug)

        # Shared helpers
        def material_list():
            mats = list(Material.objects.all().values())
            if email:
                mats += list(CustomMaterials.objects.filter(email=email).values())
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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "sections": ["Model", "Member", ...]  # Optional: specific sections to generate
        }
        
        Returns:
        {
            "status": "success",
            "files": {section: base64_data, ...},
            "hover_dict": {...},
            "warnings": [...]
        }
        """
        # Normalize slug
        normalized_slug = self._normalize_slug(submodule_slug)
        
        # Get service from registry
        ServiceClass = CompressionMemberRegistry.get_service_by_slug(normalized_slug)
        
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
                if normalized_slug == 'struts_bolted':
                    from .submodules.struts_bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif normalized_slug == 'axially-loaded-column':
                    from .submodules.axially_loaded_column.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[CompressionMemberViewSet] Could not import create_from_input for {normalized_slug}: {e}")
            
            # Generate CAD models
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
