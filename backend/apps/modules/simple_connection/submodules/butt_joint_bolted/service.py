"""
Service for Butt Joint Bolted
"""
from osdag_core.Common import KEY_DISP_BUTTJOINTBOLTED
from .adapter import validate_input, generate_output, create_cad_model
import traceback


MODULE_ID = KEY_DISP_BUTTJOINTBOLTED


class Service:
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        try:
            validate_input(inputs)
            output, logs, raw_csv = generate_output(inputs)
            return {
                'data': output,
                'logs': logs or [],
                'success': True,
                'raw_csv': raw_csv or {},
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
    def get_cad_model(inputs: dict, section: str, session: str, module=None) -> str:
        """
        Generate CAD model and return file path.
        
        Args:
            inputs: Dictionary of input parameters
            section: Section to generate ('Model', 'Column', 'Plate')
            session: Session identifier for file naming
            module: Solved module instance to build from; when omitted the design is recalculated
            
        Returns:
            File path to the generated CAD model
        """
        return create_cad_model(inputs, section, session, module=module)

