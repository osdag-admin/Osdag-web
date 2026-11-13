"""
Tension Member - Bolted Design Sub-module
"""
from osdag_core.Common import KEY_DISP_TENSION_BOLTED

MODULE_ID = KEY_DISP_TENSION_BOLTED
from .service import BoltedTensionMemberService as Service

