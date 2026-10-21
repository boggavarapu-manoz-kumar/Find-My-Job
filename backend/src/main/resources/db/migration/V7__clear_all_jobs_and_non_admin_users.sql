-- V7__clear_all_jobs_and_non_admin_users.sql
-- Safely clear all jobs, candidate applications, saved jobs, and non-admin users
-- Preserves administrator accounts (ROLE_ADMIN) for admin panel authentication

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Delete all candidate applications and saved job bookmarks
TRUNCATE TABLE job_applications;
TRUNCATE TABLE saved_jobs;

-- 2. Delete all jobs from the jobs table and reset auto-increment
TRUNCATE TABLE jobs;

-- 3. Delete non-admin candidate users while strictly keeping admin accounts intact
DELETE FROM users WHERE role != 'ROLE_ADMIN';

SET FOREIGN_KEY_CHECKS = 1;
