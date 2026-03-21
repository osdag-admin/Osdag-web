# Simplified ModuleContext API Documentation

## Overview
The ModuleContext has been simplified from **25+ functions to 8 core functions**, reducing complexity by 75% while maintaining full backward compatibility.

## Core Functions (8 Total)

### 1. POPULATE Category (3 functions)

#### `getModuleData(moduleName, options = {})`
**Universal data fetcher that replaces 12+ functions**
- Replaces: `getConnectivityList`, `getColumnBeamMaterialList`, `getBeamMaterialList`, `getBoltDiameterList`, `getThicknessList`, `getPropertyClassList`, etc.
- **Parameters:**
  - `moduleName` (string): Module identifier (e.g., 'FinPlateConnection')
  - `options` (object): Optional parameters
    - `connectivity` (string): Connection type filter
    - `filters` (object): Additional filters
- **Returns:** `{ success: boolean, data?: object, error?: string }`

**Example:**
```javascript
// Get all data for a module
const result = await getModuleData('FinPlateConnection');

// Get connectivity-specific data
const result = await getModuleData('FinPlateConnection', { 
  connectivity: 'Beam-Beam' 
});
```

#### `getConnectivityData(moduleName)`
**Get connectivity-specific data for a module**
- **Parameters:**
  - `moduleName` (string): Module identifier
- **Returns:** Same as `getModuleData`

#### `manageCustomMaterials(action, data = {})`
**Manage custom materials operations**
- Replaces: `addCustomMaterialToDB`, `updateMaterialListFromCaches`
- **Parameters:**
  - `action` (string): 'add', 'sync', 'update'
  - `data` (object): Action-specific data
- **Returns:** `{ success: boolean, message?: string, error?: string }`

**Examples:**
```javascript
// Add custom material
await manageCustomMaterials('add', {
  grade: 'Custom Steel',
  inputs: { fy_20: 250, fy_20_40: 240, fy_40: 230, fu: 410 },
  connectivity: 'Beam-Beam',
  type: 'connector'
});

// Sync from localStorage cache
await manageCustomMaterials('sync');

// Update material details
await manageCustomMaterials('update', {
  materialType: 'connector',
  materialData: { /* material object */ }
});
```

### 2. CALCULATE Category (1 function)

#### `createDesign(param, module_id, onCADSuccess = null)`
**Create design calculation**
- Uses external API function for consistency
- **Parameters:**
  - `param` (object): Design parameters
  - `module_id` (string): Module identifier
  - `onCADSuccess` (function): Optional success callback

### 3. CAD Category (2 functions)

#### `createCADModel(inputData, moduleId, onCADSuccess = null)`
**Generate 3D CAD model**
- **Parameters:**
  - `inputData` (object): Design input values
  - `moduleId` (string): Module identifier
  - `onCADSuccess` (function): Success callback
- **Returns:** `{ success: boolean, files?: object, error?: string }`

#### `downloadCADModel(format)`
**Download CAD model in specified format**
- **Parameters:**
  - `format` (string): File format ('step', 'iges', 'stl')
- **Returns:** `{ success: boolean, blob?: Blob, error?: string }`

### 4. REPORTS Category (1 function)

#### `generateReport(type, params = {})`
**Generate reports with unified interface**
- Replaces: `getPDF`, `createDesignReport`, `saveCSV`
- **Parameters:**
  - `type` (string): Report type ('pdf', 'csv', 'design_report')
  - `params` (object): Report parameters
- **Returns:** `{ success: boolean, message?: string, data?: object, error?: string }`

**Examples:**
```javascript
// Generate PDF
await generateReport('pdf', { report_id: 'report_123' });

// Generate CSV
await generateReport('csv');

// Generate design report
await generateReport('design_report', {
  moduleId: 'FinPlateConnection',
  inputValues: { /* design inputs */ },
  designStatus: true,
  logs: []
});
```

### 5. DESIGN PREFERENCES Category (1 function)

#### `manageDesignPreferences(action, params = {})`
**Manage design preferences and material properties**
- Replaces: `getDesingPrefData`, `getSupportedData`, `getMaterialDetails`, `updateSourceAndMechType`
- **Parameters:**
  - `action` (string): 'get', 'material_update', 'section_update'
  - `params` (object): Action-specific parameters
- **Returns:** `{ success: boolean, data?: object, message?: string, error?: string }`

