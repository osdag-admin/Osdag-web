from .input_data_base import InputDataBase
from rest_framework import status
from rest_framework.response import Response
from osdag.models import Columns, Beams, Material, CustomMaterials

class SimplySupportedBeamInputData(InputDataBase):
    def process(self, **kwargs):
        email = kwargs.get("email")

        print("Processing Simply Supported Beam Input Data - Complete Dataset")

        # Always return ALL data needed for this module
        response = {}

        try:
            # Beam and Column Lists - flexural members can use both
            response['beamList'] = list(Beams.objects.values_list('Designation', flat=True))
            response['columnList'] = list(Columns.objects.values_list('Designation', flat=True))

            # Section Profile List for dropdown (flexure.py expects "Beams and Columns" as single option)
            response['sectionProfileList'] = ["Beams and Columns"]

            # Material List - with id and Grade fields for dropdown
            materialList = list(Material.objects.all().values())
            if email:
                custom_material = list(CustomMaterials.objects.filter(email=email).values())
                materialList += custom_material
            materialList.append({"id": -1, "Grade": 'Custom'})
            response['materialList'] = materialList

            # Design Method Options (matches flexure backend expectations)
            response['designMethodList'] = ["Limit State Design", "Working Stress Design"]

            # Allowable Class Options (from flexure.py KEY_ALLOW_CLASS)
            response['allowableClassList'] = ["Plastic", "Compact", "Semi-Compact"]

            # Beam Support Types (from flexure.py VALUES_SUPP_TYPE_temp)
            response['beamSupportTypeList'] = [
                "Major Laterally Supported", 
                "Minor Laterally Unsupported", 
                "Major Laterally Unsupported"
            ]

            # Torsional Restraint Options (from Torsion_Restraint_list)
            response['torsionalRestraintList'] = [
                "Fully Restrained",
                "Partially Restrained-support connection", 
                "Partially Restrained-bearing support"
            ]

            # Warping Restraint Options (from Warping_Restraint_list)
            response['warpingRestraintList'] = [
                "Both flanges fully restrained",
                "Compression flange fully restrained",
                "Compressicm flange partially restrained",
                "Warping not restrained in both flanges"
            ]

            print(f"✅ Simply Supported Beam Input Data processed successfully")
            print(f"   - beamList: {len(response['beamList'])} items")
            print(f"   - columnList: {len(response['columnList'])} items") 
            print(f"   - materialList: {len(response['materialList'])} items")
            print(f"   - sectionProfileList: {len(response['sectionProfileList'])} items")

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Error in Simply Supported Beam Input Data: {str(e)}")
            return Response(
                {"error": f"Failed to fetch input data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 