# Log Detail Integrasi Portal SEA-BANDL (Step 1-8)

Dokumen ini merekam detail perubahan yang telah dilakukan selama integrasi hasil desain Figma ke aplikasi WebGIS existing, dengan pendekatan aman dan bertahap.

## Tujuan Integrasi

1. Menambahkan portal entry yang modern tanpa merusak alur WebGIS inti.
2. Mengadopsi desain Figma secara selektif (struktur, visual, copy) tanpa membawa dependency berlebih.
3. Menjaga kompatibilitas stack existing: React + Vite + TypeScript + Tailwind + MapLibre + Zustand.

## Ringkasan Keputusan Teknis

1. Tidak melakukan copy-paste penuh folder from-figma-ai karena mismatch dependency dan pattern build.
2. Mengimplementasikan route-level integration di codebase utama agar maintainable.
3. Menjaga halaman peta lama tetap utuh dengan memindah shell lama ke route tersendiri.
4. Melakukan validasi build tiap step untuk mencegah regresi.

## Step 0 - Audit & Perencanaan

### Yang dilakukan

1. Audit struktur frontend existing dan alur data/store.
2. Audit komponen Figma (Landing, Request Data, User Guide).
3. Identifikasi gap kompatibilitas (asset scheme, motion lib, UI kit duplikatif).
4. Menyusun roadmap integrasi bertahap.

### Hasil

1. Strategi integrasi selektif disetujui.
2. Risiko dependency blow-up dihindari sejak awal.

## Step 1 - Fondasi Routing Portal

### Tujuan

Membuat arsitektur route portal baru, tanpa mengganggu WebGIS lama.

### Perubahan utama

1. Menambahkan React Router di aplikasi utama.
2. Memecah halaman menjadi:
   - `/` portal landing.
   - `/request-data`.
   - `/request-data/success`.
   - `/user-guide`.
   - `/peta` untuk shell WebGIS lama.
3. Membungkus aplikasi dengan provider router.
4. Membuat komponen layout portal dan navbar portal.

### File terdampak (utama)

1. `src/App.tsx`
2. `src/main.tsx`
3. `src/pages/WebGisPage.tsx`
4. `src/pages/PortalHomePage.tsx`
5. `src/pages/RequestDataPage.tsx`
6. `src/pages/RequestDataSuccessPage.tsx`
7. `src/pages/UserGuidePage.tsx`
8. `src/components/portal/PortalNav.tsx`
9. `src/components/portal/PortalPageLayout.tsx`
10. `package.json` (dependency router)

### Verifikasi

1. Build berhasil.

## Step 2 - Integrasi Landing Page

### Tujuan

Mengubah halaman beranda portal dari placeholder ke landing yang siap pakai.

### Perubahan utama

1. Menerapkan hero section + CTA.
2. Menambah stat cards dan feature cards.
3. Menambah CTA section dan footer portal.
4. Menyelaraskan gaya dengan palet SEA-BANDL.

### File terdampak

1. `src/pages/PortalHomePage.tsx`
2. `src/components/portal/PortalNav.tsx`

### Verifikasi

1. Build berhasil.
2. Tidak ada error pada file modifikasi.

## Step 3 - Integrasi Request Data Flow

### Tujuan

Menggantikan placeholder request dengan form fungsional end-to-end.

### Perubahan utama

1. Membuat komponen form dedicated dengan state + validasi field.
2. Validasi email, telepon, serta field wajib.
3. Validasi lampiran:
   - format: PDF/DOC/DOCX/JPG/PNG.
   - batas ukuran: 5MB.
4. Menampilkan feedback toast untuk kasus invalid.
5. Menavigasi ke halaman sukses dengan route state.
6. Menampilkan ringkasan submit di halaman sukses.

### File terdampak

1. `src/components/portal/RequestDataForm.tsx` (baru)
2. `src/pages/RequestDataPage.tsx`
3. `src/pages/RequestDataSuccessPage.tsx`

### Verifikasi

1. Build berhasil.
2. Pemeriksaan diagnostics: tidak ada error pada file terkait.

## Step 4 - Integrasi User Guide

### Tujuan

Mengubah User Guide dari placeholder menjadi panduan operasional yang usable.

### Perubahan utama

1. Menambahkan hero guidebook dan CTA operasional.
2. Menambahkan blok langkah penggunaan (quick steps).
3. Menambahkan alur fitur inti dan FAQ singkat.
4. Menambahkan CTA transisi ke peta dan request data.

### File terdampak

1. `src/pages/UserGuidePage.tsx`

### Verifikasi

1. Build berhasil.

## Step 5 - Optimasi & Dokumentasi

### Tujuan

Meningkatkan performa awal portal dan merapikan dokumentasi implementasi.

### Perubahan utama

