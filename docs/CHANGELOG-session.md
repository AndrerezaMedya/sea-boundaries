# Changelog — Sesi Perbaikan SEA-BANDL WebGIS

> **Tanggal sesi:** 5 Maret 2026  
> **Deployment target:** https://project1-seaboundaries.web.app  
> **Stack:** React 19 + TypeScript + Vite 7 + MapLibre GL JS v5.7.3 + Zustand + TailwindCSS + Firebase Hosting

---

## Update Lanjutan - April 2026

> **Tanggal sesi:** 2-3 April 2026  
> **Deployment target:** https://project1-seaboundaries.web.app

### Ringkasan Perubahan Utama

| Area | Perubahan | Status |
|---|---|---|
| Theme | Migrasi light-only, dark mode dinonaktifkan | ✅ |
| Basemap | Default `esri` + custom thumbnail control | ✅ |
| Basemap Runtime | Fix error purge source/layer (`osm-raster` vs `osm`) | ✅ |
| Topbar Peta | Tambah tombol Home kiri, CTA Request Data konsisten | ✅ |
| Landing Page | Tombol kartu `Akses Fitur` dihapus, CTA utama dirapikan | ✅ |
| Branding | Logo `/docs/logo_sea-bandl.png` dipakai konsisten | ✅ |
| Stabilitas Render | Inisialisasi source/layer diperkuat saat map load | ✅ |
| Optimasi Kode | Runtime map + store layer tetap modular pasca refactor | ✅ |

### Detail Teknis Penting

1. **Light-only runtime**
  - Store theme tidak lagi memiliki branch dark aktif.
  - Bootstrap root theme dipaksa ke light.

2. **Basemap switching stabil**
  - Purge raster artifacts diperbarui untuk:
    - menghapus layer raster terkait source lama terlebih dulu,
    - menghapus source hanya jika tidak lagi dipakai layer mana pun.
  - Mencegah kegagalan switch akibat source masih direferensikan.

3. **Perbaikan UX topbar peta**
  - Tombol Home ditambahkan di kiri paling awal agar akses kembali ke portal lebih cepat.
  - Aksi Request Data dibuat eksplisit dalam bentuk tombol CTA.

4. **Sinkronisasi dokumen dan UI portal**
  - Elemen landing yang tidak relevan terhadap alur aktual disederhanakan.
  - Gaya corner tombol utama diseragamkan.

### Validasi

- `npm run build` berhasil setelah seluruh patch April 2026.
- Deploy hosting berhasil dan tidak ada error TypeScript baru pada file yang dimodifikasi.

---

## Ringkasan Semua Perubahan

| # | Masalah | File yang Diubah | Status |
|---|---------|-----------------|--------|
| 1 | Badge nama layer di Ribbon header | `src/components/Ribbon.tsx` | ✅ |
| 2 | Mojibake `â€"` pada label nama layer | `src/lib/schema.ts` | ✅ |
| 3 | Warna sub-layer tidak unik (duplikat warna) | `src/components/Map.tsx`, `src/components/LayerToggles.tsx`, `src/lib/schema.ts` | ✅ |
| 4 | Tabel atribut tidak menampilkan baris data | `src/components/AttributeTable.tsx`, `src/components/panels/TablePanel.tsx` | ✅ |

---

## 1. Penghapusan Badge Nama Layer di Ribbon

### Masalah
Header ribbon menampilkan badge bertuliskan nama layer yang aktif (contoh: `"TITIK DASAR"`) di sebelah kanan brand `SEA-BANDL`. Ini dinilai tidak perlu dan mengganggu tampilan.

### File: `src/components/Ribbon.tsx`

**Yang dihapus:**
```tsx
// Dihapus: import yang tidak lagi dipakai
import { getLayerSchema } from '@/lib/schema';
import { useReadableColor } from '@/hooks/useReadableColor';

// Dihapus: variabel yang dibangun dari import tersebut
const schema = getLayerSchema(activeLayerId);
const badgeTextColor = useReadableColor(schema.color ?? '#1d4ed8');

// Dihapus: elemen JSX badge itu sendiri
<span
  className="..."
  style={{ background: schema.color, color: badgeTextColor }}
>
  {schema.label}
</span>
```

