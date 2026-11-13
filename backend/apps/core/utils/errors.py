"""Define all exceptions used in the Osdag backend."""
from typing import Dict, Any, List, Optional


class OsdagApiException(Exception):
    """Super class for all Osdag api exceptions."""
    pass


class MissingKeyError(OsdagApiException):
    """Raised when a design parameter is missing from the input parameters."""
    def __init__(self, key: str):
        self.key = key
        super(MissingKeyError, self).__init__("Please specify " + key + " in input values.")


class InvalidInputTypeError(OsdagApiException):
    """Raised when an input parameter is of wrong type."""
    def __init__(self, key: str, type: str):
        self.key = key
        self.type = type
        super(InvalidInputTypeError, self).__init__("Input Parameter " + key + " should be of type " + type + " .")


class RangeValidationError(OsdagApiException):
    """Raised when a value is outside allowed range"""
    def __init__(self, field: str, value: Any, min_val: Optional[float] = None, 
                 max_val: Optional[float] = None, allow_zero: bool = False):
        self.field = field
        self.value = value
        constraints = []
        if min_val is not None:
            if allow_zero:
                constraints.append(f"minimum {min_val} (zero allowed)")
            else:
                constraints.append(f"minimum {min_val} (exclusive)")
        if max_val is not None:
            constraints.append(f"maximum {max_val}")
        constraint_str = " and ".join(constraints) if constraints else "invalid range"
        message = f"{field} value {value} violates constraint: {constraint_str}"
        super(RangeValidationError, self).__init__(message)


class ValidationError(OsdagApiException):
    """Raised when input validation fails with multiple errors"""
    def __init__(self, errors: List[Dict[str, str]]):
        self.errors = errors
        message = "Validation failed: " + "; ".join(
            [f"{e.get('field', 'unknown')}: {e.get('message', '')}" for e in errors]
        )
        super(ValidationError, self).__init__(message)
