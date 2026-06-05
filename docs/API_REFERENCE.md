# S-121 Backend API Reference

> **Base URL (prod)**: `https://s121-backend-339962740894.asia-southeast1.run.app`
> **Base URL (local)**: `http://localhost:8080`
> **Version**: v1 (unversioned URI, breaking changes will bump to `/v2/api/...`)
> **Last Updated**: 2026-05-26

All endpoints are mounted under `/api`. Spatial endpoints return GeoJSON
`FeatureCollection`. Metadata endpoints return JSON objects of shape
`{ items: [...] }` (list) or the entity object directly (detail).

---

## Conventions

### Query params (shared)

| Param | Type | Endpoints | Description |
|---|---|---|---|
| `bbox` | `minLon,minLat,maxLon,maxLat` | **`/api/limits`, `/api/locations` (required)** | Intersects filter. Must fall within lon 60..160, lat −25..20. Omitting bbox returns `400 BBOX_REQUIRED` when `REQUIRE_BBOX=true` (production default). |
| `simplify` | float (deg, 4326) | limits, locations | Optional override. When omitted, server applies `DISPLAY_SIMPLIFY_TOLERANCE` (full coordinate precision; no `ST_ReducePrecision`). |
| `limit` | int | locations, sources | Page size. |
| `offset` | int | locations, sources | Page offset. |
| `type` | enum | limits, locations | See per-endpoint allowed values. |

### Error envelope

All errors return JSON:

```json
{ "error": { "code": "INVALID_BBOX", "message": "bbox must be 4 ..." } }
```

| HTTP | Common codes |
|---|---|
| 400 | `BBOX_REQUIRED`, `BBOX_TOO_LARGE`, `INVALID_BBOX`, `INVALID_SIMPLIFY`, `INVALID_LIMIT`, `INVALID_OFFSET`, `INVALID_TYPE`, `INVALID_KIND`, `INVALID_TILE` |
| 401 | `DISPLAY_TOKEN_REQUIRED` |
| 404 | `NOT_FOUND`, `UNKNOWN_LAYER` |
| 500 | `INTERNAL_ERROR` |

### Display channel (MVT + BFF token)

When `DISPLAY_MODE=mvt` (production default via `deploy.bat`):

1. **`GET /api/display/session`** — issues a short-lived HMAC token (no auth; rate-limited).
2. Client sends **`X-Display-Token: <token>`** (or `?token=`) on:
   - **`GET /api/tiles/boundaries/:z/:x/:y.mvt`** — all line boundaries (combined tileset).
   - **`GET /api/tiles/points/:z/:x/:y.mvt`** — basepoints + boundary points (combined tileset).
   - Legacy per-layer URLs (`/api/tiles/eez_limit/...`) still work but are deprecated.
   - **`GET /api/limits`**, **`GET /api/locations`**, and detail routes (attribute table + popups).
3. Collection `bbox` area is capped at **`DISPLAY_MAX_BBOX_AREA_DEG2`** (default 25 deg²) in MVT mode.
4. Tile responses include **`Cache-Control: public, max-age=...`** and **`X-Cache: HIT|MISS`** (in-memory LRU on the Cloud Run instance).

**Session response (200)**

```json
{
  "token": "<body>.<hmac>",
  "expiresAt": "2026-05-26T12:00:00.000Z",
  "expiresIn": 3600,
  "displayMode": "mvt"
}
```

**MVT `layer_id` property** (inside tile, for MapLibre filters): `baseline`, `territorial_sea`, `contiguous_zone`, `eez_limit`, `continental_shelf`, `landas_kontinen_ekstensi`, `fisheries`, `basepoints`, `boundary_point` (shared by all titik perjanjian layers).

**Env (backend)**

| Variable | Default | Description |
|----------|---------|-------------|
| `DISPLAY_MODE` | `geojson` | `mvt` enables tile routes + bbox area cap |
| `DISPLAY_REQUIRE_TOKEN` | on when MVT | Require token on spatial APIs |
| `DISPLAY_TOKEN_SECRET` | dev fallback | **Required in production** |
| `DISPLAY_TOKEN_TTL_SECONDS` | 3600 | Token lifetime |
| `DISPLAY_MAX_BBOX_AREA_DEG2` | 25 | Max harvest area per collection request |
| `TILE_CACHE_MAX_ENTRIES` | 8000 | In-memory MVT tile LRU size |
| `TILE_CACHE_TTL_SECONDS` | 3600 | Tile cache TTL per instance |
| `TILE_CACHE_HTTP_MAX_AGE` | 3600 | `Cache-Control` max-age for tiles |

