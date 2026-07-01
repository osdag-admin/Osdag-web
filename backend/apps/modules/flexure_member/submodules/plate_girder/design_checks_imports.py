"""
Phase 3: Design Checks Implementation - Import Module

This module centralizes imports of design check modules from osdag_core.
These will be used in the Celery task (tasks.py) for optimization.

All design check modules already exist in osdag_core, we just import and use them.
"""

# ==============================================================================
# 3.1 Design Check Modules
# ==============================================================================
# Source: osdag_core/design_type/plate_girder/checks/

# moment.py - Moment capacity check
try:
    from osdag_core.design_type.plate_girder.checks.moment import (
        corrected_design_bending_strength,
        moment_capacity_laterally_supported,
        calc_Mdv,
        calc_Mdv_lat_unsupported,
        bending_check_lat_unsupported
    )
    MOMENT_CHECKS_AVAILABLE = True
except ImportError as e:
    MOMENT_CHECKS_AVAILABLE = False
    corrected_design_bending_strength = None
    moment_capacity_laterally_supported = None
    calc_Mdv = None
    calc_Mdv_lat_unsupported = None
    bending_check_lat_unsupported = None
    print(f"Warning: Could not import moment checks: {e}")

# shear.py - Shear capacity check (web shear, shear buckling, post-buckling strength)
try:
    from osdag_core.design_type.plate_girder.checks.shear import (
        calc_K_v,
        shear_capacity_laterally_supported_thick_web,
        shear_buckling_check_simple_postcritical,
        shear_buckling_check_intermediate_stiffener,
        shear_buckling_check_tension_field,
        tension_field_intermediate_stiffener,
        tension_field_end_stiffener,
        end_panel_stiffener_calc
    )
    SHEAR_CHECKS_AVAILABLE = True
except ImportError as e:
    SHEAR_CHECKS_AVAILABLE = False
    calc_K_v = None
    shear_capacity_laterally_supported_thick_web = None
    shear_buckling_check_simple_postcritical = None
    shear_buckling_check_intermediate_stiffener = None
    shear_buckling_check_tension_field = None
    tension_field_intermediate_stiffener = None
    tension_field_end_stiffener = None
    end_panel_stiffener_calc = None
    print(f"Warning: Could not import shear checks: {e}")

# web_buckling.py - Web buckling under concentrated loads (Clause 8.7.3)
try:
    from osdag_core.design_type.plate_girder.checks.web_buckling import (
        web_buckling_laterally_supported_thick_web
    )
    WEB_BUCKLING_AVAILABLE = True
except ImportError as e:
    WEB_BUCKLING_AVAILABLE = False
    web_buckling_laterally_supported_thick_web = None
    print(f"Warning: Could not import web_buckling checks: {e}")

# web_crippling.py - Web crippling check (Clause 8.7.4)
try:
    from osdag_core.design_type.plate_girder.checks.web_crippling import (
        check_web_crippling
    )
    WEB_CRIPPLING_AVAILABLE = True
except ImportError as e:
    WEB_CRIPPLING_AVAILABLE = False
    check_web_crippling = None
    print(f"Warning: Could not import web_crippling checks: {e}")

# deflection.py - Deflection serviceability check
try:
    from osdag_core.design_type.plate_girder.checks.deflection import (
        evaluate_deflection_kNm_mm,
        deflection_from_moment_kNm_mm
    )
    DEFLECTION_CHECKS_AVAILABLE = True
except ImportError as e:
    DEFLECTION_CHECKS_AVAILABLE = False
    evaluate_deflection_kNm_mm = None
    deflection_from_moment_kNm_mm = None
    print(f"Warning: Could not import deflection checks: {e}")

# welds.py - Weld design
try:
    from osdag_core.design_type.plate_girder.checks.welds import (
        design_welds_with_strength_web_to_flange,
        weld_leg_from_q_with_cl10,
        weld_for_end_stiffener
    )
    WELD_CHECKS_AVAILABLE = True
except ImportError as e:
    WELD_CHECKS_AVAILABLE = False
    design_welds_with_strength_web_to_flange = None
    weld_leg_from_q_with_cl10 = None
    weld_for_end_stiffener = None
    print(f"Warning: Could not import weld checks: {e}")

# web_thickness.py - Web thickness validation
try:
    from osdag_core.design_type.plate_girder.checks.web_thickness import (
        min_web_thickness_thick_web
    )
    WEB_THICKNESS_AVAILABLE = True
except ImportError as e:
    WEB_THICKNESS_AVAILABLE = False
    min_web_thickness_thick_web = None
    print(f"Warning: Could not import web_thickness checks: {e}")

# SKIP_DEFLECTION constant
try:
    from osdag_core.design_type.plate_girder.checks import SKIP_DEFLECTION
    SKIP_DEFLECTION_AVAILABLE = True
except ImportError as e:
    SKIP_DEFLECTION_AVAILABLE = False
    SKIP_DEFLECTION = False
    print(f"Warning: Could not import SKIP_DEFLECTION: {e}")


