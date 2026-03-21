"""
CAD Image Generation for Web Reports

This module provides headless rendering of CAD files (BREP/STL) to PNG images
for inclusion in design reports. Supports multiple rendering backends with
automatic fallback chain.
"""

import os
import sys
import logging
import shutil
from pathlib import Path
from typing import Dict, Optional, Tuple, Any

logger = logging.getLogger(__name__)


def verify_vtk_available() -> bool:
    """Verify VTK is installed and can be used for rendering.
    
    Returns:
        True if VTK is available and working, False otherwise.
    """
    try:
        import vtk
        logger.info(f"[SETUP] VTK available, version: {vtk.VTK_VERSION}")
        return True
    except ImportError as e:
        logger.warning(f"[SETUP] VTK not available: {e}")
        return False
    except Exception as e:
        logger.warning(f"[SETUP] VTK available but initialization failed: {e}")
        return False


def verify_open3d_available() -> bool:
    """Verify Open3D is installed and can create OffscreenRenderer (OPTIONAL).
    
    Returns:
        True if Open3D is available and working, False otherwise.
    """
    try:
        import open3d as o3d
        # Test creating renderer
        renderer = o3d.visualization.rendering.OffscreenRenderer(100, 100, headless=True)
        logger.info("[SETUP] Open3D available (optional), OffscreenRenderer works")
        return True
    except ImportError:
        # Open3D is optional, don't warn
        return False
    except Exception as e:
        logger.debug(f"[SETUP] Open3D available but renderer creation failed: {e}")
        return False


def setup_headless_qt() -> bool:
    """Setup environment for headless Qt rendering.
    
    Configures Qt for offscreen rendering. Xvfb is preferred but not strictly required
    if Qt's offscreen platform plugin is available.
    
    Returns:
        True if setup successful, False otherwise.
    """
    try:
        import subprocess
        
        # Check if Xvfb is available (preferred but not required)
        result = subprocess.run(['which', 'Xvfb'], capture_output=True, text=True)
        xvfb_available = result.returncode == 0
        
        # Set Qt platform to offscreen (this is what matters for Qt rendering)
        os.environ['QT_QPA_PLATFORM'] = 'offscreen'
        
        # Set display if Xvfb is available (for compatibility)
        if xvfb_available:
            if 'DISPLAY' not in os.environ:
                os.environ['DISPLAY'] = ':99'
            logger.info("[SETUP] Xvfb found, setting up headless Qt with Xvfb...")
        else:
            # Try without Xvfb - Qt's offscreen plugin might work
            logger.warning("[SETUP] Xvfb not found, but attempting Qt offscreen rendering anyway...")
            logger.info("[SETUP] Note: If Qt rendering fails, install Xvfb: sudo apt-get install xvfb")
        
        logger.info(f"[SETUP] QT_QPA_PLATFORM=offscreen")
        logger.info(f"[SETUP] DISPLAY={os.environ.get('DISPLAY', 'not set')}")
        return True
    except Exception as e:
        logger.warning(f"[SETUP] Failed to setup headless Qt: {e}")
        return False


def read_brep_file(brep_path: str):
    """Read BREP file and return TopoDS_Shape.
    
    Args:
        brep_path: Path to BREP file
        
    Returns:
        TopoDS_Shape object
        
    Raises:
        FileNotFoundError: If BREP file doesn't exist
        ValueError: If BREP file is invalid or can't be read
    """
    from OCC.Core.BRepTools import BRepTools
    from OCC.Core.BRep import BRep_Builder
    from OCC.Core.TopoDS import TopoDS_Shape
    
    logger.info(f"[REPORT_IMG] Reading BREP: {brep_path}")
    
    if not os.path.exists(brep_path):
        logger.error(f"[REPORT_IMG] BREP file not found: {brep_path}")
        raise FileNotFoundError(f"BREP file not found: {brep_path}")
    
    file_size = os.path.getsize(brep_path)
    logger.info(f"[REPORT_IMG] BREP file size: {file_size} bytes")
    
    try:
        shape = TopoDS_Shape()
        builder = BRep_Builder()
        result = BRepTools.Read(shape, brep_path, builder)
        
        if not result:
            raise ValueError(f"Failed to read BREP file: {brep_path}")
        
        logger.info("[REPORT_IMG] Successfully loaded shape")
        return shape
    except Exception as e:
        logger.error(f"[REPORT_IMG] ERROR: Failed to read BREP - {e}")
        raise ValueError(f"Failed to read BREP file: {e}") from e


def generate_stl_from_brep(brep_path: str, stl_path: str) -> str:
    """Generate STL file from BREP using existing mesh_export utility.
    
    Args:
        brep_path: Path to BREP file
        stl_path: Path where STL should be saved
        
    Returns:
        Path to generated STL file
        
    Raises:
        Exception: If STL generation fails
    """
    from apps.core.utils.mesh_export import write_stl
    
    logger.info(f"[REPORT_IMG] Generating STL from BREP: {brep_path} -> {stl_path}")
    
    shape = read_brep_file(brep_path)
    write_stl(shape, stl_path)
    
    if not os.path.exists(stl_path):
        raise RuntimeError(f"STL file was not created: {stl_path}")
    
    logger.info(f"[REPORT_IMG] STL file generated: {stl_path}")
    return stl_path


