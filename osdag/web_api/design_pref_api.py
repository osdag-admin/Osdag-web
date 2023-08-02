from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from osdag.models import Design
from osdag.models import Beams
from osdag.models import Columns
from osdag.models import Material
from osdag.serializers import Material_Serializer


class DesignPreference(APIView):

    def get(self, request):
        supported_section = request.GET.get("supported_section")
        supporting_section = request.GET.get("supporting_section")
        connectivity = request.GET.get("connectivity")
        material = request.GET.get("material")
        cookie_id = request.COOKIES.get('fin_plate_connection_session')

        if cookie_id == None or cookie_id == '': 
            return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) 
        if not Design.objects.filter(cookie_id=cookie_id).exists(): 
            return Response("Error: This design session does not exist", status = status.HTTP_404_NOT_FOUND)

        connector_material_details = []
        if material:
            connector_material_details = Material.objects.filter(Grade=material).values()
            return Response({"connector_material_details": connector_material_details }, status=status.HTTP_200_OK)
        

        if connectivity == 'Beam-Beam':
            supported_section_results = Beams.objects.filter(Designation=supported_section).values()
            supporting_section_results = Beams.objects.filter(Designation=supporting_section).values()
        else:
            supported_section_results = Beams.objects.filter(Designation=supported_section).values()
            supporting_section_results = Columns.objects.filter(Designation=supporting_section).values()

        return Response({"supported_section_results": supported_section_results, "supporting_section_results":supporting_section_results}, status=status.HTTP_200_OK)


class MaterialDetails(APIView):

    def get(self, request):
        material = request.GET.get("material")
        cookie_id = request.COOKIES.get('fin_plate_connection_session')

        if cookie_id == None or cookie_id == '': 
            return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) 
        if not Design.objects.filter(cookie_id=cookie_id).exists(): 
            return Response("Error: This design session does not exist", status = status.HTTP_404_NOT_FOUND)


        material_details = Material.objects.filter(Grade=material).values()
        return Response({"material_details": material_details }, status=status.HTTP_200_OK)

    def post(self, request):
        materialName = request.data.get("materialName")
        fy_20 = request.data.get("fy_20")
        fy_20_40 = request.data.get("fy_20_40")
        fy_40 = request.data.get("fy_40")
        fu = request.data.get("fu")
        cookie_id = request.COOKIES.get('fin_plate_connection_session')

        if cookie_id == None or cookie_id == '': 
            return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) 
        if not Design.objects.filter(cookie_id=cookie_id).exists(): 
            return Response("Error: This design session does not exist", status = status.HTTP_404_NOT_FOUND)

        alreadyExists = Material.objects.filter(Grade=materialName).exists()
        if alreadyExists:
            return Response({"message": "The material already exists"}, status=403)

        serializer = Material_Serializer(data = {
            "Grade": materialName,
            "Yield_Stress_less_than_20": fy_20,
            "Yield_Stress_between_20_and_neg40": fy_20_40,
            "Yield_Stress_greater_than_40": fy_40,
            "Ultimate_Tensile_Stress": fu,
            "Elongation": 20
        })

        if serializer.is_valid():
            serializer.save()
            return Response({"message" : "Material added successfuly"} , status=201) 
        else:
            print('serializer.errors : ' , serializer.errors)
        return Response({"message" : "Something went wrong"} , status=500)