from osdag_api.modules.fin_plate_connection import *
import os
import json
input_values = {
    "Bolt.Bolt_Hole_Type" : "Standard",
    "Bolt.Diameter" : ["12" , "16" , "20" , "24" , "30"],
    "Bolt.Grade" : ["4.8" , "5.6" , "5.8" , "8.8", "6.8"],
    "Bolt.Slip_Factor" : "0.3",
    "Bolt.TensionType" : "Pre-tensioned",
    "Bolt.Type" : "Friction Grip Bolt",
    "Connectivity" : "Column Flange-Beam Web",
    "Connector.Material" : "E 250 (Fe 410 W)A",
    "Design.Design_Method" : "Limit State Design",
    "Detailing.Corrosive_Influences" : "No",
    "Detailing.Edge_type" : "Rolled",
    "Detailing.Gap" : "15",
    "Load.Axial" : "50",
    "Load.Shear" : "180",
    "Material" : "E 250 (Fe 410 W)A",
    "Member.Supported_Section.Designation" : "MB 300",
    "Member.Supported_Section.Material" : "E 250 (Fe 410 W)A",
    "Member.Supporting_Section.Designation" : "HB 200",
    "Member.Supporting_Section.Material" : "E 250 (Fe 410 W)A",
    "Module" : "Fin Plate Connection",
    "Weld.Fab" : "Shop Weld",
    "Weld.Material_Grade_OverWrite" : "410",
    "Connector.Plate.Thickness_List" : ["10" , "12" , "16" , "18" , "20"],
}
print(generate_output(input_values))