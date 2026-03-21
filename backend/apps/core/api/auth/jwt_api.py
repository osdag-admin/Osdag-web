#########################################################
# Author : Atharva Pinagle ( FOSSEE SUmmer Fellow '23 ) #
#########################################################

# DRF imports 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class JWTHomeView(APIView) : 

    permission_classes = (IsAuthenticated,)
    # add this permission class to authenticate the user for all the views of the project

    def get(self,  request) : 
        print('inside the JWTHomeView get')

        content = {'message' , 'Welcome to the JWT Authentication page'}
        return Response(content , status = status.HTTP_200_OK)
