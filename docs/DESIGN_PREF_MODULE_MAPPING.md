# Web `sessionName` to backend sync mapping

Design preference sync (`POST /api/design-preferences/sync/`) uses **`module_session_name`** equal to the engineering module **`sessionName`** (see each module’s `*Config.js`).

Material sync rules live in `apps/core/api/design/sync_merge.py` (`_MATERIAL_SYNC_RULES`).

| sessionName (web config) | Sync rule bucket |
|--------------------------|--------------------|
| `FinPlateConnection` | Shear — `material` → supporting/supported/connector |
| `EndPlateConnection` | Same |
| `CleatAngleConnection` | Same |
| `SeatedAngleConnection` | Same |
| `Beam to Column End Plate Connection` | Same |
| `Beam Beam End Plate Connection` | `material` → supported/connector only |
| `Column Cover Plate Bolted Connection` | `member_material` / `material` → supported/connector |
| `Beam Cover Plate Bolted Connection` | Same |
| `Column Cover Plate Welded Connection` | Same |
| `Beam Cover Plate Welded Connection` | Same |
| `Column Column End Plate Connection` | `material` + optional `member_material` |
| `Base Plate` | `material` → supporting/connector |
| Tension / flexure / compression (see `sync_merge.py`) | `member_material` or `material` → supported/connector |
| `Butt Joint Bolted`, `Lap Joint Bolted`, `Butt Joint Welded`, `Lap Joint Welded` | No dock→tab material sync (empty rules) |

Unknown `module_session_name` falls back to: if `inputs.material` is set, behave like a three-material shear connection.

This sync flow is always enabled in frontend.
