# Changelog - Sea Boundaries WebGIS

## Pembaruan Mei 2026

### Geoprocessing (PostGIS BFF)

- Panel geoprocessing (capstone): **hitung panjang**, **hitung luas**, **buffer** via `POST /api/geo/*` (bukan Turf.js pada layer inti).
- Bbox **opsional** — analisis dapat pada seluruh layer dengan batas `GEO_MAX_FEATURES` (default 500).
- Hasil geometri: layer sementara oranye di peta, toggle tampil/sembunyi, zoom otomatis ke hasil.
- Seleksi peta → FUID untuk MVT (tanpa `featureIndex` di viewport).
- `GET /api/geo/info` (v2, `bboxRequired: false`) untuk cek kompatibilitas backend.
- Dokumentasi: `docs/API_REFERENCE.md`, `docs/GEOPROCESSING_IMPLEMENTATION_PLAN.md`.

## Pembaruan April 2026

### Fitur dan Perubahan Produk

- Portal dan peta kini sepenuhnya konsisten dengan branding SEA-BANDL terbaru.
- Landing page:
    - tombol `Akses Fitur` pada kartu fitur dihapus,
    - CTA utama dirapikan corner radius-nya,
    - logo frame dibuat circular.
- Halaman `/peta`:
    - topbar menambahkan tombol Home di sisi kiri untuk kembali ke beranda,
    - menu Data pada topbar diganti CTA kuning `Request Data`.

### Basemap dan Theme

- Dark mode dinonaktifkan (light-only runtime).
- Default basemap ditetapkan ke `Esri Satellite`.
- Kontrol basemap memakai custom thumbnail control.
- Perbaikan stabilitas switch basemap:
    - urutan purge raster diperbaiki agar layer lama dibersihkan dulu,
    - source hanya dihapus jika tidak lagi direferensikan layer,
    - memperbaiki error `Source "osm" cannot be removed while layer "osm-raster" is using it`.

### Optimasi Struktur Kode

- Runtime map dimodularisasi ke `src/components/map/*` (controls, basemap, bootstrap, sync, interactions).
- Store layer direfaktor menjadi facade tipis `useLayers.ts` + module actions/effects pada `src/store/layers/*`.
- Route-level lazy loading portal dipertahankan untuk menekan beban initial load.

### Catatan Kompatibilitas

- Beberapa catatan lama pada bagian historis (misalnya dark mode aktif dan beberapa detail layout lama) tetap dipertahankan sebagai rekam jejak, namun status runtime saat ini mengikuti bagian April 2026 ini.

## Pembaruan Maret 2026

### 🏗️ Refactor Arsitektur UI

#### Migrasi ke Layout Ribbon

**Perubahan besar:** Sidebar + TopBar dihapus dan diganti dengan layout baru berbasis **Ribbon** (bilah atas 48px) dan floating side panels.

**Layout Baru (`src/App.tsx`):**

```
<div class="app-theme flex h-screen flex-col">
  <Ribbon />               ← bilah atas 48px (panel triggers, toggles, basemap)
  <div class="relative flex-1">
    <MapView />
    <LayerPanel />         ← floating kiri, toggle via Ribbon
    <FilterPanel />        ← floating kiri, toggle via Ribbon
    <GeoPanel />           ← floating kiri, toggle via Ribbon
    <ImportPanel />        ← floating kiri, toggle via Ribbon
    <TablePanel />         ← 62% tinggi dari bawah, horizontal scroll
    <LegendFloating />     ← floating kanan bawah
  </div>
</div>
```

**File terdampak:** `src/App.tsx`, `src/store/useUI.ts`

---

### 🗺️ Refactor Layer IDs — 15 Layer Individual

**Sebelumnya:** 7 layer group (`laut_teritorial`, `zee`, `landas_kontinen`, `zona_tambahan`, `baseline`, `titik_perjanjian`, `basepoints`).

**Sekarang:** 15 layer individual dengan ID unik, masing-masing dengan warna dan pola garis berbeda:

| ID Layer                        | Warna                |
| ------------------------------- | -------------------- |
| `laut_teritorial_sepakat`       | `#1d4ed8` (solid)    |
| `laut_teritorial_perlu`         | `#1d4ed8` (dash)     |
| `zee_sepakat`                   | `#15803d`            |
| `zee_sepakat_ratif`             | `#15803d`            |
| `zee_perlu`                     | `#15803d` (dash)     |
| `landas_kontinen_sepakat`       | `#92400e`            |
| `landas_kontinen_sepakat_ratif` | `#92400e`            |
| `landas_kontinen_perlu`         | `#92400e` (dash)     |
| `landas_kontinen_ekstensi`      | `#92400e` (dot-dash) |
| `zona_tambahan`                 | `#0891b2`            |
| `baseline`                      | `#1e293b`            |
| `basepoints`                    | `#475569`            |
| `titik_perjanjian_lt`           | `#3730a3`            |
| `titik_perjanjian_lk`           | `#3730a3`            |
| `titik_perjanjian_zee`          | `#3730a3`            |

**File terdampak:** `src/components/Map.tsx`, `src/store/useUI.ts` (builderState, DEFAULT_PRESETS)

---

### ✨ Fitur Baru: Koordinat Kursor (Coordinate Overlay)

**Fitur:** Tampilan koordinat real-time di bagian bawah tengah peta saat kursor bergerak di atas peta.

**Implementasi di `src/components/Map.tsx`:**

- State `coords: { lng, lat } | null` untuk menyimpan posisi terakhir.
- `showCoordinatesRef` untuk closure stabil di dalam `map.on(...)` handler.
- Event listener `mousemove` → update coords; `mouseleave` → reset ke `null`.
- Overlay pill berisi format: `6.123456°N  108.654321°E` (atau °S/°W sesuai kuadran).
- Toggle via tombol di Ribbon; state tersimpan di `useUIStore.showCoordinates`.

---

### 🐛 Bug Fixes

#### Perbaikan `useUI.ts` setelah revert tidak sengaja

- `createEmptyBuilderState()`: layer IDs diperbarui dari 7 grup ke 15 layer individual.
- `DEFAULT_PRESETS`: `'zee'`→`'zee_sepakat'`, `'laut_teritorial'`→`'laut_teritorial_sepakat'`, `'landas_kontinen'`→`'landas_kontinen_sepakat'`.
- State baru: `activePanel`, `tableOpen`, `legendOpen`, `showCoordinates` beserta togglenya.
- Export type `ActivePanel` ditambahkan.

#### Perbaikan `App.tsx` setelah revert tidak sengaja

- Import `Sidebar` dan `TopBar` (tidak ada) diganti dengan import komponen yang benar.
- Layout direkonstruksi sesuai arsitektur Ribbon.

#### Perbaikan `Map.tsx` setelah revert tidak sengaja

- `mapLayerConfigs` direkonstruksi dari 7 konfigurasi grup ke 15 konfigurasi layer individual.
- Variabel `zoneColorExpression` yang tidak terpakai dihapus (ESLint warning).

---

### 📝 Dokumentasi Baru

- `docs/CHANGELOG-session.md` — log bug fixes sesi sebelumnya (badge Ribbon, encoding, warna unik, TablePanel layout).
- `docs/data-update-workflow.md` — panduan lengkap 13 bagian untuk memperbarui data GeoJSON layer batas maritim.
- `README.md` — ditulis ulang sepenuhnya: layer list 15 item, deskripsi UI Ribbon, env config diperbarui (hapus referensi MapTiler), tabel dokumentasi.

---

## Pembaruan Desember 2025

### 🎨 UI/UX Improvements

#### Toggle Visibility Enhancement

**Masalah:** Toggle visibility layer tidak terlihat jelas di sidebar, terutama pada layar besar dengan background `bg-slate-100/60`.

**Solusi:**

