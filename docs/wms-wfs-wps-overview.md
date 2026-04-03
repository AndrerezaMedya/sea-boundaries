# WebGIS Current State vs OGC Services (WMS, WFS, WPS)

This document summarizes the existing WebGIS architecture in this repo and contrasts it with a GeoServer-based implementation using WMS, WFS, and WPS. It includes pros/cons, migration paths, and practical steps.

## 1) Current State (in this repo)

- **Frontend only**: Vite + React + MapLibre GL. Data is loaded as **static GeoJSON** bundled under `src/data` or uploaded by user.
- **No OGC services**: No WMS, WFS, or WPS endpoints are consumed. Rendering is client-side with vector data sources.
- **Processing**: Client-side only (Turf.js for calculations). No server-side geoprocessing.
- **Deployment**: Frontend hosted (Firebase Hosting). No backend or GeoServer/PostGIS in the current runtime.

### Strengths

- Simple to deploy (static hosting).
- Low latency for small/medium GeoJSON.
- Works offline once assets are cached.

### Limitations

- Large datasets inflate bundle size and client memory.
- No central data authority; updates require rebuilding/redeploying or user upload.
- No server-side processing for heavy tasks.

## 2) WMS (Web Map Service)

**What it is**: Returns rendered map images (PNG/JPEG) for given bbox/CRS/layers.

**When to use**

- Read-only visualization; when clients should not download full features.
- Very large datasets where vector delivery is heavy.
- Need cartography guaranteed server-side.

**Pros**

- Thin client; low data transfer for large layers.
- Styles live on server (SLD/GeoServer style). Updates are instant to all clients.

**Cons**

- Images only; limited interactivity (identify requires GetFeatureInfo).
- No client-side filtering beyond requesting different layers/styles.

**How it would look here**

- Host data in PostGIS, publish in GeoServer as WMS.
- MapLibre adds `raster` or `raster-dem` source pointing to WMS tiles/requests.

## 3) WFS (Web Feature Service)

**What it is**: Returns vector features (typically GeoJSON with `outputFormat=application/json`).

**When to use**

- Need attributes and geometry on the client for filtering, highlighting, export.
- Medium-sized datasets where client can handle features.

**Pros**

- Full attribute access; client-side analysis possible.
- Can request subsets (bbox, cql_filter) to limit payload.

**Cons**

- Large responses can be heavy; must paginate/limit.
- Exposes raw data (consider auth/quotas).

**How it would look here**

- Host data in PostGIS, publish as WFS in GeoServer.
- MapLibre loads a `geojson` source via `fetch` from the WFS GetFeature URL (with bbox/filters). Rendering stays vector.

## 4) WPS (Web Processing Service)

**What it is**: Server-side geoprocessing (e.g., buffer, intersect, clip) invoked via Execute requests.

**When to use**

- Heavy computations, large inputs, or workflows that must run near the data.
- To standardize processing logic across clients.

**Pros**

- Offloads CPU and memory to server; consistent results.
- Can chain with WFS/WMS outputs or PostGIS inputs.

**Cons**

- More infra and security surface area; needs resource limits.
- Response formats vary; client must parse outputs (GeoJSON/JSON/GML).

**How it would look here**

- GeoServer + PostGIS with WPS plugin enabled. Expose selected processes (buffer, intersect).
- Frontend sends Execute requests; receives GeoJSON and renders as a temporary layer or lets users download.

## 5) Architecture Comparison

| Aspect      | Current (Static GeoJSON)      | With WMS                         | With WFS                             | With WPS                        |
| ----------- | ----------------------------- | -------------------------------- | ------------------------------------ | ------------------------------- |
| Data source | Bundled/Uploaded GeoJSON      | PostGIS via GeoServer            | PostGIS via GeoServer                | PostGIS/GeoServer inputs        |
| Transfer    | Entire features in bundle     | Images (tiles/requests)          | Features (GeoJSON)                   | Inputs/outputs per process      |
| Rendering   | Client vector                 | Server-rendered raster           | Client vector                        | Client vector (result)          |
| Filtering   | Client-only                   | Limited (styles/layers)          | Client or cql_filter server-side     | Server-side logic per process   |
| Processing  | Turf.js client                | None                             | Client (unless filtered server-side) | Server-side geoprocessing       |
| Pros        | Simple deploy                 | Thin client, centralized styling | Full attributes, flexible filters    | Offload heavy tasks, consistent |
| Cons        | Big bundles, no central truth | Low interactivity                | Big payloads if unfiltered           | More infra, security, ops       |

## 6) Recommended Integration Path (practical for this codebase)

1. **Stand up data backend**: PostGIS + GeoServer on VPS. Load existing layers (baseline, basepoints, batas_maritim, titik_perjanjian).
2. **Publish services**:
    - WMS for all layers (quick win for consistent cartography).
    - WFS for layers that need interactive filtering/table/export.
    - Enable WPS plugin but expose only a small, safe set (e.g., buffer, intersect) with time/size limits.
3. **Frontend changes** (MapLibre):
    - Add ability to switch data source per layer: `geojson` (current) vs `wms`/`wfs` URLs.
    - For WFS: fetch GeoJSON via GetFeature (with bbox or filters) and set as source data.
    - For WMS: add raster source/layer pointing to GeoServer WMS endpoint.
    - For WPS: add a form to send Execute requests, then render returned GeoJSON as a temporary layer.
4. **Security & performance**:
    - Put GeoServer behind a reverse proxy; enable CORS/auth as needed.
    - Use bbox and paging for WFS; consider cql_filter for server-side filtering.
    - Set WPS execution time and memory limits; restrict exposed processes.
5. **Deployment**:
    - Frontend: keep Firebase Hosting or move to VPS.
    - Backend: host GeoServer + PostGIS on VPS; consider CDN/cache only for WMS tiles if needed.

## 7) Minimal API examples

- **WFS (GeoJSON)**: `.../geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=workspace:layer&outputFormat=application/json&bbox=minx,miny,maxx,maxy,EPSG:4326`
- **WMS (tile-like)**: `.../geoserver/wms?service=WMS&version=1.1.1&request=GetMap&layers=workspace:layer&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png`
- **WPS (Execute buffer)**: POST to `.../geoserver/wps` with XML/JSON Execute; expect GeoJSON output to render as a new source.

## 8) What remains unchanged

- Frontend stack (React/MapLibre/Tailwind/shadcn/ui) stays the same.
- Client-side tools (toast, tabs, query UI) can wrap WMS/WFS/WPS calls without major rewrites.

## 9) Checklist to move forward

- [ ] Provision VPS with PostGIS + GeoServer.
- [ ] Load maritime layers into PostGIS; publish WMS/WFS.
- [ ] Enable WPS plugin; expose limited processes; set limits.
- [ ] Implement WFS fetch path in frontend; toggle between local GeoJSON and WFS.
- [ ] Add optional WMS layer support for quick visualization.
- [ ] Add WPS Execute UI + render result layer.
- [ ] Secure endpoints (auth/CORS/rate limit); add monitoring.
- [ ] Performance test (bbox filters, pagination, tile caching).
