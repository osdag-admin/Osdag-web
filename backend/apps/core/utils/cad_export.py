"""
OCC CAD export helpers.

These functions export an in-memory OCC TopoDS_Shape to the requested file format.
Adapters should call these helpers for on-demand exports.
"""

import os


def _ensure_parent_dir(path: str) -> None:
    parent = os.path.dirname(path)
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)


def export_step(shape, out_path: str) -> str:
    """Export `shape` to STEP (.step)."""
    from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs

    _ensure_parent_dir(out_path)

    step_writer = STEPControl_Writer()
    step_writer.Transfer(shape, STEPControl_AsIs)
    ok = step_writer.Write(out_path) == 1
    if not ok:
        raise RuntimeError(f"Failed to write STEP file: {out_path}")
    return out_path


def export_iges(shape, out_path: str) -> str:
    """Export `shape` to IGES (.iges)."""
    from OCC.Core.IGESControl import IGESControl_Writer

    _ensure_parent_dir(out_path)

    iges_writer = IGESControl_Writer()
    iges_writer.AddShape(shape)
    ok = iges_writer.Write(out_path) == 1
    if not ok:
        raise RuntimeError(f"Failed to write IGES file: {out_path}")
    return out_path


def export_ifc(shape, out_path: str) -> str:
    """
    Export `shape` to IFC4 (.ifc) using IfcOpenShell mesh representation.

    Requires the `ifcopenshell` package (see requirements.txt).
    Tessellation is produced via an intermediate STL mesh for broad OCC compatibility.
    """
    try:
        import ifcopenshell.api.aggregate
        import ifcopenshell.api.context
        import ifcopenshell.api.geometry
        import ifcopenshell.api.project
        import ifcopenshell.api.root
        import ifcopenshell.api.spatial
        import ifcopenshell.api.unit
    except ImportError as e:
        raise RuntimeError(
            "IFC export requires the 'ifcopenshell' package. Install with: pip install ifcopenshell"
        ) from e

    import struct
    import tempfile

    from apps.core.utils.mesh_export import write_stl

    def _parse_binary_stl(path: str):
        with open(path, "rb") as f:
            f.read(80)
            (n_tri,) = struct.unpack("<I", f.read(4))
            if n_tri > 50_000_000:
                raise ValueError("STL binary header looks invalid; refusing to parse")
            vertices = []
            faces = []
            idx = 0
            for _ in range(n_tri):
                f.read(12)
                for _t in range(3):
                    x, y, z = struct.unpack("<fff", f.read(12))
                    vertices.append((float(x), float(y), float(z)))
                faces.append([idx, idx + 1, idx + 2])
                idx += 3
                f.read(2)
        return vertices, faces

    def _parse_ascii_stl(path: str):
        vertices = []
        faces = []
        facet_verts = []
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                parts = line.split()
                if not parts:
                    continue
                if parts[0].lower() == "vertex" and len(parts) >= 4:
                    facet_verts.append(
                        (float(parts[1]), float(parts[2]), float(parts[3]))
                    )
                elif parts[0].lower() == "endfacet":
                    if len(facet_verts) == 3:
                        base = len(vertices)
                        vertices.extend(facet_verts)
                        faces.append([base, base + 1, base + 2])
                    facet_verts = []
        return vertices, faces

    def _parse_stl_mesh(path: str):
        with open(path, "rb") as f:
            head = f.read(512)
        stripped = head.lstrip()
        if stripped.lower().startswith(b"solid"):
            return _parse_ascii_stl(path)
        return _parse_binary_stl(path)

    _ensure_parent_dir(out_path)

    # IFC mesh import is sensitive to triangle count; fin-plate (etc.) at default
    # tessellation can exceed millions of faces and crash IfcOpenShell / the worker.
    _IFC_MAX_TRIANGLES = 400_000
    _IFC_DEFLECTIONS = (1.0, 2.0, 4.0, 8.0, 16.0, 32.0)

    with tempfile.NamedTemporaryFile(suffix=".stl", delete=False) as tmp:
        stl_path = tmp.name
    vertices = []
    faces = []
    try:
        last_tri_count = 0
        for linear_deflection in _IFC_DEFLECTIONS:
            angular = max(0.3, min(1.0, linear_deflection * 0.35))
            write_stl(
                shape,
                stl_path,
                linear_deflection=linear_deflection,
                angular_deflection=angular,
            )
            vertices, faces = _parse_stl_mesh(stl_path)
            last_tri_count = len(faces)
            if last_tri_count <= _IFC_MAX_TRIANGLES:
                break
        if len(faces) > _IFC_MAX_TRIANGLES:
            raise RuntimeError(
                f"IFC export: tessellated mesh is still too large ({last_tri_count} triangles "
                f"after coarsening up to linear_deflection={_IFC_DEFLECTIONS[-1]}). "
                f"Limit is {_IFC_MAX_TRIANGLES}. Try a simpler section or export STEP for full fidelity."
            )
    finally:
        try:
            os.unlink(stl_path)
        except OSError:
            pass

    if not vertices or not faces:
        raise RuntimeError("IFC export failed: empty mesh from tessellation")

    model = ifcopenshell.api.project.create_file(version="IFC4")
    ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name="Osdag CAD Export")
    ifcopenshell.api.unit.assign_unit(model)
    context = ifcopenshell.api.context.add_context(model, context_type="Model")
    body = ifcopenshell.api.context.add_context(
        model,
        context_type="Model",
        context_identifier="Body",
        target_view="MODEL_VIEW",
        parent=context,
    )
    site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name="Site")
    building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name="Building")
    storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey", name="Export Level")
    project = model.by_type("IfcProject")[0]
    ifcopenshell.api.aggregate.assign_object(model, relating_object=project, products=[site])
    ifcopenshell.api.aggregate.assign_object(model, relating_object=site, products=[building])
    ifcopenshell.api.aggregate.assign_object(model, relating_object=building, products=[storey])

    element = ifcopenshell.api.root.create_entity(
        model, ifc_class="IfcBuildingElementProxy", name="CAD_Model"
    )
    ifcopenshell.api.geometry.edit_object_placement(model, product=element)
    representation = ifcopenshell.api.geometry.add_mesh_representation(
        model,
        context=body,
        vertices=[vertices],
        faces=[faces],
    )
    ifcopenshell.api.geometry.assign_representation(model, product=element, representation=representation)
    ifcopenshell.api.spatial.assign_container(model, relating_structure=storey, products=[element])
    model.write(out_path)
    return out_path

