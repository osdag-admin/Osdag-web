from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
import json

# importing data
from .data.design_types import design_type_data

# Create your views here.


@api_view(['GET'])
def get_design_types(request):
    return JsonResponse({'result': design_type_data}, safe=False)
