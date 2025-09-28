# Indonesia Sea Boundaries Explorer

A client-side WebGIS built with Vite, React, and MapLibre GL JS to explore Indonesian maritime boundaries. Core layers include baseline, basepoints, batas maritim, and titik perjanjian geometry with tools for overlay analysis and distance measurements.

## Features

- MapLibre map with automatic MapTiler vector basemap or OSM raster fallback.
- Layer controls for baseline, basepoints, batas maritim, and titik perjanjian data.
- GeoJSON uploader with validation and intersection analysis against the selected maritime zone.
- Stadia Maps powered search/autocomplete control for quick place lookups and map fly-to.
- Results table with area metrics (m², hectares, percentage) and CSV export via PapaParse.
- Two-point geodesic measurement tool displaying distance and initial bearing.
- Toast notifications for success and error states, plus state persistence with Zustand/localStorage.
- TailwindCSS styling with shadcn/ui components and tabbed tools panel.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development server

```bash
npm run dev
```

The app runs at http://localhost:5173/ with hot module replacement.

### Quality scripts

```bash
npm run lint    # ESLint (TypeScript + React rules)
npm run format  # Prettier format
npm run build   # Type-check and production bundle
```

## Data inputs

Bundled GeoJSON datasets intentionally ship as empty FeatureCollections for each core maritime layer. Load verified data through the uploader or export workflow to populate them. Ensure uploaded collections are WGS84 FeatureCollections with a consistent geometry type. For best performance, simplify very large (>5,000 feature) datasets before importing them.

## Environment configuration

- MapLibre defaults to OpenStreetMap raster tiles. Provide a MapTiler key via VITE_MAPTILER_TOKEN (or MAPTILER_TOKEN) to switch to the vector basemap.
- Stadia Maps geocoding is anonymous by default. Set `VITE_STADIA_MAPS_API_KEY` for higher limits and authenticated usage of the search box.

## Firebase Hosting

1. Build the project:
    ```bash
    npm run build
    ```
2. Initialize hosting (one time):
    ```bash
    firebase init hosting
    ```

    - Use existing project or create one
    - Public directory: dist
    - Configure as single-page app: **No**
3. Deploy:
    ```bash
    firebase deploy
    ```

## Tech Stack

- React 19 + TypeScript
- Vite 7
- MapLibre GL JS
- TailwindCSS + shadcn/ui components
- Zustand for state management
- Turf.js for geospatial calculations
- PapaParse for CSV exporting

## Licensing

Demo datasets are synthetic and provided for illustrative purposes only. Replace with official data sources for production use.
