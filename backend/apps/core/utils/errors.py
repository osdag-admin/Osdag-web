"""Define all exceptions used in the Osdag backend."""
from typing import Dict, Any, List, Optional
from rest_framework import status


class OsdagApiException(Exception):
    """Super class for all Osdag api exceptions."""
    pass


class MissingKeyError(OsdagApiException):
    """Raised when a design parameter is missing from the input parameters."""
    def __init__(self, key: str):
        super(MissingKeyError, self).__init__("Please specify " + key + " in input values.")


class InvalidInputTypeError(OsdagApiException):
    """Raised when an input parameter is of wrong type."""
    def __init__(self, key: str, type: str):
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


def format_error_response(
    error: Exception, 
    error_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Format any exception into a consistent API error response.
    Used by all ViewSets for consistent error handling.
    """
    # Determine error type if not provided
    if error_type is None:
        if isinstance(error, (MissingKeyError, InvalidInputTypeError, ValidationError)):
            error_type = "validation_error"
        elif isinstance(error, RangeValidationError):
            error_type = "range_validation_error"
        elif isinstance(error, ValueError):
            error_type = "value_error"
        else:
            error_type = "server_error"
    
    # Build error details
    details = []
    if isinstance(error, ValidationError):
        details = error.errors
    elif isinstance(error, (MissingKeyError, InvalidInputTypeError)):
        details = [{"field": "input", "message": str(error)}]
    elif isinstance(error, RangeValidationError):
        details = [{"field": error.field, "message": str(error)}]
    elif isinstance(error, ValueError):
        details = [{"field": "unknown", "message": str(error)}]
    
    return {
        "success": False,
        "error": {
            "type": error_type,
            "message": str(error),
            "details": details
        }
    }


def get_error_status_code(error: Exception) -> int:
    """Get appropriate HTTP status code for error type"""
    if isinstance(error, (MissingKeyError, InvalidInputTypeError, ValidationError, RangeValidationError)):
        return status.HTTP_400_BAD_REQUEST
    elif isinstance(error, ValueError):
        return status.HTTP_422_UNPROCESSABLE_ENTITY
    else:
        return status.HTTP_500_INTERNAL_SERVER_ERROR

