
# DRF imports 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser

# importing serializers
from osdag.serializers import UserSerializer


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

        # append the username in the User table ( in the username array )
        # create a JSON object that maps the username to the password and add it to the User table ( passsword column )
        serializer = UserSerializer(username , password)
        if(serializer.is_valid()) : 
            # save the serializer 
            serializer.save()

            # return 201 
            return Response({'message' : 'The credentials have been created'} , status = status.HTTP__201_CREATED ) 
        else : 
            print('serializer is invalid ')
            print('error : ' , serializer.errors)

            return Response({'message' , 'The credentials ahve not been created'} , status = status.HTTP_400_BAD_REQUEST)
    