**Hasil:** Ribbon sekarang hanya menampilkan brand `SEA-BANDL` dan angka jumlah fitur yang terfilter.

---

## 2. Perbaikan Encoding Mojibake `â€"` pada Label Layer

### Masalah
Sebanyak 13 label layer di `schema.ts` menampilkan karakter `â€"` (tiga karakter aneh) alih-alih em dash `—`. Juga terdapat `Â²` di salah satu label alih-alih `²`.

**Contoh sebelum fix:**
```
'Laut Teritorial â€" Sepakat'
'ZEE â€" Perlu Kesepakatan'
'Luas (kmÂ²)'
```

### Root Cause
File `schema.ts` pernah di-save ulang oleh editor (VS Code) dalam encoding **Windows-1252** (cp1252). Byte UTF-8 untuk em dash `—` adalah `E2 80 94` (3 byte), dan ketika dibaca sebagai cp1252 masing-masing byte tersebut diinterpretasikan sebagai karakter berbeda:
- `E2` → `â` (U+00E2)
- `80` → `€` (U+20AC, Euro sign)
- `94` → `"` (U+201D, right double quotation mark)

Hasil penggabungannya: `â€"` — inilah yang disebut **mojibake**.

### Fix
Digunakan skrip Node.js langsung di terminal untuk mengganti byte mojibake → karakter yang benar:

```js
node -e "
  const fs = require('fs');
  let s = fs.readFileSync('src/lib/schema.ts', 'utf8');
  s = s.replaceAll('\u00e2\u20ac\u201d', '\u2014'); // â€" → —
  s = s.replaceAll('\u00c2\u00b2', '\u00b2');        // Â² → ²
  fs.writeFileSync('src/lib/schema.ts', s, 'utf8');
"
```

**Jumlah kemunculan yang diperbaiki:** 13 instance `â€"` + 1 instance `Â²`

**Contoh sesudah fix:**
```
'Laut Teritorial — Sepakat'
'ZEE — Perlu Kesepakatan'
'Luas (km²)'
```

---

## 3. Penyeragaman dan Keunikan Warna per Layer

### Masalah
Semua sub-layer dalam satu grup menggunakan warna yang sama. Contoh:
- `laut_teritorial_sepakat` dan `laut_teritorial_perlu` keduanya `#2563eb`
- Semua sub-layer ZEE `#16a34a`
- Semua sub-layer Landas Kontinen `#f59e0b`

### Solusi
Setiap dari 15 `CoreLayerId` kini memiliki warna unik yang konsisten di tiga tempat sekaligus: `Map.tsx`, `LayerToggles.tsx`, dan `schema.ts`.

### Tabel Warna Resmi (Single Source of Truth)

| Layer ID | Label | Warna | Tipe Garis |
|---|---|---|---|
| `laut_teritorial_sepakat` | LT — Sepakat | `#1d4ed8` | Solid |
| `laut_teritorial_perlu` | LT — Perlu Kesepakatan | `#6366f1` | Dash `[4,2]` |
| `zee_sepakat` | ZEE — Sepakat | `#15803d` | Solid |
| `zee_sepakat_ratif` | ZEE — Sepakat, Perlu Ratifikasi | `#22c55e` | Dash `[4,2]` |
| `zee_perlu` | ZEE — Perlu Kesepakatan | `#84cc16` | Dash `[2,2]` |
| `landas_kontinen_sepakat` | LK — Sepakat | `#92400e` | Solid |
| `landas_kontinen_sepakat_ratif` | LK — Sepakat, Perlu Ratifikasi | `#c2410c` | Dash `[4,2]` |
| `landas_kontinen_perlu` | LK — Perlu Kesepakatan | `#f59e0b` | Dash `[2,2]` |
| `landas_kontinen_ekstensi` | LK Ekstensi | `#f97316` | Fill (polygon) |
| `zona_tambahan` | Zona Tambahan | `#0891b2` | Solid |
| `baseline` | Garis Pangkal | `#1e293b` | Dash `[1,3]` |
| `titik_perjanjian_lt` | Titik Perjanjian — LT | `#3730a3` | Circle |
| `titik_perjanjian_lk` | Titik Perjanjian — LK | `#78350f` | Circle |
| `titik_perjanjian_zee` | Titik Perjanjian — ZEE | `#0d9488` | Circle |
| `basepoints` | Titik Dasar | `#475569` | Circle |

