# Design preference sync rollout and QA checklist

Design preference sync uses backend merge at `POST /api/design-preferences/sync/`.

## Rollout

1. **Dev** — run backend + frontend against `POST /api/design-preferences/sync/`.
2. **Internal** — enable on staging and smoke-test modules in the mapping doc.
3. **Staging** — soak with designers and monitor errors/401/500 on sync endpoint.
4. **Production** — roll out gradually (subset of users or env-scoped) until sign-off.

## Per-module checks

- [ ] Change **input dock** driving material and verify dependent preference material fields and detail readouts.
- [ ] **Open** Additional Inputs with loading state while sync runs.
- [ ] **Save** applies tab draft and invalidates prior design/CAD/report outputs.
- [ ] **Defaults** uses backend reset (`operation: reset`) and updates main inputs.
- [ ] Rapid dock changes avoid out-of-order UI updates (abort + latest wins).
- [ ] Disconnect network triggers rollback and clear error while keeping modal consistent.
