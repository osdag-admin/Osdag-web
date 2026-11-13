# Chapter 6: Dynamic UI Form Engine

Osdag-Web implements a declarative, configuration-driven UI form engine. Rather than hardcoding forms, the interface dynamically renders inputs, binds validation rules, fetches options, visualizes output docks, and updates contextual drawings based on module-specific schemas.

---

## 6.1 Dynamic Option Loading (`/options/` endpoints)

When an engineering module page loads, the frontend must populate the dropdown selectors with standard structural sections (Beams, Columns, Channels, Angles) and material values (Steel grades, Bolt grades, Plate thicknesses) from the backend catalog:

1. **Option Queries:** The application issues a GET request to `/api/options/<module_id>/` on load.
2. **Stateless Options Resolution:** The backend reads the standard catalog (the Indian Standard structural tables bundled with `osdag_core`, via `apps/core/catalog.py`) and returns arrays of JSON records matching the active submodule's requirements.
3. **Frontend Caching:** The returned catalog lists (e.g. `boltDiameterList`, `thicknessList`, `beamList`) are saved in the module's React state context.

---

## 6.2 Custom Dropdowns & Section Merging

Osdag-Web allows users to import or create custom structural sections. These custom shapes must be injected into the standard options dropdowns immediately without requiring a full page refresh.

### 1. The Custom Section Event

When a user adds a section via the Section Catalog database, the browser dispatches a global `CustomEvent` on the `window` object using the `notifyCustomSectionAdded` helper exported from [useModuleData.js](../frontend/src/modules/shared/hooks/useModuleData.js):

```javascript
// Called by the Section Catalog component after saving a new entry
export const notifyCustomSectionAdded = ({ table, designation }) => {
  window.dispatchEvent(
    new CustomEvent("osdag:custom-section-added", {
      detail: { table, designation },
    })
  );
};
```

The event `detail` payload carries:
- **`table`** — the IS section catalog table name (`"Columns"`, `"Beams"`, `"Angles"`, `"Channels"`)
- **`designation`** — the unique section label string (e.g. `"CUSTOM_COL_300"`)

### 2. `localCustomSections` State

The hook maintains a dedicated piece of React state, `localCustomSections`, whose shape is a dictionary mapping each section table to its list of registered custom designations:

```javascript
// Example runtime shape
localCustomSections = {
  Columns: ["CUSTOM_COL_300", "CUSTOM_COL_400"],
  Beams:   ["MY_BEAM_600"],
};
```

This state is populated exclusively by the event listener registered in a mount-only `useEffect` (empty dependency array), so it is **not** affected by module load or API refresh cycles:

```javascript
useEffect(() => {
  const handleCustomSectionAdded = (event) => {
    const { table, designation } = event.detail || {};
    if (!table || !designation || !SECTION_TABLE_TO_LIST_KEYS[table]) return;
    setLocalCustomSections((prev) => ({
      ...prev,
      [table]: appendUnique(prev[table], designation),
    }));
  };

  window.addEventListener("osdag:custom-section-added", handleCustomSectionAdded);
  return () => window.removeEventListener("osdag:custom-section-added", handleCustomSectionAdded);
}, []); // Registered once on mount, never re-fires
```

### 3. `SECTION_TABLE_TO_LIST_KEYS` — Catalog Table to Dropdown Key Mapping

Because one section table can feed multiple dropdown lists in the form engine, a static lookup table maps each IS catalog table name to the list of React state keys it should populate:

```javascript
const SECTION_TABLE_TO_LIST_KEYS = {
  Columns:  ["columnList", "sectionDesignation"],
  Beams:    ["beamList",   "sectionDesignation"],
  Angles:   ["angleList",  "topAngleList"],
  Channels: ["channelList"],
};
```

For example, adding a custom `Columns` entry appends the designation to **both** `columnList` (the column selector dropdown) and `sectionDesignation` (the generic profile selector used in some modules).

### 4. `appendUnique` — Deduplication Guard

Before inserting a new designation, the `appendUnique` helper performs a strict string-equality check to prevent duplicate entries appearing in the same dropdown:

```javascript
const appendUnique = (list = [], value) => {
  if (!value) return list || [];
  const safeList = Array.isArray(list) ? list : [];
  const stringValue = String(value);
  if (safeList.some((item) => String(item) === stringValue)) return safeList; // already present
  return [...safeList, value];
};
```

