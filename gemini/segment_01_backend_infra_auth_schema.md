# Segment 1 Review Report: Backend Infra, Auth & Database Schema

**Reviewer:** Gemini (Google DeepMind)  
**Date:** July 31, 2026  
**Scope:** `backend/config/`, `backend/apps/core/`, `backend/apps/sections/` (~11.7K LOC)  
**Goal:** Code audit to identify security red flags, architectural flaws, bugs, performance bottlenecks, and best practice improvements without altering source code.

---

## 1. Executive Summary

Segment 1 forms the core foundation of the Osdag-web application. It handles environment configurations, authentication (Firebase integration), user profile management, structural steel section databases (standard and user-custom), Celery task execution for long-running calculations, real-time WebSocket communication via Django Channels, and InfluxDB metrics collection.

Overall, the architectural layout is well-structured with clean modular separation and strong concurrency protections in user account creation. However, **several critical security vulnerabilities, hardcoded credentials in tracked files, and potential production bottlenecks** require immediate attention.

---

## 2. 🚨 Critical Security Red Flags & Hardcoded Credentials

| Severity | Location | Issue Description | Risk Level |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `backend/config/utils.py` | Hardcoded Outlook email address (`osdagoncloud3@outlook.com`) and **plaintext password** (`osdag.developer`). | 🔴 **CRITICAL** |
| **CRITICAL** | `backend/config/mailing.py` | `send_mail()` prints the plaintext SMTP password directly to standard output (`print('password : ', PASSWORD)`). | 🔴 **CRITICAL** |
| **HIGH** | `backend/config/secret_key.py` | Hardcoded Django fallback secret key in source code (`django-insecure-3hy*...`). | 🟠 **HIGH** |
| **HIGH** | `backend/config/postgres_credentials.py` | Hardcoded database credentials (`osdagdeveloper` / `password`). | 🟠 **HIGH** |
| **MEDIUM** | `backend/config/settings.py` L40, L44 | `DEBUG` defaults to `True` if environment variable is missing, and `ALLOWED_HOSTS` defaults to `['*']`. | 🟡 **MEDIUM** |
| **MEDIUM** | `backend/config/settings.py` L283 | Hardcoded default InfluxDB token (`osdag-super-secret-token`). | 🟡 **MEDIUM** |

### Detailed Findings & Impact:
1. **Exposed Email Credentials (`utils.py` & `mailing.py`):**
   - Storing email credentials in plain text in git repositories poses an immediate security compromise risk. Anyone with read access to the repo has complete control over the application's Outlook account.
   - Printing passwords to stdout logs (`django.log` / Docker stdout) leaks credentials to log aggregators.
2. **Hardcoded Django & Postgres Defaults:**
   - Fallback credentials should be replaced with compulsory environment variable checks or `django.core.exceptions.ImproperlyConfigured` errors in non-development modes.

---

## 3. Authentication & Authorization Architecture Review

### Architecture Overview:
- Authentication uses **Firebase Authentication** on the client side, verified on the backend via Firebase Admin SDK ID tokens (`backend/apps/core/middleware/firebase_auth.py` and `views.py:FirebaseAuthView`).
- `FirebaseAuthentication` verifies the Bearer token, syncs the user to Django's built-in `User` model (using Firebase `uid` as `username`), and updates `UserAccount`.
- Result caching (`cache.set(cache_key, ...)` matching token expiration `exp`) prevents redundant remote Firebase API calls on every request.

### Positives & Good Practices:
- Atomic transactions (`transaction.atomic()`) and `IntegrityError` handling prevent race conditions during concurrent user creation.
- Caching token hashes (`SHA-256`) significantly reduces latency for authenticated API requests.

### Flaws & Potential Bugs:
1. **Firebase Admin SDK Initialization (`views.py:22-40`):**
   - Firebase Admin SDK is initialized inside `views.py` upon module load rather than in `AppConfig.ready()`. If credentials are path-dependent, runtime errors occur on the first request instead of during startup checks.
2. **Double User Sync Code (DRY Violation):**
   - Both `FirebaseAuthView` (in `views.py`) and `FirebaseAuthentication` (in `middleware/firebase_auth.py`) replicate user lookup, creation, and `UserAccount` synchronization logic.
   - *Recommendation:* Refactor user synchronization into a single helper method (e.g., `apps.core.services.sync_firebase_user(decoded_token)`).
3. **`IsEmailVerifiedIfAuthenticated` Permission logic (`permissions.py`):**
   - If an unauthenticated user submits a request, `IsEmailVerifiedIfAuthenticated` returns `True` (allowing guest requests), but if an authenticated user has an unverified email, it returns `False`. Ensure endpoints using this permission explicitly handle guest vs user boundaries safely.

