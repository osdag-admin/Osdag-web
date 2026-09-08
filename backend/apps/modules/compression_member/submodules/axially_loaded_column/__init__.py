"""
Axially Loaded Column - Compression Member Submodule

MODULE_ID follows the legacy identifier used throughout Osdag for this design type.
Service provides the high-level API used by the compression_member viewset.
"""

from .service import AxiallyLoadedColumnService

MODULE_ID = "Axially-Loaded-Column"
Service = AxiallyLoadedColumnService