### 5. Client-Side Merge via `useMemo`

Rather than merging custom sections inside the API-fetching `useEffect`, the hook uses a `useMemo` block to compute the final merged options object entirely on the client. This guarantees that adding a custom section **never triggers a network request**:

```javascript
const mergedOptions = useMemo(() => {
  return mergeLocalCustomSections(baseModuleData, localCustomSections);
}, [baseModuleData, localCustomSections]);
```

Where `mergeLocalCustomSections` applies the `SECTION_TABLE_TO_LIST_KEYS` mapping and `appendUnique` across all tracked custom entries:

```javascript
const mergeLocalCustomSections = (data, localCustomSections) => {
  const next = { ...data };
  Object.entries(localCustomSections || {}).forEach(([table, designations]) => {
    const listKeys = SECTION_TABLE_TO_LIST_KEYS[table] || [];
    listKeys.forEach((key) => {
      designations.forEach((designation) => {
        next[key] = appendUnique(next[key], designation);
      });
    });
  });
  return next;
};
```

The `mergedOptions` value is what `useModuleData` returns to the component. The select menus (`columnList`, `beamList`, etc.) are populated from this merged object, so custom sections appear in real time without any page refresh or API call.

---

## 6.3 Interdependent Fields & Conditional Logic

Form input components can depend on other field values. For example, in a Fin Plate Shear Connection:
* If **Connectivity** is set to `Column Flange-Beam Web` (`CONN_CFBW`), the form must display selectors for **Column Section** and **Beam Section**.
* If **Connectivity** is set to `Beam-Beam`, the form must hide the Column Section and display **Primary Beam** and **Secondary Beam** selectors.

Osdag-Web implements this declaratively within the module's input config file (e.g., `finPlateConfig.js`) using the `conditionalDisplay` selector callback:
```javascript
{
  key: "column_section",
  label: "Column Section",
  type: "select",
  options: "columnList",
  conditionalDisplay: (extraState) => {
    const connectivity = extraState?.selectedOption;
    return connectivity === CONN_CFBW || connectivity === CONN_CWBW;
  }
}
```
The [BaseInputDock.jsx](../frontend/src/modules/shared/components/BaseInputDock.jsx) component evaluates this callback on render. If the condition returns `false`, the field is omitted from the DOM.

---

## 6.4 Contextual Dropdown Images

To aid usability, Osdag-Web changes side panel schematic images to match active selection choices. For example:
* Adjusting the Connectivity option updates the connection schema.
* Selecting a specific hollow section type (SHS vs. CHS) updates the base plate cross-sectional layout sketch.

This is driven by reactive state observers inside [EngineeringModule.jsx](../frontend/src/modules/shared/components/EngineeringModule.jsx):
1. User changes a driver dropdown input value (e.g. `beam_section`).
2. The `onChange` observer matches the selection to structural graphics maps.
3. The component updates the `imageSource` state inside `extraState`, which immediately refreshes the visual diagram rendering below the input dock.

---

## 6.5 The Input Dock Form Engine vs. Output Dock Display

The interface splits structural configurations into two main side panels: the **BaseInputDock** (for form entry) and the **BaseOutputDock** (for displaying results).

### 6.5.1 Input Dock Field Types (`BaseInputDock.jsx` & `InputSection.jsx`)
The input form engine supports several custom declarative field types defined inside the module's `inputSections` array:

1. **`select`**: Renders a standard single-selection select dropdown (react-select). Used for materials, bolt types, etc.
2. **`connectivitySelect` / `endPlateSelect`**: Specialized single-select dropdowns that also trigger instant coordinate/graphics changes, updating the panel's descriptive schematic image when selected.
3. **`sectionProfileSelect` / `sectionProfileList`**: Dropdown selectors customized for loading structural profiles (such as Angles, Beams, and Columns) and triggering cross-sectional parameter updates.
4. **`customizable`**: Dropdowns designed for multi-select arrays. The field shows a select container with two values:
   * **`All`**: Selects all available options in the list automatically.
   * **`Customized`**: Displays a button that opens a transfer modal (Ant Design Transfer) where the user can pick multiple custom sizes (e.g. iterating through Bolt Diameters `[16, 20, 24]` or Plate Thicknesses `[8, 10, 12]`).
