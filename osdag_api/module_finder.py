from osdag_api.modules import fin_plate_connection
from types import ModuleType
import typing
from typing import Dict, Any, List, _Protocol
class ModuleApiType(_Protocol):

    def validate_input(self, input_values: Dict[str, Any]) -> None:
        """Validate type for all values in design dict. Raise error when invalid"""
        pass
    def get_required_keys(self) -> List[str]:
        pass
    def create_module(self) -> Any:
        """Create an instance of themodule design class and set it up for use"""
        pass
    def create_from_input(self, input_values: Dict[str, Any]) -> Any:
        """Create an instance of the module design class from input values."""
        pass
    def generate_output(self, input_values: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate, format and return the input values from the given output values.
        Output format (json): {
            "Bolt.Pitch": 
                "key": "Bolt.Pitch",
                "label": "Pitch Distance (mm)"
                "value": 40
            }
        }
        """
        pass
    def create_cad_model(self, input_values: Dict[str, Any], section: str, session: str) -> str:
        """Generate the CAD model from input values as a BREP file. Return file path."""
        pass
module_dict : Dict[str, ModuleApiType] = {
    'Fin Plate Connection': fin_plate_connection
} 
def get_module_api(module_id: str) -> ModuleApiType:
    """Return the api for the specified module"""
    module = module_dict[module_id]
    return module