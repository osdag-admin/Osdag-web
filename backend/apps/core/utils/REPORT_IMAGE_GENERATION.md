
## Problem Statement

When generating design reports via the web API, CAD images (3D, front, top, side views) were either:
1. **Missing** - Causing LaTeX compilation errors (`File 'None' not found`)
2. **Colorless/White** - Images were generated but appeared as blank white canvases without any geometry or colors
3. **Single-color** - Images showed geometry but without the distinct colors for different parts (beams, columns, plates, bolts, welds) that users see in the GUI

### Root Causes

1. **Missing Image Generation**: The CLI approach (`save_design()`) expects images to already exist, but the web API wasn't generating them before calling `save_design()`.

2. **Incorrect Rendering Method**: Initial attempts used VTK or Open3D rendering, which:
   - Don't support the colored rendering used by the GUI
   - Produce single-color or grayscale images
   - Don't replicate the exact visual appearance of the GUI

3. **BREP File Approach**: Loading pre-generated BREP files directly loses color information, as colors are applied during CAD generation, not stored in BREP files.

## Solution

The solution replicates the exact GUI rendering approach using:
- **Qt/PySide6** with OpenCASCADE display (same as GUI)
- **Module-based CAD generation** - Uses the module's own `call_3DModel()` and `display_3DModel()` methods
- **Headless rendering** - Uses Qt's offscreen platform plugin with Xvfb

### Architecture

```
Web API Request
    ↓
generate_cad_images_for_report()
    ↓
generate_with_opencascade_display() [PRIMARY - WITH COLORS]
    ├─ Setup headless Qt (QT_QPA_PLATFORM=offscreen)
    ├─ Create offscreen display (pyside6 backend)
    ├─ Create CommonDesignLogic instance
    ├─ Call module.call_3DModel() → Creates CAD with colored parts
    ├─ Call display_3DModel() → Displays with colors
    ├─ Set white background for reports
    └─ Export 4 views: 3d.png, front.png, top.png, side.png
    ↓
[If Qt fails]
generate_with_vtk() [FALLBACK - NO COLORS]
    └─ Single-color rendering
```

## Setup Requirements

### System Packages

#### 1. Xvfb (X Virtual Framebuffer)
Required for headless Qt rendering.

```bash
sudo apt-get update
sudo apt-get install xvfb
```

**Why needed**: Qt's offscreen platform plugin requires a display server. Xvfb provides a virtual display for headless environments.

#### 2. libxcb-cursor0
Required for Qt's xcb platform plugin (even when using offscreen).

```bash
sudo apt-get install libxcb-cursor0
```

**Why needed**: Qt 6.5+ requires this library for the xcb platform plugin, even when using offscreen rendering.

### Python Packages

All required packages should already be in `requirements.txt`:

- **PySide6** - Qt Python bindings (already installed)
- **pythonocc-core** - OpenCASCADE Python bindings (already installed)
- **vtk** - VTK library (fallback rendering, already installed)

### Verification

Check if Xvfb is installed:
```bash
which Xvfb
```

Check if libxcb-cursor0 is installed:
```bash
dpkg -l | grep libxcb-cursor
```

## How It Works

### 1. Module CAD Generation

Instead of loading pre-generated BREP files, the solution uses the module's own CAD generation logic:

```python
# Create CommonDesignLogic (same as GUI)
comm_logic = CommonDesignLogic(
    display=off_display,
    cad_widget=mock_widget,
    folder=folder,
    connection=connection,
    mainmodule=mainmodule
)

# Call module's CAD generation (creates colored parts)
comm_logic.call_3DModel(design_status, module)

# Display with colors (like GUI)
comm_logic.display_3DModel("Model", "gradient_light")
```

This ensures:
- **Individual parts are created** with their respective colors (beams, plates, bolts, welds)
- **Colors match the GUI** exactly
- **No BREP conversion needed** - colors are applied during generation

### 2. Headless Qt Setup

```python
# Set Qt to use offscreen platform (must be before Qt imports)
os.environ['QT_QPA_PLATFORM'] = 'offscreen'

# Create offscreen display with pyside6 backend
off_display, _, _, _ = init_display_off_screen(backend_str='pyside6')
```

### 3. Image Export

After displaying the model with colors:

