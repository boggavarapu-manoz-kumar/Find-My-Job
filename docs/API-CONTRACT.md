# API Contract Specification

Base URL: `/api/v1`

All responses follow a consistent JSON envelope format defined by `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-10-17T18:12:59Z"
}
```

Validation Error Envelope (HTTP 400 Bad Request):
```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "errors": {
    "title": "Title cannot be blank",
    "email": "Email must be valid"
  },
  "timestamp": "2026-10-17T18:12:59.609160Z"
}
```

---

## 1. System Health & Probes

### `GET /api/v1/health`
Checks backend and live database connectivity status and reports product version.
- **Access**: Public
- **Response (200 OK)**:
```json
{
  "status": "UP",
  "service": "job-platform-backend",
  "timestamp": "2026-10-17T18:11:46.818418200Z",
  "components": {
    "database": {
      "status": "UP",
      "product": "MySQL",
      "version": "8.0.45"
    }
  }
}
```

---

## 2. Security & Endpoint Authorization Rules

| Path Pattern | Method | Access Level | Description |
|---|---|---|---|
| `/api/v1/health/**` | `GET` | **Public** | System status & DB probe |
| `/actuator/**` | `GET` | **Public** | Actuator metrics & health |
| `/api/v1/public/**` | `GET`, `POST` | **Public** | Job discovery, search, view |
| `/api/v1/auth/**` | `POST` | **Public** | Admin authentication (Sprint 2) |
| `/api/v1/admin/**` | `ALL` | **ADMIN Role Required** | Protected admin endpoints (403 if unauthenticated) |

---

## 3. CORS Configuration

CORS policies are driven strictly by the `app.cors.allowed-origins` configuration setting (e.g. `http://localhost:5173,http://localhost:3000`).
- **Allowed Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- **Allowed Headers**: `Authorization, Content-Type, X-Requested-With, Accept, Origin`
- **Exposed Headers**: `Authorization, Link, X-Total-Count`
- **Allow Credentials**: `true`
- **Pre-flight Max Age**: `3600` seconds (1 hour)
