## Osdag Web Client – Improvements Roadmap

This document lists potential improvements for the `frontend` frontend, with **priority** and **difficulty** levels to help plan work.

### Legend
- **Priority**: P0 (critical), P1 (high), P2 (medium), P3 (low)
- **Difficulty**: E (easy), M (medium), H (hard)

---

### 1. Authentication & Token Handling

- **Unify token storage and helpers**
  - **Notes**: `UserState.jsx` uses raw `localStorage` keys (`access`, `refresh`, `userType`, etc.) while `utils/auth.js` defines helpers (`setTokens`, `getAccessToken`, `clearTokens`, `isAuthenticated`, etc.). Centralizing on the helper functions will reduce duplication and subtle bugs.
  - **Priority**: P1
  - **Difficulty**: M

- **Fix minor inconsistencies in token naming**
  - **Notes**: `refreshJWTToken` sets `localStorage.setItem("access", jsonResponse.access_token);` but response is logged as `jsonResponse.access`. Ensure consistent property names and use `setTokens` to avoid typos.
  - **Priority**: P1
  - **Difficulty**: E

- **Reduce verbose console logging for auth flows**
  - **Notes**: `UserState.jsx` logs sensitive-ish data (e.g. tokens, passwords in dev) and very verbose messages. Replace with guarded, structured logging or a dedicated logger, and avoid logging passwords entirely.
  - **Priority**: P1
  - **Difficulty**: E

---

### 2. Global & Module Contexts

- **Avoid mutating `initialValue` in `GlobalState.jsx`**
  - **Notes**: `getDesignTypes` writes to `initialValue.fetch_cache`. This is a shared constant and can lead to subtle bugs if multiple providers are ever created. Move cache into reducer state or a `useRef`.
  - **Priority**: P1
  - **Difficulty**: M

- **Remove or gate noisy debug logs in `ModuleState.jsx`**
  - **Notes**: `createCADModel` logs many debug lines (`[cadissue] ...`) which are helpful in development but noisy in production. Wrap them behind a debug flag or remove them.
  - **Priority**: P2
  - **Difficulty**: E

- **Gradually remove deprecated legacy functions in `ModuleState.jsx`**
  - **Notes**: There is a large compatibility section with deprecated functions wrapped around the new 8-core API. Plan a deprecation strategy: find all call sites, migrate to the new API, then delete the wrappers.
  - **Priority**: P2
  - **Difficulty**: H (requires cross-module refactor)

---

### 3. `BaseInputDock` UX & Implementation

- **Replace direct DOM tooltip creation with React-based tooltip**
  - **Notes**: The lock overlay click handler creates and manages a tooltip using `document.createElement` and manual DOM operations. This bypasses React and can be harder to maintain. Implement a small React tooltip component or use a UI library instead.
  - **Priority**: P2
  - **Difficulty**: M

- **Extract lock-overlay logic into a reusable hook or component**
  - **Notes**: The overlay handles zoom animation, tooltip positioning, and click blocking in one inline callback. Extracting this to a hook/component will improve testability and readability.
  - **Priority**: P3
  - **Difficulty**: M

- **Use stable keys for `InputSection` instead of `index`**
  - **Notes**: Currently `key={index}` is used when mapping `moduleConfig.inputSections`. Prefer a stable identifier from `section` (e.g. `section.id` or `section.name`) to avoid unnecessary remounts and state issues when the list changes.
  - **Priority**: P2
  - **Difficulty**: E

---

### 4. Routing & Entry Points

- **Remove unused `renderedOnce` from `App.jsx`**
  - **Notes**: The variable `let renderedOnce = false;` is declared but not used. Clean it up to avoid confusion.
  - **Priority**: P3
  - **Difficulty**: E

- **Add route-level error boundaries**
  - **Notes**: Current router setup has no errorElement / error boundary for routes. Adding error boundaries improves resilience when a module fails to render.
  - **Priority**: P2
  - **Difficulty**: M

---

### 5. API & Network Layer

- **Normalize API error handling**
  - **Notes**: Different contexts use slightly different patterns (some `console.error`, some dispatch error messages, some silent). Introduce a shared error helper (e.g. `handleApiError`) and consistent error messages surfaced to the UI.
  - **Priority**: P1
  - **Difficulty**: M

