# Sprint 11: Company Logo Management & Cloudinary Integration Setup Guide

## 1. Overview
The Find My Job platform now features an enterprise-grade **Company Logo Management** system backed by **Cloudinary CDN** and normalized MySQL company data entities.

Key capabilities:
- **Deduplicated Company Entities**: Single source of truth for company logos (`companies` table).
- **Secure Server-Side Cloudinary Upload**: Client uploads directly to Spring Boot backend (`/api/v1/admin/companies/{id}/logo`). Cloudinary API secrets are **never** exposed to the browser.
- **Strict Content Validation**: Magic byte validation (PNG, JPEG, WebP, SVG), 2MB file size limit, and active SVG script/XSS sanitization.
- **Instant CDN Transformation**: Responsive image optimization (`f_auto`, `q_auto`, `c_fit`, Retina 2x sizing) with zero Layout Shift (CLS) and dynamic monogram fallback.
- **Site-Wide Auto-Propagation**: Uploading a logo updates all current and future job listings for that company across the entire directory in one operation.
- **Safe Graceful Fallback**: If Cloudinary environment variables are not supplied, the platform automatically boots up in mock/unconfigured mode without crashing.

---

## 2. Cloudinary Environment Variables

To activate live Cloudinary logo storage in production (Render, Docker, or local), set the following environment variables:

```bash
# Cloudinary CDN Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional customizations (defaults provided in application.yml)
CLOUDINARY_FOLDER=job-platform/company-logos
CLOUDINARY_MAX_FILE_SIZE_BYTES=2097152
```

### Free-Tier Cloudinary Setup (1 Minute)
1. Sign up at [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free).
2. From the Cloudinary Dashboard, copy:
   - **Cloud name** -> `CLOUDINARY_CLOUD_NAME`
   - **API Key** -> `CLOUDINARY_API_KEY`
   - **API Secret** -> `CLOUDINARY_API_SECRET`
3. Add these 3 environment variables to your Render backend service under **Environment Variables**.
4. Trigger deploy or restart the backend service.

---

## 3. Database Migration
Migration `V10__create_companies_and_associate_jobs.sql` executes automatically on Spring Boot boot:
- Creates `companies` table with normalized name unique constraint and slug index.
- Adds `company_id` foreign key column and index `idx_jobs_company_id` to `jobs`.
- Automatically backfills existing distinct company names and links existing jobs.

---

## 4. Admin Workflow & UI Usage
1. Open Admin Dashboard -> **Add Position** or **Edit Position**.
2. Start typing in **Company Name**:
   - Live autocomplete searches existing companies.
   - Selecting a company automatically links `#id` and auto-populates the existing logo with a green checkmark indicator.
3. To upload a new or updated logo:
   - Drag and drop or browse for an image (PNG, JPG, WebP, SVG, max 2MB).
   - The logo is uploaded directly to Cloudinary and cached.
   - If previous logos existed for this company, previous CDN assets are deleted to prevent orphaned files.
4. Save the position: The position and all positions by this company display the high-res CDN logo everywhere on `findmyjob.site`.
