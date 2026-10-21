# Performance Baseline Report — Sprint 9

**Date**: 2026-10-21  
**Target Domain**: [https://findmyjob.site](https://findmyjob.site)  
**Backend API**: [https://find-my-job-m7x5.onrender.com](https://find-my-job-m7x5.onrender.com)  
**Test Method**: Sequential non-destructive HTTP requests with system high-resolution stopwatch.

---

## 1. Measured Endpoint Latencies

| URL / Endpoint | HTTP Status | Response Times (ms) | Median Latency (ms) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `https://findmyjob.site/` | `200 OK` | `1124, 700, 584` | **700 ms** | Vercel Edge CDN delivery of initial HTML |
| `https://findmyjob.site/jobs` | `200 OK` | `414, 613, 809` | **613 ms** | SPA route |
| `https://findmyjob.site/categories` | `200 OK` | `493, 291, 1056` | **493 ms** | Static HTML load (before client data fetch) |
| `https://findmyjob.site/about` | `200 OK` | `1963, 545, 936` | **936 ms** | Static HTML load |
| `.../api/v1/health` | `200 OK` | `4326, 1556, 1834` | **1834 ms** | Spring Boot Health indicator (checks DB connection) |
| `.../api/v1/public/jobs?size=6` | `200 OK` | `2919, 2426, 2644` | **2644 ms** | JPA Specification dynamic query + TLS handshake |
| `.../api/v1/public/jobs/featured` | `200 OK` | `3718, 3902, 2329` | **2329 ms** | Featured position query |

---

## 2. Core Diagnosed Bottlenecks

1. **Initial Monolithic JS Bundle**:
   - Initial JS bundle was `505.7 kB` uncompressed. Every route loaded admin dashboards and candidate portals regardless of whether the visitor was an anonymous job seeker.
   - *Fix applied*: Implemented Route-Level Lazy Loading (`React.lazy` + `Suspense`). Main bundle dropped to `424 kB` with discrete on-demand chunks (`AdminDashboardPage`, `CandidateDashboardPage`, `JobDetailPage`).

2. **N+1 API Waterfall on `/categories`**:
   - `CategoriesPage.tsx` previously fired 10 distinct HTTP requests concurrently (`fetchCategoryCount` for each category). On a 0.1 CPU cloud container, 10 concurrent requests queued behind HikariCP, causing severe lag.
   - *Fix applied*: Added `@GetMapping("/categories")` in Spring Boot backed by `countJobsGroupedByCategory` and `@Cacheable(value = "categoryCounts")`. The frontend now fetches all category counts in **1 single aggregated request**!

3. **Backend Memory Caching Missing on Invariant Queries**:
   - The featured positions query was executing fresh SQL on every single landing page visit.
   - *Fix applied*: Enabled Spring Cache `@EnableCaching` with automatic eviction on job updates.

4. **Bot and Abuse Protection**:
   - Added in-memory sliding window rate limiter (`RateLimitingFilter.java`) to ensure single abusive bots cannot monopolize Render's 0.1 CPU thread pool.
