# MVT — Gabung Tileset + Cache (Fase 4)

> **Status**: Diimplementasikan  
> **Prasyarat**: `DISPLAY_MODE=mvt`, rate limit display off

## Desain

| Tileset | URL | Isi |
|---------|-----|-----|
| `boundaries` | `/api/tiles/boundaries/{z}/{x}/{y}.mvt` | Semua garis batas (`LIM_*`) |
| `points` | `/api/tiles/points/{z}/{x}/{y}.mvt` | Titik dasar + titik perjanjian |

Properti MVT `layer_id` memisahkan layer UI (MapLibre filter).  
Endpoint per-layer (`/api/tiles/eez_limit/...`) tetap ada untuk kompatibilitas.

## Cache

- In-memory LRU di Node (`backend/lib/tileCache.js`)
- Key: `tileset:z:x:y`
- Env: `TILE_CACHE_MAX_ENTRIES` (default 8000), `TILE_CACHE_TTL_SECONDS` (default 3600)
- Header: `Cache-Control: public, max-age=...` + `X-Cache: HIT|MISS`

## Frontend

- 2 vector source: `source-mvt-boundaries`, `source-mvt-points`
- Request tile ÷11 vs arsitektur lama

## Rollback

`VITE_DISPLAY_MODE=geojson` — tidak memakai tileset gabungan.
