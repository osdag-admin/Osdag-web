from osdag_api.validation_utils import validate_arr, validate_num, validate_string
from osdag_api.errors import MissingKeyError, InvalidInputTypeError
from osdag_api.utils import contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type
import osdag_api.modules.bolted_tension_member as tbm
from OCC.Core import BRepTools
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.IGESControl import IGESControl_Writer
from cad.common_logic import CommonDesignLogic
# Will log a lot of unnessecary data.
from design_type.tension_member.tension_bolted import Tension_bolted
import sys
import os
import typing
from typing import Dict, Any, List
old_stdout = sys.stdout  # Backup log
sys.stdout = open(os.devnull, "w")  # redirect stdout
sys.stdout = old_stdout  # Reset log

def get_required_keys() -> List[str]:
    abhisogal_keys = [
        "Member.Profile",
        "Member.Designation",
        "Material",
        "Connector.Plate.Thickness_List",
        "Bolt.Diameter",
        "Bolt.Grade",
        "Bolt.Type",
        "Bolt.Bolt_Hole_Type",
        "Bolt.Slip_Factor",
        "Connector.Material",
        "Design.Design_Method",
        "Detailing.Corrosive_Influences",
        "Detailing.Edge_type",
        "Detailing.Gap",
        "Load.Axial",
        "Member.Length",
        "Conn_Location",
        "Module"
    ]
    print("in boltedtensionmember.py: get_required_keys called, returning:", abhisogal_keys)
    return abhisogal_keys

def validate_input(input_values: Dict[str, Any]) -> None:
    print("in boltedtensionmember.py: validate_input called with input_values:", input_values)
    required_keys = get_required_keys()
    print("in boltedtensionmember.py: Required keys:", required_keys)
    missing_keys = contains_keys(input_values, required_keys)
    print("in boltedtensionmember.py: Missing keys:", missing_keys)
    if missing_keys is not None:
        print("in boltedtensionmember.py: Missing key detected:", missing_keys[0])
        raise MissingKeyError(missing_keys[0])

    # Validate Bolt.Bolt_Hole_Type
    print("in boltedtensionmember.py: Validating Bolt.Bolt_Hole_Type")
    if not isinstance(input_values["Bolt.Bolt_Hole_Type"], str):
        print("in boltedtensionmember.py: Invalid type for Bolt.Bolt_Hole_Type")
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type", "str")

    # Validate Bolt.Diameter
    print("in boltedtensionmember.py: Validating Bolt.Diameter")
    bolt_diameter = input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter, list)
            or not validate_list_type(bolt_diameter, str)
            or not custom_list_validation(bolt_diameter, int_able)):
        print("in boltedtensionmember.py: Invalid type for Bolt.Diameter")
        raise InvalidInputTypeError("Bolt.Diameter", "non empty List[str] where all items can be converted to int")

    # Validate Bolt.Grade
    print("in boltedtensionmember.py: Validating Bolt.Grade")
    bolt_grade = input_values["Bolt.Grade"]
    if (not isinstance(bolt_grade, list)
            or not validate_list_type(bolt_grade, str)
            or not custom_list_validation(bolt_grade, float_able)):
        print("in boltedtensionmember.py: Invalid type for Bolt.Grade")
        raise InvalidInputTypeError("Bolt.Grade", "non empty List[str] where all items can be converted to float")

    # Validate Bolt.Slip_Factor
    print("in boltedtensionmember.py: Validating Bolt.Slip_Factor")
    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor, str)
            or not float_able(bolt_slipfactor)):
        print("in boltedtensionmember.py: Invalid type for Bolt.Slip_Factor")
        raise InvalidInputTypeError("Bolt.Slip_Factor", "str where str can be converted to float")

    # Validate Bolt.Type
    print("in boltedtensionmember.py: Validating Bolt.Type")
    if not isinstance(input_values["Bolt.Type"], str):
        print("in boltedtensionmember.py: Invalid type for Bolt.Type")
        raise InvalidInputTypeError("Bolt.Type", "str")

    # Validate Connector.Material
    print("in boltedtensionmember.py: Validating Connector.Material")
    if not isinstance(input_values["Connector.Material"], str):
        print("in boltedtensionmember.py: Invalid type for Connector.Material")
        raise InvalidInputTypeError("Connector.Material", "str")

    # Validate Design.Design_Method
    print("in boltedtensionmember.py: Validating Design.Design_Method")
    if not isinstance(input_values["Design.Design_Method"], str):
        print("in boltedtensionmember.py: Invalid type for Design.Design_Method")
        raise InvalidInputTypeError("Design.Design_Method", "str")

    # Validate Detailing.Corrosive_Influences
    print("in boltedtensionmember.py: Validating Detailing.Corrosive_Influences")
    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]):
        print("in boltedtensionmember.py: Invalid value for Detailing.Corrosive_Influences")
        raise InvalidInputTypeError("Detailing.Corrosive_Influences", "'Yes' or 'No'")

    # Validate Detailing.Edge_type
    print("in boltedtensionmember.py: Validating Detailing.Edge_type")
    if not isinstance(input_values["Detailing.Edge_type"], str):
        print("in boltedtensionmember.py: Invalid type for Detailing.Edge_type")
        raise InvalidInputTypeError("Detailing.Edge_type", "str")

    # Validate Detailing.Gap
    print("in boltedtensionmember.py: Validating Detailing.Gap")
    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str)
            or not int_able(detailing_gap)):
        print("in boltedtensionmember.py: Invalid type for Detailing.Gap")
        raise InvalidInputTypeError("Detailing.Gap", "str where str can be converted to int")

    # Validate Load.Axial
    print("in boltedtensionmember.py: Validating Load.Axial")
    load_axial = input_values["Load.Axial"]
    if (not isinstance(load_axial, str)
            or not int_able(load_axial)):
        print("in boltedtensionmember.py: Invalid type for Load.Axial")
        raise InvalidInputTypeError("Load.Axial", "str where str can be converted to int")

    # Validate Material
    print("in boltedtensionmember.py: Validating Material")
    if not isinstance(input_values["Material"], str):
        print("in boltedtensionmember.py: Invalid type for Material")
        raise InvalidInputTypeError("Material", "str")

    # Validate Member.Profile
    print("in boltedtensionmember.py: Validating Member.Profile")
    if not isinstance(input_values["Member.Profile"], str):
        print("in boltedtensionmember.py: Invalid type for Member.Profile")
        raise InvalidInputTypeError("Member.Profile", "str")

    # Validate Member.Designation
    print("in boltedtensionmember.py: Validating Member.Designation")
    if not isinstance(input_values["Member.Designation"], str):
        print("in boltedtensionmember.py: Invalid type for Member.Designation")
        raise InvalidInputTypeError("Member.Designation", "str")

    # Validate Member.Length
    print("in boltedtensionmember.py: Validating Member.Length")
    if not isinstance(input_values["Member.Length"], str):
        print("in boltedtensionmember.py: Invalid type for Member.Length")
        raise InvalidInputTypeError("Member.Length", "str")

    # Validate Conn_Location
    print("in boltedtensionmember.py: Validating Conn_Location")
    if not isinstance(input_values["Conn_Location"], str):
        print("in boltedtensionmember.py: Invalid type for Conn_Location")
        raise InvalidInputTypeError("Conn_Location", "str")

    # Validate Module
    print("in boltedtensionmember.py: Validating Module")
    if not isinstance(input_values["Module"], str):
        print("in boltedtensionmember.py: Invalid type for Module")
        raise InvalidInputTypeError("Module", "str")

    # Validate Connector.Plate.Thickness_List
    print("in boltedtensionmember.py: Validating Connector.Plate.Thickness_List")
    connector_plate_thicknesslist = input_values["Connector.Plate.Thickness_List"]
    if (not isinstance(connector_plate_thicknesslist, list)
            or not validate_list_type(connector_plate_thicknesslist, str)
            or not custom_list_validation(connector_plate_thicknesslist, int_able)):
        print("in boltedtensionmember.py: Invalid type for Connector.Plate.Thickness_List")
        raise InvalidInputTypeError("Connector.Plate.Thickness_List", "List[str] where all items can be converted to int")

