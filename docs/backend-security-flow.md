# Alur Keamanan Backend SEA-BANDL

Diagram berikut mencerminkan implementasi aktual di `backend/app.js`, `middleware/requireDisplayToken.js`, dan `lib/security.js`.

```mermaid
flowchart TD
    A["Permintaan HTTP masuk"] --> B["Helmet: header keamanan"]
    B --> C{"CORS: origin diizinkan?\n(CORS_ORIGINS kosong = izinkan semua)"}
    C -- Tidak --> D["403 CORS_REJECTED"]
    C -- Ya --> E["httpLogger · spatialAuditLogger · express.json"]
    E --> F{"Rute mana?"}

    F --> G["Publik\n/health · /display/session"]
    G --> H["Handler (tanpa token)"]

    F --> I["POST /api/data-requests"]
    I --> J{"Rate limit submit\ndilewati?"}
    J -- Ya --> K["429 RATE_LIMITED"]
    J -- Tidak --> L["Validasi form + multer\n→ Handler"]

    F --> M["Admin GET/PATCH /data-requests"]
    M --> N{"X-Admin-Key valid?"}
    N -- Tidak --> O["401 / 503"]
    N -- Ya --> P["Handler admin"]

    F --> Q["Display channel\ntiles · limits · locations\nmeta · geo"]
    Q --> R{"displayRequireToken\naktif?"}
    R -- Tidak --> S["Handler"]
    R -- Ya --> T{"Display token valid?\nheader atau ?token="}
    T -- Tidak --> U["401 DISPLAY_TOKEN_REQUIRED"]
    T -- Ya --> S

    F --> V["Metadata opsional\n/sources · /curves · …"]
    V --> S
```

## Catatan implementasi

| Lapisan | Perilaku |
|---------|----------|
| **Helmet** | Middleware global pertama; CSP dinonaktifkan (API JSON saja) |
| **CORS** | Allowlist via `CORS_ORIGINS`; jika kosong, semua origin diizinkan (dev) |
| **Rate limit** | Hanya `POST /api/data-requests` (`buildRequestSubmitLimiter`); tidak ada limiter global di `app.js` |
| **Display token** | Hanya rute display channel; dilewati jika `DISPLAY_REQUIRE_TOKEN=false` |
| **Admin key** | `GET/PATCH /api/data-requests` memakai header `X-Admin-Key` |
| **Metadata opsional** | `/baselines`, `/curves`, `/sources`, dll. — tanpa display token jika `ENABLE_METADATA_API=true` |

## Referensi kode

- `backend/app.js` — urutan middleware dan mount router
- `backend/middleware/requireDisplayToken.js` — verifikasi display token
- `backend/lib/security.js` — Helmet, CORS, rate limiter factories
- `backend/lib/adminAuth.js` — autentikasi admin data-requests
- `backend/lib/displayConfig.js` — kebijakan `displayRequireToken()`, `useMvtDisplay()`
