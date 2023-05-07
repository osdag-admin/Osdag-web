# -*- coding: utf-8 -*-

# Macro Begin: /home/aditya/snap/freecad/common/open_brep_file.FCMacro +++++++++++++++++++++++++++++++++++++++++++++++++
import FreeCAD
import Part
import Mesh
import sys
import os
if len(sys.argv) < 3:
   print('Error: No output path argument provided')
   sys.exit()

# Retrieve the path argument
path = sys.argv[2]
output_filename = sys.argv[3]
# Gui.runCommand('Std_DlgMacroRecord',0)
### Begin command Std_Open
#Part.open(u"/home/aditya/fin_plate_brep_postman.brep")
# App.setActiveDocument("fin_plate_brep_postman1")
# App.ActiveDocument=App.getDocument("fin_plate_brep_postman1")
# Gui.ActiveDocument=Gui.getDocument("fin_plate_brep_postman1")
# Gui.SendMsgToActiveView("ViewFit")
### End command Std_Open
# Gui.runCommand('Std_Export',0)
# Gui.Selection.addSelection('fin_plate_brep_postman1','fin_plate_brep_postman')
### Begin command Std_Export
#__objs__=[]
#__objs__.append(FreeCAD.getDocument("fin_plate_brep_postman1").getObject("fin_plate_brep_postman"))
#importOBJ.export(__objs__,u"/home/aditya/fin_plate_brep_postman2-fin_plate_brep_postman.obj")

#del __objs__
### End command Std_Export
# Macro End: /home/aditya/snap/freecad/common/open_brep_file.FCMacro +++++++++++++++++++++++++++++++++++++++++++++++++
# Gui.runCommand('Std_DlgMacroRecord',0)
# Gui.Selection.addSelection('r','beam_fin_plate')
### Begin command Std_Export
#print(type(path))
print('The path of the brep file',path)
Part.open(path)
#FreeCAD.openDocument('/home/aditya/fin_plate_.FCStd')
doc = FreeCAD.activeDocument()
print(doc.Label)
doc_name = doc.Label
__objs__=[]
for objz in doc.Objects:
    print(objz.Name)
    print(doc_name)
    print("Inside For")
    #if objz.Name == doc_name:
    print("Inside if")
        # Export the object to gltf for
    __objs__.append(objz)
    break  # Stop looping once you find the object
print('This is the file to which we export',output_filename)
Mesh.export(__objs__,output_filename)
del __objs__
