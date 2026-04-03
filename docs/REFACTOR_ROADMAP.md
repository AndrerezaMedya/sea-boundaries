# Refactor Roadmap: Anti-Spaghetti Plan

## Tujuan

1. Menurunkan coupling antar modul agar perubahan fitur tidak memicu regresi lintas area.
2. Memecah file dan store yang terlalu besar agar onboarding dan debugging lebih cepat.
3. Menyiapkan arsitektur untuk roadmap backend (WFS, WPS, auth) tanpa rewrite besar.

## Baseline Saat Ini

1. File terbesar ada di area map runtime dan state orchestration.
2. Kondisi aktual file kunci (April 2026):
    - `src/components/Map.tsx` (286 lines)
    - `src/store/useLayers.ts` (18 lines, facade store)
    - `src/components/QueryBuilder.tsx` (547 lines)
    - `src/components/panels/FilterPanel.tsx` (439 lines)
    - `src/components/Ribbon.tsx` (179 lines)
3. Runtime map sudah dimodularisasi di `src/components/map/*`.
4. Store layer sudah dipisah ke `src/store/layers/*`.

## Progress Status (April 2026)

1. Sprint 0 (Guard Rails): **Done**
    - Build/lint loop menjadi standar verifikasi setiap sesi perubahan besar.
2. Sprint 1 (Decompose Map Runtime): **Done**
    - Map runtime dipisah ke modul controls/basemap/bootstrap/sync/interactions.
3. Sprint 2 (Split Layer Store): **Done**
    - `useLayers.ts` menjadi facade; logic berpindah ke modules per concern.
4. Sprint 3 (Unify Filter Engine): **In Progress**
    - Query core sudah stabil, namun simplifikasi duplikasi UI-filter masih bisa dilanjutkan.
5. Sprint 4 (Data Access Abstraction): **Planned**
    - Belum dimulai penuh; masih local static-first untuk runtime produksi saat ini.

## Prinsip Refactor

1. Incremental and safe: tidak ada big-bang rewrite.
2. Behavior parity: output UI dan data tetap sama sebelum/sesudah refactor.
3. One concern per module: pisahkan map rendering, interaction, basemap, dan popup flow.
4. Backward-compatible API: komponen existing tetap bisa dipakai selama transisi.

## Sprint Plan

## Sprint 0 (1-2 hari): Guard Rails

1. Tambahkan checklist smoke test manual untuk flow kritis:
    - load map, toggle layer, apply filter, query builder apply, popup detail, table export.
2. Definisikan target maintainability:
    - tidak ada file baru > 400 lines.
    - turunkan `Map.tsx` ke < 700 lines.
    - turunkan `useLayers.ts` ke < 350 lines.
3. Buat baseline build metrics sederhana dari output `vite build`.

## Sprint 1 (3-5 hari): Decompose Map Runtime

1. Pecah `src/components/Map.tsx` menjadi modul terpisah:
    - map layer config module.
    - basemap controller module.
    - popup interaction module.
    - pointer/hover/select interaction module.
2. Pertahankan entrypoint `MapView` sebagai orchestrator tipis.
3. Hindari perubahan visual dan perilaku panel.

Definition of done Sprint 1:

1. `Map.tsx` turun signifikan dan hanya berisi orchestration.
2. Semua flow map inti lolos smoke test.
3. Build tetap sukses tanpa error TypeScript.

Status saat ini: **Tercapai**.

## Sprint 2 (3-5 hari): Split Layer Store by Concern

1. Pecah `src/store/useLayers.ts` menjadi domain modules:
    - layer data initialization.
    - filter application logic.
    - selection and hover state.
    - zoom request and map focus.
    - user layer lifecycle.
2. Simpan satu facade store agar komponen existing tidak perlu migrasi total sekaligus.
3. Kurangi side-effect lokal storage di jalur yang sama dengan compute logic.

Definition of done Sprint 2:

1. Fungsi store lebih pendek dan fokus.
2. Tidak ada duplikasi update state untuk concern yang sama.
3. Alur apply/clear filter tetap identik hasilnya.

Status saat ini: **Tercapai**.

## Sprint 3 (2-4 hari): Unify Filter Engine

1. Satukan translator filter untuk:
    - simple filter (`FilterPanel`).
    - advanced filter (`QueryBuilder`).
2. Buat satu utility validasi operator, value type, dan date/number normalization.
3. Jadikan preset query dan simple filter memakai path eksekusi yang konsisten.

Definition of done Sprint 3:

1. Tidak ada logika filter core yang terduplikasi di dua komponen.
2. Hasil filter sama untuk skenario input yang ekuivalen.

## Sprint 4 (2-4 hari): Data Access Abstraction

1. Tambahkan abstraction layer data source:
    - local static GeoJSON.
    - remote source (future WFS).
2. Pindahkan parsing/normalization dari import langsung ke adapter terpisah.
3. Pertahankan kompatibilitas mode offline current app.

Definition of done Sprint 4:

1. Peralihan source data tidak mengubah komponen UI utama.
2. Adapter baru bisa ditambahkan tanpa edit besar di store map.

## Risiko dan Mitigasi

1. Risiko regressions interaksi map.
    - Mitigasi: lakukan refactor per modul kecil, verify per commit dengan smoke test.
2. Risiko mismatch filter behavior.
    - Mitigasi: buat test case input-output filter untuk sampel layer boundary dan perairan.
3. Risiko scope creep.
    - Mitigasi: fokus structural refactor, tunda redesign UI sampai fase stabil.

## Urutan Eksekusi yang Direkomendasikan

1. Sprint 0 guard rails.
2. Sprint 1 map decomposition.
3. Sprint 2 store decomposition.
4. Sprint 3 filter engine unification.
5. Sprint 4 data abstraction untuk kesiapan WFS/WPS.

## Success Criteria

1. Waktu implementasi fitur baru di area map/filter turun karena modul lebih terisolasi.
2. PR review menjadi lebih kecil dan terfokus.
3. Risiko perubahan lintas modul menurun signifikan.
4. Kode siap masuk fase integrasi backend tanpa migrasi besar frontend.
