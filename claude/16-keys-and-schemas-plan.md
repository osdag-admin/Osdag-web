# Keys & Schemas — Single-Source Plan

**Date:** 2026-10-24 | **Scope:** design-input keys and request/response schemas across `osdag_core/`, `backend/`, `frontend/` | **Status:** Proposed — nothing implemented yet

## Summary

Every design module's input contract (which keys exist, what type each value has, which are required, what label each shows) is written out by hand in four or five places, and nothing checks those copies against each other. `osdag_core/Common.py` is already the de facto source of truth for key strings. The backend and frontend copy from it by hand, and the copies have drifted.

This plan:

1. makes `Common.py` the only place a key string is written;
2. makes one Pydantic model per module the only place an input's type and required-ness are written;
3. generates everything the frontend needs from those two, and fails CI when the generated files are stale;
4. cuts the frontend module configs down so each input is declared once, on its form field, with the request payload and the modal and selection settings derived from that declaration;
5. gives every input field type its own component and one callback contract, and computes field images from the current inputs instead of storing them.

**No key's string value changes on the wire.** Saved projects, `.osi` files and desktop Osdag keep working. No edits to `osdag_core/` are needed.

This supersedes the "phase 2 stretch" per-module contract test proposed in `00-cross-cutting-summary.md` (item 2): generated types catch the same drift at build time.

## The problem, measured

All counts are from branch `single-catalog` on 2026-10-24.

### Keys

| Where | What | Count |
|---|---|---|
| `backend/apps/` | dotted key strings typed inline (`"Bolt.Diameter"`) | ~1,300 (64 in `fin_plate/adapter.py` alone) |
| `backend/apps/` | files that import from `osdag_core.Common` | 35 |
| `frontend/src/` outside `constants/` | dotted key strings typed inline | ~890 |
| `frontend/src/constants/DesignKeys.js` | constants whose header says they "match exactly" `Common.py` | 120: 22 share a name with a different value, 46 don't exist in `Common.py` |
| `osdag_core/` outside `Common.py` | dotted key strings typed inline | 12 (fine) |

Drift that is already causing workarounds:

- `KEY_END1` is `'Member.End_1'` in JS but `'End_1'` in the core. `compression_member/submodules/axially_loaded_column/adapter.py:89` and `:226` translate one into the other.
- `KEY_DESIGN_TYPE_FLEXURE` in JS holds the placeholder string `'KEY_DESIGN_TYPE_FLEXURE'`. `simplySupportedBeamConfig.js:308` hardcodes the real value `"Flexure.Type"` with a comment explaining why.
- `KEY_SUPPORT` is `'Support.Type'` in JS but `'Flexure.Support'` in the core. **Checked: not a live bug.** Its only use is the `backendKeys` map at `simplySupportedBeamConfig.js:316`, and nothing reads `backendKeys`. The real payload sends `"Flexure.Support"` directly (`simplySupportedBeamConfig.js:133`).

The dotted ↔ snake_case translation (`"Bolt.Diameter"` ↔ `bolt_diameter`) is written separately in every module's `buildSubmissionParams` and again in `backend/apps/core/utils/osi_files.py:99` (`normalize_osi_keys`, `baseline_aliases`).

### Schemas

- **Backend validation is hand-written per module.** Each of the 26 adapters has its own `validate_input()` (about 1,900 lines in total, with 289 `InvalidInputTypeError` checks) plus a separate `get_required_keys()` listing the same fields again.
- **The frontend has no types.** There are 259 `.js`/`.jsx` files and 0 `.ts` files. `buildSubmissionParams` builds each request object by hand; fin plate writes its 23 keys out twice, once per connectivity branch.
- **Validation runs too late.** It happens inside the Celery task (`service.calculate()`), not in the request. `trigger_async_design` (`backend/apps/core/utils/module_helpers.py:166`) always returns 202. A bad input only shows up when the task finishes, as one `error` string that stops at the first bad field.
- **There's no single error format.** Error responses use `{'error': …}` in 24 places, `{'message': …}` in 21 and `{'detail': …}` in 2. `frontend/src/utils/apiClient.js` tries all three plus a field-dict shape.
- **Output labels are typed twice.** The design response already carries each output's label from the core's `output_values()` (`fin_plate/adapter.py:452-464`), but the frontend `*OutputConfig.js` files retype those labels.
- **The options endpoints hardcode value lists.** `property_classes` and `thickness_list` are typed out in the module `views.py` files (e.g. `shear_connection/views.py:84-85`). Check them against `VALUES_GRD_CUSTOMIZED` and `PLATE_THICKNESS_SAIL` in `Common.py`.

