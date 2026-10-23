-- V9__optimize_user_auth_lookup.sql
-- Adds a composite covering index for the OR-style username/email auth lookup.
-- The separate idx_users_username and idx_users_email indexes from V1 handle both branches,
-- but this additional explicit covering index helps MySQL choose the right plan for the JPQL OR query.
-- Uses information_schema guard instead of "CREATE INDEX IF NOT EXISTS" for MySQL < 8.0.1 compatibility.

-- Ensure username index exists (no-op if already created by V1)
SET @exists_username = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name   = 'users'
      AND index_name   = 'idx_users_username'
);
SET @sql_username = IF(@exists_username = 0,
    'CREATE INDEX idx_users_username ON users (username)',
    'SELECT 1'
);
PREPARE stmt FROM @sql_username;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure email index exists (no-op if already created by V1)
SET @exists_email = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name   = 'users'
      AND index_name   = 'idx_users_email'
);
SET @sql_email = IF(@exists_email = 0,
    'CREATE INDEX idx_users_email ON users (email)',
    'SELECT 1'
);
PREPARE stmt FROM @sql_email;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Composite covering index for the auth OR-query:
-- SELECT * FROM users WHERE username = ? OR email = ?
-- MySQL will use idx_users_username or idx_users_email via index-merge, or this covering index
-- to avoid a full-table scan.  Dramatically cuts login latency when user table grows.
SET @exists_auth = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name   = 'users'
      AND index_name   = 'idx_users_auth_lookup'
);
SET @sql_auth = IF(@exists_auth = 0,
    'CREATE INDEX idx_users_auth_lookup ON users (username, email, enabled, role, password_hash)',
    'SELECT 1'
);
PREPARE stmt FROM @sql_auth;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
