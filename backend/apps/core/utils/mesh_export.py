"""
STL mesh export utilities for CAD models.
"""
import os
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.StlAPI import StlAPI_Writer


def write_stl(shape, stl_path: str, linear_deflection: float = 0.3, angular_deflection: float = 0.2, parallel: bool = True) -> str:
    """Tessellate a TopoDS_Shape and write it to STL.

    Returns the written STL path on success, raises RuntimeError on failure.
    """
    # Ensure output directory exists
    out_dir = os.path.dirname(stl_path)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    # Perform tessellation
    mesh = BRepMesh_IncrementalMesh(shape, linear_deflection, parallel, angular_deflection, parallel)
    mesh.Perform()

    # Write STL (binary — matches readers that expect 80-byte header + uint32 count)
    writer = StlAPI_Writer()
    if hasattr(writer, "SetASCIIMode"):
        writer.SetASCIIMode(False)
    ok = writer.Write(shape, stl_path)
    if not ok:
        raise RuntimeError(f"Failed to write STL: {stl_path}")
    return stl_path

