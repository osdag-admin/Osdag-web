from .input_data_base import InputDataBase
from rest_framework import status
from rest_framework.response import Response
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material, CustomMaterials, Angles
import traceback

class CleatAngleInputData(InputDataBase):
    def process(self, **kwargs):
        email = kwargs.get("email")

        print("Processing Cleat Angle Input Data - Complete Dataset")

        # Always return ALL data needed for this module
        response = {}

        try:
            # Connectivity List
            response['connectivityList'] = ['Column Flange-Beam-Web', 'Column Web-Beam-Web', 'Beam-Beam']

            # Column and Beam Lists
            columnList = list(Columns.objects.values_list('Designation', flat=True))
            beamList = list(Beams.objects.values_list('Designation', flat=True))
            print(f"CleatAngle - First 10 columns: {columnList[:10]}")
            print(f"CleatAngle - First 10 beams: {beamList[:10]}")
            response['columnList'] = columnList
            response['beamList'] = beamList

            # Material List
            materialList = list(Material.objects.all().values())
            if email:
                custom_material = list(CustomMaterials.objects.filter(email=email).values())
                materialList += custom_material
            materialList.append({"id": -1, "Grade": 'Custom'})
            response['materialList'] = materialList

            # Angle List (specific to cleat angle)
            response['angleList'] = list(Angles.objects.values_list('Designation', flat=True))

            # Bolt Diameter List
            boltList = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
            boltList.sort()
            response['boltDiameterList'] = boltList

            # Property Class List
            response['propertyClassList'] = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']

            print("Cleat Angle Complete Response: ", {k: len(v) if isinstance(v, list) else v for k, v in response.items()})
            return Response(response, status=status.HTTP_200_OK)

        except Exception as err:
            print(f"Error in CleatAngle input handler: {err}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({"error": "Database error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)