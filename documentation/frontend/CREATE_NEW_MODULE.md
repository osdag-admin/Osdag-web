## Create a new Shear Connection module (reference: Fin Plate)

This guide shows how to add a new module under `modules/shearConnection/<YourModuleName>` that works with the simplified context, the shared Engineering Module, and the auto CAD flow.

### 1) Folder layout

Create the following structure:

```
src/modules/shearConnection/<YourModuleName>/
  <YourModuleName>.jsx
  components/
    <YourModuleName>OutputDock.jsx
  configs/
    <yourModuleConfig>.js
    <yourModuleOutputConfig>.js
```

Use Fin Plate as a reference:

```
src/modules/shearConnection/finPlate/
  FinPlate.jsx
  components/FinPlateOutputDock.jsx
  configs/finPlateConfig.js
  configs/finPlateOutputConfig.js
```

### 2) Keys and constants

If needed, add module keys in `src/constants/DesignKeys.js`:

```js
export const MODULE_KEY_<YOUR_MODULE> = '<Your-Module-Key>';
export const MODULE_DISPLAY_<YOUR_MODULE> = '<Your Module Display Name>';
```

These are used by config and routing (`designType`, `sessionName`).

### 3) Module component

Create `src/modules/shearConnection/<YourModuleName>/<YourModuleName>.jsx`:

```jsx
import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import <YourModuleName>OutputDock from "./components/<YourModuleName>OutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";
import { <yourModuleConfig> } from "./configs/<yourModuleConfig>";
import { UI_STRINGS } from '../../../constants/UIStrings';

function <YourModuleName>() {
  return (
    <EngineeringModule
      moduleConfig={<yourModuleConfig>}
      OutputDockComponent={<YourModuleName>OutputDock}
      menuItems={menuItems}
      title={UI_STRINGS.CONNECTING_MEMBERS}
    />
  );
}

export default <YourModuleName>;
```

### 4) Module config (inputs and submission)

Create `src/modules/shearConnection/<YourModuleName>/configs/<yourModuleConfig>.js`. Keys must match API expectations.

```js
import { UI_STRINGS } from '../../../../constants/UIStrings';
import { MODULE_KEY_<YOUR_MODULE>, MODULE_DISPLAY_<YOUR_MODULE> } from '../../../../constants/DesignKeys';

export const <yourModuleConfig> = {
  sessionName: MODULE_DISPLAY_<YOUR_MODULE>,
  routePath: "/design/connections/shear/<your_route>",
  designType: MODULE_KEY_<YOUR_MODULE>,
  cameraKey: "<YourCameraKey>",
  cadOptions: ["Model", "Beam", "Column"],

  defaultInputs: {
    module: MODULE_KEY_<YOUR_MODULE>,
    // add stable defaults similar to Fin Plate
  },

  inputSections: [
    {
      title: UI_STRINGS.CONNECTING_MEMBERS,
      fields: [
        { key: "connectivity", label: UI_STRINGS.CONNECTIVITY, type: "connectivitySelect" },
        { key: "column_section", label: UI_STRINGS.COLUMN_SECTION, type: "select", options: "columnList",
          conditionalDisplay: (extra) => extra?.selectedOption?.includes("Column") },
        { key: "beam_section", label: UI_STRINGS.BEAM_SECTION, type: "select", options: "beamList" },
        { key: "connector_material", label: UI_STRINGS.MATERIAL, type: "select", options: "materialList",
          onChange: (value, inputs, setInputs, materialList) => {
            const m = materialList.find(x => x.Grade === value);
            setInputs({ ...inputs, connector_material: m?.Grade || value });
          }
        },
      ]
    },
    {
      title: UI_STRINGS.FASTENERS,
      fields: [
        { key: "bolt_diameter", label: UI_STRINGS.BOLT_DIAMETER, type: "customizable",
          selectionKey: "bolt_diameter_select", modalKey: "boltDiameter" },
        { key: "bolt_grade", label: UI_STRINGS.BOLT_GRADE, type: "customizable",
          selectionKey: "bolt_grade_select", modalKey: "propertyClass" },
      ]
    },
  ],

  selectionConfig: [
    { key: "bolt_diameter_select", inputKey: "bolt_diameter", defaultValue: "All" },
    { key: "bolt_grade_select", inputKey: "bolt_grade", defaultValue: "All" },
  ],

  modalConfig: [
    { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
    { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
  ],

  validateInputs: (inputs) => ({ isValid: true }),

  buildSubmissionParams: (inputs, allSelected, lists, extraState) => {
    const connectivity = extraState?.selectedOption || inputs.connectivity;
    return {
      "Module": MODULE_KEY_<YOUR_MODULE>,
      "Connectivity": connectivity,
      "Bolt.Diameter": allSelected.bolt_diameter ? lists.boltDiameterList : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade ? lists.propertyClassList : inputs.bolt_grade,
      // map other inputs → backend keys
    };
  },
};
```