**Env (frontend)** — `VITE_DISPLAY_MODE=mvt` must match backend.

### Identifiers with `/` (fuID, sID)

Many boundary-point `fuID` values and some `sID` values contain a slash
(e.g. `P_B_CS/EEZ_C3_AUS_1997`, `TREATY_IDN_AUS_EEZ/CS_1997`).

**Detail endpoints** (`GET /api/locations/:fuid`, `GET /api/limits/:fuid`):

- **Clients must** URL-encode the id: `encodeURIComponent(fuID)` →
  `/api/locations/P_B_CS%2FEEZ_C3_AUS_1997`
- The backend also accepts **unencoded** multi-segment paths via wildcard routes
  (`GET /api/locations/*`, `GET /api/limits/*`) for backward compatibility.

Unencoded paths like `/api/locations/P_B_CS/EEZ_C3_AUS_1997` (without `%2F`) are
routed correctly on current backend builds; older builds returned
`404 NOT_FOUND` / `Endpoint not found`.

---

## Data requests (institutional)

### POST `/api/data-requests`

Submit a formal data request (`multipart/form-data`). Rate-limited per IP (`REQUEST_SUBMIT_MAX`, default 5/hour).

**Fields (form)**

| Field | Required |
|-------|----------|
| `namaLengkap`, `nikNim`, `institusi`, `alamatInstitusi`, `email`, `noTelepon`, `keperluanData` | yes |
| `keterangan` | no |
| `suratInstitusi` | yes (file, max 5MB: PDF/DOC/DOCX/JPG/PNG) |

**201 response**

```json
{
  "id": "uuid",
  "status": "pending",
  "created_at": "2026-05-26T10:00:00.000Z",
  "message": "Permintaan data berhasil diterima dan akan ditinjau.",
  "file_stored": false
}
```

Requires table `data_requests` (`backend/migrations/002_data_requests.sql`). Optional `REQUEST_UPLOAD_DIR` for letter file persistence.

### Operator endpoints (admin key)

Set `DATA_REQUEST_ADMIN_KEY` on Cloud Run. Send header `X-Admin-Key: <same value>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/data-requests?status=pending&limit=50&offset=0` | List requests |
| `GET` | `/api/data-requests/:id` | Full row (incl. NIK, alamat) |
| `PATCH` | `/api/data-requests/:id` | Body `{ "status": "approved"\|"rejected", "review_notes": "..." }` — only from `pending` |

Without `DATA_REQUEST_ADMIN_KEY`, admin routes return `503 ADMIN_DISABLED`.

---

## Geoprocessing (display channel)

**`X-Display-Token`** required when `DISPLAY_REQUIRE_TOKEN=true`.

### GET `/api/geo/info`

Capability probe. **`bboxRequired: false`** on v2+ (no bbox needed on POST).

```json
{ "version": 2, "bboxRequired": false, "maxInputFeatures": 500, "maxOutputFeatures": 100, "maxBufferKm": 500 }
```

### POST routes

Optional **`bbox`** in body (`minLon,minLat,maxLon,maxLat`). If omitted, the **whole layer** is used (capped at **`GEO_MAX_FEATURES`**, default **500**).

| Endpoint | Body | Response |
|----------|------|----------|
| `/api/geo/measure` | `operation`: `length`\|`area`, `layerId`, `bbox`, `fuids[]?` | `{ operation, unit, value, featureCount }` — **no geometry** |
| `/api/geo/buffer` | `layerId`, `distanceKm`, `bbox`, `fuids[]?` | GeoJSON `FeatureCollection` + `meta` |
| `/api/geo/intersect` | `layerA`, `layerB`, `bbox`, `fuidsA[]?`, `fuidsB[]?` | GeoJSON + `meta` |
| `/api/geo/clip` | `layerId`, `clipBy`: `bbox`\|`layer`, `clipLayerId?`, `bbox`, `fuids[]?` | GeoJSON + `meta` |

