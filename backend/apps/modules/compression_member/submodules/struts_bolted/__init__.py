"""
Struts Bolted to End Gusset - Submodule Init
"""
from .service import StrutsBoltedService

# Required exports for BaseModuleRegistry auto_discover
MODULE_ID = 'Struts-Bolted-Design'
Service = StrutsBoltedService