- **Consider moving repeated `fetch`/`axios` logic into a thin API client**
  - **Notes**: Many files manually construct URLs (`${BASE_URL}api/...`) with similar options (`mode: "cors", credentials: "include"`). A shared client wrapper would reduce duplication and centralize cross-cutting concerns (auth headers, retries, logging).
  - **Priority**: P2
  - **Difficulty**: M

---

### 6. Type Safety & Maintainability

- **Adopt JSDoc or TypeScript gradually for complex contexts**
  - **Notes**: Contexts like `ModuleState.jsx` and `UserState.jsx` expose many functions and state fields. Adding lightweight typing (JSDoc now, TS later) will make it easier to work safely on these modules.
  - **Priority**: P3
  - **Difficulty**: H (if converting to TS), M (if only adding JSDoc)

- **Document public context APIs**
  - **Notes**: Add README-style docs or inline comments for the 8-core module API and user context thunks so new contributors know which functions are stable and which are deprecated.
  - **Priority**: P2
  - **Difficulty**: E

---

### 7. General Code Hygiene

- **Run eslint and clean up unused variables/imports**
  - **Notes**: There are a few unused variables (e.g. `renderedOnce`), and likely more across modules. Regular linting keeps the codebase tidy and reduces dead code.
  - **Priority**: P2
  - **Difficulty**: E

- **Standardize logging style**
  - **Notes**: Logging is a mix of plain `console.log`, prefixed tags, and verbose text. Decide on a standard (e.g. `[User]`, `[Module]`, `[CAD]`) and keep logs concise; consider stripping logs in production builds.
  - **Priority**: P3
  - **Difficulty**: E

---

### 8. Keys, Slugs & Centralized UI Strings

- **Use centralized UI strings for module and connection labels**
  - **Notes**: Labels like "Simple Connections", "Shear Connection", "Fin Plate", "End Plate" etc. are hardcoded in multiple places (e.g. `constants/modules.js`, homepage components). These should come from `UI_STRINGS` to ensure consistency and make global renames easy. Initial refactor done in `constants/modules.js`; remaining call sites can be migrated gradually.
  - **Priority**: P1
  - **Difficulty**: M

- **Align module keys, slugs, and routes**
  - **Notes**: There are three layers for module identity: module keys in `DesignKeys.js`, API slugs in `apiRoutes.js` (`MODULE_SLUGS`), and route paths in `constants/modules.js` and `App.jsx`. Long term, use module keys as the single source of truth, derive slugs via `getModuleSlug`, and keep all route patterns in `MODULE_ROUTES` to avoid divergent hardcoded paths.
  - **Priority**: P2
  - **Difficulty**: H

---

### 9. State Management & Cleanup ✅ COMPLETED

- **✅ Fixed: ModuleContext state persistence across module switches**
  - **Status**: Fixed - Added module change detection in `EngineeringModule.jsx` that clears `ModuleContext` state when switching between modules
  - **Implementation**: Added `prevModuleRef` to track module changes and clear design/output/CAD state automatically
  - **Files Changed**: `EngineeringModule.jsx`, `useEngineeringModule.js`, `ModuleReducer.jsx`

- **✅ Fixed: No cleanup on component unmount**
  - **Status**: Fixed - Added cleanup effect that clears `ModuleContext` state when `EngineeringModule` unmounts
  - **Implementation**: Added `useEffect` cleanup function that calls `resetModuleState()` on unmount

- **✅ Fixed: Project loading doesn't clear previous design state**
  - **Status**: Fixed - Clear design state before loading project inputs to prevent showing stale results
  - **Implementation**: Modified project loading effect to call `resetModuleState()` and `clearDesignResults()` before loading project data

- **✅ Fixed: RESET_MODULE_STATE doesn't clear hoverDict**
  - **Status**: Fixed - Updated `RESET_MODULE_STATE` reducer action to also clear `hoverDict` (CAD hover tooltips)

- **✅ Fixed: Browser back/forward navigation state persistence**
  - **Status**: Fixed - Module change detection automatically handles route changes (including browser navigation) and clears state

**Edge Cases Now Handled:**
- ✅ Same tab, different module → State cleared automatically
- ✅ Same tab, same module, different project → State cleared automatically  
- ✅ Same tab, same module, new design → State cleared before new design
- ✅ New tab → Works correctly (separate React instance)
- ✅ Browser refresh → Works correctly (fresh state)
- ✅ Browser back/forward → State cleared on module change
- ✅ Direct URL navigation → State cleared on mount if module changed
- ✅ Guest vs authenticated user → State cleared for both user types
- ✅ Component unmount → State cleared on unmount