### Module configs

The 59 files under `frontend/src/modules/**/config*/` total about 10,400 lines. Two families already use factories (`shared/config/coverPlateConfigFactory.js` and `SimpleConnection/shared/configFactory.js`), and their per-module configs are 8–12 lines each. The other 18 input configs are 160–790 lines each, and nearly all of them write out the same 11 top-level parts by hand.

- **The same input is described up to four times.** Each `inputSections` field already declares its `dataSource`, `selectionKey` and `modalKey`. `modalConfig` and `selectionConfig` repeat that (~115 entries in all), `INPUT_KEY_TO_LIST` in `shared/constants/moduleDataKeys.js` repeats it again, and `buildSubmissionParams` hand-writes the "All" expansion (`allSelected.x ? lists.y : inputs.x`) 27 times.
- **The field ↔ core-key mapping isn't declared anywhere.** `shared/utils/osiMapperTracer.js` (129 lines) works it out by running each module's `buildSubmissionParams` with sentinel values across four sweeps.
- **Design-preference defaults are copied, and the copies disagree.** `design_method` is set in 18 configs, `bolt_hole_type` and `bolt_slip_factor` in 12, `weld_fab` in 11. The fallbacks in `shared/config/designPrefModuleConfig.js:25-39` differ from those copies: `bolt_slip_factor` is `"0.2"` there but `"0.3"` in the configs, `weld_fab` is `"Shop weld"` vs `"Shop Weld"`, and `design_method` is the misspelt `"Limited State Design"`. The backend already computes these defaults from the core (`POST /api/design-preferences/defaults/`).
- **Shared code special-cases modules by name.** `shared/hooks/useModuleForm.js:56-69` picks each module's starting connectivity in an `if/else` chain; the hook supports a `getInitialExtraState` config option, but no config uses it. `shared/components/EngineeringModule.jsx:627-641` holds per-module CAD view fallbacks that never run, since every config sets `cadOptions`. `EngineeringModule.jsx:545`, `:832` and `:843` fall back to the seated-angle module ID, which is also unreachable because every config sets `designType`.
- **Output configs retype what the backend sends.** 901 output-config entries carry a label that the design response already includes. The "Spacing Details" and "Capacity Details" modal types are written out separately in 8 and 11 of the 26 output configs.
- **Module identity is written in several places:** each config's `sessionName`, `routePath` and `designType`; a `<Route>` per module in `App.jsx`; and the menu plus a route map in `constants/modules.js` (e.g. `:143`).

### Input field types and images

`shared/components/InputSection.jsx` (734 lines) renders every field through one `switch` over 11 field types. An unknown or misspelt `type` silently falls through to a text input (`default:` at `:649`).

- **Field callbacks have no fixed signature.** Configs use 6 different `onChange` signatures and 3 for `conditionalDisplay`. The renderer itself calls `field.onChange` in three different argument orders, and if a call throws, it retries with another order (`:474-477`, `:509-512`, `:577-581`). The `image` case calls `field.conditionalDisplay()` with no arguments at all.
- **25 of the 31 `onChange` handlers never run.** They're attached to `select` fields, and the `select` case (`:434-443`) never calls `field.onChange`. `InputSection` is the only component that renders `inputSections`, so nothing else calls them either. 15 of them are material handlers that look a material up by id.
- **Images are chosen three different ways:**
  - a hardcoded connectivity and end-plate image map inside the shared renderer (`InputSection.jsx:150-170`, fed by 15 module-specific image imports at the top of the file);
  - `type: "image"` fields with an `imageSource` function;
  - `getSectionImage`-style helpers whose result an `onChange` stores in `extraState`, and which `.osi` loading has to call again separately (`osiLoader.js:208`).
