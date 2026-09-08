import time
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.cache import cache
from apps.core.models import UserAccount, Project, CustomMaterials
from apps.sections.models import UserCustomBeam

class MyDataTests(TestCase):
    def setUp(self):
        cache.clear()
        # Create a standard user and user account
        self.user = User.objects.create_user(
            username="test_uid_123",
            email="test@example.com",
            password="testpassword"
        )
        self.user_account = UserAccount.objects.create(
            user=self.user,
            username="test_uid_123",
            email="test@example.com"
        )

    @patch('firebase_admin.auth.verify_id_token')
    def test_my_data_listing(self, mock_verify):
        # Create a project
        Project.objects.create(
            name="Project Alpha",
            module="Shear Connection",
            submodule="FinPlateConnection",
            inputs_json={"material": "Fe 410"},
            outputs_json={"status": "pass"},
            user_email="test@example.com"
        )
        # Create a custom material
        CustomMaterials.objects.create(
            user=self.user,
            Grade="Grade E250 Custom",
            Yield_Stress_less_than_20=250,
            Yield_Stress_between_20_and_neg40=240,
            Yield_Stress_greater_than_40=230,
            Ultimate_Tensile_Stress=410,
            Elongation=20
        )
        # Create a custom section
        UserCustomBeam.objects.create(
            user=self.user,
            Designation="Custom_Beam_1",
            Mass=30.0,
            Area=38.0,
            D=250.0,
            B=125.0,
            tw=6.9,
            T=9.7,
            FlangeSlope=98,
            R1=10.0,
            R2=5.0,
            Iz=3000.0,
            Iy=300.0,
            rz=10.0,
            ry=2.8,
            Zz=240.0,
            Zy=48.0,
            Zpz=280.0,
            Zpy=75.0,
            Source="Custom",
            Type="I Section"
        )

        # Setup authentication
        mock_verify.return_value = {
            "uid": "test_uid_123",
            "email": "test@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # Request GET my-data API
        response = self.client.get("/api/auth/my-data/", **headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(len(data.get("projects", [])), 1)
        self.assertEqual(data["projects"][0]["name"], "Project Alpha")
        
        self.assertEqual(len(data.get("custom_materials", [])), 1)
        self.assertEqual(data["custom_materials"][0]["Grade"], "Grade E250 Custom")
        
        self.assertEqual(len(data.get("custom_sections", [])), 1)
        self.assertEqual(data["custom_sections"][0]["Designation"], "Custom_Beam_1")
        self.assertEqual(data["custom_sections"][0]["table"], "Beams")

    @patch('firebase_admin.auth.verify_id_token')
    def test_custom_material_deletion(self, mock_verify):
        # Create a custom material
        material = CustomMaterials.objects.create(
            user=self.user,
            Grade="MaterialToDelete",
            Yield_Stress_less_than_20=250,
            Yield_Stress_between_20_and_neg40=240,
            Yield_Stress_greater_than_40=230,
            Ultimate_Tensile_Stress=410,
            Elongation=20
        )

        # Setup authentication
        mock_verify.return_value = {
            "uid": "test_uid_123",
            "email": "test@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # Deleting with valid material_id
        response = self.client.delete(f"/api/materialDetails/{material.id}/", **headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))
        self.assertFalse(CustomMaterials.objects.filter(id=material.id).exists())

    @patch('firebase_admin.auth.verify_id_token')
    def test_custom_material_update(self, mock_verify):
        # Create a custom material
        material = CustomMaterials.objects.create(
            user=self.user,
            Grade="MaterialToUpdate",
            Yield_Stress_less_than_20=250,
            Yield_Stress_between_20_and_neg40=240,
            Yield_Stress_greater_than_40=230,
            Ultimate_Tensile_Stress=410,
            Elongation=20
        )

        # Setup authentication
        mock_verify.return_value = {
            "uid": "test_uid_123",
            "email": "test@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # Perform PUT request to update material properties
        updated_data = {
            "id": material.id,
            "Grade": "MaterialUpdated",
            "Yield_Stress_less_than_20": 260,
            "Yield_Stress_between_20_and_neg40": 250,
            "Yield_Stress_greater_than_40": 240,
            "Ultimate_Tensile_Stress": 420,
            "Elongation": 22
        }
        response = self.client.put(
            f"/api/materialDetails/{material.id}/",
            data=updated_data,
            content_type="application/json",
            **headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))
        
        # Verify database has updated values
        material.refresh_from_db()
        self.assertEqual(material.Grade, "MaterialUpdated")
        self.assertEqual(material.Yield_Stress_less_than_20, 260)
        self.assertEqual(material.Yield_Stress_between_20_and_neg40, 250)
        self.assertEqual(material.Yield_Stress_greater_than_40, 240)
        self.assertEqual(material.Ultimate_Tensile_Stress, 420)
        self.assertEqual(material.Elongation, 22)

    @patch('firebase_admin.auth.verify_id_token')
    def test_custom_section_update(self, mock_verify):
        # Create a custom section
        section = UserCustomBeam.objects.create(
            user=self.user,
            Designation="BeamToUpdate",
            Mass=30.0,
            Area=38.0,
            D=250.0,
            B=125.0,
            tw=6.9,
            T=9.7,
            FlangeSlope=98,
            R1=10.0,
            R2=5.0,
            Iz=3000.0,
            Iy=300.0,
            rz=10.0,
            ry=2.8,
            Zz=240.0,
            Zy=48.0,
            Zpz=280.0,
            Zpy=75.0,
            Source="Custom",
            Type="I Section"
        )

        # Setup authentication
        mock_verify.return_value = {
            "uid": "test_uid_123",
            "email": "test@example.com",
            "email_verified": True,
            "exp": int(time.time()) + 3600
        }
        headers = {"HTTP_AUTHORIZATION": "Bearer fake_token"}

        # Perform PUT request to update section properties
        updated_data = {
            "id": section.id,
            "Designation": "BeamUpdated",
            "Mass": 35.5,
            "Area": 40.2,
            "D": 260.0,
            "B": 130.0,
            "tw": 7.2,
            "T": 10.0,
            "FlangeSlope": 98.0,
            "R1": 11.0,
            "R2": 5.5,
            "Iz": 3200.0,
            "Iy": 320.0,
            "rz": 10.5,
            "ry": 3.0,
            "Zz": 260.0,
            "Zy": 52.0,
            "Zpz": 300.0,
            "Zpy": 80.0,
            "Source": "Custom",
            "Type": "I Section"
        }
        response = self.client.put(
            "/api/sections/custom/?table=Beams",
            data=updated_data,
            content_type="application/json",
            **headers
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify database has updated values
        section.refresh_from_db()
        self.assertEqual(section.Designation, "BeamUpdated")
        self.assertEqual(float(section.Mass), 35.5)
        self.assertEqual(float(section.Area), 40.2)
        self.assertEqual(float(section.D), 260.0)
        self.assertEqual(float(section.B), 130.0)
        self.assertEqual(float(section.tw), 7.2)
        self.assertEqual(float(section.T), 10.0)
        self.assertEqual(float(section.R1), 11.0)
        self.assertEqual(float(section.R2), 5.5)
        self.assertEqual(float(section.Iz), 3200.0)
        self.assertEqual(float(section.Iy), 320.0)
        self.assertEqual(float(section.rz), 10.5)
        self.assertEqual(float(section.ry), 3.0)
        self.assertEqual(float(section.Zz), 260.0)
        self.assertEqual(float(section.Zy), 52.0)
        self.assertEqual(float(section.Zpz), 300.0)
        self.assertEqual(float(section.Zpy), 80.0)

