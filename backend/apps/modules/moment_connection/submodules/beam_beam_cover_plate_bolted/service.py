"""
Cover Plate Bolted Service - Business logic layer
Bridges between API and osdag_core
"""
from .adapter import validate_input, generate_output, create_cad_model


class CoverPlateBoltedService:
    """Service class for Cover Plate Bolted Connection module"""
    
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """Run design calculation and return results"""
        validate_input(inputs)
        output, logs, raw_csv = generate_output(inputs)
        return {
            'data': output,
            'logs': logs,
            'success': True,
            'raw_csv': raw_csv or {},
        }
    
    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str, module=None) -> str:
        """Generate CAD model and return file path"""
        return create_cad_model(inputs, section, session, module=module)

