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
from apps.core.utils.module_helpers import handle_design_request
from apps.core.utils.cad_helpers import generate_cad_models, get_default_sections
from apps.core.utils.errors import format_error_response, get_error_status_code
from apps.core.api.design.report_customization_api import generate_initial_report_core
from .registry import SimpleConnectionRegistry

logger = logging.getLogger(__name__)


# Mapping from simple-connection slug to legacy report module_id (currently none implemented)
SIMPLE_CONNECTION_REPORT_MODULE_ID_MAP = {
    # Example (when report support is added):
    # "butt-joint-bolted": "Simple-Connection-Butt-Joint-Bolted-Report",
    # "butt-joint-welded": "Simple-Connection-Butt-Joint-Welded-Report",
}


class SimpleConnectionViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/design')
    def design(self, request, submodule_slug=None):
        """
        POST /api/modules/simple-connection/{slug}/design/
        Request body supports {inputs: {...}} or raw dict for backward compatibility.
        """
        ServiceClass = SimpleConnectionRegistry.get_service_by_slug(submodule_slug)
        if not ServiceClass:
            return Response({'error': f'Sub-module {submodule_slug} not found'}, status=404)

        inputs = request.data.get('inputs', request.data)
        project_id = request.data.get('project_id')

        context = handle_design_request(
            request=request,
            inputs=inputs,
            project_id=project_id,
            submodule_slug=submodule_slug,
            module_name='simple-connection'
        )

        try:
            result = ServiceClass.calculate(
                inputs=inputs,
                request=request,
                project_id=project_id if not context['is_guest'] else None,
                user_email=context['user_email']
            )

            if context['project_result']:
                result['project_saved'] = context['project_result']['saved']
                if context['project_result'].get('project_id'):
                    result['project_id'] = context['project_result']['project_id']
                if context['project_result'].get('error'):
                    result['project_error'] = context['project_result']['error']

            status_code = 200 if result.get('success', True) else 400
            return Response(result, status=status_code)
        except Exception as exc:
            logger.error(f"Error in simple connection design for {submodule_slug}: {exc}", exc_info=True)
            error_response = format_error_response(exc)
            status_code = get_error_status_code(exc)
            return Response(error_response, status=status_code)

    @action(detail=False, methods=['get'], url_path='(?P<submodule_slug>[^/.]+)/options')
    def options(self, request, submodule_slug=None):
        """
        GET /api/modules/simple-connection/{slug}/options/
        Provides dropdown/options data for simple connections.
        """
        email = request.query_params.get("email")
        slug = submodule_slug

        def material_list():
            mats = list(Material.objects.all().values())
            if email:
                mats += list(CustomMaterials.objects.filter(email=email).values())
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
        
        Request body:
        {
            "inputs": {...},  # Design input parameters
            "sections": ["Model", "Column", ...]  # Optional: specific sections to generate
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
        ServiceClass = SimpleConnectionRegistry.get_service_by_slug(submodule_slug)
        
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
            sections = get_default_sections('simple-connection', submodule_slug)
        
        if not sections:
            return Response(
                {'error': f'No sections defined for {submodule_slug}'},
                status=400
            )
        
        try:
            # Import adapter to get create_from_input function for hover_dict
            create_from_input_func = None
            try:
                if submodule_slug == 'butt-joint-bolted':
                    from .submodules.butt_joint_bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'butt-joint-welded':
                    from .submodules.butt_joint_welded.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'lap-joint-bolted':
                    from .submodules.lap_joint_bolted.adapter import create_from_input
                    create_from_input_func = create_from_input
                elif submodule_slug == 'lap-joint-welded':
                    from .submodules.lap_joint_welded.adapter import create_from_input
                    create_from_input_func = create_from_input
            except ImportError as e:
                print(f"[SimpleConnectionViewSet] Could not import create_from_input for {submodule_slug}: {e}")
            
            # Generate CAD models
            result = generate_cad_models(
                service_class=ServiceClass,
                inputs=inputs,
                sections=sections,
                create_from_input_func=create_from_input_func
            )
            
            if not result['files']:
                # Check if this is a known limitation (no CAD support yet)
                # Return "coming soon" message instead of error
                return Response(
                    {
                        'status': 'coming_soon',
                        'message': '3D model generation is coming soon for this module',
                        'files': {},
                        'hover_dict': {}
                    },
                    status=200
                )
            
            return Response({
                'status': 'success',
                'files': result['files'],
                'hover_dict': result['hover_dict'],
                'message': 'CAD models generated successfully',
                'warnings': result['warnings']
            }, status=201)
            
        except Exception as e:
            print(f"[SimpleConnectionViewSet] Error generating CAD: {e}")
            import traceback
            traceback.print_exc()
            # For modules without CAD support, return "coming soon" instead of error
            # Check if it's a CAD-related error (ValueError, AttributeError, etc.)
            if isinstance(e, (ValueError, AttributeError, ImportError)):
                return Response(
                    {
                        'status': 'coming_soon',
                        'message': '3D model generation is coming soon for this module',
                        'files': {},
                        'hover_dict': {}
                    },
                    status=200
                )
            # For other errors, return error response
            return Response(
                {'error': str(e), 'status': 'error'},
                status=500
            )

    @action(detail=False, methods=['post'], url_path='(?P<submodule_slug>[^/.]+)/report/generate-initial')
    def report_generate_initial(self, request, submodule_slug=None):
        """
        POST /api/modules/simple-connection/{submodule_slug}/report/generate-initial/

        Currently a placeholder: simple-connection modules do not yet have
        desktop-style design report support wired into the backend.
        """
        module_id = SIMPLE_CONNECTION_REPORT_MODULE_ID_MAP.get(submodule_slug)
        if not module_id:
            return Response(
                {
                    "success": False,
                    "error": (
                        f"Report generation is not yet implemented for simple-connection "
                        f"sub-module '{submodule_slug}'."
                    ),
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
