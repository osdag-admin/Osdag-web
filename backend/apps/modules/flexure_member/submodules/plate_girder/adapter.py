"""
Plate Girder Adapter
Implements the business logic for plate girder module

This adapter handles both:
1. Normal (Customized) design: User provides all dimensions, backend validates and calculates
2. Optimized design: User provides loads/constraints, backend runs PSO to find optimal dimensions

Optimization Input Payload Format:
-----------------------------------
When WebSocket sends optimization request, input_data should contain:

Required fields:
- "Total.Design_Type": "Optimized" (must be "Optimized")
- "Material": Material grade (e.g., "E 250 (Fe 410 W)A")
- "Member.Length": Span length in meters as string (e.g., "5" for 5m)
- "Load.Shear": Shear force in kN as string (e.g., "150")
- "Load.Moment": Bending moment in kNm as string (e.g., "500")
- "Design.Web_Philosophy": "Thick Web without ITS" or "Thin Web with ITS"
- "Web.Thickness": List of available thicknesses (e.g., ["6", "8", "10", "12", "16", "20", "25", "32", "40"])
- "TopFlange.Thickness": List of available thicknesses
- "BottomFlange.Thickness": List of available thicknesses
- "Design.Design_Type_Flexure": Support type (e.g., "Major Laterally Supported")
- "Loading.Bending_Moment_Shape": Loading shape (e.g., "Uniform Loading with pinned-pinned support")
- "Design.Torsional_Restraint": Torsional restraint (e.g., "Fully Restrained")
- "Design.Warping_Restraint": Warping restraint (e.g., "Both flanges fully restrained")
- "Design.Max_Deflection": Deflection limit (e.g., "L/250")
- "Design.Allow_Class": Section class (e.g., "Plastic")
- "Design.Support_Width": Support width in mm as string (e.g., "100")
- "Design.IntermediateStiffener.Spacing": Spacing in mm or "NA"
- "Design.IntermediateStiffener.Thickness": "Standard" or "Customized"
- "Design.LongitudnalStiffener": "No", "Yes and 1 stiffener", or "Yes and 2 stiffeners"
- "Design.LongitudnalStiffener.Thickness": "Standard" or "Customized"

Optional fields:
- "Symmetry": "Symmetrical" (default) or "Unsymmetrical"
- "Loading.Condition": "Normal" (default) or other loading conditions
- "Module": "Plate-Girder" (default)

NOT required for optimization (will be optimized by PSO):
- "Total.Depth" - Will be optimized (bounds: 200-2000 mm, step: 25 mm)
- "Topflange.Width" - Will be optimized (bounds: 100-1000 mm, step: 10 mm)
- "Bottomflange.Width" - Will be optimized (bounds: 100-1000 mm, step: 10 mm)

Usage in Celery Task:
---------------------
In tasks.py, use these functions:

```python
from .adapter import create_optimization_input, determine_optimization_flags

# Convert WebSocket input_data to design_dictionary
design_dict = create_optimization_input(input_data)

# Determine optimization flags
is_thick_web, is_symmetric = determine_optimization_flags(input_data)

# Create module and run optimization
module = create_module()
module.set_input_values(design_dict)
module.optimized_method(design_dict, is_thick_web, is_symmetric, viz_callback=...)
```
"""
from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
)
# PlateGirderWelded will be imported when needed in create_module()
from osdag_core.custom_logger import CustomLogger
from osdag_core.Common import (
    KEY_MODULE, KEY_MATERIAL, KEY_LENGTH, KEY_LOAD, KEY_SHEAR, KEY_MOMENT,
    KEY_OVERALL_DEPTH_PG_TYPE, KEY_OVERALL_DEPTH_PG,
    KEY_WEB_THICKNESS_PG, KEY_TOP_Bflange_PG, KEY_TOP_FLANGE_THICKNESS_PG,
    KEY_BOTTOM_Bflange_PG, KEY_BOTTOM_FLANGE_THICKNESS_PG,
    KEY_DESIGN_TYPE_FLEXURE, KEY_BENDING_MOMENT_SHAPE, KEY_TORSIONAL_RES,
    KEY_WARPING_RES, KEY_MAX_DEFL, KEY_ALLOW_CLASS, KEY_WEB_PHILOSOPHY,
    KEY_SUPPORT_WIDTH, KEY_IntermediateStiffener_spacing, KEY_IntermediateStiffener_thickness,
    KEY_LongitudnalStiffener, KEY_LongitudnalStiffener_thickness,
    KEY_IntermediateStiffener_thickness_val, KEY_LongitudnalStiffener_thickness_val,
    KEY_IS_IT_SYMMETRIC, KEY_DISP_SYM, KEY_DISP_UNSYM,
    KEY_DESIGN_LOAD, KEY_MEMBER_OPTIONS, KEY_SUPPORTING_OPTIONS,
    KEY_ShearBucklingOption, KEY_DP_DESIGN_METHOD,
    KEY_EFFECTIVE_AREA_PARA, KEY_LENGTH_OVERWRITE,
    KEY_T_constatnt, KEY_W_constatnt, KEY_Elastic_CM,
    KEY_OPTIMUM_UR_COMPRESSION
)
import sys
import os
from typing import Dict, Any, List, Tuple
import traceback
import json

