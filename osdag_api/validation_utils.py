from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
import typing
from typing import Dict, Any, List

def validate_string(key: str, value: Any) -> None:
    """Check if value is a string. If not, raise error."""
    if not isinstance(value, str): # Check if value is a string.
            raise InvalidInputTypeError(key, "str") # If not, raise error.

def validate_num(key: str, value: Any, is_float: bool) -> None:
    """Check if value is a string that can be converted to a number. If not, raise error."""
    if is_float: # If value can be a float.
        checker = float_able # Function for conversion checking
        type = "float" # Type in error
    else:
        checker = int_able
        type = "int"
    if (not isinstance(value, str) # Check if value is a string.
            or not checker(value)): # Check if value can be converted to int/float.
        raise InvalidInputTypeError(key, "str where str can be converted to " + type) # If any of these conditions fail, raise error.

def validate_arr(key: str, value: Any, is_float: bool) -> None:
    """Check if value is a list where all items can be converted to numbers."""
    if is_float: # If value can be a float.
        checker = float_able # Function for conversion checking
        type = "float" # Type in error
    else:
        checker = int_able
        type = "int"
    if (not isinstance(value, list) # Check if value is a list.
            or not validate_list_type(value, str) # Check if all items in value are str.
            or not custom_list_validation(value, checker)): # Check if all items in value can be converted to float.
        raise InvalidInputTypeError(key, "non empty List[str] where all items can be converted to float") # If any of these conditions fail, raise error.