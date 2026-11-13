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
from apps.core.utils.api_errors import error_response

logger = logging.getLogger(__name__)

COMPANY_LOGO_EXTENSIONS = {'.png', '.jpg', '.jpeg'}
COMPANY_LOGO_MAX_BYTES = 2 * 1024 * 1024
REPORT_IMAGE_MAX_BYTES = 10 * 1024 * 1024


def _company_logo_dir():
    return os.path.realpath(os.path.join(os.getcwd(), "file_storage", "company_logo"))


_COMPANY_LOGO_NAME = re.compile(r"[0-9a-f]{32}\.(png|jpg|jpeg)")


def _safe_company_logo_path(path):
    """Only allow logos previously stored by CompanyLogoView; anything else is dropped.

    CompanyLogoView names files <uuid hex><ext>, so only that file name is taken
    from the client value and it is always looked up inside the logo directory.
    """
    if not path or not isinstance(path, str):
        return ""
    name = path.replace("\\", "/").rsplit("/", 1)[-1]
    if not _COMPANY_LOGO_NAME.fullmatch(name):
        logger.warning("[Report] rejected CompanyLogo path: %r", path)
        return ""
    logo_dir = _company_logo_dir()
    candidate = os.path.normpath(os.path.join(logo_dir, name))
    if not candidate.startswith(logo_dir + os.sep) or not os.path.isfile(candidate):
        logger.warning("[Report] CompanyLogo not found in logo storage: %r", path)
        return ""
    return candidate.replace("\\", "/")


def format_report_logs(logs):
    """Render design log entries as the "timestamp - LEVEL - message" lines the report expects.

    The LaTeX report only prints lines that contain INFO, WARNING or ERROR, while
    CustomLogger stores the level in lower case, so the level is upper-cased here.
    """
    if not isinstance(logs, list):
        return ""
    lines = []
    for log in logs:
        if isinstance(log, dict):
            level = str(log.get('type') or 'INFO').upper()
            if level == 'CRITICAL':
                level = 'ERROR'
            lines.append(f"{log.get('timestamp', '')} - {level} - {log.get('message', '')}")
        else:
            lines.append(str(log))
    return "\n".join(lines)


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
        section_match = re.search(r'\\section\{((?:[^{}]|\{[^{}]*\})+)\}', line)
        if section_match:
            current_section = section_match.group(1).strip()
            current_subsection = None
            section_started = True
            include_content = (
                current_section in selected_sections or
                any(sel.startswith(f"{current_section}/") for sel in selected_sections)
            )

        subsection_match = re.search(r'\\subsection\{((?:[^{}]|\{[^{}]*\})+)\}', line)
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
            return error_response('unknown_module', f"Invalid or unsupported module_id: {module_id}", status.HTTP_400_BAD_REQUEST)
            
        if not input_values:
            return error_response('missing_field', "Missing input_values", status.HTTP_400_BAD_REQUEST)
            
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
            if not isinstance(metadata, dict):
                return Response({"error": "metadata must be an object"}, status=status.HTTP_400_BAD_REQUEST)
            metadata_final = metadata
            metadata_final['filename'] = file_path
            profile = metadata_final.get('ProfileSummary')
            if isinstance(profile, dict):
                profile['CompanyLogo'] = _safe_company_logo_path(profile.get('CompanyLogo'))

        metadata_final['does_design_exist'] = design_status
        metadata_final['logger_messages'] = format_report_logs(logs) or "No logs available"

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

        # A report opened outside the design page, such as from Recent Projects, has no logs or
        # 3D views to send. The module was solved above, so take them from it.
        if not logs:
            try:
                run_logs = module.logger.get_logs()
                metadata_final['logger_messages'] = format_report_logs(run_logs) or "No logs available"
                metadata_final['does_design_exist'] = bool(getattr(module, 'design_status', design_status))
            except Exception as log_exc:
                logger.warning("[ReportLogs] could not read logs from the module: %s", log_exc)

        try:
            raw_logs = metadata_final.get('logs')
            if isinstance(raw_logs, list):
                metadata_final['logs'] = format_report_logs(raw_logs)

            if isinstance(metadata_final.get('logger_messages'), list):
                metadata_final['logger_messages'] = "\n".join(
                    str(x) for x in metadata_final['logger_messages']
                )
        except Exception:
            pass

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
                        # Only known view names map to files; never build paths from client keys
                        normalized_key = str(key).lower()
                        filename = filename_map.get(normalized_key)
                        if not filename:
                            logger.warning("[ReportImages] ignoring unknown image key %r", key)
                            continue
                        img_bytes = base64.b64decode(b64)
                        if len(img_bytes) > REPORT_IMAGE_MAX_BYTES:
                            logger.warning("[ReportImages] image %r too large, skipped", key)
                            continue
                        out_path = os.path.join(image_base_dir, filename)
                        with open(out_path, "wb") as img_f:
                            img_f.write(img_bytes)
                    except Exception as img_exc:
                        logger.exception(f"[ReportImages] failed to save key {key}: {img_exc}")
        except Exception as outer_img_exc:
            logger.exception(f"[ReportImages] unexpected error: {outer_img_exc}")

        if not images and getattr(module, 'design_status', False):
            try:
                from apps.core.utils.report_image_generator import generate_cad_images_for_report
                generate_cad_images_for_report(module, input_values, module_id, report_base_dir)
            except Exception as generate_exc:
                logger.warning("[ReportImages] could not render 3D views: %s", generate_exc)
        
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
            return error_response('report_generation_failed', "Error in generating the design report",
                                  status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyLogoView(APIView): 
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file = request.data.get('file')
        if not file:
            return Response({'message': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        original_ext = os.path.splitext(file.name)[1].lower()
        if original_ext not in COMPANY_LOGO_EXTENSIONS:
            return Response({'message': 'Logo must be a PNG or JPEG image'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > COMPANY_LOGO_MAX_BYTES:
            return Response({'message': 'Logo must be 2 MB or smaller'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from PIL import Image
            with Image.open(file) as img:
                img.verify()
                if img.format not in ('PNG', 'JPEG'):
                    raise ValueError(img.format)
            file.seek(0)
        except Exception:
            return Response({'message': 'Logo is not a valid PNG or JPEG image'}, status=status.HTTP_400_BAD_REQUEST)

        fileName = uuid.uuid4().hex + original_ext
        logo_dir = _company_logo_dir()
        os.makedirs(logo_dir, exist_ok=True)
        
        try: 
            file_full_path = os.path.join(logo_dir, fileName)
            with open(file_full_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            logoFullPath = file_full_path.replace("\\", "/")
            return Response({'message' : 'successfully saved file', 'logoFullPath' : logoFullPath}, status = status.HTTP_201_CREATED)
        except Exception:
            logger.exception('[CompanyLogo] failed to save logo')
            return error_response('bad_request', 'Error in saving the file', status.HTTP_400_BAD_REQUEST)