### Warna Dot Grup (di sidebar LayerToggles)
Warna dot grup = warna primary sub-layer pertama dalam grup tersebut:

| Grup | Warna Dot |
|---|---|
| Laut Teritorial | `#1d4ed8` |
| ZEE | `#15803d` |
| Landas Kontinen | `#92400e` |
| Zona Tambahan | `#0891b2` |
| Garis Pangkal | `#1e293b` |
| Titik Perjanjian | `#3730a3` |
| Titik Dasar | `#475569` |

### File yang Diubah
- **`src/components/Map.tsx`** — `mapLayerConfigs`: warna line-color / circle-color / fill-color per layer
- **`src/components/LayerToggles.tsx`** — `LAYER_SYMBOLS`: warna ikon/simbol di sidebar (harus identik dengan Map.tsx)
- **`src/lib/schema.ts`** — `LAYER_GROUPS`: warna dot akordion per grup

---

## 4. Perbaikan Tabel Atribut Tidak Menampilkan Baris Data

### Masalah
Panel tabel atribut menampilkan header kolom dan footer pagination (misal: "Menampilkan 8 dari 8 baris"), namun area data di tengah tampak kosong — tidak ada satu baris pun yang terlihat.

### Root Cause (Dua Penyebab)

**Penyebab 1 — Tinggi panel terlalu kecil (42%)**  
`TablePanel.tsx` memiliki height `42%` dari tinggi jendela. Untuk layer dengan 13 kolom, checkbox filter kolom membutuhkan banyak ruang secara vertikal karena mereka **wrap** ke baris baru (`flex-wrap`). Akibatnya hampir semua ruang vertikal habis untuk header + checkbox row + footer, menyisakan ~0px untuk baris data.

**Penyebab 2 — `flex-wrap` pada checkbox kolom**  
Checkbox filter bisa melipat ke 2–3 baris tergantung jumlah kolom, memakan ruang vertikal yang seharusnya untuk tabel.

**Penyebab 3 — `overflow-hidden` pada wrapper konten panel**  
`flex-1 overflow-hidden p-3` memotong konten sebelum bisa scroll.

### Fix

#### `src/components/panels/TablePanel.tsx`
```diff
- height: '42%'
+ height: '62%'

- className="flex-1 overflow-hidden p-3"
+ className="flex min-h-0 flex-1 flex-col"
```

#### `src/components/AttributeTable.tsx`

| Bagian | Sebelum | Sesudah |
|---|---|---|
| Root div | tidak ada `h-full flex-col` | `flex h-full flex-col overflow-hidden` |
| Header | Ada teks subtitle + padding besar | Single row, `py-2 px-4`, tanpa subtitle |
| Filter/checkbox row | `flex-wrap` (multi-baris) | `overflow-x-auto` (satu baris, horizontal scroll) |
| Setiap checkbox label | tidak ada `shrink-0` | `shrink-0 whitespace-nowrap` |
| Area tabel | tidak ada `min-h-0` | `min-h-0 flex-1 overflow-auto` |
| Pagination | tidak ada `flex-shrink-0` | `flex-shrink-0 border-t` |
| Import `<Input>` | `import { Input } from '@/components/ui/input'` | Dihapus; diganti native `<input type="text">` |

---

## Build & Deploy Log

```
> npm run build
✓ built in 11.96s   ← zero TypeScript errors

> firebase deploy --only hosting
+ Deploy complete!
Hosting URL: https://project1-seaboundaries.web.app
```

---

## File Inventory (yang Dimodifikasi dalam Sesi Ini)

| File | Jenis Perubahan |
|---|---|
| `src/components/Ribbon.tsx` | Hapus badge label layer |
| `src/lib/schema.ts` | Fix encoding mojibake; update warna grup |
| `src/components/Map.tsx` | Unique color per layer di `mapLayerConfigs` |
| `src/components/LayerToggles.tsx` | Sync warna di `LAYER_SYMBOLS` |
| `src/components/AttributeTable.tsx` | Fix layout flex chain + single-row checkbox |
| `src/components/panels/TablePanel.tsx` | Height 42% → 62%, fix wrapper overflow |
