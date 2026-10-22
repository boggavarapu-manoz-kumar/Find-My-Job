-- V8__add_advanced_production_performance_indexes.sql
-- Optimizes all public filtering, sorting, and lookup operations down to O(log N) index seeks.

-- 1. Optimizes getPublicJobBySlug (lookup by slug and status)
CREATE INDEX idx_jobs_slug_status ON jobs (slug, status);

-- 2. Optimizes public listing sorted by publishedAt DESC with status filter
CREATE INDEX idx_jobs_status_published_desc ON jobs (status, published_at DESC, id DESC);

-- 3. Optimizes Work Mode filtering combined with status & publishedAt
CREATE INDEX idx_jobs_status_workmode_published ON jobs (status, work_mode, published_at DESC);

-- 4. Optimizes Employment Type filtering combined with status & publishedAt
CREATE INDEX idx_jobs_status_type_published ON jobs (status, employment_type, published_at DESC);

-- 5. Optimizes Experience Level filtering combined with status & publishedAt
CREATE INDEX idx_jobs_status_exp_published ON jobs (status, experience_level, published_at DESC);

-- 6. Optimizes Fresher eligibility filtering combined with status & publishedAt
CREATE INDEX idx_jobs_status_fresher_published ON jobs (status, fresher_eligible, published_at DESC);

-- 7. Optimizes Related Jobs query (status, category, id)
CREATE INDEX idx_jobs_status_category_id ON jobs (status, category, id, published_at DESC);
