"""
Shared utilities for tension member modules
"""
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from osdag_core.Common import *


def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObject before generating CAD"""
    print('SETTING UP FOR CAD', module_class)
    cdl.module_class = module_class  # Set the module class in design logic object.
    cdl.module_object = module_class  # Set the module object (required by common_logic.py)
    module_object = module_class
    print(module_object.module)
    if module_object.module == "Tension-Member-Bolted-Design" or module_object.module == "Tension-Member-Welded-Design":
        cdl.TObj = cdl.createTensionCAD()

