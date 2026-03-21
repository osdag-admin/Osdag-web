"""
Core API package - Re-exports
"""
# Auth exports
from .auth.user_view import (
    ObtainInputFileView, SaveInputFileView
)
from .auth.jwt_api import JWTHomeView
from .auth.google_sso_api import GoogleSSOView

# Project exports
from .projects.project_api import ProjectAPI, ProjectDetailAPI, ProjectByNameAPI
from .projects.osi_api import SaveOsiFromInputs, OpenOsiUpload, OpenOsiById, ModuleRoutes, ProjectOsiDownload

# Design exports
from .design.design_pref_api import DesignPreference, MaterialDetails
from .design.design_report_csv_view import CompanyLogoView, CreateDesignReport, GetPDF
from .design.report_customization_api import ParseReportSections, CustomizeReport

# CAD exports
from .cad.cad_model_api import CADGeneration
from .cad.cad_model_download import CADDownload

# Modules exports
from .modules.modules_api import GetModules

__all__ = [
    # Auth
    'ObtainInputFileView', 'SaveInputFileView',
    'JWTHomeView', 'GoogleSSOView',
    # Projects
    'ProjectAPI', 'ProjectDetailAPI', 'ProjectByNameAPI',
    'SaveOsiFromInputs', 'OpenOsiUpload', 'OpenOsiById', 'ModuleRoutes', 'ProjectOsiDownload',
    # Design
    'DesignPreference', 'MaterialDetails', 'CompanyLogoView',
    'CreateDesignReport', 'GetPDF',
    'ParseReportSections', 'CustomizeReport',
    # CAD
    'CADGeneration', 'CADDownload',
    # Modules
    'GetModules',
]

