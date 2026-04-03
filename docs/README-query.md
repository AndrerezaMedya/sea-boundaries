# Algoritma Query & Fungsi Spesifik

Dokumen ini memaparkan cara Query Builder bekerja, bagaimana filter dievaluasi, serta fungsi spesifik yang menyambungkan hasil kueri dengan peta dan tabel atribut.

## 1. Struktur Data Filter

Semua logika filter mengacu pada tipe di `src/lib/types.ts`:

- **`FilterDefinition`** — objek utama yang memuat daftar `conditions`, daftar `groups`, dan `join` global (`all` = AND, `any` = OR).
- **`FilterCondition`** — satu aturan filter (`field`, `operator`, `value`, tipe data, dan opsional `groupId`).
- **`FilterGroup`** — kumpulan kondisi dengan operator internal AND/OR; dipakai untuk membuat kombinasi bersarang.

Builder Query di `QueryBuilder.tsx` menyimpan definisi ini per layer pada `useUIStore` (`builderState`).

## 2. Proses Query Builder (UI)

1. **Menambah kondisi** → `addCondition()` memilih field pertama pada skema layer aktif (`getLayerSchema`).
2. **Mengganti field/operator** → `handleFieldChange()` & `handleOperatorChange()` menyesuaikan tipe nilai dan operator yang valid.
3. **Memasukkan nilai** → `handleValueChange()`/`handleSecondValueChange()` melakukan parsing sesuai tipe (`number`, `date`, `string`).
4. **Menyimpan preset** → `createPreset()` di `useUIStore` menyimpan `FilterDefinition` untuk layer tertentu.
5. **Meninjau ekspresi** → `handlePreview()` memanggil `toMapLibreFilter()` dan menampilkan JSON MapLibre Filter agar pengguna dapat memverifikasi hasil kompilasi.

Semua perubahan builder tersimpan secara imutabel lewat `updateBuilderState()` sehingga UI bereaksi tanpa merusak definisi awal.

## 3. Kompilasi ke Filter MapLibre

Fungsi kunci: `toMapLibreFilter(layerId, definition)` di `lib/filterExpr.ts`.

Alur kerja:

```
for setiap kondisi → tentukan FieldSchema → bangun ekspresi sesuai tipe
- number/date → `buildNumericExpression`
- string → `buildStringExpression`
kelompokkan kondisi sesuai groupId → gabungkan dengan operator join (AND/OR)
```

Hasil akhir berupa array ekspresi MapLibre (`FilterExpression`) yang bisa langsung dipakai sebagai `layer.filter` pada MapLibre.

## 4. Evaluasi Filter di Sisi Store

Selain ekspresi MapLibre, store juga memerlukan evaluasi manual untuk tabel dan pemilihan fitur. Fungsi pendukung:

- **`featureMatchesFilter(layerId, feature, definition)`** — mengevaluasi suatu `FeatureWithProps` terhadap definisi menggunakan helper `evaluateNumeric`, `evaluateString`, dan `evaluateConditionList`.
- **`applyFilter()`** di `useLayersStore` menjalankan langkah berikut:
    1. Ambil `LayerRuntimeState` aktif.
    2. Panggil `toMapLibreFilter()` untuk mendapatkan ekspresi MapLibre → disimpan di `filterExpression`.
    3. Filter ulang `features` menggunakan `featureMatchesFilter()` → hasil ID disimpan pada `filteredIds`.
    4. `selectionIds` yang tidak lagi masuk `filteredIds` dibersihkan.
    5. Jika layer inti, filter diserialisasi ke `localStorage` supaya bertahan antar sesi.
    6. `tableRows` diperbarui lewat `buildTableRows()` apabila layer yang difilter adalah layer aktif di UI.

`clearFilter()` melakukan kebalikan: mengembalikan `filterExpression` ke `['all']`, mengisi `filteredIds` dengan seluruh fitur, mengosongkan seleksi, dan menghapus persistensi.

## 5. Sinkronisasi Saat Filter Diterapkan

