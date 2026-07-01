"""
Core PSO Algorithms and Section Utilities - Import Module

This module centralizes imports of PSO algorithms and section utilities from osdag_core.
These will be used in the Celery task (tasks.py) for optimization.

All classes and functions are already implemented in osdag_core, we just import and use them.
"""

# ==============================================================================
# 2.1 Global Best PSO
# ==============================================================================
# Source: osdag_core/design_type/plate_girder/core/pso_optimizer.py
# Features:
# - Standard PSO velocity update: V = w*V + c1*r1*(P_best - X) + c2*r2*(G_best - X)
# - Constraint-aware initialization (only feasible particles)
# - Constraint checking during position updates
# - Resampling if particle becomes infeasible
# - Progress callback support (emits iteration, particle index, position, cost)
# Parameters:
# - n_particles = 50
# - iterations = 100
# - w = 0.4 (inertia weight)
# - c1 = 1.5 (cognitive coefficient)
# - c2 = 1.5 (social coefficient)
try:
    from osdag_core.design_type.plate_girder.core.pso_optimizer import GlobalBestPSO
    GLOBAL_BEST_PSO_AVAILABLE = True
except ImportError as e:
    GLOBAL_BEST_PSO_AVAILABLE = False
    GlobalBestPSO = None
    print(f"Warning: Could not import GlobalBestPSO: {e}")


# ==============================================================================
# 2.2 Intelligent PSO
# ==============================================================================
# Source: osdag_core/design_type/plate_girder/optimization/intelligent_pso.py
# Features:
# - Discrete variable snapping (to standard thicknesses)
# - Smart boundary clamping (inelastic collision at boundaries)
# - Continuous search space with discrete evaluation
# - Soft constraint handling (penalties)
# Discrete Variables: Standard thicknesses for tw, tf, t_stiff (6, 8, 10, 12, 16, 20, 25, 32, 40 mm)
try:
    from osdag_core.design_type.plate_girder.optimization.intelligent_pso import IntelligentPSO
    INTELLIGENT_PSO_AVAILABLE = True
except ImportError as e:
    INTELLIGENT_PSO_AVAILABLE = False
    IntelligentPSO = None
    print(f"Warning: Could not import IntelligentPSO: {e}")


# ==============================================================================
# 2.3 Section Utilities
# ==============================================================================
# Source: osdag_core/design_type/plate_girder/core/section.py
# Functions:
# - calc_yj(): Calculate yj for unsymmetric sections (IS 800:2007 E.3.2.2)
# - classify_section(): Classify plate girder section (Plastic/Compact/Semi-Compact/Slender)
# - shear_stress_unsym_I(): Calculate shear stress distribution
try:
    from osdag_core.design_type.plate_girder.core.section import (
        calc_yj,
        classify_section,
        shear_stress_unsym_I
    )
    SECTION_UTILITIES_AVAILABLE = True
except ImportError as e:
    SECTION_UTILITIES_AVAILABLE = False
    calc_yj = None
    classify_section = None
    shear_stress_unsym_I = None
    print(f"Warning: Could not import section utilities: {e}")


# ==============================================================================
# Verification Function
# ==============================================================================
def verify_imports():
    """
    Verify that all required PSO algorithms and section utilities can be imported.
    
    Returns:
        dict: Status of each import with availability flags
    """
    status = {
        'global_best_pso': {
            'available': GLOBAL_BEST_PSO_AVAILABLE,
            'class': GlobalBestPSO.__name__ if GLOBAL_BEST_PSO_AVAILABLE else None
        },
        'intelligent_pso': {
            'available': INTELLIGENT_PSO_AVAILABLE,
            'class': IntelligentPSO.__name__ if INTELLIGENT_PSO_AVAILABLE else None
        },
        'section_utilities': {
            'available': SECTION_UTILITIES_AVAILABLE,
            'functions': {
                'calc_yj': calc_yj is not None if SECTION_UTILITIES_AVAILABLE else None,
                'classify_section': classify_section is not None if SECTION_UTILITIES_AVAILABLE else None,
                'shear_stress_unsym_I': shear_stress_unsym_I is not None if SECTION_UTILITIES_AVAILABLE else None
            }
        }
    }
    return status


# ==============================================================================
# Export all imports for use in tasks.py and other modules
# ==============================================================================
__all__ = [
    'GlobalBestPSO',
    'IntelligentPSO',
    'calc_yj',
    'classify_section',
    'shear_stress_unsym_I',
    'GLOBAL_BEST_PSO_AVAILABLE',
    'INTELLIGENT_PSO_AVAILABLE',
    'SECTION_UTILITIES_AVAILABLE',
    'verify_imports'
]

