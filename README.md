# SEA-BANDL - Indonesia Sea Boundaries WebGIS

WebGIS berbasis Vite, React, TypeScript, dan MapLibre untuk eksplorasi batas maritim Indonesia.

Live: https://project1-seaboundaries.web.app

## Fitur Utama

- Portal multi-halaman:
    - Beranda `/`
    - Request Data `/request-data`
    - Request Data Success `/request-data/success`
    - User Guide `/user-guide`
    - Peta WebGIS `/peta`
- Ribbon topbar khusus halaman peta:
    - Tombol Home (kembali ke beranda)
    - Trigger panel Layer, Filter, Geo, Import
    - Toggle Tabel Atribut
    - Dropdown Tampilan (Legenda + Koordinat Kursor)
    - CTA Request Data
- 15 layer batas maritim dengan style spesifik per status hukum.
- Query Builder (AND/OR + grouping) dengan persist filter di localStorage.
- Tabel atribut sinkron dengan seleksi/hover peta + ekspor CSV.
- Geoprocessing client-side berbasis Turf.js.
- Import GeoJSON pengguna dengan validasi geometri.
- Pencarian lokasi via Stadia Maps Search.
- Basemap switcher custom thumbnail (OSM, OpenTopoMap, RBI, Esri Satellite).
- Mode tema saat ini light-only (dark mode dinonaktifkan).

## Basemap dan Theme (Kondisi Saat Ini)

- Theme aplikasi dipaksa ke `light`.
- Default basemap saat masuk peta: `Esri Satellite`.
- Runtime switch basemap memakai kontrol thumbnail kustom di `controlsRuntime.ts`.
- Proses purge raster menjaga urutan hapus layer lalu source agar tidak terjadi error source masih dipakai layer.

## Data Layer Maritim

Layer inti yang dibundel statis:

- `laut_teritorial_sepakat`
- `laut_teritorial_perlu`
- `zee_sepakat`
- `zee_sepakat_ratif`
- `zee_perlu`
- `landas_kontinen_sepakat`
- `landas_kontinen_sepakat_ratif`
- `landas_kontinen_perlu`
- `landas_kontinen_ekstensi`
- `zona_tambahan`
- `baseline`
- `basepoints`
- `titik_perjanjian_lt`
- `titik_perjanjian_lk`
- `titik_perjanjian_zee`

## Menjalankan Proyek

Prasyarat:

- Node.js 18+
- npm 9+

Instalasi:

```bash
npm install
```

Development:

```bash
npm run dev
```

Build produksi:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Format:

```bash
npm run format
```

## Konfigurasi Environment

Buat file `.env` di root proyek:

```env
# Opsional: API key Stadia agar kuota search lebih tinggi
VITE_STADIA_MAPS_API_KEY=your_stadia_maps_api_key

# Opsional: style vector awal dari MapTiler
VITE_MAPTILER_TOKEN=your_maptiler_token
```

Tanpa variabel di atas, aplikasi tetap berjalan:

- Search Stadia memakai anonymous access.
- Style awal memakai raster fallback, lalu basemap runtime tetap dikelola oleh kontrol basemap aplikasi.

## Deploy (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

## Tech Stack

- React 19 + TypeScript
- Vite 7
- MapLibre GL JS
- TailwindCSS + shadcn/ui
- Zustand
- Turf.js
- React Router
- Firebase Hosting

## Dokumentasi

- [docs/architecture-overview.md](docs/architecture-overview.md)
- [docs/README-general.md](docs/README-general.md)
- [docs/README-query.md](docs/README-query.md)
- [docs/PORTAL_INTEGRATION_STEPS.md](docs/PORTAL_INTEGRATION_STEPS.md)
- [docs/REFACTOR_ROADMAP.md](docs/REFACTOR_ROADMAP.md)
- [docs/CHANGELOG-session.md](docs/CHANGELOG-session.md)
- [CHANGELOG.md](CHANGELOG.md)

## Catatan

- Folder `from-figma-ai` hanya sebagai referensi desain, bukan sumber runtime utama.
- Roadmap backend (WFS/WPS/Auth) masih tahap perencanaan, implementasi runtime saat ini tetap client-first.
