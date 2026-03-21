# Simply Supported Beam Module

## Overview
This module implements the Simply Supported Beam (Flexural Member) design following the same pattern as the Tension Member (BoltedToEnd) module.

## Structure
```
simplySupportedBeam/
├── SimplySupportedBeam.jsx          # Main component using EngineeringModule
├── components/
│   └── SimplySupportedBeamOutputDock.jsx   # Output dock component
├── configs/
│   ├── simplySupportedBeamConfig.js         # Input configuration
│   └── simplySupportedBeamOutputConfig.js  # Output configuration
├── index.js                          # Module export
└── README.md                         # This documentation
```

## Implementation Details

### 1. Main Component (SimplySupportedBeam.jsx)
- Uses the shared `EngineeringModule` component
- Follows the same pattern as `BoltedToEnd.jsx`
- Integrates with the module system using `menuItems` and configurations

### 2. Input Configuration (simplySupportedBeamConfig.js)
Based on backend API requirements from `simply_supported_beam.py`:

#### Required Backend Keys:
- `Module`: "Simply-Supported-Beam"
- `Member.Profile`: Section profile (Beams/Columns)
- `Member.Designation`: Section designation list
- `Material`: Material grade
- `Member.Material`: Section material
- `Design.Design_Method`: Design method
- `Design.Allowable_Class`: Allowable section class
- `Design.Effective_Area_Parameter`: Effective area parameter
- `Design.Length_Overwrite`: Length overwrite factor
- `Design.Bearing_Length`: Bearing length at supports
- `Load.Shear`: Shear force
- `Load.Moment`: Bending moment
- `Member.Length`: Member length
- `Support.Type`: Support type (Laterally Supported/Unsupported)
- `Torsional.Restraint`: Torsional restraint (Fixed/Free)
- `Warping.Restraint`: Warping restraint (Fixed/Free)

#### Input Sections:
1. **Member Properties**: Section profile, designation, material, length
2. **Loads**: Shear force, bending moment
3. **Design Parameters**: Design method, allowable class, support type, restraints
4. **Advanced Parameters**: Effective area parameter, length overwrite, bearing length

### 3. Output Configuration (simplySupportedBeamOutputConfig.js)
Based on expected output from flexure design calculations:

#### Output Sections:
1. **Section**: Optimum designation, dimensions, properties
2. **Section Classification**: Section class, Beta_b, classification
3. **Strength**: Plastic strength, bending strength, LTB strength
4. **Lateral Torsional Buckling**: Critical moment, torsional/warping constants
5. **Web Buckling**: Buckling strength, crippling strength
6. **Design Status**: Utilization ratio, design status

#### Modal Details:
- **Strength Modal**: Detailed strength calculations
- **LTB Modal**: Lateral torsional buckling analysis
- **Web Buckling Modal**: Web buckling and crippling analysis

### 4. Output Dock Component
- Uses `BaseOutputDock` component
- Structured output display with modals
- Follows the same pattern as other modules

## Constants Added
Added the following constants to `DesignKeys.js`:

### Flexural Member Constants:
- `KEY_ALLOW_CLASS`
- `KEY_EFFECTIVE_AREA_PARA`
- `KEY_LENGTH_OVERWRITE`
- `KEY_BEARING_LENGTH`
- `KEY_SUPPORT`
- `KEY_TORSIONAL_RES`
- `KEY_WARPING_RES`

### Display Constants:
- `KEY_DISP_PLASTIC_STRENGTH_MOMENT`
- `KEY_DISP_Bending_STRENGTH_MOMENT`
- `KEY_DISP_LTB_Bending_STRENGTH_MOMENT`
- `KEY_DISP_Elastic_CM`
- `KEY_DISP_T_constatnt`
- `KEY_DISP_W_constatnt`
- `KEY_DISP_BUCKLING_STRENGTH`
- `KEY_WEB_CRIPPLING`
- `KEY_IMPERFECTION_FACTOR_LTB`
- `KEY_SR_FACTOR_LTB`
- `KEY_NON_DIM_ESR_LTB`

## Backend Integration

### API Endpoint
The module connects to the backend through:
- **API Module**: `osdag_api/modules/simply_supported_beam.py`
- **Design Type**: `design_type/flexural_member/flexure.py`

### Backend Functions:
- `get_required_keys()`: Returns required input keys
- `validate_input()`: Validates input parameters
- `create_from_input()`: Creates Flexure module instance
- `generate_output()`: Generates design output
- `create_cad_model()`: Creates 3D CAD model

### Key Mapping:
The frontend keys are mapped to backend keys in `buildSubmissionParams()` function.

## Routing
- **Route**: `/design/:designType/simply_supported_beam`
- **Component**: `SimplySupportedBeam`
- **Integration**: Added to `App.jsx` and `Window.jsx`

## CAD Integration
- **Camera Key**: "FlexuralMember"
- **CAD Options**: ["Model", "Beam"]
- **3D Model**: Supports beam visualization

## Testing Status
✅ **Build**: Successfully compiles without errors
✅ **Routing**: Route added and configured
✅ **Integration**: Uses shared components and patterns
✅ **Constants**: All required constants added

## Next Steps

### Backend Requirements:
1. **Ensure Backend API**: Verify `osdag_api/modules/simply_supported_beam.py` is complete
2. **Test Backend Integration**: Test the API endpoints
3. **CAD Model Support**: Ensure 3D model generation works
4. **Output Validation**: Verify output keys match frontend expectations

### Frontend Enhancements:
1. **Error Handling**: Add proper error messages for validation
2. **Tooltips**: Add helpful tooltips for advanced parameters
3. **Unit Tests**: Add unit tests for configurations
4. **Documentation**: Add user documentation

### Design Validation:
1. **Input Validation**: Test all input validation scenarios
2. **Output Display**: Verify output formatting and modals
3. **CAD Visualization**: Test 3D model display
4. **Design Report**: Ensure design report generation works

## Usage Example
```javascript
// Navigation to module
navigate('/design/flexure/simply_supported_beam');

// Component will render with:
// - Input form with 4 sections
// - 3D CAD viewer
// - Output dock with organized results
// - Design report capability
// - Save/load functionality
```

## Dependencies
- React 18+
- Ant Design components
- Three.js for 3D visualization
- Shared engineering module components
- Backend Python API integration 