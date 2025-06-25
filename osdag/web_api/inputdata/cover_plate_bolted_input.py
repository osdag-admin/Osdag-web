from .input_data_base import InputDataBase
from rest_framework import status
from rest_framework.response import Response
from osdag.models import Columns, Beams, Bolt, Bolt_fy_fu, Material, CustomMaterials

class CoverPlateBoltedInputData(InputDataBase):
    def process(self, **kwargs):
        email = kwargs.get("email")

        print("Processing Cover Plate Bolted Input Data - Complete Dataset")

        # Always return ALL data needed for this module
        response = {}

        try:
            # Beam List
            response['beamList'] = list(Beams.objects.values_list('Designation', flat=True))

            # Material List
            materialList = list(Material.objects.all().values())
            if email:
                custom_material = list(CustomMaterials.objects.filter(email=email).values())
                materialList += custom_material
            materialList.append({"id": -1, "Grade": 'Custom'})
            response['materialList'] = materialList

            # Bolt Diameter List
            boltList = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
            boltList.sort()
            response['boltDiameterList'] = boltList

            # Property Class List
            response['propertyClassList'] = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']

            # Thickness List
            response['thicknessList'] = [
                '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50',
                '56', '63', '75', '80', '90', '100', '110', '120'
            ]

            print("Cover Plate Bolted Complete Response: ", {k: len(v) if isinstance(v, list) else v for k, v in response.items()})
            return Response(response, status=status.HTTP_200_OK)

        except Exception as err:
            print(f"Error in CoverPlateBolted input handler: {err}")
            return Response({"error": "Database error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)