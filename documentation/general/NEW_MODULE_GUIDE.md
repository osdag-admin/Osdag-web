### Osdag Web: Creating a New Module (Backend + Frontend)

This guide explains how to add a new design module to Osdag Web, following the same architecture used by existing modules (e.g., Fin Plate, other shear connections, tension member bolted, flexure). It focuses on integrating with osdag_core engines, not legacy root-level design files.

Use file/line references for precise context. Keep code changes minimal.

---

## High-level architecture

- URL route (Django) → View (APIView) → Module API adapter (`osdag_api/modules/<your_module>.py`) → `osdag_core` design engine → Adapter formats outputs → JSON response.
- Frontend provides the Module key, inputs, and consumes output.

---

## 1) Define module key and resolver

- Register the module key in the module resolver:
  - Add import and dictionary entry in:
    - `osdag_api/module_finder.py` (module map) at:
```34:45:osdag_api/module_finder.py
module_dict : Dict[str, ModuleApiType] = {
    'FinPlateConnection': fin_plate_connection,
    ...
    'Simply-Supported-Beam': simply_supported_beam,
}
```
  - Expose in the public list (for clients/UI):
    - `osdag_api/__init__.py` → `developed_modules` and `module_dict` entries at:
```3:14:osdag_api/__init__.py
developed_modules = [
    "FinPlateConnection",
    ...,
    "Simply-Supported-Beam"
]
```

Add your new key in both places, e.g., `'My-New-Module'`.

Recommendation: Use a descriptive key with spaces/hyphens consistent with existing modules.

---

## 2) Create a module adapter (backend)

Create `osdag_api/modules/<my_new_module>.py` by following these patterns:

- Fin Plate adapter (connection to `osdag_core`):
```1:25:osdag_api/modules/fin_plate_connection.py
"""
Api for FinPlateConnection module
Functions:
    get_required_keys() -> List[str]
    validate_input(input_values: Dict[str, Any]) -> None
    create_module() -> FinPlateConnection
    create_from_input(input_values: Dict[str, Any]) -> FinPlateConnection
    generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]
    create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str
"""
```

- Tension bolted adapter (another example):
```21:46:osdag_api/modules/bolted_tension_member.py
def get_required_keys() -> List[str]:
    # returns list including "Member.Profile", "Member.Designation", ..., "Module"
```

- Flexure adapter (Simply Supported Beam):
```113:131:osdag_api/modules/simply_supported_beam.py
def generate_output(input_values: Dict[str, Any]):
    module = create_from_input(input_values)
    raw_output_text = module.output_values(True)
    raw_output_spacing = module.spacing(True)
    # flatten tuples into { key: {key,label,val} }
    return output, logs
```

Implement these functions in your adapter:
- `get_required_keys()` – list all required inputs (use same key names expected by the engine).
- `validate_input(...)` – optional strict checks (see Fin Plate for thorough type validation).
- `create_module()` – instantiate the `osdag_core` engine class (set logger if needed).
- `create_from_input(...)` – map/normalize request input to engine’s `set_input_values(...)` keys.
- `generate_output(...)` – call engine methods (typically `output_values(True)`, `spacing(True)`, and for connections also `capacities(...)`, `section_capacities(...)`), then format as `{ key: {key,label,val} }`.
- `create_cad_model(...)` – optional CAD output (see Fin Plate/Tension for examples).

Engine targets in existing adapters:
- Fin Plate → `osdag_core/design_type/connection/fin_plate_connection.py` import at:
```41:41:osdag_api/modules/fin_plate_connection.py
from osdag_core.design_type.connection.fin_plate_connection import FinPlateConnection
```
- Tension bolted → `design_type/tension_member/tension_bolted.py` (legacy path)
- Flexure (simply supported) → `design_type/flexural_member/flexure.py` (legacy path)

For new modules, prefer `osdag_core` classes where available.

---

## 3) Add module endpoints (Django)

The current web backend uses the refactored modules API under `backend/apps/modules/` and does **not** wire per-module `calculate-output/*` routes anymore.

- Add your module’s routes under the aggregated modules URL tree:
  - `POST /api/modules/<parent>/<submodule>/design/`
  - `POST /api/modules/<parent>/<submodule>/cad/` (optional)
  - `GET /api/modules/<parent>/<submodule>/options/` (for UI lists)

