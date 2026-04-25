"""
On Cantilever Beam Service - Business logic layer
Bridges between API and osdag_core Flexure_Cantilever
"""
from .adapter import validate_input, generate_output, create_cad_model
import traceback


class OnCantileverService:
    """Service class for On-Cantilever-Beam module"""

    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """
        Run design calculation and return results.

        Args:
            inputs: Dictionary of input parameters
            request: Optional Django request object
            project_id: Optional project ID
            user_email: Optional user email

        Returns:
            Dictionary with 'data' (results) and 'logs' (calculation logs)
        """
        print("=" * 60)
        print("OnCantileverService.calculate() called")
        print("=" * 60)
        print(f"Inputs received: {list(inputs.keys())[:10]}...")

        try:
            # Validate inputs
            print("\n[1/3] Validating inputs...")
            validate_input(inputs)
            print("✅ Input validation passed")

            # Generate formatted output
            print("\n[2/3] Generating output...")
            output, logs = generate_output(inputs)
            print(f"✅ Output generated: {len(output)} output parameters")
            print(f"✅ Logs retrieved: {len(logs) if logs else 0} log entries")

            print("\n[3/3] Preparing response...")
            result = {
                'data': output,
                'logs': logs or [],
                'success': True
            }
            print("✅ Response prepared successfully")
            print("=" * 60)

            return result

        except Exception as e:
            print("\n" + "=" * 60)
            print("ERROR in OnCantileverService.calculate()")
            print("=" * 60)
            print(f"Exception type: {type(e).__name__}")
            print(f"Exception message: {str(e)}")

            error_msg = str(e)
            if hasattr(e, 'error') and e.error is not None:
                error_msg = str(e.error)
            elif hasattr(e, 'args') and len(e.args) > 0:
                error_msg = str(e.args[0])

            print(f"Final error message: {error_msg}")
            print("\nFull traceback:")
            traceback.print_exc()
            print("=" * 60)

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
            section: Section to generate (e.g. 'Model', 'Beam')
            session: Session identifier for file naming

        Returns:
            File path to the generated CAD model (or empty string on failure)
        """
        return create_cad_model(inputs, section, session)
