# WebGIS SEA-BANDL — Architecture Overview

> **Last updated: 2026-06-06**
> Dokumen ini menggambarkan arsitektur sistem yang **sedang berjalan** di produksi (`seabandl.app`).
> Dokumen arsitektur historis (rencana GeoServer/WFS/WPS/VPS yang tidak dilanjutkan) tersimpan di `docs/archive/`.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript, Vite 7
- **Peta**: MapLibre GL JS — rendering MVT tile dari backend
- **State**: Zustand
- **UI**: TailwindCSS + shadcn/ui
- **Routing**: React Router (portal multi-halaman + halaman peta)
- **Hosting**: Firebase Hosting → **[seabandl.app](https://seabandl.app)**

### Backend
- **Runtime**: Node.js + Express.js
- **Platform**: Google Cloud Run (`s121-backend`)
- **Database**: PostgreSQL + PostGIS (Google Cloud SQL), koneksi via Unix socket (Cloud Run) atau TCP (lokal)
- **Secrets**: Google Cloud Secret Manager
- **Logging**: Pino Logger → Google Cloud Logging

---

## Arsitektur Sistem

```mermaid
graph TD
    subgraph "Firebase Hosting (CDN)"
        FE["Frontend\nReact + MapLibre GL JS"]
    end

    subgraph "Google Cloud Run"
        BE["Backend\nNode.js + Express"]
        Cache["LRU Cache\n(in-memory RAM)"]
    end

    subgraph "Google Cloud SQL"
        DB[("PostgreSQL + PostGIS")]
    end

    subgraph "Google Cloud"
        SM["Secret Manager"]
        LOG["Cloud Logging\n(audit log)"]
    end

    Browser["Browser Pengguna"] --> FE
    Browser --> BE
    BE --> Cache
    Cache -->|"Cache MISS"| DB
    BE --> DB
    BE --> SM
    BE --> LOG
```

---

## Alur Data Utama

### 1. Inisialisasi Sesi Tampilan

```mermaid
sequenceDiagram
    participant Browser
    participant API as Cloud Run (Express)

    Browser->>API: GET /api/display/session
    API-->>Browser: display token (HMAC-SHA256, TTL 1 jam)
    Note over Browser: Token disimpan di memori sesi
```

### 2. Rendering Tile MVT

```mermaid
sequenceDiagram
    participant MapLibre as MapLibre GL JS
    participant API as Cloud Run (Express)
    participant Cache as LRU Cache (RAM)
    participant DB as Cloud SQL (PostGIS)

    MapLibre->>API: GET /api/tiles/{tileset}/{z}/{x}/{y}.mvt
    Note over MapLibre,API: Header: X-Display-Token: [token]
    API->>Cache: Lookup kunci tile
    alt Cache HIT
        Cache-->>API: Buffer MVT biner
    else Cache MISS
        API->>DB: ST_AsMVT query (ST_TileEnvelope + ST_Intersects)
        DB-->>API: Buffer MVT biner
        API->>Cache: Simpan ke LRU
    end
    API-->>MapLibre: application/vnd.mapbox-vector-tile
```

### 3. Geoprocessing

```mermaid
sequenceDiagram
    participant Browser
    participant API as Cloud Run (Express)
    participant DB as Cloud SQL (PostGIS)

    Browser->>API: POST /api/geo/{measure|buffer}
    API->>API: Validasi display token
    API->>API: Validasi parameter dan kebijakan input
    API->>DB: Kueri spasial (ST_Length / ST_Area / ST_Buffer)
    DB-->>API: Hasil komputasi
    API->>API: Penyederhanaan geometri (jika buffer)
    API-->>Browser: JSON (nilai numerik atau GeoJSON)
```

---

## Endpoint API

| Kategori | Endpoint | Akses |
|---|---|---|
| Sesi | `GET /api/display/session` | Publik |
| Health | `GET /health` | Publik |
| Tile MVT | `GET /api/tiles/:tileset/:z/:x/:y.mvt` | Display token |
| Atribut batas | `GET /api/limits` | Display token + bbox wajib |
| Atribut lokasi | `GET /api/locations` | Display token + bbox wajib |
| Metadata | `GET /api/sources`, `/api/curves`, dll. | Nonaktif di produksi |
| Geoprocessing | `POST /api/geo/measure`, `/api/geo/buffer` | Display token |
| Pengajuan data | `POST /api/data-requests` | Publik (rate-limited: 5/jam) |
| Admin | `GET/PATCH /api/data-requests` | X-Admin-Key header |

---

## Keamanan Berlapis

```mermaid
flowchart TD
    A["Permintaan HTTP masuk"] --> B["Helmet: header keamanan"]
    B --> C{"CORS: origin diizinkan?"}
    C -- Tidak --> D["403 CORS_REJECTED"]
    C -- Ya --> E["httpLogger · spatialAuditLogger · express.json"]
    E --> F{"Rute mana?"}

    F --> G["Publik\n/health · /display/session"]
    F --> H["POST /api/data-requests\n(rate limit: 5/jam)"]
    F --> I["Admin /data-requests\n(X-Admin-Key)"]
    F --> J["Display channel\n/tiles · /limits · /locations · /geo"]

    J --> K{"displayRequireToken aktif?"}
    K -- Tidak --> L["Handler"]
    K -- Ya --> M{"Display token valid?"}
    M -- Tidak --> N["401 DISPLAY_TOKEN_REQUIRED"]
    M -- Ya --> L
```

---

## Tileset MVT

Dua tileset gabungan tersedia via `/api/tiles/:tileset/:z/:x/:y.mvt`:

| Tileset | Isi |
|---|---|
| `boundaries` | Garis pangkal, laut teritorial, zona tambahan, ZEE, landas kontinen, landas kontinen ekstensi, fisheries |
| `points` | Titik garis pangkal (*basepoints*), titik perjanjian bilateral (TS, CS, ZEE) |

Layer individual juga didukung via `/api/tiles/:layerId/:z/:x/:y.mvt`.

---

## Kebijakan Data

- **Geometri**: Koordinat disederhanakan sebelum dikirimkan (default toleransi: 0,0005 derajat). Presisi penuh tidak pernah dikirimkan ke browser.
- **Atribut**: `bbox` wajib pada permintaan `/api/limits` dan `/api/locations`. Luas maksimum: 500 derajat persegi.
- **Metadata relasional**: Endpoint `/api/sources`, `/api/curves`, `/api/baunits` dinonaktifkan di produksi (`ENABLE_METADATA_API=false`).

---

## Deployment

| Komponen | Platform | URL |
|---|---|---|
| Frontend | Firebase Hosting | [seabandl.app](https://seabandl.app) |
| Backend | Google Cloud Run | Internal (tidak diekspos langsung) |
| Database | Google Cloud SQL | Via Unix socket (Cloud Run) |
| Secrets | Google Cloud Secret Manager | — |
| Logs | Google Cloud Logging | — |
