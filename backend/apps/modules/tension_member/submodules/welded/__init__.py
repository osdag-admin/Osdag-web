"""
Tension Member - Welded Design Sub-module
"""
from osdag_core.Common import KEY_DISP_TENSION_WELDED

MODULE_ID = KEY_DISP_TENSION_WELDED
from .service import WeldedTensionMemberService as Service

