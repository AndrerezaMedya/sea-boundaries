# Simulasi GeoServer Lokal (Windows, tanpa Docker)

Dokumen ini untuk simulasi GeoServer lokal menggunakan database yang sudah Anda isi (`seabandl_dev`).

## Prasyarat

1. PostgreSQL + PostGIS aktif.
2. Database sudah terisi dari alur sebelumnya:
   - `python db/migrate_all_pembaharuan.py`
   - `SELECT iho.refresh_from_staging(TRUE);`
3. Python environment proyek aktif.
4. GeoServer sudah terpasang lokal (installer/zip resmi GeoServer).

Catatan:
- Di mesin ini perintah Docker tidak tersedia, jadi simulasi ini fokus jalur native Windows.

## 1) Siapkan user read-only untuk GeoServer

Jalankan SQL berikut sebagai admin DB:

`\i db/geoserver_readonly_role.sql`

Lalu ubah password default role:

`ALTER ROLE geoserver_reader WITH PASSWORD 'ganti_password_aman';`

## 2) Jalankan GeoServer lokal

1. Start GeoServer (service atau startup script bawaan installasi).
2. Pastikan admin UI bisa diakses:
   - http://localhost:8080/geoserver

## 3) Publish workspace, datastore, dan layer via REST (otomatis)

Set environment variable di terminal aktif:

`$env:GEOSERVER_URL="http://localhost:8080/geoserver"`
`$env:GEOSERVER_USER="admin"`
`$env:GEOSERVER_PASSWORD="geoserver"`

`$env:PGHOST="127.0.0.1"`
`$env:PGPORT="5433"`
`$env:PGDATABASE="seabandl_dev"`
`$env:PGUSER="geoserver_reader"`
`$env:PGPASSWORD="ganti_password_aman"`

Jalankan skrip:

`python db/geoserver_publish_rest.py`

Skrip akan memastikan objek berikut ada:

- Workspace:
   - `seaboundaries`

- Datastore:
  - `seabandl_iho` (schema `iho`)
  - `seabandl_public` (schema `public`)

- Layer terpublikasi:
  - `maritime_boundary_line`
  - `extended_shelf_area`
  - `baseline_segment`
  - `basepoint`
  - `agreement_point`
  - `view_batas_laut_publik`

## 4) Uji endpoint OGC

Gunakan browser atau Postman.

### WMS GetCapabilities

http://localhost:8080/geoserver/seaboundaries/wms?service=WMS&version=1.1.1&request=GetCapabilities

### WFS GetCapabilities

http://localhost:8080/geoserver/seaboundaries/wfs?service=WFS&version=2.0.0&request=GetCapabilities

### WFS GetFeature (GeoJSON)

http://localhost:8080/geoserver/seaboundaries/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=seaboundaries:maritime_boundary_line&outputFormat=application/json

http://localhost:8080/geoserver/seaboundaries/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=seaboundaries:view_batas_laut_publik&outputFormat=application/json

## 5) Simulasi konsumsi layer dari frontend

Untuk percobaan cepat, gunakan endpoint WFS di atas sebagai sumber GeoJSON sementara.

Jika ingin mode visualisasi image service, gunakan WMS layer `seaboundaries:view_batas_laut_publik`.

## 6) Troubleshooting

1. Error koneksi DB di GeoServer
   - Pastikan `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` benar.
   - Pastikan role `geoserver_reader` punya `CONNECT`, `USAGE`, dan `SELECT`.

2. Layer tidak muncul di workspace
   - Jalankan ulang `python db/geoserver_publish_rest.py`.
   - Cek log terminal: status `[skip]` berarti objek sudah ada, `[ok]` berarti baru dibuat.

3. WFS kosong
   - Cek data ada di DB:
     - `SELECT * FROM iho.vw_feature_inventory ORDER BY feature_class, layer_id;`

4. CORS saat dipanggil dari frontend
   - Tambahkan konfigurasi CORS di reverse proxy atau container servlet GeoServer.

## 7) Catatan naming

Workspace default skrip adalah `seaboundaries`.

Jika ingin nama lain:

`python db/geoserver_publish_rest.py --workspace nama_workspace_baru`
