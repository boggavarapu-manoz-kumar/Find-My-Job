# SPRINT 8 — SEO DEPLOYMENT & VERIFICATION CHECKLIST
**Platform:** Find My Job  
**Canonical Domain:** https://findmyjob.site  
**Preferred Host:** https://findmyjob.site  

---

## 1. Google Search Console Verification Steps

1. **Add Property in Search Console**:
   - Go to [Google Search Console](https://search.google.com/search-console).
   - Choose **Domain** property type.
   - Enter indmyjob.site.

2. **DNS Verification via TXT Record**:
   - Copy the verification TXT token provided by Google (e.g. google-site-verification=...).
   - Log into your DNS management provider (Cloudflare, Namecheap, GoDaddy, Hostinger, etc.).
   - Add a DNS TXT Record:
     - **Type**: TXT
     - **Name / Host**: @ (or indmyjob.site)
     - **Value**: The Google verification string.
     - **TTL**: Auto or 300 seconds.
   - Click **Verify** in Search Console.

3. **Submit Dynamic XML Sitemap**:
   - Navigate to **Sitemaps** in the left menu.
   - Enter sitemap.xml under *Add a new sitemap*.
   - Verify that status shows **Success** and total discovered URLs matches active published positions.

4. **URL Inspection & Rich Results Test**:
   - Test key indexable routes:
     - https://findmyjob.site/
     - https://findmyjob.site/jobs
     - https://findmyjob.site/categories
     - https://findmyjob.site/about
     - https://findmyjob.site/jobs/{active-job-slug}
   - Open [Google Rich Results Test](https://search.google.com/test/rich-results) and test a published job URL.
   - Confirm **JobPosting** structured data is detected with valid fields (	itle, hiringOrganization, jobLocation, datePosted, directApply).

---

## 2. Server & DNS Canonicalization Rules

1. **HTTPS Enforcement**:
   - Ensure all HTTP traffic redirects with status 301 Moved Permanently to https://findmyjob.site/.
2. **WWW to Non-WWW Canonicalization**:
   - Direct https://www.findmyjob.site/* -> https://findmyjob.site/* via 301 Redirect.
3. **CORS Configuration**:
   - Set environment variable CORS_ALLOWED_ORIGINS=https://findmyjob.site on backend deployment.
4. **JWT & Security Secrets**:
   - Ensure JWT_SECRET is set securely via production environment variable.
5. **Robots.txt & Sitemap Availability**:
   - Verify https://findmyjob.site/robots.txt returns HTTP 200 with:
     `
     User-agent: *
     Allow: /
     Disallow: /admin/
     Disallow: /candidate/
     Disallow: /api/
     Sitemap: https://findmyjob.site/sitemap.xml
     `

---

## 3. SEO Verification Status Matrix

| Requirement | Implementation Details | Status |
|---|---|---|
| **Branded Document Titles** | Pattern: {Page Title} \| Find My Job on all routes | **PASS** |
| **Meta Descriptions** | Unique, informative descriptions on all public routes | **PASS** |
| **Canonical Link Tags** | Self-referencing HTTPS tags to https://findmyjob.site{path} | **PASS** |
| **Robots Directives** | index, follow on public; 
oindex, nofollow on private & 404 | **PASS** |
| **Robots.txt** | Deployed in rontend/public/robots.txt | **PASS** |
| **Dynamic XML Sitemap** | Database-backed /sitemap.xml querying published jobs | **PASS** |
| **Google JobPosting Schema** | Schema.org JSON-LD dynamically injected into <head> | **PASS** |
| **BreadcrumbList Schema** | Nested breadcrumbs JSON-LD on job detail pages | **PASS** |
| **Open Graph & Twitter Cards** | Standardized social cards on all public pages | **PASS** |
| **Automated Test Coverage** | Vitest unit tests + Spring Boot MockMvc tests pass | **PASS** |
| **Google Search Console Verification** | Requires DNS access on live domain | **READY FOR DEPLOYMENT** |
| **Live Rich Results Test** | Requires live public URL accessible to Googlebot | **READY FOR DEPLOYMENT** |