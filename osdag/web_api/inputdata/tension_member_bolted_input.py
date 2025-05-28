from .input_data_base import InputDataBase
from rest_framework import status
from rest_framework.response import Response
from osdag.models import Beams, Material, Bolt, Bolt_fy_fu, CustomMaterials

class TensionMemberBoltedInputData(InputDataBase):
    def process(self, **kwargs):
        section_profile = kwargs.get("Member.Profile")
        boltDiameter = kwargs.get("boltDiameter")
        propertyClass = kwargs.get("propertyClass")
        thickness = kwargs.get("thickness")
        email = kwargs.get("email")

        # Always fetch angleList and channelList
        angleList = list(Beams.objects.values_list(
                    'Designation', flat=True))
        channelList = list(Beams.objects.values_list(
                    'Designation', flat=True))

        # Always fetch materialList
        materialList = list(Material.objects.all().values())
        if email:
            custom_material = list(CustomMaterials.objects.filter(email=email).values())
            materialList += custom_material
        materialList.append({"id": -1, "Grade": 'Custom'})

        response = {
            'angleList': angleList,
            'channelList': channelList,
            'materialList': materialList
        }

        print("Processing Tension Member Bolted Input Data...: ", response)

        # Section profiles list (only on initial call)
        if not any([section_profile, boltDiameter, propertyClass, thickness]):
            response['sectionProfileList'] = [
                "Angles",
                "Back to Back Angles",
                "Star Angles",
                "Channels"
            ]

        # Add boltDiameterList if requested
        if boltDiameter == 'Customized':
            boltList = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
            boltList.sort()
            response['boltDiameterList'] = boltList

        # Add propertyClassList if requested
        if propertyClass == 'Customized':
            response['propertyClassList'] = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']

        # Add thicknessList if requested
        if thickness == 'Customized':
            response['thicknessList'] = [
                '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50',
                '56', '63', '75', '80', '90', '100', '110', '120'
            ]

        return Response(response, status=status.HTTP_200_OK)
