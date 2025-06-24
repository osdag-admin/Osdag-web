# osdag/input_data_base.py (or relevant file)

from .input_data_base import InputDataBase
from rest_framework import status
from rest_framework.response import Response
from osdag.models import Beams, Material, CustomMaterials
import traceback

class CoverPlateWeldedInputData(InputDataBase):
    def process(self, **kwargs):
        try:
            thickness = kwargs.get("thickness")
            email = kwargs.get("email")

            if thickness == 'Customized':
                try:
                    PLATE_THICKNESS_SAIL = ['8', '10', '12', '14', '16', '18', '20', '22', '25', 
                                          '28', '32', '36', '40', '45', '50', '56', '63', '75', 
                                          '80', '90', '100', '110', '120']
                    
                    response = {'thicknessList': PLATE_THICKNESS_SAIL}
                    return Response(response, status=status.HTTP_200_OK)
                except Exception as e:
                    error_msg = f"Error processing customized thickness: {str(e)}"
                    print(error_msg)
                    return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

            try:
                beamList = list(Beams.objects.values_list('Designation', flat=True))
                if not beamList:
                    return Response(
                        {'error': 'No beam designations found in database'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                materialList = list(Material.objects.all().values())
                if not materialList:
                    return Response(
                        {'error': 'No materials found in database'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                if email:
                    try:
                        custom_material = list(CustomMaterials.objects.filter(email=email).values())
                        materialList.extend(custom_material)
                    except Exception as e:
                        print(f"Error fetching custom materials for email {email}: {str(e)}")
                        # Continue without custom materials
                
                # Add custom material option    
                materialList.append({"id": -1, "Grade": 'Custom'})                # Define welding specific options that match backend expectations
                weldTypes = [
                    {'value': 'Fillet Weld', 'label': 'Fillet Weld'},
                    {'value': 'Groove Weld', 'label': 'Groove Weld'}
                ]
                weldFab = [
                    {'value': 'Shop Weld', 'label': 'Shop Weld'},
                    {'value': 'Field Weld', 'label': 'Field Weld'}
                ]
                PLATE_THICKNESS_SAIL = ['8', '10', '12', '14', '16', '18', '20', '22', '25', 
                                          '28', '32', '36', '40', '45', '50', '56', '63', '75', 
                                          '80', '90', '100', '110', '120']
                response = {
                    'beamList': beamList,
                    'materialList': materialList,
                    'weldTypes': weldTypes,
                    'weldFab': weldFab,
                    'thicknessList': PLATE_THICKNESS_SAIL
                }
                return Response(response, status=status.HTTP_200_OK)

            except Exception as db_err:
                error_msg = f"Database error: {str(db_err)}"
                print(error_msg)
                return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as err:
            error_msg = f"Unexpected error in process(): {str(err)}\n"
            error_msg += f"Traceback:\n{traceback.format_exc()}"
            print(error_msg)
            return Response(
                {"error": "Internal server error", "details": error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

