from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from osdag_api.modules.fin_plate_connection import generate_report

# importing data
from .data.design_types import design_type_data, connections_data, shear_connection, moment_connection, b2b_splice, b2column, c2c_splice, base_plate, tension_member


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


@api_view(['GET'])
def get_b2column(request):
    return JsonResponse({'result': b2column}, safe=False)


@api_view(['GET'])
def get_c2c_splice(request):
    return JsonResponse({'result': c2c_splice}, safe=False)


@api_view(['GET'])
def get_base_plate(request):
    return JsonResponse({'result': base_plate}, safe=False)


@api_view(['GET'])
def get_tension_member(request):
    return JsonResponse({'result': tension_member}, safe=False)


@api_view(['POST'])
def design_report(request):
    params = request.data
    # path = generate_report(input_values=params.metadata_profile,
    #                        metadata=params.metadata_other,report_id="5834720934534")
    return JsonResponse({'result': {}}, safe=False)