Recommendation: Follow the existing `backend/apps/modules/*/views.py` + `service.py` + `adapter.py` pattern for new modules.

---

## 4) Input-data API (populate dropdowns, lists)

If your module needs UI-populating data (section lists, materials), implement it in the module `options` endpoint under `backend/apps/modules/.../`.

Example (Simply Supported Beam):
```6:71:osdag/web_api/inputdata/simply_supported_beam_input.py
class SimplySupportedBeamInputData(InputDataBase):
    def process(self, **kwargs):
        response['beamList'] = list(Beams.objects.values_list('Designation', flat=True))
        response['columnList'] = list(Columns.objects.values_list('Designation', flat=True))
        response['materialList'] = Material + CustomMaterials (+ 'Custom')
        ...
        return Response(response, status=200)
```

Expose via existing endpoints if applicable (see `osdag/web_api/inputData_view.py`).

---

## 5) Frontend: add module and screens

Frontend lives under `frontend/src`. Add your module folder and routes similar to existing modules.

- Add module metadata (key, name, image, path) to the list used by the UI. Backend serves a module list via `osdag_api/__init__.py` `module_dict` array:
```16:77:osdag_api/__init__.py
module_dict = [{"key": "FinPlateConnection", ...}, ..., {"key": "Simply-Supported-Beam", ...}]
```
Consume that list on the client to show the module card and navigate to your screen.

- Create a new folder for your module UI (inputs form, output view) similar to existing ones, e.g.:
`frontend/src/modules/connection/finPlate` or `.../flexuralMember/simplySupportedBeam`

- The form should POST JSON to your backend endpoint and include the `Module` key (e.g., `'My-New-Module'`).

### 5.1 Link your module to the Module Select page

- The module selection page reads static UI config from `frontend/src/constants/modules.js`.
  - Add your module to the right section (Connections/Tension/Flexure) in:
```1:11:frontend/src/constants/modules.js
export const MODULE_SUBMODULES = { ... }
```
  - Add a card under the relevant content block with your `key` in:
```13:54:frontend/src/constants/modules.js
export const CONNECTIONS_TAB_CONTENT = { ... }
```
or for flexure/tension:
```56:82:frontend/src/constants/modules.js
export const GENERIC_SUBMODULE_CONTENT = { ... }
```
  - Map your `key` to a route under:
```84:95:frontend/src/constants/modules.js
export const MODULE_ROUTES = { ... }
```

- The selection page component uses these to navigate when a card is clicked:
```15:55:frontend/src/homepage/components/ModulesCardLayout.jsx
const submodules = MODULE_SUBMODULES[moduleName] || []
... handleModuleClick → navigate(MODULE_ROUTES[optionKey])
```

Ensure the route you add matches your React page location.

### 5.2 Create the React page for your module

- Follow an existing page such as Fin Plate or Simply Supported Beam to scaffold your module:
  - Engineering page scaffold using shared shell:
```32:41:frontend/src/modules/shared/components/EngineeringModule.jsx
export const EngineeringModule = ({ moduleConfig, OutputDockComponent, menuItems, title }) => { ... }
```
  - Create `YourModule.jsx` under an appropriate folder and render `EngineeringModule` with a `moduleConfig` describing:
    - `sessionName`, `designType` (must match backend `Module` key), `cameraKey`, `inputSections`, `modalConfig`, `cadOptions`.

### 5.3 Use BaseOutputDock for outputs

- Use the shared output renderer to avoid duplicating UI:
```14:269:frontend/src/modules/shared/components/BaseOutputDock.jsx
export const BaseOutputDock = ({ output, outputConfig, title, extraState }) => { ... }
```
- Create `components/YourModuleOutputDock.jsx` that imports and configures `BaseOutputDock` with an `outputConfig` describing:
  - `sections`: named groups and fields (keys must match backend output keys)
  - `modals`, `modalTypes`, `modalData`: optional modal-driven layouts
  - Keep to the flat output `{ key: {key,label,val} }` used in adapters

