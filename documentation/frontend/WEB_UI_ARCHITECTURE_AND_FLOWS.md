# Osdag Web UI — architecture and data flows

This document describes the **React** frontend under `Osdag-web/frontend/`: how **module state**, **engineering forms**, **design preferences (Additional Inputs)**, **material handling**, and **APIs** fit together. Implementation files are referenced from the repository root `Osdag-web/`.

---

## 1. Directory map (what lives where)

| Area | Path | Role |
|------|------|------|
| App shell / routing | `frontend/src/App.jsx`, `frontend/src/routes/*` | Top-level routes and layout. |
| Global module state | `frontend/src/context/ModuleState.jsx`, `frontend/src/context/ModuleReducer.jsx` | `ModuleContext` + reducer: lists (materials, bolts, sections), design prefs, material detail blobs, CAD flags. |
| Module UI shell | `frontend/src/modules/shared/components/EngineeringModule.jsx` | Single-module page: input dock, outputs, modals, **Design Preferences** modal host. |
| Design preferences UI | `frontend/src/modules/shared/components/DesignPrefSections.jsx` | Tabbed “Additional Inputs” content; delegates to section modals (`*SectionModal.jsx`). |
| Per-module pref config | `frontend/src/modules/shared/config/designPrefModuleConfig.js` | Which tabs appear, initial tab, `getInitialPrefs` / `getDefaultPrefs` per **module session name**. |
| Module data API | `frontend/src/datasources/modulesDataSource.js`, `frontend/src/datasources/endpoints.js` | HTTP helpers: module options, design, CAD, materials, design preferences. |
| Shared hooks | `frontend/src/modules/shared/hooks/useEngineeringModule.js`, `useModuleForm.js` | Local UI state: `inputs`, `designPrefModalStatus`, confirmation modals, etc. |
| CAD viewer | `frontend/src/modules/shared/components/cad/*` (e.g. `CadScene.jsx`) | Three.js / React Three Fiber CAD preview driven by context paths and inputs. |

---

## 2. High-level lifecycle (one engineering module page)

1. User opens a route that renders **`EngineeringModule`** (or equivalent) with a **`moduleConfig`** (includes **`sessionName`** used as the key for design pref config).
2. **`getModuleData(moduleName)`** (from `ModuleContext`) loads lists from the backend (`fetchModuleOptions`) and **`dispatch`es** `SET_ALL_MODULE_DATA` so `materialList`, `beamList`, connectivity, etc. populate.
3. Form **`inputs`** live in React state (via `useModuleForm` / `useEngineeringModule`). They are the single source for what gets sent to **`createDesign`** / **`createCad`**.
4. User opens **Additional Inputs** → **`designPrefModalStatus === true`** → Ant Design **`Modal`** wraps **`DesignPrefSections`**, passing **`module={moduleConfig.sessionName}`**, **`inputs` / `setInputs`**, and **`moduleMaterialList`** (see §7).
5. Inside **`DesignPrefSections`**, **`designPrefInputs`** holds draft edits. **Save** merges into **`inputs`** via **`setInputs({ ...inputs, ...designPrefInputs })`** and closes the modal.
6. **Design** / **CAD** calls send the current **`inputs`** payload; **`manageDesignPreferences`** and reducer keep **material detail** state aligned when users change grades in the pref modals.

---

## 3. `ModuleContext` state (conceptual groups)

| State field | Purpose |
|-------------|--------|
| `materialList` | Grades/options from **`getModuleData`** (may be empty until fetch completes). |
| `conn_material_details`, `supported_material_details`, `supporting_material_details` | Arrays of material property objects used for read-only Fu/Fy (and similar) in Connector / Beam / Column pref tabs. |
| `designPrefData` | Server-backed design preference blob when **`manageDesignPreferences('get', …)`** succeeds (`SAVE_DESIGN_PREF_DATA`). |
| `design_pref_defaults` | Default strings for bolt/weld/detailing/design when resetting or seeding UI. |
| `designData`, `designLogs`, `renderCadModel`, `cadModelPaths`, `hoverDict` | Post-design results and CAD asset paths for viewer and reports. |
| `currentModuleName` | Last module passed to **`getModuleData`**. |

The provider exposes a small **surface API** (populate, design, CAD, reports, **`manageDesignPreferences`**, **`resetModuleState`**, etc.). See `ModuleState.jsx` for the full export list.

---

## 4. Reducer: material and design-preference–related actions

**File:** `frontend/src/context/ModuleReducer.jsx`

