-- V9__optimize_user_auth_lookup.sql
-- Adds a composite covering index for the OR-style username/email auth lookup.
-- The separate idx_users_username and idx_users_email indexes from V1 handle both branches,
-- but this additional explicit covering index helps MySQL choose the right plan for the JPQL OR query.

-- Ensure username index exists (no-op if already created by V1)
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- Ensure email index exists (no-op if already created by V1)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Composite covering index for the auth OR-query:
-- SELECT * FROM users WHERE username = ? OR email = ?
-- MySQL will use idx_users_username or idx_users_email via index-merge, or this covering index
-- to avoid a full-table scan.  Dramatically cuts login latency when user table grows.
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup ON users (username, email, enabled, role, password_hash);
