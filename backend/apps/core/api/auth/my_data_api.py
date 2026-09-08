from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsEmailVerified
from apps.core.models import Project, CustomMaterials
from apps.sections.models import TABLE_TO_USER_MODEL

class MyDataAPIView(APIView):
    """
    Endpoint to retrieve all user personal data (projects, custom materials, custom sections)
    to show in the 'My Data' dashboard.
    """
    permission_classes = [IsAuthenticated, IsEmailVerified]

    def get(self, request):
        user = request.user
        user_email = user.email

        # 1. Fetch Projects
        projects = list(Project.objects.filter(user_email=user_email).values(
            'id', 'name', 'module', 'submodule', 'created_at', 'updated_at'
        ))

        # 2. Fetch Custom Materials
        custom_materials = list(CustomMaterials.objects.filter(user=user).values(
            'id', 'Grade', 'Yield_Stress_less_than_20', 'Yield_Stress_between_20_and_neg40',
            'Yield_Stress_greater_than_40', 'Ultimate_Tensile_Stress', 'Elongation'
        ))

        # 3. Fetch Custom Sections
        custom_sections = []
        for table_name, Model in TABLE_TO_USER_MODEL.items():
            sections_qs = list(Model.objects.filter(user=user).values())
            for item in sections_qs:
                item['table'] = table_name
                custom_sections.append(item)


        return Response({
            "success": True,
            "projects": projects,
            "custom_materials": custom_materials,
            "custom_sections": custom_sections
        }, status=status.HTTP_200_OK)