- **Likely bug (found by reading the code; not yet reproduced in the browser): the struts bolted/welded end-condition image never changes.** Its `imageSource` (`strutsBoltedConfig.js:338`, `strutsWeldedConfig.js:303`) names its first parameter `inputs`, but the renderer passes `extraState` there. `extraState` has no `end_condition_1`/`end_condition_2`, so the image always falls back to Hinged/Hinged. The `onChange` handlers that would store the right image are on `select` fields, so they never run either.

## Target state

```
osdag_core/Common.py ──(generator)──► frontend/src/constants/generated/coreKeys.js
        │
        │ constants used as field aliases
        ▼
backend/apps/modules/**/schema.py   (one Pydantic model per module)
        ├─► validate_input() and get_required_keys(), derived from the model
        ├─► validation at request time in trigger_async_design → 400 with per-field errors
        └──(generator)──► frontend/src/api/generated/*.d.ts
                                  └─► JSDoc types + // @ts-check in each module config
```

Rules once this is done:

1. A key's string is written only in `Common.py`. Everything else imports a constant.
2. A module's input fields, types and required-ness are written only in its `schema.py`.
3. Generated files are committed, and CI fails if they're stale.
4. The backend sends output labels; the frontend doesn't retype them.
5. A module config declares each input once, on its field. The payload, modal and selection settings are derived from it, and shared code never branches on a module's name.
6. Each field type is one component. Every field callback takes one context object. Images, dependent options and visibility are computed from the current inputs, never stored in state.

## Constraints and non-goals

- **Don't change any key's string value.** Keys are stored in `.osi` files and saved projects, and are shared with desktop Osdag.
- **Don't edit `osdag_core/`**, and don't reorganise `Common.py` as part of this work.
- **No TypeScript migration.** Type checking runs on the existing `.js` files via `allowJs` and per-file `// @ts-check`. New files may be written as `.ts`.
- **Don't rename the frontend's snake_case form fields.** Collapsing them into core keys is a possible later step, not part of this plan.
- **Don't change what `osdag_core` receives.** For example, bolt diameters stay lists of strings. The schemas describe today's wire format; they don't tighten it.

## Phases

Phases 1 and 2 can run in parallel. Phase 3 needs Phases 0 and 2. Phase 4 needs Phase 3 for the module it touches. Phase 5 steps 1–3 can start at any time; its other steps need Phases 1 and 4 for the module they touch. Phase 6 can start at any time, and its step 1 is a bug fix worth doing straight away. Do Phase 5.1 (payload parity tests) before Phase 1.4 if possible, since it also protects the frontend codemod. Land each phase as several PRs, one per module family. Sizes are rough estimates for one developer.

**Every PR updates the docs it affects** in the same PR: the matching `documentation/chapter_*.md` (keys and adapters in chapter 2, form engine and field types in chapter 6, `.osi` in chapter 5, setup and deploy in chapter 11), the `documentation/INDEX.md` entries, and the install guides in `documentation/general/` when setup changes. Fix text the change made wrong as well as adding new sections. Docs never mention issue numbers or phases; they describe the code as it is.

### Phase 0 — Safety net (~1–2 days)

1. Build known-good input fixtures for every module under `backend/apps/core/tests/fixtures/design_inputs/`:
   - **14 modules have desktop examples.** `osdag_core/data/ResourceFiles/design_example/*.osi` holds 66 of them (5 each for fin plate, cleat angle, seated angle, shear end plate, base plate, tension bolted and welded, and the four cover-plate connections; 5 for beam-column end plate; 2 each for beam-beam and column-column end plate). Load them with `parse_osi()`. Desktop and web payloads can differ slightly; if an example fails today's `validate_input()` as-is, capture a browser payload for that module instead.
   - **12 modules have no example:** compression parent, axially loaded column, struts bolted, struts welded, on-cantilever, plate girder, purlin, simply supported beam, and the four butt/lap joints. Capture one real request body per module from the browser's network tab and commit it as JSON.
