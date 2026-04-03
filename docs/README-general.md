# Ringkasan Alur Kerja Aplikasi Web

Dokumen ini menjelaskan alur runtime aplikasi SEA-BANDL berdasarkan implementasi terbaru.

## 1. Struktur Komponen Utama

- Vite + React + TypeScript sebagai fondasi aplikasi.
- React Router untuk route portal dan route peta.
- Zustand stores:
    - `useLayersStore` untuk state layer, filter, seleksi, zoom request.
    - `useUIStore` untuk state panel dan tampilan UI.
    - `useThemeStore` untuk theme, saat ini dikunci light-only.
- `Map.tsx` sebagai orchestrator map runtime.
- Runtime map dipecah ke modul `src/components/map/*`:
    - `controlsRuntime.ts`
    - `basemapRuntime.ts`
    - `sourceBootstrap.ts`
    - `runtimeSync.ts`
    - `layerInteractions.ts`
    - `popupInteraction.ts`
- `Ribbon.tsx` sebagai topbar halaman `/peta`.

## 2. Alur Routing Aplikasi

Route utama:

- `/` -> landing portal
- `/request-data` -> formulir permintaan data
- `/request-data/success` -> ringkasan submit
- `/user-guide` -> panduan penggunaan
- `/peta` -> shell WebGIS utama

Semua route dimuat via lazy loading agar initial load portal lebih ringan.

## 3. Inisialisasi WebGIS (`/peta`)

1. `WebGisPage.tsx` memanggil `loadInitialFilters()` saat mount.
2. `Map.tsx` membuat instance MapLibre.
3. `setupMapControls()` menginisialisasi:
    - search control,
    - navigation + scale control,
    - custom basemap thumbnail control.
4. `ensureBasemapLayers()` menyiapkan raster basemap aktif.
5. `initialiseSources()` + `syncMapWithState()` membangun source/layer operasional dan sinkronkan state store.

## 4. Siklus Data Layer

1. Data GeoJSON inti dibaca dari bundel data lokal.
2. Store membangun runtime state tiap layer:
    - `featureIndex`
    - `filteredIds`
    - `selectionIds`
    - metadata render
3. Perubahan filter, seleksi, hover, dan visibility diteruskan ke MapLibre melalui `syncMapWithState()`.
4. Tabel atribut menggunakan sumber data yang sama agar konsisten dengan peta.

## 5. Interaksi Pengguna dan Reaksi Sistem

- Toggle layer -> update visibility layer di map + panel.
- Apply/clear filter -> update `filteredIds` + ekspresi filter map + tabel.
- Klik fitur di peta/tabel -> sinkron seleksi dua arah.
- Request zoom -> map mengeksekusi fit bounds/fly-to dari `pendingZoom`.
- Import GeoJSON -> validasi data -> register user layer ke store -> render di map.

## 6. Basemap dan Theme (Aktual)

Status saat ini:

- Theme dark dinonaktifkan, aplikasi berjalan light-only.
- Default basemap = `esri` (Esri Satellite).
- Basemap control menggunakan thumbnail custom (bukan plugin default UI).
- Runtime purge raster memakai urutan aman:
    - hapus layer raster terkait dulu,
    - baru hapus source yang sudah tidak direferensikan layer.

Hal ini mencegah error seperti source tidak bisa dihapus karena masih dipakai layer legacy.

## 7. Ribbon Topbar (`/peta`)

Elemen utama topbar:

- Tombol Home (kiri paling awal) untuk kembali ke beranda.
- Brand SEA-BANDL.
- Tombol panel: Layer, Filter, Geo, Import.
- Tombol Tabel.
- Dropdown Tampilan:
    - toggle Legenda,
    - toggle Koordinat Kursor,
    - status Mode Terang Aktif.
- Tombol Request Data.
- Counter fitur terfilter.

## 8. Persistensi

- Filter inti disimpan di localStorage.
- Sebagian state UI (query builder/preset) disimpan di store persist sesuai kebutuhan.
- Theme persist tetap ada namun nilainya dimigrasi ke `light`.

## 9. Error Handling

- Operasi penting dibungkus guard + fallback.
- Operasi map runtime yang rawan race condition (style/source/layer) diberi retry event (`styledata`) dan proteksi try/catch.
- Notifikasi pengguna untuk validasi form/import ditampilkan via toast.

## 10. Catatan Optimasi Kode

Optimasi struktural yang sudah diterapkan:

- `Map.tsx` diperkecil menjadi orchestrator runtime (modular map runtime).
- `useLayers.ts` diperkecil menjadi facade store; logic dipecah ke `src/store/layers/*`.
- Route portal menggunakan lazy loading.
- Basemap runtime dipisah agar pergantian mode/style tidak mengganggu source/layer operasional.

Gunakan dokumen ini sebagai peta cepat sebelum masuk detail masing-masing modul.
