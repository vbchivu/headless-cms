# Runbook – Local Development

**Last updated: 27 Jul 2025**

## Purpose

A concise checklist for any developer to start, stop, reset, and troubleshoot the full Mini‑Focus stack on their laptop in under 5 minutes.

---

## Prerequisites

| Tool            | Version          | Install link                        |
|-----------------|------------------|-------------------------------------|
| **Node**        | 18 LTS           | <https://nodejs.org>                  |
| **npm**         | ≥ 9              | Ships with Node 18                 |
| **Python**      | 3.11             | <https://python.org>                 |
| **Docker Desktop** | 4.x (Compose v2) | <https://www.docker.com/>            |
| **Git**         | 2.40+            | <https://git-scm.com>                |

> Tip: macOS users – install via Homebrew:  
> `brew install node docker git`

---

## 1. Clone & Bootstrap

```bash
git clone git@github.com:vchivu/mini-focus-dashboard.git
cd mini-focus-dashboard
npm install  # installs root + workspace deps, creates node_modules/
```

### Why is `node_modules/` at repo root?

We use **npm workspaces**. Dependencies shared across packages are **hoisted** to the root `node_modules` for disk and install‑time efficiency.  
Each workspace has its own `package.json` but symlinks to the root folder.  

> To disable hoisting:  
> `npm config set workspaces-update=false` (default is fine for now)

---

## 2. Start Core Services

```bash
# Spins up Postgres (@5432) & Redis (@6379)
npm run docker:init

# In a second terminal – concurrently start front‑ & back‑end
npm run dev
```

**Open:**

- Front-end: [http://localhost:3000](http://localhost:3000)  
- API health: [http://localhost:3001/health](http://localhost:3001/health)

---

## 3. Troubleshooting

| Symptom                          | Fix                                                                        |
|----------------------------------|-----------------------------------------------------------------------------|
| ECONNREFUSED localhost:5432      | Run `docker ps` – is DB running? If not: `docker compose start db`         |
| node: cannot find module         | Run `npm install` again – new deps were added                              |
| API shows CORS error             | Ensure request from `localhost:3000`; update `ALLOWED_ORIGINS` in `.env`   |
| Tailwind styles missing          | Restart `npm run dev` – Vite sometimes needs a rebuild                     |

---

## 4. Reset the Database (Dev Only)

```bash
docker compose down -v db  # ⚠️ Danger: wipes all dev data
npm run docker:init        # Recreates fresh Postgres volume
```

---

## 5. Stop Everything

```bash
docker compose down  # Stops & removes containers (keeps volumes)
```

---

## 6. Next Steps for Developers

- Read `docs/architecture.md` for system context  
- Pick a good‑first‑issue  
- Create feature branch, follow PR template

> **Total time to first running stack:** ≈ 3–5 minutes on a modern laptop
