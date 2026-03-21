"""
Column Cover Plate Bolted Service - Business logic layer
Bridges between API and osdag_core
"""
from osdag_core.design_type.connection.column_cover_plate import ColumnCoverPlate
from .adapter import validate_input, generate_output, create_cad_model


class ColumnCoverPlateBoltedService:
    """Service class for Column Cover Plate Bolted Connection module"""
    
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """Run design calculation and return results"""
        validate_input(inputs)
        model = ColumnCoverPlate()
        if hasattr(model, "set_osdaglogger"):
            model.set_osdaglogger(None, id="web")
        model.set_input_values(inputs)
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