old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log


def get_required_keys() -> List[str]:
    """Return all required input parameters for the plate girder module."""
    return [
        "Module",                           # KEY_MODULE
        "Material",                         # KEY_MATERIAL
        "Member.Length",                    # KEY_LENGTH
        "Loading.Condition",                # KEY_LOAD
        "Load.Shear",                       # KEY_SHEAR
        "Load.Moment",                      # KEY_MOMENT
        "Total.Design_Type",                # KEY_OVERALL_DEPTH_PG_TYPE ('Customized' or 'Optimized')
        "Web.Thickness",                    # KEY_WEB_THICKNESS_PG (list)
        "TopFlange.Thickness",               # KEY_TOP_FLANGE_THICKNESS_PG (list)
        "BottomFlange.Thickness",           # KEY_BOTTOM_FLANGE_THICKNESS_PG (list)
        "Design.Design_Type_Flexure",        # KEY_DESIGN_TYPE_FLEXURE
        "Loading.Bending_Moment_Shape",      # KEY_BENDING_MOMENT_SHAPE
        "Design.Torsional_Restraint",       # KEY_TORSIONAL_RES
        "Design.Warping_Restraint",         # KEY_WARPING_RES
        "Design.Max_Deflection",            # KEY_MAX_DEFL
        "Design.Allow_Class",               # KEY_ALLOW_CLASS
        "Design.Web_Philosophy",            # KEY_WEB_PHILOSOPHY
        "Design.Support_Width",              # KEY_SUPPORT_WIDTH
        "Design.IntermediateStiffener.Spacing",  # KEY_IntermediateStiffener_spacing
        "Design.IntermediateStiffener.Thickness", # KEY_IntermediateStiffener_thickness
        "Design.LongitudnalStiffener",      # KEY_LongitudnalStiffener
        "Design.LongitudnalStiffener.Thickness", # KEY_LongitudnalStiffener_thickness
    ]


