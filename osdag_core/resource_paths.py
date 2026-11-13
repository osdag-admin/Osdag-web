"""
Filesystem paths to bundled data files.

importlib.resources.files() can fail when a subpackage has no __file__ / spec.origin
(e.g. namespace layout), so web/backend uses these helpers for stable paths.
"""
import os

import osdag_core

_ROOT = os.path.dirname(os.path.abspath(osdag_core.__file__))


def resource_image_path(filename: str) -> str:
    """Absolute path to a file under data/ResourceFiles/images/."""
    return os.path.join(_ROOT, "data", "ResourceFiles", "images", filename)
