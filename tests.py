import os
from design_type.connection.fin_plate_connection import FinPlateConnection
from gui.ui_template import Window, Ui_ModuleWindow
from Common import *

fp = FinPlateConnection()
fp.set_osdaglogger(None)
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

inputval = fp.set_input_values(design_dict)
os.system("clear")
outputval = fp.output_values(True)
for i in outputval:
    if i[2] == "TextBox":
        pass # print(i[1] + ":", i[3])
    else:
        print(i[0], "(" + i[2] + ")", "=", i[3])
caps = fp.capacities(True)
for i in caps:
    print(i)
popup_summary = {'ProfileSummary': {'CompanyName': 'Daredevil Developers', 'CompanyLogo': '', 'Group/TeamName':
    'Web Development Teams', 'Designer': 'Gyrnaskha Aahoa'},'ProjectTitle': 'Osdag on Web', 'Subtitle': '', 'JobNumber': '0',
                 'AdditionalComments': 'No comments', 'Client': 'The No Name Guy', "filename": "/home/aaranyak/School_Work_Grade_9/Internship/Osdag_Dev/osdag_web/file_storage/design_reports/report_tes", "does_design_exist": False, "logger_messages": ""}
fp.save_design(popup_summary=popup_summary)
