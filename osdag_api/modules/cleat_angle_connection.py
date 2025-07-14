from osdag_api.validation_utils import validate_arr, validate_num, validate_string
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
import osdag_api.modules.shear_connection_common as scc
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from OCC.Core.Message import Message_ProgressRange
from cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from design_type.connection.cleat_angle_connection import CleatAngleConnection
import sys
import os
from typing import Dict, Any, List
import traceback
old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log

def get_required_keys_cleat_angle() -> List[str]:
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
    ]

def validate_input(input_values: Dict[str,Any])-> None:
    #check iif all required keys exist 
    required_keys = get_required_keys_cleat_angle()
    # check if input_values contains all required keys
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys != None: #if keys are missing.
        #Raise error for the first missinf key.
        raise MissingKeyError(missing_keys[0])
    
    #check if Cleat.Angle_Type is a string.
    if not isinstance(input_values["Bolt.Bolt_Hole_Type"],str):
        #if not raise an error
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type")
    
    #validate Bolt Diameter
    bolt_diameter =input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter,list)
        or not validate_list_type(bolt_diameter,str)
        or not custom_list_validation(bolt_diameter)):
        raise InvalidInputTypeError(
            "Bolt.Diameter","non empty List[str] where all items can be converted to int"
        )
        
    # validate cleat grade
    bolt_grade = input_values["Bolt.Grade"]
    if(not isinstance(bolt_grade,list)
        or not validate_list_type(bolt_grade,str)
        or not custom_list_validation(bolt_grade,float_able)):
        
        #if any condition fail raise an error
        raise InvalidInputTypeError(
            "Bolt.Grade", "non empty List[str] where all items can be converted to float"
        )
    
    #Validate Cleat.Slip_Factor
    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor,str)
        or not float_able(bolt_slipfactor)):
        raise InvalidInputTypeError(
            "Bolt.Slip_Factor", "str where str can be converted to float"
        )
        
    #Validate Cleat.TensionType
    if not isinstance(input_values["Bolt.TensionType"], str):
        # If not, raise error.
        raise InvalidInputTypeError("Bolt.TensionType", "str")
    
    #Validate Cleat.Type
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

    # Validate Connector.Plate.Thickness_List
    # connector_plate_thicknesslist = input_values["Connector.Angle_List"]
    # if (not isinstance(connector_plate_thicknesslist, list)  # Check if Connector.Plate.Thickness_List is a list.
    #         # Check if all items in Connector.Plate.Thickness_List are str.
    #         or not validate_list_type(connector_plate_thicknesslist, str)
    #         or not custom_list_validation(connector_plate_thicknesslist, int_able)):  # Check if all items in Connector.Plate.Thickness_List can be converted to int.
    #     raise InvalidInputTypeError(
    #         "Connector.Angle_List", "List[str] where all items can be converted to int")


