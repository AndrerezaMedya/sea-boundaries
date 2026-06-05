# Integration Plan — S-121 Backend API & Frontend WebGIS

> **Status**: Phase 0-3 Complete — 2026-05-25
> **Scope**: Setelah skema database S-121 selesai di-seed & di-audit (lihat `@real_db_schema/handsoff.md` dan `@real_db_schema/S121_DATABASE_SCHEMA.md`), dokumen ini menjadi peta jalan integrasi Backend API + Frontend WebGIS hingga production.
> **Audience**: AI agent / developer berikutnya.

---

## 0. Konteks Singkat

- **Database**: PostgreSQL 15 + PostGIS di Google Cloud SQL. 20 tabel S-121 (11 base + 9 junction) + `spatial_ref_sys`. Sudah lolos audit (zero orphan, label clean, geom valid).
- **Backend**: Node.js (Express + `pg`) di `backend/`. Sudah deploy di Cloud Run (`s121-backend-339962740894.asia-southeast1.run.app`). **9 endpoint lengkap** dengan modular structure (`routes/`, `lib/`, `db/`), security hardening (CORS, Helmet, rate limiting), Pino logging, HTTP caching, dan integration tests.
- **Frontend**: React + Vite + MapLibre + Zustand di `src/`. **Sudah migrasi ke API** via `src/lib/apiClient.ts` dan async `dataLoader.ts`. Loading/error state di Zustand store. Popup detail konsumsi endpoint detail.

### Invariants kritis yang HARUS dihormati

1. **Prefix `fuID` non-uniform** di `feature_model_location`: 20.985 baris `LOC_*`, 308 baris `P_B_*` (boundary points perjanjian internasional). **JANGAN filter `LIKE 'LOC_%'`** — gunakan kolom `location_type_list`.
2. **`"right"` adalah reserved keyword PostgreSQL** → selalu pakai tanda kutip ganda.
3. **`rrrID` unik global** lintas tabel `"right"`, `responsibility`, `restriction`. Untuk join via `rrr_to_source` / `rrr_to_bau` gunakan `UNION ALL` ketiga tabel.
4. **Geometri tidak embedded** di feature table:
   - `feature_model_location` → `fmlocation_to_sapoint` → `spatial_points`
   - `feature_model_limit` → `fmlimit_to_sacurve` → (`spatial_curves` ∪ `spatial_baselines`)
5. Seed scripts **idempotent** (`ON CONFLICT … DO NOTHING`).
6. Label sudah trimmed dan valid — **tampilkan apa adanya** di UI.

---

## 1. Bug Catalogue (Phase 0 — ✅ COMPLETED)

### Bug #1 — `/api/locations` JOIN salah — **FIXED**

`backend/routes/locations.js` sekarang menggunakan junction table:

```sql
FROM feature_model_location loc
JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
JOIN spatial_points pt ON rel.said_point = pt.saID
```

### Bug #2 — Layer mapping di `Map.tsx` salah — **FIXED**

`src/components/Map.tsx` hardcoded fetch telah dihapus. Layer mapping sekarang ditangani oleh `src/lib/apiClient.ts` dengan filter `?type=` yang tepat per CoreLayerId.

### Bug #3 — Hardcoded URL backend — **FIXED**

`VITE_API_BASE` ditambahkan di `.env.example` dan `src/vite-env.d.ts`. Backend URL sekarang dikonfigurasi via environment variable.

### Bug #4 — Titik Perjanjian LT/LK/ZEE menampilkan semua Boundary Point — **FIXED**

Tiga sub-layer memakai filter `?type=Boundary Point` + MVT `layer_id=boundary_point` tanpa pemisah TS/CS/EEZ. Sekarang: `?agreement=TS|CS|EEZ` di `/api/locations`, properti MVT `agreement_kind`, filter MapLibre `boundary_point` + `agreement_kind`, popup memakai layer kanonik dari `fuID` (`lib/agreementPointKind`).

---

## 2. Roadmap

### Phase 0 — Bug fixes (½ hari) — ✅ COMPLETED
- [x] Fix `/api/locations` (JOIN via junction).
- [x] Fix layer mapping `/api/limits` di `Map.tsx`.
- [x] Add `VITE_API_BASE` env + hapus hardcoded URL.

### Phase 1 — Backend API expansion (3–5 hari) — ✅ COMPLETED

