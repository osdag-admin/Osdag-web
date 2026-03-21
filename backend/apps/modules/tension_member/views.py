"""
Tension Member ViewSet - Routes to sub-module services
Uses URL slug (not POST body) to find the correct service
Handles guest mode and optional project_id saving
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .registry import TensionMemberRegistry
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Material, CustomMaterials, Bolt, Angles, Channels
from apps.core.api.design.report_customization_api import generate_initial_report_core


# Mapping from tension-member slug to legacy report module_id
TENSION_REPORT_MODULE_ID_MAP = {
    "bolted": "Tension-Member-Bolted-Design",
    "welded": "Tension-Member-Welded-Design",
}


class TensionMemberViewSet(viewsets.ViewSet):
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
          - 'bolted', 'welded' (preferred)
          - 'Tension-Member-Bolted-Design', 'Tension-Member-Welded-Design' (legacy)
        """
        if not raw_slug:
            return raw_slug
        slug_lower = raw_slug.lower()
        module_id_map = {
            'tension-member-bolted-design': 'bolted',
            'tension-member-welded-design': 'welded',
        }
        return module_id_map.get(slug_lower, raw_slug)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/tension-member/{submodule_slug}/design/
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "project_id": 123  # Optional: Save results to project if user is authenticated
        }
        
        Example: POST /api/modules/tension-member/bolted/design/
        
        Guest Mode:
        - Can calculate designs
        - Cannot save to projects (project_id is ignored)
        
        Authenticated Users:
        - Can calculate designs
        - Can save to projects if project_id is provided
        """
        # Normalize slug (supports MODULE_ID inputs)
        normalized_slug = self._normalize_slug(submodule_slug)

        # Use URL slug to find service (not POST body)
        ServiceClass = TensionMemberRegistry.get_service_by_slug(normalized_slug)
        
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
            module_name='tension-member'
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

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/tension-member/{submodule_slug}/report/generate-initial/

        Request body:
        {
            "metadata": {...},
            "input_values": {...},      # Or "inputs": {...}
            "design_status": boolean,
            "logs": [...],
            "sections": [...],          # Optional
            "customization": {...}      # Optional
        }
        """
        normalized_slug = self._normalize_slug(submodule_slug)
        module_id = TENSION_REPORT_MODULE_ID_MAP.get(normalized_slug)
        if not module_id:
            return Response(
                {
                    "success": False,
                    "error": f"Report generation is not supported for tension-member sub-module '{normalized_slug}'",
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

        payload, status_code = generate_initial_report_core(mapped_data)
        return Response(payload, status=status_code)
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/tension-member/{submodule_slug}/options/
        
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
        section_profiles = ["Angles", "Back to Back Angles", "Star Angles", "Channels"]
        bolt_hole_type_list = ["Standard", "Oversized", "Short Slotted", "Long Slotted"]
        bolt_type_list = ["Bearing Bolt", "Friction Grip Bolt"]
        bolt_slip_factor_list = ["0.3", "0.5"]
        design_method_list = ["Limit State Design", "Working Stress Design"]
        edge_type_list = ["Rolled, machine-flame cut, sawn and planed"]
        corrosive_influences_list = ["Yes", "No"]

        try:
            if slug == 'bolted':
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
                }
                return Response(data, status=status.HTTP_200_OK)

            if slug == 'welded':
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
                }
                return Response(data, status=status.HTTP_200_OK)

            return Response({'error': f'Sub-module {slug} not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/tension-member/{submodule_slug}/cad/
        
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
        ServiceClass = TensionMemberRegistry.get_service_by_slug(normalized_slug)
        
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
            sections = get_default_sections('tension-member', normalized_slug)
        
        if not sections:
            return Response(
                {'error': f'No sections defined for {normalized_slug}'},
                status=400
            )
        
        try:
            # Import adapter to get create_from_input function for hover_dict
            create_from_input_func = None
            try:
                if normalized_slug == 'bolted':
                    from .submodules.bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif normalized_slug == 'welded':
                    from .submodules.welded.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[TensionMemberViewSet] Could not import create_from_input for {normalized_slug}: {e}")
            
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
            print(f"[TensionMemberViewSet] Error generating CAD: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'status': 'error'},
                status=500
            )

