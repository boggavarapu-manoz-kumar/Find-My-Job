-- V10__create_companies_and_associate_jobs.sql
-- Creates reusable company identity entity and links existing jobs

CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    normalized_name VARCHAR(120) NOT NULL,
    slug VARCHAR(160) NOT NULL,
    logo_asset_id VARCHAR(100) NULL,
    logo_public_id VARCHAR(255) NULL,
    logo_url VARCHAR(500) NULL,
    logo_alt_text VARCHAR(255) NULL,
    website_url VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_companies_normalized_name UNIQUE (normalized_name),
    CONSTRAINT uk_companies_slug UNIQUE (slug),
    INDEX idx_companies_name (name)
);

-- Safely add company_id to jobs table if not present
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name   = 'jobs'
      AND column_name  = 'company_id'
);
SET @sql_col = IF(@col_exists = 0,
    'ALTER TABLE jobs ADD COLUMN company_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- Add index on jobs.company_id
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name   = 'jobs'
      AND index_name   = 'idx_jobs_company_id'
);
SET @sql_idx = IF(@idx_exists = 0,
    'CREATE INDEX idx_jobs_company_id ON jobs (company_id)',
    'SELECT 1'
);
PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Backfill distinct companies from existing jobs
INSERT IGNORE INTO companies (name, normalized_name, slug, logo_url, created_at, updated_at)
SELECT 
    MIN(j.company) AS name,
    LOWER(TRIM(j.company)) AS normalized_name,
    LOWER(REPLACE(REPLACE(REPLACE(TRIM(j.company), ' ', '-'), '.', ''), ',', '')) AS slug,
    MAX(j.company_logo) AS logo_url,
    NOW(),
    NOW()
FROM jobs j
WHERE j.company IS NOT NULL AND TRIM(j.company) != ''
GROUP BY LOWER(TRIM(j.company));

-- Backfill company_id foreign reference on existing jobs
UPDATE jobs j
JOIN companies c ON LOWER(TRIM(j.company)) = c.normalized_name
SET j.company_id = c.id
WHERE j.company_id IS NULL;