#### 1.1 API Spec — ✅ DONE
- Response convention: GeoJSON `FeatureCollection` untuk spatial, JSON object untuk metadata.
- Query params: `bbox`, `limit`, `offset`, `simplify`, filter kolom enum.
- Error envelope: `{ error: { code, message, details? } }` via `lib/queryHelpers.sendError`.

#### 1.2 Endpoint spasial (GeoJSON) — ✅ IMPLEMENTED

| Method | Path | Filter params | Status |
|---|---|---|---|
| GET | `/api/limits` | `type` (TS/CZ/EEZ/CS/FISH), `bbox` | ✅ |
| GET | `/api/limits/:fuid` | — | ✅ (detail + sources + vertices) |
| GET | `/api/locations` | `type` (Baseline Point/Boundary Point), `bbox`, `limit`, `offset` | ✅ |
| GET | `/api/locations/:fuid` | — | ✅ (detail + sources + parent_limits) |
| GET | `/api/baselines` | `bbox`, `simplify` | ✅ |
| GET | `/api/curves` | `bbox`, `simplify` | ✅ |

#### 1.3 Endpoint metadata (JSON) — ✅ IMPLEMENTED

| Method | Path | Status |
|---|---|---|
| GET | `/api/parties` | ✅ |
| GET | `/api/sources` | ✅ (pagination) |
| GET | `/api/sources/:sid` | ✅ |
| GET | `/api/baunits` | ✅ |
| GET | `/api/baunits/:uid` | ✅ (with RRR union) |
| GET | `/api/rrr` | ✅ (UNION ALL 3 tables) |
| GET | `/api/rrr/:rrrid` | ✅ |

#### 1.4 Performance & indexing — ✅ DONE
- Migration `backend/migrations/001_indexes.sql` created for GIST and B-Tree indexes.
- `ST_Intersects` bbox filter implemented in `lib/queryHelpers.bboxPredicate`.
- `ST_SimplifyPreserveTopology` implemented in `/api/curves` and `/api/baselines`.
- Connection pool config in `db/pool.js`.

#### 1.5 Keputusan: Vector tiles vs paginated GeoJSON? — **B (Paginated GeoJSON)**
- Dipilih opsi B dengan pagination (`limit`, `offset`) di `/api/locations`.
- Cluster di MapLibre dapat ditambahkan jika diperlukan (belum diimplementasikan).
- Vector tiles opsional untuk Phase 4 jika latency p95 > 1s.