def validate_input_new(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""

    # Check if all required keys exist
    required_keys = get_required_keys_cleat_angle()
    print('required_keys : ' , required_keys)
    # Check if input_values contains all required keys.
    missing_keys = contains_keys(input_values, required_keys)
    print('missing keys : ' , missing_keys)
    if missing_keys != None:  # If keys are missing.
        # Raise error for the first missing key.
        print("missing keys is not None")
        raise MissingKeyError(missing_keys[0])

    
    # Validate key types using loops.

    # Validate all strings.
    str_keys = ["Bolt.Bolt_Hole_Type",  # List of all parameters that are strings
                "Bolt.TensionType",
                "Bolt.Type",
                "Bolt.Connectivity",
                "Bolt.Connector_Material",
                "Design.Design_Method",
                "Detailing.Edge_type",
                "Material",
                "Member.Supported_Section.Designation",
                "Member.Supported_Section.Material",
                "Member.Supporting_Section.Designation",
                "Member.Supporting_Section.Material",
                "Module",
                "Weld.Fab"]
    for key in str_keys:  # Loop through all keys.
        print('validating string key')
        
        try : 
            validate_string(key)  # Check if key is a string. If not, raise error.
        except : 
            print('error in validating string keys')
            print('string key passed  : ' , key )

    # Validate for keys that are numbers
    num_keys = [("Bolt.Slip_Factor", True),  # List of all parameters that are numbers (key, is_float)
                ("Detailing.Gap", False),
                ("Load.Shear", False),
                ("Weld.Material_Grade_OverWrite", False)]
    for key in num_keys:  # Loop through all keys.
        # Check if key is a number. If not, raise error.
        print('validating num keys')
        validate_num(key[0], key[1])

    # Validate for keys that are arrays
    arr_keys = [("Bolt.Diameter", False),  # List of all parameters that can be converted to numbers (key, is_float)
                ("Bolt.Grade", True)]
                # ("Connector.Plate.Thickness_List", False)]
    for key in arr_keys:
        print('validating arr key')
        # Check if key is a list where all items can be converted to numbers. If not, raise error.
        validate_arr(key[0], key[1])

def create_module() -> CleatAngleConnection:
    """Create an instance of the cleat angle connection module design class and set it up for use"""
    module = CleatAngleConnection()  # Create an instance of the CleatAngleConnection
    module.set_osdaglogger(None)
    return module

def create_from_input(input_values: Dict[str, Any]) -> CleatAngleConnection:
    """Create an instance of the cleat angle connection module design class from input values."""
    # validate_input(input_values)
    print('CleatAngle - create_from_input called with input_values:', input_values)
    
    try : 
        module = create_module()  # Create module instance.
        print('CleatAngle - create_module successful, module:', module)
    except Exception as e : 
        print('e in create_module : ' , e) 
        print('error in creating module')
        traceback.print_exc()
        return None
    
    # Set the input values on the module instance.
    print('CleatAngle - About to call module.set_input_values')
    print('CleatAngle - Section designations in input:')
    print('  - Supporting Section (Column):', input_values.get('Member.Supporting_Section.Designation'))
    print('  - Supported Section (Beam):', input_values.get('Member.Supported_Section.Designation'))
    print('  - Connectivity:', input_values.get('Connectivity'))
    
    try : 
        module.set_input_values(input_values)
        print('CleatAngle - module.set_input_values successful')
    except Exception as e : 
        
        traceback.print_exc()
        print('e in set_input_values : ' , e)
        print('error in setting the input values')
        print('CleatAngle - Exception type:', type(e))
        print('CleatAngle - Exception args:', e.args)

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
    print('CleatAngle - generate_output called with input_values:', input_values)
    
    output = {}  # Dictionary for formatted values
    module = create_from_input(input_values)  # Create module from input.
    print('module : ' , module)
    print('type of module : ' , type(module))

    if module is None:
        print('CleatAngle - Module creation failed, returning empty output')
        return {}, []

    # Check if module has required attributes
    if not hasattr(module, 'output_values'):
        print('CleatAngle - Module does not have output_values method')
        return {}, []

    print('CleatAngle - About to call module output methods')
    
    try:
        # Check if module has required attributes for output generation
        required_attrs = ['cleat', 'bolt', 'sptd_leg', 'spting_leg']
        missing_attrs = []
        for attr in required_attrs:
            if not hasattr(module, attr):
                missing_attrs.append(attr)
        
        if missing_attrs:
            print(f'CleatAngle - Module missing required attributes: {missing_attrs}')
            print('CleatAngle - This indicates set_input_values failed. Module not properly initialized.')
            return {}, []
            
        # Generate output values in unformatted form.
        raw_output_text = module.output_values(True)
        print('CleatAngle - raw_output_text:', raw_output_text)
        print(f'CleatAngle - raw_output_text length: {len(raw_output_text)}')
    except Exception as e:
        print('CleatAngle - Error calling output_values:', e)
        traceback.print_exc()
        raw_output_text = []
        
    try:
        raw_output_spacing = module.spacing(True)  # Generate output val
        print('CleatAngle - raw_output_spacing:', raw_output_spacing)
    except Exception as e:
        print('CleatAngle - Error calling spacing:', e)
        raw_output_spacing = []
        
    try:
        # raw_output_capacities = module.capacities(True)
        raw_bolt_capacity_supported = module.bolt_capacity_details_supported(True)
        print('CleatAngle - raw_bolt_capacity_supported:', raw_bolt_capacity_supported)
    except Exception as e:
        print('CleatAngle - Error calling bolt_capacity_details_supported:', e)
        raw_bolt_capacity_supported = []
        
    try:
        raw_bolt_capacity_suporting = module.bolt_capacity_details_suporting(True)
        print('CleatAngle - raw_bolt_capacity_suporting:', raw_bolt_capacity_suporting)
    except Exception as e:
        print('CleatAngle - Error calling bolt_capacity_details_suporting:', e)
        raw_bolt_capacity_suporting = []
    
    # Add suffixes to duplicate-prone supported keys
    raw_supported = [
        (f"{key}_supported", label, typ, value, visible)
        for key, label, typ, value, visible in raw_bolt_capacity_supported
        if key  # only if key is not None
    ]

    raw_supporting = [
        (f"{key}_supporting", label, typ, value, visible)
        for key, label, typ, value, visible in raw_bolt_capacity_suporting
        if key
    ]
    
    logs = module.logs
    print(f'CleatAngle - Module logs: {logs}')
    print(f'CleatAngle - Module logs length: {len(logs)}')
    print(f'CleatAngle - Module logs type: {type(logs)}')
    
    # Ensure logs is a list if empty
    if not logs:
        logs = ["No logs generated"]
        print("CleatAngle - Setting default logs message")
    
    raw_output = raw_output_spacing + raw_output_text + raw_supported + raw_supporting
    print(f'CleatAngle - Total raw_output items: {len(raw_output)}')
    print(f'CleatAngle - Raw output sample: {raw_output[:5] if raw_output else "Empty"}')
    
    # os.system("clear")
    # Loop over all the text values and add them to ouptut dict.
    for param in raw_output:
        if param[2] == "TextBox":  # If the parameter is a text output,
            key = param[0]  # id/key
            label = param[1]  # label text.
            value = param[3]  # Value as string.
            print(f'CleatAngle - Adding to output: {key} = {value}')
            output[key] = {
                "key": key,
                "label": label,
                "val": value  # Changed from "value" to "val" to match frontend expectations
            }  # Set label, key and value in output
    
    print(f'CleatAngle - Final output keys: {list(output.keys())}')
    print(f'CleatAngle - Final output size: {len(output)}')
    print(f'CleatAngle - Final logs being returned: {logs}')
    return output, logs

#we do not have plate in just like in finplate case, we have cleatAngle which is combination of angle & nutbolts
def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    """Generate the CAD model from input values as a BREP file. Return file path."""
    if section not in ("Model", "Beam", "Column", "CleatAngle"):  # Error checking: If section is valid.
        raise InvalidInputTypeError(
            "section", "'Model', 'Beam', 'Column' or 'CleatAngle'")
    
    # First check if we have valid output before attempting CAD generation
    try:
        output, logs = generate_output(input_values)
        print(f'CleatAngle CAD - Checking output before CAD generation: {len(output)} keys')
        
        if not output or len(output) == 0:
            print('CleatAngle CAD - No valid output found. Cannot generate CAD model.')
            raise ValueError("Cannot generate CAD model: No valid design output found. Please ensure the design calculation completed successfully.")
            
        print('CleatAngle CAD - Valid output found, proceeding with CAD generation')
    except Exception as e:
        print(f'CleatAngle CAD - Error checking output: {e}')
        raise ValueError(f"Cannot generate CAD model: Design calculation failed - {str(e)}")
    
    module = create_from_input(input_values)  # Create module from input.
    print('module from input values : ' , module)
    # Object that will create the CAD model.
    try : 
        print(module.module)
        cld = CommonDesignLogic(None, '', module.module , module.mainmodule)
    except Exception as e : 
        print('error in cld e : ' , e)
    
    try : 
        # Setup the calculations object for generating CAD model.
        scc.setup_for_cad(cld, module)
    except Exception as e : 
        traceback.print_exc()
        print('Error in setting up cad e : ' , e)

    # The section of the module that will be generated.
    cld.component = section
    
    try : 
        model = cld.create2Dcad()  # Generate CAD Model.
    except Exception as e :
        print('Error in cld.create2Dcad() e : ' , e)
        return False

    # check if the cad_models folder exists or not 
    # if no, then create one 
    if(not os.path.exists(os.path.join(os.getcwd() , "file_storage/cad_models/"))) :
        print('path does not exists cad_models , creating one')
        os.mkdir(os.path.join(os.getcwd() , "file_storage/cad_models/"))
      
    print('2d model : ' , model)
    # os.system("clear")  # clear the terminal
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name
    print('brep file path in create_cad_model : ' , file_path)

    try : 
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange()) # Generate CAD Model
        
        if section == "Model":
            # Save STEP
            step_writer = STEPControl_Writer()
            step_writer.Transfer(model, STEPControl_AsIs)
            step_file_path = file_path.replace(".brep", ".step")
            full_step_file_path = os.path.join(os.getcwd(), step_file_path)
            if step_writer.Write(full_step_file_path) == 1:
                print(f"STEP file saved at {full_step_file_path}")
            else:
                print("Warning: Failed to save STEP file!")

            # Save IGES
            iges_writer = IGESControl_Writer()
            iges_writer.AddShape(model)
            iges_file_path = file_path.replace(".brep", ".iges")
            full_iges_file_path = os.path.join(os.getcwd(), iges_file_path)
            if iges_writer.Write(full_iges_file_path) == 1:
                print(f"IGES file saved at {full_iges_file_path}")
            else:
                print("Warning: Failed to save IGES file!")
        
    except Exception as e : 
        print('Writing to BREP file failed e : ' , e)
    
    return file_path


