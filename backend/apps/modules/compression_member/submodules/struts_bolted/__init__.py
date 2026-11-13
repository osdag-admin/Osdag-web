"""
Struts Bolted to End Gusset - Submodule Init
"""
from osdag_core.Common import KEY_DISP_STRUT_BOLTED_END_GUSSET

from .service import StrutsBoltedService

# Required exports for BaseModuleRegistry auto_discover
MODULE_ID = KEY_DISP_STRUT_BOLTED_END_GUSSET
Service = StrutsBoltedService