### Phase 2 — Production hardening backend (2–3 hari) — ✅ COMPLETED
- [x] **Secret Manager**: Ready for ops (runbook §2.1).
- [x] **CORS allowlist**: `lib/security.buildCors()` with `CORS_ORIGINS` env var.
- [x] **Rate limit**: `lib/security.buildRateLimiter()` with `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.
- [x] **Helmet**: `lib/security.buildHelmet()`.
- [x] **Validation**: `lib/queryHelpers.ensureEnum()`, `parseBbox()`, `parsePagination()` with 400 errors.
- [x] **Logging**: `lib/logging.js` with Pino + pino-http, Cloud Logging compatible.
- [x] **Caching**: `lib/cache.js` with `shortCache(300)` for spatial, `metadataCache(3600)` for metadata.
- [x] **Health endpoint**: `/api/health` with DB ping check.

### Phase 3 — Frontend migration (3–5 hari) — ✅ COMPLETED

#### 3.1 Config — ✅ DONE
- `VITE_API_BASE` ditambahkan di `.env.example` dan `src/vite-env.d.ts`.
- `src/lib/apiClient.ts` dibuat — fetch wrapper dengan error handling dan URL building.

#### 3.2 Refactor `src/lib/dataLoader.ts` — ✅ DONE
- Static `.geojson?raw` imports diganti dengan async `fetchAllLayers()` dari API.
- Loading & error state ditambahkan ke Zustand store (`initializationStatus`, `initializationError`).
- `FeatureCollectionWithProps` shape dipertahankan untuk kompatibilitas.
- Re-mapping `CoreLayerId` → endpoint + filter di `apiClient.ts.LAYER_API_CONFIG`.

#### 3.3 Audit filter `LIKE 'LOC_%'` — ✅ DONE
- Grep audit: tidak ada `LOC_%` assumptions di frontend code.
- Filter menggunakan field-based conditions (tidak ada prefix hardcoded).

#### 3.4 Popup / detail modal — ✅ DONE
- `FeatureDetailModal.tsx` konsumsi `fetchFeatureDetail()` dari API.
- Tampilkan: sources, vertices, parent_limits dari endpoint detail.
- Label ditampilkan apa adanya (sudah clean dari database).

### Phase 4 — Ops & QA (paralel, ongoing)

- [ ] **Tests backend**: `supertest` + DB testcontainer (PG+PostGIS) atau staging Cloud SQL schema.
- [ ] **Tests frontend**: Playwright smoke (load WebGIS page, layer-toggle visible, popup terbuka).
- [ ] **Observability**: structured logs → Cloud Logging, error reporting → Cloud Error Reporting, latency p50/p95/p99 → Cloud Monitoring custom metric.
- [ ] **CI/CD**: GitHub Actions.
  - `backend/`: build Docker → push GCR → deploy Cloud Run (sudah ada `backend/Dockerfile`).
  - `src/`: `npm run build` → `firebase deploy --only hosting` (sudah ada `.firebaserc`, `firebase.json`).
- [ ] **Docs**: `docs/API_REFERENCE.md`, `docs/DEPLOYMENT_RUNBOOK.md`, `docs/ENV_MATRIX.md`.

---

## 3. Inventaris File yang Akan Disentuh

### Backend
- `backend/server.js` — refactor jadi modular: `routes/`, `db/`, `middleware/`.
- `backend/package.json` — tambah `zod`, `pino`, `pino-http`, `helmet`, `express-rate-limit`.
- `backend/.env.example` — dokumentasikan semua var.
- `backend/Dockerfile` — verify multi-stage build untuk size optimal.

### Frontend
- `src/lib/dataLoader.ts` — async fetch.
- `src/lib/api.ts` — new fetch wrapper.
- `src/components/Map.tsx` — hapus hardcoded URL, gunakan loader baru.
- `src/components/FeatureDetailModal.tsx` — konsumsi endpoint detail.
- `src/store/layers/bootstrap.ts` — handle async init.
- `.env`, `.env.example`, `.env.production` — `VITE_API_BASE`.

### Docs baru
- `docs/API_REFERENCE.md`
- `docs/DEPLOYMENT_RUNBOOK.md`
- `docs/ENV_MATRIX.md`

---

## 4. Definition of Done

- Semua endpoint di §1.2 & §1.3 mengembalikan respons valid pada Cloud Run, dengan p95 latency < 800ms (data 21k+).
- Frontend tidak lagi membaca file `.geojson` static untuk layer S-121 (kecuali sebagai fallback dev).
- DB password tidak ada di env var Cloud Run (sudah di Secret Manager).
- Semua filter frontend lulus audit prefix `P_B_*` (tidak ada `LOC_%` hardcoded).
- Smoke test E2E (Playwright) hijau di CI.
- Popup feature menampilkan minimal: label, status, datum, lifespan, source, party.

---

## 5. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| 21k+ titik bikin frontend lag | Medium | Cluster di MapLibre + bbox query di backend; opsional pg_tileserv |
| Cloud SQL cold start dari Cloud Run | Medium | Min instances ≥ 1 untuk backend Cloud Run, atau connection pooling persistent |
| Reserved keyword `"right"` lupa di-quote | High (silent error) | Linter SQL + code review checklist |
| Filter prefix `LOC_%` legacy masih ada | High (data hilang silently) | Grep audit di Phase 3.3, regression test |
| CORS misconfig saat ganti domain | Medium | Env-driven allowlist + test di staging |

---

## 6. Next Action

**Phase 0-3 SELESAI.** Lanjut ke:

1. **Deployment (Ops):**
   - Secret Manager: migrasi `DB_PASSWORD` (runbook §2.1).
   - Apply migration `001_indexes.sql` ke production Cloud SQL.
   - Deploy backend ke Cloud Run.
   - Deploy frontend ke Firebase Hosting dengan `VITE_API_BASE` yang benar.
   - Smoke test sesuai `docs/DEPLOYMENT_RUNBOOK.md`.

2. **Phase 4 (Ops & QA):**
   - CI/CD GitHub Actions.
   - Playwright E2E tests untuk frontend.
   - Observability (Cloud Logging, Error Reporting, Monitoring).