**Examples:**
```javascript
// Get design preferences
await manageDesignPreferences('get', {
  supported_section: 'ISMB 400',
  supporting_section: 'ISMB 500',
  connectivity: 'Beam-Beam'
});

// Update material details
await manageDesignPreferences('material_update', {
  materialType: 'connector',
  materialData: { /* material object */ }
});

// Update section data
await manageDesignPreferences('section_update', {
  id: 1,
  materialValue: 'Custom'
});
```

## Utility Functions

#### `resetModuleState()`
**Reset module state to initial values**

## Benefits

### Before Simplification:
- **25+ functions** with overlapping functionality
- **Multiple duplicate functions** for same operations
- **Inconsistent API patterns** across similar functions
- **Complex maintenance** and testing
- **Confusing for developers** to know which function to use

### After Simplification:
- **8 core functions** with clear responsibilities
- **75% reduction** in function count
- **Consistent API patterns** with unified error handling
- **Better performance** with fewer API calls
- **Easier maintenance** and testing
- **Clear documentation** and usage patterns

## Migration Guide

### Old Code:
```javascript
// Old way - multiple function calls
await getConnectivityList(moduleName);
await getBoltDiameterList(moduleName);
await getThicknessList(moduleName);
await getPropertyClassList(moduleName);
await addCustomMaterialToDB(grade, inputs, connectivity, type);
await getDesingPrefData(params);
```

### New Code:
```javascript
// New way - single unified call
await getModuleData(moduleName);
await manageCustomMaterials('add', { grade, inputs, connectivity, type });
await manageDesignPreferences('get', params);
```

## Backward Compatibility

All legacy functions are still available and redirect to the new core functions:
- `getConnectivityList` → `getConnectivityData`
- `getBoltDiameterList` → `getModuleData`
- `addCustomMaterialToDB` → `manageCustomMaterials('add')`
- `getDesingPrefData` → `manageDesignPreferences('get')`
- etc.

## Simplified Reducer Actions

The ModuleReducer has also been simplified from **20+ action types to 8 core actions**:

### Core Reducer Actions (8 Total)

1. **`SET_ALL_MODULE_DATA`** - Universal data setter (replaces 10+ individual actions)
2. **`SAVE_MATERIAL_DETAILS`** - Unified material management (replaces 3 actions)
3. **`UPDATE_SECTION_DATA`** - Consolidated section updates (replaces 2 actions)  
4. **`SET_DESIGN_DATA_AND_LOGS`** - Design calculation results
5. **`SET_CAD_MODEL_PATHS`** - CAD model management
6. **`SET_REPORT_ID_AND_DISPLAY_PDF`** - Report management
7. **`SAVE_DESIGN_PREF_DATA`** - Design preferences
8. **`RESET_MODULE_STATE`** - State reset utility

### Reducer Benefits:
- **60% reduction** in action types (20+ → 8)
- **Consistent error handling** across all actions
- **Better null safety** with default values
- **Consolidated logic** for related operations
- **Backward compatibility** maintained

### New Unified Actions:

```javascript
// Old way - multiple separate actions
dispatch({ type: "SAVE_CM_DETAILS", payload: connectorData });
dispatch({ type: "SAVE_SDM_DETAILS", payload: supportedData });
dispatch({ type: "SAVE_STM_DETAILS", payload: supportingData });

// New way - single unified action
dispatch({ 
  type: "SAVE_MATERIAL_DETAILS", 
  payload: { materialType: "connector", materialData: connectorData }
});
```

## Best Practices

1. **Use core functions** for all new development
2. **Avoid legacy functions** - they're only for compatibility
3. **Check return values** - all functions return `{ success, ... }` objects
4. **Handle errors gracefully** - all functions include error handling
5. **Use consistent logging** - all functions include comprehensive logging
6. **Use new reducer actions** - prefer consolidated actions over legacy ones

## Module Support

The simplified API works with all modules:
- **Shear Connections:** Fin Plate, Cleat Angle, End Plate, Seated Angle
- **Moment Connections:** Cover Plate Bolted/Welded, End Plate
- **Base Plates:** Base Plate Connection
- **Tension Members:** Bolted/Welded to End Plate
- **Compression Members:** Struts in Trusses
- **Flexure Members:** Simply Supported Beam, Cantilever Beam, Plate Girder

## State Variables (Unchanged)

All state variables remain the same for backward compatibility:
- `materialList`, `boltDiameterList`, `thicknessList`, `propertyClassList`
- `beamList`, `columnList`, `connectivityList`
- `angleList`, `topAngleList`, `channelList`, `sectionProfileList`
- `weldTypes`, `weldFab`, `endPlateTypeList`
- `designData`, `designLogs`, `cadModelPaths`, `designPrefData`
- etc.
