# Osdag-web Code Review Plan

**Scope:** `backend/` (Django API layer), `frontend/` (React app), and deployment/ops config.
**Out of scope:** `osdag_core/` (structural engineering calculation library + CAD generation) — reviewed separately, not part of this pass.

Total in-scope code: ~69K lines (backend ~28.7K, frontend ~40K).

Review one segment at a time with Claude. After each session, paste the findings into that segment's **Findings** block below so the plan doubles as a running audit log.

**Status: all 13 segments reviewed (read-only, Claude pass) as of 2026-08-01.** Full reports live in `claude/01-*.md` through `claude/13-*.md`. A final synthesis pass across all 13 reports, identifying issues that recur across multiple modules and the shared fixes that would close them in one PR instead of N, lives in **[`claude/00-cross-cutting-summary.md`](claude/00-cross-cutting-summary.md)** — read that first if you're deciding what to fix first. A separate, independent Gemini-based review is being run in parallel for cross-checking.

## Status board

| # | Segment | Status |
|---|---------|--------|
| 1 | Backend infra & auth | Reviewed — [`claude/01-backend-infra-auth.md`](claude/01-backend-infra-auth.md) |
| 2 | Frontend app shell & site infra | Reviewed — [`claude/02-frontend-app-shell.md`](claude/02-frontend-app-shell.md) |
| 3 | Shared UI components | Reviewed — [`claude/03-shared-ui-components.md`](claude/03-shared-ui-components.md) |
| 4 | Shared hooks/config/context/utils | Reviewed — [`claude/04-shared-hooks-config.md`](claude/04-shared-hooks-config.md) |
| 5 | Tension Members | Reviewed — [`claude/05-tension-members.md`](claude/05-tension-members.md) |
| 6 | Compression Members | Reviewed — [`claude/06-compression-members.md`](claude/06-compression-members.md) |
| 7 | Base Plate | Reviewed — [`claude/07-base-plate.md`](claude/07-base-plate.md) |
| 8 | Simple Connection (Lap & Butt Joints) | Reviewed — [`claude/08-simple-connection.md`](claude/08-simple-connection.md) |
| 9 | Shear Connection | Reviewed — [`claude/09-shear-connection.md`](claude/09-shear-connection.md) |
| 10 | Flexural Member (Beams & Plate Girder) | Reviewed — [`claude/10-flexural-member.md`](claude/10-flexural-member.md) |
| 11 | Moment Connection — End Plate family | Reviewed — [`claude/11-moment-connection-end-plate.md`](claude/11-moment-connection-end-plate.md) |
| 12 | Moment Connection — Cover Plate family | Reviewed — [`claude/12-moment-connection-cover-plate.md`](claude/12-moment-connection-cover-plate.md) |
| 13 | Ops / Deployment / Testing infra | Reviewed — [`claude/13-ops-deployment.md`](claude/13-ops-deployment.md) |

## Cross-cutting issues (see full detail in [`claude/00-cross-cutting-summary.md`](claude/00-cross-cutting-summary.md))

Ten patterns recur across 2+ segments and are worth a single shared fix rather than N per-module patches:

