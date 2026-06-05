# Rencana Migrasi MVT + BFF Token — S-121 WebGIS

> **Status**: **Disetujui — Fase 0–3 dieksekusi** (2026-05-26)  
> **Terkait**: `docs/DATA_ACCESS_SECURITY_PLAN.md`, `docs/API_REFERENCE.md`

---

## 1. Tujuan

| Tujuan | Keterangan |
|--------|------------|
| **Peta publik** | Render batas maritim via **MVT** (PostGIS `ST_AsMVT`) |
| **BFF ringan** | Token sesi singkat untuk saluran display |
| **Tabel & filter** | Atribut mengikuti **viewport** + layer aktif |
| **Rollback** | `DISPLAY_MODE=geojson` + `VITE_DISPLAY_MODE=geojson` |
| **Tanpa 429 di zoom** | Tidak ada rate limit pada tile/session/display GET |

---

## 4. Status implementasi

| Item | Status |
|------|--------|
| MVT tiles + token | ✅ |
| Rate limit display dihapus | ✅ |
| Detail modal via API | ✅ |
| Viewport attributes (layer aktif) | ✅ |
| Init MVT: hanya layer aktif di store | ✅ |
| `.env.production.example` | ✅ |
| `deploy.bat` + `DISPLAY_TOKEN_SECRET` | ✅ (secret harus ada di GCP) |
| Gabung tileset (`boundaries` + `points`) + cache | ✅ Fase 4 — lihat `MVT_TILESET_CACHE_PLAN.md` |
| UAT production | ☐ Operator |

---

## 5. Fase — ringkasan eksekusi

### Fase 0 — Rollback ✅
Dokumentasi bagian 8; env `geojson` mengembalikan perilaku lama.

### Fase 1 — MVT stabil ✅
- Token single-flight, tile tanpa rate limit, detail dari API.

### Fase 2 — Atribut viewport ✅
- `moveend` debounce 650 ms → `GET /limits|locations?bbox=` **layer aktif saja**
- `clampBboxArea` max 25 deg²
- `attributesLoading` di Ribbon / Layer panel

### Fase 3 — Production hardening ✅ (kode/deploy template)
- `deploy.bat`: `DISPLAY_MODE=mvt`, `ENABLE_API_RATE_LIMIT=false`, secret token
- `.env.production.example` untuk frontend build

### Fase 4 — Tileset gabungan + cache ✅
- **2 tileset**: `/api/tiles/boundaries/...` (garis), `/api/tiles/points/...` (titik)
- LRU in-memory + header `X-Cache`, `Cache-Control`
- Frontend: `source-mvt-boundaries`, `source-mvt-points` + filter `layer_id`
- Detail: `docs/MVT_TILESET_CACHE_PLAN.md`

---

## 6. Kebijakan rate limiting

Hanya **POST `/api/data-requests`** yang di-rate-limit. Semua GET display (tile, session, limits, locations) **tidak** di-limit di aplikasi.

---

## 7. Matriks environment

| Variabel | Backend | Frontend |
|----------|---------|----------|
| `DISPLAY_MODE` | `mvt` | — |
| `VITE_DISPLAY_MODE` | — | `mvt` |
| `DISPLAY_TOKEN_SECRET` | Secret Manager | — |
| `ENABLE_API_RATE_LIMIT` | `false` | — |
| `VITE_API_BASE` | — | URL Cloud Run |

---

## 8. Rollback cepat

```env
# backend/.env
DISPLAY_MODE=geojson
DISPLAY_REQUIRE_TOKEN=false

# .env
VITE_DISPLAY_MODE=geojson
```

Restart backend + rebuild frontend.

---

## 11. Referensi kode

| Area | Path |
|------|------|
| Viewport hook | `src/hooks/useViewportAttributes.ts` |
| Refresh store | `refreshActiveLayerAttributes` di `createStoreActions.ts` |
| Single-layer load | `loadLayerCollectionForBbox` di `dataLoader.ts` |
