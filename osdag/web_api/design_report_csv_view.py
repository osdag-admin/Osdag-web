from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.utils.crypto import get_random_string
from django.http import FileResponse

from osdag_api.modules.fin_plate_connection import create_from_input

# importing models
from osdag.models import Design

from django.core.files.storage import default_storage


# DRF imports
from rest_framework.parsers import MultiPartParser , FormParser
from rest_framework import status 


# other imports
import os
import platform
import subprocess
import json
import time
import uuid

class CreateDesignReport(APIView):

    def post(self, request):
        # print('request.metadata : ' , request.data)
        # metadata = request.data
        # obtain teh cookies
        metadata = request.data.get('metadata')
        print('metadata : ' , metadata)
        cookie_id = request.COOKIES.get('fin_plate_connection_session')
        print('cookie_id : ', cookie_id)

        # obtain the currenct working directory as it gets changed in the osdag desktop code, then 
        # we will use the same value to bring it back to the current directory 
        current_directory = os.getcwd()
        print('current_directory : '  , current_directory)


        # obtain the input_values, logs, design_status from using the cookie_id
        designObject = Design.objects.get(cookie_id=cookie_id)
        input_values = designObject.input_values
        design_status = designObject.design_status
        logs = designObject.logs
        print('input_values : ', input_values)
        print('type of input_values : ', type(input_values))
        print('logs : ', logs)
        print('logs type ; ', type(logs))
        print('design_status : ' , design_status )

        if (metadata is None or metadata is ''):
            print('The metadata is None ')
            print('Setting the default metadata values')
            metadata_profile = {
                "CompanyName": "Your Company",
                "CompanyLogo": "",
                "Group/TeamName": "Your Team",
                "Designer": "You"
            }

            metadata_other = {
                "ProjectTitle": "Fin Plate Connection",
                "Subtitle": "",
                "JobNumber": "1",
                "AdditionalComments": "No Comments",
                "Client": "Someone else",
            }
            # generate a random string for report id
            report_id = get_random_string(length=16)
            file_path = "file_storage/design_report/" + report_id

            # appenend the file path in the meta data
            metadata_final = {
                "ProfileSummary": metadata_profile, "filename": file_path}
            for key in metadata_other.keys():
                metadata_final[key] = metadata_other[key]

            metadata_final['does_design_exist'] = design_status
            metadata_final['logger_messages'] = logs
            print('metadata final : ', json.dumps(metadata_final, indent=4))

        else : 
            # generate a random string for report id
            report_id = get_random_string(length=16)
            file_path = "file_storage/design_report/" + report_id
            metadata_final = metadata
            metadata_final['does_design_exist'] = design_status
            metadata_final['logger_messages'] = logs
            metadata_final['filename'] = file_path
            print('metadata final : ' , metadata_final)
            # print('LogoFullPath : ' , metadata_final['CompanyLogo'])

        # check if the design_report folder has been created or not 
        # if not, create one 
        cwd = os.path.join(os.getcwd() , "file_storage/design_report/")
        print('cwd_path : ' , cwd)
        if(not os.path.exists) :
            print('path does not exists, creating one : ', cwd)
            os.mkdir(cwd) 

        try:
            print('creating module from input')
            module = create_from_input(input_values)
        except Exception as e:
            print('e : ', e)

        try:
            print('generating the report .save_design')
            resultBoolean = module.save_design(metadata_final)
        except Exception as e:
            print('e : ', e)
        
        if(resultBoolean):
            print('The LaTEX file has been created successfully')


        
        os.chdir(current_directory)
        print('cwd after chdir : ' , os.getcwd())

        if (resultBoolean):
            print('inside sleep')
            # time.sleep(10)
            isExists = os.path.exists(f'{os.getcwd()}/file_storage/design_report/{report_id}.tex')
            print('report path : ' , f'{os.getcwd()}/{report_id}.tex')
            print('isExists : ' , isExists)
            # open and read the file contents
            f = open(f'{os.getcwd()}/file_storage/design_report/{report_id}.tex', 'rb')

            return Response({'success': 'Design report created', 'report_id': report_id, 'fileContents : ': f}, status=status.HTTP_201_CREATED)

        elif(not resultBoolean): 
            print('Error in generating the desing_report')
            return Response({"message" : "Error in generating the design report"})


