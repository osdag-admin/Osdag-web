"""
Shared utilities for moment connection modules
"""
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from osdag_core.Common import *


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

