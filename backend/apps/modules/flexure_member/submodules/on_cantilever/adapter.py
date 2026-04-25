"""
On Cantilever Beam Adapter
Implements the business logic for the On-Cantilever-Beam flexure module.
Uses Flexure_Cantilever from osdag_core.
"""
from backend.apps.modules.simple_connection.shared import setup_for_cad
from osdag_core.Common import KEY_DISP_FLEXURE2
from apps.core.utils import (
    MissingKeyError, InvalidInputTypeError,
    contains_keys,
)
from OCC.Core.BRep import BRep_Builder
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRepTools import breptools_Write
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.design_type.flexural_member.flexure_cantilever import Flexure_Cantilever
import os
import json
import traceback
from typing import Dict, Any, List
from apps.core.utils import write_stl


def get_required_keys() -> List[str]:
    """Return all required input parameters for the module."""
    return [
        "Module",                   # KEY_MODULE
        "Member.Profile",           # KEY_SEC_PROFILE
        "Member.Designation",       # KEY_SECSIZE
        "Material",                 # KEY_MATERIAL
        "Member.Material",          # KEY_SEC_MATERIAL
        "Flexure.Type",             # KEY_DESIGN_TYPE_FLEXURE (support type)
        "Cantilever.Support",       # KEY_SUPPORT_TYPE (support restraint)
        "Cantilever.Top",           # KEY_SUPPORT_TYPE2 (top restraint)
        "Member.Length",            # KEY_LENGTH
        "Load.Shear",               # KEY_SHEAR
        "Load.Moment",              # KEY_MOMENT
    ]


def validate_input(input_values: Dict[str, Any]) -> None:
    """Validate presence of required keys."""
    required_keys = [
        "Module",
        "Member.Designation",
        "Member.Length",
        "Load.Shear",
        "Load.Moment",
    ]
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys is not None:
        raise MissingKeyError(missing_keys[0])


def _create_cantilever_module() -> Flexure_Cantilever:
    """Create and initialize a Flexure_Cantilever instance with logger."""
    module = Flexure_Cantilever()
    module.set_osdaglogger(None, id="web")
    return module