Notes:
- `options: "beamList" | "columnList" | "materialList" | "boltDiameterList" | "thicknessList" | "propertyClassList"` automatically binds to context lists populated by `/populate`.
- “All/Customized” is supported for bolt/thickness/grade (multiple select vs full-list).

### 5) Output Dock

Create `src/modules/shearConnection/<YourModuleName>/components/<YourModuleName>OutputDock.jsx`:

```jsx
import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { <yourModuleOutputConfig> } from "../configs/<yourModuleOutputConfig>";
import { UI_STRINGS } from '../../../../constants/UIStrings';

const <YourModuleName>OutputDock = ({ output, extraState }) => {
  return (
    <BaseOutputDock
      output={output}
      outputConfig={<yourModuleOutputConfig>}
      title={UI_STRINGS.OUTPUT_DOCK}
      extraState={extraState}
    />
  );
};

export default <YourModuleName>OutputDock;
```

Create `src/modules/shearConnection/<YourModuleName>/configs/<yourModuleOutputConfig>.js`:

```js
export const <yourModuleOutputConfig> = {
  sections: {
    "Bolt": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
    ],
    "Plate": [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Length", label: "Length (mm)" },
    ],
  },
  modals: {
    spacing: { type: "spacing", buttonText: "Open Spacing" },
  },
  modalTypes: {
    spacing: { layout: "two-column", title: "Spacing", width: "60%" },
  },
  modalData: {
    spacing: {
      spacing: [
        { key: "Bolt.Pitch", label: "Pitch Distance (mm)" },
        { key: "Bolt.Gauge", label: "Gauge Distance (mm)" },
      ]
    }
  }
};
```

`BaseOutputDock` automatically normalizes `output` whether it arrives as `{ data: {...} }` or a flat object, and reads values from `output[key].val` when present.

### 6) Routing

Wire the route in the app router to render `<YourModuleName>` at the same `routePath` used in your config.

### 7) Data flow expected

1. Populate on mount: the hook calls `getModuleData(designType)`, reducer sets lists (materials, bolts, thickness, grades, connectivity, beam/column).
2. Inputs: `InputSection` binds to lists by `options: "<listName>"`; All/Customized supported for arrays.
3. Design click: the hook validates, builds submission params, calls the module design endpoint under `api/modules/.../design/`, mirrors output to Output Dock, then auto-calls the module CAD endpoint under `api/modules/.../cad/` to render the 3D model.

### 8) Key mapping tips

- Output keys in your `outputConfig` must exactly match backend keys, e.g. `"Bolt.Diameter"`, `"Plate.Thickness"`.
- For materials, store `Grade` in inputs; backend expects the human-readable grade string.
- For All/Customized: when “All”, pass the full list from context (`lists.*`); when “Customized”, pass the user-selected array (`inputs.<key>`).

### 9) Troubleshooting

- Lists empty in UI: check the module options endpoint under `api/modules/.../options/` runs once, `SET_ALL_MODULE_DATA` in reducer sets all lists, and `EngineeringModule.jsx` passes `contextData` to `InputSection`.
- Dropdowns empty: verify `InputSection` field `options` references a known list name; material uses `Grade` as value.
- Output empty: confirm the module `.../design/` endpoint returns `{ data: {...}, logs: [...] }` and the hook normalization is active; `BaseOutputDock` logs `normalizedOutput` keys in console.