```python
# Set white background for reports
off_display.set_bg_gradient_color([255, 255, 255], [126, 126, 126])

# Export 4 views
off_display.ExportToImage('3d.png')      # 3D view
off_display.View_Front()
off_display.FitAll()
off_display.Repaint()
off_display.ExportToImage('front.png')   # Front view
# ... (top.png, side.png)
```

## File Structure

```
Osdag-web/
├── backend/
│   └── apps/
│       └── core/
│           └── utils/
│               └── report_image_generator.py  # Main implementation
├── osdag_core/
│   ├── cad/
│   │   └── common_logic.py                   # CommonDesignLogic (modified for headless)
│   └── texlive/
│       └── Design_wrapper.py                  # Display initialization
└── backend/
    └── file_storage/
        └── design_report/
            └── ResourceFiles/
                └── images/                    # Generated images stored here
                    ├── 3d.png
                    ├── front.png
                    ├── top.png
                    └── side.png
```

## Key Code Changes

### 1. `report_image_generator.py`

- **`generate_with_opencascade_display()`**: Primary rendering function using Qt/OpenCASCADE
- **Module-based CAD generation**: Uses `CommonDesignLogic.call_3DModel()` instead of BREP loading
- **Fallback chain**: Qt → VTK → Open3D → broken.png

### 2. `common_logic.py`

- **Optional cleanup coordinator**: Made `osdag_gui.OS_safety_protocols` import optional for headless mode
- **Headless-compatible**: Works without GUI dependencies

### 3. `Design_wrapper.py`

- **Removed verbose print**: Cleaned up debug output

## Troubleshooting

### Issue: "Xvfb not found"
**Solution**: Install Xvfb (see Setup Requirements)

### Issue: "Could not load the Qt platform plugin 'xcb'"
**Solution**: Install `libxcb-cursor0` (see Setup Requirements)

### Issue: "'Viewer3d' object has no attribute 'Update'"
**Solution**: Use `Repaint()` instead of `Update()` for OpenCASCADE display objects.

### Issue: Images are still white/colorless
**Check**:
1. Is Qt rendering being used? Check logs for `[REPORT_IMG] ATTEMPTING Qt/OpenCASCADE RENDERING`
2. Is `call_3DModel()` succeeding? Check logs for `connectivityObj exists`
3. Are colors being applied? Check that `display_3DModel()` is called with "Model" component

### Issue: "Module CAD generation failed"
**Possible causes**:
1. Module object is None or invalid
2. Module doesn't have required attributes (`design_status`, `module`, `mainmodule`)
3. CAD generation function doesn't exist for this module type

**Solution**: Ensure module is properly initialized before calling `generate_cad_images_for_report()`

## Testing

### Manual Test

1. Generate a report via web API
2. Check generated images in `backend/file_storage/design_report/ResourceFiles/images/`
3. Verify:
   - Images exist (3d.png, front.png, top.png, side.png)
   - Images show geometry (not blank)
   - Images have colors (beams, plates, bolts in different colors)
   - Colors match GUI appearance

### Automated Test

```python
from backend.apps.core.utils.report_image_generator import generate_cad_images_for_report

# Create module instance
module = create_from_input(input_values)

# Generate images
result = generate_cad_images_for_report(module, output_dir)

# Verify
assert result['success'] == True
assert '3d' in result['images']
assert os.path.exists(result['images']['3d'])
```

## Performance Considerations

- **Qt rendering**: ~2-5 seconds per report (with colors)
- **VTK fallback**: ~1-2 seconds per report (no colors)
- **Image generation**: Happens synchronously before `save_design()` call

## Future Improvements

1. **Caching**: Cache generated images if design parameters haven't changed
2. **Async generation**: Generate images asynchronously to improve API response time
3. **Image optimization**: Compress images or use different formats for smaller file sizes
4. **Error recovery**: Better fallback handling and error messages

## Related Files

- `backend/apps/core/utils/report_image_generator.py` - Main implementation
- `backend/apps/core/api/design/design_report_csv_view.py` - API endpoint that calls image generation
- `osdag_core/design_report/reportGenerator_latex.py` - LaTeX report generator (uses images)
- `osdag_core/cad/common_logic.py` - CAD generation logic (used by both GUI and web)

## References

- OpenCASCADE Documentation: https://dev.opencascade.org/
- Qt Offscreen Rendering: https://doc.qt.io/qt-6/qoffscreensurface.html
- PySide6 Documentation: https://doc.qt.io/qtforpython/

