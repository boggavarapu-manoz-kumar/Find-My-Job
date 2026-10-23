# Company Logo Management & Cloudinary Integration Implementation Plan

## 1. Architectural Summary & Audit Findings

### 1.1 Existing System State
- **Entities**: `Job` currently stores `company` (VARCHAR 120) and `companyLogo` (VARCHAR 500) as flat strings.
- **Data Integrity**: Multiple jobs belonging to the same employer duplicate the company name and logo URL. There is no central entity for companies.
- **Frontend Forms**: `JobFormModal.tsx` accepts `company` as a plain text string. There is no company logo input or upload component.
- **Site UI**: `JobCard.tsx` renders a hardcoded `<Building2>` icon rather than displaying company logos. `JobDetailPage.tsx` displays only the text name of the employer.
- **Storage**: No Cloudinary integration exists in the repository.
- **Performance**: In-memory Spring Boot Caffeine cache and client-side multi-tier SWR cache handle job listings and details in sub-millisecond to sub-second latency. Company logo integration must preserve these response times (zero regression).

### 1.2 Target Architecture
- **Single Source of Truth**: Introduce a dedicated `companies` table and `Company` entity.
- **Backward Compatibility**: `jobs.company` (string) and `jobs.company_logo` (string) remain intact and synced. Add `jobs.company_id` (foreign key to `companies.id` with `ON DELETE SET NULL`).
- **Normalized Deduplication**: Company names are normalized (`trim()`, lowercase, normalized spacing) with a unique constraint on `normalized_name`.
- **Cloudinary CDN**: Server-side upload using Cloudinary Java SDK. Secrets (`CLOUDINARY_API_SECRET`) stay strictly in backend environment variables.
- **Optimized Delivery**: Cloudinary CDN URLs include automatic format (`f_auto`), quality (`q_auto`), and dimension bounding (`c_fit,w_XX,h_XX`) to prevent serving multi-megabyte originals for 32px or 64px badges.
- **Zero CLS & Lazy Loading**: Dedicated `<CompanyLogo />` React component with fixed aspect ratio, lazy loading, and monogram fallback for missing logos.

---

## 2. Phase-by-Phase Execution Plan

### Phase 2: Database Schema & Migration
1. Flyway migration `V10__create_companies_and_associate_jobs.sql`:
   - Create `companies` table (`id`, `name`, `normalized_name`, `slug`, `logo_asset_id`, `logo_public_id`, `logo_url`, `logo_alt_text`, `website_url`, `created_at`, `updated_at`).
   - Add unique index on `normalized_name` and `slug`.
   - Add `company_id` column to `jobs` table with index `idx_jobs_company_id`.
   - Backfill existing distinct companies from `jobs` table into `companies` table and link `jobs.company_id`.

### Phase 3: Cloudinary Backend Architecture
1. Add Cloudinary dependency to `backend/pom.xml`.
2. Configure `CloudinaryConfig.java` reading `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Implement `CloudinaryService.java`:
   - Validate file size (max 2 MB), extension, and magic bytes (JPEG, PNG, WebP, SVG).
   - Upload to restricted folder `job-platform/company-logos`.
   - Safe deletion by verified public ID.
   - Graceful fallback when Cloudinary credentials are not configured.

### Phase 4: Company Entity & Services
1. Create `Company.java` entity and `CompanyRepository.java`.
2. Implement `CompanyNormalizer.java` for consistent whitespace/casing normalization.
3. Implement `CompanyService.java` with autocomplete search, creation, and logo association.

### Phase 5: REST API Design
1. `GET /api/v1/public/companies/search?q={query}` (Public, cached, bounded to max 10 results).
2. `GET /api/v1/public/companies/{id}` (Public).
3. `POST /api/v1/admin/companies` (Admin only).
4. `POST /api/v1/admin/companies/{id}/logo` (Admin only, multipart upload).
5. `DELETE /api/v1/admin/companies/{id}/logo` (Admin only).

### Phase 6: Frontend Logo Delivery & Reusable Component
1. Create `CompanyLogo.tsx`:
   - Supports sizes `xs` (24px), `sm` (32px), `md` (48px), `lg` (64px), `xl` (96px).
   - Applies Cloudinary transformation parameters on delivery URLs.
   - Prevents Cumulative Layout Shift (CLS).
   - Accessible alt-text and monogram fallback (e.g. "GO" for Google).

### Phase 7: Admin Company Search & Logo Upload UI
1. Create `CompanyLogoUpload.tsx` supporting:
   - Live debounced company search.
   - Automatic reuse of existing company logo when selected.
   - Drag-and-drop / file picker upload for new company or logo replacement.
   - Progress bar, validation error feedback, replace/remove buttons.
2. Integrate into `JobFormModal.tsx`.

### Phase 8: Site-Wide Logo Integration
1. Update `JobCard.tsx` to render `<CompanyLogo />`.
2. Update `JobDetailPage.tsx` to display company logo in header.
3. Update `CandidateDashboardPage.tsx` saved jobs and applications.

### Phase 9: Verification, Testing & Zero-Regression Validation
1. Unit and integration tests for backend (Company search, logo upload authorization, validation).
2. Unit tests for frontend (`CompanyLogo.test.tsx`, `JobFormModal.test.tsx`).
3. Run full maven test suite and vitest test suite.
4. Verify build and performance metrics.
