from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core import catalog
from apps.core.models import CustomMaterials
from apps.core.serializers import CustomMaterials_Serializer
from apps.core.utils.api_errors import error_response


def _grade_conflict(user, grade, exclude_pk=None):
    """Message if `grade` clashes with the catalog or another of the user's materials, else None."""
    # A custom row named like a catalog grade would silently replace it in this user's designs.
    if catalog.find("Material", Grade=grade):
        return "This grade already exists in the standard catalog"
    qs = CustomMaterials.objects.filter(user=user, Grade=grade)
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)
    if qs.exists():
        return "The material already exists"
    return None


class MaterialDetails(APIView):

    def get(self, request):
        material = request.GET.get("material")
        material_details = catalog.rows("Material")
        if material:
            material_details = [row for row in material_details if row["Grade"] == material]

        custom_materials = []
        if hasattr(request, "user") and request.user.is_authenticated:
            custom_materials = list(
                CustomMaterials.objects.filter(user=request.user).values()
            )

        # Same ordering as module `options` `material_list()`: standard, then custom, then sentinel.
        material_list = material_details + custom_materials + [{"id": -1, "Grade": "Custom"}]

        return Response(
            {
                "materialList": material_list,
                "material_details": material_details,
                "custom_materials": custom_materials,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        materialName = request.data.get("materialName")
        fy_20 = request.data.get("fy_20")
        fy_20_40 = request.data.get("fy_20_40")
        fy_40 = request.data.get("fy_40")
        fu = request.data.get("fu")

        if not (hasattr(request, "user") and request.user.is_authenticated):
            return error_response('not_authenticated', "Authentication required", 401, success=False)

        conflict = _grade_conflict(request.user, materialName)
        if conflict:
            return error_response('already_exists', conflict, 403, success=False)

        serializer = CustomMaterials_Serializer(data={
            "user": request.user.id,
            "Grade": materialName,
            "Yield_Stress_less_than_20": fy_20,
            "Yield_Stress_between_20_and_neg40": fy_20_40,
            "Yield_Stress_greater_than_40": fy_40,
            "Ultimate_Tensile_Stress": fu,
            "Elongation": 0,
        })


        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Material added successfuly", "success": True}, status=201)
        else:
            print('serializer.errors : ', serializer.errors)
        return error_response('internal_error', "Something went wrong", 500, success=False)

    def delete(self, request, material_id=None):
        if not (hasattr(request, "user") and request.user.is_authenticated):
            return error_response('not_authenticated', "Authentication required", status.HTTP_401_UNAUTHORIZED, success=False)
        
        if not material_id:
            material_id = request.query_params.get("id")
            
        if not material_id:
            return error_response('missing_field', "Material ID is required", status.HTTP_400_BAD_REQUEST, success=False)
            
        try:
            material = CustomMaterials.objects.get(id=material_id, user=request.user)
            material.delete()
            return Response({"message": "Material deleted successfully", "success": True}, status=status.HTTP_200_OK)
        except CustomMaterials.DoesNotExist:
            return error_response('not_found', "Material not found or access denied", status.HTTP_404_NOT_FOUND, success=False)

    def put(self, request, material_id=None):
        if not (hasattr(request, "user") and request.user.is_authenticated):
            return error_response('not_authenticated', "Authentication required", status.HTTP_401_UNAUTHORIZED, success=False)
        
        if not material_id:
            material_id = request.data.get("id") or request.query_params.get("id")
            
        if not material_id:
            return error_response('missing_field', "Material ID is required", status.HTTP_400_BAD_REQUEST, success=False)
            
        try:
            material = CustomMaterials.objects.get(id=material_id, user=request.user)
            new_grade = request.data.get("Grade", material.Grade)
            if new_grade != material.Grade:
                conflict = _grade_conflict(request.user, new_grade, exclude_pk=material.pk)
                if conflict:
                    return error_response('already_exists', conflict, 403, success=False)
            material.Grade = new_grade
            material.Yield_Stress_less_than_20 = request.data.get("Yield_Stress_less_than_20", material.Yield_Stress_less_than_20)
            material.Yield_Stress_between_20_and_neg40 = request.data.get("Yield_Stress_between_20_and_neg40", material.Yield_Stress_between_20_and_neg40)
            material.Yield_Stress_greater_than_40 = request.data.get("Yield_Stress_greater_than_40", material.Yield_Stress_greater_than_40)
            material.Ultimate_Tensile_Stress = request.data.get("Ultimate_Tensile_Stress", material.Ultimate_Tensile_Stress)
            material.Elongation = request.data.get("Elongation", material.Elongation)
            material.save()
            
            serializer = CustomMaterials_Serializer(material)
            return Response({"message": "Material updated successfully", "success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except CustomMaterials.DoesNotExist:
            return error_response('not_found', "Material not found or access denied", status.HTTP_404_NOT_FOUND, success=False)