def get_optimization_required_keys() -> List[str]:
    """
    Return required input parameters specifically for optimization.
    
    Note: For optimization, Total.Depth, Topflange.Width, Bottomflange.Width are NOT required
    as they will be optimized by PSO.
    """
    return [
        "Module",
        "Material",
        "Member.Length",
        "Loading.Condition",
        "Load.Shear",
        "Load.Moment",
        "Total.Design_Type",  # Must be "Optimized"
        "Web.Thickness",  # List of available thicknesses for discrete snapping
        "TopFlange.Thickness",  # List of available thicknesses
        "BottomFlange.Thickness",  # List of available thicknesses
        "Design.Design_Type_Flexure",
        "Loading.Bending_Moment_Shape",
        "Design.Torsional_Restraint",
        "Design.Warping_Restraint",
        "Design.Max_Deflection",
        "Design.Allow_Class",
        "Design.Web_Philosophy",  # Used to determine is_thick_web
        "Design.Support_Width",
        "Design.IntermediateStiffener.Spacing",
        "Design.IntermediateStiffener.Thickness",
        "Design.LongitudnalStiffener",
        "Design.LongitudnalStiffener.Thickness",
        # Optional but recommended:
        # "Symmetry",  # Used to determine is_symmetric (defaults to "Symmetrical")
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""
    required_keys = get_required_keys()
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys is not None:
        raise MissingKeyError(missing_keys[0])

    # Validate string keys
    str_keys = [
        "Module",
        "Material",
        "Loading.Condition",
        "Total.Design_Type",
        "Design.Design_Type_Flexure",
        "Loading.Bending_Moment_Shape",
        "Design.Torsional_Restraint",
        "Design.Warping_Restraint",
        "Design.Max_Deflection",
        "Design.Allow_Class",
        "Design.Web_Philosophy",
        "Design.IntermediateStiffener.Thickness",
        "Design.LongitudnalStiffener",
        "Design.LongitudnalStiffener.Thickness",
    ]
    for key in str_keys:
        if not isinstance(input_values.get(key), str):
            raise InvalidInputTypeError(key, "str")

    # Validate numeric keys (as strings that can be converted to float)
    # Some fields can be "NA" (optional fields)
    num_keys_required = [
        "Member.Length",
        "Load.Shear",
        "Load.Moment",
        "Design.Support_Width",
    ]
    for key in num_keys_required:
        if not isinstance(input_values.get(key), str) or not float_able(input_values.get(key)):
            raise InvalidInputTypeError(key, "str where str can be converted to float")
    
    # Optional numeric keys that can be "NA"
    num_keys_optional = [
        "Design.IntermediateStiffener.Spacing",
    ]
    for key in num_keys_optional:
        value = input_values.get(key)
        if value is not None:
            if not isinstance(value, str):
                raise InvalidInputTypeError(key, "str where str can be converted to float or 'NA'")
            # Allow "NA" or numeric string
            if value.upper() != "NA" and not float_able(value):
                raise InvalidInputTypeError(key, "str where str can be converted to float or 'NA'")

    # Validate list keys (for Customized design type)
    design_type = input_values.get("Total.Design_Type")
    if design_type == "Customized":
        # For Customized, we need overall depth and flange widths
        if "Total.Depth" not in input_values:
            raise MissingKeyError("Total.Depth")
        if not isinstance(input_values.get("Total.Depth"), str) or not float_able(input_values.get("Total.Depth")):
            raise InvalidInputTypeError("Total.Depth", "str where str can be converted to float")
        
        if "Topflange.Width" not in input_values:
            raise MissingKeyError("Topflange.Width")
        if not isinstance(input_values.get("Topflange.Width"), str) or not float_able(input_values.get("Topflange.Width")):
            raise InvalidInputTypeError("Topflange.Width", "str where str can be converted to float")
        
        if "Bottomflange.Width" not in input_values:
            raise MissingKeyError("Bottomflange.Width")
        if not isinstance(input_values.get("Bottomflange.Width"), str) or not float_able(input_values.get("Bottomflange.Width")):
            raise InvalidInputTypeError("Bottomflange.Width", "str where str can be converted to float")

    # Validate list types for thickness lists
    list_keys = [
        "Web.Thickness",
        "TopFlange.Thickness",
        "BottomFlange.Thickness",
    ]
    for key in list_keys:
        value = input_values.get(key)
        if not isinstance(value, list):
            raise InvalidInputTypeError(key, "List[str]")


def create_module():
    """Create an instance of the PlateGirderWelded module design class and set it up for use"""
    from osdag_core.design_type.plate_girder.core.plate_girder import PlateGirderWelded
    module = PlateGirderWelded()
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]):
    """Create an instance of the PlateGirderWelded module design class from input values."""
    module = None
    try:
        module = create_module()
    except Exception as e:
        print('Error in create_module:', e)
        raise
    
    # For Customized design: osdag_core calls float() on thickness keys → must be a scalar string.
    # For Optimized design: osdag_core expects a list → PSO picks from list of available thicknesses.
    design_type = input_values.get('Total.Design_Type', 'Customized')

    def _thickness_val(key, default='6'):
        val = input_values.get(key, [default])
        if design_type == 'Customized':
            # Return first element as string (osdag_core does float(val))
            return str(val[0]) if isinstance(val, list) and val else str(val)
        else:
            # Return full list for PSO optimization
            return val if isinstance(val, list) else [str(val)]

    design_dict = {
        KEY_MODULE: input_values.get('Module', 'Plate Girder'),
        KEY_MATERIAL: input_values.get('Material', 'E 250 (Fe 410 W)A'),
        KEY_LENGTH: input_values.get('Member.Length', '5000'),
        KEY_LOAD: input_values.get('Loading.Condition', ''),
        KEY_SHEAR: input_values.get('Load.Shear', '0'),
        KEY_MOMENT: input_values.get('Load.Moment', '0'),
        KEY_OVERALL_DEPTH_PG_TYPE: design_type,
        KEY_WEB_THICKNESS_PG: _thickness_val('Web.Thickness'),
        KEY_TOP_FLANGE_THICKNESS_PG: _thickness_val('TopFlange.Thickness'),
        KEY_BOTTOM_FLANGE_THICKNESS_PG: _thickness_val('BottomFlange.Thickness'),
        KEY_DESIGN_TYPE_FLEXURE: input_values.get('Design.Design_Type_Flexure', 'Major Laterally Supported'),
        KEY_BENDING_MOMENT_SHAPE: input_values.get('Loading.Bending_Moment_Shape', ''),
        KEY_TORSIONAL_RES: input_values.get('Design.Torsional_Restraint', 'No'),
        KEY_WARPING_RES: input_values.get('Design.Warping_Restraint', 'Warping not restrained in both flanges'),
        KEY_MAX_DEFL: input_values.get('Design.Max_Deflection', 'L/250'),
        KEY_ALLOW_CLASS: input_values.get('Design.Allow_Class', 'Plastic'),
        KEY_WEB_PHILOSOPHY: input_values.get('Design.Web_Philosophy', 'Thick Web'),
        KEY_SUPPORT_WIDTH: input_values.get('Design.Support_Width', '100'),
        KEY_IntermediateStiffener_spacing: input_values.get('Design.IntermediateStiffener.Spacing', ''),
        KEY_IntermediateStiffener_thickness: input_values.get('Design.IntermediateStiffener.Thickness', 'Standard'),
        KEY_LongitudnalStiffener: input_values.get('Design.LongitudnalStiffener', 'No'),
        KEY_LongitudnalStiffener_thickness: input_values.get('Design.LongitudnalStiffener.Thickness', 'Standard'),
        # Additional design parameters
        KEY_DESIGN_LOAD: input_values.get('Design.Load', 'Live load'),
        KEY_MEMBER_OPTIONS: input_values.get('Member.Options', 'Simple Span'),
        KEY_SUPPORTING_OPTIONS: input_values.get('Supporting.Options', 'NA'),
        KEY_ShearBucklingOption: input_values.get('Design.ShearBucklingOption', 'Simple Post Critical'),
        KEY_DP_DESIGN_METHOD: input_values.get('Design.Design_Method', 'Limit State Design'),
        KEY_EFFECTIVE_AREA_PARA: input_values.get('Design.Effective_Area_Parameter', '1.0'),
        KEY_LENGTH_OVERWRITE: input_values.get('Design.Length_Overwrite', 'NA'),
    }
    
    # Handle symmetry (for both Customized and Optimized design types)
    symmetry = input_values.get('Symmetry', 'Symmetrical')
    if symmetry == 'Symmetrical':
        design_dict[KEY_IS_IT_SYMMETRIC] = KEY_DISP_SYM  # 'Symmetric Girder'
    else:
        design_dict[KEY_IS_IT_SYMMETRIC] = KEY_DISP_UNSYM  # 'Unsymmetric Girder'
    
    # Add design type specific keys
    design_type = design_dict[KEY_OVERALL_DEPTH_PG_TYPE]
    if design_type == 'Customized':
        design_dict[KEY_OVERALL_DEPTH_PG] = input_values.get('Total.Depth', '500')
        design_dict[KEY_TOP_Bflange_PG] = input_values.get('Topflange.Width', '200')
        design_dict[KEY_BOTTOM_Bflange_PG] = input_values.get('Bottomflange.Width', '200')
    elif design_type == 'Optimized':
        # For optimized, these are not required in set_input_values
        # but we'll set defaults to avoid errors
        design_dict[KEY_OVERALL_DEPTH_PG] = '1'
        design_dict[KEY_TOP_Bflange_PG] = '1'
        design_dict[KEY_BOTTOM_Bflange_PG] = '1'
    
    # Import VALUES_STIFFENER_THICKNESS and PlateGirderWelded for exact desktop replica
    from osdag_core.design_type.plate_girder.core.plate_girder import VALUES_STIFFENER_THICKNESS, PlateGirderWelded
    
    # Exact replica of desktop behavior: populate class variables from input_values (web UI),
    # then use them exactly like desktop set_input_values() does (lines 778-788)
    
    # For intermediate stiffener: populate class variable if customized values provided
    if design_dict[KEY_IntermediateStiffener_thickness] == 'Customized':
        # Get customized values from input_values (web UI equivalent of PopupDialog selection)
        custom_values = input_values.get('Design.IntermediateStiffener.Thickness_Values', None)
        if custom_values and isinstance(custom_values, list) and len(custom_values) > 0:
            # Populate class variable (exact replica of desktop: PlateGirderWelded.int_thicklist = selected_items)
            PlateGirderWelded.int_thicklist = [str(v) for v in custom_values]
        # Use class variable exactly like desktop set_input_values() does (line 779)
        design_dict[KEY_IntermediateStiffener_thickness_val] = PlateGirderWelded.int_thicklist
    else:
        # Standard mode: use all standard values (exact replica of desktop line 781)
        design_dict[KEY_IntermediateStiffener_thickness_val] = VALUES_STIFFENER_THICKNESS
    
    # For longitudinal stiffener: populate class variable if customized values provided
    if design_dict[KEY_LongitudnalStiffener_thickness] == 'Customized':
        # Get customized values from input_values (web UI equivalent of PopupDialog selection)
        custom_values = input_values.get('Design.LongitudnalStiffener.Thickness_Values', None)
        if custom_values and isinstance(custom_values, list) and len(custom_values) > 0:
            # Populate class variable (exact replica of desktop: PlateGirderWelded.long_thicklist = selected_items2)
            PlateGirderWelded.long_thicklist = [str(v) for v in custom_values]
        # Use class variable exactly like desktop set_input_values() does (line 786)
        design_dict[KEY_LongitudnalStiffener_thickness_val] = PlateGirderWelded.long_thicklist
    else:
        # Standard mode: use all standard values (exact replica of desktop line 788)
        design_dict[KEY_LongitudnalStiffener_thickness_val] = VALUES_STIFFENER_THICKNESS
    
    try:
        if module is None:
            raise RuntimeError('Module instance was not created')
        module.set_input_values(design_dict)
    except Exception as e:
        traceback.print_exc()
        print('Error in set_input_values:', e)
        raise

    return module


