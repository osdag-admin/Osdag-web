"""
Purlin Service - Business logic layer
Bridges between API and osdag_core
"""

from .adapter import validate_input, generate_output, create_cad_model
import traceback


class PurlinService:
    """Service class for Purlin module"""

    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:

        print("=" * 60)
        print("PurlinService.calculate() called")
        print("=" * 60)

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

            if hasattr(e, 'error') and e.error:
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
        return create_cad_model(inputs, section, session)