Perubahan `filteredIds`, `filterExpression`, dan `selectionIds` memicu beberapa bagian aplikasi:

- **Map (`Map.tsx`)**
    - Mengambil `layersState` dari store.
    - Memperbarui sumber GeoJSON dan layer `filtered/selection/hover` menggunakan `buildIdMatchExpression(filteredIds)`.
    - Jika ada `pendingZoom`, map melakukan `fitBounds`/`flyTo` lalu memanggil `consumeZoomRequest()`.
- **AttributeTable.tsx**
    - Memakai `tableRows` untuk merender baris dan melakukan pagination.
    - Saat pengguna memilih/hover suatu baris, store dipanggil (`setSelection`, `setHoveredFeature`) sehingga Map melakukan highlight dan popup.
- **Pop-up Map**
    - Pada klik fitur, Map memanggil `getFeatureById()` untuk memuat properti teraktual (sesuai filter) sebelum menampilkan HTML popup (`buildPopupHtml`).

## 6. Pengambilan Nilai Unik untuk Query

`getUniqueValues(layerId, field)` di store menyediakan daftar nilai maximum `UNIQUE_VALUE_LIMIT` (default 200) untuk membantu pengguna memilih nilai field. Mekanisme:

1. Cek cache (`uniqueValueCache`).
2. Jika belum ada, iterasi semua fitur layer, normalisasi nilai sesuai tipe, dan simpan ke cache.
3. Hasil digunakan oleh panel "Show values" pada Query Builder.

## 7. Peran Fungsi Spesifik Lain

| Fungsi                                         | Lokasi                          | Peran                                                                                                                                |
| ---------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `parseUserGeoJson(raw, options)`               | `lib/userLayer.ts`              | Memvalidasi GeoJSON pengguna, memastikan geometri homogen, membuat schema field, menambahkan `__fid`, dan menentukan `geometryType`. |
| `buildLayerState(layerId, schema, collection)` | `store/layers/stateBuilders.ts` | Membungkus data menjadi bentuk siap-render (index, filter, visibilitas, render kind). Dipakai untuk layer inti dan user.             |
| `buildTableRows(layerId, layer)`               | `store/layers/stateBuilders.ts` | Mengonversi `filteredIds` ke array baris tabel dengan properti yang sudah disalin dari feature.                                      |
| `buildPopupHtml(feature, schema)`              | `lib/map.ts`                    | Menghasilkan markup popup berdasarkan `popupFields` layer.                                                                           |
| `requestZoomToIds(layerId, ids, padding)`      | `store/layers/actions/zoom.ts`  | Mengantre permintaan zoom; Map membaca `pendingZoom` untuk mengatur viewport.                                                        |
| `buildIdMatchExpression(ids)`                  | `lib/filterExpr.ts`             | Membuat ekspresi MapLibre praktis untuk menyeleksi ID tertentu (dipakai untuk layer "filtered", "selection", dan "hover").           |

## 8. Urutan Lengkap Saat Pengguna Menjalankan Query

1. Pengguna menambah kondisi di Query Builder sampai valid (`conditions.every(conditionIsComplete)`).
2. Klik **Apply** memanggil `handleApply()`:
    - Validasi -> `applyFilter(activeLayerId, cloneDefinition(builder))`.
3. `applyFilter()` memperbarui store (lihat Bagian 4).
4. Map hook mendeteksi perubahan `layersState` → memperbarui filter & styling.
5. Attribute Table menerima `tableRows` baru → tabel menampilkan hanya fitur yang lolos filter.
6. Pengguna dapat klik baris → `setSelection()` → Map highlight; atau klik pada peta → Map memanggil `setSelection()` lalu memindahkan fokus ke baris yang sama.

Dengan pemahaman ini, kamu dapat menjelaskan bagaimana Query Builder menerjemahkan input pengguna menjadi filter MapLibre, bagaimana hasilnya konsisten di peta, tabel, dan popup, serta fungsi mana yang bertanggung jawab pada setiap tahap.
