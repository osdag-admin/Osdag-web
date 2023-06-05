"""
This module contains utility functions for use in the api.
Functions:
    validate_list_type(iterable: list, data_type: any) -> bool:
        Validate whether all items in the list are of data type.
    contains_keys(data: dict, keys: List[str]) -> Tuple[str] | None:
        Check whether dictionary contains all given keys.
        If not, return all missing keys.
    custom_list_validation(iterable: Iterable, validation: Callable[[Any], bool]) -> bool:
        Validate all the items in the list using a custom function.
    int_able(value: str) -> bool:
        Check if str can be converted to int.
    float_able(value: str) -> bool:
        Check if str can be converted to float.
    is_yes_or_no(value: Any) -> bool:
        Checks if value is 'Yes' or 'No'.
"""
import typing
from typing import List, Tuple, Callable, Any, Optional, Iterable
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