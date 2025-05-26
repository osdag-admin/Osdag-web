from .input_data_base import InputDataBase
from rest_framework import status
from rest_framework.response import Response
from osdag.models import Beams, Material, Bolt, Bolt_fy_fu, CustomMaterials

class TensionMemberBoltedInputData(InputDataBase):
    def process(self, **kwargs):
        print("abhi: Entered process method with kwargs:", kwargs)
        # Extract parameters
        section_profile = kwargs.get("Member.Section_Profile")
        print("abhi: section_profile =", section_profile)
        boltDiameter = kwargs.get("boltDiameter")
        print("abhi: boltDiameter =", boltDiameter)
        propertyClass = kwargs.get("propertyClass")
        print("abhi: propertyClass =", propertyClass)
        thickness = kwargs.get("thickness")
        print("abhi: thickness =", thickness)
        email = kwargs.get("email")
        print("abhi: email =", email)

        # 1. Section Profile List
        if (section_profile is None and boltDiameter is None and propertyClass is None and thickness is None):
            print("abhi: All parameters are None, returning sectionProfileList")
            # Define available section profiles as per frontend
            sectionProfileList = [
                "Angles",
                "Back to Back Angles",
                "Star Angles",
                "Channels"
            ]
            response = {
                'sectionProfileList': sectionProfileList
            }
            print("abhi: response =", response)
            return Response(response, status=status.HTTP_200_OK)

        # 2. Section Designation and Material List for selected profile
        if section_profile:
            print("abhi: section_profile is provided:", section_profile)
            try:
                # For Angles and derived profiles
                if "Angle" in section_profile:
                    print("abhi: section_profile contains 'Angle'")
                    angleList = list(Beams.objects.filter(SectionType__icontains="angle").values_list('Designation', flat=True))
                    print("abhi: angleList =", angleList)
                    materialList = list(Material.objects.all().values())
                    print("abhi: materialList (default) =", materialList)
                    custom_material = list(CustomMaterials.objects.filter(email=email).values()) if email else []
                    if custom_material:
                        print("abhi: custom_material =", custom_material)
                    materialList += custom_material
                    materialList.append({"id": -1, "Grade": 'Custom'})
                    print("abhi: materialList (final) =", materialList)
                    response = {
                        'angleList': angleList,
                        'materialList': materialList
                    }
                    print("abhi: response =", response)
                    return Response(response, status=status.HTTP_200_OK)

                # For Channels
                elif "Channel" in section_profile:
                    print("abhi: section_profile contains 'Channel'")
                    channelList = list(Beams.objects.filter(SectionType__icontains="channel").values_list('Designation', flat=True))
                    print("abhi: channelList =", channelList)
                    materialList = list(Material.objects.all().values())
                    print("abhi: materialList (default) =", materialList)
                    custom_material = list(CustomMaterials.objects.filter(email=email).values()) if email else []
                    if custom_material:
                        print("abhi: custom_material =", custom_material)
                    materialList += custom_material
                    materialList.append({"id": -1, "Grade": 'Custom'})
                    print("abhi: materialList (final) =", materialList)
                    response = {
                        'channelList': channelList,
                        'materialList': materialList
                    }
                    print("abhi: response =", response)
                    return Response(response, status=status.HTTP_200_OK)
            except Exception as err:
                print("abhi: Exception occurred in section_profile block:", err)
                return Response({"error": "Bad request"}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Bolt Diameter List
        if (boltDiameter == 'Customized'):
            print("abhi: boltDiameter is 'Customized'")
            try:
                boltList = list(Bolt.objects.values_list('Bolt_diameter', flat=True))
                print("abhi: boltList before sort =", boltList)
                boltList.sort()
                print("abhi: boltList after sort =", boltList)
                response = {
                    'boltDiameterList': boltList
                }
                print("abhi: response =", response)
                return Response(response, status=status.HTTP_200_OK)
            except Exception as err:
                print("abhi: Exception occurred in boltDiameter block:", err)
                return Response({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Property Class List
        if (propertyClass == 'Customized'):
            print("abhi: propertyClass is 'Customized'")
            try:
                boltFyFuList = ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9']
                print("abhi: boltFyFuList =", boltFyFuList)
                response = {
                    'propertyClassList': boltFyFuList
                }
                print("abhi: response =", response)
                return Response(response, status=status.HTTP_200_OK)
            except Exception as err:
                print("abhi: Exception occurred in propertyClass block:", err)
                return Response({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)

        # 5. Plate Thickness List
        if (thickness == 'Customized'):
            print("abhi: thickness is 'Customized'")
            try:
                PLATE_THICKNESS_SAIL = ['8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36', '40', '45', '50', '56', '63', '75', '80', '90', '100', '110', '120']
                print("abhi: PLATE_THICKNESS_SAIL =", PLATE_THICKNESS_SAIL)
                response = {
                    'thicknessList': PLATE_THICKNESS_SAIL
                }
                print("abhi: response =", response)
                return Response(response, status=status.HTTP_200_OK)
            except Exception as err:
                print("abhi: Exception occurred in thickness block:", err)
                return Response({'error': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)

        # Fallback: call base class
        print("abhi: Fallback, calling super().process")
        return super().process(kwargs)
