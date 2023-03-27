from cad.common_logic import CommonDesignLogic
from osdag_api.modules.fin_plate_connection import *
from OCC.Core.StlAPI import StlAPI_Writer
from OCC.Display.backend import *
from PyQt5.QtGui import *
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
import pprint
import json
from Common import *
design_dict = {
    "Bolt.Bolt_Hole_Type": "Standard",
    "Bolt.Diameter": ['8','10','12','16','20','24','30','36','42','48','56','64','14','18','22','27','33','39','45','52','60'],
    "Bolt.Grade": ['3.6','4.6','4.8','5.6','5.8','6.8','8.8','9.8','10.9','12.9'],
    "Bolt.Slip_Factor": '0.3',
    "Bolt.TensionType": "Pretensioned",
    "Bolt.Type": "Bearing Bolt",
    "Connectivity": "Column Flange-Beam Web",
    "Connector.Material": "E 250 (Fe 410 W)A",
    "Design.Design_Method": "Limit State Design",
    "Detailing.Corrosive_Influences": 'No',
    "Detailing.Edge_type": "Sheared or hand flame cut",
    "Detailing.Gap": '10',
    "Load.Axial": '30',
    "Load.Shear": '10',
    "Material": "E 250 (Fe 410 W)A",
    "Member.Supported_Section.Designation": "JB 150",
    "Member.Supported_Section.Material": "E 250 (Fe 410 W)A",
    "Member.Supporting_Section.Designation": "HB 150",
    "Member.Supporting_Section.Material": "E 250 (Fe 410 W)A",
    "Module": "Fin Plate Connection",
    "Weld.Fab": "Shop Weld",
    "Weld.Material_Grade_OverWrite": '410',
    "Connector.Plate.Thickness_List":['8','10','12','14','16','18','20','22','25','28','32','36','40','45','50','56','63','75','80','90','100','110','120']
}
app = QApplication(["-v"])
fp = create_from_input(design_dict)
used_backend = load_backend(None)
if 'qt' in used_backend:
    from OCC.Display.qtDisplay import qtViewer3d
    QtCore, QtGui, QtWidgets, QtOpenGL = get_qt_modules()
dummyview = qtViewer3d()
dummyview.InitDriver()
display = dummyview._display
print(display)
print(fp.connectivity)
commonLogic = CommonDesignLogic(display, '', fp.module, fp.mainmodule)
commonLogic.display = display
commonLogic.call_3DModel(True, fp)
commonLogic.component = "Model"
fuse_model = commonLogic.create2Dcad()
os.system("clear")
stl_writer = StlAPI_Writer()
stl_writer.SetASCIIMode(False)
print(repr(stl_writer.Write(fuse_model, "/home/aaranyak/Downloads/stl_file.stl")))