# Struktur Backend SEA-BANDL

Stack: **Node.js · Express 4 · PostgreSQL + PostGIS (`pg`) · Pino · Helmet · CORS · Multer**.

Diagram global di bawah merangkum arsitektur backend (`backend/`) dalam satu peta vertikal.

```mermaid
flowchart TB
    Client["Browser / Frontend\n(WebGIS · Portal)"]

    subgraph S1["① Entry"]
        direction TB
        Server["server.js\ndotenv · listen :8080"]
        App["app.js · createApp()\nExpress app factory"]
        Server --> App
    end

    Client --> App

    subgraph S2["② Middleware Stack — app.js"]
        direction TB
        SEC["Helmet · CORS\ntrust proxy · express.json"]
        LOG["httpLogger · spatialAuditLogger\n(Pino — akses HTTP & audit spasial)"]
        SEC --> LOG
    end

    App --> SEC

    subgraph S3["③ Route Publik\n(tanpa display token)"]
        direction TB
        RHealth["GET /api/health\nliveness + ping DB"]
        RSession["GET /api/display/session\nterbitkan display token"]
        RSubmit["POST /api/data-requests\nrate limit · multer upload"]
        RHealth --> RSession --> RSubmit
    end

    subgraph S4["④ Route Display Channel\nrequireDisplayToken"]
        direction TB
        RTiles["GET /api/tiles/:id/:z/:x/:y.mvt\nheader X-Display-Token atau ?token="]
        RMeta["GET /api/meta/filter-options\n+ metadataCache"]
        RLimits["GET /api/limits · /api/limits/:id\n+ shortCache"]
        RLoc["GET /api/locations · /api/locations/:id\n+ shortCache"]
        RGeo["GET /api/geo/info\nPOST /api/geo/measure · buffer · intersect · clip"]
        RTiles --> RMeta --> RLimits --> RLoc --> RGeo
    end

    subgraph S5["⑤ Route Opsional / Admin"]
        direction TB
        RMetaApi["Metadata API opsional\nENABLE_METADATA_API=true\n/baselines · /curves · /sources\n/parties · /baunits · /rrr"]
        RAdmin["Admin data-requests\nGET · PATCH /api/data-requests\nrequireDataRequestAdmin"]
        RMetaApi --> RAdmin
    end

    LOG --> S3
    LOG --> S4
    LOG --> S5

    subgraph Routes["routes/"]
        direction TB
        RH["health · displaySession · dataRequests"]
        RT["tiles · meta · limits · locations · geo"]
        RM["baselines · curves · sources · parties · baunits · rrr"]
        RH --> RT --> RM
    end

    S3 --> RH
    S4 --> RT
    S5 --> RM

    subgraph S6["⑥ Lapisan Utilitas — lib/ + middleware/"]
        direction TB
        Auth["displayToken · displayConfig\nrequireDisplayToken"]
        SQL["tileSql · geoSql · queryHelpers\ntileLayerRegistry · geoLayerResolve"]
        Policy["geoPolicy · geoConfig · agreementPointKind"]
        Cache["cache · tileCache"]
        Infra["security · logging · spatialAudit\nadminAuth · requestUpload · notifyWebhook"]
        Auth --> SQL --> Policy --> Cache --> Infra
    end

    RT --> Auth
    RH --> Infra

    subgraph S7["⑦ Basis Data"]
        direction TB
        Pool["db/pool.js · pg Pool"]
        DB["Cloud SQL\nPostgreSQL + PostGIS"]
        Pool --> DB
    end

    SQL --> Pool
    RTiles --> Cache
```

## Keterangan singkat

| Blok | Isi utama |
|------|-----------|
| **① Entry** | `server.js` bootstrap; `createApp()` membangun Express tanpa side-effect listen |
| **② Middleware** | Keamanan HTTP, CORS, JSON body, logging, audit akses spasial |
| **③ Publik** | Health, penerbitan token sesi, submit permintaan data |
| **④ Display channel** | Tile MVT, atribut layer, filter meta, geoprocessing — butuh display token* |
| **⑤ Opsional / admin** | Metadata S-121 penuh (flag env) dan operasi admin permintaan data |
| **⑥ Utilitas** | Token, SQL spasial, kebijakan geo, cache, keamanan |
| **⑦ DB** | Koneksi pool ke Cloud SQL (proxy lokal atau unix socket di Cloud Run) |

\* **`requireDisplayToken`** aktif secara default saat `DISPLAY_MODE=mvt`. Token dikirim via header `X-Display-Token` atau query `?token=`. Jika `DISPLAY_REQUIRE_TOKEN=false`, middleware dilewati.

## Pemetaan file

| Area | Lokasi |
|------|--------|
| Bootstrap | `server.js`, `app.js` |
| Middleware token | `middleware/requireDisplayToken.js` |
| Route handlers | `routes/*.js` |
| Kebijakan display | `lib/displayConfig.js`, `lib/displayToken.js` |
| SQL spasial | `lib/tileSql.js`, `lib/geoSql.js`, `lib/queryHelpers.js` |
| Cache | `lib/cache.js` (HTTP), `lib/tileCache.js` (MVT in-memory) |
| Koneksi DB | `db/pool.js` |
| Migrasi | `migrations/*.sql` |
| Tes | `test/*.test.js` |

## Endpoint per kategori

**Publik (tanpa display token):**
- `GET /api/health`
- `GET /api/display/session`
- `POST /api/data-requests` (rate limit khusus)

**Display channel (display token):**
- `GET /api/tiles/:tilesetOrLayer/:z/:x/:y.mvt`
- `GET /api/meta/filter-options`
- `GET /api/limits`, `GET /api/limits/:fuid`
- `GET /api/locations`, `GET /api/locations/:fuid`
- `GET /api/geo/info`, `POST /api/geo/measure|buffer|intersect|clip`

**Admin (API key operator):**
- `GET /api/data-requests`, `GET /api/data-requests/:id`, `PATCH /api/data-requests/:id`

**Metadata API (hanya jika `ENABLE_METADATA_API=true`, tanpa display token):**
- `GET /api/baselines`, `/api/curves`, `/api/sources`, `/api/parties`, `/api/baunits`, `/api/rrr`
