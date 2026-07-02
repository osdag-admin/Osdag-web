"""
Plate Girder Service - Business logic layer
Bridges between API and osdag_core
"""
from .adapter import validate_input, generate_output, create_cad_model, create_from_input
from apps.core.models import Material, CustomMaterials
import traceback


class PlateGirderService:
    """Service class for Plate Girder module"""
    
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """
        Run design calculation and return results.
        
        Args:
            inputs: Dictionary of input parameters
            request: Optional Django request object (for future use)
            project_id: Optional project ID (for future use)
            user_email: Optional user email (for future use)
            
        Returns:
            Dictionary with 'data' (results) and 'logs' (calculation logs)
        """
        try:
            validate_input(inputs)
            output, logs = generate_output(inputs)

            return {
                'data': output,
                'logs': logs or [],
                'success': True
            }

        except Exception as e:
            error_msg = str(e)
            if hasattr(e, 'error') and e.error is not None:
                error_msg = str(e.error)
            elif hasattr(e, 'args') and len(e.args) > 0:
                error_msg = str(e.args[0])

            traceback.print_exc()

            return {
                'data': {},
                'logs': [],
                'success': False,
                'error': error_msg
            }
    
    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str) -> str:
        """
        Generate CAD model and return file path.
        
        Args:
            inputs: Dictionary of input parameters
            section: Section to generate
            session: Session identifier for file naming
            
        Returns:
            File path to the generated CAD model
        """
        return create_cad_model(inputs, section, session)
    
    @staticmethod
    def get_options(request) -> dict:
        """
        Get options/dropdowns data for the plate girder module.
        
        Args:
            request: Django request object (for user-specific materials)
            
        Returns:
            Dictionary with options data (materials, thickness lists, etc.)
        """
        email = request.query_params.get("email") if request else None

        def material_list():
            mats = list(Material.objects.all().values())
            if email:
                mats += list(CustomMaterials.objects.filter(email=email).values())
            mats.append({"id": -1, "Grade": "Custom"})
            return mats

        thickness_list = [
            '3', '4', '5', '6', '8', '10', '12', '14', '16', '18', '20', 
            '22', '24', '26', '28', '30', '32', '36', '40'
        ]

        stiffener_thickness_list = [
            '6', '8', '10', '12', '14', '16', '18', '20', 
            '22', '24', '26', '28', '30', '32', '36', '40'
        ]
        
        return {
            'materialList': material_list(),
            'thicknessList': thickness_list,
            'stiffenerThicknessList': stiffener_thickness_list,
        }

