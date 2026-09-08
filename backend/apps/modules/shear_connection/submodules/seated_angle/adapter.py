from apps.core.utils import (
    validate_arr, validate_num, validate_string,
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    build_raw_output_dict
)
from apps.modules.shear_connection import shared as scc
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from osdag_core.cad.common_logic import CommonDesignLogic
from osdag_core.Common import KEY_DISP_SEATED_ANGLE, KEY_CONN
# Will log a lot of unnessecary data.
from osdag_core.design_type.connection.seated_angle_connection import SeatedAngleConnection
from osdag_core.custom_logger import CustomLogger
import sys
import os
from typing import Dict, Any, List
import traceback
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.StlAPI import StlAPI_Writer
try:
    from OCC.Core.RWGltf import RWGltf_CafWriter
    HAS_GLB = True
except Exception:
    HAS_GLB = False

def get_required_keys_seated_angle() -> List[str]:
    return [
        "Bolt.Bolt_Hole_Type",
        "Bolt.Diameter",
        "Bolt.Grade",
        "Bolt.Slip_Factor",
        "Bolt.TensionType",
        "Bolt.Type",
        "Connectivity",
        "Connector.Material",
        "Design.Design_Method",
        "Detailing.Corrosive_Influences",
        "Detailing.Edge_type",
        "Detailing.Gap",
        "Load.Shear",
        "Material",
        "Member.Supported_Section.Designation",
        "Member.Supported_Section.Material",
        "Member.Supporting_Section.Designation",
        "Member.Supporting_Section.Material",
        "Module",
        "Weld.Fab",
        "Weld.Material_Grade_OverWrite",
        "Connector.Angle_List",
        "Connector.Top_Angle"
    ]