2. Add `test_design_input_fixtures.py` asserting that every fixture passes its module's current `validate_input()`. This pins down which inputs are accepted today, before anything changes.

**Done when** all 26 adapters have at least one fixture and the test passes in CI.

### Phase 1 — Keys: one source (~6 days)

1. **Generator.** Add `scripts/gen_contract.py`. It imports `osdag_core.Common` and writes every module-level string constant prefixed `KEY_` or `DISP_` to `frontend/src/constants/generated/coreKeys.js`, sorted, with a "generated — do not edit" header. Importing `Common.py` works in the backend env (verified), so run it in the `backend-qa` job of `.github/workflows/ci.yml`, followed by `git diff --exit-code`.
2. **Clean up `DesignKeys.js`.**
   - Constants identical to `Common.py`: re-export them from the generated file, so the 23 files that import `DesignKeys.js` keep working unchanged. Leave the trailing `*` that 73 core display labels carry: it's part of the key's string, and the renderer's `stripRequiredMark()` (`shared/utils/validation.js`) removes it before adding the required marker from `field.required`.
   - The 22 drifted constants: labels the UI intentionally rewords move to `UIStrings.js` under a `UI_` name. For data keys (`KEY_SUPPORT`, `KEY_DESIGN_TYPE_FLEXURE`, `KEY_END1`, `KEY_END2`, `KEY_ALLOW_LOAD`), check what each sender and receiver actually uses, then switch to the core value. `KEY_END1`, `KEY_END2` and `KEY_ALLOW_LOAD` have no importers; delete them.
   - The 46 not in `Common.py` (e.g. `MODULE_KEY_*` module IDs) move to a file clearly named as frontend-only.
3. **Backend codemod.** Add `scripts/codemod_keys.py`. It builds a value → constant-name map from `Common.py`, rewrites inline key strings in `backend/apps/modules/**` and `osi_files.py`, and adds the imports. 117 values in `Common.py` have more than one name (mostly `KEY_OUT_X` / `KEY_OUT_DISP_X` pairs with the same string). For those, prefer the non-`DISP` name for data keys; anything still ambiguous gets a `# TODO(keys): ambiguous` comment for a manual pick. Run it one module family per PR, with Phase 0 tests passing.
4. **Frontend codemod**, same approach, over the input configs in `src/modules/**/configs/*Config.js`. Output configs are converted in Phase 4.3.
5. **Guardrails.**
   - A backend test asserting that every key in every `get_required_keys()` is a value in `Common.py`.
   - An ESLint `no-restricted-syntax` rule with selector `Literal[value=/^(Bolt|Member|Load|Weld|Detailing|Connector|Design|Plate|Module)\./]`. `npm run lint` uses `--max-warnings 0`, so a `"warn"` level would fail CI. Instead, enable the rule as `"error"` only for a `files` glob of already-converted modules, and widen the glob as modules convert.
6. Remove the `End_1` shim in `axially_loaded_column/adapter.py` once the frontend sends the core key, **unless** saved projects contain `Member.End_1`; check the database first.

**Done when** `backend/apps/modules/` has no inline dotted keys, `DesignKeys.js` has no value that differs from `Common.py`, and the ESLint rule covers all of `src/modules/`.

### Phase 2 — One error format (~1–2 days)

1. Add a DRF `EXCEPTION_HANDLER` (in `REST_FRAMEWORK` settings) that returns:
   ```json
   {"error": {"code": "invalid_input", "message": "…", "fields": {"Bolt.Diameter": "…"}}}
   ```
   `fields` is keyed by core key, so the frontend can map it to a form field.
