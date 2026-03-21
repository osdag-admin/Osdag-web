from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils.crypto import get_random_string
from django.http import FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from apps.modules.shear_connection.submodules.fin_plate.adapter import create_from_input as fin_plate_create_from_input
from apps.modules.shear_connection.submodules.end_plate.adapter import create_from_input as end_plate_create_from_input
from apps.modules.shear_connection.submodules.cleat_angle.adapter import create_from_input as cleat_angle_create_from_input
from apps.modules.shear_connection.submodules.seated_angle.adapter import create_from_input as seated_angle_create_from_input
from apps.modules.moment_connection.submodules.beam_beam_cover_plate_bolted.adapter import create_from_input as cover_plate_bolted_create_from_input
from apps.modules.moment_connection.submodules.beam_beam_cover_plate_welded.adapter import create_from_input as cover_plate_welded_create_from_input
from apps.modules.moment_connection.submodules.beam_beam_end_plate.adapter import create_from_input as beam_beam_end_plate_create_from_input
from apps.modules.moment_connection.submodules.beam_column_end_plate.adapter import create_from_input as beam_to_column_end_plate_create_from_input
from apps.modules.moment_connection.submodules.column_column_cover_plate_bolted.adapter import create_from_input as column_cover_plate_bolted_create_from_input
from apps.modules.moment_connection.submodules.column_column_cover_plate_welded.adapter import create_from_input as column_cover_plate_welded_create_from_input
from apps.modules.moment_connection.submodules.column_column_end_plate.adapter import create_from_input as column_end_plate_create_from_input
from apps.modules.tension_member.submodules.bolted.adapter import create_from_input as tension_member_bolted_create_from_input
from apps.modules.tension_member.submodules.welded.adapter import create_from_input as tension_member_welded_create_from_input
# importing models
from apps.core.models import Design

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
import re
import base64

# Helper: filter LaTeX content based on selected sections (section or section/subsection)
def filter_latex_content(latex_content: str, selected_sections):
    if not selected_sections or not isinstance(selected_sections, (list, tuple)):
        return latex_content

    lines = latex_content.split('\n')
    filtered_lines = []
    current_section = None
    current_subsection = None
    include_content = True
    section_started = False

    for line in lines:
        section_match = re.search(r'\\section\{([^}]+)\}', line)
        if section_match:
            current_section = section_match.group(1).strip()
            current_subsection = None
            section_started = True
            include_content = (
                current_section in selected_sections or
                any(sel.startswith(f"{current_section}/") for sel in selected_sections)
            )

        subsection_match = re.search(r'\\subsection\{([^}]+)\}', line)
        if subsection_match and current_section:
            current_subsection = subsection_match.group(1).strip()
            subsection_key = f"{current_section}/{current_subsection}"
            include_content = (
                current_section in selected_sections or
                subsection_key in selected_sections
            )

        if (
            include_content or
            not section_started or
            line.startswith('\\documentclass') or
            line.startswith('\\usepackage') or
            line.startswith('\\title') or
            line.startswith('\\author') or
            line.startswith('\\date') or
            line.startswith('\\begin{document}') or
            line.startswith('\\maketitle') or
            line.startswith('\\end{document}')
        ):
            filtered_lines.append(line)

    return '\n'.join(filtered_lines)

