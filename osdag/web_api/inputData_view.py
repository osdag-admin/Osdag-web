from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status
from rest_framework.parsers import JSONParser


# importing models 
from osdag.models import Columns , Beams , Bolt , Bolt_fy_fu, Material


class InputData(APIView) : 


    """
    method : GET 
    format : Query parameters : 
        moduleName = <String>
        connectivity = <String>
        boltDiameter = <String> ( Optional query )
        propertyClass = <String> ( Optional query )
    
    Example : 
        moduleName = Fin Plate Connection
        connectivity = Beam-Beam

        boltDiameter = Customized 
        propertyClass = Customized
    
    Example URL would look like this : 
        1. http://127.0.0.1:8000/populate?moduleName=FIn-Plate-Connection&connectivity=Column-Flange-Beam-Web
        2. http://127.0.0.1:8000/populate?moduleName=FIn-Plate-Connection&boltDiameter=Customized
        3. http://127.0.0.1:8000/populate?moduleName=FIn-Plate-Connection&propertyClass=Customized
        4. http://127.0.0.1:8000/populate?moduleName=FIn-Plate-Connection&connectivity=Column-Web-Beam-Web
        5. http://127.0.0.1:8000/populate?moduleName=FIn-Plate-Connection ( REQUEST NOT HANDLED YET )

    """
    def get(self , request) : 
        moduleName = request.GET.get("moduleName")
        connectivity = request.GET.get("connectivity")
        boltDiameter = request.GET.get("boltDiameter")
        propertyClass = request.GET.get("propertyClass")
        
        
        if ( connectivity=='Column-Flange-Beam-Web' or connectivity=='Column-Web-Beam-Web') : 
            print('connectivity : ' , connectivity)

            try : 
                # fetch all records from Column table 
                # fetch all records from Beam table 
                # fetch all records from Material table 

                columnList = list(Columns.objects.values_list('Designation' , flat = True))
                beamList = list(Beams.objects.values_list('Designation' , flat = True))
                materialList = list(Material.objects.values_list('Grade' , flat = True))
                
                response = {
                    'columnList' : columnList,
                    'beamList' : beamList,
                    'materialList' : materialList
                }

                return Response(response , status = status.HTTP_200_OK)
        
            except : 
                return Response({"error" : "Bad request"} , status=status.HTTP_400_BAD_REQUEST)

        

        elif (connectivity=='Beam-Beam') : 
            print('connectivity : ' , connectivity)

            # fetch all records from Beams table 
            # fetch all recorsd from the Material Table
            try : 
                beamList = list(Beams.objects.values_list('Designation' , flat = True))
                materialList = list(Material.objects.values_list('Grade' , flat = True))
                response = {
                    'beamList' : beamList,
                    'materialList' : materialList
                }

                return Response(response , status = 200)
            
            except : 
                return Response({"error" : "Bad request"} , status=status.HTTP_400_BAD_REQUEST)
        
        elif (boltDiameter=='Customized') : 
            print('boltDiameter : ' , boltDiameter)

            # fetch the data from Bolt table 
            try :                 
                print('fetching')
                boltList = list(Bolt.objects.values_list('Bolt_diameter' , flat = True))  
                print(boltList)  
                response = {
                    'boltList' : boltList
                }

                return Response(response , status = status.HTTP_200_OK)
            
            except : 
                return Response({"error" : "Something went wrong"} , status = status.HTTP_400_BAD_REQUEST)
        
        elif (propertyClass=='Customized') : 
            print('propertyClass : ' , propertyClass)

            # fetch the data from Bolt_fy_fu table 
            try :     
                boltFyFuList = list(Bolt_fy_fu.objects.values_list('Property_Class' , flat = True))    

                response = {
                    'propertyClassList' : boltFyFuList
                }

                return Response(response , status = status.HTTP_200_OK)
            
            except : 
                return Response({"error" : "Something went wrong"} , status = status.HTTP_400_BAD_REQUEST)



class DesignView(APIView) : 

    parser_classes = [JSONParser]

    """
    Endpoint : http://127.0.0.1:8000/design

    format : 
        {
            "data" : ...
        }

    method : POST
    Content-Type : application/JSON
    """
    
    def post(self , request) : 

        try : 
            data = request.data

            print('data : ' , data)

            return Response({'success' : 'Request made successfully'} , status = status.HTTP_200_OK)
        
        except : 
            return Response({'error' : 'Something went wrong'} , status = status.HTTP_400_BAD_REQUEST)