"""
Shared utilities for tension member modules
"""
import os
import json
import traceback

from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from osdag_core.Common import *
from OCC.Core import BRepTools
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder

from apps.core.utils import InvalidInputTypeError, write_stl


def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObject before generating CAD"""
    print('SETTING UP FOR CAD', module_class)
    cdl.module_class = module_class  # Set the module class in design logic object.
    cdl.module_object = module_class  # Set the module object (required by common_logic.py)
    module_object = module_class
    print(module_object.module)
    if module_object.module == "Tension-Member-Bolted-Design" or module_object.module == "Tension-Member-Welded-Design":
        cdl.TObj = cdl.createTensionCAD()


def fuse_shapes(shapes):
    """Fuse a list of shapes into one. Returns None if the list is empty."""
    from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
    if not shapes:
        return None
    res = shapes[0]
    for item in shapes[1:]:
        res = BRepAlgoAPI_Fuse(res, item).Shape()
    return res


def create_cad_model(module, key_disp, get_connector_shape, section: str, session: str, export_formats=None) -> str:
    """Shared CAD-generation logic for tension member submodules (bolted, welded).

    get_connector_shape(t_obj) builds the "Connector" part shape and is the
    one piece that differs between submodules (bolts vs. weld).
    """
    if section not in ("Model", "Member", "Plate", "Connector"):
        raise InvalidInputTypeError("section", "'Model', 'Member', 'Plate', or 'Connector'")

    # Object that will create the CAD model.
    try:
        cld = CommonDesignLogic(None, None, '', key_disp, module.mainmodule)
    except Exception as e:
        print('error in cld e : ', e)
        raise

    try:
        # Setup the calculations object for generating CAD model.
        setup_for_cad(cld, module)
    except Exception as e:
        traceback.print_exc()
        print('Error in setting up cad e : ', e)
        raise

    # The section of the module that will be generated.
    cld.component = section

    # When section == "Model", also ensure per-part shapes exist and prepare a compound
    part_names = ["Member", "Plate", "Connector"]
    part_files = {}
    compound_model = None

    try:
        def get_part_shape(part_name, cld):
            t_obj = cld.TObj
            if part_name == "Member":
                return t_obj.get_members_models()
            elif part_name == "Plate":
                shapes = []
                if hasattr(t_obj, "get_plates_models"):
                    p = t_obj.get_plates_models()
                    if p is not None:
                        shapes.append(p)
                if hasattr(t_obj, "get_end_plates_models"):
                    ep = t_obj.get_end_plates_models()
                    if ep is not None:
                        shapes.append(ep)
                return fuse_shapes(shapes)
            elif part_name == "Connector":
                return get_connector_shape(t_obj)
            return None

        if section == "Model":
            # Build compound by adding each part shape without fusing
            builder = BRep_Builder()
            compound = TopoDS_Compound()
            builder.MakeCompound(compound)

            for part in part_names:
                try:
                    # Generate shape for this part
                    part_shape = get_part_shape(part, cld)
                    if part_shape is None:
                        continue

                    # Add to compound
                    builder.Add(compound, part_shape)

                    # Ensure per-part BREP file exists (write or overwrite)
                    part_file_name = f"{session}_{part}.brep"
                    part_file_path_rel = os.path.join("file_storage", "cad_models", part_file_name)
                    BRepTools.breptools.Write(part_shape, part_file_path_rel, Message_ProgressRange())
                    part_files[part] = part_file_path_rel
                    # Also write STL for this part
                    try:
                        part_stl_rel = part_file_path_rel.replace(".brep", ".stl")
                        write_stl(part_shape, os.path.join(os.getcwd(), part_stl_rel))
                    except Exception as stle:
                        print(f"Failed to write STL for part {part}: {stle}")
                except Exception as e:
                    print(f"Failed to build/write part {part}: {e}")

            compound_model = compound
        # Generate model for non-Model sections (or fallback)
        if compound_model is not None:
            model = compound_model
        else:
            model = get_part_shape(section, cld)
    except Exception as e:
        print("Error in cld.create2Dcad() e : ", e)
        raise

    # check if the cad_models folder exists or not
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    if not os.path.exists(cad_models_path):
        print("path does not exists cad_models , creating one")
        os.makedirs(cad_models_path, exist_ok=True)

    file_name = session + "_" + section + ".brep"
    file_path = "file_storage/cad_models/" + file_name

    try:
        BRepTools.breptools.Write(model, file_path, Message_ProgressRange())

        # If it's "Model" section, write a manifest referencing per-part breps and save extra formats
        if section == "Model":
            export_formats_lc = {f.lower() for f in export_formats} if export_formats else set()
            try:
                manifest = {
                    "session": session,
                    "mergedBrep": file_path,
                    "parts": [
                        {"name": name, "brepPath": part_files.get(name)} for name in part_names if part_files.get(name)
                    ]
                }
                # add stlPath for parts
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

            # Optional on-demand STEP/IGES exports (only when frontend requests them)
            try:
                if export_formats_lc:
                    from apps.core.utils.cad_export import export_step, export_iges
                    if "step" in export_formats_lc:
                        step_rel = file_path.replace(".brep", ".step")
                        export_step(model, os.path.join(os.getcwd(), step_rel))
                    if "iges" in export_formats_lc:
                        iges_rel = file_path.replace(".brep", ".iges")
                        export_iges(model, os.path.join(os.getcwd(), iges_rel))
            except Exception as e:
                print(f"Warning: Optional STEP/IGES export failed: {e}")
            # Write merged STL for Model
            try:
                merged_stl_rel = file_path.replace(".brep", ".stl")
                write_stl(model, os.path.join(os.getcwd(), merged_stl_rel))
                print(f"STL file saved at {os.path.join(os.getcwd(), merged_stl_rel)}")
            except Exception as stle:
                print(f"Warning: Failed to save merged STL: {stle}")
    except Exception as e:
        print('Writing to BREP file failed e : ', e)
        raise

    # For non-Model sections, export single STL next to BREP
    if section != "Model":
        try:
            single_stl_rel = file_path.replace(".brep", ".stl")
            write_stl(model, os.path.join(os.getcwd(), single_stl_rel))
            print(f"STL file saved at {os.path.join(os.getcwd(), single_stl_rel)}")
        except Exception as stle:
            print(f"Warning: Failed to save STL for {section}: {stle}")

    return file_path
