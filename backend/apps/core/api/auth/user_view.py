# DRF imports 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

# importing Django models 
from apps.core.models import UserAccount

# importing exceptions 
from django.core.exceptions import ObjectDoesNotExist

# django imports 
from django.conf import settings
from django.core.files.storage import default_storage
from django.http import FileResponse, JsonResponse

# importing serializers
from apps.core.serializers import UserAccount_Serializer, OsiFileSerializer
from apps.core.models import OsiFile

# other imports 
from django.contrib.auth.models import User
import os
import uuid
import base64


# obtain the attributes 
SECRET_ROOT = getattr(settings, 'SECRET_ROOT' , "")


def convert_to_32_bytes(input_string) : 
    input_bytes = input_string.encode('utf-8')
    padded_bytes = input_bytes.ljust(32, b'\x00')

    return padded_bytes
    
class SaveInputFileView(APIView) : 
    def post(self, request) : 
        print('inside the saveinput file view post')

        # New implementation: accept multipart upload of .osi file and store via OsiFile model
        try:
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response({'message': 'No file provided under field "file"'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = OsiFileSerializer(data={'file': uploaded_file})
            if serializer.is_valid():
                osifile = serializer.save()
                file_url = osifile.file.url
                return Response({'message': 'File stored successfully', 'url': file_url, 'id': osifile.id}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Invalid file upload', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print('Error saving OSI file via OsiFile model: ', e)
            return Response({'message': 'Failed to store the file'}, status=status.HTTP_400_BAD_REQUEST)