def generate_output(input_values: Dict[str, Any]):
    """
    Generate, format and return the output values from the given input values.
    """
    output = {}
    module = create_from_input(input_values)
    logs = []
    
    try:
        # Generate output values
        raw_output_text = module.output_values(True)
        
        # Get logs from the custom logger
        if hasattr(module, 'logger') and isinstance(module.logger, CustomLogger):
            logs = module.logger.get_logs()
        
        raw_output = raw_output_text

        # Get design preferences for conditional outputs
        web_philosophy = input_values.get('Design.Web_Philosophy', 'Thick Web without ITS')
        support_type = input_values.get('Design.Design_Type_Flexure', 'Major Laterally Supported')
        is_thick_web = 'Thick Web' in web_philosophy
        is_laterally_supported = 'Laterally Supported' in support_type
        
        # Process each parameter
        for i, param in enumerate(raw_output):
            if len(param) >= 4:
                key = param[0]
                label = param[1]
                param_type = param[2]
                value = param[3]
                
                # Check if it's a TextBox type and has a valid key
                if param_type == "TextBox" and key is not None:
                    # Handle numpy types
                    if hasattr(value, 'item'):
                        value = value.item()
                    
                    # Handle None/empty values
                    if value is None or value == '':
                        # Set appropriate defaults based on field type
                        if 'Stiffener' in key and is_thick_web:
                            value = 'N/A'
                        elif key in [KEY_T_constatnt, KEY_W_constatnt, KEY_Elastic_CM] and is_laterally_supported:
                            value = 'N/A'
                        elif 'LongitudnalStiffener' in key and (is_thick_web or not hasattr(module, 'longstiffener_no') or getattr(module, 'longstiffener_no', 0) == 0):
                            if 'Position' in key:
                                value = 'N/A'
                            elif 'Numbers' in key:
                                value = 0
                            else:
                                value = 'N/A'
                        else:
                            value = 'N/A'
                    
                    # Convert numeric None to 0 or N/A
                    if isinstance(value, (int, float)) and (value == 0 or value is None):
                        # For counts/numbers, 0 is valid; for dimensions/strengths, use N/A
                        if 'Numbers' in key or 'UR' in key:
                            value = 0 if value is None else value
                        elif value == 0 and key not in [KEY_OPTIMUM_UR_COMPRESSION]:
                            value = 'N/A'
                    
                    output[key] = {
                        "key": key,
                        "label": label,
                        "val": value
                    }
    except Exception as e:
        print(f'Error in generate_output: {e}')
        traceback.print_exc()
        # Re-raise exception so service layer can handle it properly
        raise
    
    return output, logs


