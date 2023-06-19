from rest_framework.response import Response 
from rest_framework import status 
from rest_framework.views import APIView 
from django.utils.crypto import get_random_string

from osdag_api.modules.fin_plate_connection import create_from_input

# importign serializers
from osdag.models import Design

class CreateDesignReport(APIView) : 

    def post(self, request) :
        # print('request.metadata : ' , request.data)
        # metadata = request.data
        # obtain teh cookies 
        metadata = None
        cookie_id = request.COOKIES.get('fin_plate_connection_session')
        print('cookie_id : ' , cookie_id)

        # obtain the input_values from using the cookie_id
        designObject = Design.objects.get(cookie_id = cookie_id)
        input_values = designObject.input_values
        logs = designObject.logs
        print('input_values : ' , input_values)
        print('type of input_values : ' , type(input_values))
        print('logs : ' , logs)
        print('logs type ; ' , type(logs))


        if (metadata is None or metadata is '') : 
            print('The metadata is None ')
            print('Setting the default metadata values')
            metadata_profile = {
                "CompanyName" : "Your Company",
                "CompanyLogo" : "",
                "Group/TeamName" : "Your Team",
                "Designer" : "You"
            }
            
            metadata_other = {
                "ProjectTitle" : "Fin Plate Connection",
                "Subtitle" : "",
                "JobNumber" : "1",
                "AdditionalComments" : "No Comments",
                "Client" : "Someone else",
            }
            # generate a random string for report id 
            report_id = get_random_string(length=16)
            file_path = "file_storage/design_report/" + report_id

            # appenend the file path in the meta data 
            metadata_final = {"ProfileSummary" : metadata_profile , "filename" : file_path}
            for key in metadata_other.keys() : 
                metadata_final[key] = metadata_other[key]
            
            metadata_final['does_design_exist'] = 'Yes'
            metadata_final['logger_messages'] = logs
            print('metadata final : ' , metadata_final)

            
            module = create_from_input(input_values)
            module.save_design(metadata_final)
            

            return Response({'success' : 'Design report created'} , status = status.HTTP_201_CREATED)
        




class SaveCSV(APIView) :

    def get(self ,request) :
        pass 