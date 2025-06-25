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
        try:
            username = request.data.get("username")
            password = request.data.get("password")
            email = request.data.get('email')
            isGuest = request.data.get('isGuest')

            # Validate required fields
            if not username or not password or not email:
                return Response({
                    'message': 'Username, email, and password are required',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate username
            if len(username) < 3:
                return Response({
                    'message': 'Username must be at least 3 characters long',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate password
            if len(password) < 8:
                return Response({
                    'message': 'Password must be at least 8 characters long',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate email format
            import re
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return Response({
                    'message': 'Please enter a valid email address',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if username already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    'message': 'Username already exists. Please choose a different username.',
                    'error_type': 'duplicate_username'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response({
                    'message': 'An account with this email already exists. Please use a different email or try logging in.',
                    'error_type': 'duplicate_email'
                }, status=status.HTTP_400_BAD_REQUEST)

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
                return Response({
                    'message': 'Account created successfully! You can now log in.',
                    'success': True
                }, status=status.HTTP_201_CREATED)
            else:
                # Clean up the Django user if serializer fails
                user.delete()
                return Response({
                    'message': 'Failed to create user account. Please try again.',
                    'error_type': 'serializer_error',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Log the error for debugging
            print(f"Signup error: {str(e)}")
            return Response({
                'message': 'An unexpected error occurred. Please try again.',
                'error_type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ForgetPasswordView(APIView):
    def post(self, request):
        try:
            password = request.data.get('password')
            email = request.data.get('email')

            # Validate required fields
            if not password or not email:
                return Response({
                    'message': 'Email and new password are required',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate password
            if len(password) < 8:
                return Response({
                    'message': 'Password must be at least 8 characters long',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate email format
            import re
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return Response({
                    'message': 'Please enter a valid email address',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                return Response({
                    'message': 'Password has been updated successfully. You can now log in with your new password.',
                    'success': True
                }, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({
                    'message': 'No account found with this email address',
                    'error_type': 'user_not_found'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"ForgetPassword error: {str(e)}")
            return Response({
                'message': 'An unexpected error occurred while updating password. Please try again.',
                'error_type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    def post(self, request): 
        try:
            print('inside check email post')

            # obtain the email 
            email = request.data.get('email')

            # Validate email
            if not email:
                return Response({
                    'message': 'Email is required',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate email format
            import re
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return Response({
                    'message': 'Please enter a valid email address',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # check if the email exists in the database or not 
            try: 
                emailobject = User.objects.get(email=email)
                print('emailObject:', emailobject)
            except User.DoesNotExist: 
                # the email is not present in the database 
                print('email is not present in the database')
                return Response({
                    'message': 'No account found with this email address. Please check your email or sign up for a new account.',
                    'error_type': 'email_not_found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # GENERATE AN OTP
            # K -> is the number of digits in the OTP
            OTP = ''.join(random.choices(string.digits, k=6))   
            print('OTP:', OTP)

            # send a mail to this email
            try: 
                print('Sending OTP email')
                send_mail(email, OTP)

                # convert the OTP in a hash
                return Response({
                    'message': 'OTP sent successfully to your email',
                    'OTP': OTP,
                    'success': True
                }, status=status.HTTP_200_OK)
            except Exception as mail_error:
                print(f'Failed to send email: {mail_error}')
                return Response({
                    'message': 'Failed to send OTP email. Please check your email address and try again.',
                    'error_type': 'email_send_error'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f'CheckEmail error: {str(e)}')
            return Response({
                'message': 'An unexpected error occurred. Please try again.',
                'error_type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LoginView(APIView):
    def post(self, request):
        try:
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
                    'message': 'Guest login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'username': guest_username,
                    'email': guest_email,
                    'success': True
                }, status=status.HTTP_200_OK)

            # Regular user login
            username = request.data.get('username')
            password = request.data.get('password')

            # Validate required fields
            if not username or not password:
                return Response({
                    'message': 'Username and password are required',
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists
            try:
                user_obj = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({
                    'message': 'No account found with this username. Please check your username or sign up for a new account.',
                    'error_type': 'user_not_found'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if user is active
            if not user_obj.is_active:
                return Response({
                    'message': 'Your account has been deactivated. Please contact support.',
                    'error_type': 'account_deactivated'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Authenticate user
            user = authenticate(username=username, password=password)
            if user is not None:
                # Get user email for response
                try:
                    user_account = UserAccount.objects.get(username=username)
                    email = user_account.email
                    all_input_files_length = len(user_account.allInputValueFiles) if user_account.allInputValueFiles else 0
                except UserAccount.DoesNotExist:
                    email = user.email
                    all_input_files_length = 0

                refresh = RefreshToken.for_user(user)
                return Response({
                    'message': 'Login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'email': email,
                    'allInputValueFilesLength': all_input_files_length,
                    'success': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Invalid password. Please check your password and try again.',
                    'error_type': 'invalid_credentials'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Log the error for debugging
            print(f"Login error: {str(e)}")
            return Response({
                'message': 'An unexpected error occurred during login. Please try again.',
                'error_type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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