def get_optimization_bounds(input_values: Dict[str, Any]) -> Dict[str, tuple]:
    """
    Extract optimization bounds from input_values.
    
    Args:
        input_values: Dictionary with keys like "Total.Depth_lb", "Total.Depth_ub", etc.
        
    Returns:
        Dictionary mapping variable names to (lb, ub, inc) tuples
        Example: {'D': (200, 2000, 25), 'bf_top': (100, 1000, 10)}
    """
    bounds = {}
    
    # Map frontend keys to backend variable names
    variable_mapping = {
        'Total.Depth': 'D',
        'Topflange.Width': 'bf_top',
        'Bottomflange.Width': 'bf_bot',
        'TopFlange.Width': 'bf_top',  # Alternative naming
        'BottomFlange.Width': 'bf_bot',  # Alternative naming
    }
    
    for frontend_key, backend_var in variable_mapping.items():
        lb_key = f"{frontend_key}_lb"
        ub_key = f"{frontend_key}_ub"
        inc_key = f"{frontend_key}_inc"
        
        lb = input_values.get(lb_key)
        ub = input_values.get(ub_key)
        inc = input_values.get(inc_key, '0')
        
        if lb and ub:
            try:
                lb_val = float(lb)
                ub_val = float(ub)
                inc_val = float(inc) if inc else 0
                
                # Validate bounds
                if lb_val >= ub_val:
                    raise ValueError(f"Lower bound ({lb_val}) must be less than upper bound ({ub_val}) for {frontend_key}")
                
                bounds[backend_var] = (lb_val, ub_val, inc_val)
            except (ValueError, TypeError) as e:
                print(f"Warning: Invalid bounds for {frontend_key}: {e}")
                continue
    
    # Handle symmetric case: if symmetric, use bf for both top and bot
    if 'bf_top' in bounds and 'bf_bot' not in bounds:
        bounds['bf'] = bounds['bf_top']
    elif 'bf_bot' in bounds and 'bf_top' not in bounds:
        bounds['bf'] = bounds['bf_bot']
    
    return bounds


