import uuid
import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from ..models import EndPlateDesign
from ..serializers import EndPlateInputSerializer, EndPlateOutputSerializer
from osdag_api.modules.end_plate_connection import perform_design_calculations
from cad.common_logic import create_3d_model


@method_decorator(csrf_exempt, name='dispatch')
class BeamToBeamDesignAPI(APIView):
    parser_classes = (MultiPartParser, JSONParser)

    def transform_input_data(self, raw_data):
        """Transform raw request data into expected format"""
        try:
            # Ensure arrays are properly formatted
            bolt_diameter = raw_data.get('boltDiameter', [])
            property_class = raw_data.get('propertyClass', [])
            end_plate_thickness = raw_data.get('endPlateThickness', [])

            # Ensure values are lists of strings that can be converted to integers
            if isinstance(bolt_diameter, (str, int)):
                bolt_diameter = [str(bolt_diameter)]
            elif isinstance(bolt_diameter, list):
                bolt_diameter = [str(x) for x in bolt_diameter]
            else:
                bolt_diameter = []

            if not bolt_diameter or not all(str(x).replace('.', '').isdigit() for x in bolt_diameter):
                raise ValueError("Bolt diameter must be a non-empty list of numeric values")

            transformed_data = {
                "Connectivity": raw_data.get('connectivity', ''),
                "EndPlate.Type": raw_data.get('endPlateType', ''),
                "Member.Beam.Designation": raw_data.get('beamSection', ''),
                "Material": raw_data.get('material', ''),
                "Load.Moment": float(raw_data.get('bendingMoment', 0)),
                "Load.Shear": float(raw_data.get('shearForce', 0)),
                "Load.Axial": float(raw_data.get('axialForce', 0)),
                "Bolt.Type": raw_data.get('boltType', ''),
                "Bolt.Diameter": bolt_diameter,
                "Bolt.Grade": property_class,
                "EndPlate.Thickness": end_plate_thickness,
                "Weld.Type": raw_data.get('weldType', ''),
                "beam_length": 1000,
                "beam_width": 200,
                "beam_height": 300,
                "Module": "Beam-Beam End Plate",
                "Weld.Fab": "Shop Weld",
                "Weld.Material_Grade_OverWrite": "410",
                "Connector.Plate.Thickness_List": end_plate_thickness
            }
            return transformed_data
        except (TypeError, ValueError) as e:
            raise ValueError(f"Error transforming input data: {str(e)}")

    def post(self, request, *args, **kwargs):
        try:
            input_data = self.transform_input_data(request.data)
            result = perform_design_calculations(input_data)
            
            # Generate unique session ID
            session_id = str(uuid.uuid4())

            # Create 3D model
            model_path = create_3d_model(input_data, session_id)
            
            if not model_path:
                return Response(
                    {"error": "Failed to generate 3D model"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Store in database
            EndPlateDesign.objects.create(
                session_id=session_id,
                input_values=input_data,
                output_values=result.get("output", {}),
                cad_model=model_path
            )

            return Response({
                "status": "success",
                "session_id": session_id,
                "model_path": model_path
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request, *args, **kwargs):
        """Get design output values"""
        session_id = request.COOKIES.get('design_session')
        if not session_id:
            return Response(
                {"error": "No active design session"},
                status=status.HTTP_400_BAD_REQUEST
            )

        design = EndPlateDesign.objects.filter(session_id=session_id).first()
        if not design:
            return Response(
                {"error": "Design session not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = EndPlateOutputSerializer(design)
        return Response(serializer.data)








# import uuid
# import os
# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.parsers import MultiPartParser, JSONParser
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from django.conf import settings
# from ..models import EndPlateDesign
# from ..serializers import EndPlateInputSerializer, EndPlateOutputSerializer
# from osdag_api.modules.end_plate_connection import perform_design_calculations
# from cad.common_logic import create_3d_model, convert_step_to_stl


# @method_decorator(csrf_exempt, name='dispatch')
# class BeamToBeamDesignAPI(APIView):
#     parser_classes = (MultiPartParser, JSONParser)

#     def transform_input_data(self, raw_data):
#         """Transform raw request data into expected format"""
#         try:
#             # Ensure arrays are properly formatted with proper validation
#             bolt_diameter = raw_data.get('boltDiameter', [])
#             property_class = raw_data.get('propertyClass', [])
#             end_plate_thickness = raw_data.get('endPlateThickness', [])

#             # Convert bolt_diameter to list of strings
#             if isinstance(bolt_diameter, (str, int, float)):
#                 bolt_diameter = [str(int(float(bolt_diameter)))]
#             elif isinstance(bolt_diameter, list):
#                 bolt_diameter = [str(int(float(x))) for x in bolt_diameter if str(x).replace('.', '').isdigit()]
            
#             # Validate bolt diameter
#             if not bolt_diameter:
#                 raise ValueError("Bolt diameter must be a non-empty list of numeric values")

#             # Convert property_class to list if it's not
#             if isinstance(property_class, str):
#                 property_class = [property_class]
            
#             # Convert end_plate_thickness to list if it's not
#             if isinstance(end_plate_thickness, (str, int, float)):
#                 end_plate_thickness = [str(float(end_plate_thickness))]
#             elif isinstance(end_plate_thickness, list):
#                 end_plate_thickness = [str(float(x)) for x in end_plate_thickness if str(x).replace('.', '').isdigit()]

#             transformed_data = {
#                 "Connectivity": raw_data.get('connectivity', 'Column Flange-Beam'),  # Set default value
#                 "EndPlate.Type": raw_data.get('endPlateType', 'Extended Both Ways'),  # Set default value
#                 "Member.Beam.Designation": raw_data.get('beamSection', ''),
#                 "Member.Supporting_Section.Material": raw_data.get('material', 'E 250'),  # Add missing field
#                 "Material": raw_data.get('material', 'E 250'),
#                 "Load.Moment": float(raw_data.get('bendingMoment', 0)),
#                 "Load.Shear": float(raw_data.get('shearForce', 0)),
#                 "Load.Axial": float(raw_data.get('axialForce', 0)),
#                 "Bolt.Type": raw_data.get('boltType', 'Pretensioned'),  # Set default value
#                 "Bolt.Diameter": bolt_diameter,
#                 "Bolt.Grade": property_class,
#                 "EndPlate.Thickness": end_plate_thickness,
#                 "Weld.Type": raw_data.get('weldType', 'Fillet'),  # Set default value
#                 "beam_length": 1000,
#                 "beam_width": 200,
#                 "beam_height": 300,
#                 "Module": "Beam-Beam End Plate",
#                 "Weld.Fab": "Shop Weld",
#                 "Weld.Material_Grade_OverWrite": "410",
#                 "Connector.Plate.Thickness_List": end_plate_thickness
#             }
#             return transformed_data
#         except (TypeError, ValueError) as e:
#             raise ValueError(f"Error transforming input data: {str(e)}")

#     def post(self, request, *args, **kwargs):
#         try:
#             # Transform input data
#             input_data = self.transform_input_data(request.data)
            
#             # Perform calculations
#             result = perform_design_calculations(input_data)
            
#             # Generate unique session ID
#             session_id = str(uuid.uuid4())

#             # Create model with error handling
#             model_path = None
#             try:
#                 # Generate STEP file
#                 step_path = create_3d_model(input_data, session_id)
                
#                 if step_path and step_path.endswith('.step'):
#                     # Convert to STL
#                     stl_path = step_path.replace('.step', '.stl')
#                     if convert_step_to_stl(step_path, stl_path):
#                         model_path = stl_path
#                         print(f"Model converted successfully: {model_path}")
#                     else:
#                         model_path = step_path
#                         print("STL conversion failed, using STEP file")
#                 else:
#                     model_path = step_path

#             except Exception as model_error:
#                 print(f"Model generation error: {str(model_error)}")
#                 model_path = None

#             # Store in database
#             design_output = result.get("output", {})
#             EndPlateDesign.objects.create(
#                 session_id=session_id,
#                 input_values=input_data,
#                 output_values=design_output,
#                 cad_model=model_path
#             )

#             # Set cookie in response
#             response = Response({
#                 "status": "success",
#                 "session_id": session_id,
#                 "data": {
#                     "input": input_data,
#                     "output": design_output,
#                     "model_path": model_path
#                 }
#             })
#             response.set_cookie('design_session', session_id)
            
#             return response

#         except ValueError as ve:
#             return Response(
#                 {"error": str(ve)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             return Response(
#                 {"error": f"Unexpected error: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def get(self, request, *args, **kwargs):
#         """Get design output values"""
#         session_id = request.COOKIES.get('design_session')
#         if not session_id:
#             return Response(
#                 {"error": "No active design session"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         design = EndPlateDesign.objects.filter(session_id=session_id).first()
#         if not design:
#             return Response(
#                 {"error": "Design session not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         serializer = EndPlateOutputSerializer(design)
#         return Response(serializer.data)