2. Update `apiClient.js` to read this shape first. Keep the old branches until step 3 is finished.
3. Convert the remaining `{'message': …}` / `{'detail': …}` responses and the 74 `JsonResponse` calls in plain Django views (they bypass DRF's handler) as each file is touched. Then delete the fallback branches in `apiClient.js`.

**Done when** no view returns `{'message'}` or `{'detail'}` errors and `apiClient.js` has a single error branch.

### Phase 3 — Backend input schemas (~2 days pilot, then ~0.5 day per module)

1. **Shared field types.** Pin `pydantic>=2,<3` in `requirements.txt`: 2.x is already installed in the env but isn't declared. Add `backend/apps/core/schemas.py` with field types that reproduce the current helpers in `apps/core/utils/validation.py` **exactly** (`IntStr` accepts what `int_able` accepts, `FloatStr` what `float_able` accepts, `YesNo` what `is_yes_or_no` accepts, plus non-empty lists). Match today's behaviour first; tightening is a separate PR.
2. **Pilot: fin plate.** Add `shear_connection/submodules/fin_plate/schema.py`:
   ```python
   class FinPlateInput(BaseModel):
       bolt_diameter: list[IntStr] = Field(alias=KEY_D, min_length=1)
       bolt_grade: list[FloatStr] = Field(alias=KEY_GRD, min_length=1)
       load_shear: FloatStr = Field(alias=KEY_SHEAR)
       plate_thickness: list[IntStr] = Field(alias=KEY_PLATETHK, min_length=1)
       ...
   ```
   `validate_input()` becomes `FinPlateInput.model_validate(input_values)`, and `get_required_keys()` is derived from the model's required fields. Delete the hand-written checks. Phase 0 fixtures must pass. Add negative tests (wrong type, empty list, missing key) showing that the same inputs are rejected as before.
3. **Validate at request time.** Have each module registry expose the input model per slug. `trigger_async_design` validates before `run_design_calculation_task.delay()` and returns 400 in the Phase 2 format, so bad input never reaches Celery. Keep the call in `service.calculate()` as a backstop.
4. **Roll out** to the other 25 adapters in the order of the tracking table below. Modules that already share an adapter implementation (e.g. the two cover-plate-bolted connections via `moment_connection/shared.py`) share one model.
5. **Options lists.** Replace the hardcoded `property_classes` / `thickness_list` in the module `views.py` files with the `Common.py` values once they're confirmed identical. If they differ, decide which is correct with the module owner.

**Done when** no adapter contains hand-written `isinstance` checks and every design POST with bad input returns 400 synchronously, with per-field errors.

### Phase 4 — Generated frontend types (~1 day setup, then ~0.5 day per module)

1. **Extend `gen_contract.py`.** For each registered input model, write `model_json_schema(by_alias=True)` to `frontend/src/api/generated/schemas/<slug>.json`, then convert it to `.d.ts` with `json-schema-to-typescript` (a new dev dependency). Use the same CI diff check, and add a `setup-node` step to `backend-qa`.
2. **Type-check setup.** Add `typescript` as a dev dependency and a `tsconfig.json` with `allowJs: true`, `checkJs: false`, `noEmit: true`, `jsx: "react-jsx"` and `strict: false` to start. Add a `"typecheck": "tsc --noEmit"` script, and run it in the `frontend-qa` job after lint.
3. **Per module:** add `// @ts-check` to its `*Config.js` and annotate `buildSubmissionParams`:
   ```js
   /** @returns {import('../../../../api/generated/finPlate').FinPlateInput} */
   ```
   Whatever `npm run typecheck` then reports is existing drift; fix it in the same PR.
4. **Outputs:** don't write a model per module. Add one shared `OutputRow` typedef (`{key, label, val}`). In each `*OutputConfig.js`, drop labels that equal the label the backend sends; labels the UI deliberately rewords move to `UIStrings.js`. Keep only grouping and order, and switch the remaining keys to generated constants.

**Done when** every module config has `// @ts-check`, `npm run typecheck` passes in CI, and no output config retypes a label the backend sends.

### Phase 5 — Module config cleanup (~3–4 weeks)

1. **Payload parity tests (~2 days).** Add `vitest` (the build already uses Vite) and a test per module that snapshots what today's `buildSubmissionParams` returns for the config's `defaultInputs`, once per connectivity branch, with "All" both on and off. Every later step must leave these snapshots unchanged. There's no frontend test runner today, so this is the first automated check on what the frontend actually sends.
2. **Remove per-module branches from shared code (~1 day).**
   - Replace the connectivity chain in `useModuleForm.js:56-69` with an `initialConnectivity` field on each config.
   - Delete the dead CAD view fallbacks in `EngineeringModule.jsx:627-641` and the unreachable seated-angle fallbacks at `:545`, `:832` and `:843`.
   - Replace the fin plate / cleat angle checks in `useDependentData.js:17` and `:62` and in `EngineeringModule.jsx:605` with named config options.

   Done when nothing under `modules/shared/components/` or `modules/shared/hooks/` imports a `MODULE_KEY_*` constant.
3. **One set of design-preference defaults (~1–2 days).** Put the initial values in one shared object that matches what `POST /api/design-preferences/defaults/` returns, and let a module override only the values that genuinely differ. Fix or remove the disagreeing fallbacks in `designPrefModuleConfig.js:25-39`. First check whether the misspelt `"Limited State Design"` fallback has ever reached a request: base plate and purlin set no `design_method` default of their own.
4. **Declare each input once, on its field (~1 day for the helper).** Derive `modalConfig`, `selectionConfig` and `INPUT_KEY_TO_LIST` from the `inputSections` fields with a shared helper, then delete the hand-written copies.
5. **Derive the payload (~1 day for the builder, then ~0.5 day per module).** Add a `coreKey` to each field, using the generated constants from Phase 1. A shared builder then produces the request: `inputs[field.key]`, or `lists[field.dataSource]` when a customizable field is set to "All". A module keeps a small `transformPayload(payload, inputs, extraState)` hook only for genuine exceptions, such as fin plate's connectivity-name mapping and its Beam-Beam choice of beams (which today means writing all 23 keys out twice). Annotate the builder's result with the module's generated input type so the Phase 4 checks still apply. `osiMapperTracer.js` can then read the `coreKey` declarations instead of inferring them. The `backendKeys` maps (`simplySupportedBeamConfig.js:303`, `compressionMemberConfig.js:215`) are never read by anything; delete them.
6. **Output configs (~1 day).** Once Phase 4.4 has dropped the duplicated labels, add shared "Spacing Details" and "Capacity Details" modal presets. Modules reference a preset and override only what differs (`note`, `hasImage`).
7. **Module identity in one list (~1–2 days).** Build the `App.jsx` routes and the `constants/modules.js` menu and route map from one list of module configs. The route shapes differ today (`/design/:designType/shear/fin_plate/:projectId?` in `App.jsx` vs `routePath: "/design/connections/shear/fin_plate"` in the config), so settle on one shape first. The backend's report-ID maps (`apps/core/constants.py` and per-family copies such as `SHEAR_REPORT_MODULE_ID_MAP`) are a backend copy of the same list; leave them for a later pass.
8. **Factories last, and only where still needed.** Cover plates and simple connections already use factories. After steps 2–7, add a factory only where sibling configs are still mostly identical (likely struts bolted/welded and tension bolted/welded). Prefer declarations on fields over factories with long parameter lists.

**Done when** shared code has no per-module branches, no config hand-writes `modalConfig`, `selectionConfig` or a full `buildSubmissionParams`, and the payload parity tests pass.

### Phase 6 — Input field types and images (~2 weeks)

1. **Fix the struts end-condition image now (~0.5 day).** This doesn't depend on anything else. Change both `imageSource` functions to `(extraState, inputs) => …` so they read the end conditions from the inputs, and check in the browser that the image follows both selects. Also confirm whether Hinged/Hinged is meant to show `FIXED_HINGED`: there's no hinged-hinged image asset.
2. **One callback contract (~2 days).** Every field callback takes a single context object, `{ value, inputs, extraState, lists, setInputs, setExtraState }`. Rename `conditionalDisplay` to `visibleWhen(ctx)` and `imageSource` to `image(ctx)`, and give `options` the same `(ctx)` form when it's a function. Define a `FieldDef` JSDoc typedef in `shared/config/fieldTypes.js` so Phase 4's typecheck catches misuse. Convert the 31 `onChange`, 32 `conditionalDisplay` and 8 `imageSource` callbacks, then delete the call-and-retry blocks in `InputSection.jsx`.
3. **Resolve the 25 dead `select` handlers (~1 day).** For each one, check whether what it was meant to do already happens. The material handlers' id lookup looks obsolete, since the select already stores the option value directly; delete those. Where the intended behaviour is missing, that's a bug: fix it with step 4, not by making `select` call `onChange`.
4. **Derive, don't store (~1–2 days).** Compute images, dependent option lists and visibility from the current inputs at render time, and never write them into `extraState`. This is the same model osdag_core uses in `input_value_changed()`, which declares dependencies as data, e.g. `([KEY_SEC_PROFILE], KEY_IMAGE, TYPE_IMAGE, self.fn_conn_image)` at `tension_member/tension_welded.py:323`. It removes this whole class of stale-image bug, and `.osi` loading no longer needs to recompute images separately (`osiLoader.js:208`). Keep `onChange` only for genuine side effects, such as opening the custom-material modal.
5. **Images as data owned by modules (~1–2 days).** Any field can carry an `image`: either a value → asset map, or `image(ctx)` for combinations such as connectivity × end-plate type. The shared renderer draws it under the field. Move the connectivity and end-plate maps, with their 15 imports, out of `InputSection.jsx` into the configs of the modules that use them. Replace the `getSectionImage` / `getEndConditionImage*` helpers with the same mechanism.
6. **A field-type registry instead of the `switch` (~3–4 days).** Write one small component per type in `shared/components/fields/` (e.g. `SelectField.jsx`, `NumberField.jsx`, `CustomizableField.jsx`), looked up from a `FIELD_TYPES` map. `InputSection.jsx` keeps only the row layout (label, field, image). In development it throws on an unknown type instead of rendering a text input. Then fold near-duplicates into `select`: `connectivitySelect` and `endPlateSelect` are a select with an image, and `dynamicSelect`, `sectionProfileSelect` and `sectionProfileList` may become a `select` with `options(ctx)`. Check each case's extra behaviour before merging it.
7. **Render tests per field type (~2 days, alongside step 6).** Add `@testing-library/react` (running on the Vitest set up in Phase 5.1) and one test per field component: it renders, reports changes through `setInputs`, shows its image, and hides when `visibleWhen` is false.

**Done when** `InputSection.jsx` has no `switch` over field types and no module images, every field callback takes the one context object, nothing image-related is stored in `extraState`, and the struts end-condition image follows its inputs.

## Tracking

Pilot first, then one family at a time; sibling modules share helpers, so each family gets cheaper as it goes. Replace each `—` with the PR link once that step lands.

| # | Module (`backend/apps/modules/…`) | Fixture source | P1 keys | P3 schema | P4 types + outputs | P5 config |
|---|---|---|---|---|---|---|
| 1 | `shear_connection/…/fin_plate` (pilot) | desktop example | — | — | — | — |
| 2 | `shear_connection/…/cleat_angle` | desktop example | — | — | — | — |
| 3 | `shear_connection/…/header_plate` | desktop example ("End Plate Connection"; verify mapping) | — | — | — | — |
| 4 | `shear_connection/…/seated_angle` | desktop example | — | — | — | — |
| 5 | `moment_connection/…/beam_beam_cover_plate_bolted` | desktop example | — | — | — | — |
| 6 | `moment_connection/…/column_column_cover_plate_bolted` | desktop example | — | — | — | — |
| 7 | `moment_connection/…/beam_beam_cover_plate_welded` | desktop example | — | — | — | — |
| 8 | `moment_connection/…/column_column_cover_plate_welded` | desktop example | — | — | — | — |
| 9 | `moment_connection/…/beam_beam_end_plate` | desktop example | — | — | — | — |
| 10 | `moment_connection/…/beam_column_end_plate` | desktop example | — | — | — | — |
| 11 | `moment_connection/…/column_column_end_plate` | desktop example | — | — | — | — |
| 12 | `tension_member/…/bolted` | desktop example | — | — | — | — |
| 13 | `tension_member/…/welded` | desktop example | — | — | — | — |
| 14 | `base_plate` | desktop example | — | — | — | — |
| 15 | `simple_connection/…/lap_joint_bolted` | browser capture | — | — | — | — |
| 16 | `simple_connection/…/lap_joint_welded` | browser capture | — | — | — | — |
| 17 | `simple_connection/…/butt_joint_bolted` | browser capture | — | — | — | — |
| 18 | `simple_connection/…/butt_joint_welded` | browser capture | — | — | — | — |
| 19 | `compression_member` (parent adapter) | browser capture | — | — | — | — |
| 20 | `compression_member/…/axially_loaded_column` | browser capture | — | — | — | — |
| 21 | `compression_member/…/struts_bolted` | browser capture | — | — | — | — |
| 22 | `compression_member/…/struts_welded` | browser capture | — | — | — | — |
| 23 | `flexure_member/…/simply_supported_beam` | browser capture | — | — | — | — |
| 24 | `flexure_member/…/on_cantilever` | browser capture | — | — | — | — |
| 25 | `flexure_member/…/purlin` | browser capture | — | — | — | — |
| 26 | `flexure_member/…/plate_girder` | browser capture | — | — | — | — |

Cross-module steps: Phase 1.1 generator — · Phase 1.2 `DesignKeys.js` cleanup — · Phase 1.5 guardrails — · Phase 2 error format — · Phase 3.3 request-time validation — · Phase 4.1–4.2 types setup — · Phase 5.1 parity tests — · Phase 5.2 shared-code branches — · Phase 5.3 design-pref defaults — · Phase 5.4–5.5 shared helpers — · Phase 5.6 output presets — · Phase 5.7 module list — · Phase 6.1 struts image fix — · Phase 6.2 callback contract — · Phase 6.3 dead handlers — · Phase 6.4–6.5 derived images — · Phase 6.6–6.7 field registry + tests —

## Risks

- **Coercion differences.** If a Pydantic type accepts or rejects slightly different inputs than today's helpers, designs could change silently. Mitigation: Phase 0 fixtures plus per-module negative tests, and no tightening in the same PR as a conversion.
- **Drifted keys may be load-bearing.** A module may work today *because* the frontend sends a non-core key that something else translates. Trace each sender and receiver before changing it. Backend tests won't catch frontend-side breakage, so run each converted module's design in the browser.
- **Old keys in saved data.** Shims like `End_1` may be needed for old projects or `.osi` files. Query the database before removing any.
- **Ambiguous constant names.** For the 117 values with more than one name, a wrong pick is harmless at runtime (same string) but misleading to read. Review the codemod's TODO list by hand.
- **No frontend test runner yet.** `package.json` has no test script. Phase 5.1 adds Vitest payload parity tests; until then, frontend safety is typecheck, lint and a manual design run per module.
- **Config refactors can change payloads silently.** Deriving `buildSubmissionParams` from field declarations could drop a key or send a different value. Mitigation: the Phase 5.1 snapshots must stay unchanged in every Phase 5 PR, and each converted module still gets a manual design run.
- **The field-type refactor can change UI behaviour.** Merging near-duplicate types or deleting "dead" handlers could drop behaviour that one module quietly relied on. Mitigation: the Phase 6.7 render tests, checking each merged type's extra behaviour before merging, and clicking through every module's input dock once after step 6.

## Open questions

- Is `osdag_core/Common.py` kept in sync with desktop Osdag? This plan avoids editing it, but the answer decides whether missing `KEY_DISP_*` constants could later be added there instead of to `UIStrings.js`.
- Do saved projects in production contain `Member.End_1`-style keys?
- Does the desktop "End Plate Connection" example map to the web's `header_plate` submodule?
- Where the design-preference default copies disagree (e.g. bolt slip factor `"0.2"` vs `"0.3"`), which value is correct? The backend defaults endpoint is the likely answer; confirm with the module owners.
- Which route shape should the single module list use: the `App.jsx` pattern or the configs' `routePath`?
- For struts, should Hinged/Hinged end conditions show the fixed-hinged image (`RFRFstrut.png`), or is a hinged-hinged image missing?