- **Root Cause:** CSS global override di `theme.css` memaksa semua background menjadi `var(--color-panel)` dengan `!important`, termasuk toggle switch
- **Implementasi:**
    1. Menambahkan CSS custom properties untuk switch colors di `src/styles/theme.css`:
        - Light mode: `--switch-unchecked-bg: #64748b`, `--switch-checked-bg: #2563eb`
        - Dark mode: `--switch-unchecked-bg: #475569`, `--switch-checked-bg: #3b82f6`
    2. Menambahkan exception rule untuk mengecualikan switch dari global override:
        ```css
        .app-theme button[role='switch'] {
        	background-color: revert !important;
        }
        ```
    3. Mengubah `src/components/ui/switch.tsx` untuk menggunakan inline style dengan CSS variables
    4. Menghapus class override yang tidak perlu di `LayerToggles.tsx`

**Hasil:** Toggle switch sekarang terlihat jelas dengan kontras yang baik di semua kondisi (desktop sidebar, mobile sheet, light/dark mode).

---

#### Simplified Layer Toggle Sidebar

**Perubahan:** Menyederhanakan tampilan layer toggles dengan menghilangkan informasi yang tidak penting.

**Before:**

```
[Symbol] [Layer Name] [Geometry Type] [Feature Count] [Toggle]
```

**After:**

```
[Symbol] [Layer Name] [Toggle]
```

**Implementasi di `src/components/LayerToggles.tsx`:**

- Menambahkan konfigurasi `LAYER_SYMBOLS` dengan warna dan tipe untuk setiap layer
- Membuat komponen `LayerSymbol` untuk render simbol point (circle) atau line
- Layout bersih dengan active state yang jelas (blue border/background)
- Simbol visual yang matching dengan warna layer di peta

---

### 🗺️ Map Visualization

#### Line Dash Patterns by Maritime Boundary Status

**Fitur:** Implementasi pola garis berbeda berdasarkan status batas laut.

**Pola Garis:**

1. **Baseline** - `dashArray: [1, 3]` (Kesepakatan belum ratifikasi)
2. **Batas Maritim** - `dashArray: [5, 3]` (Perlu Kesepakatan)
3. **Laut Teritorial & ZEE** - Solid line (Fully ratified)
4. **Landas Kontinen** - `dashArray: [1, 2]` (Unilateral)

**Implementasi:**

- **Map Layer** (`src/components/Map.tsx`):
    - Updated `line-dasharray` di paint config untuk setiap layer
    - Menghapus default `[1, 0]` pada layer yang seharusnya solid
- **Layer Symbol** (`src/components/LayerToggles.tsx`):
    - Menggunakan SVG dengan `strokeDasharray` untuk menampilkan pola di sidebar
    - Simbol sekarang matching dengan tampilan di peta

**Referensi:** Berdasarkan standar "Pola garis berdasarkan StatusLaut" dari PUSHIDROSAL.

---

### 🔧 Geoprocessing Tools

#### New Geoprocessing Tab

**Fitur Baru:** Menambahkan tab "Geoprocessing" di bagian Analisis dengan 10+ operasi geometri menggunakan Turf.js.

**Lokasi:** `src/components/GeoprocessingPanel.tsx`

**Operasi yang Tersedia:**

1. **Buffer**
    - Membuat zona penyangga di sekitar fitur
    - Parameter: Jarak (km)

2. **Hitung Area**
    - Menghitung luas total fitur polygon terpilih
    - Output: km²

3. **Hitung Panjang**
    - Menghitung panjang total garis terpilih
    - Output: km

4. **Centroid**
    - Menemukan titik pusat geometri
    - Output: Jumlah titik pusat yang dibuat

5. **Bounding Box**
    - Membuat kotak pembatas untuk fitur
    - Output: Koordinat [minX, minY, maxX, maxY]

6. **Simplify**
    - Menyederhanakan geometri dengan mengurangi titik
    - Parameter: Tolerance (meter)

7. **Convex Hull**
    - Membuat polygon cembung mengelilingi fitur
    - Output: 1 polygon hasil

8. **Union** _(Placeholder)_
    - Menggabungkan dua layer
    - Akan diimplementasikan dengan WPS

