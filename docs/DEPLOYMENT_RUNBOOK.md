# Deployment Runbook — S-121 WebGIS

> **Audience**: Operator yang melakukan deploy/rollback ke production.
> **Target Stack**: Google Cloud (Cloud SQL + Cloud Run) + Firebase Hosting.
> **Last Updated**: 2026-05-24

---

## 0. Pra-Syarat

| Tool | Min Version | Cek |
|---|---|---|
| `gcloud` CLI | latest | `gcloud --version` |
| `firebase` CLI | latest | `firebase --version` |
| `psql` | 15+ | `psql --version` |
| `cloud-sql-proxy` | latest | `cloud-sql-proxy --version` (sudah di repo: `cloud-sql-proxy.exe`) |
| Node.js | 20.x | `node --version` |

**Authentication** (sekali per workstation):

```powershell
gcloud auth login
gcloud auth application-default login
gcloud config set project <YOUR_GCP_PROJECT>
firebase login
```

**Variables runbook** (sesuaikan):

```
GCP_PROJECT       = your-gcp-project
GCP_REGION        = asia-southeast1
CLOUD_SQL_INSTANCE= your-instance-id
DB_NAME           = postgres
DB_USER           = postgres
SERVICE_NAME      = s121-backend
FIREBASE_PROJECT  = project1-seaboundaries
```

Connection name = `${GCP_PROJECT}:${GCP_REGION}:${CLOUD_SQL_INSTANCE}` (lihat di GCP Console → Cloud SQL).

---

## 1. Env Matrix

### Backend (Cloud Run)

| Var | Source | Contoh prod |
|---|---|---|
| `DB_USER` | env | `postgres` |
| `DB_NAME` | env | `postgres` |
| `DB_PASSWORD` | **Secret Manager** | `s121-db-password:latest` |
| `DB_HOST` | env | **`/cloudsql/<project>:<region>:<instance>`** (socket path; dipakai `backend/deploy.bat` saat ini) |
| `DB_PORT` | env | `5432` (dengan `DB_HOST` socket di Cloud Run) |
| `INSTANCE_UNIX_SOCKET` | env | *opsional* — sama dengan path socket di atas; `pool.js` memprioritaskan ini jika diset |
| `CORS_ORIGINS` | env | `https://project1-seaboundaries.web.app,https://project1-seaboundaries.firebaseapp.com` |
| `REQUIRE_BBOX` | env | `true` |
| `ENABLE_METADATA_API` | env | `false` |
| `DISPLAY_PRECISION_DECIMALS` | env | `4` |
| `DISPLAY_SIMPLIFY_TOLERANCE` | env | `0.0005` |
| `RATE_LIMIT_WINDOW_MS` | env | `60000` |
| `RATE_LIMIT_MAX` | env | `120` |
| `RATE_LIMIT_SPATIAL_MAX` | env | `60` |
| `LOG_LEVEL` | env | `info` |
| `NODE_ENV` | Dockerfile | `production` |
| `PORT` | injected by Cloud Run | `8080` |

### Frontend (Vite build)

| Var | Source | Contoh prod |
|---|---|---|
| `VITE_API_BASE` | `.env.production` | `https://s121-backend-<hash>-<region>.run.app` |
| `VITE_STADIA_MAPS_API_KEY` | `.env.production` (optional) | `<stadia-key>` |

---

## 2. First-Time Setup (one-off)

### 2.1 Rotate password & buat Secret

> **Wajib** karena `backend/.env.example` sebelumnya pernah memuat password asli.

```powershell
# 1. Generate strong password
$NEW_PWD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# 2. Rotate di Cloud SQL
gcloud sql users set-password $DB_USER `
  --instance=$CLOUD_SQL_INSTANCE `
  --password=$NEW_PWD

# 3. Buat secret baru
$NEW_PWD | gcloud secrets create s121-db-password --data-file=-

# 4. Beri Cloud Run service-account akses
$SA = (gcloud run services describe $SERVICE_NAME --region=$GCP_REGION --format='value(spec.template.spec.serviceAccountName)')
gcloud secrets add-iam-policy-binding s121-db-password `
  --member="serviceAccount:$SA" `
  --role=roles/secretmanager.secretAccessor

# 5. Bersihkan variable
$NEW_PWD = $null
```

### 2.2 Cloud SQL Auth Proxy local connection

Untuk apply migration / debug DB dari workstation:

```powershell
# Foreground (Ctrl+C to stop)
.\cloud-sql-proxy.exe ${GCP_PROJECT}:${GCP_REGION}:${CLOUD_SQL_INSTANCE} --port=5432

# Lalu di terminal lain:
psql "host=127.0.0.1 port=5432 dbname=$DB_NAME user=$DB_USER"
```