5. **`dynamicSelect`**: Options lists populated dynamically based on calculations or other selected variables.
6. **`number` / `text`**: Standard text input fields. They intercept key strokes to block letters, allow only positive or negative decimal numbers, and sanitize formats in real time.
7. **`image`**: Displays a diagram. Its `imageSource(extraState, inputs)` callback returns the image URL and is called on every render, so the picture can follow any input (for example the strut end conditions `end_condition_1` / `end_condition_2`) as well as `extraState`. Note the argument order: `extraState` comes first, as in `conditionalDisplay`.

---

### 6.5.2 Output Dock Field & Layout Types (`BaseOutputDock.jsx` & `OutputModalLayouts.jsx`)
The output dock displays solver results. If a calculation fails (`Design.status: false`), the dock highlights warning logs in red. The outputs are categorized into two main field styles:

1. **Standard Value Boxes**: Read-only, grey-bordered boxes displaying final computed parameters (e.g., `Weld.Size` or `Bolt.Capacity`).
2. **Modal Trigger Inputs**: Renders a button instead of a value box. Clicking this button triggers a pop-up modal showing detailed output calculations mapped to one of these dynamic layout components:
   * **`single-column` / `two-column`**: A plain vertical tabular list of labels and calculated values (e.g., listing bolt grade, shear, and bearing capacities) paired with a static diagram.
   * **`capacity-complex`**: Lists yielding, rupture, and block shear capacities grouped by failure mode alongside visual block-shear pattern images.
   * **`spacing-diagram`**: Renders a dynamic, SVG-based detailed engineering sketch.

---

### 6.5.3 The Dynamic Spacing Diagram SVG Canvas (`SpacingDiagram.jsx`)
When a user opens Spacing Details, Osdag-Web does not display a static image. Instead, it renders **[SpacingDiagram.jsx](../frontend/src/modules/shared/components/SpacingDiagram.jsx)**, which draws an SVG layout dynamically:

* **Dynamic Scaling:** Calculates a scaling factor to fit the plate's dimensions (`plateWidth` $\times$ `plateHeight` in mm) into a standard $600 \times 400$ SVG view box.
* **Component Drawing:**
  * Draws the main connecting steel plate as a scaled gray `<rect>`.
  * Draws the weld line as a crimson `<rect>` if `weldSize > 0`.
  * Distributes and draws bolt holes as `<circle>` coordinates calculated from the number of columns (`cols`), rows (`rows`), gauge spacings, and pitch distances.
* **Dynamic Dimension Labels:** Computes offsets and draws SVG dimension lines, arrow heads, and text labels depicting the exact calculated Pitch (`pitch`), End distance (`end`), Edge distance (`edge`), and Gauge (`gauge`) computed by the backend. This provides a real-time scaled engineering schematic of the bolt pattern.

---

## 6.6 `EngineeringModule` Orchestration Controller

The component [EngineeringModule.jsx](../frontend/src/modules/shared/components/EngineeringModule.jsx) acts as the central orchestration controller. It ties together hooks, input forms, outputs, calculations, logs, and three-dimensional renders:

1. **State Orchestration:** Connects to `useEngineeringModule` to manage state hooks for `inputs`, `outputs`, `logs`, `status` (calculating/rendering), and `designPrefOverrides`.
2. **Form Interactivity Lock:** When calculations complete successfully, the component sets `isInputLocked = true` to freeze editing.
3. **Re-Design Confirmation Loop:** If a user modifies inputs while locked, a confirmation modal warning is shown. Confirming the unlock clears calculation outputs, resets CAD states, and restores edit permissions.
4. **Calculations Lifecycle Hooking:** Initiates WebSocket status subscriptions on submit and guides the docks from input to calculating to output visualization.
5. **Layout Responsiveness:** Manages view panels based on device sizing (e.g., mobile layout toggles between CAD view and form tabs, while desktop splits views into multi-column layouts).

---

## 6.7 Module Input & Output Configurations (`*Config.js`, `*OutputConfig.js`)

Each engineering module defines its interface declaratively:

