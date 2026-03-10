# SEA-BANDL — Indonesia Sea Boundaries WebGIS

WebGIS client-side berbasis Vite, React, dan MapLibre GL JS untuk eksplorasi batas maritim Indonesia. Dibangun sebagai proyek capstone ITB Teknik Geodesi 2025.

**🌐 Live:** https://project1-seaboundaries.web.app

## Fitur Utama

- **Ribbon UI** — bilah atas berisi tombol panel, toggle tabel, legend, koordinat, dan kontrol basemap/tema.
- **15 layer batas maritim** — setiap layer ditampilkan dengan warna dan pola garis unik sesuai status hukumnya.
- **Panel Layer** — aktifkan/nonaktifkan layer per kelompok maupun individual, dengan simbol visual.
- **Query Builder** — filter fitur berbasis field menggunakan ekspresi AND/OR; tersimpan di `localStorage` antar sesi.
- **Attribute Table** — tabel atribut responsif dengan highlight sinkron ke peta, zoom-to-feature, dan ekspor CSV.
- **Geoprocessing** — operasi geometri (buffer, centroid, bounding box, simplify, convex hull, dll.) berbasis Turf.js.
- **Import GeoJSON** — unggah layer pengguna dengan validasi geometri dan analisis irisan terhadap zona maritim.
- **Pengukuran Geodesik** — alat dua titik menampilkan jarak dan azimut awal.
- **Koordinat Kursor** — overlay pill di bagian bawah peta menampilkan koordinat real-time saat mouse bergerak.
- **Basemap & Tema** — basemap OSM/Esri/Carto per mode terang/gelap; sinkronisasi otomatis saat tema berpindah.
- **Stadia Maps Search** — pencarian tempat dengan fly-to peta.
- **Toast notifikasi** dan persistensi state via Zustand/`localStorage`.

## Layer Batas Maritim

| ID Layer | Kelompok | Keterangan |
|---|---|---|
| `laut_teritorial_sepakat` | Laut Teritorial | Disepakati (solid) |
| `laut_teritorial_perlu` | Laut Teritorial | Perlu kesepakatan (putus-putus) |
| `zee_sepakat` | ZEE | Disepakati |
| `zee_sepakat_ratif` | ZEE | Disepakati & diratifikasi |
| `zee_perlu` | ZEE | Perlu kesepakatan |
| `landas_kontinen_sepakat` | Landas Kontinen | Disepakati |
| `landas_kontinen_sepakat_ratif` | Landas Kontinen | Disepakati & diratifikasi |
| `landas_kontinen_perlu` | Landas Kontinen | Perlu kesepakatan |
| `landas_kontinen_ekstensi` | Landas Kontinen | Ekstensi (CLCS) |
| `zona_tambahan` | Zona Tambahan | — |
| `baseline` | Garis Pangkal | — |
| `basepoints` | Titik Dasar | — |
| `titik_perjanjian_lt` | Titik Perjanjian | Laut Teritorial |
| `titik_perjanjian_lk` | Titik Perjanjian | Landas Kontinen |
| `titik_perjanjian_zee` | Titik Perjanjian | ZEE |

## Memulai

### Prasyarat

- Node.js 18+
- npm 9+

### Instalasi

```bash
npm install
```

### Server pengembangan

```bash
npm run dev
```

Aplikasi berjalan di http://localhost:5173/ dengan hot module replacement.

### Script quality

```bash
npm run lint    # ESLint (TypeScript + React rules)
npm run format  # Prettier format
npm run build   # Type-check dan production bundle
```

## Konfigurasi Environment

Buat file `.env` di root proyek:

```env
# Geocoding Stadia Maps (opsional, untuk batas request lebih tinggi)
VITE_STADIA_MAPS_API_KEY=your_stadia_maps_api_key
```

Tanpa key, basemap OSM raster dan pencarian Stadia Maps tetap berfungsi secara anonim.

## Data

Data GeoJSON tersimpan di `src/data/` dan di-bundle secara statis saat build (via Vite `?raw` import). Untuk memperbarui data, lihat panduan lengkap di [docs/data-update-workflow.md](docs/data-update-workflow.md).

Upload layer pengguna: WGS84 `FeatureCollection` dengan tipe geometri homogen. Dataset besar (>5.000 fitur) sebaiknya disederhanakan terlebih dahulu.

## Deploy (Firebase Hosting)

1. Build:
    ```bash
    npm run build
    ```
2. Inisialisasi hosting (sekali):
    ```bash
    firebase init hosting
    ```
    - Public directory: `dist`
    - Single-page app: **No**

3. Deploy:
    ```bash
    firebase deploy
    ```

### Catatan Deployment

- **Saat ini:** Firebase Hosting untuk frontend.
- **Direncanakan:** VPS dengan GeoServer + PostGIS untuk layanan OGC (WMS/WFS/WPS).

## Tech Stack

- React 19 + TypeScript
- Vite 7
- MapLibre GL JS v5
- TailwindCSS + shadcn/ui
- Zustand (state management)
- Turf.js (geoprocessing client-side)
- PapaParse (ekspor CSV)
- Firebase Hosting

## Dokumentasi

| Dokumen | Keterangan |
|---|---|
| [docs/architecture-overview.md](docs/architecture-overview.md) | Arsitektur sistem & rencana WPS/WFS/Auth |
| [docs/README-general.md](docs/README-general.md) | Algoritma kerja aplikasi (alur inisialisasi, state, peta) |
| [docs/README-query.md](docs/README-query.md) | Query Builder & filter expression secara mendalam |
| [docs/data-update-workflow.md](docs/data-update-workflow.md) | Panduan pembaruan data GeoJSON |
| [docs/rencana.md](docs/rencana.md) | Rencana teknis pengembangan (PostGIS, GeoServer, S-121) |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan |

## Lisensi

Dataset bersifat demonstrasi. Ganti dengan data resmi untuk penggunaan produksi.