| Action | Effect |
|--------|--------|
| `SET_ALL_MODULE_DATA` | Bulk merge of API payload (lists, options). |
| `SAVE_MATERIAL_DETAILS` | Payload `{ materialType, materialData }` → one of **`conn_material_details`**, **`supported_material_details`**, **`supporting_material_details`** (`materialType`: `connector` \| `supported` \| `supporting`). |
| `SAVE_CM_DETAILS` / `SAVE_SDM_DETAILS` / `SAVE_STM_DETAILS` | Legacy aliases for the same three buckets. |
| `SAVE_DESIGN_PREF_DATA` | Stores server design preference response in **`designPrefData`**. |
| `UPDATE_SUPPORTING_ST_DATA` / `UPDATE_SUPPORTED_ST_DATA` | Section-related metadata updates tied to material tab actions (`section_update` in `manageDesignPreferences`). |
| `UPDATE_MATERIAL_FROM_CACHES` | Merges cached custom materials into **`materialList`**. |
| `RESET_MODULE_STATE` | Clears design/CAD/report slices; keeps module lists unless refreshed. |

---

## 5. `manageDesignPreferences` (context API)

**File:** `frontend/src/context/ModuleState.jsx` — **`manageDesignPreferences(action, params)`**

| Action | Behaviour |
|--------|-----------|
| **`get`** | Calls **`fetchDesignPreferences(params)`**; on success dispatches **`SAVE_DESIGN_PREF_DATA`**. |
| **`material_update`** | Expects **`{ materialType, materialData }`**. Dispatches **`SAVE_CM_DETAILS`**, **`SAVE_SDM_DETAILS`**, or **`SAVE_STM_DETAILS`** according to **`materialType`**. |
| **`section_update`** | Expects **`{ id, materialValue }`**. **`id === 1`** → supporting section update; **`id === 2`** → supported section update (maps to **`UPDATE_SUPPORTING_ST_DATA`** / **`UPDATE_SUPPORTED_ST_DATA`**). |

**`syncDesignPrefMaterialsFromBase`** (defined in the same module) is a helper that, given a base grade and **`materialList`**, can align **`supporting_material`**, **`supported_material`**, and **`connector_material`** and fire three **`material_update`** calls. Call sites should ensure **`materialList`** contains the grade row before syncing.

---

## 6. Design Preferences UI

### 6.1 `DesignPrefSections`

**File:** `frontend/src/modules/shared/components/DesignPrefSections.jsx`

- Resolves config with **`getDesignPrefConfig(module)`** and visible tabs with **`getDesignPrefTabs(module)`** (`ALL_TABS` filtered by **`tabIds`**).
- **`materialListForModals = moduleMaterialList ?? ctx.materialList ?? []`** — see §7.
- Local state **`designPrefInputs`** is initialised with **`designPrefConfig.getInitialPrefs(inputs, module)`** (and module-specific overrides).
- **Save:** **`saveCoreInputs`** merges **`designPrefInputs`** into parent **`inputs`** and closes the modal.
- **Reset:** **`resetInputs`** uses **`getDefaultPrefsForModule()`** (`getDefaultPrefs(inputs, module, design_pref_defaults)`), then updates **`inputs`**.
- Section tabs render the appropriate **`*SectionModal`** components (column, beam, connector, angles, base plate, bolts, weld, etc.).

### 6.2 Section modals and material buckets

Pattern used across modals:

- **Column-oriented member tab** → updates **`supporting_material`**, uses **`supporting_material_details`**, **`materialType: "supporting"`** in **`material_update`**.
- **Beam / supported member tab** → **`supported_material`**, **`supported_material_details`**, **`"supported"`**.
- **Connector tab** → **`connector_material`**, **`conn_material_details`**, **`"connector"`**.

Custom section flows use **`CustomSectionModal`** with a **`type`** matching the same three categories where applicable.

---

## 7. Material list resolution (`moduleMaterialList` vs context)

**`EngineeringModule`** passes **`moduleMaterialList={materialList}`** from the engineering hook, where **`materialList`** is the list loaded for **that page** (connectivity, module slug, etc.).

**`ModuleContext.materialList`** can be **empty** on engineering routes that rely entirely on the hook-fetched list. The nullish coalescing in **`DesignPrefSections`** prefers the **prop** first, then context:

```text
moduleMaterialList ?? ctx.materialList ?? []
```

Authors of new pages should pass **`moduleMaterialList`** when the hook owns the source list.

---

## 8. Per-module configuration (`designPrefModuleConfig.js`)

**File:** `frontend/src/modules/shared/config/designPrefModuleConfig.js`

- **`ALL_TABS`** defines tab **ids** and labels (Column Section\*, Beam Section\*, Angle Section, Connector, Cleat Angle, Seated Angle, Bolt, Base Plate, Stiffener/Shear Key, Anchor Bolt, Weld, Detailing, Optimization, Design).
- Each entry in **`DESIGN_PREF_CONFIG`** is keyed by **`module`** = **`moduleConfig.sessionName`** (must match what **`EngineeringModule`** passes).
- Fields per entry:
  - **`tabIds`** — subset of tab ids to show.
  - **`initialTabIndex`** — which tab is selected first.
  - **`getInitialPrefs(inputs, module)`** — seeds **`designPrefInputs`** when the modal opens.
  - **`getDefaultPrefs(inputs, module, contextDefaults)`** — used on Reset; often falls back to **`design_pref_defaults`** from context.

