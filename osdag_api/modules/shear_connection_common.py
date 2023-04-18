from cad.common_logic import CommonDesignLogic
from OCC.Display.backend import *
from Common import *
def setup_for_cad(cdl: CommonDesignLogic, module_class):
    """Sets up the CommonLogicObjct before generating CAD"""
    cdl.module_class = module_class # Set the module class in design logic object.
    module_object = module_class()
    cdl.loc = module_object.connectivity # Set the connectivity of the module in the design logic object.
    if cdl.loc == CONN_CWBW: # If connection type is 'Column Web-Beam Web'.
        cdl.connectivityObj = cdl.create3DColWebBeamWeb() # IDK what this does, I guess it creates the connection object.
    if cdl.loc == CONN_CFBW: # If connection type is 'Column Flange-Beam Web'.
        cdl.connectivityObj = cdl.create3DColFlangeBeamWeb() # IDK what this does, I guess it creates the connection object.
    else: # If it is none of them,
        cdl.connectivityObj =cdl.create3DBeamWebBeamWeb() # I guess it creates the last type of connection.


