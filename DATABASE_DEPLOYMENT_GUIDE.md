# Database Deployment & Cloud Setup Guide (Free Tier)

This guide covers setting up a cloud MySQL 8 database for **Find My Job** on **Aiven** or **Railway**, and connecting it with your Spring Boot backend on Render.

---

## Option A: Aiven Cloud MySQL (Recommended)

Aiven provides a dedicated free managed MySQL tier with automatic TLS/SSL and daily backups.

### Step 1: Create Account & Service
1. Sign up at [Aiven.io](https://aiven.io/).
2. Click **Create Service**.
3. Select **MySQL** (version 8).
4. Choose the **Free Plan** and a cloud region closest to your users or Render backend (e.g. `aws-us-east-1` or `aws-eu-central-1`).
5. Name your service (e.g., `findmyjob-mysql`) and click **Create Service**.

### Step 2: Retrieve Credentials
Once the service status is **Running**:
1. Go to the **Overview** tab.
2. Note the following parameters:
   - **Host** (e.g., `mysql-xxxx-xxxx.aivencloud.com`)
   - **Port** (e.g., `12345`)
   - **User** (default: `avnadmin`)
   - **Password** (click to copy)
   - **Default Database** (default: `defaultdb`)

### Step 3: Construct the Spring Boot JDBC URL
Use this format with SSL enabled:
```text
jdbc:mysql://<HOST>:<PORT>/<DATABASE>?useSSL=true&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

## Option B: Railway MySQL

1. Sign up at [Railway.app](https://railway.com/).
2. Create a **New Project** -> Select **Provision MySQL**.
3. Click the MySQL container -> Navigate to **Variables** tab.
4. Copy `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE`.
5. Format the JDBC URL:
```text
jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

## Step 4: Flyway Migration Auto-Execution

When the backend starts up with `SPRING_PROFILES_ACTIVE=prod` and the database credentials configured, **Flyway will automatically execute migrations**:
- `V1__init_schema.sql` (Creates users, jobs, applications tables, and indexes)
- `V2__seed_jobs.sql`
- `V3__seo_job_schema_extensions.sql` (Adds SEO metadata, slugs, structured data fields)
- `V4__backfill_seo_fields.sql`
- `V5__seo_performance_indexes.sql`

No manual SQL script execution is required!