class GetPDF(APIView):

    def get(self, request):
        print('Inside get PDF')

        # check cookie
        try:
            cookie_id = request.COOKIES.get('fin_plate_connection_session')
            print('cookie id in getPDF:', cookie_id)
        except Exception as e:
            print('e:', e)

        # obtain the param from the Query
        report_id = request.GET.get('report_id')
        print('report_id:', report_id)

        # TeX source filename
        tex_filename = f'{report_id}.tex'
        filename, ext = os.path.splitext(tex_filename)
        print('filename:', filename)
        # the corresponding PDF filename
        pdf_filename = filename + '.pdf'

        # change the working directory
        path = os.getcwd()
        print('pdf path : ' , pdf_filename)
        os.chdir(path)
        print('current path after chdir : ' , path)
        pdfFilePath = f'{os.getcwd()}/file_storage/design_report/{report_id}.pdf'
        print('pdfFilePath : ' , pdfFilePath)

        # compile TeX file for different operating systems
        if platform.system().lower() == 'windows':
            subprocess.run(['cmd', '/c', 'echo', '%cd%'])
            subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', tex_filename])
        else:
            subprocess.run(['pwd'])
            subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', tex_filename])

        # check if PDF is successfully generated
        if not os.path.exists(pdfFilePath):
            raise RuntimeError('PDF output not found')

        # open PDF with platform-specific command
        if platform.system().lower() == 'darwin':
            subprocess.run(['open', pdfFilePath])
        elif platform.system().lower() == 'windows':
            os.startfile(pdfFilePath)
        elif platform.system().lower() == 'linux':
            subprocess.run(['xdg-open', pdfFilePath])
        else:
            raise RuntimeError(
                'Unknown operating system "{}"'.format(platform.system()))

        # delete the extra aux, log files, tex files generated in design_report
        print('getcwd : ' , os.getcwd())
        try:
            # delete the following paths onyl when the pdf file is created 
            if(os.path.exists(f'{os.getcwd()}/file_storage/design_report/{report_id}.pdf')) : 
                os.remove(f'{os.getcwd()}/file_storage/design_report/{report_id}.aux')
                os.remove(f'{os.getcwd()}/file_storage/design_report/{report_id}.log')
                os.remove(f'{os.getcwd()}/file_storage/design_report/{report_id}.tex')
            else : 
                print('the pdf file is being created, cannot remove the other files')
        except Exception as e:
            print('e:', e)

        # Return the PDF file as a response
        # pdf_path = f'{os.getcwd()}/{report_id}.pdf'
        response = FileResponse(open(pdfFilePath, 'rb'))
        response['Content-Type'] = 'application/pdf'
        response['Content-Disposition'] = f'attachment; filename="{report_id}.pdf"'
        for key, value in response.items():
            print(f'{key}: {value}')
        return response


class CompanyLogoView(APIView) : 
    parser_classes = (MultiPartParser , FormParser)

    def post(self, request):
        print('inside company logo post') 
        # check cookie
        try:
            cookie_id = request.COOKIES.get('fin_plate_connection_session')
            print('cookie id in companyLogo:', cookie_id)
        except Exception as e:
            print('e:', e)

        # obtain the file 
        print('request data : ' , request.data)
        file = request.data['file']
        
        # generate a unique name for the file 
        fileName = ''.join(str(uuid.uuid4()).split('-')) + ".png"
        print('fileName created : ' , fileName)
        currentDirectory = os.getcwd()
        
        # create the png file 
        try :       
            with open(currentDirectory+"/file_storage/company_logo/"+fileName , 'w') as fp : 
                pass 
        except : 
            print('Error in creating the image file')

        print('currentWorkingDirectory : ' , currentDirectory)
        try : 
            with default_storage.open(currentDirectory+"/file_storage/company_logo/"+fileName, 'wb+') as destination : 
                for chunk in file.chunks() :                 
                    destination.write(chunk)
            print('file saved')

            # full path of the company logo w.r.t the Project 
            logoFullPath = currentDirectory+"/file_storage/company_logo/"+fileName
            print('logoFullPath : ' , logoFullPath)
            return Response({'message' : 'successfully saved file' , 'logoFullPath' : logoFullPath} , status = status.HTTP_201_CREATED)
        except : 
            print('Error in saving the file ')

            return Response({'message' : 'Error in saving the file'} , status = status.HTTP_400_BAD_REQUEST)