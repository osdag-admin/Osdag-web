from rest_framework.response import Response 
from rest_framework import status 
from rest_framework.views import APIView 
from django.utils.crypto import get_random_string
from django.core.files import File
from django.http import HttpResponse
from django.http import FileResponse

from osdag_api.modules.fin_plate_connection import create_from_input

# importign serializers
from osdag.models import Design


# other imports
import os 
import platform
import subprocess
import base64


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

            try :
                print('creating module from input') 
                module = create_from_input(input_values)
            except Exception as e : 
                print('e : ' , e)

            try : 
                print('generating the report .save_design')
                resultBoolean = module.save_design(metadata_final)
                if(resultBoolean) :
                    print('The LaTEX file has been created successfully')
                
            except Exception as e : 
                print('e : ' , e)

            if (resultBoolean) : 
                # open and read the file contents 
                f = open(f'/home/atharva007/Documents/GitHub/Osdag-web/file_storage/design_report/{report_id}.tex' , 'rb')
            
            
            return Response({'success' : 'Design report created' , 'report_id' : report_id , 'fileContents : ' : f} , status = status.HTTP_201_CREATED)
        




class SaveCSV(APIView) :

    def get(self ,request) :
        pass 



class GetPDF(APIView) : 

    def get(self, request) : 
        print('Inside get PDF')
        
        # check cookie 
        try : 
            cookie_id = request.COOKIES.get('fin_plate_connection_session')
            print('cookie id in getPDF : ' , cookie_id)
        except Exception as e : 
            print('e : ' , e)
        
        # obtain the param from the Query
        report_id = request.GET.get('report_id')
        print('report_id : ' , report_id)

        # TeX source filename
        tex_filename = f'{report_id}.tex'
        filename, ext = os.path.splitext(tex_filename)
        print('filename : ' , filename)
        # the corresponding PDF filename
        pdf_filename = filename + '.pdf'

        # change the working directory 
        os.chdir('/home/atharva007/Documents/GitHub/Osdag-web/file_storage/design_report/')

        # compile TeX file
        subprocess.run(['pwd'])
        subprocess.run(['pdflatex', '-interaction=nonstopmode', tex_filename])

        # check if PDF is successfully generated
        if not os.path.exists(pdf_filename):
            raise RuntimeError('PDF output not found')

        # open PDF with platform-specific command
        if platform.system().lower() == 'darwin':
            subprocess.run(['open', pdf_filename])
        elif platform.system().lower() == 'windows':
            os.startfile(pdf_filename)
        elif platform.system().lower() == 'linux':
            subprocess.run(['xdg-open', pdf_filename])
        else:
            raise RuntimeError('Unknown operating system "{}"'.format(platform.system()))

        # delete the extra aux, log files, tex files generated in design_report 
        try : 
            os.remove(f'{report_id}.aux')
            os.remove(f'{report_id}.log')
            os.remove(f'{report_id}.tex')
        except Exception as e : 
            print('e : ' , e)

        try : 
            #f = open(f'/home/atharva007/Documents/GitHub/Osdag-web/file_storage/design_report/{report_id}.pdf' , 'rb')
            # encoded = f.encode('ascii')
            #print('f : ' , f)
            #pdfFile = File(f)
            #print('pdfFile : ' , pdfFile)


            with open(f'/home/atharva007/Documents/GitHub/Osdag-web/file_storage/design_report/{report_id}.pdf', 'rb') as pdf_file:
                response = HttpResponse(content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="your_file_name.pdf"'
                response.write(pdf_file.read())
                return response
            
            #encoded_string = ''
            #with open(f'/home/atharva007/Documents/GitHub/Osdag-web/file_storage/design_report/{report_id}.pdf' , 'rb') as pdf_file : 
            #    encoded_string = base64.b64encode(pdf_file.read())

            #print('encoded string : ' , encoded_string)
            #print('length of the encoded string : ' , len(encoded_string))
            #return Response({'reader' : encoded_string , 'report_id' : report_id} , status = status.HTTP_200_OK)
            
            #response = HttpResponse(pdfFile.read())
            #response['Content-Type'] = 'application/pdf'
            #response['Content-Disposition'] = 'attachment;filename=design_report_{report_id}.pdf'
            #return response

            #return Response({'render' : pdfFile.read()},  status = status.HTTP_200_OK)

            # with open(f'{report_id}.pdf' , 'rb') as pdf_file : 
            #    encoded_string = base64.b64encode(pdf_file.read())
            #    base_64 = encoded_string.decode('ascii')

            #print('base_64 string : ' , base_64)
            
            #return HttpResponse(base_64 , status = 200)
            
            # return FileResponse(open(f'{report_id}.pdf' , 'rb'))
        
        except Exception as e : 
            print('e : ' , e)
            response = HttpResponse('Error' , status = 400)
            return response
        
        
