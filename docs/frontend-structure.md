# Struktur Frontend SEA-BANDL

Stack: **Vite · React 19 · TypeScript · MapLibre GL JS · Zustand · React Router · TailwindCSS · shadcn/ui**.

Diagram global di bawah merangkum seluruh arsitektur frontend dalam satu peta.

```mermaid
flowchart TB
    subgraph S1["① Entry — main.tsx"]
        direction TB
        BR["BrowserRouter"]
        Toast["ToastManagerProvider · Toaster"]
        Theme["ThemeInitializer · useThemeStore"]
        App["App.tsx · Suspense + Routes\n(semua halaman lazy)"]
        BR --> Toast --> Theme --> App
    end

    App --> Portal
    App --> WebGIS

    subgraph Portal["② Halaman Portal"]
        direction TB
        PRoutes["/ · /request-data\n/user-guide · /success"]
        PNav["PortalNav · RequestDataForm"]
        SDR["submitDataRequest"]
        BPortal["POST /api/data-requests"]
        PRoutes --> PNav --> SDR --> BPortal
    end

    subgraph WebGIS["③ Halaman WebGIS — /peta"]
        direction TB
        Init["initializeLayersStore()"]
        Ribbon["Ribbon\nLayer · Filter · Geo · Basemap"]
        Panels["LayerPanel · FilterPanel\nGeoPanel · BasemapPanel"]
        Legend["LegendFloating"]
        GeoP["GeoprocessingPanel"]
        Init --> Ribbon
        Ribbon --> Panels
        Ribbon --> Legend
        Panels --> GeoP
    end

    Ribbon --> Stores
    Panels --> Stores
    GeoP --> Stores

    subgraph Stores["④ Zustand"]
        direction TB
        SLayer["useLayersStore\nvisibility · filter · atribut · zoom"]
        SUI["useUIStore persist\npanel · basemap · simbol · filter"]
        SGeo["useGeoResultStore\nhasil geoprocessing"]
        SLoc["useLocaleStore · id / en"]
        SLayer --> SUI --> SGeo --> SLoc
    end

    Stores -->|"state berubah"| Map

    subgraph S5["⑤ Kanvas peta"]
        direction TB
        Map["Map.tsx · MapLibre GL JS"]
        Engine["Engine peta\nruntimeSync · sourceBootstrap · basemapRuntime\nihoSymbology · filterExpr · mvtSourceSync\nlayerInteractions · geoResultLayer"]
        Map --> Engine
        Engine -.->|"sync layer · filter · simbol"| Map
    end

    Init --> DS["displaySession"]
    GeoP --> GA["geoApi"]
    Stores --> AC["apiClient"]
    GA --> DS
    DS --> AC

    subgraph Backend["⑥ Backend API"]
        direction TB
        BSession["GET /api/display/session"]
        BTiles["GET /api/tiles/… · X-Display-Token"]
        BData["GET /api/limits · /api/locations\nGET /api/meta/filter-options · detail"]
        BGeo["GET /api/geo/info · POST /api/geo/…"]
        BSession --> BTiles --> BData --> BGeo
    end

    DS --> BSession
    Map --> BTiles
    Map -.->|"useViewportAttributes"| AC
    AC --> BData
    GA --> BGeo
```

## Keterangan singkat

| Blok | Isi utama |
|------|-----------|
| **① Shell** | Bootstrap React, router, toast, tema |
| **② Portal** | Route informasi & permintaan data → `POST /api/data-requests` |
| **③ WebGIS** | Bootstrap layer, ribbon, panel, legend |
| **④ Stores** | State layer, UI peta, hasil geo, locale |
| **⑤ Kanvas** | MapLibre + engine sinkronisasi peta |
| **⑥ Backend** | Sesi, tile MVT, atribut, geoprocessing |

**Catatan:** `UserLayerPanel` (impor GeoJSON pengguna) ada di codebase tetapi belum di-mount di UI.