def validate_input_new(input_values: Dict[str, Any]) -> None:
    """Validate type for all values in design dict. Raise error when invalid"""

    # Check if all required keys exist
    required_keys = get_required_keys()
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
                ("Load.Axial", False),
                ("Load.Shear", False),
                ("Weld.Material_Grade_OverWrite", False)]
    for key in num_keys:  # Loop through all keys.
        # Check if key is a number. If not, raise error.
        print('validating num keys')
        validate_num(key[0], key[1])

    # Validate for keys that are arrays
    arr_keys = [("Bolt.Diameter", False),  # List of all parameters that can be converted to numbers (key, is_float)
                ("Bolt.Grade", True),
                ("Connector.Plate.Thickness_List", False)]
    for key in arr_keys:
        print('validating arr key')
        # Check if key is a list where all items can be converted to numbers. If not, raise error.
        validate_arr(key[0], key[1])


def create_module() -> Tension_bolted:
    print("in bolted_tension_member.py: create_module called")
    module = Tension_bolted()
    print("in bolted_tension_member.py: Tension_bolted instance created:", module)
    module.set_osdaglogger(None)
    print("in bolted_tension_member.py: set_osdaglogger called with None")
    return module


def create_from_input(input_values: Dict[str, Any]) -> Tension_bolted:
    print("in bolted_tension_member.py: create_from_input called with input_values:", input_values)
    try:
        module = create_module()
        print("in bolted_tension_member.py: Module created successfully")
    except Exception as e:
        print("in bolted_tension_member.py: Exception in create_module:", e)
        print("in bolted_tension_member.py: Error in creating module")
    # Plate.Thickness expects a list, take the first value if present, else ""
    if isinstance(input_values.get("Connector.Plate.Thickness_List", None), list) and input_values["Connector.Plate.Thickness_List"]:
        input_values["Plate.Thickness"] = input_values["Connector.Plate.Thickness_List"][0]
    else:
        input_values["Plate.Thickness"] = ""

    # Now call set_input_values with the updated dictionary
    try:
        module.set_input_values(input_values)
        print("in bolted_tension_member.py: set_input_values called successfully")
    except Exception as e:
        print("in bolted_tension_member.py: Exception in set_input_values:", e)
        print("in bolted_tension_member.py: Error in setting the input values")
    return module



def generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
    print("in bolted_tension_member.py: generate_output called with input_values:", input_values)
    output = {}
    module = create_from_input(input_values)
    print("in bolted_tension_member.py: Module after create_from_input:", module)
    print("in bolted_tension_member.py: type of module:", type(module))
    raw_output_text = module.output_values(True)
    print("in bolted_tension_member.py: raw_output_text:", raw_output_text)
    raw_output_spacing = module.spacing(True)
    print("in bolted_tension_member.py: raw_output_spacing:", raw_output_spacing)
    raw_output_capacities = module.capacities(True)
    print("in bolted_tension_member.py: raw_output_capacities:", raw_output_capacities)
    raw_output_bolt_capacity = module.bolt_capacity_details(True)
    print("in bolted_tension_member.py: raw_output_bolt_capacity:", raw_output_bolt_capacity)
    logs = module.logs
    print("in bolted_tension_member.py: logs:", logs)
    raw_output = raw_output_capacities + raw_output_spacing + raw_output_text + raw_output_bolt_capacity
    print("in bolted_tension_member.py: raw_output combined:", raw_output)
    for param in raw_output:
        print("in bolted_tension_member.py: Processing param:", param)
        if param[2] == "TextBox":
            key = param[0]
            label = param[1]
            value = param[3]
            output[key] = {
                "key": key,
                "label": label,
                "value": value
            }
            print(f"in bolted_tension_member.py: Added output[{key}] = {output[key]}")
    print("in bolted_tension_member.py: Final output dict:", output)
    return output, logs

def create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
    print("in bolted_tension_member.py: create_cad_model called with input_values:", input_values, "section:", section, "session:", session)
    if section not in ("Model", "Beam", "Column", "Plate"):
        print("in bolted_tension_member.py: Invalid section:", section)
        raise InvalidInputTypeError("section", "'Model', 'Beam', 'Column' or 'Plate'")
    module = create_from_input(input_values)
    print("in bolted_tension_member.py: module from input values:", module)
    print("in bolted_tension_member.py: Connectivity:", module.connectivity)
    print("in bolted_tension_member.py: module:", module.module)
    print("in bolted_tension_member.py: Mainmodule:", module.mainmodule)
    try:
        cld = CommonDesignLogic(None, '', module.module, module.mainmodule)
        print("in bolted_tension_member.py: CommonDesignLogic instance created")
    except Exception as e:
        print("in bolted_tension_member.py: error in cld e:", e)
    try:
        tbm.setup_for_cad(cld, module)
        print("in bolted_tension_member.py: setup_for_cad called successfully")
    except Exception as e:
        print("in bolted_tension_member.py: Error in setting up cad e:", e)
    cld.component = section
    print("in bolted_tension_member.py: cld.component set to:", section)
    try:
        model = cld.create2Dcad()
        print("in bolted_tension_member.py: create2Dcad called successfully")
    except Exception as e:
        print("in bolted_tension_member.py: Error in cld.create2Dcad() e:", e)
        return False
    if not os.path.exists(os.path.join(os.getcwd(), "file_storage/cad_models/")):
        print("in bolted_tension_member.py: path does not exist, creating cad_models folder")
        os.mkdir(os.path.join(os.getcwd(), "file_storage/cad_models/"))
    print("in bolted_tension_member.py: 2d model:", model)
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name
    print("in bolted_tension_member.py: brep file path in create_cad_model:", file_path)
    try:
        BRepTools.breptools.Write(model, file_path)
        print("in bolted_tension_member.py: BRepTools.breptools.Write called successfully")
        if section == "Model":
            step_writer = STEPControl_Writer()
            step_writer.Transfer(model, STEPControl_AsIs)
            step_file_path = file_path.replace(".brep", ".step")
            full_step_file_path = os.path.join(os.getcwd(), step_file_path)
            if step_writer.Write(full_step_file_path) == 1:
                print(f"in bolted_tension_member.py: STEP file saved at {full_step_file_path}")
            else:
                print("in bolted_tension_member.py: Warning: Failed to save STEP file!")
            iges_writer = IGESControl_Writer()
            iges_writer.AddShape(model)
            iges_file_path = file_path.replace(".brep", ".iges")
            full_iges_file_path = os.path.join(os.getcwd(), iges_file_path)
            if iges_writer.Write(full_iges_file_path) == 1:
                print(f"in bolted_tension_member.py: IGES file saved at {full_iges_file_path}")
            else:
                print("in bolted_tension_member.py: Warning: Failed to save IGES file!")
    except Exception as e:
        print("in bolted_tension_member.py: Writing to BREP file failed e:", e)
    return file_path