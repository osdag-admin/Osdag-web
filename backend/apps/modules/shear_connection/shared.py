"""
Shared utilities for shear connection modules
"""
from osdag_core.cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from osdag_core.Common import *


def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObjct before generating CAD"""
    print("****")
    cdl.module_class = module_class # Set the module class in design logic object.
    cdl.module_object = module_class # Set the module object (required by common_logic.py)
    print("******")
    module_object = module_class
    print("********")
    cdl.loc = module_object.connectivity # Set the connectivity of the module in the design logic object.
    if cdl.loc == CONN_CWBW: # If connection type is 'Column Web-Beam Web'.
        cdl.connectivityObj = cdl.create3DColWebBeamWeb() # IDK what this does, I guess it creates the connection object.
    elif cdl.loc == CONN_CFBW: # If connection type is 'Column Flange-Beam Web'.
        cdl.connectivityObj = cdl.create3DColFlangeBeamWeb() # IDK what this does, I guess it creates the connection object.
    else: # If it is none of them,
        cdl.connectivityObj = cdl.create3DBeamWebBeamWeb() # I guess it creates the last type of connection.


