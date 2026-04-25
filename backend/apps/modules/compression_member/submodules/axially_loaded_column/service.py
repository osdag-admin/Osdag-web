"""
Axially Loaded Column - Service Layer
Bridges between the REST API and osdag_core ColumnDesign via the local adapter.
"""

from .adapter import validate_input, generate_output, create_cad_model
import traceback


class AxiallyLoadedColumnService:
    """Service class for Axially-Loaded-Column module."""

    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """
        Run design calculation and return results.

        Args:
            inputs: Dictionary of input parameters.
            request: Optional Django request object (unused for now).
            project_id: Optional project ID (unused for now; handled at higher layer).
            user_email: Optional user email (unused for now; handled at higher layer).

        Returns:
            dict with:
                - data: flattened output dict { key: {key,label,val} }
                - logs: list of log strings
                - success: bool
                - error: optional error message on failure
        """
        print("=" * 60)
        print("AxiallyLoadedColumnService.calculate() called")
        print("=" * 60)
        print(f"Inputs received keys (first 10): {list(inputs.keys())[:10]}")

        try:
            # 1) Validate inputs
            print("\n[1/3] Validating inputs...")
            validate_input(inputs)
            print("✅ Input validation passed")

            # 2) Generate output (creates ColumnDesign instance and runs calculation)
            print("\n[2/3] Generating output from ColumnDesign...")
            output, logs = generate_output(inputs)
            print(f"✅ Output generated: {len(output)} parameters")
            print(f"✅ Logs count: {len(logs) if logs else 0}")

            # 3) Prepare response
            print("\n[3/3] Preparing response payload...")
            result = {
                "data": output,
                "logs": logs or [],
                "success": True,
            }
            print("✅ AxiallyLoadedColumnService.calculate() completed successfully")
            print("=" * 60)
            return result

        except Exception as e:
            print("\n" + "=" * 60)
            print("❌ ERROR in AxiallyLoadedColumnService.calculate()")
            print("=" * 60)
            print(f"Exception type: {type(e).__name__}")
            print(f"Exception message: {str(e)}")

            # Derive a clean error message
            error_msg = str(e)
            if hasattr(e, "error") and e.error is not None:
                error_msg = str(e.error)
            elif hasattr(e, "args") and e.args:
                error_msg = str(e.args[0])

            print(f"Final error message: {error_msg}")
            print("\nFull traceback:")
            traceback.print_exc()
            print("=" * 60)

            return {
                "data": {},
                "logs": [],
                "success": False,
                "error": error_msg,
            }

    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str) -> str:
        """
        Generate CAD model and return file path.

        Args:
            inputs: Dictionary of input parameters.
            section: Section name ('Model', 'Column', etc.).
            session: Session identifier for file naming.

        Returns:
            File path to the generated CAD model (relative to project root).
        """
        return create_cad_model(inputs, section, session)