@method_decorator(csrf_exempt, name='dispatch')
class CreateDesignReport(APIView):
    permission_classes = [AllowAny]

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to log all requests, even if blocked by permissions"""
        try:
            result = super().dispatch(request, *args, **kwargs)
            return result
        except Exception as e:
            raise

    def post(self, request):
        # Get metadata and design data from request
        metadata = request.data.get('metadata')
        module_id = request.data.get('module_id')
        input_values = request.data.get('input_values') 
        design_status = request.data.get('design_status', True)
        logs = request.data.get('logs', [])
        # Optional: sections to include (from UI customization popup) and other customization
        sections = request.data.get('sections')  # e.g., ["Introduction", "Inputs", "Outputs/Spacing"]
        customization = request.data.get('customization')  # generic dict for future options
        
        # Optional: pre-rendered images from frontend (data URLs or base64)
        images = request.data.get('images') or {}
        
        # Map module IDs to their respective create_from_input functions
        module_function_map = {
            'FinPlateConnection': fin_plate_create_from_input,
            'EndPlateConnection': end_plate_create_from_input,
            'CleatAngleConnection': cleat_angle_create_from_input,
            'Seated-Angle-Connection': seated_angle_create_from_input,
            'Cover-Plate-Bolted-Connection': cover_plate_bolted_create_from_input,
            'Beam-Beam-End-Plate-Connection': beam_beam_end_plate_create_from_input,
            'Cover-Plate-Welded-Connection': cover_plate_welded_create_from_input,
            'Beam-to-Column-End-Plate-Connection': beam_to_column_end_plate_create_from_input,
            'ColumnCoverPlateBolted': column_cover_plate_bolted_create_from_input,
            'Column-to-Column-Cover-Plate-Welded-Connection': column_cover_plate_welded_create_from_input,
            'Column-to-Column-End-Plate-Connection': column_end_plate_create_from_input,
            'Tension-Member-Bolted-Design': tension_member_bolted_create_from_input,
            'Tension-Member-Welded-Design': tension_member_welded_create_from_input
        }
        
        if not module_id or module_id not in module_function_map:
            return Response({"error": "Invalid or missing module_id"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not input_values:
            return Response({"error": "Missing input_values"}, status=status.HTTP_400_BAD_REQUEST)
            
        create_module_func = module_function_map[module_id]

        # obtain the currenct working directory as it gets changed in the osdag desktop code, then 
        # we will use the same value to bring it back to the current directory 
        current_directory = os.getcwd()
        if (metadata is None or metadata == ''):
            metadata_profile = {
                "CompanyName": "Your Company",
                "CompanyLogo": "",
                "Group/TeamName": "Your Team",
                "Designer": "You"
            }

            metadata_other = {
                "ProjectTitle": "Osdag",
                "Subtitle": "",
                "JobNumber": "1",
                "AdditionalComments": "No Comments",
                "Client": "Someone else",
            }
            # generate a random string for report id
            report_id = get_random_string(length=16)
            # Each report gets its own folder:
            #   file_storage/design_report/{report_id}/{report_id}.tex
            report_root = os.path.join(os.getcwd(), "file_storage", "design_report", report_id)
            os.makedirs(report_root, exist_ok=True)
            file_path = os.path.join(report_root, report_id)

            # append the file path in the meta data
            metadata_final = {
                "ProfileSummary": metadata_profile,
                "filename": file_path,
            }
            for key in metadata_other.keys():
                metadata_final[key] = metadata_other[key]

            metadata_final['does_design_exist'] = design_status
            # Convert logs to string format for LaTeX
            if logs and isinstance(logs, list):
                logger_string = '\n'.join([f"{log.get('timestamp', '')} - {log.get('type', 'INFO')} - {log.get('message', '')}" for log in logs])
            else:
                logger_string = "No logs available"
            metadata_final['logger_messages'] = logger_string
            # Attach optional UI customization
            if sections:
                metadata_final['selected_sections'] = sections
            if customization:
                metadata_final['customization'] = customization

        else : 
            # generate a random string for report id
            report_id = get_random_string(length=16)
            # Each report gets its own folder:
            #   file_storage/design_report/{report_id}/{report_id}.tex
            report_root = os.path.join(os.getcwd(), "file_storage", "design_report", report_id)
            os.makedirs(report_root, exist_ok=True)
            file_path = os.path.join(report_root, report_id)
            metadata_final = metadata
            metadata_final['does_design_exist'] = design_status
            # Convert logs to string format for LaTeX
            if logs and isinstance(logs, list):
                logger_string = '\n'.join([f"{log.get('timestamp', '')} - {log.get('type', 'INFO')} - {log.get('message', '')}" for log in logs])
            else:
                logger_string = "No logs available"
            metadata_final['logger_messages'] = logger_string
            metadata_final['filename'] = file_path
            # Attach optional UI customization
            if sections:
                metadata_final['selected_sections'] = sections
            if customization:
                metadata_final['customization'] = customization

        # check if the design_report root folder has been created or not 
        # if not, create one 
        cwd = os.path.join(os.getcwd(), "file_storage", "design_report")
        os.makedirs(cwd, exist_ok=True)
        
        try:
            module = create_module_func(input_values)
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise

        # ------------------------------------------------------------
        # Normalize metadata/logs for legacy save_design()
        # The desktop report code expects string fields and may call
        # .split() on them; make sure we don't pass lists/dicts.
        # ------------------------------------------------------------
        try:
            raw_logs = metadata_final.get('logs')
            if isinstance(raw_logs, list):
                normalized_lines = []
                for log in raw_logs:
                    if isinstance(log, dict):
                        ts = log.get('timestamp', '')
                        lvl = log.get('type', 'INFO')
                        msg = log.get('message', '')
                        normalized_lines.append(f"{ts} - {lvl} - {msg}")
                    else:
                        normalized_lines.append(str(log))
                metadata_final['logs'] = "\n".join(normalized_lines)

            # Ensure logger_messages is a plain string
            if isinstance(metadata_final.get('logger_messages'), list):
                metadata_final['logger_messages'] = "\n".join(
                    str(x) for x in metadata_final['logger_messages']
                )
        except Exception as norm_exc:
            # Don't fail report generation just because normalization failed;
            # log and continue with original metadata.
            pass

        from osdag_core.Common import KEY_DISP_FINPLATE, KEY_DISP_ENDPLATE
        
        # Fix module.module if it doesn't match KEY_DISP_FINPLATE or KEY_DISP_ENDPLATE
        # This is needed for parent save_design() to set report_input
        if hasattr(module, 'module'):
            if module.module == 'FinPlateConnection' and module_id == 'FinPlateConnection':
                module.module = KEY_DISP_FINPLATE
            elif module.module == 'EndPlateConnection' and module_id == 'EndPlateConnection':
                module.module = KEY_DISP_ENDPLATE
        
        # Check if design has been run - output_values() typically triggers design
        # But for report generation, we need to ensure design is complete
        try:
            # Try calling output_values to trigger design if not already done
            if not getattr(module, 'design_status', False):
                try:
                    _ = module.output_values(True)
                except Exception:
                    pass
        except Exception:
            pass
        
        # ------------------------------------------------------------------
        # Image handling for reports (frontend-driven only)
        # ------------------------------------------------------------------
        # If the frontend sent pre-rendered images, save them to the
        # per-report directory alongside the .tex/.pdf. We no longer invoke
        # server-side CAD image generation for web reports; images are
        # purely frontend-driven.
        try:
            if isinstance(images, dict) and images:
                report_base_dir = os.path.dirname(file_path)
                image_base_dir = os.path.join(report_base_dir, "ResourceFiles", "images")
                os.makedirs(image_base_dir, exist_ok=True)

                # Map canonical frontend keys to the filenames expected by
                # existing LaTeX templates.
                filename_map = {
                    "iso": "3d.png",    # 3D/iso view
                    "3d": "3d.png",
                    "front": "front.png",
                    "side": "side.png",
                    "top": "top.png",
                }

                for key, data_url in images.items():
                    try:
                        if not isinstance(data_url, str):
                            continue
                        # Support both full data URLs and raw base64
                        if ',' in data_url and data_url.strip().lower().startswith('data:'):
                            _, b64 = data_url.split(',', 1)
                        else:
                            b64 = data_url
                        img_bytes = base64.b64decode(b64)

                        normalized_key = str(key).lower()
                        filename = filename_map.get(normalized_key, f"{key}.png")
                        out_path = os.path.join(image_base_dir, filename)
                        with open(out_path, "wb") as img_f:
                            img_f.write(img_bytes)
                    except Exception as img_exc:
                        import logging
                        logging.getLogger(__name__).error(
                            "Failed to save report image %s: %s", key, img_exc
                        )
        except Exception:
            # Image handling is best-effort; ignore failures
            pass
        
        try:
            resultBoolean = module.save_design(metadata_final)
        except Exception as e:
            # Legacy desktop save_design sometimes raises even after writing .tex,
            # for example when it calls .split() on an internal list.
            # Treat this as non-fatal if the expected LaTeX file was created.
            import traceback
            traceback.print_exc()
            
            tex_path = f'{file_path}.tex'
            if os.path.exists(tex_path):
                resultBoolean = True
            else:
                resultBoolean = False  # Set default value if save_design fails and no file
        
        os.chdir(current_directory)

        if (resultBoolean):
            time.sleep(3)
            # If sections provided, post-filter LaTeX file to include only selected sections
            try:
                if sections:
                    tex_path = f'{file_path}.tex'
                    with open(tex_path, 'r', encoding='utf-8') as rf:
                        original_tex = rf.read()
                    filtered_tex = filter_latex_content(original_tex, sections)
                    with open(tex_path, 'w', encoding='utf-8') as wf:
                        wf.write(filtered_tex)
            except Exception:
                pass

            # open and read the file contents (for debug only)
            tex_path = f'{file_path}.tex'
            f = open(tex_path, 'rb')

            return Response({'success': 'Design report created', 'report_id': report_id, 'fileContents : ': f}, status=status.HTTP_201_CREATED)

        elif(not resultBoolean): 
            return Response({"message" : "Error in generating the design report"})


class GetPDF(APIView):

    def get(self, request):
        # obtain the param from the Query
        report_id = request.GET.get('report_id')

        # TeX source filename (inside the per-report folder)
        report_root = os.path.join(os.getcwd(), "file_storage", "design_report", report_id)
        tex_filename = f'{report_id}.tex'
        filename, ext = os.path.splitext(tex_filename)
        # the corresponding PDF filename (same basename, in the same folder)
        pdf_filename = filename + '.pdf'

        # change the working directory to the per-report folder so pdflatex
        # reads/writes next to the .tex file
        path = report_root
        os.chdir(path)
        pdfFilePath = os.path.join(path, pdf_filename)

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
        try:
            # delete the following paths only when the pdf file is created 
            if os.path.exists(pdfFilePath):
                base_no_ext = os.path.join(path, filename)
                aux_path = f'{base_no_ext}.aux'
                log_path = f'{base_no_ext}.log'
                tex_path = f'{base_no_ext}.tex'
                for p in (aux_path, log_path, tex_path):
                    try:
                        if os.path.exists(p):
                            os.remove(p)
                    except Exception:
                        pass
        except Exception:
            pass

        # Return the PDF file as a response
        response = FileResponse(open(pdfFilePath, 'rb'))
        response['Content-Type'] = 'application/pdf'
        response['Content-Disposition'] = f'attachment; filename="{report_id}.pdf"'
        return response


class CompanyLogoView(APIView) : 
    parser_classes = (MultiPartParser , FormParser)

    def post(self, request):
        # check cookie
        try:
            cookie_id = request.COOKIES.get('fin_plate_connection_session')
        except Exception:
            pass

        # obtain the file 
        file = request.data['file']
        
        # generate a unique name for the file 
        fileName = ''.join(str(uuid.uuid4()).split('-')) + ".png"
        currentDirectory = os.getcwd()
        
        # create the png file 
        try :       
            with open(currentDirectory+"/file_storage/company_logo/"+fileName , 'w') as fp : 
                pass 
        except : 
            pass

        try : 
            with default_storage.open(currentDirectory+"/file_storage/company_logo/"+fileName, 'wb+') as destination : 
                for chunk in file.chunks() :                 
                    destination.write(chunk)

            # full path of the company logo w.r.t the Project 
            logoFullPath = currentDirectory+"/file_storage/company_logo/"+fileName
            return Response({'message' : 'successfully saved file' , 'logoFullPath' : logoFullPath} , status = status.HTTP_201_CREATED)
        except : 
            return Response({'message' : 'Error in saving the file'} , status = status.HTTP_400_BAD_REQUEST)
