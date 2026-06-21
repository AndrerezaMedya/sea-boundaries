# SEA-BANDL — WebGIS Batas Laut NKRI

WebGIS untuk eksplorasi batas maritim Indonesia berbasis standar IHO S-121 _Maritime Limits and Boundaries_.

**Live:** [seabandl.app](https://seabandl.app)

---

## Fitur Utama

### Halaman & Navigasi

- Beranda (`/`)
- Peta WebGIS (`/peta`)
- Panduan Pengguna (`/user-guide`)
- Pengajuan Data (`/request-data`)
- Metodologi (`/metodologi`)

### Peta Interaktif

- Rendering 7 jenis kurva batas laut via MVT tile dari backend (garis pangkal, laut teritorial, zona tambahan, ZEE, landas kontinen, landas kontinen ekstensi, fisheries)
- Titik referensi: titik garis pangkal dan titik perjanjian bilateral
- Kontrol visibilitas per layer secara independen
- Basemap switcher (OSM, OpenTopoMap, RBI, Esri Satellite)

### Data Atribut

- Popup informasi atribut saat klik fitur di peta
- Filter dan pengurutan per kolom

### Geoprocessing (Server-side)

- Pengukuran panjang dan luas berbasis geodetik WGS84
- Pembentukan zona penyangga (_buffer_) dengan jarak yang dapat ditentukan

### Pengajuan Data Institusional

- Formulir pengajuan data batas dari instansi berwenang
- Rate-limited: 5 pengajuan per jam per IP

---

## Arsitektur

| Komponen   | Teknologi                              | Platform                    |
| ---------- | -------------------------------------- | --------------------------- |
| Frontend   | React 19 + TypeScript + MapLibre GL JS | Firebase Hosting            |
| Backend    | Node.js + Express.js                   | Google Cloud Run            |
| Basis Data | PostgreSQL + PostGIS                   | Google Cloud SQL            |
| Secrets    | —                                      | Google Cloud Secret Manager |
| Logs       | Pino → Audit log spasial               | Google Cloud Logging        |

Dokumentasi arsitektur lengkap: [docs/architecture-overview.md](docs/architecture-overview.md)

---

## Menjalankan Lokal

**Prasyarat:** Node.js 18+, npm 9+

```bash
# Install dependensi
npm install

# Development server
npm run dev

# Lint
npm run lint

# Format
npm run format
```

### Konfigurasi Environment

Buat file `.env` di root **frontend** (`frontend/`):

```env
# URL backend (default: localhost saat development)
VITE_API_BASE_URL=http://localhost:3001

# Opsional: API key Stadia Maps
VITE_STADIA_MAPS_API_KEY=your_stadia_maps_api_key
```

Buat file `.env` di root **backend** (`backend/`):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Keamanan
DISPLAY_TOKEN_SECRET=your_secret_here
CORS_ORIGINS=http://localhost:5173

# Mode tampilan
DISPLAY_MODE=mvt
```

---

## Deploy

### Frontend (Firebase Hosting)

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend (Google Cloud Run)

```bash
cd backend
gcloud run deploy s121-backend --source .
```

---

## Dokumentasi

- [Architecture Overview](docs/architecture-overview.md)
- [Data Access & Security Plan](docs/DATA_ACCESS_SECURITY_PLAN.md)
- [Backend Structure](docs/backend-structure.md)
- [Changelog](CHANGELOG.md)

---

## Struktur Repositori

```
sea-boundaries/
├── frontend/          # React + MapLibre GL JS
├── backend/           # Node.js + Express API
│   ├── routes/        # Route handlers
│   ├── lib/           # Logika bisnis (tile, cache, security, geo)
│   └── app.js         # Entry point
└── docs/              # Dokumentasi teknis dan laporan TA
```