---

## 4. Database Models, Database Schema & Concurrency

### Model Audit (`backend/apps/core/models.py` & `backend/apps/sections/models.py`):
1. **Catalog Tables Schema Design (`Angles`, `Beams`, `Channels`, `Columns`, `RHS`, `SHS`, `CHS`):**
   - Steel section database models use `DecimalField(max_digits=10, decimal_places=2)` for structural properties (`Iz`, `Iy`, `Zz`, `Zy`, `It`, `Iw`).
   - *Issue:* `DecimalField` with 2 decimal places truncates small values (e.g., warping constant `Iw` or torsion constant `It` for small sections can be `< 0.005` or require high precision like `1e-6`). `FloatField` or `DecimalField(max_digits=16, decimal_places=6)` is recommended for engineering calculations.
2. **Column Name Collisions & Inconsistent Field Names:**
   - Table `Angles` has column `lumax` mapped to `db_column='Iumax'` and `lvmin` mapped to `db_column='Ivmin'`, while `EqualAngle` uses `Iu_max` and `Iv_min`. Inconsistent naming across tables requires extra mapping in query adapters.
3. **User-Owned Custom Sections (`apps/sections/models.py`):**
   - Excellent use of `UserOwnedSectionBase` with abstract inheritance and `UniqueConstraint(fields=['user', 'Designation'])`.
   - Soft-delete flag `is_active` is defined, but views must ensure filtered queries default to `is_active=True`.

---

## 5. Celery Tasks, WebSockets & Real-Time Calculation Engine

### Architecture Overview:
- Long-running structural engineering calculations and 3D CAD mesh generation run asynchronously via Celery (`apps.core.tasks.py`).
- Frontend receives live status updates via WebSockets (`apps.core.consumers.py:TaskStatusConsumer` & `PSOOptimizationConsumer`).

### Strengths:
- Dedicated queues (`calculations`, `cad`, `reports`) prevent slow CAD rendering from blocking calculation requests.
- `PSOOptimizationConsumer` implements automatic task revocation on client WebSocket disconnect (`app.control.revoke(task_id, terminate=True)`), successfully preventing zombie Celery tasks when users navigate away.

### Weaknesses & Edge Cases:
1. **Large Task Payload Serialization Risk (`signals.py:L134`):**
   - In `signals.py:on_task_postrun`, results larger than 500 KB are omitted from WebSocket messages. However, if the payload is slightly below 500 KB, sending huge JSON objects through Channel Layers can cause Redis memory spikes.
2. **`clean_temporary_files` Beat Task:**
   - Daily cleanup task removes CAD files older than 24 hours. Consider adding a maximum storage size threshold check in addition to age checks.

---

## 6. Middleware & Observability (InfluxDB / CORS / Silk)

1. **InfluxDB Metrics Middleware (`metrics_middleware.py`):**
   - Non-blocking fire-and-forget background thread dispatch prevents adding HTTP response latency.
   - Clean route tagging logic (`_extract_tags`).
2. **CORS Middleware Order (`settings.py`):**
   - Correctly placed at the very top of `MIDDLEWARE` array.
   - Hardcoded LAN IP addresses (`192.168.1.9:5173`, `10.104.135.9:5173`) in `CORS_ALLOWED_ORIGINS` should be replaced with wildcard dev configuration or environment variables for team development flexibility.
3. **Silk Profiling Middleware (`settings.py`):**
   - `silk` is included in `INSTALLED_APPS` and `MIDDLEWARE`. Ensure Silk is disabled in production environments (`if DEBUG: INSTALLED_APPS += ['silk']`) to prevent high database write overhead for request logs.

---

## 7. Summary & Recommendations Matrix

| Category | Finding / Issue | Proposed Improvement | Impact |
| :--- | :--- | :--- | :--- |
| **Security** | Hardcoded SMTP credentials in `utils.py` & output print in `mailing.py`. | Move credentials to `.env` file, remove password print statements. | **Critical** |
| **Security** | Hardcoded Django secret key fallback in `secret_key.py`. | Enforce requirement of `SECRET_KEY` env var in non-dev modes. | **High** |
| **Architecture** | Replicated Firebase user sync logic in View & Middleware. | Consolidate into `apps.core.services.sync_firebase_user()`. | **Medium** |
| **Database** | 2-decimal precision for engineering constants (`It`, `Iw`). | Upgrade field precision to `DecimalField(16, 6)` or `FloatField`. | **High** |
| **Performance** | Silk profiling enabled unconditionally. | Wrap Silk middleware and app inclusion inside `if DEBUG:` block. | **Medium** |

---

*Report generated by Gemini for Osdag-web Segment 1 code review.*