---

## 3. Deploy Backend

### 3.1 Apply DB migration (idempotent)

```powershell
# Pastikan cloud-sql-proxy jalan di port 5432.
psql "host=127.0.0.1 port=5432 dbname=$DB_NAME user=$DB_USER" `
  -f backend\migrations\001_indexes.sql
```

**Verifikasi indexes**:

```sql
SELECT indexname FROM pg_indexes
 WHERE schemaname='public' AND indexname LIKE 'idx_%'
 ORDER BY indexname;
```

Harus ada minimal 13 baris (`idx_spatial_*_geom`, `idx_fmloc_*`, `idx_fmlimit_*`, dst.).

### 3.2 Build & Deploy ke Cloud Run

Source-based deploy (paling sederhana):

**Cara termudah (Windows):** jalankan dari folder `backend/`:

```bat
deploy.bat
```

`deploy.bat` menulis env ke file YAML sementara (`--env-vars-file`) karena `CORS_ORIGINS` berisi koma — `gcloud --set-env-vars` memecah nilai pada setiap koma.

**Setara manual (PowerShell)** — memakai `DB_HOST` socket (tanpa `INSTANCE_UNIX_SOCKET`):

```powershell
$CONN = "${GCP_PROJECT}:${GCP_REGION}:${CLOUD_SQL_INSTANCE}"
$SOCKET = "/cloudsql/$CONN"
$CORS = "https://project1-seaboundaries.web.app,https://project1-seaboundaries.firebaseapp.com"

gcloud run deploy $SERVICE_NAME `
  --source backend `
  --region=$GCP_REGION `
  --platform=managed `
  --allow-unauthenticated `
  --add-cloudsql-instances=$CONN `
  --set-env-vars="DB_USER=$DB_USER,DB_NAME=$DB_NAME,DB_HOST=$SOCKET,DB_PORT=5432,CORS_ORIGINS=$CORS,REQUIRE_BBOX=true,ENABLE_METADATA_API=false,DISPLAY_PRECISION_DECIMALS=4,DISPLAY_SIMPLIFY_TOLERANCE=0.0005,RATE_LIMIT_MAX=120,RATE_LIMIT_WINDOW_MS=60000,RATE_LIMIT_SPATIAL_MAX=60,LOG_LEVEL=info" `
  --set-secrets="DB_PASSWORD=s121-db-password:latest" `
  --min-instances=1 `
  --max-instances=10 `
  --memory=512Mi `
  --cpu=1 `
  --timeout=60s
