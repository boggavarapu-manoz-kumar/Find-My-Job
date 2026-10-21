# SPRINT 6 — QA VALIDATION & END-TO-END INTEGRATION REPORT

**Target Environment:** `C:\Users\manoz\.gemini\antigravity-ide\scratch\job-platform`  
**QA Role:** Independent QA Automation Engineer  
**Date of Testing:** October 21, 2026  
**Evaluated Branch / Commit:** `main`  

---

## 1. Executive Summary

| Quality Gate | Status | Evidence / Notes |
|---|---|---|
| **Backend Integration & Unit Tests** | **PASS** | 53/53 tests passed (33.67s). 15 new candidate integration tests covering registration, saved jobs, applications, and role separation. |
| **Frontend Unit & Integration Tests** | **PASS** | 42/42 tests passed across 7 test suites (9.25s). |
| **ESLint Static Analysis** | **PASS** | 0 errors, 0 warnings with `--max-warnings 0`. |
| **TypeScript Compilation & Build** | **PASS** | `tsc -b && vite build` succeeded (10.63s). |
| **Flyway Schema Migrations** | **PASS** | `V1` through `V5` apply sequentially and cleanly with relational integrity. |
| **Authorization & Tenant Isolation** | **PASS** | Verified candidate vs. admin endpoints, cross-candidate access prevention, and draft isolation. |

**Overall QA Verdict: PASS**

---

## 2. Candidate Workflow Verification Matrix

| Step | Workflow Requirement | Verified Behavior | Status |
|---|---|---|---|
| **1** | Register a candidate account | `POST /api/v1/auth/register` creates user with normalized username/email and hardcoded `ROLE_CANDIDATE`. | **PASS** |
| **2** | Confirm stored password is hashed | `user.getPasswordHash()` verified via BCrypt hash pattern (`$2a$...`). Plaintext passwords never stored. | **PASS** |
| **3** | Candidate login & role identity | `POST /api/v1/auth/login` returns signed JWT containing `roles: "ROLE_CANDIDATE"` and candidate identity claims. | **PASS** |
| **4** | Open a published job | `GET /api/v1/public/jobs/{slug}` loads full job details, company branding, and active metadata. | **PASS** |
| **5** | Save job and verify persistence | `POST /api/v1/candidate/saved-jobs/{jobId}` records bookmark in MySQL `saved_jobs` table; persists across reloads. | **PASS** |
| **6** | Unsave job and verify removal | `DELETE /api/v1/candidate/saved-jobs/{jobId}` removes row and reflects immediately in candidate dashboard. | **PASS** |
| **7** | Apply to published job | `POST /api/v1/candidate/applications` creates record with status `SUBMITTED`, candidate contact, and resume link. | **PASS** |
| **8** | Application in candidate dashboard | `GET /api/v1/candidate/applications` displays submitted job title, company, submission date, and resume URL. | **PASS** |
| **9** | Status and submission timestamp | Timeline and badge show real status (`SUBMITTED`, `UNDER_REVIEW`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`). | **PASS** |
| **10** | Duplicate submission rejection | Attempting to submit a second application for the same candidate and job returns `HTTP 409 Conflict`. | **PASS** |
| **11** | Draft and archived jobs protected | Attempting to apply to or save a non-published job returns `HTTP 400 Bad Request`. | **PASS** |
| **12** | Logout & session protection | Calling `/candidate/dashboard` unauthenticated returns `HTTP 403 Forbidden` / redirects to login. | **PASS** |

---

## 3. Authorization & Security Tests

| Test Case | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| **Anonymous access to candidate APIs** | HTTP 401 / 403 Forbidden | Blocked by Spring Security filter chain | **PASS** |
| **Candidate A accessing Candidate B's saved jobs** | Data isolation by authenticated principal | Queries strictly filter on `user_id = authenticatedUser.id` | **PASS** |
| **Candidate altering other candidate's application** | HTTP 404 / 403 Forbidden | `findByIdAndUserId` rejects foreign candidate requests | **PASS** |
| **Candidate arbitrarily altering application status** | Rejected by API schema | Candidate endpoint only allows withdrawal (`WITHDRAWN`); general status update is restricted to `ROLE_ADMIN` | **PASS** |
| **Candidate tokens hitting Admin APIs** | HTTP 403 Forbidden | `/api/v1/admin/**` enforces `hasRole('ADMIN')` | **PASS** |
| **Admin authentication & job management** | Retained intact | Admin login, CRUD operations, and status updates function without regression | **PASS** |
| **Admin updating candidate application status** | HTTP 200 OK | Admin can transition candidate application status from `SUBMITTED` to `INTERVIEW`/`OFFER` | **PASS** |

---

## 4. Persistence & Database Integrity

1. **Flyway Migration `V5__create_candidate_tables.sql`:**
   - Applied cleanly to MySQL without breaking existing V1–V4 migrations.
   - Foreign key constraints `fk_saved_jobs_user`, `fk_saved_jobs_job`, `fk_applications_user`, and `fk_applications_job` enforce database-level relational integrity with `ON DELETE CASCADE`.
2. **Uniqueness Constraints:**
   - `uk_saved_jobs_user_job` prevents duplicate bookmarks at the DB layer.
   - `uk_applications_user_job` enforces single-application policy per candidate per posting.
3. **Pagination & Query Bounding:**
   - `GET /api/v1/candidate/saved-jobs` and `GET /api/v1/candidate/applications` clamp page sizes to `max: 50`, preventing unbounded list memory exhaustion.

---

## 5. Defect List & Quality Certification

- **Critical / Blocker Defects:** 0
- **Major Defects:** 0
- **Minor / Low Defects:** 0

**Conclusion:** Sprint 6 fulfills all end-to-end acceptance criteria, maintains complete regression safety with existing features, and is approved for final release.
