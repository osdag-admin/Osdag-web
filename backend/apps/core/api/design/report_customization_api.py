"""
Report Customization API

This module provides APIs for customizing design reports by allowing users to:
1. Parse sections from generated LaTeX reports
2. Filter content based on selected sections
3. Generate customized PDFs

Author: AI Assistant
"""

import os
import re
import tempfile
import subprocess
import shutil
import platform
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import FileResponse
from django.core.files.storage import default_storage
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


class LaTeXParser:
    """
    Parses LaTeX files to extract document structure.
    
    This class finds all \section{} and \subsection{} commands in a LaTeX
    document and organizes them into a hierarchical structure.
    """
    
    def parse_sections(self, latex_content):
        """
        Extract sections and subsections from LaTeX content.
        
        Args:
            latex_content (str): Raw LaTeX document content
            
        Returns:
            dict: Hierarchical structure of sections and subsections
        """
        sections = {}
        current_section = None
        
        # Process each line to find LaTeX section commands
        for line in latex_content.split('\n'):
            # Look for \section{Section Name} patterns
            section_match = re.search(r'\\section\{([^}]+)\}', line)
            if section_match:
                current_section = section_match.group(1).strip()
                sections[current_section] = []  # Initialize subsection list
                
            # Look for \subsection{Subsection Name} patterns
            subsection_match = re.search(r'\\subsection\{([^}]+)\}', line)
            if subsection_match and current_section:
                subsection = subsection_match.group(1).strip()
                sections[current_section].append(subsection)
                
        return sections


class LaTeXFilter:
    """
    Filters LaTeX content based on selected sections.
    """
    
    def filter_content(self, latex_content, selected_sections):
        """
        Remove unselected sections from LaTeX content.
        
        Args:
            latex_content (str): Original LaTeX content
            selected_sections (list): List of selected sections/subsections
            
        Returns:
            str: Filtered LaTeX content
        """
        if not selected_sections or not isinstance(selected_sections, (list, tuple)):
            return latex_content
            
        lines = latex_content.split('\n')
        filtered_lines = []
        current_section = None
        current_subsection = None
        include_content = True
        section_started = False
        
        for line in lines:
            # Check for new section
            section_match = re.search(r'\\section\{([^}]+)\}', line)
            if section_match:
                current_section = section_match.group(1).strip()
                current_subsection = None
                section_started = True
                # Include section if it's selected OR if any of its subsections are selected
                include_content = (current_section in selected_sections or
                                 any(sel.startswith(f"{current_section}/") for sel in selected_sections))
                
            # Check for subsection
            subsection_match = re.search(r'\\subsection\{([^}]+)\}', line)
            if subsection_match and current_section:
                current_subsection = subsection_match.group(1).strip()
                subsection_key = f"{current_section}/{current_subsection}"
                # Include subsection only if specifically selected OR parent section is fully selected
                include_content = (current_section in selected_sections or
                                 subsection_key in selected_sections)
                
            # Always include document structure and preamble
            if (include_content or
                not section_started or  # Include everything before first section
                line.startswith('\\documentclass') or
                line.startswith('\\usepackage') or
                line.startswith('\\title') or
                line.startswith('\\author') or
                line.startswith('\\date') or
                line.startswith('\\begin{document}') or
                line.startswith('\\maketitle') or
                line.startswith('\\end{document}')):
                filtered_lines.append(line)
                
        return '\n'.join(filtered_lines)