**`layerId` values:** `baseline`, `territorial_sea`, `contiguous_zone`, `eez_limit`, `continental_shelf`, `landas_kontinen_ekstensi`, `fisheries`, `basepoints`, `titik_perjanjian_lt`, `titik_perjanjian_lk`, `titik_perjanjian_zee`.

**Errors:** `BBOX_REQUIRED`, `BBOX_TOO_LARGE`, `GEO_NO_FEATURES`, `GEO_UNSUPPORTED_LAYER`, `GEO_TOO_MANY_FEATURES`, `GEO_BUFFER_TOO_LARGE`.

---

## Health

### GET `/api/health`

Liveness probe + DB ping.

```json
{ "status": "OK", "message": "Backend is running", "db": "reachable" }
```

---

## Spatial — Limits

### GET `/api/limits`

Returns Limit features (curves + baselines, unioned per `fuID`) as GeoJSON.

**Query params**

| Name | Type | Notes |
|---|---|---|
| `type` | `BSL`\|`TS`\|`CZ`\|`EEZ`\|`CS`\|`ECS`\|`FISH`\|`MOF` | Filters by `fuID LIKE 'LIM_<type>_%'`. `ECS` = extended continental shelf outer limit (`LIM_ECS_*` → `CURVE_ECS_*`). |
| `status` | string | e.g. `Unilateral`, `Agreement`, `Need Agreement`. |
| `bbox` | bbox | See conventions. Applied per-row (index-friendly). |
| `simplify` | float | Tolerance in degrees. |

**Response** — GeoJSON `FeatureCollection`. Each feature property:
`fuid`, `label`, `limit_object_type`, `status`, `releasibility_type`,
`start_life_span`, `end_life_span`, `horizontal_datum`, `said` (curve/baseline
segment id), `source_ids` (comma-separated `sID` list from `fmlimit_to_source`).

**Examples**

```
GET /api/limits?type=EEZ
GET /api/limits?type=ECS
GET /api/limits?type=TS&bbox=95,−10,141,6&simplify=0.001
```

### GET `/api/limits/:fuid`

Full detail. Same handler as `GET /api/limits/*` (see **Identifiers with `/`**).
Response:

```json
{
  "type": "Feature",
  "geometry": { ... },
  "properties": { "fuid": "LIM_EEZ_01", "label": "...", ... },
  "sources": [ /* full source rows joined via fmlimit_to_source */ ],
  "vertices": [ /* feature_model_location rows via fmlimit_to_fmlocation */ ]
}
```

`404 NOT_FOUND` if `fuid` does not exist.

---

## Spatial — Locations

### GET `/api/locations`

**Query params**

| Name | Type | Notes |
|---|---|---|
| `type` | `Baseline Point`\|`Boundary Point` | Filters on `location_type_list`. **Do NOT assume `LIKE 'LOC_%'`** — 308 boundary points use `P_B_*` prefix. |
| `agreement` | `TS`\|`CS`\|`EEZ` | Titik Perjanjian only: filters Boundary Points by fuID convention (`LOC_TS_*`/`P_B_TS_*`, etc.). Joint `P_B_CS/EEZ_C*` rows are split in DB (`split_cs_eez_points.sql`). |
| `bbox` | bbox | |
| `limit` | int | Default 5000, max 25000. |
| `offset` | int | |

**Response** — GeoJSON `FeatureCollection`. Properties: `fuid`, `label`,
`location_type_list`, `status`, `releasibility_type`, `start_life_span`,
`end_life_span`, `horizontal_datum`, `vertical_datum`, `said`, `point_location`,
`source_ids` (comma-separated `sID` list from `fmlocation_to_source`).

### GET `/api/locations/:fuid`

Returns the Feature + `sources` + `parent_limits`. Same handler as
`GET /api/locations/*` (see **Identifiers with `/`**). Encode `fuid` when it
contains `/`.

**Example**

```
GET /api/locations/P_B_CS%2FEEZ_C3_AUS_1997
```

---

## Spatial — Baselines

### GET `/api/baselines`

| Name | Type | Notes |
|---|---|---|
| `bsl_type` | string | e.g. `Straight Archipelagic Baseline`, `Common Baseline`. |
| `bbox` | bbox | |
| `simplify` | float | |

Returns `FeatureCollection` over `spatial_baselines` (LINESTRING). Properties:
`said`, `location`, `bsl_type`.

---

## Spatial — Curves

### GET `/api/curves`