**Default:** any unknown **`module`** string uses **`DEFAULT_CONFIG`**:  
`tabIds: [0, 1, 3, 6, 10, 11, 13]`, **`getInitialPrefs`** from **`DEFAULT_INITIAL_PREFS`**, **`getDefaultPrefs`** from context defaults.

### 8.1 Registered module session names (explicit entries)

| `sessionName` key | Typical `tabIds` focus |
|--------------------|-------------------------|
| `Butt Joint Bolted` | Bolt + Detailing |
| `Lap Joint Bolted` | Bolt + Detailing |
| `Butt Joint Welded` | Weld + Detailing |
| `Lap Joint Welded` | Weld + Detailing |
| `Column Cover Plate Bolted Connection` | Column + Connector + Bolt + Detailing + Design |
| `Beam Cover Plate Bolted Connection` | Beam + Connector + … |
| `Column Cover Plate Welded Connection` | Column + Connector + Weld + … |
| `Beam Cover Plate Welded Connection` | Beam + Connector + Weld + … |
| `Column Column End Plate Connection` | Column + Connector + Bolt + Weld + … |
| `Beam Beam End Plate Connection` | Beam + Connector + … |
| `Beam to Column End Plate Connection` | Column + Beam + Connector + … |
| `Base Plate` | Column + Base Plate + Stiffener + Anchor Bolt + Weld + Detailing + Design |
| `CleatAngleConnection` | Column + Beam + Cleat + Bolt + Detailing + Design |
| `Tension Member Bolted Design` | Angle/connector area + Bolt + … |
| `Tension Member Welded Design` | Connector + Weld + … |
| `Axially Loaded Column` | Column + Optimization + Design |
| `Struts Bolted to End Gusset` | Connector + Bolt + … |
| `Simply Supported Beam Design` | Column section tab + Optimization + Design |
| `On Cantilever Beam Design` | Same pattern as simply supported |
| `SeatedAngleConnection` | Extended seated-angle fields + weld/detailing |

Keys not listed use **`DEFAULT_CONFIG`**.

---

## 9. HTTP layer (module and preferences)

**File:** `frontend/src/datasources/modulesDataSource.js`

| Function | Use |
|----------|-----|
| **`fetchModuleOptions(moduleKey, { connectivity, email })`** | GET module options; drives **`getModuleData`**. |
| **`createDesign` / `createCad`** | POST design and CAD jobs with **`inputs`** body. |
| **`fetchDesignPreferences(params)`** | GET list/detail for design preferences (query params: **`supported_section`**, **`supporting_section`**, **`connectivity`** as applicable). |
| **`addCustomMaterial`** | POST custom grade; often followed by **`getModuleData`** refresh. |

Paths are built via **`getModuleSlug`** and **`endpoints`** (`frontend/src/datasources/endpoints.js`).

---

## 10. Where the Design Preferences modal is opened

**File:** `frontend/src/modules/shared/components/EngineeringModule.jsx`

- Controlled by **`designPrefModalStatus`** from **`useEngineeringModule`** / form hook.
- **`Modal`** title **“Additional Inputs”**; **`footer={null}`** — actions live inside **`DesignPrefSections`** (Save / Reset / discard confirmations).
- **`onCancel`** may open a **confirmation** modal when inputs are not locked (unsaved flow).

---

## 11. Edge cases and maintenance notes

- **Three parallel material keys** (`supporting_material`, `supported_material`, `connector_material`) are **independent** in state unless your page explicitly syncs them (e.g. via **`syncDesignPrefMaterialsFromBase`** or local **`useEffect`**). Keep behaviour consistent with product expectations when changing the main form **`material`** field.
- **Tab visibility** is entirely config-driven — adding a new module requires a new **`DESIGN_PREF_CONFIG`** entry (or reliance on **`DEFAULT_CONFIG`**).
- **`getDesignPrefTabs`** filters **`ALL_TABS`**; new tabs require an **`ALL_TABS`** row and an id in **`tabIds`**.
- **Reducer** stores material details as **arrays** (often one element); UI reads **`[0]`** for display fields.
- For **guest** or **locked** input modes, **`isInputLocked`** and **`isGuest`** props disable edits in section modals where implemented.

---

## 12. Quick reference — key source files

| Concern | File |
|---------|------|
| Context provider & `manageDesignPreferences` | `frontend/src/context/ModuleState.jsx` |
| Reducer | `frontend/src/context/ModuleReducer.jsx` |
| Design pref shell & tabs | `frontend/src/modules/shared/components/DesignPrefSections.jsx` |
| Per-module tab/pref mapping | `frontend/src/modules/shared/config/designPrefModuleConfig.js` |
| Engineering page host | `frontend/src/modules/shared/components/EngineeringModule.jsx` |
| API datasource | `frontend/src/datasources/modulesDataSource.js` |

---

*Update this document when adding modules, tabs, or new `manageDesignPreferences` actions.*
