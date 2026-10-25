# Design-input fixtures

Known-good request bodies for all 25 module adapters, used by
`apps/core/tests/test_design_input_fixtures.py`. Each file is the flat, dotted-key
dict that reaches an adapter's `validate_input()` today:

```json
{ "source": "osi:fin4.osi" | "frontend-defaults:finPlateConfig.js",
  "notes": "how it was produced and what was filled in",
  "inputs": { "Bolt.Diameter": ["16"], "...": "..." },
  "xfail": "optional: the payload is a known bug, the test expects it to be rejected" }
```

They pin down which inputs are accepted **before** `validate_input()` is replaced by
Pydantic models, so a refactor can show it did not change behaviour. They say nothing
about whether the design then succeeds.

The directory name is the adapter's path under `apps/modules/`, without `submodules/`
(`shear_connection__fin_plate` is `shear_connection/submodules/fin_plate/adapter.py`;
`base_plate` is the top-level adapter).

## Sources

**`frontend-defaults:<config>`** (all 25 modules). The module's real
`buildSubmissionParams(inputs, allSelected, lists, extraState)` run on its
`defaultInputs`, so the body is exactly what the browser POSTs. Variants per module:
`defaults-all` (every customizable list on "All", the UI default, so the full option
lists are sent) and `defaults-customized` (explicit selections). Modules with a
connectivity choice get one `defaults-all__<connectivity>` per option (fin plate,
cleat angle, header plate, seated angle, base plate). Option lists come from
`apps.core.catalog` plus the constants in the `apps/modules/*/views.py` options
endpoints. Defaults that are empty but required are filled with catalog values, and
each fixture's `notes` says which:

| Module | Filled |
|---|---|
| header plate | column `HB 150`, beam `MB 300`, primary `JB 200`, secondary `JB 150` |
| base plate | column `HB 200`, loads (tension and moments left blank for a welded base) |
| purlin | span, moments, shears |
| lap/butt joints | plate 1 and 2 thickness |

**`osi:<file>`** (desktop examples in `osdag_core/data/ResourceFiles/design_example/`).
The path a user's "open .osi" takes in the browser: `parse_osi()` (backend) gives
`{dock, pref}`; the frontend's `loadStateFromOsi()` loads it into the module config's
form state; `buildSubmissionParams` builds the body. An example whose body today's
`validate_input()` rejects is not written as a fixture; it is listed with the error in
`osi_rejected.json`, and its module keeps the frontend-default fixtures.

| Source | Modules |
|---|---|
| osi + frontend-defaults | fin plate (5 osi), cleat angle (4), header plate (5), seated angle (5), base plate (3), beam-beam cover plate bolted (2) and welded (5), column-column cover plate bolted (4) and welded (5), beam-beam end plate (2), beam-column end plate (5), column-column end plate (1), tension bolted (5) and welded (5) |
| frontend-defaults only, no desktop example | axially loaded column, struts bolted and welded, simply supported beam, on cantilever, purlin, plate girder, lap/butt joint bolted and welded |

`parse_osi()` also returns the keys as written in the file (`flat`); `loadStateFromOsi()`
maps those to the module's own fields, so the generator passes `{dock, pref, flat}`.

### Desktop examples without a fixture (10 of 66)

- **Blank loads (8)**: `baseplate_1`, `baseplate_3`, `beam_bolted1-3`, `column_bolted1`,
  `ccep2`, `cleat_4`. The desktop file itself has an empty required load
  (`Load.Moment: ''`, `Load.Shear: ''`, `Load.Axial_Compression: ''` or
  `Load.Shear.Major: ''`), which the validator reports as missing. They are listed in
  `osi_rejected.json`.
- **Older module name (2)**: `bb_ep_splice_1-2` say `Module: Beam-Beam End Plate Splice`,
  a name the desktop no longer uses. The web does not open it; the generator skips it.


## Known bugs pinned as `xfail`

`flexure_member__purlin`: the frontend sends `Cladding.Type`, while
`validate_input()` requires `Cladding.type`, so every purlin design is rejected.
(`generate_output()` accepts both spellings.) The test is `xfail(strict=True)`: when
the bug is fixed the test fails, and the `xfail` field is then removed.

## Regenerating

From the repo root, with `frontend/node_modules` installed and a Python that can import
the backend:

```bash
PYTHON=/path/to/python node backend/apps/core/tests/fixtures/generate_design_fixtures.mjs
```

`generate_design_fixtures.mjs` bundles every frontend module config with the project's
Vite (SSR build in a temp dir, nothing in the repo is touched), asks
`dump_backend_data.py` for the parsed `.osi` files and catalog lists, generates the
payloads, has `check_fixtures.py` run each adapter's `validate_input()` over them, and
rewrites this folder. It is deterministic: no change in the configs or backend means no
diff. Regenerate after changing a frontend config's `buildSubmissionParams` or
`defaultInputs`, and review the diff.

Run the tests (no database needed) from `backend/`:

```bash
python -m pytest apps/core/tests/test_design_input_fixtures.py --ds=config.settings -p no:cacheprovider -q
```
