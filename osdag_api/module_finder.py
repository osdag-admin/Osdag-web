import osdag_api.modules.fin_plate_connection as fin_plate_connection
from types import ModuleType
import typing
module_dict = {
    'Fin Plate Connection': fin_plate_connection
}
def get_module_api(module_id: str) -> ModuleType:
    """Return the api for the specified module"""
    module = module_dict[module_id]
    return module