| Name | Type | Notes |
|---|---|---|
| `bbox` | bbox | |
| `simplify` | float | |

Returns `FeatureCollection` over `spatial_curves` (LINESTRING). Properties:
`said`, `location`.

---

## Metadata — Parties

### GET `/api/parties`

```json
{ "items": [ { "pid": "IDN", "partyname": "Indonesia", "partyrole": "rightsHolder", "partytype": "stateCountry" }, ... ] }
```

### GET `/api/parties/:pid`

Returns the party row + `sources` (joined via `source_to_party`).

`404 NOT_FOUND` if `pid` does not exist.

---

## Metadata — Sources

### GET `/api/sources`

| Name | Type | Notes |
|---|---|---|
| `type` | string | Filters on `sourceDocumentType`. |
| `limit`, `offset` | int | Default limit 100, max 500. |

```json
{ "items": [ { "sid": "UNCLOS1982", "sourcedocumentname": "...", ... } ], "total": 51, "limit": 100, "offset": 0 }
```

### GET `/api/sources/:sid`

Returns full source row (all 26+ columns) + `parties`. Encode `sid` when it
contains `/` (e.g. `TREATY_IDN_AUS_EEZ%2FCS_1997`).

---

## Metadata — Basic Administrative Units (BAU)

### GET `/api/baunits`

```json
{ "items": [ { "uid": "BA_01", "basicadministrativeunitname": "Teritorial Sea", ... }, ... ] }
```

### GET `/api/baunits/:uid`

Returns BAU row + `sources` + `rrrs` (unioned across `"right"`, `responsibility`, `restriction` with discriminator column `kind`).

---

## Metadata — RRR (Right / Responsibility / Restriction)

### GET `/api/rrr`

UNION of the three RRR tables with a `kind` discriminator. `rrrID` is globally
unique across them (project invariant — see `S121_DATABASE_SCHEMA.md` §3).

| Name | Type | Notes |
|---|---|---|
| `kind` | `right`\|`responsibility`\|`restriction` | |
| `party` | string | Filter by `pID`. |

```json
{
  "items": [
    {
      "rrrid": "RIGHT-001",
      "kind": "right",
      "subtype": "sovereignty",
      "partyrequired": null,
      "description": "...",
      "share": "1",
      "sharecheck": true,
      "pid": "IDN"
    }
  ]
}
```

### GET `/api/rrr/:rrrid`

Returns the RRR row + `sources` + `baus`.

---

## Operational Notes

### Prefix invariants
- `feature_model_location.fuID` uses `LOC_*` for most rows but **`P_B_*` for 308
  boundary points**. Always filter via `location_type_list`, never via prefix.
- `"right"` is a PostgreSQL reserved keyword — handled in queries with double
  quotes. Client code never sees this; the API exposes `kind: "right"`.

### Performance
- Apply `bbox` to large-result endpoints (`/api/locations` especially — full
  result is 21k+ points).
- Use `simplify=0.001` (≈ 100 m at the equator) for tile-level rendering at
  country zoom; smaller values for finer detail.
- Indexes provisioned by `backend/migrations/001_indexes.sql` (GIST + B-Tree).

### Pagination
- Only `/api/locations` and `/api/sources` are paginated. Other endpoints return
  the full result (small cardinality).
- `total` is provided only on `/api/sources` (cheap COUNT).

### CORS
- Phase 1: open (`cors()` default).
- Phase 2: switch to allowlist via `CORS_ORIGINS` env (comma-separated).

### Frontend layer mapping (production build)

| UI layer id | API |
|---|---|
| `territorial_sea`, `contiguous_zone`, `eez_limit`, `continental_shelf`, `fisheries`, `baseline` | `GET /api/limits?type=…` |
| `landas_kontinen_ekstensi` | `GET /api/limits?type=ECS` (line geometry, not legacy polygon GeoJSON) |
| `basepoints` | `GET /api/locations?type=Baseline Point` |
| `titik_perjanjian_lt` | `GET /api/locations?type=Boundary Point&agreement=TS` |
| `titik_perjanjian_lk` | `GET /api/locations?type=Boundary Point&agreement=CS` |
| `titik_perjanjian_zee` | `GET /api/locations?type=Boundary Point&agreement=EEZ` |

Configured via `VITE_API_BASE` in `.env.production` (Cloud Run URL).