1. Mengaktifkan lazy loading per route portal menggunakan `React.lazy` + `Suspense`.
2. Menambah fallback loading saat chunk halaman dimuat.
3. Menambahkan blok tautan dokumentasi teknis di halaman User Guide.
4. Menyediakan dokumen teknis di `public/docs` agar bisa diakses langsung dari UI.
5. Menulis dokumen ini sebagai log detail implementasi.

### File terdampak

1. `src/App.tsx`
2. `src/pages/UserGuidePage.tsx`
3. `docs/PORTAL_INTEGRATION_STEPS.md` (baru)
4. `public/docs/README-general.md` (publish copy)
5. `public/docs/README-query.md` (publish copy)
6. `public/docs/PORTAL_INTEGRATION_STEPS.md` (publish copy)

### Verifikasi

1. Build berhasil setelah lazy loading aktif.
2. Route portal tetap berjalan normal.

## Step 6 - Full Parity Landing (Figma)

### Tujuan

Mencapai parity visual dan UX yang lebih penuh terhadap desain landing Figma, termasuk section yang sebelumnya belum masuk.

### Perubahan utama

1. Menambahkan dependency animasi `motion` untuk transisi halus dan reveal per section.
2. Meng-upgrade navbar portal agar mendukung:
   - navigasi anchor section (`hero`, `tentang`, `syarat`, `kontak`) pada halaman landing.
   - transisi lintas halaman ke section tertentu melalui route state.
   - state active section dan mobile menu yang konsisten.
3. Membangun ulang landing page dengan struktur parity:
   - Hero + stat cards.
   - Fitur unggulan.
   - Section Tentang.
   - Section Syarat & Ketentuan.
   - CTA konversi.
   - Footer + kontak.
4. Menambahkan animasi masuk bertahap untuk meningkatkan quality UX tanpa mengubah route utama aplikasi.

### File terdampak

1. `src/components/portal/PortalNav.tsx`
2. `src/pages/PortalHomePage.tsx` (rewrite)
3. `package.json` (dependency `motion`)
4. `package-lock.json`

### Verifikasi

1. Diagnostics: tidak ada error pada file landing dan navbar.
2. Build produksi berhasil setelah perubahan parity.

## Step 7 - Topbar Parity dan Light-Only Consolidation

### Tujuan

Menyamakan pengalaman topbar `/peta` dengan arahan visual terbaru dan menonaktifkan dark mode yang menimbulkan regresi UI.

### Perubahan utama

1. Menonaktifkan dark mode end-to-end (store, bootstrap, style map, basemap mapping).
2. Menyetel default basemap ke `Esri Satellite`.
3. Menghapus dependency perilaku UI topbar yang tidak diperlukan dan menggantinya dengan CTA jelas.
4. Menambahkan tombol Home di sisi kiri topbar peta agar navigasi kembali ke portal lebih cepat.

### File terdampak

1. `src/store/useTheme.ts`
2. `src/main.tsx`
3. `src/data/basemaps.ts`
4. `src/data/mapStyles.ts`
5. `src/components/Ribbon.tsx`
6. `src/styles/theme.css`

### Verifikasi

1. Build produksi berhasil.
2. Tampilan topbar konsisten dengan mode terang.

## Step 8 - Basemap Runtime Stabilization dan UX Finishing

### Tujuan

Memulihkan kestabilan basemap switch serta memastikan render layer tidak hilang saat load awal atau setelah pergantian basemap.

### Perubahan utama

1. Mengganti orchestration basemap UI ke `BasemapThumbnailControl` kustom agar perilaku lebih terkontrol.
2. Menambahkan fallback inisialisasi source/layer pada event `map load`.
3. Memperbaiki purge raster artifacts agar aman terhadap layer/source legacy (`osm-raster`/`osm`).
4. Menyempurnakan elemen branding portal (logo frame circular, tombol kartu fitur disederhanakan).

### File terdampak

1. `src/components/map/controlsRuntime.ts`
2. `src/components/map/basemapRuntime.ts`
3. `src/components/Map.tsx`
4. `src/pages/PortalHomePage.tsx`

### Verifikasi

1. Build produksi berhasil setelah patch stabilisasi.
2. Basemap dapat switch tanpa error runtime source/layer.
3. Render layer operasional tetap muncul setelah load.

## Catatan Risiko & Status

1. Warning ukuran bundle masih muncul, namun dampaknya sudah diturunkan melalui route-level lazy loading.
2. Folder `from-figma-ai` tetap dijadikan referensi desain, bukan source runtime utama.
3. Fitur submit Request Data saat ini bersifat client flow (belum terhubung endpoint backend).
4. Chunk `WebGisPage` masih besar dan menjadi kandidat utama optimasi lanjutan.

## Next Step yang Disarankan

1. Hubungkan form request ke API backend + status tracking.
2. Split chunk lebih lanjut untuk module peta berat (MapLibre + panel) jika diperlukan.
3. Tambahkan test skenario route portal (anchor navigation + cross-page scroll) dan validasi form.
