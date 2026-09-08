# Cross-Cutting Summary — Claude Review

**Date:** 2026-08-01 | **Scope:** Synthesis across all 13 segment reports (`claude/01-*.md` through `claude/13-*.md`) | **Status:** Final pass, read-only

This is a final synthesis pass, not a new code review. It re-reads all 13 completed segment reports side-by-side to find issues that recur across multiple modules — the kind of thing that's easy to miss when reviewing one module at a time, but that adds up to real maintenance cost when the same bug class or the same duplicated logic shows up 8-9 times independently. For each pattern below: what it is, where it shows up, and what a single shared fix would look like (as opposed to patching each module separately).

## 1. Dead `*OutputDock.jsx` components — repo-wide, 9/9 module segments, ~20+ files — ✅ FIXED (2026-08-01)

**Where:** Independently confirmed dead (never imported anywhere) in every single application-module segment reviewed:

- Segment 5 (Tension Members): `BoltedToEndOutputDock.jsx`, `WeldedToEndOutputDock.jsx`
- Segment 6 (Compression Members): `CompressionMemberOutputDock.jsx`
- Segment 7 (Base Plate): `BasePlateOutputDock.jsx` (also has a broken import path pointing at a nonexistent directory)
- Segment 8 (Simple Connection): `ButtJointBoltedOutputDock.jsx`, `ButtJointWeldedOutputDock.jsx`, `LapJointBoltedOutputDock.jsx`, `LapJointWeldedOutputDock.jsx`
- Segment 9 (Shear Connection): `finPlate`/`cleatAngle`/`seatAngle`/`endPlate` `*OutputDock.jsx` (4 files)
- Segment 10 (Flexural Member): `SimplySupportedBeamOutputDock.jsx` (only 1 of 4 submodules even has one)
- Segment 11 (Moment Connection End Plate): `BeamBeamEndPlateOutputDock.jsx`, `BeamToColumnEndPlateOutputDock.jsx`, `ColumnColumnEndPlateOutputDock.jsx`
- Segment 12 (Moment Connection Cover Plate): all 4 submodules' `*OutputDock.jsx`

**Why it happened:** every module now renders output through `EngineeringModule.jsx` → `BaseOutputDock` (in `modules/shared/components/outputDock/`), driven by a plain `*OutputConfig.js` data object per module. These per-module `*OutputDock.jsx` components are leftovers from an earlier, pre-`EngineeringModule` architecture where each module owned its own output-rendering component.

**Fix (single pass, not per-module):**
```bash
find frontend/src/modules -name '*OutputDock.jsx' -not -path '*/shared/*'
```
then confirm zero import sites for each with a repo-wide grep (already done per-file across all 9 segments — no live import was found anywhere), then delete all of them in one PR. This is the single highest-confidence, lowest-risk cleanup item in the whole review — every segment that checked it found the same result, and none found a counter-example.