1. **Dead `*OutputDock.jsx` components** — confirmed dead (zero imports) in 9/9 application-module segments (5–12), ~20+ files. Safe to bulk-delete in one pass.
2. **`required: true` fields never actually checked by `validateInputs()`** — Segments 6, 7, 10 (Purlin's backend validation is a total no-op), 11. Fix at the framework level with a shared `validateRequiredFields()` helper driven by the config that already exists, instead of hand-written per-module checks.
3. **Hardcoded insecure secret fallbacks duplicated across files** — same `INFLUXDB_TOKEN`/`SECRET_KEY`/DB-password literals recur in `settings.py`, `consumers.py`, both compose files, and `metrics_collector.py` (Segments 1, 10, 13).
4. **`print()` instead of `logging`** — near-universal across backend services (Segments 1, 5, 6, 7, 8, 9, 10, 11, 12). `plate_girder/tasks.py` is the one existing reference for "done right."
5. **Duplicated CAD-generation/adapter boilerplate** between bolted/welded and beam/column sibling submodules — Segments 5 (~150 lines), 10 (~250 lines), 12 (near-byte-identical adapters).
6. **Duplicated frontend module configs** across bolted/welded × beam/column variants — clearest in Segment 12 (~400 duplicated lines across the cover-plate family); a config factory would collapse this.
7. **Triplicated cantilever calculation logic** — `shear_connection/cantilever` (Segment 9) and `moment_connection/cantilever_connection` (Segment 11) both orphan-wrap the same `osdag_core.Flexure_Cantilever` class already live at `flexure_member/on_cantilever` (Segment 10). Both orphans are `AllowAny`-reachable with zero frontend caller — candidates for deletion, not consolidation.
8. **Unguarded slug-based routing on `design`/`cad` actions** (no allowlist, unlike `options()`) — Segment 9 (shear_connection, actively exploited by #7's orphan), Segment 12 (moment_connection, same structural gap). Segment 10's `flexure_member` is the correct counter-example.
9. **Copy-paste-inverted field mapping** — Segment 12's transposed bolt-pattern rows/cols bug is a direct, user-visible symptom of #6.
10. **Smaller repeats**: `convertToCSV` implemented 3 times with diverging null-handling (Segments 2, 4); `alert()` vs `message.error()` inconsistency (Segment 4); commented-out dead code left in place instead of deleted (Segments 1, 2, 4, 9, 11); committed test/debug artifacts that should be gitignored (Segments 6, 13).

Plus one standalone critical item (not a repeated pattern, but the single highest-severity finding across all 13 reports): **`.env` containing real production secrets is tracked in git history** (Segment 13) — needs credential rotation + `git filter-repo` purge independent of any of the above.

## ⚠️ Unrequested bonus finding, OUT OF SCOPE (2026-08-01)

A background agent, after completing its assigned Segment 13 task, continued unprompted into a follow-up pass that reads from `osdag_core` (explicitly excluded from this review) and from `osdag/` (a separate desktop-app codebase never in scope). This was **not requested** and breaks the review's scope boundary; it is retained only as a labeled bonus at the user's discretion, not as part of the 13-segment review proper. It traced the literal CAD "part" strings (`Model`, `Beam`, `Plate`, `Connector`, `EndPlate`, `cleatAngle`, …) across every module, cross-checked against the desktop app's naming in `osdag/src/osdag_gui` + `osdag_core`'s `get_3d_components()`. Findings not independently re-verified. Full detail: [`claude/15-cad-section-naming-audit.md`](claude/15-cad-section-naming-audit.md).

Headline finding: there are **4 independent, hand-maintained "valid CAD sections" lists per module** (frontend `cadOptions`, frontend `viewMappings.js` bridge table, backend `SECTION_MAPPINGS` default-sections dict, and each adapter's own allowlist) plus a 5th, dead legacy copy (`cad_model_api.py`'s `CADGeneration` view — still routed at `/api/design/cad`, zero frontend callers). Confirmed concrete issues:
- **Tension Member (bolted + welded) always attempts a 4th CAD section, `"Endplate"`, that's guaranteed to fail** — present in the backend's default-sections list but absent from the adapter's own allowlist; wasted Celery work + silently-discarded error on every single design run. The desktop app has this exact option commented out in its own source, confirming it was never meant to be live.
- **Purlin's frontend offers a "Beam" CAD button that both the backend default-sections list and the adapter's own allowlist reject outright.**
- **3 end-plate moment-connection modules label the UI button "EndPlate" while the actual backend section is `"Connector"`** — currently papered over by one hand-maintained array in `viewMappings.js`, not a real fix.
- Desktop itself already has UI-label-vs-internal-key splits in several modules (e.g. Base Plate: label "Base Plate" → internal key `Connector`) — Osdag-web inherited that pattern and multiplied it by turning a 2-list problem into a 4-list one.

Recommended fix: make `cadOptions` the single source of truth and have the backend consume it directly (the frontend already computes this list and simply never sends it as the `sections` param, which the backend already accepts as an override) instead of maintaining 3-4 separate hand-synced copies per module.

---

## 1. Backend infra & auth (~11.7K lines)

**Paths:** `backend/apps/core/*` (api, middleware, utils, tests), `backend/config/*`, `backend/apps/sections/*`

Key files: `config/settings.py`, `config/secret_key.py`, `config/postgres_credentials.py`, `config/mailing.py`, `config/celery.py`, `apps/core/middleware/firebase_auth.py`, `metrics_middleware.py`, `apps/core/api/auth/*` (jwt_api, google_sso_api, my_data_api, delete_account_api, user_view, export_data_api), `apps/core/api/design/*` (design_pref_api, design_pref_sync_api, sync_merge, report_customization_api, design_report_pdf_view, material_api), `apps/core/api/cad/*` (cad_model_download/export/api, cad_module_aliases), `apps/core/api/projects/*` (osi_api, project_api), `apps/core/utils/*` (validation, errors, cad_export, cad_helpers, osi_files, report_image_generator, mesh_export), `apps/sections/*`.

**What to check:**
- Secrets: is `SECRET_KEY` / DB password / mailing creds ever hardcoded in `secret_key.py`, `postgres_credentials.py`, `mailing.py` vs pulled from env? Confirm `.env` is gitignored and nothing sensitive is in git history for these files.
- `settings.py`: `DEBUG` default, `ALLOWED_HOSTS`, CORS allowed origins (not `*`), CSRF settings, `SECURE_*` flags (SSL redirect, HSTS, secure cookies) for prod.
- Auth: `firebase_auth.py` — token verification logic, does it fail open or closed on invalid/expired tokens? `jwt_api.py`, `google_sso_api.py` — audience/issuer validation. `delete_account_api.py`, `export_data_api.py`, `my_data_api.py` — authorization checks so a user can only access/export/delete their own data.
- Authorization/IDOR: `project_api.py`, `osi_api.py` — verify ownership checks on project/design retrieval/update/delete are by authenticated user, not just object id. `design_pref_sync_api.py`, `sync_merge.py` — multi-device sync: race conditions, no cross-user data bleed.
- File handling: `cad_model_download.py`, `cad_model_export.py`, `osi_files.py`, `report_image_generator.py`, `mesh_export.py` — path traversal via user-controlled filenames, file size/type validation, temp file cleanup.
- Report/PDF generation: `design_report_pdf_view.py`, `report_customization_api.py` — user input flowing into the report pipeline (injection risk, unbounded resource use / DoS via huge inputs).
- `apps/core/utils/validation.py`, `errors.py` — is validation actually enforced server-side, not just assumed from frontend? Consistent error response shape.
- `apps/sections` — `validation.py`/`options_merge.py` merge-logic correctness; `views.py`/`admin.py` — any endpoints or Django admin models exposed without proper permission checks.
- `metrics_middleware.py` — confirm no tokens/PII logged into metrics.
- Migrations — raw SQL, destructive changes, missing indexes on hot fields.
- Test coverage in `apps/core/tests/`, `apps/core/utils/tests/` vs the API surface above — note gaps.

**Findings:** Auth core (`firebase_auth.py`, `project_api.py`, `delete_account_api.py`) is solid — proper token verification, cache-with-TTL, consistent server-derived ownership scoping. But `config/` ships real hardcoded secrets (`SECRET_KEY`, SMTP password, DB password fallback, InfluxDB token), `DEBUG`/`ALLOWED_HOSTS` default insecurely, `django-silk` is mounted with no access control (full request/response/header exposure at `/silk/`), and there's a path-traversal bug in CAD file download (`cad_model_download.py`, unauthenticated). `/jwt/home` and `/googlesso/` 500 on every call (dict/set typo). `OpenOsiById` has a latent IDOR (null `owner_email` bypasses ownership check — currently unreachable since nothing writes that table). Full detail: [`claude/01-backend-infra-auth.md`](claude/01-backend-infra-auth.md).

---

## 2. Frontend app shell & site infra (~9.6K lines)

**Paths:** `frontend/src/Auth`, `frontend/src/homepage`, `frontend/src/context`, `frontend/src/constants`, `frontend/src/components`, `frontend/src/utils`, `frontend/src/datasources`

**What to check:**
- `Auth/`: token storage location (localStorage vs httpOnly cookie — XSS exposure), login/signup/password-reset flows, protected route guards, token refresh, logout clears all state.
- `context/`: provider value memoization (unmemoized objects cause full-tree re-renders), state shape correctness.
- `constants/` (`apiRoutes.js`, `DesignKeys.js`, `UIStrings.js`, `modules.js`): hardcoded URLs/env-specific values that should be env vars; consistency between route constants and actual backend `urls.py` paths.
- `datasources/`: centralized API client — auth header injection, error handling, base URL from `VITE_API_URL`, timeout/retry behavior.
- `homepage/`: `mockData.js` — confirm mock data isn't accidentally used on a production code path instead of real API data.
- `components/`, `utils/`: dead code, duplication with `modules/shared/utils`.

**Findings:** Generally clean — readable Firebase auth flows, sensible 401-retry/token-refresh in `apiClient.js`, centralized route/endpoint constants. No hardcoded secrets. Main issues: a large dead legacy state tree (`GlobalState`/`AppReducer`, ~150 lines) still mounted at the app root but never consumed; `convertToCSV` reimplemented 3 times with diverging null-handling (see cross-cutting #10); `ProjectAuthGuard` only protects the URL, not data access (server-side auth does the real work, per Segment 1); no absolute client-side session timeout. Full detail: [`claude/02-frontend-app-shell.md`](claude/02-frontend-app-shell.md).

---

## 3. Shared UI components (~13.5K lines)

**Paths:** `frontend/src/modules/shared/components/{cad,diagrams,help,outputDock}`, plus root-level shared form/UI components

**What to check:**
- CAD viewer (`cad/SceneManager.jsx` etc.): Three.js/WebGL resource disposal on unmount (memory leaks), performance with large models, error boundaries around rendering failures.
- `diagrams/`: rendering correctness, responsiveness, accessibility (labels/alt text).
- Root-level form components (~9K lines): input validation consistency vs backend `validation.py` rules; controlled/uncontrolled input handling; numeric edge cases (negative, empty string, NaN) for engineering parameters.
- `outputDock/`: correct formatting/rounding/units of displayed results; export/copy functionality.
- `help/`: content correctness, no broken references.
- General: prop-types/TypeScript consistency, accessibility (labels, ARIA), duplicated near-identical components reinvented in module-specific folders instead of reused from here.

**Findings:** CAD stack (`SceneManager`, `CadScene`, `SmartPart`) is well-engineered — careful memoization, WebGL context-loss recovery. Concrete issues: `SmartPart`'s edge geometry/material is never disposed (real GPU memory leak over long sessions); several `dangerouslySetInnerHTML` sinks fed by backend-derived hover labels — plausible stored-XSS if user-uploaded `.xlsx` section designations ever flow unsanitized into the `hover` dict (needs backend confirmation, flagged as open question to Segment 1); `normalizedCadModelPaths`'s "memoization" doesn't preserve reference stability (no-op optimization); `ReportCaptureDev` installs debug `window.*` globals unconditionally in production. Full detail: [`claude/03-shared-ui-components.md`](claude/03-shared-ui-components.md).

---

## 4. Shared hooks/config/context/utils (~6.3K lines)

**Paths:** `frontend/src/modules/shared/{hooks,config,context,utils}`

**What to check:**
- `hooks/`: stale closures, missing `useEffect` dependency arrays, debouncing on rapid input changes for live calc previews, cleanup of subscriptions/intervals.
- `usePlateGirderOptimization.js` specifically: how it calls the PSO optimization backend (polling vs push), cancellation on unmount, timeout/error handling for a long-running optimization request.
- `config/`: default values, no debug flags or secrets baked in.
- `context/`: overlap/duplication with segment 2's top-level `context/`.
- `utils/`: number formatting and unit-conversion helpers — rounding/precision correctness (these feed safety-relevant structural values even though the calc itself is out of scope).

**Findings:** Solid connective-tissue layer overall (correct `AbortController`/generation-counter usage, clean dock-layout reducer, graceful legacy OSI-format handling). Two consequential bugs: `EngineeringContext`'s Provider `value` object is never memoized, causing full-module-tree re-renders on every state change including high-frequency hover-position updates; `useEngineeringService` returns a fresh object every render, causing its consumer's cleanup effect to fire on nearly every re-render, producing duplicate/stale autosave `PUT` requests. Also: a fragile sentinel-based OSI key-mapping tracer that can silently drop fields, and `convertToCSV`'s third implementation (throws on null/undefined — see cross-cutting #10). Full detail: [`claude/04-shared-hooks-config.md`](claude/04-shared-hooks-config.md).

---

## 5. Tension Members (~1.9K lines)

**Paths:** `frontend/src/modules/TensionMembers`, `backend/apps/modules/tension_member`

**What to check:**
- Frontend form field names/types vs backend serializer — do they actually match?
- Adapter layer: correct mapping from API payload to the fields `osdag_core` expects (mapping correctness only — not the calc itself).
- Output dock rendering vs backend response shape.
- Error handling for invalid section/material combos — graceful message vs raw 500.

**Findings:** Small, well-structured vertical slice, no module-specific security red flags (the CAD session ID is server-generated, not user input, closing off the path-traversal pattern flagged in Segment 1). Confirmed dead `*OutputDock.jsx` components (cross-cutting #1). Frontend `validateInputs` doesn't check empty bolt-diameter/grade/plate-thickness before submit (backend correctly rejects, but only after a full async round-trip — cross-cutting #2 pattern, less severe here since backend does catch it). ~150 lines of CAD-generation code duplicated between bolted/welded adapters (cross-cutting #5). Noisy `print()`-based logging (cross-cutting #4). Full detail: [`claude/05-tension-members.md`](claude/05-tension-members.md).

---

## 6. Compression Members (~3.7K lines)

**Paths:** `frontend/src/modules/compressionMember`, `backend/apps/modules/compression_member`

**What to check:**
- Same mapping/validation/error-handling checks as segment 5.
- `compressionMemberConfig.js` references "truss" — determine whether truss-type compression members are fully wired end-to-end here, or whether this is a partial/dead feature (there's no obvious frontend module for `osdag_core`'s `truss_connection*.py`).
- Column/welded/bolted mode-switching logic in the form.

**Findings:** Same adapter/service/registry pattern, `AllowAny` consistent with the rest of the app. Real findings: a fully dead legacy `adapter.py`/`service.py` at the module root, never wired to any route, duplicating (with an inferior/incomplete field set) `struts_welded`'s logic; dead `CompressionMemberOutputDock.jsx` (cross-cutting #1); 4 committed placeholder CAD test artifacts in `tmp_cad/`, tracked in git and not gitignored; `struts_bolted`/`struts_welded` adapters mutate the caller's input dict in place (currently idempotent, but fragile). The "truss" reference flagged in the original plan turned out to be a naming artifact (`"Struts in Trusses"` display string), not a dead feature. Full detail: [`claude/06-compression-members.md`](claude/06-compression-members.md).

---

## 7. Base Plate (~1K lines)

**Paths:** `frontend/src/modules/basePlate`, `backend/apps/modules/base_plate`

**What to check:**
- This is the smallest module — check it follows the same adapter/service/registry structure as the others rather than being a one-off implementation.
- Given base plate design typically needs many parameters (anchor bolts, plate size, moment/axial/shear combinations), verify nothing is silently defaulted incorrectly in the adapter.

**Findings:** Smallest, architecturally simplest module — correctly skips the registry pattern (no submodule dispatch needed). Careful, well-commented key-mapping in `adapter.py`. Confirmed dead `BasePlateOutputDock.jsx` with a broken import path (first of 9 segments to find this — cross-cutting #1). Real bug: `load_shear_major/minor`/`load_moment_major/minor` are marked `required: true` in the frontend config but never actually checked by either frontend `validateInputs` or backend `contains_keys` (presence-only, not emptiness) — empty loads can reach `osdag_core` and produce an opaque error (cross-cutting #2, first instance found). Full detail: [`claude/07-base-plate.md`](claude/07-base-plate.md).

---

## 8. Simple Connection — Lap & Butt Joints (~3K lines)

**Paths:** `frontend/src/modules/SimpleConnection/{ButtJointBolted,ButtJointWelded,LapJointBolted,LapJointWelded}`, `backend/apps/modules/simple_connection`

**What to check:**
- Frontend `shared/validation.js` vs backend `shared_validation.py` — two parallel validation implementations; check they haven't drifted out of sync.
- 4 near-identical submodules (bolted/welded × lap/butt) — check for copy-paste divergence where a fix applied to one sibling wasn't applied to the others.

**Findings:** One of the cleaner modules reviewed — a genuinely shared `SimpleConnectionValidator`/`validateSimpleConnectionInputs` DRYs up validation across all 4 submodules with no significant copy-paste divergence. One concrete bug: displayed "Weld Type" (fabrication) in the output/report always shows "Shop Weld" regardless of user selection, because the frontend never sends the `Weld.Fab` key the display label is sourced from (it sends `Weld.Type`, a different key that correctly drives the real safety-factor calculation — engineering result unaffected, only the displayed metadata is wrong). Dead `*OutputDock.jsx` in all 4 submodules (cross-cutting #1). Full detail: [`claude/08-simple-connection.md`](claude/08-simple-connection.md).

---

## 9. Shear Connection (~5K lines)

**Paths:** `frontend/src/modules/shearConnection`, `backend/apps/modules/shear_connection` (submodules: fin_plate, cleat_angle, seated_angle, header_plate, cantilever)

**What to check:**
- `registry.py`/`urls.py` correctly wire all 5 submodules — none silently unreachable.
- A `cantilever` submodule exists under both `shear_connection` and `moment_connection` (see segment 11) — clarify whether this is intentional (cantilever beams can be shear- or moment-governed) or accidental duplication.
- Consistent handling of common edge cases (bolt grade, plate thickness bounds) across the 5 sub-types.

**Findings:** Resolves the plan's open question: the `cantilever` submodule under `shear_connection` is orphaned dead code — it actually runs a *flexural*-member calc (`osdag_core.design_type.flexural_member.flexure_cantilever`), not an intentional shear-governed cantilever variant. Still live and publicly reachable at `POST /api/modules/shear-connection/cantilever/{design,cad}/` with `AllowAny`, duplicating the real `flexure-member/on-cantilever` route (cross-cutting #7). Root cause: `ShearConnectionViewSet.design`/`.cad` trust any registry-resolvable slug with no allowlist, unlike `options()` (cross-cutting #8). Also: the frontend "End Plate" folder/component/config was never renamed after the feature became "Header Plate" end-to-end at the routing layer — works correctly today but is a naming trap. Backend validation here is notably more rigorous than Segment 7's Base Plate. Full detail: [`claude/09-shear-connection.md`](claude/09-shear-connection.md).

---

## 10. Flexural Member — Beams & Plate Girder (~5K lines)

**Paths:** `frontend/src/modules/flexuralMember/{onCantilever,purlin,simplySupportedBeam,plateGirder}`, `backend/apps/modules/flexure_member`

**What to check:**
- Plate Girder submodule's use of the `usePlateGirderOptimization` hook (segment 4) — verify the API contract between hook and adapter matches; long-running-request handling (timeouts, progress, cancel).
- Registry/urls wiring completeness across the 4 sub-types, same check as segment 9.
- Recent commit history includes "fix: Plate Girder Optimized mode PSO optimization window and design flow" and "Fix output dock Simply Supported Beam" — specifically re-check these areas for regressions or incomplete fixes.

**Findings:** Architecturally the most sophisticated module reviewed — Plate Girder's real-time PSO optimization flow over Django Channels/Celery is genuinely well-engineered (task revocation on disconnect, batched/heartbeat WebSocket updates, clean hook memoization). Registry/URL wiring is clean (no orphan-route problem, unlike Segment 9). Main issue: validation rigor varies wildly across the 4 submodules — Plate Girder does real type/float checking, On-Cantilever checks only 5 of 11 declared required keys, Simply Supported Beam checks presence-only, and **Purlin's backend `validate_input()` is a complete no-op** despite declaring 13 required keys (cross-cutting #2, worst instance found). ~250 lines of duplicated CAD-generation boilerplate across 3 of 4 adapters (cross-cutting #5). Full detail: [`claude/10-flexural-member.md`](claude/10-flexural-member.md).

---

## 11. Moment Connection — End Plate family (~4K lines)

**Paths:** `frontend/src/modules/{beamBeamEndPlate,beamToColumnEndPlate,columnColumnEndPlate}`, `backend/apps/modules/moment_connection` submodules: `beam_beam_end_plate`, `beam_column_end_plate`, `column_column_end_plate`, `cantilever_connection`

**What to check:**
- Resolve the `cantilever_connection` vs shear-connection `cantilever` question (see segment 9).
- Consistency across the 3 end-plate variants — shared vs duplicated logic, adapter field-mapping correctness.

**Findings:** `moment_connection/cantilever_connection` is a live, publicly reachable submodule (`design`/`cad` work via `AllowAny`) that duplicates the same `osdag_core.Flexure_Cantilever` class already found orphaned under `shear_connection/cantilever` in Segment 9 — a **third** copy of the same logic (cross-cutting #7), and this one's `options()` endpoint 404s and its report-generation map entry is missing, so it's half-integrated at best. All 3 live end-plate submodules (beam-beam, beam-column, column-column) share a validation gap: "Bending Moment" is `required: true` in the UI and a hard-required backend key, but none of the 3 `validateInputs()` functions check it (cross-cutting #2, third confirmed instance). Dead `*OutputDock.jsx` in all 3 (cross-cutting #1). Positive: backend `validate_input()` here is thorough and consistent across all submodules, unlike Segment 10. Full detail: [`claude/11-moment-connection-end-plate.md`](claude/11-moment-connection-end-plate.md).

---

## 12. Moment Connection — Cover Plate family (~6.6K lines)

**Paths:** `frontend/src/modules/{coverPlateBolted,coverPlateWelded,columnColumnCoverPlateBolted,columnColumnCoverPlateWelded}`, `backend/apps/modules/moment_connection` submodules: `beam_beam_cover_plate_bolted`, `beam_beam_cover_plate_welded`, `column_column_cover_plate_bolted`, `column_column_cover_plate_welded`

**What to check:**
- 4-way symmetry (bolted/welded × beam/column) — copy-paste divergence check like segment 8.
- `moment_connection/views.py`, `registry.py`, `shared.py` — confirm all 7 total submodules across segments 11+12 are registered and routed via `urls.py`.

**Findings:** New red flag: CAD generation (`/cad/` endpoint) bypasses `validate_input()` entirely in all 4 cover-plate submodules — only `/design/` validates; unvalidated input reaches `osdag_core` under `AllowAny`. Bolted variants have a silent exception-swallowing pattern in `create_from_input` that can raise an unhandled `NameError` if module construction fails. Concrete bug: flange bolt-pattern diagram has rows/columns and plate width/height transposed between beam-beam and column-column bolted variants — same underlying field names, inverted role mapping (cross-cutting #9, a direct symptom of #6). Dead `*OutputDock.jsx` in all 4 (cross-cutting #1). ~200 lines of near-duplicate config per bolted/welded pair, no shared factory (cross-cutting #6). Full detail: [`claude/12-moment-connection-cover-plate.md`](claude/12-moment-connection-cover-plate.md).

---

## 13. Ops / Deployment / Testing infra

**Paths:** `Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`, `monitoring/`, `load_tests/`, `osdagweb.sh`, `requirements.txt`, `backend/apps/core/tests`, root-level `test_*.py`, `populate_database.py`, `diff_databases.py`, `.github/`

**What to check:**
- Dockerfile/compose files: hardcoded secrets vs env references, exposed ports, running as root, meaningful differences between dev and prod compose.
- `monitoring/`: what's actually monitored/alerted, no sensitive data in metrics/logs.
- `load_tests/`: confirm they target a safe/isolated environment, not production.
- `osdagweb.sh`: unsafe shell patterns (unquoted vars, destructive ops without confirmation).
- `.github/`: what CI actually runs on PRs, secret scoping.
- Root-level `test_*.py`, `populate_database.py`, `diff_databases.py`: still relevant/maintained, or stale scripts carried over from the earlier desktop app (e.g. `test_desktop_osdag.py` suggests possible desktop-era leftovers)?

**Findings:** **Critical:** `.env` (containing real `SECRET_KEY`, DB password, and other live credentials) is tracked in git, not just present on disk — 3 commits touch it, most recently `ae064a7f`. Being in `.gitignore` now does nothing to remove it from history; every value it's ever held needs rotation, plus a `git filter-repo` purge. Same `INFLUXDB_TOKEN` hardcoded in plaintext in 3 files (cross-cutting #3). Grafana runs with anonymous viewer access enabled on an exposed port, alongside hardcoded weak admin passwords for Grafana/InfluxDB. `CORS_ALLOWED_ORIGINS` hardcodes 3 specific developers' LAN IPs, not env-driven, and a test now locks that exact list in place. Root-level `test_*.py`/`diff_databases.py`/`test_desktop_osdag.py` flagged as possibly stale in this plan — confirmed already removed, non-issue. Positive: Dockerfile runs non-root, prod compose doesn't expose db/redis ports, CI/CD have no secret-handling or injection issues, and the GDPR/email-verification test suite is genuinely solid. Full detail: [`claude/13-ops-deployment.md`](claude/13-ops-deployment.md).