def generate_with_open3d(brep_path: str, output_dir: str, module=None) -> Dict[str, str]:
    """Generate report images using Open3D OffscreenRenderer (OPTIONAL, lightweight).
    
    This is an OPTIONAL fallback - Open3D is not in requirements.txt (~500MB).
    Only used if Qt and VTK both fail.
    NOTE: Open3D rendering does not support colors (single mesh only).
    
    Args:
        brep_path: Path to BREP file
        output_dir: Directory to save PNG images
        module: Design module instance (not used for Open3D, but kept for consistency)
        
    Returns:
        Dict mapping view names to image paths: {"3d": "path", "front": "path", ...}
        
    Raises:
        Exception: If rendering fails
    """
    import open3d as o3d
    import numpy as np
    
    logger.info("[REPORT_IMG] Using Open3D OffscreenRenderer (optional fallback - no colors)...")
    logger.warning("[REPORT_IMG] Open3D rendering produces single-color images (no part colors)")
    
    # Try STL first (if exists, faster and simpler)
    stl_path = brep_path.replace('.brep', '.stl')
    if os.path.exists(stl_path):
        logger.info(f"[REPORT_IMG] Loading mesh from STL: {stl_path}")
        mesh = o3d.io.read_triangle_mesh(stl_path)
        if len(mesh.vertices) == 0:
            raise ValueError(f"STL file is empty or invalid: {stl_path}")
    else:
        # Generate STL from BREP if it doesn't exist
        logger.info(f"[REPORT_IMG] STL not found, generating from BREP...")
        try:
            generate_stl_from_brep(brep_path, stl_path)
            mesh = o3d.io.read_triangle_mesh(stl_path)
            if len(mesh.vertices) == 0:
                raise ValueError(f"Generated STL file is empty: {stl_path}")
        except Exception as e:
            logger.error(f"[REPORT_IMG] Failed to generate/load STL: {e}")
            raise
    
    logger.info(f"[REPORT_IMG] Mesh loaded: {len(mesh.vertices)} vertices, {len(mesh.triangles)} faces")
    
    # Create renderer
    width, height = 800, 600
    logger.info(f"[REPORT_IMG] Creating OffscreenRenderer ({width}x{height}, headless=True)...")
    renderer = o3d.visualization.rendering.OffscreenRenderer(width, height, headless=True)
    
    # Setup scene
    renderer.scene.clear_geometry()
    renderer.scene.add_geometry("mesh", mesh)
    
    # Setup material
    mtl = renderer.scene.get_material("mesh")
    mtl.base_color = [0.7, 0.7, 0.7, 1.0]  # Light gray
    mtl.shader = "defaultLit"
    renderer.scene.update_material("mesh", mtl)
    
    # Setup lighting
    renderer.scene.scene.enable_sun_light(True)
    renderer.scene.scene.set_sun_light_direction([0.577, -0.577, -0.577])
    
    # Get bounding box for camera positioning
    bounds = mesh.get_axis_aligned_bounding_box()
    center = bounds.get_center()
    extent = bounds.get_extent()
    max_extent = max(extent) if max(extent) > 0 else 1.0
    
    # Define views: (camera_direction, up_direction)
    views = {
        '3d': {
            'camera_dir': np.array([1.0, 1.0, 1.0]),
            'up': np.array([0.0, 0.0, 1.0]),
            'distance': max_extent * 2.5
        },
        'front': {
            'camera_dir': np.array([0.0, 0.0, 1.0]),
            'up': np.array([0.0, 1.0, 0.0]),
            'distance': max_extent * 2.5
        },
        'top': {
            'camera_dir': np.array([0.0, 0.0, -1.0]),
            'up': np.array([0.0, 1.0, 0.0]),
            'distance': max_extent * 2.5
        },
        'side': {
            'camera_dir': np.array([1.0, 0.0, 0.0]),
            'up': np.array([0.0, 0.0, 1.0]),
            'distance': max_extent * 2.5
        }
    }
    
    image_paths = {}
    
    for view_name, view_config in views.items():
        logger.info(f"[REPORT_IMG] Rendering {view_name} view...")
        
        # Calculate camera position
        camera_dir_normalized = view_config['camera_dir'] / np.linalg.norm(view_config['camera_dir'])
        camera_pos = center + camera_dir_normalized * view_config['distance']
        
        # Setup camera
        camera = renderer.scene.get_camera()
        
        # Set projection
        fov_deg = 60.0
        aspect = width / height
        near = 0.1
        far = max_extent * 10.0
        camera.set_projection(fov_deg, aspect, near, far, o3d.camera.PinholeCameraIntrinsicParameters.Perspective)
        
        # Calculate look-at matrix
        forward = center - camera_pos
        forward_norm = np.linalg.norm(forward)
        if forward_norm > 1e-6:
            forward = forward / forward_norm
        else:
            forward = np.array([0.0, 0.0, -1.0])
        
        right = np.cross(forward, view_config['up'])
        right_norm = np.linalg.norm(right)
        if right_norm > 1e-6:
            right = right / right_norm
        else:
            right = np.array([1.0, 0.0, 0.0])
        
        up_calc = np.cross(right, forward)
        
        # Build view matrix
        view_matrix = np.eye(4)
        view_matrix[0:3, 0] = right
        view_matrix[0:3, 1] = up_calc
        view_matrix[0:3, 2] = -forward
        view_matrix[0:3, 3] = camera_pos
        
        camera.set_model_matrix(view_matrix)
        renderer.scene.set_camera(camera)
        
        # Render
        image = renderer.render_to_image()
        
        # Save PNG
        output_path = os.path.join(output_dir, f'{view_name}.png')
        o3d.io.write_image(output_path, image)
        image_paths[view_name] = output_path
        logger.info(f"[REPORT_IMG] Image saved to: {output_path}")
    
    logger.info("[REPORT_IMG] Open3D rendering completed successfully")
    return image_paths