**Status: done.** All 20 files matched by the `find` command above (confirmed exactly 20, matching every segment's per-module count) were re-verified with a repo-wide `grep -rln "import.*<ComponentName>"` (zero hits for every one) and a final `grep -rn "OutputDock" src | grep -v /shared/` (zero remaining references anywhere) before deletion, then removed. `vite build` wasn't run to double-check (`node_modules` isn't installed in this environment), so run a build/lint pass before merging as a final sanity check.

## 2. "Marked `required: true` in frontend config, never actually checked by `validateInputs()`" — ✅ FIXED (2026-08-01)

**Where:**
- Segment 7 (Base Plate): `load_shear_major`, `load_shear_minor`, `load_moment_major`, `load_moment_minor` — marked required, never checked; empty string reaches `osdag_core` and produces an opaque error. (Confirmed directly: `basePlateConfig.js` has ~15 fields whose *label* carries a hand-typed `*`, but only 4 of them actually set `required: true` — the asterisk and the `required` flag are two more independently hand-maintained signals that already disagree with each other inside a single file.)
- Segment 10 (Flexural Member): On-Cantilever checks only 5 of 11 declared required keys; Simply Supported Beam checks presence only (empty strings pass); **Purlin's backend `validate_input()` is a complete no-op (`pass`)** despite declaring 13 required keys.
- Segment 11 (Moment Connection End Plate): "Bending Moment" (`load_moment`) is `required: true` in all 3 end-plate variants' form schemas and is a hard-required backend key, but none of the 3 `validateInputs()` functions check it.
- Segment 6 (Compression Members): `strutsBoltedConfig.js`'s `validateInputs` checks fewer fields than the backend requires (bolt diameter/grade/plate thickness not checked).
- Segment 5 (Tension Members): same gap for bolt-diameter/grade/plate-thickness fields in both bolted and welded configs.
- Backend counterpart, confirmed in `backend/apps/core/utils/validation.py`: `contains_keys(data, keys)` only checks that a key is *present* in the dict — `{"Load.Axial": ""}` passes. So even the modules whose `validate_input()` isn't a no-op (e.g. `base_plate/adapter.py`, which is otherwise one of the more careful ones) let an empty string through `contains_keys` and only catch it later, if at all, in the per-key type checks.

**Pattern:** this is a **frontend/backend contract that's hand-duplicated per module** — each module's `inputSections` config declares `required: true` per field (for the UI asterisk), and separately, each module's `validateInputs()` function hand-writes which fields to check before submit. These two lists are supposed to match but are maintained independently, so they drift. The backend side has the same problem in miniature (`validate_input()` is hand-written per submodule with wildly different rigor — Purlin's is a no-op, Plate Girder's is thorough), and even its shared `contains_keys()` helper treats `""` as present.

**Design decision (revised):** invert the default. Today a field is optional unless someone remembers to write `required: true`, which is exactly backwards — it means silence (forgetting the flag) produces the unsafe outcome (unchecked field), and the base_plate example shows people already believe fields default to required (hence the hand-typed `*` in the label) even though the code doesn't enforce it. New rule: **every field in `inputSections` is required by default; a field must explicitly set `required: false` to opt out.** This matches the actual intent visible in every config (nearly every field's label already carries a `*`) and turns "someone forgot to mark it" from a silent gap into a no-op (still required, correctly).

**Fix (framework-level, not per-module):**

*Frontend* — add one shared helper, e.g. `getMissingRequiredFields(inputSections, inputs, extraState)` in `modules/shared/utils/validation.js`:
- Walks every field across every section.
- Skips a field entirely (no emptiness check at all — `null`/`undefined`/`""` are all valid) if `conditionalDisplay(extraState, inputs)` exists and returns `false` (it isn't currently shown), or if the field explicitly sets `required: false`. Optional fields aren't just "less strict," they're not validated for presence at all — downstream custom checks in a module's `validateInputs()` (e.g. a `parseFloat` on a load value) must also guard for empty/null on any field that is `required: false`, since today several of those checks assume a value is always present.
- Otherwise (the default, i.e. `required` is absent or `true`) treats it as required: value must not be `""`, `null`, `undefined`, or an empty array.
- Returns the missing fields' `key`/`label` so callers can build a message.

Every module's `validateInputs()` calls this once at the top:
```js
const missing = getMissingRequiredFields(basePlateConfig.inputSections, inputs, extraState);
if (missing.length) return { isValid: false, message: `Please fill: ${missing.map(f => f.label).join(', ')}` };
```
and keeps only genuinely custom cross-field rules (e.g. the anchor "Customized" list checks in `base_plate`) below that. This makes it structurally impossible to add a field to a form without it being checked.

*Frontend rendering* — the `*` becomes a derived, not authored, signal:
- In `InputSection.jsx` (~line 599, where `{field.label}` is rendered), append `*` automatically whenever `field.required !== false` instead of relying on the label text containing one.
- Repo-wide cleanup pass: strip every hand-typed `*` out of every module's `inputSections` label strings (same shape as the `*OutputDock.jsx` cleanup in #1 — grep for `label: "..*\*.*"` inside `configs/*.js` across all modules, edit in one pass, verify visually that asterisks still show up because the renderer now derives them).
- Delete the `.replace('*', '')` workaround at `InputSection.jsx:630` (used today to strip the hand-typed asterisk before reusing a label in the optimization-bounds modal title) — once labels never contain a literal `*`, that call becomes dead defensive code.

*Backend* — two changes, in order of leverage:
1. Fix `contains_keys()` in `backend/apps/core/utils/validation.py` (or add `contains_non_empty_keys()` alongside it and switch callers over) to also reject `""`, `None`, and `[]`, not just an absent key. This is a single-file fix that immediately tightens every submodule that already calls `contains_keys()` correctly (e.g. `base_plate`), and turns Purlin's `validate_input()` from "does nothing" into "at least catches missing/empty required keys" if it's changed to call the shared helper instead of `pass`. This check only ever runs against `get_required_keys()`, so it's a pure tightening of required fields — optional keys are untouched.
2. For every key *not* in `get_required_keys()` (i.e. optional), type checks must explicitly allow `None`/`""` and skip the type check rather than raise — `base_plate/adapter.py`'s existing `load_keys` loop (`if val is not None and val != "": ... isinstance/float_able check`) is already the correct pattern for this and should become the standard every submodule's optional-field type checks follow, instead of each one hand-rolling (or omitting) the same null guard.
3. Standardize every submodule's `validate_input()` to the shape `base_plate/adapter.py` already uses for the required-key part — `required_keys = get_required_keys(); missing = contains_non_empty_keys(input_values, required_keys); if missing: raise MissingKeyError(...)` — as the first line, before any hand-written type checks. Purlin, On-Cantilever, and Simply Supported Beam's `validate_input()` functions should be rewritten to this shape rather than left as partial/no-op checks.

*Stretch, phase 2 (worth a follow-up, not blocking):* the frontend `inputSections` keys (e.g. `load_shear_major`) and the backend `get_required_keys()` keys (e.g. `"Load.Shear.Major"`) are two independently hand-maintained lists connected only by convention — nothing stops them drifting the same way `required: true` already did. A cheap contract test per module (assert the frontend's required-field set, translated through the existing key-mapping, is a subset of the backend's `get_required_keys()`, and vice versa) would catch future drift without requiring a full shared-schema rewrite.

This single change (default-required + the two shared helpers) would have prevented every instance of this bug class found across Segments 6, 7, 10, and 11.

**Status: done.** Implemented essentially as designed above, with one extension found during implementation:

- `frontend/src/modules/shared/utils/validation.js` added, exporting `getMissingRequiredFields`/`validateRequiredFields`. Beyond the simple-value-type check described above, it also handles `type: "customizable"` fields (bolt diameter/grade, plate thickness, anchor sizes, etc.) — these need a non-empty array only when the sibling `selectionStates[field.selectionKey] === "Customized"` (otherwise the full list from `dataSource` is used instead). This is exactly the Segment 5/6 gap ("bolt diameter/grade/plate thickness not checked") and wasn't covered by the first pass of the helper — worth remembering that "customizable" fields are a second required-field shape, not just a variant of the simple one.
- `InputSection.jsx` now renders `*` from `field.required !== false` (line ~599) instead of reading it out of the label text.
- All 26 non-output `inputSections` configs had hand-typed `*` stripped from labels (script-driven, then `node --check`-verified for syntax).
- All 26 modules' `validateInputs()` now call `validateRequiredFields(...)` as the first line, wired with the real `extraState`/`selectionStates` values from the call site's positional arguments (several files only declared 1-2 params before — e.g. `cleatAngleConfig.js` already had a param *named* `selectionStates` that was actually bound to the `lists` argument due to a pre-existing param-order mismatch; left that mismatch alone since fixing it is a separate, riskier bug and out of scope here, and appended a new correctly-bound param instead).
- Backend: `contains_keys()` in `backend/apps/core/utils/validation.py` now rejects `""`/`None`/`[]`, not just an absent key — fixed centrally rather than adding a parallel `contains_non_empty_keys()`, since all ~29 call sites already use the identical `missing = contains_keys(...); if missing: raise MissingKeyError(...)` shape and none of them wanted the old lenient behavior.
- Backend: Purlin's `validate_input()` (previously `pass`) now runs the standard required-key check; On-Cantilever's hardcoded 5-of-11 `required_keys` list now calls `get_required_keys()` like every other module. Simply Supported Beam's `validate_input()` already called `contains_keys()` correctly, so it was automatically fixed by the central change with no per-file edit needed.
- Not done: a full sweep of every adapter's optional-field type-check loops to add the `if val is not None and val != "": ...` guard pattern from `base_plate/adapter.py` everywhere. Only the 3 named call-outs above were touched; the rest of the ~29 adapters still hand-roll (or omit) that guard per-file. Left as a lower-urgency follow-up since it's about type-checking rigor, not the required/missing-field bug this pass targeted.
- Not done: no fields were marked `required: false` anywhere. I audited all 26 configs for a field with a clear, unambiguous "this is genuinely optional" signal and found none — every field in these forms reads as a real design input. Given that, and the explicit instruction that fields should default to required, I left it to whoever owns each module to mark specific fields `required: false` if they know of one (e.g. `load_axial_tension` in `basePlateConfig.js`, only shown for Moment Base Plate, is now required-when-shown by default — that's a judgment call worth a second look from someone with domain knowledge).
- Not run: a full `vite build`/`npm run lint` (no `node_modules` in this environment) — only `node --check` (syntax) was run on every changed `.js` file. Please run a build/lint/manual-click-through pass before merging.

## 3. Hardcoded insecure secret defaults, duplicated across independent files — ✅ FIXED (2026-08-02)

**Where:** the same literal secret values recur in multiple files rather than having one source of truth:
- `INFLUXDB_TOKEN` fallback `"osdag-super-secret-token"` appears in **4 separate places**: `backend/config/settings.py:284` (Segment 1), `backend/apps/core/consumers.py:47` (Segment 10), `docker-compose.yml:56` and `:104` (Segment 13), and `monitoring/metrics_collector.py:47` (Segment 13).
- `SECRET_KEY` has a hardcoded insecure fallback in `backend/config/secret_key.py` (Segment 1) — and the real value is separately committed to git via `.env` (Segment 13, critical finding).
- DB password fallback `"password"`/`"changeme"` duplicated between `backend/config/postgres_credentials.py`, `settings.py:156` (Segment 1), and both compose files' `${DATABASE_PASSWORD:-...}` defaults (Segment 13).
- SMTP credentials hardcoded in `backend/config/utils.py` (Segment 1, dead code but still a committed credential).

**Fix:** one settings-loading function per secret (already partially true for some — `get_secret_key()`, `get_password()` — but these still return insecure literals instead of raising). Change every one of these to raise/fail fast at startup if the env var is absent, and delete the literal-string fallback entirely rather than defaulting to a "looks like a secret but isn't" placeholder. This is a ~30-minute fix across 5-6 files that closes the same hole 4 different reports each partially found.

**Status: done.**
- `backend/config/secret_key.py` (`get_secret_key()`) and `backend/config/postgres_credentials.py` (`get_password()`) now raise `ImproperlyConfigured` when the env var is absent instead of returning a hardcoded literal. `settings.py` had a latent bug fixed alongside this: `os.getenv('SECRET_KEY', get_secret_key())` called `get_secret_key()` unconditionally (Python evaluates default args eagerly) even when the env var *was* set — changed to `os.getenv('SECRET_KEY') or get_secret_key()` (short-circuits) so the raise only fires when truly unset. Same fix applied to the DB password path; the triple-redundant `os.getenv('DATABASE_PASSWORD', PASSWORD or 'password')` fallback chain in `DATABASES` was deleted entirely.
- `backend/config/utils.py`'s hardcoded real Outlook SMTP credential replaced with `os.environ.get(...)`, no default (confirmed dead code — `mailing.send_mail` has zero callers — but the credential is gone either way).
- `INFLUXDB_TOKEN` centralized to `settings.py` as the single source of truth (`os.getenv('INFLUXDB_TOKEN')`, no fallback literal). `consumers.py`, `metrics_middleware.py`, and `signals.py` now read `settings.INFLUXDB_TOKEN` instead of each re-declaring their own `os.getenv(..., "osdag-super-secret-token")` copy, and no-op (skip the InfluxDB write) if it's unset — consistent with the "no-op if InfluxDB unavailable" behavior these files already had for connection failures, rather than crashing Django startup for what's an optional observability feature. `monitoring/metrics_collector.py` and `monitoring/influxdb-init.sh` are different in kind — standalone processes whose only job is writing metrics — so those two now hard-fail (`os.environ["INFLUXDB_TOKEN"]` / `: "${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN:?...}"`) if the token is missing.
- `docker-compose.yml` and `docker-compose.prod.yml`: `SECRET_KEY`, `DATABASE_PASSWORD` (incl. the `db` service's `POSTGRES_PASSWORD`, which had a different literal default than the app services' and was easy to miss), and `INFLUXDB_TOKEN` now use `${VAR:?must be set}` instead of insecure defaults — `docker-compose up` fails fast with a clear message instead of silently running with `dev-secret-key`/`password`/`changeme`/the shared InfluxDB token. All three backend/celery_worker/influxdb references to the InfluxDB token now point at one `${INFLUXDB_TOKEN}` env var instead of three separate hardcoded copies. Added `INFLUXDB_TOKEN` to the local `.env` so `docker-compose up` keeps working out of the box (it previously had no InfluxDB token at all — the literal was baked directly into the compose file).
- **Not done, flagged separately:** root `.env` is still tracked in git with real dev values (`SECRET_KEY=dev-secret-key`, `DATABASE_PASSWORD=password`) — this is Segment 13's separate critical finding (`git rm --cached` + history purge + credential rotation) and wasn't touched here since it needs explicit sign-off before rewriting tracked/history state.

## 4. `print()` instead of the `logging` module

**Where:** near-universal across the backend — every module segment reviewed found this pattern independently:
- Segment 1: `apps/core/api/*` (project_api.py, osi_api.py, jwt_api.py)
- Segment 5: `tension_member` bolted/welded `service.py` (banner + traceback prints on every calculation)
- Segment 6: all three `compression_member` services (near-identical copy-pasted print banners)
- Segment 7: `base_plate/service.py` (~15 print statements) and `adapter.py`
- Segment 8: all 4 `simple_connection` CAD adapters
- Segment 9: `shared.py` (shared by all shear-connection submodules), `cantilever/service.py`
- Segment 10: `on_cantilever`, `purlin`, `simply_supported_beam` adapters (Plate Girder's Celery task is the one exception — it correctly uses `logger`)
- Segment 11: `cantilever_connection` (dozens of emoji-decorated prints), `moment_connection/shared.py`
- Segment 12: all 4 cover-plate adapters, `shared.py`

**Fix:** since the exact same "banner + step markers + `traceback.print_exc()`" shape repeats in nearly every `Service.calculate()` across the codebase (Segment 6 explicitly suggests this), a shared decorator or context manager in `apps/core/utils` — e.g. `@log_calculation_call(logger)` wrapping `calculate()` — would replace ~10-15 hand-written print statements per service with one line, applied once per module (13+ call sites) instead of asking each module owner to remember to use `logging` correctly. `plate_girder/tasks.py` (Segment 10) is already a working reference implementation of what "done right" looks like here.

## 5. Duplicated CAD-generation / adapter boilerplate between structurally similar submodules — 🔶 PARTIALLY FIXED (2026-08-02)

**Where:**
- Segment 5: ~150 lines duplicated between `tension_member`'s bolted and welded adapters (`create_cad_model`, manifest writing, STL/STEP/IGES export).
- Segment 10: ~250 lines duplicated across 3 of `flexure_member`'s 4 adapters (`generate_output`, `create_cad_model` BRep/STL scaffolding).
- Segment 12: near-byte-identical `validate_input`/`get_required_keys`/`generate_output` between `beam_beam_cover_plate_bolted` and `column_column_cover_plate_bolted` adapters, differing only in the imported `osdag_core` class name.
- Segment 6 and 8 note the same shape at smaller scale.

**Fix:** every affected module already has a `shared.py` in its package (confirmed present in `tension_member`, `shear_connection`, `moment_connection`) — but it's under-used; the duplication is happening in each submodule's `adapter.py` instead of being lifted into the module's own `shared.py`, or further up into `apps/core/utils/cad_helpers.py` / `module_helpers.py` (which already exist and are already imported by multiple modules). A shared `generate_cad_model(get_part_shape_fn, ...)` helper taking the one truly module-specific piece (how to build the 3D shape) as a callback — exactly what Segment 5's report proposes — would collapse most of this duplication into a single, tested implementation instead of N copies that can silently drift (per Segment 5: "a bug fix applied to one file but not the other").

**Status: partially done.** The Segment 5 and Segment 12 cases named above are fixed; Segment 10 is fixed for 3 of 4 adapters (as scoped in the finding); the "smaller scale" Segment 6/8 instances are untouched.
- `tension_member` (Segment 5): `shared.py` gained a `create_cad_model(module, key_disp, get_connector_shape, section, session, export_formats)` helper — the full BRep-compound/manifest/STL/STEP/IGES pipeline, previously duplicated ~180 lines each in `bolted/adapter.py` and `welded/adapter.py`, now lives once. Each adapter's `create_cad_model` shrank to building its module then delegating, plus a `_get_connector_shape(t_obj)` callback for the one part that's genuinely different (fused nut-bolt array vs. weld model).
- `flexure_member` (Segment 10): new `shared.py` (this module didn't have one before) with the same callback-based `create_cad_model`, used by `on_cantilever`, `simply_supported_beam`, and `purlin` — matching the finding's "3 of 4" scope. `plate_girder` was deliberately left alone: it's a genuinely different, multi-part CAD pipeline, not just a 4th sibling with a different shape-getter, so forcing it into the same shape would have been a worse fit, not a cleanup.
- `moment_connection` (Segment 12): before writing any code, diffed `beam_beam_cover_plate_bolted` and `column_column_cover_plate_bolted` byte-for-byte, which showed the finding's "near-byte-identical" claim held for `get_required_keys`/`validate_input`/`create_module`/`create_from_input`/`generate_output` (now lifted into `moment_connection/shared.py`, parameterized by module class) but **not** for `create_cad_model` as a whole — its middle section (section-name vocabulary, internal component-name mapping, `part_names`) genuinely differs between the beam and column variants. Only `create_cad_model`'s tail (BREP/STL/manifest/STEP-IGES write, confirmed byte-identical by diff) was extracted into `write_cover_plate_cad_output()`; the differing middle section was deliberately left per-adapter rather than force-fit into a shared abstraction.
- **Not done:** the welded cover-plate pair (`beam_beam_cover_plate_welded` / `column_column_cover_plate_welded`) — checked, and it has a different shape-building approach (`get_shape_for_part` + `normalize_and_fuse` helpers, different `part_names`) than the bolted pair, so it needs its own pass rather than reusing the same extraction. Also not done: the smaller-scale Segment 6/8 repeats mentioned in the finding.

## 6. Duplicated frontend module configs across parameterizable variants (bolted/welded × beam/column) — 🔶 PARTIALLY FIXED (2026-08-02)

**Where:** Segment 12 is the clearest example — `coverPlateBoltedConfig.js` (beam-beam, 222 lines) and `columnColumnCoverPlateBolted/.../coverPlateBoltedConfig.js` (222 lines) differ in only ~10 lines (route/session strings, `cadOptions`, default loads, list source). The welded pair shows the same ~15-line diff out of ~157 lines. Segment 5 and 8 show smaller-scale versions of the same shape (bolted vs. welded configs).

**Fix:** Segment 12's own suggestion is the right one — a `makeCoverPlateConfig({ memberType: 'Beam'|'Column', fabrication: 'Bolted'|'Welded', ... })` factory would collapse ~400 duplicated lines to ~50, and — concretely — would have prevented the transposed rows/cols bug found in the same segment (see #9 below), since a single factory can't accidentally invert a mapping in only one of its two call sites.

**Status: partially done.** The Segment 12 cover-plate family (the "clearest example" cited above) is fixed; Segment 5/8's smaller-scale bolted/welded config duplication is untouched.
- Added `frontend/src/modules/shared/config/coverPlateConfigFactory.js`, exporting `makeCoverPlateBoltedConfig(...)` and `makeCoverPlateWeldedConfig(...)` (kept as two factories rather than one `{memberType, fabrication}` factory, since bolted and welded have genuinely different field sets — bolt diameter/grade modals vs. weld type/fab — not just different labels on the same shape).
- All 4 config files (`coverPlateBolted`, `columnColumnCoverPlateBolted`, `coverPlateWelded`, `columnColumnCoverPlateWelded`) reduced from 227/227/162/163 lines to ~8-line factory calls.
- Verified behavior-preserving by loading both the git-HEAD originals and the new factory output in Node and diffing: `buildSubmissionParams()` produces byte-identical output on representative inputs for all 4 configs; the only structural difference in the full object shape is JS object-key ordering (cosmetic, not consumed anywhere order-dependently).
- Found, and deliberately did **not** silently unify, a real discrepancy while diffing the welded pair: `columnColumnCoverPlateWelded` sources `"Member.Material"` from `inputs.material` where `coverPlateWelded` sources it from `inputs.member_material`, and the column variant sends 2 extra submission params (`flangespace`, `type`) the beam variant doesn't. Both preserved exactly via explicit `memberMaterialField`/`extraSubmissionParams` factory params rather than reconciled, since this pass was pure dedup, not a bug fix — flagged to the user as possibly the same class of copy-paste bug as #9 below, worth a follow-up look.
- **Not done:** Segment 5/8's smaller-scale bolted-vs-welded config duplication elsewhere in the codebase.

## 7. Triplicated cantilever calculation logic — 3 Django submodules, only 1 reachable from the UI — ✅ FIXED (2026-08-02)

**Where:** Segment 9 found `shear_connection/cantilever` wraps `osdag_core.design_type.flexural_member.flexure_cantilever.Flexure_Cantilever` — live, `AllowAny`, zero frontend caller, not even in its own module's `options()` allowlist. Segment 11 found `moment_connection/cantilever_connection` wraps the **exact same class** — also live, also `AllowAny`, also zero frontend caller, and also missing from its own `options()`/report-map. Segment 10 confirmed the one legitimate, frontend-wired version lives at `flexure_member/on_cantilever`.

**Fix:** this isn't a duplication-of-logic problem to refactor — it's two dead, orphaned, but still publicly callable API surfaces that should simply be deleted (`shear_connection/submodules/cantilever/`, `moment_connection/submodules/cantilever_connection/`), leaving `flexure_member/on_cantilever` as the single implementation. If there was ever a real intent to offer a shear-governed or moment-governed cantilever variant distinct from the flexural one, that intent isn't reflected anywhere in the frontend today (per both segments' Open Questions) — worth a one-line confirmation from whoever owns the module roadmap before deleting, but the default action here should be deletion, not a "keep and consolidate" refactor.

**Status: done.** Re-verified the orphan claim before deleting anything: both `service.py` files import the identical `Flexure_Cantilever` class (the `moment_connection` copy even kept a leftover `"""Fin Plate Service..."""` docstring, confirming it was copy-pasted from an unrelated module and never actually written for this one); neither `cantilever` nor `cantilever-connection` appears in `shear_connection/views.py` or `moment_connection/views.py`'s `options()` slug lists; a repo-wide grep of `frontend/src` for either slug found zero references, versus multiple live references to `on-cantilever`/`OnCantilever`; no test file references either submodule. Both directories (`shear_connection/submodules/cantilever/`, `moment_connection/submodules/cantilever_connection/`) deleted outright. Both parent registries use pure folder-based auto-discovery (`BaseModuleRegistry.auto_discover`), so there was no separate whitelist/config entry to also clean up — deleting the folders was sufficient. `flexure_member/on_cantilever` is now the sole cantilever implementation.

## 8. Unguarded slug-based routing on `design`/`cad` actions (no allowlist, unlike `options()`)

**Where:** Segment 9 found `ShearConnectionViewSet.design`/`.cad` forward any registry-resolvable slug to `get_service_by_slug()` with no allowlist — this is exactly the mechanism that keeps the orphaned `cantilever` submodule reachable (#7 above). Segment 12 confirmed the identical structural gap exists in `MomentConnectionViewSet` (though no orphaned submodule currently exploits it there — Segment 11 is where the moment-connection orphan actually lives). Segment 10 is the positive counter-example: `FlexureMemberViewSet`'s 4 registered slugs exactly match its `options()` allowlist, so this class of bug can't happen there.

**Fix:** this is the same bug in at least 2 (structurally 3, counting `moment_connection` serving both Segment 11 and 12's submodules) of the ~7 module ViewSets in the codebase, and it's caused by `design`/`cad` and `options` maintaining two independently-hand-written slug lists that can silently diverge. A shared base ViewSet mixin (or a single `get_service_by_slug_or_404(allowed_slugs=...)` helper reused by every module's `design`/`cad`/`options` actions, deriving `allowed_slugs` from one place) would close this for every module at once, using `flexure_member`'s current (correct) behavior as the reference implementation.

## 9. Copy-paste-inverted field mappings between "identical" sibling configs

**Where:** Segment 12's transposed rows/cols and plateWidth/plateHeight bug between `coverPlateBolted` (beam-beam) and `columnColumnCoverPlateBolted` — both map the same underlying `osdag_core` output field names to diagram roles, but the mapping is inverted between the two files. This is a direct symptom of #6 (hand-copied sibling configs) rather than an independent bug class, but it's called out separately because it's a live, user-visible rendering bug (not just a maintenance smell) and a good illustration of *why* #6 matters practically, not just stylistically.

## 10. Miscellaneous smaller repeats worth a single pass each

- **`convertToCSV` implemented 3 times with diverging null-handling** (Segment 2, Segment 4) — `context/ModuleState.jsx`, `utils/csvUtils.js`, `modules/shared/utils/moduleUtils.js`. One throws on `null`/`undefined`, the other two don't. Consolidate to one shared utility.
- **`alert()` used instead of the codebase's standard `message.error()` toast** at 4 call sites in `useDesignSubmission.js`/`useEngineeringModule.js` (Segment 4) — inconsistent UX, easy find-and-replace fix.
- **Commented-out dead code left in place instead of deleted** — recurs as a nit across Segments 1 (`project_api.py`'s old guest-checks), 2 (`GlobalState.jsx`/`ModuleState.jsx` dead effects), 4 (`designPrefModuleConfig.js`), 9 (`views.py`'s commented `end-plate` branch); Segment 11's example (`cantilever_connection/adapter.py`'s dead imports and unreachable post-`raise` code) is moot as of 2026-08-02 — the whole file was deleted as part of #7. Not a bug, but a repo-wide "delete, don't comment out" norm would prevent the confusion several reports independently flagged (e.g. Segment 9: reads as "still exists, just disabled" when the underlying code is actually gone).
- **Committed test/debug artifacts that shouldn't be tracked** — Segment 6's `tmp_cad/` placeholder `.brep` files (4 files, confirmed tracked in git, not gitignored), Segment 13's committed Locust `.html` reports and `__pycache__/` under `load_tests/`. A `tmp_cad/` and `load_tests/*.html` gitignore rule would prevent recurrence.

## What this means for prioritization

If picking a small number of fixes to do first for maximum leverage, in order of leverage-per-effort:

1. ✅ **Delete all `*OutputDock.jsx` dead files** (#1) — done; zero risk (verified dead 9/9 times), 20 files removed in one pass. Run `npm run build`/`lint` before merging to double-check, since a full build wasn't run in this environment.
2. **Rotate + purge `.env` from git history** (Segment 13's critical finding) — not in this list's numbering since it's a single-file issue, not a repeated pattern, but it's the single highest-severity item across all 13 reports and should not wait for a "systemic fixes" pass. **Still not done** as of 2026-08-02 — everything below touches secret *fallbacks* in code, not the fact that real dev secrets are sitting in git history right now.
3. ✅ **Add the shared `validateRequiredFields()` helper** (#2) — done; wired into all 26 modules plus the backend `contains_keys()` fix. Run `npm run build`/`lint` and click through a few modules (especially ones with "customizable" bolt/plate fields) before merging.
4. ✅ **Centralize the secret-loading fallbacks** (#3) — done (2026-08-02); see #3 above for the full file list. Closed all 4 duplicated `INFLUXDB_TOKEN` instances plus `SECRET_KEY`/DB-password/SMTP-credential fallbacks, across both compose files too.
5. ✅ **Delete the 2 orphaned cantilever submodules** (#7) — done (2026-08-02); removed the live, unreviewed, `AllowAny` attack surface — verified zero frontend/test callers before deleting, see #7 above.
6. #5 and #6 are partially done (2026-08-02) — see their sections above for exactly what's covered (tension_member, flexure_member, and the moment_connection cover-plate *bolted* pair for #5; the cover-plate config family for #6) and what's intentionally left for a follow-up (the welded cover-plate pair, plate_girder, Segment 6/8's smaller-scale repeats). #4, #8, #9, #10 remain untouched — real but lower-urgency code-quality debt, worth scheduling as normal refactor work.
