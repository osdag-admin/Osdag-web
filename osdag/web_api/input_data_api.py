"""
    This file includes the Input Values API
    InputValues API (class InputValues(View)):
        Update input values in database.
        Accepts POST requests.
        Accepts content_type application/json
        Request must provide session cookie id.
"""
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

# Author: Aaranyak Ghosh

""" 
Bolt.Bolt_Hole_Type: Standard
Bolt.Diameter:
- '12'
- '16'
- '20'
- '24'
- '30'
Bolt.Grade:
- '4.6'
- '4.8'
- '5.6'
- '6.8'
- '8.8'
Bolt.Slip_Factor: '0.3'
Bolt.TensionType: Pre-tensioned
Bolt.Type: Friction Grip Bolt
Connectivity: Column Flange-Beam Web
Connector.Material: E 350 (Fe 490)
Connector.Plate.Thickness_List:
- '10'
- '12'
- '16'
- '18'
- '20'
Design.Design_Method: Limit State Design
Detailing.Corrosive_Influences: 'No'
Detailing.Edge_type: Rolled, machine-flame cut, sawn and planed
Detailing.Gap: '15'
Load.Axial: '50'
Load.Shear: '180'
Material: E 250 (Fe 410 W)A
Member.Supported_Section.Designation: MB 350
Member.Supported_Section.Material: E 250 (Fe 410 W)A
Member.Supporting_Section.Designation: HB 450
Member.Supporting_Section.Material: E 250 (Fe 410 W)A
Module: Fin Plate Connection
Weld.Fab: Shop Weld
Weld.Material_Grade_OverWrite: '410'
out_titles_status:
- 1
- 1
- 1
- 1
 """


""" 
{
    "Bolt.Bolt_Hole_Type" : "Stanard",
    "Bolt.Diameter" : "12",
    "Bolt.Grade" : "4.6",
    "Bolt.Slip_Factor" : "0.3",
    "Bolt.TensionType" : "Pre-tensioned",
    "Bolt.Type" : "Grip Bolt",
    "Connectivity" : "Flange-Beam Web",
    "Connector.Material" : "E 350 (Fe 490)",
    "Design.Design_Method" : "Limit State Design",
    "Detailing.Corrosive_Influences" : "No",
    "Detailing.Edge_type" : "Rolled",
    "Detailing.Gap" : "15",
    "Load.Axial" : "50",
    "Load.Shear" : "50",
    "Material" : "E 250 (Fe 410 W)A",
    "Member.Supported_Section.Designation" : "MB 350",
    "Member.Supported_Section.Material" : "E 250 (Fe 410 W)A",
    "Member.Supporting_Section.Designation" : "HB 450",
    "Member.Supporting_Section.Material" : "E 250 (Fe 410 W)A",
    "Module" : "Fin Plate Connection",
    "Weld.Fab" : "Shop Weld",
    "Weld.Material_Grade_OverWrite" : "410",
    "Connector.Plate.Thickness_List" : "10",
} 
"""

"""
{
    "Bolt.Bolt_Hole_Type" : "Standard",
    "Bolt.Diameter" : ["12" , "16" , "20" , "24" , "30"],
    "Bolt.Grade" : ["4.6" , "4.8" , "5.6" , "6.8" , "8.8"],
    "Bolt.Slip_Factor" : "0.3",
    "Bolt.TensionType" : "Pre-tensioned",
    "Bolt.Type" : "Grip Bolt",
    "Connectivity" : "Flange-Beam Web",
    "Connector.Material" : "E 350 (Fe 490)",
    "Design.Design_Method" : "Limit State Design",
    "Detailing.Corrosive_Influences" : "No",
    "Detailing.Edge_type" : "Rolled",
    "Detailing.Gap" : "15",
    "Load.Axial" : "50",
    "Load.Shear" : "50",
    "Material" : "E 250 (Fe 410 W)A",
    "Member.Supported_Section.Designation" : "MB 350",
    "Member.Supported_Section.Material" : "E 250 (Fe 410 W)A",
    "Member.Supporting_Section.Designation" : "HB 450",
    "Member.Supporting_Section.Material" : "E 250 (Fe 410 W)A",
    "Module" : "Fin Plate Connection",
    "Weld.Fab" : "Shop Weld",
    "Weld.Material_Grade_OverWrite" : "410",
    "Connector.Plate.Thickness_List" : ["10" , "12" , "16" , "18" , "20"]
}

"""


@method_decorator(csrf_exempt, name='dispatch')
class InputValues(View):
    """
        Update input values in database.
        InputValues API (class InputValues(View)):
            Accepts POST requests.
            Accepts content_type application/json
            Request must provide session cookie id.
    """
    def post(self, request: HttpRequest):
        cookie_id = request.COOKIES.get("design_session") # Get design session id.
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return HttpResponse("Error: Please open module", status=400) # Returns error response.
        if not Design.objects.filter(cookie_id=cookie_id).exists(): # Error Checking: If design session exists.
            return HttpResponse("Error: This design session does not exist", status=404) # Return error response.
        if not request.content_type == "application/json": # Error checking: If content/type is not json.
            return HttpResponse("Error: Content type has to be text/json", status=400) # Return error response.
        try: # Error checking while loading body.
            body_unicode = request.body.decode('utf-8')
            input_data = json.loads(body_unicode)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        try: # Error checking while getting module api
            design_session = Design.objects.get(cookie_id=cookie_id) # Get the design session from the db.
            module_api = get_module_api(design_session.module_id) # Get the module api using the module id.
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        try:
            module_api.validate_input(input_data) # Check if input data is valid.
        except OsdagApiException as e: # Catch input validation error.
            return HttpResponse("Error: " + repr(e), status=400) # Return error response
        except Exception as e: # Catch other error.
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        try: # Error checking while saving input values
            json_data = json.dumps(input_data) # Convert dict to json string
            Design.objects.filter(cookie_id=cookie_id).update(input_values=json_data)
            Design.objects.filter(cookie_id=cookie_id).update(current_state=True)
        except Exception as e:
            return HttpResponse("Error: Internal server error: " + repr(e), status=500) # Return error response
        response = HttpResponse(status=200) # Status code 200 - Success!
        return response