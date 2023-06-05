"""Define all exceptions used in the Osdag api."""

import typing

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