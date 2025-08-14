
# Mini-Data Insights Dashboard

## Version 0.1.0 – 27 Jul 2025

A production-grade reference implementation of a modern web platform: a public marketing site powered by a headless CMS, plus a subscriber-only data explorer built with Next.js and a Node back end. The goal is both educational and portfolio-ready; every commit should be handover-quality and cloud-agnostic.

---

## 1. Executive Summary (Non-Technical)

**What it is:**  
A two-part product consisting of a public marketing site and a subscriber-only explorer populated with up-to-date macro-economic indicators and forecasts.

**Who it’s for:**  

- Marketing & Sales to showcase content, landing pages, and lead capture.  
- Subscribers to interactively explore, visualize, and download datasets.  
- Engineering & Data teams to extend features without vendor lock-in.

**Why it matters:**  
This project demonstrates an end-to-end, cloud-agnostic stack with clean code, thorough documentation, and clear upgrade paths—ideal as a portfolio piece or as a blueprint for real-world delivery.

---

## 2. Technical Overview

| Layer        | Technology                                  | Why this choice? |
|--------------|---------------------------------------------|------------------|
| UI / SSR     | Next.js 14 (App Router, TypeScript)         | Industry-standard React meta-framework, built-in SEO, route handlers for APIs |
| Styling      | Tailwind CSS 3                              | Utility-first, design-system ready, minimal CSS bundle |
| CMS          | Headless WordPress 6                        | Empowers non-technical editors via Gutenberg, zero license cost |
| Internal API | Fastify (Node 18 + TS)                      | Ultra-fast, plugin ecosystem, easy migration to serverless |
| ETL Jobs     | FastAPI (Python 3.11)                       | Async endpoints + background tasks, perfect for cron-like ingestion |
| Data         | PostgreSQL 15, Redis                        | Open-source, ACID compliance, first-class Docker images |
| Dev & CI     | GitHub Actions, Docker, ESLint, Prettier, Jest, Lighthouse CI | Continuous quality gates and reproducible local environments |
| Cloud (opt.) | Azure App Service + Functions + DB Flexible Server | Documented in `docs/Azure-Blueprint.md` |

---

## 3. Architecture Diagram

A live Mermaid C4 diagram lives in `docs/architecture.md`. It illustrates:

- User ↔ Next.js (SSR/ISR)
- Next.js ↔ Fastify API ⇄ PostgreSQL/Redis
- Next.js & API ↔ WordPress (REST/GraphQL)
- FastAPI ETL → PostgreSQL

---

## 4. Project Structure

```
/ (repo root)
 ├─ apps/
 │   ├─ frontend/         # Next.js
 │   ├─ backend/          # Fastify
 │   └─ etl/              # FastAPI jobs
 ├─ cms/                  # WordPress plugin & theme
 ├─ infra/                # IaC (future Azure or any cloud)
 ├─ docs/                 # Architecture, ADRs, runbooks, blueprints
 ├─ .github/workflows/    # CI pipelines (lint, test, build)
 ├─ docker-compose.yml    # Local dev stack
 └─ package.json          # Monorepo scripts via npm workspaces
```

---

## 5. Quick-Start for Developers

### 5.1 Prerequisites

- Node 18+ (`nvm install 18`)min
- npm 9+ (monorepo workspaces enabled)
- Python 3.11
- Docker Desktop (Compose v2)

### 5.2 Clone & Bootstrap

```bash
git clone https://github.com/vbchivu/headless-cms.git
cd <your-repo>
npm install
npm run docker:init
npm run dev
```

Visit `http://localhost:3000` to see the landing page.  
Run `npm run lint` and `npm run test` to ensure a green baseline.

> **First-run note:** The WordPress CMS isn’t required until Sprint 2; its plugin/theme will be mounted via `cms/`.

---

## 6. Development Workflow

- Branch naming: `feature/*`, `fix/*`, `chore/*`
- Conventional Commits (e.g., `feat:`, `fix:`) enforce semantic versioning
- Pre-commit hooks: `lint-staged` runs ESLint + Prettier
- PR template requires screenshot/Lighthouse diff and “I read the docs” checkbox
- CI (`lint.yml`) blocks merge on lint/format/unit tests

---

## 7. Code Quality & Testing

| Area        | Tool                          | Command              |
|-------------|-------------------------------|----------------------|
| Linting     | ESLint (airbnb/next)          | `npm run lint`       |
| Formatting  | Prettier                      | `npm run format`     |
| Unit tests  | Jest (+ @testing-library)     | `npm test`           |
| API tests   | Supertest                     | `npm run test:api`   |
| E2E tests   | Playwright (optional)         | `npm run test:e2e`   |
| Performance | Lighthouse CI                 | `npm run lhci`       |

> Coverage target: ≥ 80 % backend & ETL, 60 %+ frontend components.

---

## 8. Documentation & Runbooks

| Doc                        | Purpose |
|----------------------------|---------|
| `docs/architecture.md`     | C4 diagrams, sequence diagrams, data-flow |
| `docs/adr/*`               | Architecture Decision Records (ADR-0001 …) |
| `docs/runbooks/*`          | How to deploy, rollback, restore DB |
| `docs/Azure-Blueprint.md`  | Optional cloud migration guide & cost |

> All docs render in GitHub & VS Code. Diagrams use Mermaid.

---

## 9. Deployment Strategy

- **Local:** Docker Compose for DB/cache, `npm run dev` for apps  
- **Cloud-agnostic:** Container images (`ghcr.io/<org>/frontend`, `.../api`, `.../etl`)  
- **Azure path:** See blueprint. AWS & GCP notes coming in `ADR-0002`

---

## 10. Roadmap (6 Sprints)

| Sprint | Theme            | Milestones                                      |
|--------|------------------|--------------------------------------------------|
| 0      | Design & Setup   | Repo, CI, ADR-1, architecture doc (✅)           |
| 1      | Landing Page     | Next.js scaffold, Tailwind, Docker Compose (⏳)  |
| 2      | Headless CMS     | WP theme & plugin, REST/GraphQL endpoint         |
| 3      | Auth & API       | Fastify CRUD, JWT, Prisma migrations             |
| 4      | Data & Dashboards| Python ETL, charts, SWR, perf ≥ 90               |
| 5      | Polish & Docs    | Accessibility, SEO schema, demos, handover       |

---

## 11. Onboarding Checklist (30-min ramp-up)

1. Clone repo & run `npm install`  
2. Copy `.env.example` → `.env.local` and adjust ports if needed  
3. Start Docker services: `npm run docker:init`  
4. Run `npm run dev` (all apps hot-reload)  
5. Read `docs/architecture.md` & `ADR-0001`  
6. Pick an open issue, create a feature branch, push a PR  

> **Goal:** ≤ 30 minutes to first green test

---

## 12. Coding Standards

- Conventional Commits (`feat:`, `fix:`, `docs:` …)  
- Pre-commit hooks: lint-staged, ESLint, Prettier, type-check  
- PR template with checklist (tests, docs, screenshot, Lighthouse diff)  
- 90 %+ unit-/integration-test coverage on critical paths

---

## 13. License & Attribution

MIT © 2025 Vlad Chivu  
Economic data from the [World Bank API](https://data.worldbank.org) (CC BY-4.0)
