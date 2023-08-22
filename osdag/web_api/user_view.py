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

class SignupView(APIView) :
    def post(self , request) : 
        print('inside the signup post')
        
        # obtain the useranme and password 
        temp = request.data
        print('temp : ' , temp)
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get('email')
        isGuest = request.data.get('isGuest')
        print('username : ' , username)
        print('email : ' , email)
        print('password : ' , password)
        print('isGuest : ' , isGuest)
        print('type isGuest : ' , type(isGuest))
        print('encoded passsword : ' , password.encode() )
        print('encoding password 2 : ' , base64.b64encode(password.encode('ascii')).decode())
        base64Password = base64.b64encode(password.encode('ascii')).decode()

        tempData = {
            'username' : username,
            'password' : base64Password,
            'email' : email,
            'allInputValueFiles' : ['']
        }

        # append the username in the User table ( in the username array )
        # create a JSON object that maps the username to the password and add it to the User table ( passsword column )
        serializer = UserAccount_Serializer(data = tempData)
        if(serializer.is_valid()) : 
            # save the serializer 
            serializer.save()

            # create a user in the Django.contrib.auth 
            user = User.objects.create_user(username , email , password)
            user.save()

            # return 201 
            return Response({'message' : 'The credentials have been created'} , status = status.HTTP_201_CREATED ) 
        else : 
            print('serializer is invalid ')
            print('error : ' , serializer.errors)
            return Response({'message' : 'user with this username already exists' , 'code' : 'unique'} , status = status.HTTP_400_BAD_REQUEST)



class ForgetPasswordView(APIView) : 
    def post(self , request) : 
        print('inside the forget password post')
        
        # obtain the new password
        password = request.data.get('password')
        print('password : ' , password)
        email = request.data.get('email')
        print('email : ' , email)

        # obtain the user object from the Django.contrib.auth.models User
        user = User.objects.get(email = email)
        user.password = password
        user.save()
        print('Django user updates')

        # update the user in the postgres database
        base64Password = base64.b64encode(password.encode('ascii')).decode()
        user = UserAccount.objects.get(email = email)
        user.password = base64Password
        user.save()
        print('postgres user updated')

        # PARTIAL WORK, WORK IN PROGRESS 
        return Response({'message' , 'Password has been updated successfully'} , status = status.HTTP_200_OK)
        
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



class LoginView(APIView) : 
    def get(self , request) :
        print('inside login get')

        return Response({'message' : 'Fucntion under developement'} , status = status.HTTP_200_OK)
    

    def post(self , request) : 
        print('inside login post')

        # check if the user is a guest user or not 
        isGuest = request.data.get('isGuest')
        print('isGuest : ' , isGuest)

        if(isGuest) : 
            print('is a guest user')
            # create a dummy user

            # check if the dummy user is already created or not 
            # if not, then create, else use the dummy user
            try : 
                user = User.objects.create_user(username = 'default123' , email = 'default@123.com' , password = 'default123' )
                # provide no permissions to the user and just save
                user.save()
            
            except : 
                print('the user already exists')

            # grant the login access to the user 
            return Response({'message' : 'Login successful'} , status = status.HTTP_200_OK)
        
        # for a guest user
        print('is not a guest user')

        # obtain the username and password
        username = request.data.get('username')
        print('username : ' ,username)
        password = request.data.get('password')
        print('password : ' , password)

        # find the useranme and password from the UserAccount model 
        try : 
            base64Password = base64.b64encode(password.encode('ascii')).decode()
            result = UserAccount.objects.get(username = username , password = base64Password)
            print('result user login : ' , result)

            # send_mail(result.email)

            # grant the login access to the user 
            return Response({'message' : 'Login successfully' , 'allInputValueFilesLength' : len(result.allInputValueFiles) , 'email' : result.email} , status = status.HTTP_200_OK)
        except ObjectDoesNotExist as e: 
            print('The user account does not exxists : ' , e)
            return Response({'message' : 'The User Account does not exists'} , status = status.HTTP_400_BAD_REQUEST)
        except Exception as e : 
            print('Invalid credentials : ' , e)
            return Response({'message' : 'Invalid credentials'} , status = status.HTTP_400_BAD_REQUEST)

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
        print('inside teh saveinput file view post')

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