Example references for output docks:
```1:...:frontend/src/modules/shearConnection/finPlate/components/FinPlateOutputDock.jsx
```
```1:...:frontend/src/modules/flexuralMember/simplySupportedBeam/components/SimplySupportedBeamOutputDock.jsx
```

### 5.4 Wire the route to your page

- Ensure your route path from `MODULE_ROUTES` matches the page mounted in your app router.
- The module selection page drives navigation via:
```29:45:frontend/src/homepage/components/ModulesCardLayout.jsx
const getRoute = (...) => MODULE_ROUTES[optionKey] || ""
```
- The page frame that shows Module Select is at:
```1:58:frontend/src/homepage/pages/SelectModulePage.jsx
```

### 5.5 Submitting to backend and rendering output

- `EngineeringModule` uses `useEngineeringModule` to handle inputs, submit to backend, and manage state. Provide the correct `designType` (Module key) so requests include the right `Module` and route to your adapter:
```32:106:frontend/src/modules/shared/components/EngineeringModule.jsx
const { inputs, output, logs, handleSubmit, ... } = useEngineeringModule(moduleConfig)
```
- After a successful submit, `EngineeringModule` toggles the Output dock and renders your `OutputDockComponent` with the `output` object.

---

## 6) Expected request/response contract

- Request (POST JSON): must include at least `{ "Module": "<Your-Module-Key>", ... }` plus the fields your adapter’s `get_required_keys()` returns.
- Response: `{ "data": { "<key>": {"key","label","val"}, ... }, "logs": [...], "success": true }`

See examples of processing raw outputs to flattened JSON in:
```350:425:osdag_api/modules/fin_plate_connection.py
# generate_output merges output_values, spacing, capacities, section_capacities into a flat dict
```
```113:131:osdag_api/modules/simply_supported_beam.py
# generate_output combines spacing + output_values and keeps TextBox entries
```

---

## 7) CAD

All modules are expected to support CAD.

End-to-end flow:
- Client POSTs to CAD endpoint with `module_id` and `input_values`.
- Backend resolves adapter and calls `create_cad_model(input_values, section, session)` for each supported section.
- API base64-encodes generated files and returns per section.
- Frontend shows per-part views using the same section names.

### 7.1 Backend wiring

1) Implement `create_cad_model(...)` in your adapter
- Use `cad.common_logic.CommonDesignLogic` and module setup helpers.
- Examples:
```428:561:osdag_api/modules/fin_plate_connection.py
# create_cad_model: sets up CommonDesignLogic, calls setup_for_cad, writes per-part and merged BREP; STEP/IGES for "Model"
```
```310:369:osdag_api/modules/bolted_tension_member.py
# create_cad_model: writes BREP and, for Model, STEP/IGES
```

2) Whitelist supported sections in CAD API
- Map your `module_id` to a `session_type`, and declare the `sections` list to generate:
```54:99:osdag/web_api/cad_model_api.py
module_type_mapping = { 'FinPlateConnection': 'FinPlateConnection', ... }
...
if session_type == "FinPlateConnection":
    sections = ["Model", "Beam", "Column", "Plate"]
elif session_type == "CleatAngle":
    sections = ["Model", "Beam", "Column", "cleatAngle"]
... (per module)
```
- The API loops and calls your adapter:
```110:121:osdag/web_api/cad_model_api.py
for section in sections:
    path = module_api.create_cad_model(input_values, section, session_id)
    ... read file and return base64 ...
```

3) Expose the CAD endpoint

The current backend exposes CAD endpoints under the `backend/` project (see `backend/apps/core/urls.py` for the core CAD handlers and `backend/apps/modules/...` for per-module CAD endpoints).

4) Formats
- Adapters currently write `.brep` (and for Model: `.step`/`.iges`). The CAD API returns base64 data per section under `files[section]`.

### 7.2 Frontend linkage

1) View options and camera presets
- Ensure `EngineeringModule` view options match your backend `sections` so users can switch between parts:
```287:307:frontend/src/modules/shared/components/EngineeringModule.jsx
if (moduleConfig.cameraKey === "FinPlateConnection") return ["Model", "Beam", "Column", "Plate"]
... (other modules)
```

2) Requesting and showing CAD
- `EngineeringModule`/hooks handle design submission and populate `cadModelPaths`. After success, Output Dock is shown and view options are enabled.

