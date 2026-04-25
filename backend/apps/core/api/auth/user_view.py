#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

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

# Removed: SignupView, LoginView, ForgetPasswordView, CheckEmailView
# All authentication now handled by Firebase via FirebaseAuthView in views.py

# Removed: LogoutView - Firebase handles logout on the frontend, no backend endpoint needed


class ObtainInputFileView(APIView) : 
    def post(self , request) : 
        print('inside obtain all reports view post')

        # obtain the email 
        email = request.data.get('email')
        print('email : ' , email)
        fileIndex = request.data.get('fileIndex')
        print('fileIndex : ' , fileIndex)

        userObject = UserAccount.objects.get(email = email)
        filePath = userObject.allInputValueFiles[int(fileIndex)]
        print('filePath : ' , filePath)

        try : 
            # send the input value files to the client
            currentDirectory = os.getcwd()
            print('current Directory : ' , currentDirectory)
            fullpath = currentDirectory + "/file_storage/input_values_files/"
            response = FileResponse(open(filePath, 'rb'))
            response['Content-Type'] = 'text/plain'
            response['Content-Disposition'] = f'attachment; filename="{filePath}"'
            for key, value in response.items():
                print(f'{key}: {value}')
            
            return response
        
        except Exception as e : 
            print('An exception has occured in obtaining the osi file : ' , e)

            return Response({'message' : 'Inside obtain all report view'} , status = status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request) : 
        print('inside obtain input file GET')

        print('request : ' , request)
        print('request.GET : ' , request.GET)
        fileName = request.GET.get('filename')
        print('fileName obtained : ' , fileName)
        filePath = os.path.join(os.getcwd(), "file_storage/input_values_files/" + fileName)

        try : 
            print('preparing download...')
            response = FileResponse(open(filePath , 'rb'))
            response['Content-Type'] = 'text/plain'
            response['Content-Disposition'] = f'attachment; filename="{fileName}"'
            for key, value in response.items() : 
                print(f'{key} : {value}')
            
            return response
        
        except Exception as e : 
            print('Exception in downloading : ' , e)

            return Response({'message' : 'Cannot download the file'} , status=status.HTTP_400_BAD_REQUEST)
    
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


# Removed: SetRefreshTokenCookieView - No longer needed with Firebase authentication
