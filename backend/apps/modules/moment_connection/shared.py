"""
Shared utilities for moment connection modules
"""
import os
import traceback

from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from osdag_core.Common import *
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange

from apps.core.utils import (
    MissingKeyError, InvalidInputTypeError,
    contains_keys, custom_list_validation, float_able, int_able, is_yes_or_no, validate_list_type,
    write_stl, build_raw_output_dict,
)


def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObject before generating CAD"""
    print('SETTING UP FOR CAD', module_class)
    cdl.module_class = module_class  # Set the module class in design logic object.
    cdl.module_object = module_class  # Set the module object (required by common_logic.py)
    print("******")
    module_object = module_class
    print("********")
    # Ensure CommonDesignLogic has module/mainmodule for moment connections
    if not getattr(cdl, "mainmodule", None):
        cdl.mainmodule = getattr(module_object, "mainmodule", None)

    # Column cover plate (bolted / welded) and column end plate support
    if module_object.module in (
        "ColumnCoverPlateBolted",
        "Column-to-Column Cover Plate Bolted Connection",
        "Column-to-Column-Cover-Plate-Bolted-Connection",
    ):
        cdl.C = module_object
        cdl.CPObj = cdl.createCCCoverPlateCAD()
    if module_object.module in (
        "Column-to-Column Cover Plate Welded Connection",
        "Column-to-Column-Cover-Plate-Welded-Connection",
    ):
        cdl.C = module_object
        cdl.CPObj = cdl.createCCCoverPlateCAD()
    if module_object.module in (
        "Column-to-Column-End-Plate-Connection",
        "Column-to-Column End Plate Connection",
        KEY_DISP_COLUMNENDPLATE,
    ):
        cdl.CEP = module_object
        cdl.CEPObj = cdl.createCCEndPlateCAD()

    # Beam-side moment modules
    if module_object.module == "Beam-to-Beam Cover Plate Bolted Connection":
        # Required for createBBCoverPlateCAD which expects self.B to exist
        cdl.B = module_object
        cdl.CPObj = cdl.createBBCoverPlateCAD()
    if module_object.module == "Beam-to-Beam End Plate Connection":
        cdl.CPObj = cdl.createBBEndPlateCAD()
    if module_object.module == "Beam-to-Beam Cover Plate Welded Connection":
        cdl.B = module_object
        cdl.CPObj = cdl.createBBCoverPlateCAD()
    if module_object.module == "Beam-to-Column End Plate Connection":
        cdl.CPObj = cdl.createBCEndPlateCAD()  # Initialize the CAD object for beam-column end plate


# ─── Shared logic for beam/column cover-plate bolted adapters ─────────────────
# beam_beam_cover_plate_bolted and column_column_cover_plate_bolted are
# near-byte-identical modulo which osdag_core module class they wrap.

COVER_PLATE_BOLTED_REQUIRED_KEYS = [
    "Bolt.Bolt_Hole_Type",
    "Bolt.Diameter",
    "Bolt.Grade",
    "Bolt.Slip_Factor",
    "Bolt.TensionType",
    "Bolt.Type",
    "Connector.Flange_Plate.Preferences",
    "Connector.Flange_Plate.Thickness_list",
    "Connector.Material",
    "Connector.Web_Plate.Thickness_List",
    "Design.Design_Method",
    "Detailing.Corrosive_Influences",
    "Detailing.Edge_type",
    "Detailing.Gap",
    "Load.Axial",
    "Load.Moment",
    "Load.Shear",
    "Material",
    "Member.Designation",
    "Member.Material",
    "Module",
]


def validate_cover_plate_bolted_input(input_values):
    """Validate type for all values in a beam/column cover-plate bolted design dict."""
    required_keys = COVER_PLATE_BOLTED_REQUIRED_KEYS
    missing_keys = contains_keys(input_values, required_keys)
    if missing_keys != None:
        raise MissingKeyError(missing_keys[0])

    if not isinstance(input_values["Bolt.Bolt_Hole_Type"], str):
        raise InvalidInputTypeError("Bolt.Bolt_Hole_Type", "str")

    bolt_diameter = input_values["Bolt.Diameter"]
    if (not isinstance(bolt_diameter, list)
            or not validate_list_type(bolt_diameter, str)
            or not custom_list_validation(bolt_diameter, int_able)):
        raise InvalidInputTypeError(
            "Bolt.Diameter", "non empty List[str] where all items can be converted to int")

    bolt_grade = input_values["Bolt.Grade"]
    if (not isinstance(bolt_grade, list)
            or not validate_list_type(bolt_grade, str)
            or not custom_list_validation(bolt_grade, float_able)):
        raise InvalidInputTypeError(
            "Bolt.Grade", "non empty List[str] where all items can be converted to float")

    bolt_slipfactor = input_values["Bolt.Slip_Factor"]
    if (not isinstance(bolt_slipfactor, str)
            or not float_able(bolt_slipfactor)):
        raise InvalidInputTypeError(
            "Bolt.Slip_Factor", "str where str can be converted to float")

    if not isinstance(input_values["Bolt.TensionType"], str):
        raise InvalidInputTypeError("Bolt.TensionType", "str")

    if not isinstance(input_values["Bolt.Type"], str):
        raise InvalidInputTypeError("Bolt.Type", "str")

    if not isinstance(input_values["Connector.Flange_Plate.Preferences"], str):
        raise InvalidInputTypeError("Connector.Flange_Plate.Preferences", "str")

    flange_thickness_list = input_values["Connector.Flange_Plate.Thickness_list"]
    if (not isinstance(flange_thickness_list, list)
            or not validate_list_type(flange_thickness_list, str)
            or not custom_list_validation(flange_thickness_list, int_able)):
        raise InvalidInputTypeError(
            "Connector.Flange_Plate.Thickness_list", "List[str] where all items can be converted to int")

    if not isinstance(input_values["Connector.Material"], str):
        raise InvalidInputTypeError("Connector.Material", "str")

    web_thickness_list = input_values["Connector.Web_Plate.Thickness_List"]
    if (not isinstance(web_thickness_list, list)
            or not validate_list_type(web_thickness_list, str)
            or not custom_list_validation(web_thickness_list, int_able)):
        raise InvalidInputTypeError(
            "Connector.Web_Plate.Thickness_List", "List[str] where all items can be converted to int")

    if not isinstance(input_values["Design.Design_Method"], str):
        raise InvalidInputTypeError("Design.Design_Method", "str")

    if not is_yes_or_no(input_values["Detailing.Corrosive_Influences"]):
        raise InvalidInputTypeError(
            "Detailing.Corrosive_Influences", "'Yes' or 'No'")

    if not isinstance(input_values["Detailing.Edge_type"], str):
        raise InvalidInputTypeError("Detailing.Edge_type", "str")

    detailing_gap = input_values["Detailing.Gap"]
    if (not isinstance(detailing_gap, str)
            or not int_able(detailing_gap)):
        raise InvalidInputTypeError(
            "Detailing.Gap", "str where str can be converted to int")

    load_axial = input_values["Load.Axial"]
    if (not isinstance(load_axial, str)
            or not int_able(load_axial)):
        raise InvalidInputTypeError(
            "Load.Axial", "str where str can be converted to int")

    load_moment = input_values["Load.Moment"]
    if not isinstance(load_moment, str) or not int_able(load_moment):
        raise InvalidInputTypeError("Load.Moment", "str where str can be converted to int")

    load_shear = input_values["Load.Shear"]
    if (not isinstance(load_shear, str)
            or not int_able(load_shear)):
        raise InvalidInputTypeError(
            "Load.Shear", "str where str can be converted to int")

    if not isinstance(input_values["Material"], str):
        raise InvalidInputTypeError("Material", "str")

    if not isinstance(input_values["Member.Designation"], str):
        raise InvalidInputTypeError("Member.Designation", "str")

    if not isinstance(input_values["Member.Material"], str):
        raise InvalidInputTypeError("Member.Material", "str")

    if not isinstance(input_values["Module"], str):
        raise InvalidInputTypeError("Module", "str")


def create_cover_plate_bolted_module(module_class):
    """Create an instance of the given cover-plate module design class and set it up for use."""
    module = module_class()
    module.set_osdaglogger(None, id="web")
    return module


def create_cover_plate_bolted_from_input(module_class, input_values):
    """Create an instance of the given cover-plate module design class from input values."""
    try:
        module = create_cover_plate_bolted_module(module_class)
    except Exception as e:
        print('e in create_module : ', e)
        print('error in creating module')

    try:
        print("INPUT SET FOR FINAL OUTPUT", input_values)
        module.set_input_values(input_values)
    except Exception as e:
        traceback.print_exc()
        print('e in set_input_values : ', e)
        print('error in setting the input values')

    return module


def generate_cover_plate_bolted_output(module_class, input_values):
    """Generate, format and return the output values for a beam/column cover-plate bolted design."""
    output = {}
    module = create_cover_plate_bolted_from_input(module_class, input_values)

    raw_output_text = module.output_values(True)
    raw_member_capacity = module.member_capacityoutput(True)
    flange_bolt_capacity_raw = module.flange_bolt_capacity(True)
    web_bolt_capacity_raw = module.web_bolt_capacity(True)
    flange_capacity_raw = module.flangecapacity(True)
    web_capacity_raw = module.webcapacity(True)
    flange_spacing_raw = module.flangespacing(True)
    web_spacing_raw = module.webspacing(True)

    raw_flange_bolt_capacity = [
        (f"{key}_flange_bolt_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in flange_bolt_capacity_raw
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_web_bolt_capacity = [
        (f"{key}_web_bolt_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in web_bolt_capacity_raw
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_flange_capacity = [
        (f"{key}_flange_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in flange_capacity_raw
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_web_capacity = [
        (f"{key}_web_capacity", label, typ, value, visible if len(item) == 5 else True)
        for item in web_capacity_raw
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_flange_spacing = [
        (f"{key}_flange_spacing", label, typ, value, visible if len(item) == 5 else True)
        for item in flange_spacing_raw
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_web_spacing = [
        (f"{key}_web_spacing", label, typ, value, visible if len(item) == 5 else True)
        for item in web_spacing_raw
        if len(item) >= 4 and item[0] and item[2] == "TextBox"
        for (key, label, typ, value, *rest) in [item]
        for visible in [rest[0] if rest else True]
    ]

    raw_csv = build_raw_output_dict(
        raw_output_text + raw_member_capacity + flange_bolt_capacity_raw +
        web_bolt_capacity_raw + flange_capacity_raw + web_capacity_raw +
        flange_spacing_raw + web_spacing_raw
    )

    from osdag_core.custom_logger import CustomLogger
    if hasattr(module, "logger") and isinstance(module.logger, CustomLogger):
        logs = module.logger.get_logs() or []
    else:
        logs = getattr(module, "logs", []) or []
    raw_output = (
        raw_output_text +
        raw_member_capacity +
        raw_flange_bolt_capacity +
        raw_web_bolt_capacity +
        raw_flange_capacity +
        raw_web_capacity +
        raw_flange_spacing +
        raw_web_spacing
    )
    for param in raw_output:
        if param[2] == "TextBox":
            key = param[0]
            label = param[1]
            value = param[3]
            output[key] = {
                "key": key,
                "label": label,
                "val": value
            }
    try:
        logs = list(reversed(logs))
    except Exception:
        pass
    return output, logs, raw_csv


def write_cover_plate_cad_output(model, section, session, part_names, part_files, export_formats=None):
    """Shared BREP/STL/manifest/export-writing tail for cover-plate create_cad_model.

    This portion of create_cad_model is byte-identical between the beam/beam
    and column/column bolted (and welded) cover-plate adapters; only the
    section-validation and per-part shape-building logic before this point
    differs between them.
    """
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    if not os.path.exists(cad_models_path):
        print('path does not exists cad_models , creating one')
        os.makedirs(cad_models_path, exist_ok=True)

    print('2d model : ', model)
    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name
    print('brep file path in create_cad_model : ', file_path)

    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())

        try:
            stl_rel = file_path.replace(".brep", ".stl")
            full_stl = os.path.join(os.getcwd(), stl_rel)
            write_stl(model, full_stl)
            print(f"STL file saved at {full_stl}")
        except Exception as stle:
            print(f"Warning: Failed to save STL at {file_path}: {stle}")

        if section == "Model":
            try:
                import json
                manifest = {
                    "session": session,
                    "mergedBrep": file_path,
                    "parts": [
                        {"name": name, "brepPath": part_files.get(name)} for name in part_names if part_files.get(name)
                    ]
                }
                for entry in manifest["parts"]:
                    if entry.get("brepPath"):
                        entry["stlPath"] = entry["brepPath"].replace(".brep", ".stl")
                manifest_path = file_path.replace(".brep", ".parts.json")
                full_manifest_path = os.path.join(os.getcwd(), manifest_path)
                with open(full_manifest_path, "w", encoding="utf-8") as mf:
                    json.dump(manifest, mf)
                print(f"Parts manifest saved at {full_manifest_path}")
            except Exception as me:
                print(f"Warning: Failed to write manifest: {me}")

            export_formats_lc = {f.lower() for f in export_formats} if export_formats else set()

            if export_formats_lc:
                try:
                    from apps.core.utils.cad_export import export_step, export_iges

                    if "step" in export_formats_lc:
                        step_rel = file_path.replace(".brep", ".step")
                        export_step(model, os.path.join(os.getcwd(), step_rel))
                    if "iges" in export_formats_lc:
                        iges_rel = file_path.replace(".brep", ".iges")
                        export_iges(model, os.path.join(os.getcwd(), iges_rel))
                except Exception as e:
                    print(f"Warning: Optional STEP/IGES export failed: {e}")

    except Exception as e:
        print('Writing to BREP/STL file failed e : ', e)

    return file_path

