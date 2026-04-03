# Theme Mapping (Current State: Light-Only)

## Scope

Dokumen ini memetakan implementasi tema saat ini setelah dark mode dinonaktifkan.

## Status Ringkas

- Theme aplikasi saat ini: `light` only.
- Toggle dark mode di UI sudah dihapus/dinonaktifkan.
- Store theme tetap dipertahankan untuk kompatibilitas, namun setter/toggle selalu mengarah ke `light`.

## Runtime Entry Points

- `src/main.tsx`
    - Bootstrap root untuk mode terang.
    - Menetapkan class/data theme agar konsisten pada initial render.

- `src/store/useTheme.ts`
    - `ThemeMode` hanya `light`.
    - `setTheme()` dan `toggleTheme()` dipaksa menetapkan `light`.

## UI Trigger Points

- `src/components/Ribbon.tsx`
    - Dropdown Tampilan menampilkan status informatif `Mode Terang Aktif`.
    - Tidak ada lagi tombol switch tema.

## Basemap Coupling

- `src/data/basemaps.ts`
    - Hanya punya satu tema basemap: `light`.
    - Default basemap untuk tema light: `esri`.

- `src/data/mapStyles.ts`
    - Style map hanya `light`.

- `src/components/map/controlsRuntime.ts`
    - Basemap switching berjalan di konteks light-only.

- `src/components/map/basemapRuntime.ts`
    - Basemap IDs dikelola hanya untuk `light`.
    - Purge raster source/layer memakai urutan aman agar switching stabil.

## CSS Layer

- `src/styles/theme.css`
    - Variabel dark mode sudah tidak dipakai.
    - Fokus pada token light mode dan styling kontrol map.
    - Override global yang terlalu agresif telah dipangkas untuk mencegah konflik utility classes.

## Dampak Positif Setelah Migrasi Light-Only

1. Mengurangi coupling lintas sistem (UI theme, basemap, map style).
2. Menghilangkan bug inkonsistensi warna teks/topbar akibat override global.
3. Menyederhanakan state management dan bootstrap root theme.
4. Mengurangi regresi saat load awal map dan saat switching basemap.

## Catatan Pemeliharaan

- Jika dark mode ingin diaktifkan lagi, lakukan sebagai fitur baru terpisah dengan test matrix khusus (UI + map runtime + basemap runtime), bukan rollback parsial.