# ==============================================================================
# Verification Function
# ==============================================================================
def verify_imports():
    """
    Verify that all required design check modules can be imported.
    
    Returns:
        dict: Status of each import with availability flags
    """
    status = {
        'moment_checks': {
            'available': MOMENT_CHECKS_AVAILABLE,
            'functions': {
                'corrected_design_bending_strength': corrected_design_bending_strength is not None if MOMENT_CHECKS_AVAILABLE else None,
                'moment_capacity_laterally_supported': moment_capacity_laterally_supported is not None if MOMENT_CHECKS_AVAILABLE else None,
                'calc_Mdv': calc_Mdv is not None if MOMENT_CHECKS_AVAILABLE else None,
                'calc_Mdv_lat_unsupported': calc_Mdv_lat_unsupported is not None if MOMENT_CHECKS_AVAILABLE else None,
                'bending_check_lat_unsupported': bending_check_lat_unsupported is not None if MOMENT_CHECKS_AVAILABLE else None,
            }
        },
        'shear_checks': {
            'available': SHEAR_CHECKS_AVAILABLE,
            'functions': {
                'calc_K_v': calc_K_v is not None if SHEAR_CHECKS_AVAILABLE else None,
                'shear_capacity_laterally_supported_thick_web': shear_capacity_laterally_supported_thick_web is not None if SHEAR_CHECKS_AVAILABLE else None,
                'shear_buckling_check_simple_postcritical': shear_buckling_check_simple_postcritical is not None if SHEAR_CHECKS_AVAILABLE else None,
                'shear_buckling_check_intermediate_stiffener': shear_buckling_check_intermediate_stiffener is not None if SHEAR_CHECKS_AVAILABLE else None,
                'shear_buckling_check_tension_field': shear_buckling_check_tension_field is not None if SHEAR_CHECKS_AVAILABLE else None,
                'tension_field_intermediate_stiffener': tension_field_intermediate_stiffener is not None if SHEAR_CHECKS_AVAILABLE else None,
                'tension_field_end_stiffener': tension_field_end_stiffener is not None if SHEAR_CHECKS_AVAILABLE else None,
                'end_panel_stiffener_calc': end_panel_stiffener_calc is not None if SHEAR_CHECKS_AVAILABLE else None,
            }
        },
        'web_buckling': {
            'available': WEB_BUCKLING_AVAILABLE,
            'functions': {
                'web_buckling_laterally_supported_thick_web': web_buckling_laterally_supported_thick_web is not None if WEB_BUCKLING_AVAILABLE else None,
            }
        },
        'web_crippling': {
            'available': WEB_CRIPPLING_AVAILABLE,
            'functions': {
                'check_web_crippling': check_web_crippling is not None if WEB_CRIPPLING_AVAILABLE else None,
            }
        },
        'deflection_checks': {
            'available': DEFLECTION_CHECKS_AVAILABLE,
            'functions': {
                'evaluate_deflection_kNm_mm': evaluate_deflection_kNm_mm is not None if DEFLECTION_CHECKS_AVAILABLE else None,
                'deflection_from_moment_kNm_mm': deflection_from_moment_kNm_mm is not None if DEFLECTION_CHECKS_AVAILABLE else None,
            }
        },
        'weld_checks': {
            'available': WELD_CHECKS_AVAILABLE,
            'functions': {
                'design_welds_with_strength_web_to_flange': design_welds_with_strength_web_to_flange is not None if WELD_CHECKS_AVAILABLE else None,
                'weld_leg_from_q_with_cl10': weld_leg_from_q_with_cl10 is not None if WELD_CHECKS_AVAILABLE else None,
                'weld_for_end_stiffener': weld_for_end_stiffener is not None if WELD_CHECKS_AVAILABLE else None,
            }
        },
        'web_thickness': {
            'available': WEB_THICKNESS_AVAILABLE,
            'functions': {
                'min_web_thickness_thick_web': min_web_thickness_thick_web is not None if WEB_THICKNESS_AVAILABLE else None,
            }
        },
        'skip_deflection': {
            'available': SKIP_DEFLECTION_AVAILABLE,
            'value': SKIP_DEFLECTION if SKIP_DEFLECTION_AVAILABLE else None
        }
    }
    return status


# ==============================================================================
# Export all imports for use in tasks.py and other modules
# ==============================================================================
__all__ = [
    # Moment checks
    'corrected_design_bending_strength',
    'moment_capacity_laterally_supported',
    'calc_Mdv',
    'calc_Mdv_lat_unsupported',
    'bending_check_lat_unsupported',
    # Shear checks
    'calc_K_v',
    'shear_capacity_laterally_supported_thick_web',
    'shear_buckling_check_simple_postcritical',
    'shear_buckling_check_intermediate_stiffener',
    'shear_buckling_check_tension_field',
    'tension_field_intermediate_stiffener',
    'tension_field_end_stiffener',
    'end_panel_stiffener_calc',
    # Web buckling
    'web_buckling_laterally_supported_thick_web',
    # Web crippling
    'check_web_crippling',
    # Deflection
    'evaluate_deflection_kNm_mm',
    'deflection_from_moment_kNm_mm',
    # Welds
    'design_welds_with_strength_web_to_flange',
    'weld_leg_from_q_with_cl10',
    'weld_for_end_stiffener',
    # Web thickness
    'min_web_thickness_thick_web',
    # Constants
    'SKIP_DEFLECTION',
    # Availability flags
    'MOMENT_CHECKS_AVAILABLE',
    'SHEAR_CHECKS_AVAILABLE',
    'WEB_BUCKLING_AVAILABLE',
    'WEB_CRIPPLING_AVAILABLE',
    'DEFLECTION_CHECKS_AVAILABLE',
    'WELD_CHECKS_AVAILABLE',
    'WEB_THICKNESS_AVAILABLE',
    'SKIP_DEFLECTION_AVAILABLE',
    # Verification
    'verify_imports'
]

