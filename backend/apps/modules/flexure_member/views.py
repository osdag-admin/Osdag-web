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
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from rest_framework import status
from apps.core.models import Columns, Beams, Material, CustomMaterials


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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "project_id": 123  # Optional: Save results to project if user is authenticated
        }
        
        Example: POST /api/modules/flexure-member/simply-supported-beam/design/
        
        Guest Mode:
        - Can calculate designs
        - Cannot save to projects (project_id is ignored)
        
        Authenticated Users:
        - Can calculate designs
        - Can save to projects if project_id is provided
        """
        # Use URL slug to find service (not POST body)
        ServiceClass = FlexureMemberRegistry.get_service_by_slug(submodule_slug)

        
        print(f"[FlexureMemberViewSet] design called with slug={submodule_slug}, ServiceClass={ServiceClass}")
        
        if not ServiceClass:
            return Response(
                {'error': f'Sub-module {submodule_slug} not found'}, 
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
            submodule_slug=submodule_slug,
            module_name='flexure-member'
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
        GET /api/modules/flexure-member/{submodule_slug}/options/

        Returns dropdown/options data for flexural sub-modules.
        """
        email = request.query_params.get("email")
        slug = submodule_slug

        # ---- Common Helpers ---- #

        def material_list():
            mats = list(Material.objects.all().values())
            if email:
                mats += list(CustomMaterials.objects.filter(email=email).values())
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
                return Response(data, status=status.HTTP_200_OK)
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
                return Response(data, status=status.HTTP_200_OK)
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
                return Response(data, status=status.HTTP_200_OK)
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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "sections": ["Model", ...]  # Optional: specific sections to generate
        }
        
        Returns:
        {
            "status": "success",
            "files": {section: base64_data, ...},
            "hover_dict": {...},
            "warnings": [...]
        }
        """
        # Get service from registry
        ServiceClass = FlexureMemberRegistry.get_service_by_slug(submodule_slug)
        
        if not ServiceClass:
            return Response(
                {'error': f'Sub-module {submodule_slug} not found'},
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
            sections = get_default_sections('flexure-member', submodule_slug)
        
        if not sections:
            return Response(
                {'error': f'No sections defined for {submodule_slug}'},
                status=400
            )
        
        try:
            # Import adapter to get create_from_input function for hover_dict
            create_from_input_func = None
            try:
                if submodule_slug == 'simply-supported-beam':
                    from .submodules.simply_supported_beam.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'on-cantilever':
                    from .submodules.on_cantilever.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[FlexureMemberViewSet] Could not import create_from_input for {submodule_slug}: {e}")
            
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
            print(f"[FlexureMemberViewSet] Error generating CAD: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'status': 'error'},
                status=500
            )

