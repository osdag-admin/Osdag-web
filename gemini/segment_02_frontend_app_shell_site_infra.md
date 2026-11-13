# Segment 2 Review Report: Frontend App Shell & Site Infrastructure

**Reviewer:** Gemini (Google DeepMind)  
**Date:** July 31, 2026  
**Scope:** `frontend/package.json`, `vite.config.js`, `main.jsx`, `App.jsx`, `src/Auth/`, `src/context/`, `src/utils/`, `src/datasources/`, `src/components/` (~9.6K LOC)  
**Goal:** Code audit to identify security red flags, routing flaws, authentication gaps, state leaks, and offline build blockers without modifying application source code.

---

## 1. Executive Summary

Segment 2 covers the React 19 + Vite app shell, routing infrastructure, authentication contexts, global state management providers, custom API client handlers with token auto-refresh, task status WebSocket/polling adapters, and core site components.

The app shell exhibits modern architecture (React 19, Vite proxying, automatic Firebase token refresh, dual WebSocket/HTTP polling fallback). However, we identified **hardcoded client credentials, incomplete route protection guards, unhandled offline CDN dependencies, and redundant state properties** that affect production readiness and security.

---

## 2. 🚨 Critical Red Flags & Configuration Flaws

| Severity | File Location | Issue Description | Risk Level |
| :--- | :--- | :--- | :--- |
| **HIGH** | `frontend/src/Auth/firebase.js` | Firebase API keys and project config are hardcoded in source code (`apiKey: "AIzaSyA7jWya..."`). | 🟠 **HIGH** |
| **HIGH** | `frontend/src/App.jsx` L126 | PDF Viewer worker script is loaded directly from external unpkg CDN (`https://unpkg.com/pdfjs-dist@3.4.120/...`). | 🟠 **HIGH** |
| **MEDIUM** | `frontend/src/App.jsx` L73 | Dead code & unused state: `let loggedIn = false` hardcoded and passed to `<Root loggedIn={loggedIn} />`, where `Root` ignores it. | 🟡 **MEDIUM** |
| **MEDIUM** | `frontend/src/components/ProjectAuthGuard.jsx` | Guests are allowed full access to all `/design/...` module routes without any login barrier. | 🟡 **MEDIUM** |

### Detailed Analysis:
1. **Hardcoded Firebase Configuration (`src/Auth/firebase.js`):**
   - Storing API keys directly in source code prevents environment switching (e.g. `dev` vs `staging` vs `prod`).
   - *Recommendation:* Replace with `import.meta.env.VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.
2. **External Unpkg CDN Dependency (`src/App.jsx:126`):**
   - PDF rendering depends on fetching worker scripts from `unpkg.com`. In offline environments, corporate intranets, or air-gapped deployments, PDF report previews will completely fail.
   - *Recommendation:* Bundle `pdf.worker.min.js` locally in `public/` or import directly from `pdfjs-dist/build/pdf.worker.entry`.

---

## 3. Routing & Authentication Protection Audit

### Findings in `App.jsx` & `ProjectAuthGuard.jsx`:
1. **Unprotected Design Routes:**
   - `ProjectAuthGuard` only checks if a user is a guest **AND** specifies a `projectId` in the URL (line 19: `if (projectId && isGuest)`), stripping `projectId`.
   - If a guest accesses `/design/Connection/shear/fin_plate`, they bypass authentication entirely. If guest access is intentional, guest limits should be explicitly scoped.
2. **Route Fragmentations & Duplications:**
   - In `App.jsx`, several routes have duplicate path signatures with hyphens vs underscores:
     - `/design/:designType/tension-member/bolted_to_end_gusset/:projectId?`
     - `/design/:designType/tension_member/bolted_to_end_gusset/:projectId?`
   - *Recommendation:* Standardize route paths using a single URL naming convention (e.g. kebab-case) and issue redirects for legacy aliases.

---

## 4. API Client & Async Task Execution Engine (`apiClient.js`)

### Strengths:
- Automatic token injection via `getAccessToken()`.
- HTTP 401 interceptor automatically calls `getAccessToken(true)` for forced token refresh and retries the failed request once before signing out.
- `subscribeToTask(taskId)` implements a resilient dual-mode strategy: connects via WebSocket first, and gracefully falls back to HTTP polling `pollTask()` if the socket closes cleanly or fails retries.

### Vulnerabilities & Edge Cases:
1. **Unbounded Polling Timeout in `pollTask()`:**
   - `pollTask` polls every 1000ms up to 300 retries (5 minutes). If a backend task encounters an uncaught deadlock or hangs without emitting `FAILURE`, the client floods the server with 300 HTTP GET requests.
   - *Recommendation:* Implement exponential backoff (e.g., 1s → 2s → 4s) up to a max interval.

---

## 5. State Management Architecture (`GlobalState.jsx` & `ModuleState.jsx`)

1. **State Inflation in `ModuleState.jsx`:**
   - `ModuleContext` holds over 40 top-level state fields (lists for bolts, beams, columns, angles, welds, design logs, CAD paths, design preferences, and report IDs).
   - Any dispatch to `ModuleReducer` triggers re-renders across all child components consuming `useContext(ModuleContext)`.
   - *Recommendation:* Split `ModuleContext` into distinct sub-contexts (e.g., `ModuleOptionsContext`, `DesignResultsContext`, `CadContext`).
2. **Clean Memory Management in CSV Export:**
   - In `generateReport('csv', ...)` (`ModuleState.jsx:374`), `URL.createObjectURL(blob)` and `URL.revokeObjectURL(url)` are handled properly to prevent browser memory leaks.

---

## 6. Recommendations & Action Items Matrix

| Category | Finding / Vulnerability | Recommended Fix | Impact |
| :--- | :--- | :--- | :--- |
| **Security** | Hardcoded Firebase config in `firebase.js`. | Move to `import.meta.env.VITE_FIREBASE_*`. | **High** |
| **Offline Support** | External CDN link for PDF worker in `App.jsx`. | Bundle PDF worker script locally in `public/`. | **High** |
| **Auth Guard** | Unauthenticated guests can access `/design/...` forms. | Explicitly enforce guest mode restrictions in `ProjectAuthGuard`. | **Medium** |
| **Performance** | Fixed 1-second interval HTTP task polling. | Switch to exponential backoff polling in `apiClient.js`. | **Medium** |
| **Code Cleanup** | Dead `loggedIn` prop in `App.jsx` and duplicate route paths. | Remove dead code and unify route path constants in `routePaths.js`. | **Low** |

---

*Report generated by Gemini for Osdag-web Segment 2 code review.*
