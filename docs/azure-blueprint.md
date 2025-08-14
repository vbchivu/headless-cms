# Azure Integration Blueprint (Optional)

**Last updated: 27 Jul 2025**

## Why this doc?

The core project runs 100 % locally (Docker Compose) and can be deployed to any cloud or on-prem platform. This blueprint captures everything you need to migrate the stack to Microsoft Azure later—complete with cost estimates, CLI commands, portal steps, and environment variable mapping—so there are no surprises when you flip the switch.

---

## 1. Reference Architecture (Azure)

```
┌────────────────────────────┐           ┌─────────────────────────┐
│          Users             │  HTTPS    │    Azure Front Door     │  (optional for CDN)
└────────────┬───────────────┘           └────────────┬───────────┘
             ▼                                        ▼
 ┌───────────────────────────┐  ↔  ┌──────────────────────────┐
 │  App Service (Next.js)    │     │ Azure Functions (ETL)    │  Timer triggered
 └────────────┬──────────────┘     └────────────┬─────────────┘
             ▼                                    ▼
 ┌───────────────────────────┐  ←→  ┌──────────────────────────┐
 │    Fastify API (Backend)  │      │   PostgreSQL Flexible    │
 │    App Service Container  │      │     Server (dev/test)    │
 └────────────┬──────────────┘      └──────────────────────────┘
             ▼
     ┌───────────────┐
     │ Redis Cache   │  (caching SWR responses, rate limits)
     └───────────────┘
```

---

## 2. Cost Cheat Sheet (West Europe region)

| Service                  | SKU          | Monthly Free Quota              | Dev / Hobby € | Prod €     | Notes |
|--------------------------|--------------|----------------------------------|---------------|------------|-------|
| **App Service**          | F1           | 60 CPU min/day, 1 GB RAM         | €0            | —          | No SSL, single instance, ideal for staging. |
|                          | B1 (Basic)   | —                                | €13 – €15     | —          | 1 vCPU/1.75 GB, supports SSL. |
|                          | S1 (Standard)| —                                | —             | €68 – €75  | 1 vCPU/1.75 GB with auto scale. |
| **Azure Functions**      | Consumption  | 1 M req + 400 k GB-s             | €0 – €5       | ≈ €0 – €5  | €0.20 per extra M req. |
| **PostgreSQL**           | B1ms         | 750 hrs/mo for 12 mos            | €0            | €18 – €22  | 1 vCore, 2 GiB. |
| **Redis Cache**          | Basic C0     | 250 MB                           | €15           | €15        | Single node, no SLA. |
| **Storage (Blob)**       | Hot LRS      | 5 GB                             | €0 – €1       | €1 – €3    | Needed for media & backups. |
| **Bandwidth**            | —            | 5 GB/mo                          | €0            | €0 – €5    | Front Door adds cost. |

> Total Dev tier ≈ €15 – €20/mo (after free PostgreSQL year).  
> Small prod tier ≈ €95 – €110/mo (S1 + same DB/Redis).  
> *Always verify with Azure Calculator.*

---

## 3. Provisioning Steps (IaC Friendly)

### 3.1 Resource Group

```bash
az group create \
  --name mini-focus-dev \
  --location westeurope
```

### 3.2 PostgreSQL Flexible Server (dev)

```bash
az postgres flexible-server create \
  --resource-group mini-focus-dev \
  --name mfd-pg-dev \
  --location westeurope \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --admin-user pgadmin \
  --admin-password <Your#Super$Secret1> \
  --version 15 \
  --public-access 0.0.0.0-0.0.0.0
```

Stop server outside hours:

```bash
az postgres flexible-server stop --name mfd-pg-dev -g mini-focus-dev
```

### 3.3 Redis Cache (Basic C0)

```bash
az redis create \
  --resource-group mini-focus-dev \
  --name mfd-cache-dev \
  --sku Basic \
  --vm-size C0
```

### 3.4 App Service Plan + Web App

```bash
az appservice plan create -g mini-focus-dev -n mfd-plan-b1 \
  --sku B1 --is-linux
```

Next.js container:

```bash
az webapp create -g mini-focus-dev -p mfd-plan-b1 \
  -n mfd-frontend-dev \
  --deployment-container-image-name ghcr.io/your-handle/mini-focus-frontend:latest
```

Fastify API container:

```bash
az webapp create -g mini-focus-dev -p mfd-plan-b1 \
  -n mfd-api-dev \
  --deployment-container-image-name ghcr.io/your-handle/mini-focus-api:latest
```

### 3.5 Azure Functions (ETL)

```bash
az functionapp create \
  --resource-group mini-focus-dev \
  --consumption-plan-location westeurope \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --name mfd-etl-dev \
  --storage-account <storageName>
```

Push code via:

```bash
func azure functionapp publish mfd-etl-dev
```

---

## 4. Manual Portal Tasks

| Step                  | Where                         | Action                                           |
|-----------------------|-------------------------------|--------------------------------------------------|
| Custom Domain & SSL   | App Service ► Custom domains  | Add CNAME, upload cert (SNI)                     |
| Scaling rules         | App Service ► Scale out       | Set CPU ≥ 70 %, add 1 instance (S1+)             |
| VNET Integration      | Function App ► Networking     | Link to VNET if DB private                       |
| Backup                | PostgreSQL ► Backups          | Enable geo restore, set retention 7 days         |
| Monitoring            | App Insights                  | Enable, set alerts                               |
| Cost Alerts           | Cost Mgmt ► Budgets           | Budget €20 for dev; email + SMS                  |

---

## 5. Environment Variables Mapping

| Variable               | Local (Docker Compose)                                  | Azure App Service/Functions                                                |
|------------------------|----------------------------------------------------------|----------------------------------------------------------------------------|
| `DATABASE_URL`         | `postgresql://pgadmin:pw@localhost:5432/mfd`             | `postgresql://pgadmin:$PG_PASS@mfd-pg-dev.postgres.database.azure.com:5432/mfd?sslmode=require` |
| `REDIS_URL`            | `redis://localhost:6379`                                 | `redis://mfd-cache-dev.redis.cache.windows.net:6380`                      |
| `JWT_SECRET`           | `dev secret`                                             | Key Vault secret reference `@Microsoft.KeyVault(SecretUri=...)`          |
| `WP_API_URL`           | `http://localhost:8080/wp-json`                          | `https://cms.focus-econ.com/wp-json`                                      |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:3001/api`                              | `https://api.focus-dev.com/api`                                           |
| `SENDGRID_KEY`         | —                                                        | Key Vault secret                                                           |

> Tip: Use an `.env*` file locally and map to App Settings or Bicep variables later.

---

## 6. Next Steps After Adoption

1. Swap Free F1 → B1 once custom domain & SSL needed.  
2. Introduce Infrastructure as Code (Bicep/Terraform).  
3. Add Front Door + CDN when marketing traffic grows.  
4. Upgrade DB to GP_Standard 2 vCores before >20 TPS.  
5. Add Redis replica + persistence if cache >5 k ops/s.

---

## 7. TL;DR

The stack runs locally now. When ready, use the above commands—or the IaC equivalent—to spin up a €15/mo dev environment in Azure, with a clear upgrade path to a €100/mo production setup.
