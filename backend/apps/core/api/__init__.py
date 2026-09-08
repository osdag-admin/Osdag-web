"""
Core API package - Re-exports
"""
# Auth exports
from .auth.user_view import (
    SaveInputFileView
)
from .auth.jwt_api import JWTHomeView
from .auth.google_sso_api import GoogleSSOView
from .auth.delete_account_api import DeleteAccountAPIView
from .auth.export_data_api import ExportUserDataAPIView
from .auth.my_data_api import MyDataAPIView

# Project exports
from .projects.project_api import ProjectAPI, ProjectDetailAPI, ProjectByNameAPI
from .projects.osi_api import SaveOsiFromInputs, OpenOsiUpload, OpenOsiById, ModuleRoutes, ProjectOsiDownload

# Design exports
from .design.design_pref_api import DesignPreference
from .design.material_api import MaterialDetails
from .design.design_pref_sync_api import DesignPreferenceSync
from .design.design_pref_defaults_api import DesignPreferenceDefaults
from .design.design_report_pdf_view import CompanyLogoView, CreateDesignReport
from .design.report_customization_api import ParseReportSections, CustomizeReport

# CAD exports
from .cad.cad_model_api import CADGeneration
from .cad.cad_model_download import CADDownload
from .cad.cad_model_export import CADExport

# Modules exports
from .modules.modules_api import GetModules

__all__ = [
    # Auth
    'SaveInputFileView',
    'JWTHomeView', 'GoogleSSOView',
    'DeleteAccountAPIView',
    'ExportUserDataAPIView',
    'MyDataAPIView',
    # Projects
    'ProjectAPI', 'ProjectDetailAPI', 'ProjectByNameAPI',
    'SaveOsiFromInputs', 'OpenOsiUpload', 'OpenOsiById', 'ModuleRoutes', 'ProjectOsiDownload',
    # Design
    'DesignPreference', 'DesignPreferenceSync', 'DesignPreferenceDefaults', 'MaterialDetails', 'CompanyLogoView',
    'CreateDesignReport',
    'ParseReportSections', 'CustomizeReport',
    # CAD
    'CADGeneration', 'CADDownload', 'CADExport',
    # Modules
    'GetModules',
]

