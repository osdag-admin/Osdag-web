#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

# DRF imports 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

# email imports
from osdag_web.mailing import send_mail

# simpleJWT imports 
from rest_framework_simplejwt.tokens import RefreshToken

# importing Django models 
from osdag.models import UserAccount

# importing exceptions 
from django.core.exceptions import ObjectDoesNotExist

# django imports 
from django.conf import settings
from django.core.files.storage import default_storage
from django.http import FileResponse, JsonResponse
from django.contrib.auth import authenticate

# importing serializers
from osdag.serializers import UserAccount_Serializer

# other imports 
from django.contrib.auth.models import User
import string
import os
import random
import uuid
import base64


# obtain the attributes 
SECRET_ROOT = getattr(settings, 'SECRET_ROOT' , "")


def convert_to_32_bytes(input_string) : 
    input_bytes = input_string.encode('utf-8')
    padded_bytes = input_bytes.ljust(32, b'\x00')

    return padded_bytes

class SignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get('email')
        isGuest = request.data.get('isGuest')

        if User.objects.filter(username=username).exists():
            return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Django user with hashed password
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        tempData = {
            'username': username,
            'email': email,
            'allInputValueFiles': ['']
        }
        serializer = UserAccount_Serializer(data=tempData)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'The credentials have been created'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'user with this username already exists', 'code': 'unique'}, status=status.HTTP_400_BAD_REQUEST)

class ForgetPasswordView(APIView):
    def post(self, request):
        password = request.data.get('password')
        email = request.data.get('email')

        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            # Do NOT update or store password in UserAccount!
            return Response({'message': 'Password has been updated successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView) : 
    permission_classes = (IsAuthenticated,)

    def post(self, request): 
        try : 
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status = status.HTTP_205_RESET_CONTENT)
        
        except Exception as e : 
            return Response(status = status.HTTP_400_BAD_REQUEST)
        

class CheckEmailView(APIView): 
    def post(self , request) : 
        print('inside check email get')

        # obtain teh email 
        email = request.data.get('email')

        # check if the email exists in the database or not 
        # database query for checking if the email is present in the database or not 
        try : 
            emailobject = User.objects.get(email = email)
            print('emailObject : ' , emailobject)
        except User.DoesNotExist as e : 
            # the email is not present in the the database 
            print('email is not present in the database : ' , e)

            return Response({'message' , "Email is not registered"} , status = status.HTTP_400_BAD_REQUEST)

        # GENERATE AN OTP
        # K -> is the number of digits in the OTP
        OTP = ''.join(random.choices(string.digits, k = 6))   
        print('OTP : ' , OTP)

        # send a mail to this email
        # generate a random OTP and verify if the OTP generated is valid or not 
        try : 
            print('inside try')
            send_mail(email  , OTP)

            # convert the OTP in a hash
            return Response({'message' : 'OTP Sent' , 'OTP' : OTP} , status = status.HTTP_200_OK)
        except : 
            return Response({'message' : 'Failed to send the mail'} , status = status.HTTP_400_BAD_REQUEST)
        

    def get(self , request) : 
        print('inside check email post')

        return Response({'message' : 'Under development'} , status = status.HTTP_201_CREATED)



class LoginView(APIView):
    def post(self, request):
        is_guest = request.data.get('isGuest')
        if is_guest:
            # Generate a unique guest username each time
            guest_username = "guest_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            guest_email = guest_username + "@guest.com"
            guest_password = User.objects.make_random_password()
            user = User.objects.create_user(username=guest_username, email=guest_email, password=guest_password)
            # Optionally, set user.is_active = False or limit permissions
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': guest_username,
                'email': guest_email
            }, status=status.HTTP_200_OK)

        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


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

        # obtain the file from the request 
        content = request.data.get('content')
        email = request.data.get('email')
        print('content : ' , content)
        print('email : ' , email)

        # create a file in the file_storage 
        # fileName = ''.join(str(uuid.uuid4()).split('-')) + ".osi"
        
        # obtain the index of the allInputFiles of the user 
        userObject = UserAccount.objects.get(email = email)
        fileIndex = len(userObject.allInputValueFiles)
        fileName = email + f"_fin_plate_connection_{fileIndex}.osi"
        print('fileName : ' , fileName)
        currentDirectory = os.getcwd()
        print('currentDirectory : ' , currentDirectory)
        fullPath = currentDirectory + "/file_storage/input_values_files/" + fileName
        print('fullPath : ' , fullPath)
        
        # check if the input_values_files directory exists or not 
        # if not, then create one 
        if(not os.path.exists(os.path.join(os.getcwd() , "file_storage/input_values_files/"))) : 
            print('The input_values_files dir dies not exist, creating one')
            os.mkdir(os.path.join(os.getcwd() , "file_storage/input_values_files/"))

        # create the file
        try : 
            print('creating the .osi file')
            with open(fullPath , "wt") as destination : 
                destination.write(content)
            destination.close()
            print('created the .osi file ')
            
            try : 
                # append the fulllPath of the file to the email
                userObject = UserAccount.objects.get(email = email)
                
                # check if the file path already exists in the list or not 
                # if not, then append
                # else do not append
                if not fullPath in userObject.allInputValueFiles : 
                    userObject.allInputValueFiles.append(fullPath)
                
                allInputValueFilesLength = len(userObject.allInputValueFiles)
                userObject.save()
                print('the filePath has been appended and linked to the user')
            except Exception as e: 
                print('An exception has occured : ' , e)

                return Response({'message' : 'Failed to connect the file to the User'} , status = status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({'message' : "File stored successfully" , 'allInputValueFilesLength' : allInputValueFilesLength , 'fileName' : fileName} , status = status.HTTP_201_CREATED)
        
        except : 
            print('Error in creating an storing the contents of the file')

            return Response({'message' : "Failed to store the contents of the file"} , status = status.HTTP_400_BAD_REQUEST)


class SetRefreshTokenCookieView(APIView) : 
    def post(self , request) : 
        print('inside the set Refresh token Cookie View post')

        try : 
            refresh = request.data.get('refresh')
            print('refresh : ' , refresh)
            response = JsonResponse({'message' : 'Refresh Token Cookie has been set'} , status = 200)
            response.set_cookie(key='refresh' , value=refresh)
            return response

        except Exception as e : 
            print('An exception occured while setting refresh token cookei :  ', e)
            return JsonResponse({'message' : 'Failed to set refresh token'} , status = 500 )