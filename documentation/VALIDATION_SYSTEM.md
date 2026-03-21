# Validation System Documentation

## Overview

The Osdag-Web validation system provides a DRY (Don't Repeat Yourself) approach to input validation across modules. It consists of:

1. **Backend Validation**: Shared validators for Python adapters
2. **Frontend Validation**: JavaScript validation utilities for React components
3. **Error Handling**: Structured error responses with appropriate HTTP status codes

This system was initially implemented for Simple Connection modules and can be extended to other modules.

---

## Table of Contents

1. [Backend Validation](#backend-validation)
2. [Frontend Validation](#frontend-validation)
3. [Error Handling](#error-handling)
4. [Using Validators in Other Modules](#using-validators-in-other-modules)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## Backend Validation

### Location

- **Shared Validator**: `backend/apps/modules/simple_connection/shared_validation.py`
- **Error Classes**: `backend/apps/core/utils/errors.py`

### Components

#### 1. SimpleConnectionValidator Class

A configurable validator class that handles:
- Required key validation
- Type validation (numeric, list, string)
- Range validation (min/max values)
- Module-specific field validation (bolts, welds)

#### 2. Factory Functions

Pre-configured validators for common use cases:
- `create_bolted_validator()`: For bolted connections
- `create_welded_validator()`: For welded connections

#### 3. Exception Classes

- `MissingKeyError`: Raised when required keys are missing
- `InvalidInputTypeError`: Raised when input type is incorrect
- `RangeValidationError`: Raised when values are outside allowed range
- `ValidationError`: Raised when multiple validation errors occur

### Usage in Adapters

#### Basic Example

```python
from ...shared_validation import create_bolted_validator

def get_required_keys() -> List[str]:
    return [
        "Module",
        "Material",
        "Load.Axial",
        "PlateWidth",
        # ... other required keys
    ]

# Create validator instance (module-level)
_validator = create_bolted_validator(get_required_keys(), "YourModuleName")

def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate input values using shared validator"""
    _validator.validate(input_values)
```

#### Custom Validator Example

If you need custom validation rules:

```python
from ...shared_validation import SimpleConnectionValidator

# Create custom validator
_validator = (SimpleConnectionValidator(get_required_keys(), "YourModuleName")
    .add_range_validation("PlateWidth", min_value=0.0, allow_zero=False)
    .add_range_validation("Load.Axial", min_value=0.0, allow_zero=False)
    .add_range_validation("CustomField", min_value=10.0, max_value=100.0, allow_zero=False))

def validate_input(input_values: Dict[str, Any]) -> None:
    _validator.validate(input_values)
```

### Range Validation Options

The `add_range_validation()` method accepts:

- `key` (str): The field name to validate
- `min_value` (float): Minimum allowed value (default: 0.0)
- `max_value` (Optional[float]): Maximum allowed value (default: None)
- `allow_zero` (bool): Whether zero is allowed (default: False)

**Examples:**

```python
# Positive values only (> 0)
.add_range_validation("PlateWidth", min_value=0.0, allow_zero=False)

# Zero or positive (>= 0)
.add_range_validation("OptionalField", min_value=0.0, allow_zero=True)

# Bounded range
.add_range_validation("SlipFactor", min_value=0.0, max_value=1.0, allow_zero=False)

# Minimum threshold
.add_range_validation("Thickness", min_value=5.0, allow_zero=False)
```

### What Gets Validated

The `SimpleConnectionValidator` automatically validates:

1. **Required Keys**: Checks all keys in `required_keys` list
2. **Bolt Fields** (if present):
   - `Bolt.Diameter`: Must be `List[str]` convertible to int
   - `Bolt.Grade`: Must be `List[str]` convertible to float
3. **Weld Fields** (if present):
   - `Weld.Size`: Must be `List[str]` convertible to float (normalizes single values to list)
4. **Numeric Fields**: Validates and normalizes:
   - `Plate1Thickness`, `Plate2Thickness`
   - `PlateWidth`
   - `Load.Axial`
   - `Bolt.Slip_Factor`
5. **Range Validations**: All fields added via `add_range_validation()`

### Value Normalization

The validator automatically normalizes values:

- **Lists/Tuples**: Extracts first element if single-item list
- **Numeric Types**: Converts `int`/`float` to `str` for consistency
- **Weld Size**: Converts single values to list format

---

## Frontend Validation

### Location

- **Shared Validator**: `frontend/src/modules/SimpleConnection/shared/validation.js`

### Function

```javascript
validateSimpleConnectionInputs(inputs, options)
```

**Parameters:**
- `inputs` (Object): Input values object
- `options` (Object): Validation options
  - `moduleType` (string): `'bolted'` or `'welded'`

**Returns:**
```javascript
{
    isValid: boolean,
    errors: Array<{field: string, message: string}>,
    message: string  // Combined error messages
}
```

### Usage in Config Files

```javascript
import { validateSimpleConnectionInputs } from "../../shared/validation";

export const yourModuleConfig = {
    // ... other config
    validateInputs: (inputs) => {
        return validateSimpleConnectionInputs(inputs, { 
            moduleType: 'bolted'  // or 'welded'
        });
    },
    // ... rest of config
};
```

### What Gets Validated

**Common Validations (all modules):**
- `material`: Required, not empty
- `plate_width`: Required, must be > 0
- `axial_force`: Required, must be > 0
- `plate1_thickness`: Required, must be > 0
- `plate2_thickness`: Required, must be > 0

**Bolted Connections (`moduleType: 'bolted'`):**
- `bolt_diameter`: At least one must be selected
- `bolt_grade`: At least one must be selected
- `bolt_slip_factor`: Must be between 0 and 1.0 (if provided)

**Welded Connections (`moduleType: 'welded'`):**
- `weld_size`: Required, must be > 0

### Error Response Format

```javascript
{
    isValid: false,
    errors: [
        { field: 'plate_width', message: 'Plate width must be greater than zero' },
        { field: 'axial_force', message: 'Axial force must be greater than zero' }
    ],
    message: 'Plate width must be greater than zero; Axial force must be greater than zero'
}
```

---

## Error Handling

### Backend Error Response Format

All validation errors are returned in a consistent format:

```json
{
    "success": false,
    "error": {
        "type": "validation_error" | "range_validation_error" | "value_error" | "server_error",
        "message": "Human-readable error message",
        "details": [
            {
                "field": "PlateWidth",
                "message": "PlateWidth value -5 violates constraint: minimum 0.0 (exclusive)"
            }
        ]
    }
}
```

### HTTP Status Codes

- **400 Bad Request**: Validation errors (MissingKeyError, InvalidInputTypeError, RangeValidationError)
- **422 Unprocessable Entity**: Value errors (ValueError)
- **500 Internal Server Error**: Unexpected server errors

### Using Error Handling in ViewSets

```python
from apps.core.utils.errors import format_error_response, get_error_status_code
import logging

logger = logging.getLogger(__name__)

class YourViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def design(self, request):
        try:
            # Your design logic
            result = ServiceClass.calculate(inputs=inputs)
            return Response(result, status=200)
        except Exception as exc:
            logger.error(f"Error in design: {exc}", exc_info=True)
            error_response = format_error_response(exc)
            status_code = get_error_status_code(exc)
            return Response(error_response, status=status_code)
```

---

## Using Validators in Other Modules

### Step 1: Create Shared Validator (if needed)

If your module has unique validation requirements, create a shared validator:

**File**: `backend/apps/modules/your_module/shared_validation.py`

```python
from typing import Dict, Any, List
from apps.core.utils import MissingKeyError, InvalidInputTypeError
from apps.core.utils.errors import RangeValidationError
from apps.modules.simple_connection.shared_validation import SimpleConnectionValidator

def create_your_module_validator(required_keys: List[str], module_name: str):
    """Create validator for your module"""
    return (SimpleConnectionValidator(required_keys, module_name)
        .add_range_validation("YourField1", min_value=0.0, allow_zero=False)
        .add_range_validation("YourField2", min_value=10.0, max_value=100.0, allow_zero=False))
```

### Step 2: Update Adapter

**File**: `backend/apps/modules/your_module/submodules/your_submodule/adapter.py`

```python
from ...shared_validation import create_your_module_validator

def get_required_keys() -> List[str]:
    return ["Module", "Material", "YourField1", "YourField2"]

# Create validator instance
_validator = create_your_module_validator(get_required_keys(), "YourModuleName")

def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate input values using shared validator"""
    _validator.validate(input_values)
```

### Step 3: Update ViewSet Error Handling

**File**: `backend/apps/modules/your_module/views.py`

```python
from apps.core.utils.errors import format_error_response, get_error_status_code
import logging

logger = logging.getLogger(__name__)

class YourViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def design(self, request):
        try:
            # Your logic
            result = ServiceClass.calculate(inputs=inputs)
            return Response(result, status=200)
        except Exception as exc:
            logger.error(f"Error: {exc}", exc_info=True)
            error_response = format_error_response(exc)
            status_code = get_error_status_code(exc)
            return Response(error_response, status=status_code)
```

### Step 4: Create Frontend Validator (if needed)

**File**: `frontend/src/modules/YourModule/shared/validation.js`

```javascript
/**
 * Validates your module inputs
 */
export function validateYourModuleInputs(inputs, options = {}) {
    const errors = [];

    // Required fields
    if (!inputs.your_field || inputs.your_field.trim() === '') {
        errors.push({ field: 'your_field', message: 'Your field is required' });
    } else {
        const value = parseFloat(inputs.your_field);
        if (isNaN(value) || value <= 0) {
            errors.push({ field: 'your_field', message: 'Your field must be greater than zero' });
        }
    }

    // Add more validations...

    const message = errors.length > 0
        ? errors.map(e => e.message).join('; ')
        : '';

    return {
        isValid: errors.length === 0,
        errors: errors,
        message: message
    };
}
```

### Step 5: Update Frontend Config

**File**: `frontend/src/modules/YourModule/YourSubmodule/config/yourConfig.js`

```javascript
import { validateYourModuleInputs } from "../../shared/validation";

export const yourConfig = {
    // ... other config
    validateInputs: (inputs) => {
        return validateYourModuleInputs(inputs, { 
            // your options
        });
    },
    // ... rest of config
};
```

---

## Examples

### Example 1: Simple Bolted Connection

**Backend Adapter:**

```python
from ...shared_validation import create_bolted_validator

def get_required_keys() -> List[str]:
    return [
        "Module", "Material", "Load.Axial",
        "Plate1Thickness", "Plate2Thickness", "PlateWidth",
        "Bolt.Diameter", "Bolt.Grade", "Bolt.Slip_Factor"
    ]

_validator = create_bolted_validator(get_required_keys(), "SimpleBolted")

def validate_input(input_values: Dict[str, Any]) -> None:
    _validator.validate(input_values)
```

**Frontend Config:**

```javascript
import { validateSimpleConnectionInputs } from "../../shared/validation";

export const simpleBoltedConfig = {
    validateInputs: (inputs) => {
        return validateSimpleConnectionInputs(inputs, { 
            moduleType: 'bolted'
        });
    },
};
```

### Example 2: Custom Validator with Additional Fields

**Backend Adapter:**

```python
from ...shared_validation import SimpleConnectionValidator

def get_required_keys() -> List[str]:
    return ["Module", "Material", "Length", "Width", "Height"]

_validator = (SimpleConnectionValidator(get_required_keys(), "CustomModule")
    .add_range_validation("Length", min_value=100.0, allow_zero=False)
    .add_range_validation("Width", min_value=50.0, max_value=200.0, allow_zero=False)
    .add_range_validation("Height", min_value=0.0, allow_zero=True))  # Allow zero

def validate_input(input_values: Dict[str, Any]) -> None:
    _validator.validate(input_values)
```

### Example 3: Handling Validation Errors

**ViewSet:**

```python
from apps.core.utils.errors import format_error_response, get_error_status_code
import logging

logger = logging.getLogger(__name__)

@action(detail=False, methods=['post'])
def design(self, request):
    try:
        validate_input(request.data.get('inputs', {}))
        result = ServiceClass.calculate(inputs=inputs)
        return Response(result, status=200)
    except MissingKeyError as e:
        # Missing required field
        error_response = format_error_response(e)
        return Response(error_response, status=400)
    except RangeValidationError as e:
        # Value out of range
        error_response = format_error_response(e)
        return Response(error_response, status=400)
    except Exception as exc:
        # Unexpected error
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        error_response = format_error_response(exc)
        status_code = get_error_status_code(exc)
        return Response(error_response, status=status_code)
```

---

## Best Practices

### 1. Use Factory Functions When Possible

Prefer factory functions (`create_bolted_validator`, `create_welded_validator`) over creating validators from scratch when they match your needs.

### 2. Create Module-Specific Validators

If multiple submodules share validation logic, create a shared validator in the module's root directory:

```
your_module/
├── shared_validation.py  # Shared validator
├── submodules/
│   ├── submodule1/
│   │   └── adapter.py   # Uses shared validator
│   └── submodule2/
│       └── adapter.py   # Uses shared validator
```

### 3. Keep Validation Logic DRY

- Don't duplicate validation logic across adapters
- Use shared validators for common patterns
- Extend `SimpleConnectionValidator` for custom needs

### 4. Provide Clear Error Messages

Ensure error messages are:
- User-friendly
- Specific to the field
- Include the actual value when helpful

### 5. Validate Early

Validate inputs as early as possible:
- Frontend: Before API submission
- Backend: In the adapter's `validate_input()` function

### 6. Log Server Errors

Always log unexpected errors with full traceback:

```python
logger.error(f"Error in module: {exc}", exc_info=True)
```

### 7. Use Appropriate HTTP Status Codes

- `400`: Client errors (validation, missing fields)
- `422`: Unprocessable entity (value errors)
- `500`: Server errors (unexpected exceptions)

### 8. Test Validation

Test your validators with:
- Valid inputs (should pass)
- Missing required fields (should fail)
- Invalid types (should fail)
- Out-of-range values (should fail)
- Zero/negative values (should fail if not allowed)

---

## Extending the System

### Adding New Validation Types

To add new validation types (e.g., email, URL, regex patterns):

1. **Extend SimpleConnectionValidator:**

```python
class SimpleConnectionValidator:
    def add_email_validation(self, key: str):
        """Add email validation"""
        # Implementation
        return self
    
    def add_regex_validation(self, key: str, pattern: str):
        """Add regex validation"""
        # Implementation
        return self
```

2. **Update Frontend Validator:**

```javascript
export function validateYourModuleInputs(inputs, options = {}) {
    const errors = [];
    
    // Email validation
    if (inputs.email && !isValidEmail(inputs.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }
    
    // Regex validation
    if (inputs.code && !/^[A-Z0-9]+$/.test(inputs.code)) {
        errors.push({ field: 'code', message: 'Code must be uppercase alphanumeric' });
    }
    
    return { isValid: errors.length === 0, errors, message: errors.map(e => e.message).join('; ') };
}
```

### Adding Module-Specific Validations

For module-specific validations, extend the validator in your module:

```python
class YourModuleValidator(SimpleConnectionValidator):
    def _validate_custom_field(self, iv: Dict[str, Any]) -> None:
        """Validate custom field specific to your module"""
        if "CustomField" in iv:
            # Your validation logic
            pass
```

---

## Troubleshooting

### Common Issues

1. **Validation passes but design fails:**
   - Check if all required fields are in `required_keys`
   - Verify range validations cover all numeric fields

2. **Frontend validation not working:**
   - Ensure `validateInputs` is not commented out
   - Check that the function returns `{ isValid, errors, message }`

3. **Error response format incorrect:**
   - Use `format_error_response()` in ViewSet
   - Check that exceptions inherit from `OsdagApiException`

4. **Value normalization issues:**
   - The validator normalizes lists/tuples to first element
   - Numeric values are converted to strings
   - Check if your code expects specific types

---

## Summary

The validation system provides:

✅ **DRY validation logic** across modules  
✅ **Consistent error responses** with appropriate HTTP status codes  
✅ **Frontend and backend validation** for better UX  
✅ **Extensible architecture** for custom validation needs  
✅ **Clear error messages** for debugging and user feedback  

For questions or issues, refer to the Simple Connection modules as reference implementations.