9. **Intersect** _(Placeholder)_
    - Memotong dua layer untuk mendapatkan area tumpang tindih
    - Akan diimplementasikan dengan WPS

10. **Difference** _(Placeholder)_
    - Mengurangi satu layer dari layer lain
    - Akan diimplementasikan dengan WPS

**UI Features:**

- Dropdown untuk memilih operasi dengan deskripsi
- Select layer input dari layer yang tersedia
- Parameter dinamis berdasarkan operasi terpilih
- Support untuk fitur terpilih (selection) atau semua fitur
- Hasil ditampilkan dalam format yang mudah dibaca dengan emoji
- Info banner tentang rencana migrasi ke WPS

**State Management:**

- Updated `src/store/useUI.ts` untuk menambahkan type `'geoprocessing'` ke `SidebarTab`
- Tab grid updated dari 2 kolom menjadi 3 kolom di `src/components/Sidebar.tsx`

**Future Plan:** Semua operasi akan diganti dengan WPS (Web Processing Service) untuk server-side processing ketika aplikasi sudah deploy ke VPS.

---

### 🐛 Bug Fixes

#### ESLint Warnings

**Fixed Issues:**

1. `LayerToggles.tsx` - Parameter `isActive` tidak digunakan → Dihapus dari destructuring
2. `LayerToggles.tsx` - Parameter `compact` tidak digunakan → Diprefix dengan `_compact`
3. `LayerToggles.tsx` - Missing `user_layer` di `LAYER_SYMBOLS` → Ditambahkan dengan warna teal `#14b8a6`

---

### 📁 Files Modified

**Core Components:**

- `src/components/ui/switch.tsx` - Switch component dengan CSS variables
- `src/components/LayerToggles.tsx` - Simplified layout dengan visual symbols
- `src/components/Map.tsx` - Line dash patterns untuk maritime boundaries
- `src/components/Sidebar.tsx` - Added Geoprocessing tab
- `src/components/GeoprocessingPanel.tsx` - **New File** - Geoprocessing operations

**Styles:**

- `src/styles/theme.css` - CSS variables untuk switch colors dan exception rule

**State Management:**

- `src/store/useUI.ts` - Updated SidebarTab type

---

### 🎯 Technical Improvements

1. **CSS Architecture**
    - Solved CSS specificity issues with global theme overrides
    - Introduced CSS custom properties for component-level theming
    - Better separation of concerns between theme and component styles

2. **TypeScript**
    - Fixed all ESLint warnings
    - Proper type definitions for new Geoprocessing operations
    - Type-safe layer and operation configurations

3. **Component Design**
    - More modular and reusable components
    - Proper state management for complex operations
    - Better user feedback with loading states and result messages

---

### 📊 Statistics

- **New Components:** 1 (GeoprocessingPanel)
- **Modified Components:** 5
- **New Features:** 10+ geoprocessing operations
- **Bug Fixes:** 4 ESLint warnings
- **CSS Enhancements:** 2 major improvements
- **UX Improvements:** 3 (toggle visibility, simplified sidebar, line patterns)

---

### 🚀 Future Roadmap

1. **WPS Integration**
    - Replace Turf.js operations with Web Processing Service
    - Server-side processing for heavy operations
    - Support untuk operasi Union, Intersect, Difference yang kompleks

2. **Result Visualization**
    - Display hasil geoprocessing sebagai temporary layer di peta
    - Export hasil ke GeoJSON/Shapefile
    - History operasi geoprocessing

3. **Advanced Operations**
    - Clip, Erase, Merge
    - Spatial Join
    - Overlay Analysis
    - Network Analysis

---

### 📝 Notes

- Semua perubahan telah ditest dan tidak ada compilation errors
- Aplikasi tetap backward compatible
- Performance tidak terpengaruh oleh perubahan ini
- UI/UX improvements meningkatkan user experience secara signifikan

---

**Dokumentasi dibuat:** 9 Desember 2025  
**Versi:** 1.0.0  
**Status:** ✅ Production Ready
