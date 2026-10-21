# System Architecture — CareerForge Job Platform

## 1. High-Level Architecture Overview

The system is designed as a decoupled, production-grade web application:

```
                      +------------------------------------------+
                      |         Web Client (Browser)             |
                      |  React 18 + Vite + TypeScript            |
                      |  Tailwind CSS + Framer Motion + Lucide   |
                      |  React Hook Form + Zod + Axios           |
                      +-------------------+----------------------+
                                          |
                        HTTPS / JSON REST | + JWT Bearer Auth
                                          v
                      +------------------------------------------+
                      |       Spring Boot 3.3.x Backend          |
                      |  - Spring Security (Stateless JWT)       |
                      |  - Spring Data JPA + Hibernate           |
                      |  - Centralized Exception Handler         |
                      |  - Bean Validation + DTO Layer           |
                      |  - Spring Actuator + Custom Health Check |
                      +-------------------+----------------------+
                                          |
                            JDBC / Flyway | Migrations
                                          v
                      +------------------------------------------+
                      |              MySQL 8.0                   |
                      |  - DB: `jobplatform_db`                  |
                      |  - Tables: users, jobs,                  |
                      |    application_clicks, flyway_history    |
                      +------------------------------------------+
```

## 2. Directory & Package Structure

```
job-platform/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/jobplatform/
│       │   │   ├── config/       # Security, CORS, WebMvc, Auditing
│       │   │   ├── controller/   # REST API controllers
│       │   │   ├── service/      # Business logic & transaction boundaries
│       │   │   ├── repository/   # Spring Data JPA repositories
│       │   │   ├── entity/       # JPA entities
│       │   │   ├── dto/          # Request & Response DTOs
│       │   │   ├── exception/    # Custom exceptions & GlobalExceptionHandler
│       │   │   ├── security/     # JWT provider, auth filter, UserDetailsService
│       │   │   └── health/       # Health check controller & probes
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-dev.yml
│       │       ├── application-prod.yml
│       │       └── db/migration/ # Flyway SQL migrations
│       └── test/
│           ├── java/com/jobplatform/
│           └── resources/application-test.yml
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.cjs
│   ├── .env / .env.development
│   └── src/
│       ├── api/          # Axios instance and endpoints
│       ├── components/   # ui/ (Button, Input, Modal) & layout/ (MainLayout)
│       ├── features/     # jobs/ and admin/ feature modules
│       ├── routes/       # React Router setup
│       ├── hooks/        # Custom react hooks
│       ├── types/        # TypeScript interfaces and types
│       └── utils/        # Helper utilities
└── docs/
    ├── ARCHITECTURE.md
    ├── API-CONTRACT.md
    └── SPRINT-STATUS.md
```

## 3. Security Philosophy

1. **Zero Public Administrative Privileges**:
   - Only pre-authenticated administrators can perform modifications.
   - Public visitors have read-only access to published jobs.
2. **Stateless Authentication**:
   - JWT tokens signed with HMAC-SHA256.
   - No sensitive passwords or credentials hardcoded into code.
3. **Database Migration Integrity**:
   - Version-controlled schema migrations through Flyway.
   - Separate development (`application-dev.yml`) and production (`application-prod.yml`) configurations.
