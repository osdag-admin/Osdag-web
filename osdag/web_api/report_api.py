from django.shortcuts import render, redirect
from django.utils.html import escape, urlencode
from django.http import HttpResponse, HttpRequest
from django.views import View
from osdag.models import Design
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from osdag_api import developed_modules, get_module_api
from osdag_api.errors import OsdagApiException
import typing
import json
import os
from design_type.connection.fin_plate_connection import FinPlateConnection
from gui.ui_template import Window, Ui_ModuleWindow
from Common import *

# Author: Pallav Sharma

@method_decorator(csrf_exempt, name='dispatch')
class DesignReport(View):
    """
        Update input values in database.
            Output Values API (class OutputValues(View)):
                Accepts GET requests.
                Returns content_type application/json
                Request must provide session cookie id.
                Data Format: (json): {
                    "Bolt.Pitch": 
                        "key": "Bolt.Pitch",
                        "label": "Pitch Distance (mm)"
                        "value": 40
                    }
                }
    """
    def get(self, request: HttpRequest):
        cookie_id = request.COOKIES.get("design_session") # Get design session id.
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return HttpResponse("Error: Please open module", status=400) # Returns error response.
        if not Design.objects.filter(cookie_id=cookie_id).exists(): # Error Checking: If design session exists.
            return HttpResponse("Error: This design session does not exist", status=404) # Return error response.
        try: # Error checking while loading input data
            design_session = Design.objects.get(cookie_id=cookie_id) # Get session object from db.
            module_api = get_module_api(design_session.module_id) # Get module api
            if not design_session.current_state: # Error Checking: If input data not entered.
                return HttpResponse("Error: Please enter input data first", status=409) # Return error response.
            input_values = json.loads(design_session.input_values) # Load input data into dictionary.
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.
        try: # Error checking while calculating output data.
            output_values = module_api.generate_ouptut(input_values)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.
        try: # Error checking while formatting output as json.
            output_data = json.dumps(output_values)
            fp = FinPlateConnection()
            fp.set_osdaglogger(None)
            design_dict=input_values
            #input_values has the following parameters
            # design_dict = {
            #     "Bolt.Bolt_Hole_Type": "Standard",
            #     "Bolt.Diameter": ['8','10','12','16','20','24','30','36','42','48','56','64','14','18','22','27','33','39','45','52','60'],
            #     "Bolt.Grade": ['3.6','4.6','4.8','5.6','5.8','6.8','8.8','9.8','10.9','12.9'],
            #     "Bolt.Slip_Factor": '0.3',
            #     "Bolt.TensionType": "Pretensioned",
            #     "Bolt.Type": "Bearing Bolt",
            #     "Connectivity": "Column Flange-Beam Web",
            #     "Connector.Material": "E 250 (Fe 410 W)A",
            #     "Design.Design_Method": "Limit State Design",
            #     "Detailing.Corrosive_Influences": 'No',
            #     "Detailing.Edge_type": "Sheared or hand flame cut",
            #     "Detailing.Gap": '10',
            #     "Load.Axial": '30',
            #     "Load.Shear": '10',
            #     "Material": "E 250 (Fe 410 W)A",
            #     "Member.Supported_Section.Designation": "JB 150",
            #     "Member.Supported_Section.Material": "E 250 (Fe 410 W)A",
            #     "Member.Supporting_Section.Designation": "HB 150",
            #     "Member.Supporting_Section.Material": "E 250 (Fe 410 W)A",
            #     "Module": "Fin Plate Connection",
            #     "Weld.Fab": "Shop Weld",
            #     "Weld.Material_Grade_OverWrite": '410',
            #     "Connector.Plate.Thickness_List":['8','10','12','14','16','18','20','22','25','28','32','36','40','45','50','56','63','75','80','90','100','110','120']

            # }

            inputval = fp.set_input_values(design_dict)
            os.system("clear")
            outputval = fp.output_values(True)
            caps = fp.capacities(True)
            popup_summary = {'ProfileSummary': {'CompanyName': 'Daredevil Developers', 'CompanyLogo': '', 'Group/TeamName':
                'Web Development Teams', 'Designer': 'Gyrnaskha Aahoa'},'ProjectTitle': 'Osdag on Web', 'Subtitle': '', 'JobNumber': '0',
                            'AdditionalComments': 'No comments', 'Client': 'The No Name Guy', "filename": "design_report", "does_design_exist": False, "logger_messages": ""}
            fp.save_design(popup_summary=popup_summary)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.
        try:
            with open('design_report.pdf', 'rb') as pdf_file:
                pdf_content = pdf_file.read()
        except Exception as e:
                  return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response.  
        response = HttpResponse(status=200,content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="design_report.pdf"'
        response.write(pdf_content)
        return response