def create_from_input(input_values: Dict[str, Any]) -> Flexure_Cantilever:
    """
    Create an instance of Flexure_Cantilever from web input values.
    Maps frontend API keys to the exact keys expected by set_input_values.
    """
    from osdag_core.Common import (
        KEY_MODULE, KEY_SEC_PROFILE, KEY_SECSIZE, KEY_MATERIAL, KEY_SEC_MATERIAL,
        KEY_DESIGN_TYPE_FLEXURE, KEY_LENGTH, KEY_SHEAR, KEY_MOMENT,
        KEY_LENGTH_OVERWRITE, KEY_EFFECTIVE_AREA_PARA, KEY_ALLOW_CLASS,
        KEY_BEARING_LENGTH, KEY_SUPPORT_TYPE, KEY_SUPPORT_TYPE2, KEY_LOAD,
        KEY_DP_DESIGN_METHOD,
        VALUES_SUPP_TYPE_temp,
    )

    module = _create_cantilever_module()

    # ---- Section Designation ----
    member_designation = input_values.get('Member.Designation', '')
    if isinstance(member_designation, str):
        if member_designation in ('', '[]'):
            member_designation = []
        elif member_designation.startswith('[') and member_designation.endswith(']'):
            try:
                member_designation = json.loads(member_designation)
            except Exception:
                member_designation = [member_designation]
    elif not isinstance(member_designation, list):
        member_designation = [str(member_designation)]

    if not member_designation:
        raise ValueError("No section designations provided!")

    # ---- Support Type mapping ----
    # Frontend sends "Major Laterally Supported", "Minor Laterally Unsupported", "Major Laterally Unsupported"
    # These must match VALUES_SUPP_TYPE_temp which are:
    #   [0] = 'Major Laterally Supported'
    #   [1] = 'Minor Laterally Unsupported'
    #   [2] = 'Major Laterally Unsupported'
    flexure_type = input_values.get('Flexure.Type', VALUES_SUPP_TYPE_temp[0])

    # ---- Support Restraint (Cantilever.Support) ----
    # Frontend sends values from Supprt_Restraint_list:
    #   'Continous, with lateral restraint to top flange' (note typo in core)
    #   'Continous, with partial torsional restraint'
    #   'Continous, with lateral and torsional restraint'
    #   'Restrained laterally, torsionally and against rotation on flange'
    # We map frontend values (which may have "Continuous") to core values ("Continous")
    raw_support = input_values.get('Cantilever.Support', '')
    if not raw_support:
        raw_support = input_values.get('Flexure.Support_Restraint', '')
    # Map frontend display values to core values (core has typo "Continous" not "Continuous")
    support_map = {
        'Continuous, with lateral restraint to top flange': 'Continous, with lateral restraint to top flange',
        'Continuous, with partial torsional restraint': 'Continous, with partial torsional restraint',
        'Continuous, with lateral and torsional restraint': 'Continous, with lateral and torsional restraint',
        'Restrained laterally, torsionally and against rotation on flange': 'Restrained laterally, torsionally and against rotation on flange',
        # Pass through core values as-is
        'Continous, with lateral restraint to top flange': 'Continous, with lateral restraint to top flange',
        'Continous, with partial torsional restraint': 'Continous, with partial torsional restraint',
        'Continous, with lateral and torsional restraint': 'Continous, with lateral and torsional restraint',
    }
    cantilever_support = support_map.get(raw_support, raw_support) or 'Continous, with lateral restraint to top flange'

    # ---- Top Restraint (Cantilever.Top) ----
    # Frontend sends values from Top_Restraint_list:
    #   'Free', 'Lateral restraint to top flange', 'Torsional restraint', 'Lateral and Torsional restraint'
    raw_top = input_values.get('Cantilever.Top', '')
    if not raw_top:
        raw_top = input_values.get('Flexure.Top_Restraint', '')
    # Note: core has typo "Torsional rwstraint" (Top3)
    top_map = {
        'Free': 'Free',
        'Lateral restraint to top flange': 'Lateral restraint to top flange',
        'Torsional restraint': 'Torsional rwstraint',   # core has a typo
        'Lateral and Torsional restraint': 'Lateral and Torsional restraint',
        # Pass through core values
        'Torsional rwstraint': 'Torsional rwstraint',
    }
    cantilever_top = top_map.get(raw_top, raw_top) or 'Free'

    # ---- Other params ----
    material = input_values.get('Material', 'E 250 (Fe 410 W)A')
    sec_material = input_values.get('Member.Material', material)
    sec_profile = input_values.get('Member.Profile', 'Beams and Columns')
    length = float(input_values.get('Member.Length', 5000))
    shear = input_values.get('Load.Shear', '50')
    moment = input_values.get('Load.Moment', '100')
    length_overwrite = input_values.get('Length.Overwrite', 'NA')
    effective_area_para = float(input_values.get('Effective.Area_Para', 1.0))
    allow_class = input_values.get('Optimum.Class', 'Yes')
    bearing_length = input_values.get('Bearing.Length', 'NA')
    loading_condition = input_values.get('Loading.Condition', 'Normal')
    design_method = input_values.get('Design.Design_Method', 'Limit State Design')

    design_dict = {
        KEY_MODULE: 'On-Cantilever-Beam',
        KEY_SEC_PROFILE: sec_profile,
        KEY_SECSIZE: member_designation,
        KEY_MATERIAL: material,
        KEY_SEC_MATERIAL: sec_material,
        KEY_DESIGN_TYPE_FLEXURE: flexure_type,
        KEY_LENGTH: length,
        KEY_SHEAR: shear,
        KEY_MOMENT: moment,
        KEY_LENGTH_OVERWRITE: length_overwrite,
        KEY_EFFECTIVE_AREA_PARA: effective_area_para,
        KEY_ALLOW_CLASS: allow_class,
        KEY_BEARING_LENGTH: bearing_length,
        KEY_SUPPORT_TYPE: cantilever_support,    # 'Cantilever.Support'
        KEY_SUPPORT_TYPE2: cantilever_top,        # 'Cantilever.Top'
        KEY_LOAD: loading_condition,              # 'Loading.Condition'
        KEY_DP_DESIGN_METHOD: design_method,
    }

    print(f"[OnCantilever adapter] design_dict keys: {list(design_dict.keys())}")
    print(f"[OnCantilever adapter] Flexure.Type: {flexure_type}")
    print(f"[OnCantilever adapter] Cantilever.Support: {cantilever_support}")
    print(f"[OnCantilever adapter] Cantilever.Top: {cantilever_top}")

    module.set_input_values(design_dict)
    return module


