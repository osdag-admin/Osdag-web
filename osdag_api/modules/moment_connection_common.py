from cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from Common import *
def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObjct before generating CAD"""
    print('SETTING UP FOR CAD', module_class)
    cdl.module_class = module_class # Set the module class in design logic object.
    print("******")
    module_object = module_class
    print("********")
    if module_object.module == "Beam-to-Beam Cover Plate Bolted Connection": # If module is cover plate bolted then'.
        cdl.CPObj = cdl.createBBCoverPlateCAD() # IDK what this does, I guess it creates the connection object.
    if module_object.module == "Beam-to-Beam End Plate Connection":
        cdl.CPObj = cdl.createBBEndPlateCAD()
    if module_object.module == "Beam-to-Beam Cover Plate Welded Connection":
        cdl.CPObj = cdl.createBBCoverPlateCAD()
    if module_object.module == "Beam-to-Column End Plate Connection":
        cdl.CPObj = cdl.createBCEndPlateCAD() # Initialize the CAD object for beam-column end plate
