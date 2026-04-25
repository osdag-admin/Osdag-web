"""
Base Plate Service - Business logic layer
Bridges between API and osdag_core
"""
from .adapter import validate_input, generate_output, create_cad_model
import traceback


class BasePlateService:
    """Service class for Base Plate module"""
    
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
        print("=" * 60)
        print("BasePlateService.calculate() called")
        print("=" * 60)
        print(f"Inputs received: {list(inputs.keys())[:10]}...")  # Print first 10 keys
        
        try:
            # Validate inputs
            print("\n[1/3] Validating inputs...")
            validate_input(inputs)
            print("✅ Input validation passed")
            
            # Generate formatted output (this handles module creation and calculation)
            print("\n[2/3] Generating output (creates module and runs calculation)...")
            output, logs = generate_output(inputs)
            print(f"✅ Output generated: {len(output)} output parameters")
            print(f"✅ Logs retrieved: {len(logs) if logs else 0} log entries")
            
            print("\n[3/3] Preparing response...")
            result = {
                'data': output,
                'logs': logs or [],  # Ensure logs is always a list
                'success': True
            }
            print("✅ Response prepared successfully")
            print("=" * 60)
            
            return result
            
        except Exception as e:
            print("\n" + "=" * 60)
            print("ERROR in BasePlateService.calculate()")
            print("=" * 60)
            print(f"Exception type: {type(e).__name__}")
            print(f"Exception message: {str(e)}")
            
            # Safely extract error message
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
            section: Section to generate
            session: Session identifier for file naming
            
        Returns:
            File path to the generated CAD model
        """
        return create_cad_model(inputs, section, session)
