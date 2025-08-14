# Runbook – Headless WordPress in Docker (WSL2‑friendly)

## Purpose

Spin up a local WordPress 6.x instance for content editors and expose custom Gutenberg blocks + REST endpoints for the Mini‑Focus Dashboard.  
Tested on WSL2 + Docker Desktop.

🐧 **Tip:** Keep the repo under your Linux FS (`/home/<user>/…`).  
Bind-mounts under `/mnt/c` are slow and can mis-handle permissions.

---

## 0. Prerequisites

| Tool                | Version |
|---------------------|---------|
| Docker Desktop (WSL2 backend) | ≥ 4.31 |
| Node                | ≥ 18    |
| npm                 | ≥ 9     |

### Root `.env` file

```env
POSTGRES_PASSWORD=your_pg_pass
MYSQL_ROOT_PASSWORD=your_root_pw
MYSQL_PASSWORD=your_wp_pass
```

---

## 1. Host-side Folders Before Starting Docker

```bash
# 1-A Code mounts that mirror wp-content/*
mkdir -p cms/plugins
mkdir -p cms/themes

# 1-B FX Indicator plugin skeleton
mkdir -p cms/plugins/fx-indicator/{src,assets,build}

# 1-C WSL2: ensure write perms
sudo chown -R "$USER:$USER" ./cms
```

Directory tree:

```
cms/
├─ plugins/
│   └─ fx-indicator/
│      ├─ src/
│      ├─ assets/
│      └─ build/
└─ themes/
```

---

## 2. `docker-compose.yml` (Only WP Bits Shown)

```yaml
version: '3.9'

services:
  cms-db:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE:  wordpress
      MYSQL_USER:      wpuser
      MYSQL_PASSWORD:  ${MYSQL_PASSWORD}
    volumes:
      - cms-db-data:/var/lib/mysql
    healthcheck:
      test: ['CMD-SHELL','mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}"']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  wordpress:
    image: wordpress:6.5-php8.3-apache
    depends_on:
      cms-db:
        condition: service_healthy
    environment:
      WORDPRESS_DB_HOST:     cms-db:3306
      WORDPRESS_DB_USER:     wpuser
      WORDPRESS_DB_PASSWORD: ${MYSQL_PASSWORD}
      WORDPRESS_DB_NAME:     wordpress
      WORDPRESS_DEBUG:       0
    ports:
      - '8080:80'
    volumes:
      - cms-wp-data:/var/www/html
      - ./cms/plugins:/var/www/html/wp-content/plugins:delegated
      - ./cms/themes:/var/www/html/wp-content/themes:delegated
    healthcheck:
      test: ['CMD','curl','-f','http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  db-data:
  cms-db-data:
  cms-wp-data:
```

---

## 3. Start WP & Run Installer

```bash
docker compose up -d cms-db wordpress
```

Then visit [http://localhost:8080](http://localhost:8080) and complete the installer:

- Site Title: `Mini‑Focus CMS`  
- Username: `admin`  
- Password: `adminpass`  
- Email: `you@example.com`

---

## 4. Add FX Indicator Plugin Code

Copy your plugin files into `cms/plugins/fx-indicator`:

```
fx-indicator.php
package.json
webpack.config.js
src/
assets/
```

No `wp-content` path is used on the host.

---

## 5. Build Block Assets on Host

```bash
cd cms/plugins/fx-indicator
npm install
npm run build
```

> This generates `build/index.js`, `index.css`, and `style-index.css`.  
> Since the plugin is bind-mounted, the files are immediately available inside the container.

---

## 6. Activate Plugin & Flush Rewrites

1. In your browser, navigate to [`/wp-admin/plugins.php`](http://localhost:8080/wp-admin/plugins.php) and **activate** the FX Indicator Block plugin.
2. Go to **Settings → Permalinks**, select **Post name**, and click **Save Changes**.

---

## 7. Smoke-Test

```bash
curl -v "http://localhost:8080/wp-json/fx/v1/indicators?country=USA&code=NY.GDP.MKTP.CD" | jq .
```

Then:

- Insert the **Indicator Card** block in a WordPress page  
- Publish and verify it renders correctly  
