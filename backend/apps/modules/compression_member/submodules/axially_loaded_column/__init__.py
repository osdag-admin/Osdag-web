"""
Axially Loaded Column - Compression Member Submodule

MODULE_ID is the desktop module name from osdag_core.Common.
Service provides the high-level API used by the compression_member viewset.
"""
from osdag_core.Common import KEY_DISP_COMPRESSION_COLUMN

from .service import AxiallyLoadedColumnService

MODULE_ID = KEY_DISP_COMPRESSION_COLUMN
Service = AxiallyLoadedColumnService