def generate_output(input_values: Dict[str, Any]):
    """
    Generate formatted output for On-Cantilever-Beam module.
    Returns (output_dict, logs_list).
    """
    from osdag_core.custom_logger import CustomLogger

    output = {}
    logs = []

    try:
        module = create_from_input(input_values)

        raw_output = []

        for method_name in ['spacing', 'output_values', 'detail', 'detailing']:
            if hasattr(module, method_name):
                result = getattr(module, method_name)(True)
                if result:
                    raw_output += result

        # Collect logs
        if hasattr(module, 'logger') and isinstance(module.logger, CustomLogger):
            logs = module.logger.get_logs() or []
        else:
            logs = getattr(module, 'logs', []) or []

        # Format output fields
        for param in raw_output:
            if not param or len(param) < 4:
                continue

            if param[2] == 'TextBox':
                key = param[0]
                label = param[1]
                value = param[3]

                # Convert numpy values safely
                if hasattr(value, 'item'):
                    value = value.item()

                output[key] = {
                    'key': key,
                    'label': label,
                    'val': value
                }

        print(f"[OnCantilever generate_output] Generated {len(output)} fields")
        print(f"[OnCantilever generate_output] Retrieved {len(logs)} logs")

    except Exception as e:
        print("Error in OnCantilever generate_output:", str(e))
        print(traceback.format_exc())

    return output, logs


def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """
    Generate CAD model for On-Cantilever-Beam.
    Uses createSimplySupportedBeam as the cantilever beam shape is structurally similar.
    Returns relative BREP file path.
    """
    if section not in ('Model', 'Beam'):
        raise InvalidInputTypeError('section', "'Model' or 'Beam'")

    try:
        module = create_from_input(input_values)
    except Exception:
        traceback.print_exc()
        return ''

    module.module = KEY_DISP_FLEXURE2
    module.mainmodule = 'Flexure Member'

    # Initialize CAD logic
    try:
        cld = CommonDesignLogic(None, None, '', KEY_DISP_FLEXURE2, module.mainmodule)
        setup_for_cad(cld, module)
        cld.module_object = module
    except Exception:
        traceback.print_exc()
        return ''

    # Generate components using the simply-supported beam CAD shape
    # (cantilever beam shape is structurally similar - same I-section geometry)
    try:
        components = cld.createSimplySupportedBeam()
    except Exception:
        traceback.print_exc()
        return ''

    if not components:
        print("No components returned from createSimplySupportedBeam()")
        return ''

    # Combine shapes into a single compound
    try:
        builder = BRep_Builder()
        compound = TopoDS_Compound()
        builder.MakeCompound(compound)

        for shape in components.values():
            if shape is not None:
                builder.Add(compound, shape)

        model = compound
    except Exception:
        traceback.print_exc()
        return ''

    # Ensure output directory exists
    cad_models_path = os.path.join(os.getcwd(), 'file_storage', 'cad_models')
    os.makedirs(cad_models_path, exist_ok=True)

    file_name = f"{session}_{section}.brep"
    file_path = os.path.join('file_storage', 'cad_models', file_name)
    full_path = os.path.join(os.getcwd(), file_path)

    # Write BREP
    try:
        breptools_Write(model, full_path)
    except Exception:
        traceback.print_exc()
        return ''

    # Write STL (optional, non-critical)
    try:
        stl_path = full_path.replace('.brep', '.stl')
        write_stl(model, stl_path)
    except Exception as stle:
        print("STL write warning:", stle)

    return file_path