def generate_with_vtk(brep_path: str, output_dir: str, module=None) -> Dict[str, str]:
    """Generate report images using VTK (headless rendering, already installed).
    
    This is the FALLBACK method - uses VTK which is already in requirements.txt.
    Pure headless, no Xvfb needed.
    NOTE: VTK rendering does not support colors (single mesh only).
    
    Args:
        brep_path: Path to BREP file
        output_dir: Directory to save PNG images
        module: Design module instance (not used for VTK, but kept for consistency)
        
    Returns:
        Dict mapping view names to image paths: {"3d": "path", "front": "path", ...}
        
    Raises:
        Exception: If rendering fails
    """
    import vtk
    import numpy as np
    
    logger.info("[REPORT_IMG] Using VTK headless rendering (fallback method - no colors)...")
    logger.warning("[REPORT_IMG] VTK rendering produces single-color images (no part colors)")
    
    # Try STL first (if exists, faster)
    stl_path = brep_path.replace('.brep', '.stl')
    if not os.path.exists(stl_path):
        # Generate STL from BREP if it doesn't exist
        logger.info(f"[REPORT_IMG] STL not found, generating from BREP...")
        try:
            generate_stl_from_brep(brep_path, stl_path)
        except Exception as e:
            logger.error(f"[REPORT_IMG] Failed to generate STL: {e}")
            raise
    
    # Read STL file
    logger.info(f"[REPORT_IMG] Reading STL file: {stl_path}")
    reader = vtk.vtkSTLReader()
    reader.SetFileName(stl_path)
    reader.Update()
    
    # Create mapper and actor
    mapper = vtk.vtkPolyDataMapper()
    mapper.SetInputConnection(reader.GetOutputPort())
    
    actor = vtk.vtkActor()
    actor.SetMapper(mapper)
    actor.GetProperty().SetColor(0.7, 0.7, 0.7)  # Light gray
    actor.GetProperty().SetSpecular(0.3)
    actor.GetProperty().SetSpecularPower(30.0)
    
    # Create renderer
    renderer = vtk.vtkRenderer()
    renderer.AddActor(actor)
    renderer.SetBackground(1.0, 1.0, 1.0)  # White background
    
    # Add lighting
    light1 = vtk.vtkLight()
    light1.SetPosition(1.0, 1.0, 1.0)
    light1.SetIntensity(0.8)
    renderer.AddLight(light1)
    
    light2 = vtk.vtkLight()
    light2.SetPosition(-1.0, -1.0, -1.0)
    light2.SetIntensity(0.4)
    renderer.AddLight(light2)
    
    # Get bounding box for camera positioning
    bounds = actor.GetBounds()
    center = [
        (bounds[0] + bounds[1]) / 2.0,
        (bounds[2] + bounds[3]) / 2.0,
        (bounds[4] + bounds[5]) / 2.0
    ]
    extent = [
        bounds[1] - bounds[0],
        bounds[3] - bounds[2],
        bounds[5] - bounds[4]
    ]
    max_extent = max(extent) if max(extent) > 0 else 1.0
    
    # Define views: (camera_position_offset, focal_point_offset, view_up)
    views = {
        '3d': {
            'camera_pos': [1.0, 1.0, 1.0],
            'focal_point': [0.0, 0.0, 0.0],
            'view_up': [0.0, 0.0, 1.0]
        },
        'front': {
            'camera_pos': [0.0, 0.0, 1.0],
            'focal_point': [0.0, 0.0, 0.0],
            'view_up': [0.0, 1.0, 0.0]
        },
        'top': {
            'camera_pos': [0.0, 0.0, -1.0],
            'focal_point': [0.0, 0.0, 0.0],
            'view_up': [0.0, 1.0, 0.0]
        },
        'side': {
            'camera_pos': [1.0, 0.0, 0.0],
            'focal_point': [0.0, 0.0, 0.0],
            'view_up': [0.0, 0.0, 1.0]
        }
    }
    
    image_paths = {}
    width, height = 800, 600
    
    # Create render window once (reuse for all views)
    render_window = vtk.vtkRenderWindow()
    render_window.SetOffScreenRendering(1)
    render_window.SetSize(width, height)
    render_window.AddRenderer(renderer)
    
    for view_name, view_config in views.items():
        logger.info(f"[REPORT_IMG] Rendering {view_name} view...")
        
        # Calculate camera position relative to center
        camera_dir = np.array(view_config['camera_pos'])
        camera_dir_normalized = camera_dir / np.linalg.norm(camera_dir)
        camera_pos = np.array(center) + camera_dir_normalized * max_extent * 2.5
        
        # Reset and setup camera for this view
        camera = renderer.GetActiveCamera()
        camera.SetPosition(camera_pos[0], camera_pos[1], camera_pos[2])
        camera.SetFocalPoint(center[0], center[1], center[2])
        camera.SetViewUp(view_config['view_up'][0], view_config['view_up'][1], view_config['view_up'][2])
        camera.OrthogonalizeViewUp()
        
        # Reset camera to fit bounds, then adjust for view
        renderer.ResetCamera(bounds)
        camera = renderer.GetActiveCamera()
        
        # Adjust camera distance for better view
        camera.Dolly(0.7)  # Zoom out a bit
        camera.SetViewAngle(60.0)
        
        # Ensure proper clipping range
        camera.SetClippingRange(0.1, max_extent * 10.0)
        
        # Render the scene
        render_window.Render()
        
        # Export to image
        window_to_image = vtk.vtkWindowToImageFilter()
        window_to_image.SetInput(render_window)
        window_to_image.SetInputBufferTypeToRGB()
        window_to_image.ReadFrontBufferOff()
        window_to_image.Update()
        
        # Write PNG
        writer = vtk.vtkPNGWriter()
        output_path = os.path.join(output_dir, f'{view_name}.png')
        writer.SetFileName(output_path)
        writer.SetInputConnection(window_to_image.GetOutputPort())
        writer.Write()
        
        image_paths[view_name] = output_path
        logger.info(f"[REPORT_IMG] Image saved to: {output_path}")
        
        # Clean up filter for next iteration
        window_to_image = None
    
    logger.info("[REPORT_IMG] VTK rendering completed successfully")
    return image_paths