3) Name alignment checklist
- Keep section names identical across:
  - Adapter `create_cad_model(..., section, ...)` (e.g., "Beam", "Column", "Plate").
  - CAD API `sections = [...]` for your module.
  - Frontend view options for your `cameraKey`.

4) Examples
- Fin Plate: Model, Beam, Column, Plate
  - Back: `osdag/web_api/cad_model_api.py` lines 80-86
  - Adapter: `osdag_api/modules/fin_plate_connection.py` lines 428-561
  - Front: `EngineeringModule.jsx` lines 287-307 (FinPlateConnection)

- Cleat Angle: Model, Beam, Column, CleatAngle
  - Back: `osdag/web_api/cad_model_api.py` lines 82-83
  - Adapter: `osdag_api/modules/cleat_angle_connection.py` (create_cad_model)
  - Front: `EngineeringModule.jsx` lines 295-297 (CleatAngle)

- Seated Angle: Model, Beam, Column, SeatedAngle
  - Back: `osdag/web_api/cad_model_api.py` lines 86-87
  - Adapter: `osdag_api/modules/seated_angle_connection.py` (create_cad_model)
  - Front: `EngineeringModule.jsx` lines 302-304 (SeatedAngle)

- Tension Bolted: Model, Member, Plate, Endplate
  - Back: `osdag/web_api/cad_model_api.py` lines 96-97
  - Adapter: `osdag_api/modules/bolted_tension_member.py` lines 310-369
  - Front: configure `cameraKey` view options accordingly

---

## 8) Minimal check-list

- Backend adapter: Add `osdag_api/modules/<my_module>.py` targeting an `osdag_core` class; implement `get_required_keys`, `create_from_input`, `generate_output`, and `create_cad_model`.
- Resolver: Register key in `osdag_api/module_finder.py` (`module_dict`) and `osdag_api/__init__.py` (`developed_modules`, `module_dict` array for UI).
- Output API: Add your module `design` endpoint under `backend/apps/modules/.../views.py` (served under `/api/modules/.../design/`).
- Input-data API: Add/update the module `options` endpoint under `backend/apps/modules/...` (served under `/api/modules/.../options/`).
- CAD API mapping: In `osdag/web_api/cad_model_api.py`, map your `module_id` to `session_type` and declare `sections` to generate; ensure names match your adapter and frontend view options.
- Frontend routes/cards: Update `frontend/src/constants/modules.js` (`MODULE_SUBMODULES`, `..._CONTENT`, `MODULE_ROUTES`) so the module appears on Module Select and navigates to your page.
- Frontend page: Create `frontend/src/modules/.../<MyModule>.jsx` using `EngineeringModule`; set `moduleConfig.designType` to your backend key and `cameraKey` to enable correct view options.
- Output UI: Create a thin `.../components/<MyModule>OutputDock.jsx` that uses `BaseOutputDock` with your `outputConfig`.
- Output shape: Return `{ key: {key,label,val} }` from the adapter for consistency with shared UI components.

---

## 9) Examples to mirror

- Shear connections: Fin Plate service/adapter + outputs
  - View/service: `backend/apps/modules/shear_connection/...`
  - Core engine: `osdag_core/design_type/connection/...`

- Tension (bolted):
  - Adapter: `osdag_api/modules/bolted_tension_member.py` (see `get_required_keys`, `create_from_input`, `generate_output`)

- Flexure (simply supported):
  - Adapter: `osdag_api/modules/simply_supported_beam.py` (mapping inputs to `Flexure` keys; combine outputs)
  - Dedicated view: `osdag/web_api/simplysupportedbeam_outputView.py`

---

## 10) Troubleshooting tips

- If `get_module_api` fails, confirm your key is present in:
```47:50:osdag_api/module_finder.py
get_module_api(module_id)
```
and in the `module_dict` map at:
```34:45:osdag_api/module_finder.py
module_dict = { ... }
```
- Ensure frontend sends the exact `Module` key you registered.
- If outputs are empty, print raw tuples from engine and verify you pick `param[2] == "TextBox"` and `param[3]` as value.
- For new engines, confirm `set_input_values` matches your adapter’s mapped keys.
