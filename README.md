# Örgülog

A story-first, 5-page portfolio site for a handmade crochet **dolls & bags**
brand — built with **TypeScript + Node.js (Fastify)** in a **hexagonal
architecture**, rendered with EJS.

It ships in two forms from **one codebase**:

- **A static site** (`npm run generate` → `dist-site/`) you host **for free** on
  **Netlify** or **GitHub Pages** — no server, no running process, no cost
  beyond a domain name. This is the recommended way to publish.
- **A dynamic Fastify server** (`npm start`) for local preview and as the
  foundation for the planned **dashboard**. Deployable with **Ansible** if/when
  you want a live backend.

The domain and application core are isolated from the web and storage details,
so the static generator and the server are just two *inbound adapters* over the
same logic — and the dashboard can be added later without touching it.

### Purchase flow (no payment on the site)
There is intentionally **no checkout/payment** on the site while the brand is
new. Each product's button either links out to an **Etsy/Amazon** listing (set
`etsyUrl`) or, if none is set yet, opens a **direct message to order**. Every
card also offers **Instagram** and **WhatsApp** for questions. A real checkout
can be added later once there's traction.

---

## Pages

| Route      | Page        | Content                                            |
|------------|-------------|----------------------------------------------------|
| `/`        | Home        | Hero, featured pieces, promises, story teaser      |
| `/story`   | Our Story   | Maker portrait, story, "how a piece is made"       |
| `/dolls`   | Dolls       | Gallery of dolls (from the catalog)                |
| `/bags`    | Bags        | Gallery of bags (from the catalog)                 |
| `/contact` | Contact     | Instagram/email + studio photo grid                |
| `/healthz` | —           | JSON health check (for load balancers / Ansible)   |

---

## Architecture (hexagonal / ports & adapters)

```
src/
├── domain/                     the core — no framework, no I/O
│   ├── model/                  Product (+ ProductInput), ProductCategory
│   └── ports/
│       ├── in/  CatalogQueries (reads) · CatalogAdmin (dashboard writes)
│       └── out/ ProductRepository (reads+writes) · ImageStore (bytes)
├── application/
│   ├── CatalogService.ts       reads; implements CatalogQueries
│   └── AdminService.ts         writes/validation; implements CatalogAdmin
├── adapters/
│   ├── in/web/                 DRIVING: Fastify + EJS (pages, /media/:id)
│   ├── in/admin/               DRIVING: single-user dashboard (auth, CRUD, upload)
│   ├── in/static-site/         DRIVING: renders EJS → static HTML (no-DB mode)
│   └── out/persistence/        DRIVEN adapters
│       ├── Postgres{ProductRepository,ImageStore}.ts + db.ts (migrate/seed)
│       ├── InMemory{ProductRepository,ImageStore}.ts   (no-DB fallback)
│       └── catalog.seed.ts     starter catalog (+ image files → DB on seed)
└── infrastructure/
    ├── config.ts               env → typed config (brand, db, admin)
    ├── container.ts            composition root — picks Postgres or in-memory
    └── ../main.ts              entrypoint (migrate → listen → graceful shutdown)
```

**The rule:** `domain` and `application` never import from `adapters` or a
framework. Dependencies point inward. To swap the in-memory store for Postgres,
write a `PostgresProductRepository implements ProductRepository` and change one
line in `container.ts`.

### Adding the dashboard later
Add a second *driving* adapter (e.g. `adapters/in/admin/`) and a `CatalogAdmin`
inbound port with `create/update/delete`, implemented by an application service
that uses a write-capable repository. The public site stays untouched.

---

## Run locally

Requires Node.js ≥ 20.

```bash
cd orgulog
npm install
npm run dev          # http://localhost:3000  (auto-reloads on change)
```

Other scripts:

```bash
npm run build        # compile TypeScript → dist/
npm start            # run the compiled app (dist/main.js)
npm run typecheck    # type-check without emitting
npm run generate     # render the static site → dist-site/
npm run preview:site # generate + serve dist-site/ locally
```

Config comes from the environment (see `.env.example`); sensible defaults are
built in, so `npm run dev` works with zero setup (in-memory catalog, file images).

---

## Dashboard & database (Docker)

A very simple **single-user dashboard** manages products — names, prices,
descriptions, links and **image uploads** — backed by **Postgres**. All product
images are stored in the database (a `bytea` column) and served from
`/media/:id`; prices show on the product cards.

```bash
ADMIN_PASSWORD=your-secret SESSION_SECRET=a-long-random-string \
  docker compose up -d --build
```

- App: <http://localhost:3000> · Dashboard: <http://localhost:3000/admin>
  (user `admin`, password from `ADMIN_PASSWORD`).
- On first boot the app migrates the schema and **seeds** the catalog, loading
  each starter photo from `public/images` into the DB. From then on product
  images come from Postgres.
- Set the real product **prices** and swap photos from the dashboard.

How storage is chosen: if `DATABASE_URL` is set (as in `docker-compose.yml`) the
app uses **Postgres** and enables the dashboard; otherwise it falls back to the
in-memory seed with file images (handy for the static generator).

Environment (see `.env.example` / `docker-compose.yml`): `DATABASE_URL`,
`ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET`, plus the `BRAND_*` values.