def generate_with_opencascade_display(brep_path: str, output_dir: str, module=None) -> Dict[str, str]:
    """Generate report images using OpenCASCADE display (EXACT replica of osdag_gui WITH COLORS).
    
    This is the PRIMARY method - requires Qt and Xvfb, but produces exact GUI replica with colored parts.
    
    Args:
        brep_path: Path to BREP file (for reference, but we use module CAD generation instead)
        output_dir: Directory to save PNG images
        module: Design module instance (required for colored rendering)
        
    Returns:
        Dict mapping view names to image paths: {"3d": "path", "front": "path", ...}
        
    Raises:
        Exception: If rendering fails
    """
    # CRITICAL: Set QT_QPA_PLATFORM=offscreen BEFORE any Qt imports
    # This must happen before init_display() is called, as Qt reads this env var on first import
    os.environ['QT_QPA_PLATFORM'] = 'offscreen'
    
    logger.info("[REPORT_IMG] ========================================")
    logger.info("[REPORT_IMG] ATTEMPTING Qt/OpenCASCADE RENDERING")
    logger.info("[REPORT_IMG] This should produce COLORS like GUI")
    logger.info("[REPORT_IMG] ========================================")
    
    # Setup headless Qt (will try even without Xvfb)
    setup_headless_qt()  # This also sets QT_QPA_PLATFORM, but we already set it above
    
    # Try to create Qt display - this will fail if Qt offscreen doesn't work
    # Create display (same as GUI)
    # Use 'pyside6' backend (PySide6 is already installed) - QT_QPA_PLATFORM=offscreen makes it headless
    try:
        from osdag_core.texlive.Design_wrapper import init_display as init_display_off_screen
        off_display, _, _, _ = init_display_off_screen(backend_str='pyside6')
        logger.info("[REPORT_IMG] Off-screen display created successfully")
    except Exception as e:
        error_msg = str(e)
        logger.error(f"[REPORT_IMG] Failed to create Qt offscreen display: {error_msg}")
        if "offscreen" in error_msg.lower() or "display" in error_msg.lower() or "platform plugin" in error_msg.lower():
            logger.error("[REPORT_IMG] Qt offscreen rendering requires proper Qt platform plugin setup.")
            logger.error("[REPORT_IMG] Install missing dependencies: sudo apt-get install libxcb-cursor0")
            logger.error("[REPORT_IMG] Or use Xvfb: sudo apt-get install xvfb && Xvfb :99 -screen 0 1024x768x24 &")
        raise RuntimeError(f"Cannot create Qt offscreen display: {e}. Install required Qt dependencies or Xvfb for headless rendering.") from e
    
    # Use module CAD generation for colored rendering (like GUI)
    if module is not None:
        logger.info("[REPORT_IMG] Using module CAD generation for colored rendering (GUI approach)...")
        try:
            # Create CommonDesignLogic object (like GUI does)
            from osdag_core.cad.common_logic import CommonDesignLogic
            
            # Create a minimal mock cad_widget (headless - no GUI needed)
            class MockCADWidget:
                def __init__(self):
                    self.model_ais_objects = {}
                    self.model_hover_labels = {}
                def display_view_cube(self):
                    pass  # No-op for headless
            
            mock_widget = MockCADWidget()
            
            # Get module attributes needed for CAD generation
            mainmodule = getattr(module, 'mainmodule', 'Shear Connection')
            connection = getattr(module, 'module', 'FinPlateConnection')
            folder = None  # Not needed for headless
            
            logger.info(f"[REPORT_IMG] Module attributes:")
            logger.info(f"[REPORT_IMG]   - mainmodule: {mainmodule}")
            logger.info(f"[REPORT_IMG]   - connection: {connection}")
            logger.info(f"[REPORT_IMG]   - design_status: {getattr(module, 'design_status', 'NOT SET')}")
            logger.info(f"[REPORT_IMG]   - has hover_dict: {hasattr(module, 'hover_dict')}")
            logger.info(f"[REPORT_IMG] Creating CommonDesignLogic...")
            
            # Create CommonDesignLogic
            comm_logic = CommonDesignLogic(
                display=off_display,
                cad_widget=mock_widget,
                folder=folder,
                connection=connection,
                mainmodule=mainmodule
            )
            
            # Call call_3DModel first (like GUI does) - this creates CAD objects with parts
            # flag=True means design exists, module_object is the module instance
            logger.info("[REPORT_IMG] Calling call_3DModel(True, module)...")
            design_status = getattr(module, 'design_status', True)
            comm_logic.call_3DModel(design_status, module)
            logger.info("[REPORT_IMG] CAD model created via call_3DModel (with colored parts)")
            
            # Note: call_3DModel already calls display_3DModel("Model", "gradient_bg") internally
            # which displays all parts with colors. We just need to change background to white for reports.
            # Don't call display_3DModel again - it would erase everything via cleanup coordinator!
            logger.info("[REPORT_IMG] Changing background to white for report images...")
            off_display.set_bg_gradient_color([255, 255, 255], [126, 126, 126])
            
            # Verify connectivityObj was created (contains the colored CAD parts)
            if not hasattr(comm_logic, 'connectivityObj') or comm_logic.connectivityObj is None:
                logger.error("[REPORT_IMG] ERROR: connectivityObj is None - CAD model was not created!")
                raise RuntimeError("connectivityObj is None - CAD generation failed")
            logger.info("[REPORT_IMG] Verified: connectivityObj exists (CAD model created successfully)")
            
            # CRITICAL: Force display update to ensure colors are rendered before export
            logger.info("[REPORT_IMG] Forcing display update to ensure colors are rendered...")
            off_display.Repaint()  # Repaint() is the correct method for OpenCASCADE display
            # Small delay to ensure rendering completes (headless rendering can be async)
            import time
            time.sleep(0.1)
            logger.info("[REPORT_IMG] Model displayed with colors and white background (ready for export)")
            
        except Exception as e:
            logger.error(f"[REPORT_IMG] Failed to use module CAD generation: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise RuntimeError(f"Module CAD generation failed: {e}") from e
    else:
        # Fallback: Just load BREP (no colors) - COMMENTED OUT, prefer module approach
        logger.warning("[REPORT_IMG] No module provided, cannot generate colored images")
        raise RuntimeError("Module is required for colored rendering. BREP-only rendering disabled.")
        
        # OLD APPROACH (COMMENTED OUT - no colors):
        # shape = read_brep_file(brep_path)
        # off_display.DisplayShape(shape, update=True)
        # off_display.set_bg_gradient_color([255, 255, 255], [255, 255, 255])
    
    # Export images (EXACT same sequence as GUI)
    image_paths = {}
    
    logger.info("[REPORT_IMG] Exporting 3D view...")
    off_display.Repaint()  # Ensure display is updated before export
    off_display.ExportToImage(os.path.join(output_dir, '3d.png'))
    image_paths['3d'] = os.path.join(output_dir, '3d.png')
    
    logger.info("[REPORT_IMG] Exporting Front view...")
    off_display.View_Front()
    off_display.FitAll()
    off_display.Repaint()  # Ensure display is updated before export
    off_display.ExportToImage(os.path.join(output_dir, 'front.png'))
    image_paths['front'] = os.path.join(output_dir, 'front.png')
    
    logger.info("[REPORT_IMG] Exporting Top view...")
    off_display.View_Top()
    off_display.FitAll()
    off_display.Repaint()  # Ensure display is updated before export
    off_display.ExportToImage(os.path.join(output_dir, 'top.png'))
    image_paths['top'] = os.path.join(output_dir, 'top.png')
    
    logger.info("[REPORT_IMG] Exporting Side view...")
    off_display.View_Right()
    off_display.FitAll()
    off_display.Repaint()  # Ensure display is updated before export
    off_display.ExportToImage(os.path.join(output_dir, 'side.png'))
    image_paths['side'] = os.path.join(output_dir, 'side.png')
    
    logger.info("[REPORT_IMG] OpenCASCADE rendering completed successfully")
    return image_paths


def find_existing_cad_files(module_id: str, input_values: dict, 
                           session_id: Optional[str] = None) -> Dict[str, str]:
    """Find existing CAD files for a design.
    
    Searches in file_storage/cad_models/ for BREP or STL files matching
    the session_id or module_id pattern.
    
    Args:
        module_id: Module identifier (e.g., 'FinPlateConnection')
        input_values: Design input values (for future use)
        session_id: Optional session ID to search for
        
    Returns:
        Dict with section -> file_path mapping: {"Model": "path/to/Model.brep", ...}
    """
    logger.info("[REPORT_CAD] Searching for CAD files...")
    
    cad_models_dir = os.path.join(os.getcwd(), "file_storage", "cad_models")
    if not os.path.exists(cad_models_dir):
        logger.info("[REPORT_CAD] CAD models directory does not exist")
        return {}
    
    found_files = {}
    
    # If session_id provided, search for files with that session_id
    if session_id:
        logger.info(f"[REPORT_CAD] Session ID: {session_id}")
        pattern = f"{session_id}_*.brep"
        stl_pattern = f"{session_id}_*.stl"
        
        for file in os.listdir(cad_models_dir):
            if file.startswith(f"{session_id}_") and (file.endswith('.brep') or file.endswith('.stl')):
                section = file.replace(f"{session_id}_", "").replace('.brep', '').replace('.stl', '')
                file_path = os.path.join(cad_models_dir, file)
                found_files[section] = file_path
                logger.info(f"[REPORT_CAD] Found CAD file: {section} -> {file_path}")
    else:
        # Search by module_id pattern (less reliable, but fallback)
        logger.info(f"[REPORT_CAD] No session_id, searching by module pattern...")
        # This is a simplified search - in practice, you might want more sophisticated matching
        for file in os.listdir(cad_models_dir):
            if file.endswith('.brep') or file.endswith('.stl'):
                # Try to match by checking if file might be related
                # This is a placeholder - actual implementation might need better logic
                file_path = os.path.join(cad_models_dir, file)
                section = file.replace('.brep', '').replace('.stl', '').split('_')[-1]
                if section == 'Model':  # Only take Model section for now
                    found_files[section] = file_path
                    logger.info(f"[REPORT_CAD] Found CAD file: {section} -> {file_path}")
    
    if found_files:
        logger.info(f"[REPORT_CAD] Found CAD files: {list(found_files.keys())}")
    else:
        logger.info("[REPORT_CAD] No existing CAD files found, will generate")
    
    return found_files


def generate_cad_files_for_report(module: Any, input_values: dict, 
                                  module_id: str, session_id: Optional[str] = None) -> Dict[str, str]:
    """Generate CAD files for report if they don't exist.
    
    Reuses CAD generation logic from module adapters.
    Generates CAD files on-the-fly if they don't exist.
    
    Args:
        module: Design module instance
        input_values: Design input values
        module_id: Module identifier
        session_id: Optional session ID for file naming
        
    Returns:
        Dict of section -> file_path: {"Model": "path/to/Model.brep", ...}
    """
    logger.info("[REPORT_CAD] Generating CAD files on-the-fly...")
    
    if session_id is None:
        import uuid
        session_id = str(uuid.uuid4())
        logger.info(f"[REPORT_CAD] Generated session_id: {session_id}")
    
    # Map module_id to adapter function
    module_adapter_map = {
        'FinPlateConnection': 'apps.modules.shear_connection.submodules.fin_plate.adapter',
        'EndPlateConnection': 'apps.modules.shear_connection.submodules.end_plate.adapter',
        'CleatAngleConnection': 'apps.modules.shear_connection.submodules.cleat_angle.adapter',
        'Seated-Angle-Connection': 'apps.modules.shear_connection.submodules.seated_angle.adapter',
        'Cover-Plate-Bolted-Connection': 'apps.modules.moment_connection.submodules.beam_beam_cover_plate_bolted.adapter',
        'Beam-Beam-End-Plate-Connection': 'apps.modules.moment_connection.submodules.beam_beam_end_plate.adapter',
        'Cover-Plate-Welded-Connection': 'apps.modules.moment_connection.submodules.beam_beam_cover_plate_welded.adapter',
        'Beam-to-Column-End-Plate-Connection': 'apps.modules.moment_connection.submodules.beam_column_end_plate.adapter',
        'ColumnCoverPlateBolted': 'apps.modules.moment_connection.submodules.column_column_cover_plate_bolted.adapter',
        'Column-to-Column-Cover-Plate-Welded-Connection': 'apps.modules.moment_connection.submodules.column_column_cover_plate_welded.adapter',
        'Column-to-Column-End-Plate-Connection': 'apps.modules.moment_connection.submodules.column_column_end_plate.adapter',
    }
    
    if module_id not in module_adapter_map:
        logger.warning(f"[REPORT_CAD] Module {module_id} not in adapter map, cannot generate CAD")
        return {}
    
    try:
        # Import the adapter module
        adapter_module_path = module_adapter_map[module_id]
        adapter_module = __import__(adapter_module_path, fromlist=['create_cad_model'])
        create_cad_model_func = getattr(adapter_module, 'create_cad_model', None)
        
        if not create_cad_model_func:
            logger.warning(f"[REPORT_CAD] create_cad_model not found in {adapter_module_path}")
            return {}
        
        # Generate CAD for Model section
        logger.info(f"[REPORT_CAD] Calling create_cad_model for section: Model")
        cad_path = create_cad_model_func(input_values, "Model", session_id)
        
        if not cad_path:
            logger.warning(f"[REPORT_CAD] create_cad_model returned None or empty")
            return {}
        
        # Resolve full path
        if not os.path.isabs(cad_path):
            cad_path = os.path.join(os.getcwd(), cad_path)
        
        if os.path.exists(cad_path):
            logger.info(f"[REPORT_CAD] CAD file generated: {cad_path}")
            return {"Model": cad_path}
        else:
            logger.warning(f"[REPORT_CAD] Generated CAD file does not exist: {cad_path}")
            return {}
            
    except Exception as e:
        logger.error(f"[REPORT_CAD] ERROR: CAD generation failed - {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {}


def ensure_image_directory(image_dir: str) -> str:
    """Ensure image directory exists and return absolute path.
    
    Args:
        image_dir: Directory path (relative or absolute)
        
    Returns:
        Absolute path to image directory
    """
    if not os.path.isabs(image_dir):
        image_dir = os.path.join(os.getcwd(), image_dir)
    
    logger.info(f"[REPORT_IMG] Creating image directory: {image_dir}")
    
    if not os.path.exists(image_dir):
        os.makedirs(image_dir, exist_ok=True)
        logger.info(f"[REPORT_IMG] Image directory created: {image_dir}")
    else:
        logger.info(f"[REPORT_IMG] Image directory exists: {image_dir}")
    
    return image_dir


def copy_fallback_images(output_dir: str) -> Dict[str, str]:
    """Copy broken.png as fallback for all views.
    
    Args:
        output_dir: Directory to save fallback images
        
    Returns:
        Dict mapping view names to fallback image paths
    """
    logger.info("[REPORT_IMG] WARNING: Image generation failed, using fallback")
    
    # Find broken.png in osdag_core data
    from osdag_core.Common import _get_resource_path
    pkg_images = _get_resource_path("data", "ResourceFiles", "images")
    broken_png_path = pkg_images / "broken.png"
    
    if not os.path.exists(str(broken_png_path)):
        logger.error(f"[REPORT_IMG] Fallback image not found: {broken_png_path}")
        return {}
    
    image_paths = {}
    for view_name in ['3d', 'front', 'top', 'side']:
        dest_path = os.path.join(output_dir, f'{view_name}.png')
        shutil.copy2(str(broken_png_path), dest_path)
        image_paths[view_name] = dest_path
        logger.info(f"[REPORT_IMG] Copied fallback image: {dest_path}")
    
    logger.info("[REPORT_IMG] Fallback images set for all views")
    return image_paths


def generate_cad_images_for_report(
    module: Any,
    input_values: dict,
    module_id: str,
    report_dir: str,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """Main function to generate CAD images for report.
    
    This function orchestrates the entire image generation pipeline:
    1. Find or generate CAD files
    2. Convert BREP/STL to images using rendering backend
    3. Copy images to ResourceFiles/images/
    4. Return paths
    
    Args:
        module: Design module instance
        input_values: Design input values
        module_id: Module identifier
        report_dir: Base directory for report files
        session_id: Optional session ID for CAD file discovery
        
    Returns:
        Dict with:
            - success: bool
            - images: {"3d": "path", "front": "path", ...}
            - errors: List of error messages
    """
    logger.info("[REPORT_IMG] Starting image generation pipeline...")
    
    result = {
        "success": False,
        "images": {},
        "errors": []
    }
    
    try:
        # Step 1: Check if module is available (required for colored rendering)
        if module is None:
            logger.warning("[REPORT_IMG] No module provided, cannot generate colored images")
            result["errors"].append("Module is required for colored rendering")
            image_dir = ensure_image_directory(os.path.join(report_dir, "ResourceFiles", "images"))
            result["images"] = copy_fallback_images(image_dir)
            return result
        
        # Step 2: Convert to images using module CAD generation (like GUI)
        logger.info("[REPORT_IMG] Step 2/4: Converting to images using module CAD generation...")
        image_dir = ensure_image_directory(os.path.join(report_dir, "ResourceFiles", "images"))
        logger.info(f"[REPORT_IMG] Images will be saved to: {image_dir}")
        logger.info(f"[REPORT_IMG] report_dir: {report_dir}")
        
        # For Qt rendering, we don't need CAD files - module generates CAD directly
        # For VTK/Open3D fallbacks, we may need CAD files, so find them if needed
        cad_file_path = None  # Will be set only if needed for fallback
        
        # Try Qt first (PRIMARY - exact GUI replica WITH COLORS, already installed)
        try:
            logger.info("[REPORT_IMG] ===== USING Qt/OpenCASCADE RENDERING (WITH COLORS) =====")
            logger.info("[REPORT_IMG] This is the PRIMARY method - exact GUI replica with colored parts")
            # Qt rendering uses module directly, no CAD file needed
            image_paths = generate_with_opencascade_display("", image_dir, module=module)
            result["success"] = True
            result["images"] = image_paths
            logger.info(f"[REPORT_IMG] ===== Qt rendering SUCCESS - Generated colored images: {list(image_paths.keys())} =====")
        except Exception as e:
            logger.error(f"[REPORT_IMG] ===== Qt rendering FAILED: {e} =====")
            logger.warning(f"[REPORT_IMG] Falling back to VTK (NO COLORS)...")
            import traceback
            logger.error(traceback.format_exc())
            result["errors"].append(f"Qt rendering failed: {e}")
            
            # For fallback methods, we need CAD files
            logger.info("[REPORT_IMG] Finding CAD files for fallback rendering...")
            cad_files = find_existing_cad_files(module_id, input_values, session_id)
            
            if not cad_files:
                logger.info("[REPORT_IMG] No existing CAD files, generating on-the-fly...")
                cad_files = generate_cad_files_for_report(module, input_values, module_id, session_id)
            
            if not cad_files:
                logger.warning("[REPORT_IMG] No CAD files available for fallback, using broken.png")
                result["images"] = copy_fallback_images(image_dir)
                return result
            
            # Get Model section (primary CAD file)
            model_file = cad_files.get("Model")
            if not model_file:
                logger.warning("[REPORT_IMG] No Model section in CAD files")
                result["images"] = copy_fallback_images(image_dir)
                return result
            
            # Determine file path (prefer STL, fallback to BREP)
            brep_path = model_file
            stl_path = model_file.replace('.brep', '.stl')
            if os.path.exists(stl_path):
                cad_file_path = stl_path
            elif os.path.exists(brep_path):
                cad_file_path = brep_path
            else:
                logger.error(f"[REPORT_IMG] CAD file not found: {model_file}")
                result["images"] = copy_fallback_images(image_dir)
                return result
            
            # Try VTK fallback (already installed, lighter) - NOTE: No colors
            try:
                if verify_vtk_available():
                    logger.info("[REPORT_IMG] Using VTK (fallback method - already installed, no colors)...")
                    image_paths = generate_with_vtk(cad_file_path, image_dir, module=module)
                    result["success"] = True
                    result["images"] = image_paths
                    logger.info(f"[REPORT_IMG] Generated images: {list(image_paths.keys())}")
                else:
                    raise RuntimeError("VTK not available")
            except Exception as e2:
                logger.warning(f"[REPORT_IMG] VTK rendering failed: {e2}, trying Open3D (optional)...")
                result["errors"].append(f"VTK rendering failed: {e2}")
                
                # Try Open3D (OPTIONAL - not in requirements.txt) - NOTE: No colors
                try:
                    if verify_open3d_available():
                        logger.info("[REPORT_IMG] Using Open3D (optional fallback - not in requirements, no colors)...")
                        image_paths = generate_with_open3d(cad_file_path, image_dir, module=module)
                        result["success"] = True
                        result["images"] = image_paths
                        logger.info(f"[REPORT_IMG] Generated images: {list(image_paths.keys())}")
                    else:
                        raise RuntimeError("Open3D not available (optional package)")
                except Exception as e3:
                    logger.error(f"[REPORT_IMG] All rendering methods failed: {e3}")
                    result["errors"].append(f"Open3D rendering failed: {e3}")
                    # Use fallback images
                    result["images"] = copy_fallback_images(image_dir)
        
        # Step 3: Verify images exist
        logger.info("[REPORT_IMG] Step 3/4: Verifying images...")
        verified_images = {}
        for view_name, img_path in result["images"].items():
            if os.path.exists(img_path):
                verified_images[view_name] = img_path
            else:
                logger.warning(f"[REPORT_IMG] Image file missing: {img_path}")
                result["errors"].append(f"Image file missing: {img_path}")
        
        if not verified_images:
            logger.warning("[REPORT_IMG] No images verified, using fallback")
            result["images"] = copy_fallback_images(image_dir)
        else:
            result["images"] = verified_images
        
        # Step 4: Complete
        logger.info("[REPORT_IMG] Step 4/4: Image generation complete")
        logger.info(f"[REPORT_IMG] Generated images: {list(result['images'].keys())}")
        
    except Exception as e:
        logger.error(f"[REPORT_IMG] ERROR: Image generation pipeline failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        result["errors"].append(f"Pipeline error: {e}")
        
        # Ensure fallback images are set
        try:
            image_dir = ensure_image_directory(os.path.join(report_dir, "ResourceFiles", "images"))
            result["images"] = copy_fallback_images(image_dir)
        except Exception as fallback_err:
            logger.error(f"[REPORT_IMG] Even fallback failed: {fallback_err}")
            result["errors"].append(f"Fallback failed: {fallback_err}")
    
    return result

