# DRF imports 
from rest_framework.response import Response
from rest_framework import status 
from rest_framework.views import APIView

# defining gthe APIviews here 
class GoogleSSOView(APIView) : 
    
    def get(self , request):  
        print('inside teh GoogleSSOView')

        print('APIview under development')

        return Response({'message' , 'GoogleSSO under development'} , status = status.HTTP_200_OK)