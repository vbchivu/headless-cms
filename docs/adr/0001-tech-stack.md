# ADR‑0001: Technology Stack

*Status: Proposed*  
*Date: 2025‑07‑25*

## Context

FocusEconomics currently outsources its web platform.  
The in‑house rebuild must balance **developer experience**, **performance/SEO**, and **CMS flexibility** for the marketing team.

## Decision

* **Next.js 14 (App Router, TypeScript)** for the public & subscriber UIs  
* **Fastify (Node 18, TypeScript)** for internal APIs – lightweight, high‑perf, easily portable to Azure Functions  
* **WordPress 6.x** as a headless CMS – gives non‑technical editors full control via Gutenberg  
* **Python 3.11 + FastAPI** for scheduled ETL jobs ingesting macro‑economic data  
* **Azure App Service + Functions + PostgreSQL + Redis** as the default cloud baseline

## Consequences

* One codebase per language (TS & Python) keeps context‑switching minimal.  
* Requires upfront effort to wrap WordPress authentication for headless usage.  
* Azure consumption plans keep the free‑tier footprint minimal, but vendor lock‑in risk exists; IaC mitigates this.
