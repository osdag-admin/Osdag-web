from cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from Common import *

def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObject before generating CAD"""
    print('SETTING UP FOR CAD', module_class)
    cdl.module_class = module_class  # Set the module class in design logic object.
    module_object = module_class
    print(module_object.module)
    if module_object.module == "Bolted Tension Member Design":
        cdl.TObj = cdl.createTensionCAD()
