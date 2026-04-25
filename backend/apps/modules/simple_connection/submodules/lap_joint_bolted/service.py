"""
Service for Lap Joint Bolted
"""
from .adapter import validate_input, generate_output, create_cad_model
import traceback


MODULE_ID = "LapJointBolted"


class Service:
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        try:
            validate_input(inputs)
            output, logs = generate_output(inputs)
            return {
                'data': output,
                'logs': logs or [],
                'success': True
            }
        except Exception as exc:
            traceback.print_exc()
            return {
                'data': {},
                'logs': [],
                'success': False,
                'error': str(exc),
            }
    
    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str) -> str:
        """
        Generate CAD model and return file path.
        
        Args:
            inputs: Dictionary of input parameters
            section: Section to generate ('Model', 'Column', 'Plate', 'Bolt', 'Bolts', 'Connector')
            session: Session identifier for file naming
            
        Returns:
            File path to the generated CAD model
        """
        return create_cad_model(inputs, section, session)

