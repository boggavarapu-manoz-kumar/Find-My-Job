# Production Environment Variables Guide

This document lists all environment variables required for deploying the **Find My Job** application across Render (Backend) and Vercel (Frontend).

---

## 1. Backend Service (Render - Web Service)

### Service Details:
- **Environment**: Java / Docker or Native Maven
- **Root Directory**: `backend`
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/backend-1.0.0.jar`

### Environment Variables:

| Variable Name | Required | Sample / Value | Description |
| :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | **YES** | `prod` | Activates production configuration profile (`application-prod.yml`). |
| `SPRING_DATASOURCE_URL` | **YES** | `jdbc:mysql://<host>:<port>/<dbname>?useSSL=true&requireSSL=true` | Cloud MySQL connection URL (e.g. from Aiven or Railway). |
| `SPRING_DATASOURCE_USERNAME` | **YES** | `avnadmin` | Database username. |
| `SPRING_DATASOURCE_PASSWORD` | **YES** | `(Your Strong Cloud DB Password)` | Database password. |
| `JWT_SECRET` | **YES** | `(64+ character random hex or alphanumeric)` | Cryptographic secret for signing JWTs. Validated at startup. |
| `JWT_EXPIRATION_MS` | NO | `86400000` | Token expiration in ms (defaults to 24 hours). |
| `CORS_ALLOWED_ORIGINS` | **YES** | `https://findmyjob.site,https://www.findmyjob.site` | Allowed origins for cross-origin API calls. |
| `APP_ADMIN_BOOTSTRAP_PASSWORD` | NO | `(Your Secure Admin Password)` | Password for default admin account bootstrap. |
| `APP_ADMIN_BOOTSTRAP_ENABLED` | NO | `true` | Whether to seed initial admin user if none exists. |
| `PORT` | NO | `8080` (Automatically set by Render) | Port Render binds to. |

---

## 2. Frontend Application (Vercel)

### Project Details:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables:

| Variable Name | Required | Sample / Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **YES** | `https://<your-render-backend-name>.onrender.com/api/v1` | URL pointing to your Render backend API v1 root. |

---

## 3. Production Readiness Verifications Performed

1. **SPA Deep-Links (`vercel.json`)**: Configured rewrite rules so `/jobs/:slug` and other direct routes do not 404 on refresh.
2. **Database Connection Pooling**: Optimized HikariCP max pool size to 5 and min idle to 2 to operate smoothly within free-tier limits (e.g., Aiven free tier ~5 connections).
3. **Startup Security Validation**: Added `SecurityConfigValidator` which stops production startup if default dev JWT secret or blank key is used.
4. **CORS Handling**: Dynamic origin support matching `https://findmyjob.site`.
