"""
Seated Angle Service - Business logic layer
"""
from osdag_core.design_type.connection.seated_angle_connection import SeatedAngleConnection
from .adapter import validate_input, generate_output, create_cad_model


class SeatedAngleService:
    """Service class for Seated Angle Connection module"""
    
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """Run design calculation and return results"""
        validate_input(inputs)
        output, logs = generate_output(inputs)
        return {
            'data': output,
            'logs': logs,
            'success': True
        }
    
    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str) -> str:
        """Generate CAD model and return file path"""
        return create_cad_model(inputs, section, session)

