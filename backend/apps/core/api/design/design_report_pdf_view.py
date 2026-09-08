from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from apps.core.permissions import IsEmailVerifiedIfAuthenticated
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.parsers import MultiPartParser, FormParser
import logging
import os
import time
import uuid
import re
import base64
from apps.core.registry import BaseModuleRegistry

logger = logging.getLogger(__name__)


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
    permission_classes = [IsEmailVerifiedIfAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        try:
            return super().dispatch(request, *args, **kwargs)
        except Exception:
            raise

    def post(self, request):
        metadata = request.data.get('metadata')
        module_id = request.data.get('module_id')
        input_values = request.data.get('input_values') 
        design_status = request.data.get('design_status', True)
        logs = request.data.get('logs', [])
        sections = request.data.get('sections')
        customization = request.data.get('customization')
        images = request.data.get('images') or {}
        
        metadata_entry = BaseModuleRegistry.get_metadata_by_module_id(module_id)
        if not metadata_entry or not metadata_entry.get('adapter_func'):
            return Response({"error": f"Invalid or unsupported module_id: {module_id}"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not input_values:
            return Response({"error": "Missing input_values"}, status=status.HTTP_400_BAD_REQUEST)
            
        create_module_func = metadata_entry['adapter_func']

        current_directory = os.getcwd()
        report_id = get_random_string(length=16)
        report_root = os.path.join(os.getcwd(), "file_storage", "design_report", report_id)
        os.makedirs(report_root, exist_ok=True)
        file_path = os.path.join(report_root, report_id)

        if metadata is None or metadata == '':
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
            metadata_final = {
                "ProfileSummary": metadata_profile,
                "filename": file_path,
            }
            for key in metadata_other.keys():
                metadata_final[key] = metadata_other[key]
        else:
            metadata_final = metadata
            metadata_final['filename'] = file_path

        metadata_final['does_design_exist'] = design_status
        if logs and isinstance(logs, list):
            logger_string = '\n'.join([f"{log.get('timestamp', '')} - {log.get('type', 'INFO')} - {log.get('message', '')}" for log in logs])
        else:
            logger_string = "No logs available"
        metadata_final['logger_messages'] = logger_string

        if sections:
            metadata_final['selected_sections'] = sections
        if customization:
            metadata_final['customization'] = customization

        os.makedirs(os.path.join(os.getcwd(), "file_storage", "design_report"), exist_ok=True)
        
        try:
            module = create_module_func(input_values)
        except Exception:
            import traceback
            traceback.print_exc()
            raise

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

            if isinstance(metadata_final.get('logger_messages'), list):
                metadata_final['logger_messages'] = "\n".join(
                    str(x) for x in metadata_final['logger_messages']
                )
        except Exception:
            pass

        from osdag_core.Common import KEY_DISP_FINPLATE, KEY_DISP_HEADERPLATE
        
        if hasattr(module, 'module'):
            if module.module == 'FinPlateConnection' and module_id == 'FinPlateConnection':
                module.module = KEY_DISP_FINPLATE
            elif module.module == 'HeaderPlateConnection' and module_id == 'HeaderPlateConnection':
                module.module = KEY_DISP_HEADERPLATE
        
        try:
            if not getattr(module, 'design_status', False):
                try:
                    _ = module.output_values(True)
                except Exception:
                    pass
        except Exception:
            pass
        
        report_base_dir = os.path.dirname(file_path)
        image_base_dir = os.path.join(report_base_dir, "ResourceFiles", "images")
        try:
            if isinstance(images, dict) and images:
                os.makedirs(image_base_dir, exist_ok=True)
                filename_map = {
                    "iso": "3d.png",
                    "3d": "3d.png",
                    "front": "front.png",
                    "side": "side.png",
                    "top": "top.png",
                }

                for key, data_url in images.items():
                    try:
                        if not isinstance(data_url, str):
                            continue
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
                        logger.exception(f"[ReportImages] failed to save key {key}: {img_exc}")
        except Exception as outer_img_exc:
            logger.exception(f"[ReportImages] unexpected error: {outer_img_exc}")
        
        try:
            resultBoolean = module.save_design(metadata_final)
            if resultBoolean is None:
                tex_path = f'{file_path}.tex'
                if os.path.exists(tex_path):
                    resultBoolean = True
        except Exception:
            import traceback
            traceback.print_exc()
            
            tex_path = f'{file_path}.tex'
            if os.path.exists(tex_path):
                resultBoolean = True
            else:
                resultBoolean = False
        
        if resultBoolean is None:
            tex_path = f'{file_path}.tex'
            resultBoolean = os.path.exists(tex_path)
        
        os.chdir(current_directory)

        if resultBoolean:
            time.sleep(3)
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

            tex_path = f'{file_path}.tex'
            f = open(tex_path, 'rb')
            return Response({'success': 'Design report created', 'report_id': report_id, 'fileContents : ': f}, status=status.HTTP_201_CREATED)
        else: 
            return Response({"message" : "Error in generating the design report"})


class CompanyLogoView(APIView): 
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file = request.data['file']
        
        original_ext = os.path.splitext(file.name)[1].lower() or ".png"
        fileName = ''.join(str(uuid.uuid4()).split('-')) + original_ext
        currentDirectory = os.getcwd()
        logo_dir = os.path.join(currentDirectory, "file_storage", "company_logo")
        os.makedirs(logo_dir, exist_ok=True)
        
        try: 
            file_full_path = os.path.join(logo_dir, fileName)
            with open(file_full_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            logoFullPath = file_full_path.replace("\\", "/")
            return Response({'message' : 'successfully saved file', 'logoFullPath' : logoFullPath}, status = status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message' : f'Error in saving the file: {str(e)}'}, status = status.HTTP_400_BAD_REQUEST)