> The dashboard makes the site dynamic; the static generator (`npm run generate`)
> is only for the no-DB / file-image mode, since it can't serve `/media/:id`.

---

## Before you publish — replace these

### 1. Products & text
Edit `src/adapters/out/persistence/catalog.seed.ts` — the `DOLLS` / `BAGS`
arrays. Each entry has `name`, `description`, `image`, `etsyUrl`,
`instagramUrl`, `featured`, `order`. Placeholder copy is marked `REPLACE`.

Page headlines/paragraphs live in the EJS templates under `views/pages/` — each
editable line is marked with an HTML comment `<!-- REPLACE: … -->`.

### 2. Photos (`public/images/`)
The **8 dolls** (`doll-*.jpeg`), the **7 bags** (`bag-*.jpeg`) and the home hero
(`hero-monkey.jpeg`) all use the maker's real photos. Only the **story page**
(`story-portrait`, `story-process-1…3`) is still a coloured `.svg` placeholder —
drop in a real photo and point the reference at it in the template. The Contact
"Atölyeden" grid reuses product photos; swap it for a live Instagram embed if you
prefer (see the `İPUCU:` in `contact.ejs`).

The site copy is in **Turkish**, and colours use the palette
`FBF5A7 / FF97D0 / FF62BB / B331F1` (edit the tokens at the top of
`public/css/styles.css`).

### 3. Links
- `#etsy-link` → your shop listing (per product, in `catalog.seed.ts`).
- `#instagram-dm` → your Instagram/DM link (set `BRAND_INSTAGRAM`, or per product).
- `hello@orgulog.example` → your email (set `BRAND_EMAIL`, or delete the card in
  `views/pages/contact.ejs`).

- `#whatsapp` → your WhatsApp (set `BRAND_WHATSAPP=https://wa.me/905551234567`).
  Cards/footer hide WhatsApp until it's set.

Brand name, tagline, Instagram, WhatsApp and email are set once via env
(`BRAND_NAME`, `BRAND_TAGLINE`, `BRAND_INSTAGRAM`, `BRAND_WHATSAPP`,
`BRAND_EMAIL`) — see `.env.example` and the Ansible `group_vars/all.yml`.

### 4. (Optional) live Instagram feed
`views/pages/contact.ejs` has a static photo grid you can replace with a
LightWidget or Instagram embed — see the `TIP:` comment there.

### Fonts
Cormorant Garamond, Karla, and Caveat load from Google Fonts (need internet on
the visitor's device). To self-host, add `@font-face` rules at the top of
`public/css/styles.css` and remove the Google `<link>` in
`views/partials/head.ejs`. Keep all files saved as **UTF-8** (the brand name
uses the Turkish letter *ö*).

---

## Deploy for free (recommended: static)

The whole site renders to static files, so hosting is free.

**Netlify (drag & drop):**
```bash
npm run generate      # creates dist-site/
```
Then drag the `dist-site/` folder onto https://app.netlify.com/drop. Or connect
the repo — `netlify.toml` already sets the build command (`npm run generate`)
and publish dir (`dist-site`).

**GitHub Pages:** push the repo; the included workflow
(`.github/workflows/deploy-pages.yml`) builds and publishes on every push to
`main` (set Settings → Pages → Source = "GitHub Actions" once). If your site
lives at `username.github.io/<repo>/`, uncomment `BASE_PATH` in that workflow.

Only real cost is a domain name (~$10–15/yr), which both hosts let you attach.
Extensionless links (`/dolls`) resolve to `dolls.html` automatically on both.

---

## Optional: self-host the dynamic server (for the future dashboard)

You only need this once you want a live backend (e.g. the dashboard). It
provisions a fresh Debian/Ubuntu server: base packages + firewall → Node.js LTS
→ builds the app + a hardened `systemd` service → nginx reverse proxy (with
optional Let's Encrypt TLS).

```bash
cd ansible
ansible-galaxy collection install -r requirements.yml   # once
cp inventory.example.ini inventory.ini                  # set host + SSH user
$EDITOR group_vars/all.yml                               # domain, brand, TLS
ansible-playbook playbook.yml
```

- **Code delivery:** set `app_repo` in `group_vars/all.yml` to deploy from git,
  or leave it empty to rsync your local working copy (needs `rsync` locally).
- **TLS:** point DNS at the server, set `enable_tls: true` + `certbot_email`,
  and re-run — certbot obtains a cert and switches nginx to HTTPS.
- **Re-deploy:** just re-run `ansible-playbook playbook.yml`; the app rebuilds
  and the service restarts.

Manage the service on the server:

```bash
systemctl status orgulog
journalctl -u orgulog -f
```

---

## Notes
- No database yet — products come from an in-memory seed. This is intentional
  (see *Adding the dashboard later*). The static generator reads the same seed.
- No payment on the site by design — buttons link out to Etsy/Amazon or open
  Instagram/WhatsApp (see *Purchase flow* above).
- Security headers: set by `netlify.toml` for the static site, and by the app
  itself for the dynamic server.
- `/healthz` returns `{"status":"ok"}` for uptime checks (dynamic server only).
# knitting-site
