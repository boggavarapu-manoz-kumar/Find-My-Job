# SPRINT 8 — TECHNICAL SEO AUDIT REPORT
**Platform:** Find My Job  
**Canonical Domain:** https://findmyjob.site  
**Date of Audit:** October 21, 2026  
**Auditor:** Principal Technical SEO Engineer & Senior Full-Stack Architect  

---

## 1. Executive Summary

This audit assesses the technical SEO health, crawlability, search engine indexing readiness, and Google JobPosting structured data compliance for **Find My Job** (https://findmyjob.site).

The portal is built on a modern decoupling of **React 18 + Vite SPA** on the frontend and **Spring Boot 3 + MySQL 8** on the backend. While the portal features high visual quality, solid security guards, and database-backed job models, it currently exhibits several critical technical SEO deficiencies that would severely restrict search engine discovery, indexing, and rich snippet eligibility if deployed as-is.

### Key Audit Findings & Severity

| Area | Current Status | Severity | Core Issue |
|---|---|---|---|
| **robots.txt** | Missing | CRITICAL | No robots.txt file exists in frontend/public/ or backend endpoints. Crawlers have no sitemap declaration or crawl directives. |
| **sitemap.xml** | Missing | CRITICAL | No dynamic or static XML sitemap exists to enumerate published canonical URLs and lastmod dates. |
| **Document Head & Metadata** | Incomplete | CRITICAL | index.html has a generic hardcoded title. Only JobDetailPage partially updates document title via client-side DOM mutation. Open Graph, Twitter Cards, canonical tags, and page-specific meta descriptions are missing or inconsistent across /, /jobs, /categories, and /about. |
| **Structured Data (JSON-LD)** | Completely Missing | CRITICAL | Zero JobPosting, WebSite, or BreadcrumbList schema markup exists in HTML or JS. The site is currently ineligible for Google Jobs rich results. |
| **Canonical Host URL Strategy** | Unstandardized | HIGH | JobDetailPage uses window.location.href as canonical, which leaks URL query parameters, tracking tokens, and duplicate variations into search engines rather than standardizing on https://findmyjob.site/jobs/{slug}. |
| **Dynamic Sitemap Endpoint** | Absent | CRITICAL | The Spring Boot backend lacks a public /sitemap.xml or /api/v1/public/sitemap endpoint to stream live published job slugs. Without a database-backed endpoint, static sitemaps quickly become stale. |
| **Archived / Inactive Jobs** | Partial 404 / Incomplete SEO State | MEDIUM | Inactive jobs return 404 on API lookup, which correctly prevents leakage, but the UI should offer helpful alternative jobs and avoid referencing archived jobs in sitemaps or structured data. |
| **Client-Side SPA Discovery** | Pure CSR | MEDIUM | Routes rely entirely on client-side rendering. While modern Googlebot parses JavaScript, document meta tags, Open Graph previews for social crawlers, and crawl budgets suffer without pre-populated head and HTML fallbacks. |

---

## 2. Comprehensive Inventory & Architecture Assessment

### 2.1 Public Routes Inventory

| Route | Component | Purpose | Indexable? | Current SEO Readiness |
|---|---|---|---|---|
| / | AuthAwareRoot -> LandingPage | Public showcase & search | Yes | Missing canonical tag, meta description, and WebSite schema. |
| /home | LandingPage | Direct landing page URL | No (Canonicalize to /) | Needs canonical link pointing strictly to https://findmyjob.site/. |
| /jobs | JobListingsPage | Search directory & filters | Yes | Missing canonical URL and meta tags; filter combinations must have clean canonicals. |
| /jobs/:slug | JobDetailPage | Public job posting details | Yes | Title updates in DOM, but missing JobPosting JSON-LD, Breadcrumbs, Open Graph, and strict canonical. |
| /categories | CategoriesPage | High-level disciplines | Yes | Missing dedicated title, meta description, and category breadcrumbs. |
| /about | AboutPage | Platform mission & scope | Yes | Missing dedicated title, meta description, and Organization schema. |
| /candidate/login | CandidateLoginPage | Candidate auth | No (noindex, nofollow) | Should not be indexed in search results. |
| /candidate/register | CandidateRegisterPage | Candidate signup | No (noindex, nofollow) | Should not be indexed in search results. |
| /candidate/* | CandidateDashboardPage | Private candidate actions | No (noindex, nofollow) | Correctly guarded by ProtectedRoute. |
| /admin/* | LoginPage, AdminDashboardPage | Platform management | No (noindex, nofollow) | Correctly guarded by ProtectedRoute and Spring Security. |

---

## 3. Detailed Technical Deficiencies & Planned Solutions

### 3.1 Document Head & Canonical URL Management
- **Problem**: Document titles are currently hardcoded in index.html. Inner pages do not update meta tags when routed.
- **Solution**: Implement a centralized SEOHead component dynamically managing title, meta description, canonical link (anchored to https://findmyjob.site), Open Graph, Twitter Cards, and robots directives.

### 3.2 Dynamic Sitemap & Robots.txt Architecture
- **Problem**: No sitemap exists.
- **Solution**:
  - Add Spring Boot endpoint /api/v1/public/sitemap.xml and /sitemap.xml streaming live published job slugs and timestamps.
  - Create rontend/public/robots.txt referencing Sitemap: https://findmyjob.site/sitemap.xml and disallowing /admin/, /candidate/, and /api/.

### 3.3 Google JobPosting Structured Data (JSON-LD)
- **Problem**: Zero structured data exists on individual job postings.
- **Solution**: Add JobPostingSchema.tsx inside JobDetailPage mapping database fields to Schema.org standards (title, description, hiringOrganization, jobLocation, employmentType, datePosted, validThrough, baseSalary, directApply) with clean cleanup on unmount.

---
