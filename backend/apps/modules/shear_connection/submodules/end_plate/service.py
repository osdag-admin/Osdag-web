"""
End Plate Service - Business logic layer
"""
from osdag_core.design_type.connection.end_plate_connection import EndPlateConnection
from .adapter import validate_input, generate_output, create_cad_model
import traceback


class EndPlateService:
    """Service class for End Plate Connection module"""
    
    @staticmethod
    def calculate(inputs: dict, request=None, project_id=None, user_email=None) -> dict:
        """Run design calculation and return results"""
        print("\n" + "=" * 80)
        print("[EndPlateService.calculate] called")
        print(f"[EndPlateService.calculate] input keys={list(inputs.keys()) if isinstance(inputs, dict) else type(inputs)}")
        if isinstance(inputs, dict):
            for k in [
                "Connectivity",
                "Bolt.Type",
                "Member.Supported_Section.Designation",
                "Member.Supporting_Section.Designation",
                "Connector.Plate.Thickness_List",
                "Module",
            ]:
                if k in inputs:
                    print(f"[EndPlateService.calculate] {k}={inputs.get(k)!r}")
        try:
            validate_input(inputs)
            print("[EndPlateService.calculate] validate_input passed")
            output, logs = generate_output(inputs)
            print(f"[EndPlateService.calculate] output_count={len(output) if isinstance(output, dict) else 'NA'}")
            print(f"[EndPlateService.calculate] logs_count={len(logs) if isinstance(logs, list) else 'NA'}")
            print("=" * 80 + "\n")
            return {
                'data': output,
                'logs': logs,
                'success': True
            }
        except Exception as e:
            print("[EndPlateService.calculate] ERROR")
            print(f"[EndPlateService.calculate] exception={type(e).__name__}: {e}")
            traceback.print_exc()
            print("=" * 80 + "\n")
            raise
    
    @staticmethod
    def get_cad_model(inputs: dict, section: str, session: str) -> str:
        """Generate CAD model and return file path"""
        return create_cad_model(inputs, section, session)