def validate_input(input_values: Dict[str,Any])-> None:
    #check iif all required keys exist 
    required_keys = get_required_keys_seated_angle()
    # check if input_values contains all required keys
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys != None: #if keys are missing.
        #Raise error for the first missinf key.
        raise MissingKeyError(missing_keys[0])
    
    #check if Seated.Angle_Type is a string.
    if not isinstance(input_values["Bolt.Bolt_Hole_Type"],str):
        #if not raise an error
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type")
    
    #validate Bolt Diameter
    bolt_diameter =input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter,list)
        or not validate_list_type(bolt_diameter,str)
        or not custom_list_validation(bolt_diameter, int_able)):
        raise InvalidInputTypeError(
            "Bolt.Diameter","non empty List[str] where all items can be converted to int"
        )
        
    # validate seated grade
    bolt_grade = input_values["Bolt.Grade"]
    if(not isinstance(bolt_grade,list)
        or not validate_list_type(bolt_grade,str)
        or not custom_list_validation(bolt_grade,float_able)):
        
        #if any condition fail raise an error
        raise InvalidInputTypeError(
            "Bolt.Grade", "non empty List[str] where all items can be converted to float"
        )
    
    #Validate seated.Slip_Factor
    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor,str)
        or not float_able(bolt_slipfactor)):
        raise InvalidInputTypeError(
            "Bolt.Slip_Factor", "str where str can be converted to float"
        )
        
    #Validate seated.TensionType
    if not isinstance(input_values["Bolt.TensionType"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Bolt.TensionType", "str")
    
    #Validate seated.Type
    if not isinstance(input_values["Bolt.Type"], str):
        raise InvalidInputTypeError("Bolt.Type", "str")  # If not, raise error.

    # validate connectivity
    if not isinstance(input_values["Connectivity"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Connectivity", "str")

    #Validate Connector Material
    if not isinstance(input_values["Connector.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Connector.Material", "str")

    # Validate Design.Design_Method
    # Check if Design.Design_Method is a string.
    if not isinstance(input_values["Design.Design_Method"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Design.Design_Method", "str")

    # Validate Detailing.Corrosive_Influences
    # Check if Detailing.Corrosive_Influences is 'Yes' or 'No'.
    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Detailing.Corrosive_Influences", "'Yes' or 'No'")

    # Validate Detailing.Edge_type
    # Check if Detailing.Edge_type is a string.
    if not isinstance(input_values["Detailing.Edge_type"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Detailing.Edge_type", "str")

    # Validate Detailing.Gap
    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str)  # Check if Detailing.Gap is a string.
            or not int_able(detailing_gap)):  # Check if Detailing.Gap can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Detailing.Gap", "str where str can be converted to int")

    
    # Validate Load.Shear
    load_shear = input_values["Load.Shear"]
    if (not isinstance(load_shear, str)  # Check if Load.Shear is a string.
            or not int_able(load_shear)):  # Check if Load.Shear can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Load.Shear", "str where str can be converted to int")

    # Validate Material
    # Check if Material is a string.
    if not isinstance(input_values["Material"], str):
        raise InvalidInputTypeError("Material", "str")  # If not, raise error.

    # Validate Member.Supported_Section.Designation
    # Check if Member.Supported_Section.Designation is a string.
    if not isinstance(input_values["Member.Supported_Section.Designation"], str):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Member.Supported_Section.Designation", "str")

    # Validate Member.Supported_Section.Material
    # Check if Member.Supported_Section.Material is a string.
    if not isinstance(input_values["Member.Supported_Section.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Member.Supported_Section.Material", "str")

    # Validate Member.Supporting_Section.Designation
    # Check if Member.Supporting_Section.Designation is a string.
    if not isinstance(input_values["Member.Supporting_Section.Designation"], str):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Member.Supporting_Section.Designation", "str")

    # Validate Member.Supporting_Section.Material
    # Check if Member.Supporting_Section.Material is a string.
    if not isinstance(input_values["Member.Supporting_Section.Material"], str):
        # If not, raise error.
        raise InvalidInputTypeError(
            "Member.Supporting_Section.Material", "str")

    # Validate Module
    # Check if Module is a string.
    if not isinstance(input_values["Module"], str):
        raise InvalidInputTypeError("Module", "str")  # If not, raise error.

    # Validate Weld.Fab
    # Check if Weld.Fab is a string.
    if not isinstance(input_values["Weld.Fab"], str):
        raise InvalidInputTypeError("Weld.Fab", "str")  # If not, raise error.

    # Validate Weld.Material_Grade_OverWrite
    weld_materialgradeoverwrite = input_values["Weld.Material_Grade_OverWrite"]
    if (not isinstance(weld_materialgradeoverwrite, str)  # Check if Weld.Material_Grade_OverwWite is a string.
            or not int_able(weld_materialgradeoverwrite)):  # Check if Weld.Material_Grade_OverWrite can be converted to int.
        # If any of these conditions fail, raise error.
        raise InvalidInputTypeError(
            "Weld.Material_Grade_OverWrite", "str where str can be converted to int.")

def create_module() -> SeatedAngleConnection:
    """Create an instance of the FinPlateConnection module design class and set it up for use"""
    module = SeatedAngleConnection()  # Create an instance of the FinPlateConnection
    module.set_osdaglogger(None, id="web")
    return module

def create_from_input(input_values: Dict[str, Any]) -> SeatedAngleConnection:
    """Create an instance of the FinPlateConnection module design class from input values."""
    # validate_input(input_values)
    try : 
        module = create_module()  # Create module instance.
    except Exception as e : 
        print('e in create_module : ' , e) 
        print('error in creating module')
    
    # Map frontend keys to osdag_core keys
    # Frontend sends 'Connectivity' but osdag_core expects 'Connectivity *' (KEY_CONN)
    design_dictionary = input_values.copy()
    if 'Connectivity' in design_dictionary and KEY_CONN not in design_dictionary:
        design_dictionary[KEY_CONN] = design_dictionary.pop('Connectivity')
    
    # Set the input values on the module instance.
    try :
        print('setting input values : ' , input_values) 
        module.set_input_values(design_dictionary)
    except Exception as e : 
        traceback.print_exc()
        print('e in set_input_values : ' , e)
        print('error in setting the input values')

    return module

def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate, format and return the input values from the given output values.
    Output format (json): {
        "Bolt.Pitch": 
            "key": "Bolt.Pitch",
            "label": "Pitch Distance (mm)"
            "value": 40
        }
    }
    """
    output = {}  # Dictionary for formatted values
    module = create_from_input(input_values)  # Create module from input.

    # Generate output values in unformatted form.
    raw_output_text = module.output_values(True)
    raw_csv = build_raw_output_dict(raw_output_text)
    raw_output_capacities = module.capacities(True)
    raw_output_seated_spacing_beam = module.seated_spacing_beam(True)
    raw_output_seated_spacing_col = module.seated_spacing_col(True)
    raw_output_top_spacing_col = module.top_spacing_col(True)
    raw_output_top_spacing_beam = module.top_spacing_beam(True)
    
    try:
        raw_output_section_capacities = module.section_capacities(True)
    except Exception as e:
        print("Error calling section_capacities:", e)
        raw_output_section_capacities = []
    
    raw_seated_spacing_beam = [
        (f"{key}_seated_beam", label, typ, value, visible if len(item) == 5 else True)
        for item in raw_output_seated_spacing_beam
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_seated_spacing_col = [
        (f"{key}_seated_col", label, typ, value, visible if len(item) == 5 else True)
        for item in raw_output_seated_spacing_col
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_top_spacing_col = [
        (f"{key}_top_col", label, typ, value, visible if len(item) == 5 else True)
        for item in raw_output_top_spacing_col
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_top_spacing_beam = [
        (f"{key}_top_beam", label, typ, value, visible if len(item) == 5 else True)
        for item in raw_output_top_spacing_beam
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]
    
    # Prefer CustomLogger logs if available
    if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs()
    else:
        logs = module.logs if hasattr(module, "logs") else []
    raw_output = raw_output_text + raw_output_capacities + raw_output_section_capacities + raw_seated_spacing_col + raw_seated_spacing_beam + raw_top_spacing_beam + raw_top_spacing_col
    # os.system("clear")
    # Loop over all the text values and add them to ouptut dict.
    for param in raw_output:
        if param[2] == "TextBox":  # If the parameter is a text output,
            key = param[0]  # id/key
            label = param[1]  # label text.
            value = param[3]  # Value as string.
            output[key] = {
                "key": key,
                "label": label,
                "val": value  # Changed from "value" to "val" to match frontend expectations
            }  # Set label, key and value in output
    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv


def create_cad_model(input_values: Dict[str, Any], section: str, session: str, export_formats=None) -> str:
    from apps.core.utils import write_stl
    from OCC.Core.BRep import BRep_Builder
    from OCC.Core.TopoDS import TopoDS_Compound
    from OCC.Core.Message import Message_ProgressRange
    
    if section not in ("Model", "Beam", "Column", "SeatedAngle", "Bolt", "Weld"):  # Error checking: If section is valid.
        raise InvalidInputTypeError(
            "section", "'Model', 'Beam', 'Column', 'SeatedAngle', 'Bolt' or 'Weld'")
    module = create_from_input(input_values)  # Create module from input.
    # Object that will create the CAD model.
    try : 
        cld = CommonDesignLogic(None, None, '', KEY_DISP_SEATED_ANGLE, module.mainmodule)
    except Exception as e : 
        print('error in cld e : ' , e)
        return False
    
    try : 
        # Setup the calculations object for generating CAD model.
        scc.setup_for_cad(cld, module)
    except Exception as e : 
        import traceback
        traceback.print_exc()
        print('Error in setting up cad e : ' , e)

    cld.component = section

    part_names = ["Beam", "Column", "SeatedAngle", "Weld", "Welds", "Bolt", "Bolts"]
    try:
        if section == "Model":
            # Build compound by adding each part shape without fusing
            builder = BRep_Builder()
            compound = TopoDS_Compound()
            builder.MakeCompound(compound)
            for part in part_names:
                try:
                    cld.component = part
                    part_shape = cld.create2Dcad()
                    if part_shape is None:
                        continue
                    builder.Add(compound, part_shape)
                    part_file_name = f"{session}_{part}.brep"
                    part_file_path_rel = os.path.join("file_storage", "cad_models", part_file_name)
                    full_brep_path = os.path.join(os.getcwd(), part_file_path_rel)
                    from OCC.Core import BRepTools
                    BRepTools.breptools.Write(part_shape, full_brep_path, Message_ProgressRange())
                    try:
                        module.logs.append(f"Wrote {part} BREP: {full_brep_path}")
                    except Exception:
                        pass
                    # STL as well
                    part_stl_file = part_file_path_rel.replace(".brep", ".stl")
                    try:
                        full_stl = os.path.join(os.getcwd(), part_stl_file)
                        write_stl(part_shape, full_stl)
                        try:
                            module.logs.append(f"Wrote {part} STL: {full_stl}")
                        except Exception:
                            pass
                    except Exception as e:
                        print(f"Failed to write STL for part {part} (SeatedAngle):", e)
                except Exception as e:
                    print(f"Failed generating cad part {part} in SeatedAngle: {e}")

            # Now write the compound as the Model
            cld.component = "Model"
            model = compound
            compound_file_name = f"{session}_Model.brep"
            compound_file_path_rel = os.path.join("file_storage", "cad_models", compound_file_name)
            from OCC.Core import BRepTools
            full_compound = os.path.join(os.getcwd(), compound_file_path_rel)
            BRepTools.breptools.Write(model, full_compound, Message_ProgressRange())
            try:
                module.logs.append(f"Wrote Model BREP: {full_compound}")
            except Exception:
                pass
            # Compound/model STL (for completeness, not loaded in UI)
            compound_stl_file = compound_file_path_rel.replace(".brep", ".stl")
            try:
                full_compound_stl = os.path.join(os.getcwd(), compound_stl_file)
                write_stl(model, full_compound_stl)
                try:
                    module.logs.append(f"Wrote Model STL: {full_compound_stl}")
                except Exception:
                    pass
            except Exception as e:
                print("Failed to write Model STL for SeatedAngle:", e)

            # Optional on-demand exports (only when frontend requests them)
            try:
                from apps.core.utils.cad_export import export_step, export_iges

                export_formats_lc = {f.lower() for f in export_formats} if export_formats else set()
                if "step" in export_formats_lc:
                    step_rel = compound_file_path_rel.replace(".brep", ".step")
                    export_step(model, os.path.join(os.getcwd(), step_rel))
                if "iges" in export_formats_lc:
                    iges_rel = compound_file_path_rel.replace(".brep", ".iges")
                    export_iges(model, os.path.join(os.getcwd(), iges_rel))
            except Exception as e:
                print(f"Warning: Optional step/iges export failed for SeatedAngle Model: {e}")
            return compound_file_path_rel
        else:
            try :
                model = cld.create2Dcad()  # Generate CAD Model.
            except Exception as e :
                print('Error in cld.create2Dcad() e : ' , e)
                return False
            cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
            if not os.path.exists(cad_models_path):
                print('path does not exists cad_models , creating one')
                os.makedirs(cad_models_path, exist_ok=True)
            file_name = session + "_" + section + ".brep"
            file_path = "file_storage/cad_models/" + file_name
            try :
                from OCC.Core import BRepTools
                full_brep = os.path.join(os.getcwd(), file_path)
                BRepTools.breptools.Write(model, full_brep, Message_ProgressRange())
                try:
                    module.logs.append(f"Wrote {section} BREP: {full_brep}")
                except Exception:
                    pass
                # Write STL too
                stl_file_path = file_path.replace(".brep", ".stl")
                full_stl = os.path.join(os.getcwd(), stl_file_path)
                write_stl(model, full_stl)
                try:
                    module.logs.append(f"Wrote {section} STL: {full_stl}")
                except Exception:
                    pass
            except Exception as e :
                print('Writing to BREP or STL file failed e : ' , e)
            return file_path
    except Exception as top_e:
        print('Top-level error in SeatedAngle create_cad_model:', top_e)
        return False

