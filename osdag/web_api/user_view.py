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
from osdag_web import mailing

# importing serializers 
from osdag.serializers import User_Serializer

# simpleJWT imports 
from rest_framework_simplejwt.tokens import RefreshToken

# importing Django models 
from osdag.models import User

# django imports 
from django.conf import settings

# importing serializers
from osdag.serializers import User_Serializer

# other imports 
from cryptography.fernet import Fernet
import string
import os
import random


# obtain the attributes 
SECRET_ROOT = getattr(settings, 'SECRET_ROOT' , "")


class SignupView(APIView) :
    def post(self , request) : 
        print('inside the signup post')
        
        # obtain the useranme and password 
        temp = request.data
        print('temp : ' , temp)
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get('email')
        print('username : ' , username)
        print('email : ' , email)
        print('password : ' , password)

        # store the username, password and the email in the database using a serializer 

        
        # encrypt the password
        key = Fernet.generate_key()
        print('key : ' , key)
        # later use the same key to decrypt the password
        
        # save the key in a file 
        targetFilePath = SECRET_ROOT + "key.txt"
        print('targetFilePath : ' , targetFilePath)
        try : 
            file_object = open(targetFilePath , "+bw")
            file_object.write(key)
            file_object.close()
            print('key stored in the FS')
        
        except : 
            print('error in saving the key')
            return Response({'message' , 'Error in saving the key'} , status = 500)


        f = Fernet(key)
        token = f.encrypt(password.encode())
        tempData = {
            'username' : username,
            'password' : token
        }

        # append the username in the User table ( in the username array )
        # create a JSON object that maps the username to the password and add it to the User table ( passsword column )
        serializer = User_Serializer(data = tempData)
        if(serializer.is_valid()) : 
            # save the serializer 
            serializer.save()

            # return 201 
            return Response({'message' : 'The credentials have been created'} , status = status.HTTP__201_CREATED ) 
        else : 
            print('serializer is invalid ')
            print('error : ' , serializer.errors)

            return Response({'message' , 'The credentials ahve not been created'} , status = status.HTTP_400_BAD_REQUEST)



class ForgetPasswordView(APIView) : 
    def post(self , request) : 
        print('sindie teh forget password post')
        
        # obtain the new passwrod 
        password = request.data.get('password')

        # PARTIAL WORK, WORK IN PROGRESS 
        return Response({'message' , 'Something goes here'} , status = status.HTTP_201_CREATED)
    

    def get(self , request) : 
        print('inside the forget password get')
        
        # 1. Send the current username to the browser 
        # 2. send the email attached to the username
        # 3. In the browser, the user then types the email, the email is verified against the one which is sent from the Server 
        # 4. If it is matched, then the user enters a new pasword
        
        # this API view just sends the current username and password 
        
        # PARTIAL WORK, WORK IN PROGRESS

        return Response({'message' , 'Something goes here'} , status = status.HTTP_200_OK)
        
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
            pass 
        except : 
            # the email is not present in the the database 
            print('email is not present in the database')

            return Response({'message' , "Email is not registered"} , status = status.HTTP_400_BAD_REQUEST)

        # GENERATE AN OTP
        # K -> is the number of digits in the OTP
        OTP = ''.join(random.choices(string.digits, k = 6))   
        print('OTP : ' , OTP)
        
        # save the OTP somewhere in the FS
        # generate a file with the same name as teh email and store the OTP in the FILE 
        fileName = email.split('@')[0]
        print('fileName : ' ,fileName)
        fileName = fileName + ".txt"
        currentDirectory = os.getcwd()
        print('currentDirectory : ' , currentDirectory)

        # create the file 
        try :       
            with open(currentDirectory+"/file_storage/emails/"+fileName , 'w') as fp : 
                pass 
        except : 
            print('Error in creating the image file')

        # send a mail to this email
        # generate a random OTP and verify if the OTP generated is valid or not 
        try : 
            mailing.send_mail(OTP)
            return Response({'message' : 'OTP Sent'} , status = status.HTTP_200_OK)
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

        # obtain the encrypted username and password 
        username = request.data.get('username')
        password = request.data.get('password')
        print('username : ' , username)
        print('password : ' , password)

        # authenticate the user 

        
        # return a sucess message 
        return Response({'message' : 'User logged in'} , status = status.HTTP_200_OK)


