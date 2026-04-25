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
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Columns, Beams, Bolt, Material, CustomMaterials
from apps.core.api.design.report_customization_api import generate_initial_report_core
from apps.sections.options_merge import merge_user_sections_into_options


# Mapping from moment-connection submodule slug to legacy report module_id
MOMENT_REPORT_MODULE_ID_MAP = {
    "beam-beam-cover-plate-bolted": "Cover-Plate-Bolted-Connection",
    "beam-beam-cover-plate-welded": "Cover-Plate-Welded-Connection",
    "beam-beam-end-plate": "Beam-Beam-End-Plate-Connection",
    "beam-column-end-plate": "Beam-to-Column-End-Plate-Connection",
    "column-column-cover-plate-bolted": "ColumnCoverPlateBolted",
    "column-column-cover-plate-welded": "Column-to-Column-Cover-Plate-Welded-Connection",
    "column-column-end-plate": "Column-to-Column-End-Plate-Connection",
}


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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "project_id": 123  # Optional: Save results to project if user is authenticated
        }
        
        Example: POST /api/modules/moment-connection/cover-plate-bolted/design/
        
        Guest Mode:
        - Can calculate designs
        - Cannot save to projects (project_id is ignored)
        
        Authenticated Users:
        - Can calculate designs
        - Can save to projects if project_id is provided
        """
        # Use URL slug to find service (not POST body)
        ServiceClass = MomentConnectionRegistry.get_service_by_slug(submodule_slug)
        
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
            module_name='moment-connection'
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
        POST /api/modules/moment-connection/{submodule_slug}/report/generate-initial/

        Request body:
        {
            "metadata": {...},
            "input_values": {...},      # Or "inputs": {...}
            "design_status": boolean,
            "logs": [...],
            "sections": [...],          # Optional
            "customization": {...},    # Optional
            "images": {...}               # Optional CAD captures (iso/front/side/top)
        }
        """
        module_id = MOMENT_REPORT_MODULE_ID_MAP.get(submodule_slug)
        if not module_id:
            return Response(
                {
                    "success": False,
                    "error": f"Report generation is not supported for moment-connection sub-module '{submodule_slug}'",
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
    
    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/moment-connection/{submodule_slug}/options/
        
        Returns dropdown/options data for the sub-module.
        """
        email = request.query_params.get("email")
        slug = submodule_slug

        # Common data helpers
        def material_list():
            mats = list(Material.objects.all().values())
            if email:
                mats += list(CustomMaterials.objects.filter(email=email).values())
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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "sections": ["Model", "Beam", ...]  # Optional: specific sections to generate
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
        ServiceClass = MomentConnectionRegistry.get_service_by_slug(submodule_slug)
        
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
            sections = get_default_sections('moment-connection', submodule_slug)
        
        if not sections:
            return Response(
                {'error': f'No sections defined for {submodule_slug}'},
                status=400
            )
        
        try:
            # Import adapter to get create_from_input function for hover_dict
            create_from_input_func = None
            try:
                if submodule_slug == 'beam-beam-cover-plate-bolted':
                    from .submodules.beam_beam_cover_plate_bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'beam-beam-cover-plate-welded':
                    from .submodules.beam_beam_cover_plate_welded.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'beam-beam-end-plate':
                    from .submodules.beam_beam_end_plate.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'beam-column-end-plate':
                    from .submodules.beam_column_end_plate.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'column-column-cover-plate-bolted':
                    from .submodules.column_column_cover_plate_bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'column-column-cover-plate-welded':
                    from .submodules.column_column_cover_plate_welded.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'column-column-end-plate':
                    from .submodules.column_column_end_plate.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[MomentConnectionViewSet] Could not import create_from_input for {submodule_slug}: {e}")
            
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
            print(f"[MomentConnectionViewSet] Error generating CAD: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'status': 'error'},
                status=500
            )

