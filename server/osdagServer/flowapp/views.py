from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
import json

# importing data
from .data.design_types import design_type_data, connections_data, shear_connection, moment_connection, b2b_splice


# Create your views here.


@api_view(['GET'])
def get_design_types(request):
    return JsonResponse({'result': design_type_data}, safe=False)


@api_view(['GET'])
def get_connections(request):
    return JsonResponse({'result': connections_data}, safe=False)


@api_view(['GET'])
def get_shear_connection(request):
    return JsonResponse({'result': shear_connection}, safe=False)


@api_view(['GET'])
def get_moment_connection(request):
    return JsonResponse({'result': moment_connection}, safe=False)


@api_view(['GET'])
def get_b2b_splice(request):
    return JsonResponse({'result': b2b_splice}, safe=False)
