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
from .registry import ShearConnectionRegistry
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.models import Columns, Beams, Bolt, Material, CustomMaterials, Angles
from apps.core.api.design.report_customization_api import generate_initial_report_core


SHEAR_REPORT_MODULE_ID_MAP = {
    "fin-plate": "FinPlateConnection",
    "cleat-angle": "CleatAngleConnection",
    "end-plate": "EndPlateConnection",
    "seated-angle": "Seated-Angle-Connection",
}


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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "project_id": 123  # Optional: Save results to project if user is authenticated
        }
        
        Example: POST /api/modules/shear-connection/fin-plate/design/
        
        Guest Mode:
        - Can calculate designs
        - Cannot save to projects (project_id is ignored)
        
        Authenticated Users:
        - Can calculate designs
        - Can save to projects if project_id is provided
        """
        # Use URL slug to find service (not POST body)
        ServiceClass = ShearConnectionRegistry.get_service_by_slug(submodule_slug)
        
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
            module_name='shear-connection'
        )
        
        try:
            print("\n" + "=" * 80)
            print(f"[ShearConnectionViewSet.design] slug={submodule_slug}")
            print(f"[ShearConnectionViewSet.design] ServiceClass={getattr(ServiceClass, '__name__', ServiceClass)}")
            print(f"[ShearConnectionViewSet.design] input keys={list(inputs.keys()) if isinstance(inputs, dict) else type(inputs)}")
            print(f"[ShearConnectionViewSet.design] project_id={project_id}, guest={context.get('is_guest')}")
            # Call the service with request context
            result = ServiceClass.calculate(
                inputs=inputs,
                request=request,
                project_id=project_id if not context['is_guest'] else None,
                user_email=context['user_email']
            )
            print(f"[ShearConnectionViewSet.design] success result keys={list(result.keys()) if isinstance(result, dict) else type(result)}")
            print("=" * 80 + "\n")
            
            # Add project saving result to response
            if context['project_result']:
                result['project_saved'] = context['project_result']['saved']
                if context['project_result'].get('project_id'):
                    result['project_id'] = context['project_result']['project_id']
                if context['project_result'].get('error'):
                    result['project_error'] = context['project_result']['error']
            
            return Response(result, status=200)
        except Exception as e:
            print("\n" + "=" * 80)
            print(f"[ShearConnectionViewSet.design] ERROR slug={submodule_slug}")
            print(f"[ShearConnectionViewSet.design] exception={type(e).__name__}: {e}")
            if isinstance(inputs, dict):
                print(f"[ShearConnectionViewSet.design] inputs sample keys={list(inputs.keys())[:15]}")
                for k in [
                    "Connectivity",
                    "Bolt.Type",
                    "Member.Supported_Section.Designation",
                    "Member.Supporting_Section.Designation",
                    "Connector.Plate.Thickness_List",
                    "Module",
                ]:
                    if k in inputs:
                        print(f"[ShearConnectionViewSet.design] {k}={inputs.get(k)!r}")
            traceback.print_exc()
            print("=" * 80 + "\n")
            return Response(
                {'error': str(e), 'success': False}, 
                status=400
            )

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/shear-connection/{submodule_slug}/report/generate-initial/

        Request body (slug determines module_id, no need to send it):
        {
            "metadata": {...},          # Already in backend format
            "input_values": {...},      # Or "inputs": {...}
            "design_status": boolean,
            "logs": [...],
            "sections": [...],          # Optional
            "customization": {...}      # Optional
        }

        Returns:
        {
            "success": true,
            "report_id": "string",
            "sections": {...},
            "message": "LaTeX report generated successfully"
        }
        """
        module_id = SHEAR_REPORT_MODULE_ID_MAP.get(submodule_slug)
        if not module_id:
            return Response(
                {
                    "success": False,
                    "error": f"Report generation is not supported for shear-connection sub-module '{submodule_slug}'",
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
        GET /api/modules/shear-connection/{submodule_slug}/options/
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
        connectivity_common = ['Column Flange-Beam-Web', 'Column Web-Beam-Web', 'Beam-Beam']

        try:
            if slug == 'fin-plate':
                data = {
                    'connectivityList': connectivity_common,
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(data, status=status.HTTP_200_OK)

            if slug == 'cleat-angle':
                data = {
                    'connectivityList': connectivity_common,
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'angleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                }
                print("data:", data)
                return Response(data, status=status.HTTP_200_OK)

            if slug == 'end-plate':
                data = {
                    'connectivityList': connectivity_common,
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'boltDiameterList': bolt_diameters(),
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(data, status=status.HTTP_200_OK)

            if slug == 'seated-angle':
                data = {
                    'connectivityList': ['Column Flange-Beam-Web', 'Column Web-Beam-Web'],
                    'columnList': list(Columns.objects.values_list('Designation', flat=True)),
                    'beamList': list(Beams.objects.values_list('Designation', flat=True)),
                    'materialList': material_list(),
                    'angleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'topAngleList': list(Angles.objects.values_list('Designation', flat=True)),
                    'boltDiameterList': bolt_diameters(),
                    'boltTypeList': ['Bearing Bolt', 'Friction Grip Bolt'],
                    'propertyClassList': property_classes,
                    'thicknessList': thickness_list,
                }
                return Response(data, status=status.HTTP_200_OK)

            return Response({'error': f'Sub-module {slug} not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/cad')
    def cad(self, request, submodule_slug=None):
        """
        POST /api/modules/shear-connection/{submodule_slug}/cad/
        
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
        ServiceClass = ShearConnectionRegistry.get_service_by_slug(submodule_slug)
        
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
            sections = get_default_sections('shear-connection', submodule_slug)
        
        if not sections:
            return Response(
                {'error': f'No sections defined for {submodule_slug}'},
                status=400
            )
        
        try:
            # Import adapter to get create_from_input function for hover_dict
            create_from_input_func = None
            try:
                if submodule_slug == 'fin-plate':
                    from .submodules.fin_plate.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'cleat-angle':
                    from .submodules.cleat_angle.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'end-plate':
                    from .submodules.end_plate.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'seated-angle':
                    from .submodules.seated_angle.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[ShearConnectionViewSet] Could not import create_from_input for {submodule_slug}: {e}")
            
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
            print(f"[ShearConnectionViewSet] Error generating CAD: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'status': 'error'},
                status=500
            )

