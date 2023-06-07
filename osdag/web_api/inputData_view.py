from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status

import psycopg2
from osdag_web import postgres_credentials

class InputData(APIView) : 

    def fetchFromColumn(self , conn) :
        cursor = conn.cursor()
        query = cursor.execute('SELECT "Columns"."Designation" FROM public."Columns" ORDER BY "Id" ASC')
        columnList = []
        for record in cursor.fetchall(): 
            columnList.append(record[0])
        print('executed')

        return columnList

    def fetchFromBeam(self , conn) : 
        cursor = conn.cursor()
        query = cursor.execute('SELECT "Beams"."Designation" FROM public."Beams" ORDER BY "Id" ASC')
        beamList = []
        for record in cursor.fetchall() : 
            beamList.append(record[0])
        print("executed")

        return beamList
    
    def fetchFromMaterial(self, conn) : 
        cursor = conn.cursor()
        query = cursor.execute('SELECT "Material"."Grade" FROM public."Material"')
        materialList = []
        for record in cursor.fetchall() : 
            print(record)
            materialList.append(record[0])
        print("executed")

        return materialList

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
        4. http://127.0.0.1:8000/populate?moduleName=FIn-Plate-Connection ( REQUEST NOT HANDLED YET )


    
    """
    def get(self , request) : 
        print('received')
        moduleName = request.GET.get("moduleName")
        connectivity = request.GET.get("connectivity")
        boltDiameter = request.GET.get("boltDiameter")
        propertyClass = request.GET.get("propertyClass")
        
        
        if ( connectivity=='Column-Flange-Beam-Web') : 
            print('connectivity : ' , connectivity)

            try : 
                # fetch all records from Column table 
                # fetch all records from Beam table 
                # fetch all records from Material table 

                username = postgres_credentials.get_username()
                password = postgres_credentials.get_password()
                conn = psycopg2.connect(database = 'osdagDatabase' , host = '127.0.0.1' , user = username , password = password , port = '5432')

                columnList = self.fetchFromColumn(conn)
                beamList = self.fetchFromBeam(conn)
                materialList = self.fetchFromMaterial(conn)

                response = {
                    'columnList' : columnList,
                    'beamList' : beamList,
                    'materialList' : materialList
                }

                conn.close()

                return Response(response , status = status.HTTP_200_OK)
        
            except : 
                return Response({"error" : "Bad request"} , status=status.HTTP_400_BAD_REQUEST)

        elif (connectivity=='Beam-Beam') : 
            print('connectivity : ' , connectivity)

            # fetch all records from Beam table 

            try : 
                username = postgres_credentials.get_username()
                password = postgres_credentials.get_password()
                conn = psycopg2.connect(database = 'osdagDatabase' , host = '127.0.0.1' , user = username , password = password , port = '5432')

                beamList = self.fetchFromBeam(conn)

                response = {
                    'beamList' : beamList
                }

                conn.close()

                return Response(response , status = 200)
            
            except : 
                return Response({"error" : "Bad request"} , status=status.HTTP_400_BAD_REQUEST)
        
        elif (boltDiameter=='Customized') : 
            print('boltDiameter : ' , boltDiameter)

            # fetch the data from Bolt table 

            try : 
                username = postgres_credentials.get_username()
                password = postgres_credentials.get_password()
                conn = psycopg2.connect(database = 'osdagDatabase' , host = '127.0.0.1' , user = username , password = password , port = '5432')
                cursor = conn.cursor()
                query = cursor.execute('SELECT "Bolt"."Bolt_diameter" FROM public."Bolt"')       
                boltList = []
                for record in cursor.fetchall() : 
                    boltList.append(record[0])
                print("executed")    

                response = {
                    'boltList' : boltList
                }

                conn.close()

                return Response(response , status = status.HTTP_200_OK)
            
            except : 
                return Response({"error" : "Something went wrong"} , status = status.HTTP_400_BAD_REQUEST)
        
        elif (propertyClass=='Customized') : 
            print('propertyClass : ' , propertyClass)

            # fetch the data from Bolt_fy_fu table 

            try : 
                username = postgres_credentials.get_username()
                password = postgres_credentials.get_password()
                conn = psycopg2.connect(database = 'osdagDatabase' , host = '127.0.0.1' , user = username , password = password , port = '5432')
                cursor = conn.cursor()
                query = cursor.execute('SELECT "Bolt_fy_fu"."Property_Class" FROM public."Bolt_fy_fu"')       

                boltFyFuList = []
                for record in cursor.fetchall() : 
                    boltFyFuList.append(record[0])

                print("executed")    

                response = {
                    'propertyClassList' : boltFyFuList
                }

                conn.close()

                return Response(response , status = status.HTTP_200_OK)
            
            except : 
                return Response({"error" : "Something went wrong"} , status = status.HTTP_400_BAD_REQUEST)