### 1. `*Config.js` (e.g., [finPlateConfig.js](../frontend/src/modules/shearConnection/finPlate/configs/finPlateConfig.js))
* **`defaultInputs`:** Defines default key-value pairs for the module forms.
* **`validateInputs`:** Client-side check before submission to confirm that all required structural variables are filled.
* **`buildSubmissionParams`:** Converts flat snake_case frontend inputs back into PascalCase dotted parameters expected by the Python desktop engine.
* **`inputSections`:** Declares form sections, groups, field types (select, customizable, number), and display visibility conditions.

### 2. `*OutputConfig.js` (e.g., [finPlateOutputConfig.js](../frontend/src/modules/shearConnection/finPlate/configs/finPlateOutputConfig.js))
* **`sections`:** Lists the output groups (e.g. Bolt, Plate, Weld) and fields to show.
* **`modals` & `modalTypes`:** Configures output sub-modals (spacing calculations, yielding capacities) and their visual layout classes.
* **`modalData`:** Declares lists of properties to display within each capacity detail sub-modal.

### 3. Key Constants (`generated/coreKeys.js` and `UIStrings.js`)
The frontend takes key strings from exactly two files under `frontend/src/constants/`:

* **[generated/coreKeys.js](../frontend/src/constants/generated/coreKeys.js):** One `export const NAME = "value";` for every string constant named `KEY_*` or `DISP_*` in `osdag_core/Common.py`, sorted by name. Configs import from here instead of typing a key such as `"Bolt.Diameter"` by hand. The values are exactly the core's, including the trailing `*` that many core display labels carry; `stripRequiredMark()` in `validation.js` removes it and the renderer adds the required marker from `field.required`. Never change a key's string: it is sent to the backend and stored in `.osi` files and saved projects.
* **[UIStrings.js](../frontend/src/constants/UIStrings.js):** Labels that exist only in the UI (section titles, buttons, reworded field labels). A UI label that should differ from the core's display string is added here under its own name rather than redefining a core constant.

A module's id is also a `Common.py` constant: its desktop module name (for example `KEY_DISP_FINPLATE`, `'Fin Plate Connection'`). See the module registry below.

**Do not edit `coreKeys.js` by hand.** After `Common.py` changes, regenerate it from the repository root:

```bash
python scripts/gen_core_keys.py
```

The script imports `osdag_core.Common`, so run it in the backend environment (set `QT_QPA_PLATFORM=offscreen` on a machine without a display; the script does this by default). The `backend-qa` CI job runs the generator and then `git diff --exit-code frontend/src/constants/generated/`, so a stale file fails the build.

### 4. Module Registry (`registry.js`)
[registry.js](../frontend/src/modules/registry.js) holds one entry per design module in the `MODULES` array. The router in [App.jsx](../frontend/src/App.jsx), the module selection menu, the API slugs and the design-preference data all read from it, so a module is described in one place.

| Field | Meaning |
| :--- | :--- |
| `id` | The module's desktop name, imported from `generated/coreKeys.js` (`KEY_DISP_*`). It is also the backend `MODULE_ID`, the `designType` of the module's config, and the value stored in a project's `submodule` and in the `Module:` line of an `.osi` file. |
| `path` | The design page URL. `App.jsx` registers `${path}/:projectId?` for every entry under `ProjectAuthGuard`. |
| `title` | Page title passed to `EngineeringModule`. |
| `load` | Lazy imports of the module's input config and output config, so each module is its own chunk. [ModulePage.jsx](../frontend/src/modules/ModulePage.jsx) renders `EngineeringModule` from the result. |
| `apiSlug` | Backend URL slug for options, design, CAD and report calls (omitted when the module id is the slug). |
| `menu` | Optional `{ tab, section, label, img }` placing the module on a selection page. Entries without `menu` have a route but no card. |
| `hidden` | Optional. `true` leaves the entry out of `MODULES` and `findModule`, so it has no route or card (Purlin, which the desktop menu does not offer either). |
| `designPref` | Optional per-module design-preference data, such as the fin plate connectivity names. |

`MENU_GROUPS` in the same file lists the tabs and sections of each selection page, including entries marked `status: "development"` (Truss, PEB). Helpers: `findModule(id)`, `getModuleRoute(id)`, `getModuleSlug(id)`, `getModuleDesignPref(id)`, `loadModuleConfigs(id)` and `getMenuSections(tabKey)`. Lookups use the exact id; there are no aliases.

