try:
    from osdag_core.design_type.plate_girder.core.pso_optimizer import GlobalBestPSO
    GLOBAL_BEST_PSO_AVAILABLE = True
except ImportError as e:
    GLOBAL_BEST_PSO_AVAILABLE = False
    GlobalBestPSO = None
    print(f"Warning: Could not import GlobalBestPSO: {e}")

try:
    from osdag_core.design_type.plate_girder.optimization.intelligent_pso import IntelligentPSO
    INTELLIGENT_PSO_AVAILABLE = True
except ImportError as e:
    INTELLIGENT_PSO_AVAILABLE = False
    IntelligentPSO = None
    print(f"Warning: Could not import IntelligentPSO: {e}")

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


def verify_imports():
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
