from django.test import TestCase
from django.conf import settings
import json

# importing data
from ..data.design_types import design_type_data, connections_data, shear_connection, moment_connection, b2b_splice, b2column, c2c_splice, base_plate, tension_member

#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################


# Create your tests here.
class APITest(TestCase) : 

    def test_setUp(self) : 
        static_url = '/static/'
        self.assertEqual(settings.STATIC_URL , static_url)

        allow_origins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5175',
            'http://192.168.1.9:5173',
            'http://10.104.135.9:5173',
            'http://10.186.46.253:5173'
        ]
        self.assertEqual(settings.CORS_ALLOWED_ORIGINS, allow_origins)
        

    ### TESTING MAIN WINDOW API ###
    """ VALID """
    def test_valid_window(self) : 
        response = self.client.get("/osdag-web/")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')

        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : design_type_data})

    """ INVALID """
    def test_invalid_window(self) : 
        response = self.client.get("/osdag-web")
        self.assertTrue(response.status_code!=200)  # 301
        
        response = self.client.get("/osdag_web/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag_web")
        self.assertTrue(response.status_code!=200)  # 301
        

    
    ### TESTING MODULES API ###
    """ VALID """ 
    def test_valid_connection(self) : 
        response = self.client.get("/osdag-web/connections")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')

        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : connections_data})
    
    """ INVALID """
    def test_invalid_connection(self) : 
        response = self.client.get("/osdag-web/connections/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connection/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connection")
        self.assertTrue(response.status_code!=200)  # 301
        
    """ VALID """
    def test_valid_tension_member(self) : 
        response = self.client.get("/osdag-web/tension-member")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : tension_member})
    
    """ INVALID """
    def test_invalid_tension_member(self) : 
        response = self.client.get("/osdag-web/tension-member/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/tension_member")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/tension_member/")
        self.assertTrue(response.status_code!=200)  # 301


    ### TESTING OF CONNECTION SUB MODULES ###
    # 1. shear-connection               
    # 2. moment-connection              
    # 3. base-plate
    #########################################
    """ VALID """
    def test_valid_shear_connection(self) : 
        response = self.client.get("/osdag-web/connections/shear-connection")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : shear_connection})
    
    """ INVALID """
    def test_invalid_shear_connection(self) : 
        response = self.client.get("/osdag-web/connections/shear-connection/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/shear_connections")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/shear_connection")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/shear-connections")
        self.assertTrue(response.status_code!=200)  # 301
    
    """ VALID """
    def test_valid_moment_connection(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : moment_connection})

    """ INVALID """
    def test_invalid_moment_connection(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connections")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment_connection")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment_connections")
        self.assertTrue(response.status_code!=200)  # 301

    """ VALID """
    def test_valid_connection_base_plate(self) : 
        response = self.client.get("/osdag-web/connections/base-plate")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : base_plate})

    """ INVALID """
    def test_invalid_connection_base_plate(self) : 
        response = self.client.get("/osdag-web/connections/base-plate/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/base-plates")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/base_plate")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/base-plates")
        self.assertTrue(response.status_code!=200)  # 301


    ### TESTING OF MODULE CONNECTION SUB MODULES ### 
    # 1. beam-to-beam-splice
    # 2. beam-to-column
    # 3. column-to-column-splice 
    ################################################
    """ VALID """
    def test_valid_moment_connection_beam_to_beam_splice(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/beam-to-beam-splice")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : b2b_splice})

    """ INVALID """
    def test_invalid_moment_connection_beam_to_beam_splice(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/beam-to-beam-splice/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connection/beam_to_beam_splice")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connection/beam_to_beam_splice/")
        self.assertTrue(response.status_code!=200)  # 301

    """ VALID """
    def test_valid_moment_connection_beam_to_column(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/beam-to-column")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : b2column})

    """ INVALID """
    def test_invalid_moment_connection_beam_to_column(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/beam-to-column/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connection/beam_to_column")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connection/beam_to_column/")
        self.assertTrue(response.status_code!=200)  # 301

    """ VALID """
    def test_valid_moment_connection_column_to_column_splice(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/column-to-column-splice")
        response = response.json()
        self.assertEqual(list(response.keys())[0] , 'result')
        response = json.dumps(response)
        self.assertJSONEqual(response , {'result' : c2c_splice})

    """ INVALID """
    def test_invalid_moment_connection_column_to_column_splice(self) : 
        response = self.client.get("/osdag-web/connections/moment-connection/column-to-column-splice/")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connection/column_to_column_splice")
        self.assertTrue(response.status_code!=200)  # 301

        response = self.client.get("/osdag-web/connections/moment-connection/column_to_column_splice/")
        self.assertTrue(response.status_code!=200)  # 301


from unittest.mock import patch
import time
from apps.core.models import Project

class ProjectAPISerializationTests(TestCase):
    @patch('firebase_admin.auth.verify_id_token')
    def test_project_response_no_module_id(self, mock_verify):
        mock_verify.return_value = {
            "uid": "user_123",
            "email": "user@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # 1. Create a project using the API
        post_data = {
            "name": "Test Project",
            "module": "Shear Connection",
            "submodule": "FinPlateConnection"
        }
        r = self.client.post("/api/projects/", data=post_data, content_type="application/json", **headers)
        self.assertEqual(r.status_code, 201)
        project_id = r.json().get("project_id")
        self.assertIsNotNone(project_id)

        # 2. List projects and assert module_id is not in response, but submodule is
        r = self.client.get("/api/projects/", **headers)
        self.assertEqual(r.status_code, 200)
        projects = r.json().get("projects")
        self.assertTrue(len(projects) > 0)
        proj_data = projects[0]
        self.assertNotIn("module_id", proj_data)
        self.assertEqual(proj_data.get("submodule"), "FinPlateConnection")

        # 3. Get project details and assert module_id is not in response, but submodule is
        r = self.client.get(f"/api/projects/{project_id}/", **headers)
        self.assertEqual(r.status_code, 200)
        detail_data = r.json().get("project")
        self.assertNotIn("module_id", detail_data)
        self.assertEqual(detail_data.get("submodule"), "FinPlateConnection")
