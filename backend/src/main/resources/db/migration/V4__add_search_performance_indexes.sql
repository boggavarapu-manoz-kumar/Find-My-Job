-- V4__add_search_performance_indexes.sql
-- Optimizing public search query paths for status, publication date, category, and creation date

CREATE INDEX idx_jobs_status_created ON jobs (status, created_at);
CREATE INDEX idx_jobs_status_category ON jobs (status, category);
CREATE INDEX idx_jobs_status_salary ON jobs (status, salary_max);