**Adding a module**
1. Backend: add the submodule with `MODULE_ID = KEY_DISP_...` from `osdag_core.Common` (see [ADDING_MODULES_AND_SUBMODULES_BACKEND.md](./general/ADDING_MODULES_AND_SUBMODULES_BACKEND.md)). If the desktop module has a new constant, run `python scripts/gen_core_keys.py` to add it to `coreKeys.js`.
2. Frontend: create the `*Config.js` and `*OutputConfig.js` files with `designType` set to the same constant.
3. Add one entry to `MODULES` in `registry.js`. The route, menu card, API slug and report/open-project navigation follow from it; no other file lists the module.

---

## 6.8 Shared Display Configurations (`sectionDisplayConfig.js` & `outputImageMap.js`)

To keep visual layouts consistent across all modules, helper files map section profiles and calculate outputs to dynamic display configurations:

* **[sectionDisplayConfig.js](../frontend/src/modules/shared/config/sectionDisplayConfig.js):** Defines dimension configurations (e.g., Flange Width $B$, Web Thickness $t$, Root Radius $R_1$) and properties (Mass, Elastic Moduli, Section Areas) for Columns, Beams, Angles, and Channels to display on profile selection cards.
* **[outputImageMap.js](../frontend/src/modules/shared/config/outputImageMap.js):** Resolves which sketch diagram or detailing overlay image to load inside output docks or capacity modals based on selected choices (e.g., checking if column sections include "SHS" or "RHS" and returning corresponding weld schemas).

---

## 6.9 Architectural Observations & Areas of Improvement

During the code review of the Form Engine components, two critical implementation vulnerabilities were identified:

### 1. Keyboard Navigation Lock Bypass (Security & Usability Bug) (Resolved)
* **The Problem:** When a calculation completes successfully, Osdag-Web marks the input dock as locked (`isInputLocked = true`). This applies a transparent click-interceptor overlay and the Tailwind class `pointer-events-none` to block mouse input. However, the form controls (inputs and select boxes) inside `InputSection.jsx` **did not** receive `disabled={isInputLocked}` or `readOnly={isInputLocked}` flags, allowing keyboard users to bypass the lock using the Tab key.
* **Resolution:** Bound the `disabled` property on text `<input>` controls and the `isDisabled` property on React `<Select>` dropdown elements to the `isInputLocked` state passed from the orchestrator. All controls are now properly disabled when the input dock is locked, fully blocking keyboard navigation bypasses.

### 2. Redundant Network Re-fetches on Custom Section Events (Performance Issue) (Resolved)
* **The Problem:** In [useModuleData.js](../frontend/src/modules/shared/hooks/useModuleData.js), `localCustomSections` was included in the dependency array of the options-fetching `useEffect` block alongside `designType` and `getModuleData`.
* **The Risk:** Whenever a user registered a new custom section (dispatching `osdag:custom-section-added`), `localCustomSections` state changed. Because it was listed as a dependency, React re-ran the entire `useEffect`, firing a full `GET /api/options/<module_id>/` network request to the backend even though the server's options catalog had not changed. This caused unnecessary HTTP overhead, redundant re-render cycles, and a temporary overwrite of the dropdown lists with the server's base data, momentarily discarding any previously merged custom entries.
* **Resolution:** The two responsibilities — **fetching base options from the server** and **merging client-side custom sections** — were separated into independent reactive blocks:
  1. The `useEffect` dependency array now contains only `designType`, `getModuleData`, and `optionsRefetchKey`. The raw API response is stored in a dedicated `baseModuleData` state variable instead of the old unified `moduleData`.
  2. A `useMemo` block handles all client-side merging. It re-computes the final merged options object whenever either `baseModuleData` or `localCustomSections` changes — with zero network activity:
  ```javascript
  const mergedOptions = useMemo(() => {
    return mergeLocalCustomSections(baseModuleData, localCustomSections);
  }, [baseModuleData, localCustomSections]);
  ```
  The hook now returns `mergedOptions` directly, so consumers always receive both server-sourced options and all registered custom sections in a single, deduplicated object.