```

> **Cloud SQL di Cloud Run:** wajib `--add-cloudsql-instances`. Env koneksi cukup `DB_HOST=/cloudsql/...` + `DB_PORT=5432`. `INSTANCE_UNIX_SOCKET` opsional (nilai path sama); tidak perlu ditambah jika `DB_HOST` sudah benar.

`--min-instances=1` menghindari cold-start saat user pertama membuka peta.

### 3.3 Smoke-test prod

```powershell
$BASE = (gcloud run services describe $SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')

# Health
curl "$BASE/api/health"
# → {"status":"OK","db":"reachable",...}

# Spatial sample
curl "$BASE/api/limits?type=EEZ"
# → 400 BBOX_REQUIRED

curl "$BASE/api/limits?type=EEZ&bbox=95,-10,141,6" | ConvertFrom-Json | Select -Expand features | Measure-Object
curl "$BASE/api/locations?type=Boundary%20Point&bbox=95,-10,141,6&limit=10" | ConvertFrom-Json

# Metadata (disabled when ENABLE_METADATA_API=false)
curl "$BASE/api/sources"
# → 404
curl "$BASE/api/sources?limit=5"
curl "$BASE/api/baunits"
curl "$BASE/api/rrr?kind=right"

# Detail
curl "$BASE/api/limits/LIM_EEZ_01"
curl "$BASE/api/parties/IDN"

# Negative tests
curl "$BASE/api/limits?type=INVALID"   # → 400 INVALID_TYPE
curl "$BASE/api/limits?bbox=0,0,0,0"   # → 400 INVALID_BBOX
curl "$BASE/api/notfound"              # → 404 NOT_FOUND
```

---

## 4. Deploy Frontend

### 4.1 Set env

Buat `.env.production` (gitignored):

```
VITE_API_BASE=https://s121-backend-<hash>-<region>.run.app
VITE_STADIA_MAPS_API_KEY=<your-key-or-empty>
```

### 4.2 Build

```powershell
npm install
npm run build
```

Output → `dist/`.

### 4.3 Deploy ke Firebase Hosting

```powershell
firebase deploy --only hosting --project $FIREBASE_PROJECT
```

URL: `https://${FIREBASE_PROJECT}.web.app`

### 4.4 Verifikasi end-to-end

1. Buka `https://${FIREBASE_PROJECT}.web.app`
2. DevTools → Network → cari request ke `/api/limits?type=EEZ`. Status 200, ada `Cache-Control: public, max-age=300`.
3. Toggle layer EEZ → harus tampil di peta.
4. Klik fitur → popup tampil dengan label, source, party (saat Phase 3 frontend popup selesai).

---

## 5. Rollback

### 5.1 Backend rollback

```powershell
# List revisi
gcloud run revisions list --service=$SERVICE_NAME --region=$GCP_REGION

# Rollback ke revisi sebelumnya
gcloud run services update-traffic $SERVICE_NAME `
  --region=$GCP_REGION `
  --to-revisions=<previous-revision-name>=100
```

### 5.2 Frontend rollback

```powershell
firebase hosting:rollback --project $FIREBASE_PROJECT
```

### 5.3 Migration rollback

`001_indexes.sql` adalah additive (CREATE INDEX IF NOT EXISTS). Tidak ada destructive change. Untuk drop:

```sql
DROP INDEX IF EXISTS idx_spatial_points_geom;
DROP INDEX IF EXISTS idx_spatial_curves_geom;
DROP INDEX IF EXISTS idx_spatial_baselines_geom;
DROP INDEX IF EXISTS idx_fmloc_to_sapoint_said;
DROP INDEX IF EXISTS idx_fmlimit_to_sacurve_said;
DROP INDEX IF EXISTS idx_fmlimit_to_fmlocation_loc;
DROP INDEX IF EXISTS idx_fmloc_to_source_sid;
DROP INDEX IF EXISTS idx_fmlimit_to_source_sid;
DROP INDEX IF EXISTS idx_baunit_to_source_sid;
DROP INDEX IF EXISTS idx_source_to_party_pid;
DROP INDEX IF EXISTS idx_rrr_to_source_sid;
DROP INDEX IF EXISTS idx_rrr_to_bau_uid;
DROP INDEX IF EXISTS idx_feature_model_limit_status;
DROP INDEX IF EXISTS idx_feature_model_limit_object_type;
DROP INDEX IF EXISTS idx_feature_model_location_type;
DROP INDEX IF EXISTS idx_spatial_baselines_bsl_type;
```

---

## 6. Observability

### Logs

```powershell
# Live tail
gcloud run services logs tail $SERVICE_NAME --region=$GCP_REGION

# Last 50 errors
gcloud run services logs read $SERVICE_NAME --region=$GCP_REGION `
  --limit=50 --format='value(textPayload)' `
  --filter='severity>=ERROR'
```

Karena pakai pino + format severity, error langsung tersaring di Cloud Logging.

### Metrics yang dipantau

| Metric | Threshold | Action |
|---|---|---|
| `request_latencies` p95 | < 800 ms | Investigate slow queries |
| `request_count` 5xx | < 1 % | Check logs |
| `instance_count` | min 1, max 10 | Tune `--min-instances` / `--max-instances` |
| Cloud SQL CPU | < 70 % | Scale tier or add read replica |
| Cloud SQL connections | < `DB_POOL_MAX` × `max-instances` | Tune pool |

---

## 7. Common Issues

| Symptom | Penyebab | Fix |
|---|---|---|
| Health endpoint 503 saat cold start | Pool belum terhubung | Set `--min-instances=1` |
| `INVALID_BBOX` di response | Param luar Indonesia bbox guard | Cek client mengirim `minLon < maxLon` |
| `Origin not allowed by CORS` | `CORS_ORIGINS` belum berisi domain frontend | `gcloud run services update --update-env-vars=CORS_ORIGINS=...` |
| Empty `features: []` di `/api/limits` | Filter `type` atau `status` tidak match | Hapus filter, cek seed |
| 429 Rate Limited di dev | Banyak hot-reload | Naikkan `RATE_LIMIT_MAX` di `.env` lokal |

---

## 8. Pre-flight Checklist (sebelum tag release)

- [ ] `npm run build` di repo root sukses, tidak ada warning TypeScript.
- [ ] `node -c backend/server.js` + semua route module → OK.
- [ ] Migration `001_indexes.sql` sudah ter-apply (cek `pg_indexes`).
- [ ] Smoke-test §3.3 semua hijau (atau 400/404 sesuai ekspektasi).
- [ ] `backend/.env.example` tidak memuat credential asli.
- [ ] `CORS_ORIGINS` di Cloud Run sudah include domain frontend prod.
- [ ] DB password ada di Secret Manager (bukan env plain).
- [ ] `firebase deploy --only hosting` sukses, URL accessible.
- [ ] Layer EEZ tampil di peta + popup berfungsi.