def create_optimization_input(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create design dictionary specifically for PSO optimization.
    
    This function prepares the input dictionary for PlateGirderWelded.optimized_method().
    It ensures:
    - Total.Design_Type is set to "Optimized"
    - All required fields are present (loads, material, web philosophy, restraints, etc.)
    - Thickness lists are provided for discrete variable snapping
    
    Args:
        input_values: Dictionary from WebSocket/Celery task with optimization inputs
        
    Returns:
        Design dictionary ready for PlateGirderWelded.optimized_method()
        
    Expected input_values keys (same as normal design + optimization flag):
        - "Total.Design_Type": "Optimized" (required)
        - "Material": Material grade string
        - "Member.Length": Span length in meters (as string)
        - "Load.Shear": Shear force in kN (as string)
        - "Load.Moment": Bending moment in kNm (as string)
        - "Design.Web_Philosophy": "Thick Web without ITS" or "Thin Web with ITS"
        - "Web.Thickness": List of thickness strings (e.g., ["6", "8", "10", ...])
        - "TopFlange.Thickness": List of thickness strings
        - "BottomFlange.Thickness": List of thickness strings
        - "Design.Design_Type_Flexure": Support type
        - "Loading.Bending_Moment_Shape": Loading shape
        - "Design.Torsional_Restraint": Torsional restraint type
        - "Design.Warping_Restraint": Warping restraint type
        - "Design.Max_Deflection": Deflection limit (e.g., "L/250")
        - "Design.Allow_Class": Section class (e.g., "Plastic")
        - "Design.Support_Width": Support width in mm (as string)
        - "Design.IntermediateStiffener.Spacing": Spacing or "NA"
        - "Design.IntermediateStiffener.Thickness": "Standard" or "Customized"
        - "Design.LongitudnalStiffener": "No", "Yes and 1 stiffener", or "Yes and 2 stiffeners"
        - "Design.LongitudnalStiffener.Thickness": "Standard" or "Customized"
        - (Optional) "Symmetry": "Symmetrical" or "Unsymmetrical"
        
    Note: For optimization, Total.Depth, Topflange.Width, Bottomflange.Width are NOT required
    as they will be optimized by PSO.
    """
    # Ensure design type is Optimized
    optimization_input = input_values.copy()
    optimization_input["Total.Design_Type"] = "Optimized"
    
    # Use the same create_from_input logic but ensure Optimized flag is set
    # The design dictionary format is the same as normal design
    design_dict = {
        KEY_MODULE: optimization_input.get('Module', 'Plate-Girder'),
        KEY_MATERIAL: optimization_input.get('Material', 'E 250 (Fe 410 W)A'),
        KEY_LENGTH: optimization_input.get('Member.Length', '5000'),
        KEY_LOAD: optimization_input.get('Loading.Condition', 'Normal'),
        KEY_SHEAR: optimization_input.get('Load.Shear', '0'),
        KEY_MOMENT: optimization_input.get('Load.Moment', '0'),
        KEY_OVERALL_DEPTH_PG_TYPE: 'Optimized',  # Force Optimized
        KEY_WEB_THICKNESS_PG: optimization_input.get('Web.Thickness', ['6', '8', '10', '12', '16', '20', '25', '32', '40']),
        KEY_TOP_FLANGE_THICKNESS_PG: optimization_input.get('TopFlange.Thickness', ['6', '8', '10', '12', '16', '20', '25', '32', '40']),
        KEY_BOTTOM_FLANGE_THICKNESS_PG: optimization_input.get('BottomFlange.Thickness', ['6', '8', '10', '12', '16', '20', '25', '32', '40']),
        KEY_DESIGN_TYPE_FLEXURE: optimization_input.get('Design.Design_Type_Flexure', 'Major Laterally Supported'),
        KEY_BENDING_MOMENT_SHAPE: optimization_input.get('Loading.Bending_Moment_Shape', 'Uniform Loading with pinned-pinned support'),
        KEY_TORSIONAL_RES: optimization_input.get('Design.Torsional_Restraint', 'Fully Restrained'),
        KEY_WARPING_RES: optimization_input.get('Design.Warping_Restraint', 'Both flanges fully restrained'),
        KEY_MAX_DEFL: optimization_input.get('Design.Max_Deflection', 'L/250'),
        KEY_ALLOW_CLASS: optimization_input.get('Design.Allow_Class', 'Plastic'),
        KEY_WEB_PHILOSOPHY: optimization_input.get('Design.Web_Philosophy', 'Thick Web without ITS'),
        KEY_SUPPORT_WIDTH: optimization_input.get('Design.Support_Width', '100'),
        KEY_IntermediateStiffener_spacing: optimization_input.get('Design.IntermediateStiffener.Spacing', 'NA'),
        KEY_IntermediateStiffener_thickness: optimization_input.get('Design.IntermediateStiffener.Thickness', 'Standard'),
        KEY_LongitudnalStiffener: optimization_input.get('Design.LongitudnalStiffener', 'No'),
        KEY_LongitudnalStiffener_thickness: optimization_input.get('Design.LongitudnalStiffener.Thickness', 'Standard'),
        # Additional design parameters (matching create_from_input)
        KEY_DESIGN_LOAD: optimization_input.get('Design.Load', 'Live load'),
        KEY_MEMBER_OPTIONS: optimization_input.get('Member.Options', 'Simple Span'),
        KEY_SUPPORTING_OPTIONS: optimization_input.get('Supporting.Options', 'NA'),
        KEY_ShearBucklingOption: optimization_input.get('Design.ShearBucklingOption', 'Simple Post Critical'),
        KEY_DP_DESIGN_METHOD: optimization_input.get('Design.Design_Method', 'Limit State Design'),
        KEY_EFFECTIVE_AREA_PARA: optimization_input.get('Design.Effective_Area_Parameter', '1.0'),
        KEY_LENGTH_OVERWRITE: optimization_input.get('Design.Length_Overwrite', 'NA'),
    }
    
    # Handle symmetry (for optimization)
    symmetry = optimization_input.get('Symmetry', 'Symmetrical')
    if symmetry == 'Symmetrical':
        design_dict[KEY_IS_IT_SYMMETRIC] = KEY_DISP_SYM  # 'Symmetric Girder'
    else:
        design_dict[KEY_IS_IT_SYMMETRIC] = KEY_DISP_UNSYM  # 'Unsymmetric Girder'
    
    # For Optimized design type, set dummy values (will be optimized by PSO)
    design_dict[KEY_OVERALL_DEPTH_PG] = '1'
    design_dict[KEY_TOP_Bflange_PG] = '1'
    design_dict[KEY_BOTTOM_Bflange_PG] = '1'
    
    # Import VALUES_STIFFENER_THICKNESS from plate_girder module (standard list)
    try:
        from osdag_core.design_type.plate_girder.core.plate_girder import VALUES_STIFFENER_THICKNESS
    except (ImportError, ModuleNotFoundError):
        # Fallback: Standard stiffener thickness values if import fails
        VALUES_STIFFENER_THICKNESS = ['6', '8', '10', '12', '14', '16', '18', '20', 
                                      '22', '24', '26', '28', '30', '32', '36', '40']
     
    # Import VALUES_STIFFENER_THICKNESS and PlateGirderWelded for exact desktop replica
    from osdag_core.design_type.plate_girder.core.plate_girder import VALUES_STIFFENER_THICKNESS, PlateGirderWelded
    
    # Exact replica of desktop behavior: populate class variables from optimization_input (web UI),
    # then use them exactly like desktop set_input_values() does (lines 778-788)
    
    # For intermediate stiffener: populate class variable if customized values provided
    if design_dict[KEY_IntermediateStiffener_thickness] == 'Customized':
        # Get customized values from optimization_input (web UI equivalent of PopupDialog selection)
        custom_values = optimization_input.get('Design.IntermediateStiffener.Thickness_Values', None)
        if custom_values and isinstance(custom_values, list) and len(custom_values) > 0:
            # Populate class variable (exact replica of desktop: PlateGirderWelded.int_thicklist = selected_items)
            PlateGirderWelded.int_thicklist = [str(v) for v in custom_values]
        # Use class variable exactly like desktop set_input_values() does (line 779)
        design_dict[KEY_IntermediateStiffener_thickness_val] = PlateGirderWelded.int_thicklist
    else:
        # Standard mode: use all standard values (exact replica of desktop line 781)
        design_dict[KEY_IntermediateStiffener_thickness_val] = VALUES_STIFFENER_THICKNESS
    
    # For longitudinal stiffener: populate class variable if customized values provided
    if design_dict[KEY_LongitudnalStiffener_thickness] == 'Customized':
        # Get customized values from optimization_input (web UI equivalent of PopupDialog selection)
        custom_values = optimization_input.get('Design.LongitudnalStiffener.Thickness_Values', None)
        if custom_values and isinstance(custom_values, list) and len(custom_values) > 0:
            # Populate class variable (exact replica of desktop: PlateGirderWelded.long_thicklist = selected_items2)
            PlateGirderWelded.long_thicklist = [str(v) for v in custom_values]
        # Use class variable exactly like desktop set_input_values() does (line 786)
        design_dict[KEY_LongitudnalStiffener_thickness_val] = PlateGirderWelded.long_thicklist
    else:
        # Standard mode: use all standard values (exact replica of desktop line 788)
        design_dict[KEY_LongitudnalStiffener_thickness_val] = VALUES_STIFFENER_THICKNESS
    
    return design_dict


def apply_optimization_bounds(module, input_values: Dict[str, Any]) -> None:
    """
    Apply custom optimization bounds to module.bounds_map.
    
    Args:
        module: PlateGirderWelded instance
        input_values: Dictionary with bounds keys (e.g., "Total.Depth_lb", "Total.Depth_ub")
    """
    bounds = get_optimization_bounds(input_values)
    
    for var, (lb, ub, inc) in bounds.items():
        if inc > 0:
            module.bounds_map[var] = (lb, ub, inc)
        else:
            module.bounds_map[var] = (lb, ub)
    
    # Log applied bounds
    if bounds:
        print(f"📏 Applied custom optimization bounds:")
        for var, (lb, ub, inc) in bounds.items():
            step_str = f", step={inc}" if inc > 0 else ""
            print(f"  {var}: [{lb}, {ub}]{step_str}")


def determine_optimization_flags(input_values: Dict[str, Any]) -> Tuple[bool, bool]:
    """
    Determine is_thick_web and is_symmetric flags for optimization.
    
    This function extracts the flags needed by PlateGirderWelded.optimized_method()
    from the input dictionary.
    
    Args:
        input_values: Input dictionary with design parameters (can be either frontend format
                     or design_dictionary format)
        
    Returns:
        Tuple of (is_thick_web, is_symmetric) booleans
        
    is_thick_web:
        - True if "Design.Web_Philosophy" == "Thick Web without ITS"
        - False if "Design.Web_Philosophy" == "Thin Web with ITS"
        
    is_symmetric:
        - True if "Symmetry" == "Symmetrical" OR "Girder.Symmetry" == "Symmetric Girder"
        - False if "Symmetry" == "Unsymmetrical" OR "Girder.Symmetry" == "Unsymmetric Girder"
        - Defaults to True (symmetric) if not specified
    """
    # Check web philosophy (can be in either format)
    web_philosophy = input_values.get('Design.Web_Philosophy') or input_values.get(KEY_WEB_PHILOSOPHY, 'Thick Web without ITS')
    is_thick_web = (web_philosophy == 'Thick Web without ITS')
    
    # Check symmetry (can be in either format)
    symmetry = input_values.get('Symmetry', 'Symmetrical')
    symmetry_key = input_values.get(KEY_IS_IT_SYMMETRIC)
    
    if symmetry_key:
        # Design dictionary format: 'Symmetric Girder' or 'Unsymmetric Girder'
        is_symmetric = (symmetry_key == KEY_DISP_SYM)
    else:
        # Frontend format: 'Symmetrical' or 'Unsymmetrical'
        is_symmetric = (symmetry == 'Symmetrical')
    
    return is_thick_web, is_symmetric


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    # For now, returning empty string as CAD generation might need specific implementation
    # TODO: Implement CAD model generation if needed
    return ""

