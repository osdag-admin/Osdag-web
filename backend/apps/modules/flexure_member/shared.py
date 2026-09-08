"""
Shared utilities for flexure member modules
"""
import os
import traceback

from backend.apps.modules.simple_connection.shared import setup_for_cad
from OCC.Core.BRep import BRep_Builder
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRepTools import breptools_Write
from osdag_core.cad.common_logic import CommonDesignLogic

from apps.core.utils import write_stl


def create_cad_model(module, key_disp, section: str, session: str, get_shapes, no_shapes_message: str = "No components returned") -> str:
    """Shared CAD-generation logic for flexure member submodules
    (on_cantilever, simply_supported_beam, purlin).

    get_shapes(cld) builds and returns the list of part shapes for this
    submodule and is the one piece that differs between them.
    """
    module.module = key_disp
    module.mainmodule = "Flexure Member"

    # Initialize CAD logic
    try:
        cld = CommonDesignLogic(None, None, "", key_disp, module.mainmodule)
        setup_for_cad(cld, module)
        cld.module_object = module
    except Exception:
        traceback.print_exc()
        return ""

    # Generate the submodule-specific part shape(s)
    try:
        shapes = get_shapes(cld)
    except Exception:
        traceback.print_exc()
        return ""

    if not shapes:
        print(no_shapes_message)
        return ""

    # Combine shapes into a single compound
    try:
        builder = BRep_Builder()
        compound = TopoDS_Compound()
        builder.MakeCompound(compound)

        for shape in shapes:
            if shape is not None:
                builder.Add(compound, shape)

        model = compound
    except Exception:
        traceback.print_exc()
        return ""

    # Ensure output directory exists
    cad_models_path = os.path.join(os.getcwd(), "file_storage", "cad_models")
    os.makedirs(cad_models_path, exist_ok=True)

    file_name = f"{session}_{section}.brep"
    file_path = os.path.join("file_storage", "cad_models", file_name)
    full_path = os.path.join(os.getcwd(), file_path)

    # Write BREP
    try:
        breptools_Write(model, full_path)
    except Exception:
        traceback.print_exc()
        return ""

    # Write STL (optional, non-critical)
    try:
        stl_path = full_path.replace(".brep", ".stl")
        write_stl(model, stl_path)
    except Exception as stle:
        print("STL write warning:", stle)

    return file_path