@method_decorator(csrf_exempt, name='dispatch')
class ParseReportSections(APIView):
    """
    API endpoint to parse sections from a generated LaTeX report.
    
    POST /api/report/parse-sections/
    Body: {"report_id": "string"}
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            print('[report_customization_api] ParseReportSections:request', request.data)
            report_id = request.data.get('report_id')
            if not report_id:
                return Response(
                    {"error": "report_id is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if LaTeX file exists
            tex_file_path = os.path.join(os.getcwd(), 'file_storage', 'design_report', report_id, f'{report_id}.tex')
            if not os.path.exists(tex_file_path):
                return Response(
                    {"error": "LaTeX file not found. Please generate report first."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Read LaTeX content
            with open(tex_file_path, 'r', encoding='utf-8') as f:
                latex_content = f.read()
            
            # Parse sections
            parser = LaTeXParser()
            sections = parser.parse_sections(latex_content)
            
            if not sections:
                return Response(
                    {"error": "No sections found in LaTeX file"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            response_payload = {
                "success": True,
                "sections": sections,
                "report_id": report_id
            }
            print('[report_customization_api] ParseReportSections:response', { 'report_id': report_id, 'sections_keys': list(sections.keys()) })
            return Response(response_payload, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to parse sections: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class CustomizeReport(APIView):
    """
    API endpoint to generate customized PDF with selected sections.
    
    POST /api/report/customize/
    Body: {
        "report_id": "string",
        "selected_sections": ["Section1", "Section2/Subsection1", ...]
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            print('[report_customization_api] CustomizeReport:starting')
            print('[report_customization_api] CustomizeReport:request', request.data)
            report_id = request.data.get('report_id')
            selected_sections = request.data.get('selected_sections', [])
            print('[report_customization_api] CustomizeReport:parsed', {'report_id': report_id, 'selected_count': len(selected_sections)})
            
            if not report_id:
                return Response(
                    {"error": "report_id is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if LaTeX file exists
            tex_file_path = os.path.join(os.getcwd(), 'file_storage', 'design_report', report_id, f'{report_id}.tex')
            if not os.path.exists(tex_file_path):
                return Response(
                    {"error": "LaTeX file not found. Please generate report first."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Read original LaTeX content
            print('[report_customization_api] CustomizeReport:reading file')
            with open(tex_file_path, 'r', encoding='utf-8') as f:
                original_latex = f.read()
            print('[report_customization_api] CustomizeReport:file read', {'length': len(original_latex)})
            
            # Filter content based on selected sections
            print('[report_customization_api] CustomizeReport:creating filter')
            filter_obj = LaTeXFilter()
            print('[report_customization_api] CustomizeReport:filtering content')
            filtered_latex = filter_obj.filter_content(original_latex, selected_sections)
            filtered_latex = filtered_latex.replace(
    		r"\usepackage{lastpage}",
    		r"\usepackage{pageslts}"
	    )
            filtered_latex = filtered_latex.replace(
    		r"\pageref{LastPage}",
    		r"\lastpageref{pagesLTS.lastpage}"
            )
            filtered_latex = (
                filtered_latex
                .lstrip('\ufeff')
                .replace('\r\n', '\n')
                .replace('\r', '\n')
            )
            print('[report_customization_api] CustomizeReport:filter', { 'report_id': report_id, 'selected_count': len(selected_sections) })
            print('[report_customization_api] CustomizeReport:filtered content length', len(filtered_latex))
            print('[report_customization_api] CustomizeReport:filtered content preview', filtered_latex[:200])
            
            # Use fixed temp directory to overwrite each time (matching desktop behavior)
            print('[report_customization_api] CustomizeReport:creating temp dir')
            # safe_temp_dir = os.path.join(tempfile.gettempdir(), "osdag_pdf_compile")
            safe_temp_dir = tempfile.mkdtemp(prefix="osdag_pdf_")
            print('[report_customization_api] CustomizeReport:temp dir path', safe_temp_dir)
            try:
                if os.path.exists(safe_temp_dir):
                    print('[report_customization_api] CustomizeReport:removing existing temp dir')
                    shutil.rmtree(safe_temp_dir, ignore_errors=True)
                print('[report_customization_api] CustomizeReport:creating temp dir')
                os.makedirs(safe_temp_dir, exist_ok=True)
                print('[report_customization_api] CustomizeReport:temp dir created successfully')
            except Exception as e:
                print('[report_customization_api] CustomizeReport:temp dir error', str(e))
                raise
            
            # Write filtered LaTeX to fixed directory
            print('[report_customization_api] CustomizeReport:writing filtered tex')
            custom_tex_path = os.path.join(safe_temp_dir, "filtered_report.tex")
            print('[report_customization_api] CustomizeReport:custom tex path', custom_tex_path)
            try:
                print("custom_tex_path:", custom_tex_path)
                print("parent dir exists:", os.path.exists(os.path.dirname(custom_tex_path)))
                print("parent dir writable:", os.access(os.path.dirname(custom_tex_path), os.W_OK))
                with open(custom_tex_path, 'w', encoding='utf-8') as f:
                    f.write(filtered_latex)
                print('[report_customization_api] CustomizeReport:filtered tex written successfully')
            except Exception as e:
                print('[report_customization_api] CustomizeReport:file write error', str(e))
                raise
            
            # Compile LaTeX to PDF
            pdf_path = custom_tex_path.replace('.tex', '.pdf')
            
            # Change to temp directory for compilation
            original_cwd = os.getcwd()
            os.chdir(safe_temp_dir)
            
            try:
                print(f'[report_customization_api] CustomizeReport:compiling in {os.getcwd()}')
                print(f'[report_customization_api] CustomizeReport:tex file exists: {os.path.exists("filtered_report.tex")}')
                
                # Compile LaTeX - use system pdflatex (same as working design_report_csv_view.py)
                print(f'[report_customization_api] CustomizeReport:using system pdflatex')
                
                # Check if pdflatex is available
                try:
                    subprocess.run(['pdflatex', '--version'], capture_output=True, text=True, timeout=10)
                    print('[report_customization_api] CustomizeReport:pdflatex is available')
                except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
                    print('[report_customization_api] CustomizeReport:pdflatex not found, trying alternative approach')
                    return Response(
                        {"error": "LaTeX (pdflatex) not found. Please install a LaTeX distribution like MiKTeX or TeX Live."}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                try:
                    if platform.system().lower() == 'windows':
                        print('[report_customization_api] CustomizeReport:running pdflatex on windows')
                        result = subprocess.run([
                            'pdflatex', '-interaction=nonstopmode', 
                            'filtered_report.tex'
                        ], capture_output=True, text=True, timeout=60)
                    else:
                        print('[report_customization_api] CustomizeReport:running pdflatex on unix')
                        result = subprocess.run([
                            'pdflatex', '-interaction=nonstopmode', 
                            'filtered_report.tex'
                        ], capture_output=True, text=True, timeout=60)
                except subprocess.TimeoutExpired as e:
                    print(f'[report_customization_api] CustomizeReport:pdflatex timeout: {e}')
                    raise
                except subprocess.CalledProcessError as e:
                    print(f'[report_customization_api] CustomizeReport:pdflatex process error: {e}')
                    raise
                except Exception as e:
                    print(f'[report_customization_api] CustomizeReport:pdflatex general error: {e}')
                    raise
                
                print(f'[report_customization_api] CustomizeReport:pdflatex result: {result.returncode}')
                print(f'[report_customization_api] CustomizeReport:stdout: {result.stdout[:200]}')
                print(f'[report_customization_api] CustomizeReport:stderr: {result.stderr[:200]}')
                
                # Check if PDF was generated successfully
                # if result.returncode == 0 and os.path.exists(pdf_path):
                if os.path.exists(pdf_path):
                    print('[report_customization_api] CustomizeReport:pdflatex:success', { 'report_id': report_id, 'pdf_path': pdf_path })
                    # Return PDF file
                    response = FileResponse(
                        open(pdf_path, 'rb'),
                        content_type='application/pdf',
                        filename=f'osdag_custom_report_{report_id}.pdf'
                    )
                    return response
                else:
                    print('[report_customization_api] CustomizeReport:pdflatex:failure', { 'code': result.returncode })
                    error_msg = "PDF compilation failed"
                    if result.stderr:
                        error_msg += f"\n\nErrors:\n{result.stderr[:500]}"
                    if result.stdout:
                        error_msg += f"\n\nOutput:\n{result.stdout[:500]}"
                    
                    return Response(
                        {"error": error_msg}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                    
            except subprocess.TimeoutExpired:
                return Response(
                    {"error": "PDF compilation timed out (>60s)"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except FileNotFoundError:
                return Response(
                    {"error": "LaTeX (pdflatex) not found. Please install a LaTeX distribution."}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            finally:
                # Restore original working directory
                os.chdir(original_cwd)
                
        except Exception as e:
            return Response(
                {"error": f"Failed to customize report: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def generate_initial_report_core(mapped_data):
    """
    Shared core for initial report generation.
    
    Responsibilities:
    - Call CreateDesignReport with the provided mapped_data
    - Read the generated LaTeX file
    - Parse sections using LaTeXParser
    - Return a (payload, status_code) tuple suitable for DRF Response
    """
    try:
        print(f"[GenerateInitialReportCore] mapped_data keys: {list(mapped_data.keys())}")
        from .design_report_csv_view import CreateDesignReport

        class MockRequest:
            def __init__(self, data):
                self.data = data

        # Run the existing CreateDesignReport logic
        print("[GenerateInitialReportCore] Creating CreateDesignReport instance...")
        create_report = CreateDesignReport()
        mock_request = MockRequest(mapped_data)

        print("[GenerateInitialReportCore] Calling CreateDesignReport.post()...")
        response = create_report.post(mock_request)
        print("[GenerateInitialReportCore] CreateDesignReport response received")
        status_code = getattr(response, "status_code", None)
        print(f"[GenerateInitialReportCore] status_code: {status_code}")

        if status_code != status.HTTP_201_CREATED:
            # Bubble up detailed error info when available
            error_payload = {}
            if hasattr(response, "data"):
                error_payload = response.data
                print(f"[GenerateInitialReportCore] error response.data: {error_payload}")
            else:
                error_payload = {"error": "Failed to generate design report"}

            # Prefer any existing message/error keys for client display
            message = None
            if isinstance(error_payload, dict):
                message = (
                    error_payload.get("error")
                    or error_payload.get("message")
                    or str(error_payload)
                )
            else:
                message = str(error_payload)

            return (
                {
                    "success": False,
                    "error": message or "Failed to generate design report",
                    "details": error_payload if isinstance(error_payload, dict) else None,
                },
                status.HTTP_400_BAD_REQUEST,
            )

        # On success, extract report_id from response
        response_data = getattr(response, "data", {}) or {}
        print(
            "[GenerateInitialReportCore] success response.data keys:",
            list(response_data.keys()) if isinstance(response_data, dict) else "N/A",
        )
        report_id = response_data.get("report_id")
        print(f"[GenerateInitialReportCore] extracted report_id: {report_id}")

        if not report_id:
            return (
                {
                    "success": False,
                    "error": "report_id missing from design report response",
                },
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Locate and read the generated LaTeX file.
        # New layout (per-report folder):
        #   file_storage/design_report/{report_id}/{report_id}.tex
        # Legacy layout (flat):
        #   file_storage/design_report/{report_id}.tex
        base_dir = os.path.join(os.getcwd(), "file_storage", "design_report")
        new_style_path = os.path.join(base_dir, report_id, f"{report_id}.tex")
        legacy_path = os.path.join(base_dir, f"{report_id}.tex")

        if os.path.exists(new_style_path):
            tex_file_path = new_style_path
        else:
            tex_file_path = legacy_path

        print(f"[GenerateInitialReportCore] LaTeX file path: {tex_file_path}")
        exists = os.path.exists(tex_file_path)
        print(f"[GenerateInitialReportCore] LaTeX file exists: {exists}")

        if not exists:
            return (
                {
                    "success": False,
                    "error": f"LaTeX file not found at {tex_file_path}",
                    "report_id": report_id,
                },
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        file_size = os.path.getsize(tex_file_path)
        print(f"[GenerateInitialReportCore] LaTeX file size: {file_size} bytes")

        with open(tex_file_path, "r", encoding="utf-8") as f:
            latex_content = f.read()
        print(
            "[GenerateInitialReportCore] LaTeX content length:",
            len(latex_content),
        )

        # Parse sections using the existing LaTeXParser
        parser = LaTeXParser()
        sections = parser.parse_sections(latex_content)
        print(
            "[GenerateInitialReportCore] Parsed sections count:",
            len(sections),
        )
        print(
            "[GenerateInitialReportCore] Section keys:",
            list(sections.keys()),
        )

        payload = {
            "success": True,
            "report_id": report_id,
            "sections": sections,
            "message": "LaTeX report generated successfully",
        }
        return payload, status.HTTP_201_CREATED

    except Exception as e:
        print("[GenerateInitialReportCore] Exception:", str(e))
        import traceback

        traceback.print_exc()
        return (
            {
                "success": False,
                "error": f"Failed to generate initial report: {str(e)}",
            },
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


