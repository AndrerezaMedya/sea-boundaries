@echo off
setlocal EnableExtensions

REM ─── Sesuaikan jika project/instance berbeda ─────────────────────────────
set GCP_PROJECT=seaboundaries-testing
set GCP_REGION=asia-southeast1
set SERVICE_NAME=s121-backend
set CLOUD_SQL_INSTANCE=sea-bound-testing
set CLOUD_SQL_CONNECTION=%GCP_PROJECT%:%GCP_REGION%:%CLOUD_SQL_INSTANCE%

REM Cloud Run + Cloud SQL: DB_HOST = path socket (bukan TCP hostname).
set DB_SOCKET_HOST=/cloudsql/%CLOUD_SQL_CONNECTION%

REM Koma di CORS_ORIGINS tidak boleh lewat --set-env-vars (gcloud pakai koma sebagai pemisah).
set CORS_ORIGINS=https://project1-seaboundaries.web.app,https://project1-seaboundaries.firebaseapp.com,https://seabandl.app,https://www.seabandl.app

set ENV_FILE=%TEMP%\s121-cloudrun-env-%RANDOM%.yaml

echo.
echo Deploy backend: %SERVICE_NAME%
echo   region   : %GCP_REGION%
echo   cloudsql : %CLOUD_SQL_CONNECTION%
echo   db host  : %DB_SOCKET_HOST%
echo   env file : %ENV_FILE%
echo.

(
echo DB_USER: postgres
echo DB_NAME: postgres
echo DB_HOST: %DB_SOCKET_HOST%
echo DB_PORT: "5432"
echo CORS_ORIGINS: "%CORS_ORIGINS%"
echo REQUIRE_BBOX: "true"
echo ENABLE_METADATA_API: "false"
echo DISPLAY_SIMPLIFY_TOLERANCE: "0"
echo ENABLE_API_RATE_LIMIT: "false"
echo DISPLAY_DETAIL_MAX_SOURCES: "12"
echo DISPLAY_MODE: "mvt"
echo DISPLAY_REQUIRE_TOKEN: "true"
echo DISPLAY_MAX_BBOX_AREA_DEG2: "25"
echo DISPLAY_TOKEN_TTL_SECONDS: "3600"
echo TILE_CACHE_MAX_ENTRIES: "8000"
echo TILE_CACHE_TTL_SECONDS: "3600"
echo TILE_CACHE_HTTP_MAX_AGE: "3600"
echo REQUEST_SUBMIT_MAX: "5"
echo REQUEST_SUBMIT_WINDOW_MS: "3600000"
echo LOG_LEVEL: info
) > "%ENV_FILE%"

REM Wajib: set secret DISPLAY_TOKEN_SECRET di Cloud Run, contoh:
REM   gcloud secrets create s121-display-token-secret --replication-policy=automatic
REM   (isi nilai acak panjang, lalu tambahkan ke deploy:)
REM   --set-secrets=DISPLAY_TOKEN_SECRET=s121-display-token-secret:latest

if errorlevel 1 (
  echo Gagal menulis %ENV_FILE%
  pause
  exit /b 1
)

gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --region=%GCP_REGION% ^
  --platform=managed ^
  --allow-unauthenticated ^
  --add-cloudsql-instances=%CLOUD_SQL_CONNECTION% ^
  --env-vars-file="%ENV_FILE%" ^
  --set-secrets=DB_PASSWORD=s121-db-password:latest,DISPLAY_TOKEN_SECRET=s121-display-token-secret:latest ^
  --min-instances=1 ^
  --max-instances=10 ^
  --memory=512Mi ^
  --cpu=1 ^
  --timeout=60s

set DEPLOY_EXIT=%ERRORLEVEL%
del "%ENV_FILE%" 2>nul

if not "%DEPLOY_EXIT%"=="0" (
  echo.
  echo Deployment gagal.
  pause
  exit /b 1
)

echo.
echo Deployment selesai.
for /f "delims=" %%u in ('gcloud run services describe %SERVICE_NAME% --region=%GCP_REGION% --format^=value^(status.url^)') do set SERVICE_URL=%%u
echo URL: %SERVICE_URL%
echo.
echo Smoke test ^(PowerShell^):
echo   curl "%SERVICE_URL%/api/health"
echo   curl "%SERVICE_URL%/api/limits?type=EEZ"
echo   curl "%SERVICE_URL%/api/limits?type=EEZ^&bbox=95,-10,141,6"
echo.
pause
