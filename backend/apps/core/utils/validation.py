"""
Validation utilities for the backend.
Contains utility functions for input validation and type checking.
"""
from typing import List, Tuple, Callable, Any, Optional, Iterable
from .errors import InvalidInputTypeError


def validate_list_type(iterable: Iterable, data_type: Any) -> bool:
    """Validate whether the all items of list are of data type."""
    if len(iterable) == 0:
        return False
    for item in iterable:
        if not isinstance(item, data_type):
            return False
    return True


def contains_keys(data: dict, keys: List[str]) -> Optional[Tuple[str]]:
    """Check whether dictionary contains all given keys."""
    missing = []
    for key in keys:
        if key not in data.keys():
            missing.append(key)
    if missing != []:
        return tuple(missing)


def custom_list_validation(iterable: Iterable, validation: Callable[[Any], bool]) -> bool:
    """Validate all items in the list using a custom function."""
    for item in iterable:
        if not validation(item):
            print(item)
            return False
    return True


def int_able(value: str) -> bool:
    """Check if str can be converted to int."""
    try:
        int(value)
    except:
        return False
    return True


def float_able(value: str) -> bool:
    """Check if str can be converted to float."""
    try:
        float(value)
    except:
        return False
    return True


def is_yes_or_no(value: Any) -> bool:
    """Checks if value is 'Yes' or 'No'."""
    if not isinstance(value, str):
        return False
    if not (value == "Yes" or value == "No"):
        return False
    return True


def validate_string(key: str, value: Any) -> None:
    """Check if value is a string. If not, raise error."""
    if not isinstance(value, str):
        raise InvalidInputTypeError(key, "str")


def validate_num(key: str, value: Any, is_float: bool) -> None:
    """Check if value is a string that can be converted to a number. If not, raise error."""
    if is_float:
        checker = float_able
        type_str = "float"
    else:
        checker = int_able
        type_str = "int"
    if (not isinstance(value, str) or not checker(value)):
        raise InvalidInputTypeError(key, "str where str can be converted to " + type_str)


def validate_arr(key: str, value: Any, is_float: bool) -> None:
    """Check if value is a list where all items can be converted to numbers."""
    if is_float:
        checker = float_able
        type_str = "float"
    else:
        checker = int_able
        type_str = "int"
    if (not isinstance(value, list)
            or not validate_list_type(value, str)
            or not custom_list_validation(value, checker)):
        raise InvalidInputTypeError(key, "non empty List[str] where all items can be converted to " + type_str)

