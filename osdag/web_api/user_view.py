#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

# DRF imports 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated

# simpleJWT imports 
from rest_framework_simplejwt.tokens import RefreshToken

# django imports 
from django.conf import settings

# importing serializers
from osdag.serializers import User_Serializer

# other imports 
from cryptography.fernet import Fernet


# obtain the attributes 
SECRET_ROOT = getattr(settings, 'SECRET_ROOT' , "")


class SignupView(APIView) :
    def post(self , request) : 
        print('inside the suerview post')

        # check for cookies 
        cookie_id = request.data.get('fin_plate_connection_session')
        print('cookie_id : ' , cookie_id)
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) # Returns error response.
        
        # obtain the useranme and password 
        username = request.data.get("username")
        password = request.data.get("password")
        
        # encrypt the password
        key = Fernet.generate_key()
        # later use the same key to decrypt the password
        
        # save the key in a file 
        targetFilePath = SECRET_ROOT + "key.txt"
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
        
        # checking cookies 
        cookie_id = request.data.get('fin_plate_connection_session')
        print('cookie_id : ' , cookie_id)
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) # Returns error response.
        
        # obtain the new passwrod 
        password = request.data.get('password')

        # PARTIAL WORK, WORK IN PROGRESS 
        return Response({'message' , 'Something goes here'} , status = status.HTTP_201_CREATED)
    

    def get(self , request) : 
        print('inside the forget password get')

        # checking cookies
        cookie_id = request.data.get('fin_plate_connection_session')
        print('cookie_id : ' , cookie_id)
        if cookie_id == None or cookie_id == '': # Error Checking: If design session id provided.
            return Response("Error: Please open module", status=status.HTTP_400_BAD_REQUEST) # Returns error response.
        
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

