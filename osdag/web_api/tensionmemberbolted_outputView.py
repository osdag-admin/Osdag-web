from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from osdag_api import get_module_api
from osdag.models import Design
from osdag.serializers import Design_Serializer

@method_decorator(csrf_exempt, name='dispatch')
class TensionMemberBoltedOutputData(APIView):
    def post(self, request):
        # Obtain session cookie and input values
        cookie_id = request.COOKIES.get('tension_member_bolted_design_session')
        print('in tension_outputView.py: cookie id in tension member bolted design output data ', cookie_id)
        module_api = get_module_api('Tension Member Bolted Design')
        input_values = request.data
        tempData = {
            'cookie_id': cookie_id,
            'module_id': 'Tension Member Bolted Design',
            'input_values': input_values
        }

        # Retrieve and update the Design record
        try:
            print('in tension_outputView.py: Trying to get Design record')
            designRecord = Design.objects.get(cookie_id=cookie_id)
            serializer = Design_Serializer(designRecord, data=tempData)
            print('in tension_outputView.py: Design session found')
        except Design.DoesNotExist:
            print('in tension_outputView.py: Design session not found')
            return Response('Session not found', status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            print('in tension_outputView.py: Serializer is valid')
            try:
                serializer.save()
                print('in tension_outputView.py: Serializer saved successfully')
            except Exception as e:
                print('in tension_outputView.py: Error saving serializer:', e)
        else:
            print('in tension_outputView.py: Serializer is invalid. Errors:', serializer.errors)
            return Response('Serializer is invalid', status=status.HTTP_400_BAD_REQUEST)

        output = {}
        logs = []
        new_logs = []
        try:
            print('in tension_outputView.py: Trying to generate output')
            try:
                output, logs = module_api.generate_output(input_values)
                print('in tension_outputView.py: Output generated successfully')
            except Exception as e:
                print('in tension_outputView.py: Error in generating output:', e)
            print('in tension_outputView.py: Processing logs')
            for log in logs:
                if log not in new_logs:
                    new_logs.append(log)
        except Exception as e:
            print('in tension_outputView.py: Exception raised:', e)
            return JsonResponse({"data": {}, "logs": new_logs, "success": False}, safe=False, status=400)

        print('in tension_outputView.py: Combining logs')
        finalLogsString = self.combine_logs(new_logs)

        try:
            print('in tension_outputView.py: Trying to update Design object')
            designObject = Design.objects.get(cookie_id=cookie_id)
            designObject.logs = finalLogsString
            designObject.output_values = output
            print('in tension_outputView.py: Checking output validity')
            output_result = self.check_non_zero_output(output)
            if (output == "" or output == 0 or not output_result):
                print('in tension_outputView.py: Setting design_status to False')
                designObject.design_status = False
            else:
                print('in tension_outputView.py: Setting design_status to True')
                designObject.design_status = True
            designObject.save()
            print('in tension_outputView.py: Design object saved successfully')
        except Exception as e:
            print('in tension_outputView.py: Error saving logs/output in Design table:', e)

        print('in tension_outputView.py: Returning final response')
        return JsonResponse({"data": output, "logs": new_logs, "success": True}, safe=False, status=201)

    def combine_logs(self, logs):
        print('in tension_outputView.py: Entered combine_logs method')
        finalLogsString = ""
        print('in tension_outputView.py: Processing', len(logs), 'log entries')
        for item in logs:
            msg = item.get('msg', '')
            print('in tension_outputView.py: Processing log message:', msg)
            finalLogsString += msg + '\n'
        print('in tension_outputView.py: Combined logs string length:', len(finalLogsString))
        return finalLogsString

    def check_non_zero_output(self, output):
        print('in tension_outputView.py: Entered check_non_zero_output method')
        flag = False
        for item in output:
            val = None
            print('in tension_outputView.py: Processing item:', item)
            
            if isinstance(output[item], dict):
                print('in tension_outputView.py: Processing dictionary item')
                val = output[item].get('val') or output[item].get('value')
                print('in tension_outputView.py: Dictionary value:', val)
                
            elif isinstance(output[item], list) and len(output[item]) > 0:
                print('in tension_outputView.py: Processing list item')
                for subitem in output[item]:
                    subval = subitem.get('val') or subitem.get('value')
                    print('in tension_outputView.py: List subitem value:', subval)
                    if subval and abs(float(subval)) > 1e-9:
                        print(f'Non-zero value found in list for {item}: {subval}')
                        return True
                        
            if val and abs(float(val)) > 1e-9:
                print(f'Non-zero value found for {item}: {val}')
                flag = True
                break
                
        print(f'Final check_non_zero_output result: {flag}')
        return flag
