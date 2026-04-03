# **Dokumentasi Teknis Pengembangan WebGIS Batas Laut NKRI (Implementasi Standar IHO S-121)**

## **1\. Arsitektur Sistem (High-Level Architecture)**

WebGIS ini menggunakan pendekatan **"Hybrid Architecture"** yang memisahkan jalur visualisasi publik (performa tinggi & aman) dengan jalur unduhan data (terproteksi).

### **Komponen Utama:**

1. **Database:** PostgreSQL \+ PostGIS (Menyimpan data spasial & atribut S-121).
2. **Middleware/Map Server:** GeoServer (Mengubah data database menjadi layanan OGC standar).
3. **Frontend:** React \+ MapLibre GL JS (Antarmuka pengguna interaktif).
4. **Backend API:** (NodeJS/Laravel/Python) Untuk autentikasi user & manajemen unduhan file.

### **Diagram Alur Data (The Flow)**

- **Visualisasi (Publik):** Database (SQL View) → GeoServer (Vector Tiles) → MapLibre (Browser).
- **Analisis (Publik):** Browser (Fetch API) → GeoServer (WPS Process) → Browser (GeoJSON).
- **Unduhan (Restricted):** Browser → Backend API (Auth Check) → Database (Raw Data) → File ZIP.

## ---

**2\. Manajemen Basis Data (PostgreSQL/PostGIS)**

Sistem ini tidak mengekspos tabel mentah (_raw tables_) secara langsung ke publik untuk menjaga kerahasiaan data sensitif.

### **A. Struktur Tabel (S-121 Model)**

Data disimpan mengikuti standar ISO 19152 (LADM) yang diadaptasi untuk laut (S-121).

- **Tabel Master:** batas_laut_master (Berisi geometri presisi tinggi, dasar hukum rahasia, dll).

### **B. Strategi Keamanan: SQL Views**

Kita membuat "cerminan" tabel yang sudah disensor untuk keperluan visualisasi publik.

SQL

\-- Contoh Query Pembuatan View Aman  
CREATE OR REPLACE VIEW view_batas_laut_publik AS  
SELECT  
 id,  
 \-- Mengambil geometri (bisa disederhanakan jika perlu)  
 geom,  
 \-- Hanya kolom aman yang dipilih  
 jenis_batas, \-- misal: "ZEE", "Teritorial"  
 nama_negara, \-- misal: "Malaysia", "Vietnam"  
 status_legal \-- misal: "Disepakati", "Unilateral"  
FROM  
 batas_laut_master;  
\-- Kolom 'dokumen_rahasia_id' TIDAK diikutsertakan.

**Pelajaran:** Di GeoServer nanti, yang di-publish adalah view_batas_laut_publik, BUKAN batas_laut_master.

## ---

**3\. Konfigurasi GeoServer**

GeoServer bertugas sebagai "pintu gerbang" standar OGC.

### **A. Layanan Vector Tiles (MVT) \- Untuk Visualisasi**

Menggantikan WMS agar peta lebih ringan, tajam, dan interaktif.

- **Format:** application/x-protobuf;type=mapbox-vector
- **Endpoint:** /gwc/service/tms/1.0.0/...
- **Grid Set:** Menggunakan EPSG:900913 (Web Mercator) agar kompatibel dengan Google Maps/OSM.

### **B. Layanan WPS (Web Processing Service) \- Untuk Analisis**

Digunakan untuk melakukan _geoprocessing_ di server.

- **Proses yang dipakai:** JTS:buffer (Library topologi Java).
- **Kenapa Server-side?** Untuk memastikan hasil buffer akurat secara matematis dan mengurangi beban browser jika user membuka di HP kentang.

## ---

**4\. Implementasi Frontend (MapLibre GL JS)**

Bagian ini adalah tempat kamu menulis kode JavaScript/TypeScript.

### **A. Menampilkan Peta (Vector Tiles)**

Jangan gunakan addLayer tipe WMS. Gunakan tipe vector.

JavaScript

// 1\. Tambahkan Sumber Data (Source)  
map.addSource('sumber-batas-laut', {  
 type: 'vector',  
 // URL ini mengarah ke layanan TMS/MVT GeoServer  
 tiles: \[  
 'https://domain-kamu.com/geoserver/gwc/service/tms/1.0.0/workspace:layer\_name@EPSG:900913@pbf/{z}/{x}/{y}.pbf'  
 \],  
 minzoom: 4,  
 maxzoom: 14  
});

// 2\. Tampilkan Garisnya (Layer Style)  
map.addLayer({  
 'id': 'layer-garis-batas',  
 'type': 'line',  
 'source': 'sumber-batas-laut',  
 'source-layer': 'layer_name', // Nama layer di GeoServer  
 'paint': {  
 'line-color': \[  
 'match', \['get', 'jenis_batas'\], // Styling dinamis berdasarkan atribut  
 'ZEE', '\#ff0000', // Merah untuk ZEE  
 'Teritorial', '\#0000ff', // Biru untuk Teritorial  
 '\#aaaaaa' // Abu-abu default  
 \],  
 'line-width': 2  
 }  
});

### **B. Interaksi Popup (Pada Vector Tiles)**

Meskipun berupa "tiles", MVT membawa data atribut sehingga bisa diklik.

JavaScript

map.on('click', 'layer-garis-batas', (e) \=\> {  
 // Ambil fitur yang diklik  
 const feature \= e.features\[0\];  
 const props \= feature.properties; // Data atribut (Jenis, Negara, dll)

    // Tampilkan Popup
    new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(\`
            \<h3\>${props.jenis\_batas}\</h3\>
            \<p\>Negara Tetangga: ${props.nama\_negara}\</p\>
            \<p\>Status: ${props.status\_legal}\</p\>
        \`)
        .addTo(map);

});

### **C. Analisis Buffer (WPS Request)**

Mengirim perintah ke GeoServer untuk menghitung buffer 12 mil laut.

JavaScript

async function requestBuffer(geometry, distanceNM) {  
 // Konversi Nautical Miles ke Derajat (Estimasi kasar untuk XML)  
 // Atau gunakan unit distance di WPS jika GeoServer support  
 const distanceDeg \= distanceNM \* 0.0166;

    const xmlPayload \= \`
    \<wps:Execute version="1.0.0" service="WPS" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink"\>
      \<ows:Identifier\>JTS:buffer\</ows:Identifier\>
      \<wps:DataInputs\>
        \<wps:Input\>
          \<ows:Identifier\>geom\</ows:Identifier\>
          \<wps:Data\>\<wps:ComplexData mimeType="application/json"\>${JSON.stringify(geometry)}\</wps:ComplexData\>\</wps:Data\>
        \</wps:Input\>
        \<wps:Input\>
          \<ows:Identifier\>distance\</ows:Identifier\>
          \<wps:Data\>\<wps:LiteralData\>${distanceDeg}\</wps:LiteralData\>\</wps:Data\>
        \</wps:Input\>
      \</wps:DataInputs\>
      \<wps:ResponseForm\>
        \<wps:RawDataOutput mimeType="application/json"\>
          \<ows:Identifier\>result\</ows:Identifier\>
        \</wps:RawDataOutput\>
      \</wps:ResponseForm\>
    \</wps:Execute\>\`;

    // Kirim Request
    const response \= await fetch('https://domain-kamu.com/geoserver/wps', {
        method: 'POST',
        body: xmlPayload,
        headers: { 'Content-Type': 'application/xml' }
    });

    const geojsonResult \= await response.json();

    // Tampilkan hasil buffer ke peta
    map.addSource('hasil-buffer', { type: 'geojson', data: geojsonResult });
    map.addLayer({ ... }); // Styling polygon buffer

}

## ---

**5\. Keamanan & Unduhan Data**

Ini adalah jawaban teknis untuk pertanyaan: _"Bagaimana menjaga kerahasiaan data?"_

### **Mekanisme Unduhan (Restricted Access)**

User publik **tidak** mengunduh data langsung dari GeoServer WFS.

1. **Frontend:** User klik tombol "Download SHP" \-\> Mengisi Form \-\> Login.
2. **API Backend:** Menerima request \+ Token Login.
3. **Validasi:** Backend mengecek apakah user ini "Admin" atau "Peneliti Terdaftar".
4. **Query Internal:** Jika valid, Backend melakukan query SQL SELECT \* ke tabel master (lewat jaringan lokal server, tidak lewat internet publik).
5. **Packaging:** Backend membungkus hasil query menjadi .zip (Shapefile).
6. **Response:** Backend mengirimkan file/link download ke user.

## ---

**6\. Daftar Istilah Penting (Glossary) untuk Sidang**

- **MVT (Mapbox Vector Tiles):** Standar pengiriman data vektor yang dipotong-potong menjadi ubin (tiles) kecil agar ringan dirender di browser menggunakan WebGL.
- **WPS (Web Processing Service):** Standar OGC untuk melakukan geoprocessing (analisis spasial) di sisi server.
- **WFS (Web Feature Service):** Standar OGC untuk pertukaran data vektor mentah (biasanya GML/GeoJSON). Di sistem ini aksesnya dibatasi.
- **S-121:** Standar IHO (International Hydrographic Organization) untuk data batas maritim digital.
- **PostGIS View:** Tabel virtual di database yang hasil isinya berasal dari query tersimpan; digunakan untuk memfilter kolom rahasia sebelum dipublish.

---

# **Modul Tambahan: Implementasi Layer Visualisasi**

## **A. Deep Dive: GeoServer Vector Tiles (MVT)**

Bagian ini menjelaskan secara spesifik bagaimana teknologi MVT bekerja sebagai solusi "Aman namun Interaktif" untuk data sensitif.

### **1\. Konsep "Obfuscation" (Pengaburan Data Presisi)**

Mengapa MVT dianggap lebih aman daripada WFS untuk data konfidensial?

5. **WFS (Raw Data):** Mengirim koordinat asli (Float/Desimal), misal: 106.82716234, \-6.17512345. Akurasi ini sangat tinggi (bisa sampai sentimeter).
6. **MVT (Rendered Data):** Mengubah koordinat bumi menjadi **Koordinat Layar Lokal (Integer)** dalam kotak ubin (Tile).
    - Setiap ubin (tile) dibagi menjadi grid internal (biasanya 4096 x 4096 unit).
    - Koordinat 106.82716234 diubah menjadi angka bulat, misal X: 2048, Y: 1024 relatif terhadap pojok ubin tersebut.
    - **Efeknya:** Koordinat asli "dibulatkan" ke grid terdekat. Secara visual terlihat sempurna, tapi jika diekstrak paksa, nilai koordinat aslinya sudah turun presisinya (tidak lagi valid untuk keperluan survei/hukum presisi tinggi).
    - **Clipping:** Garis yang panjang dipotong pas di pinggir ubin. Ini menyulitkan upaya penyatuan kembali (_stitching_) ribuan ubin menjadi satu file utuh.

### **2\. Langkah Konfigurasi di GeoServer**

Untuk menghasilkan output .pbf atau .mvt dari GeoServer:

- **Instalasi Ekstensi:**
    - GeoServer standar _belum_ bisa MVT. Kamu harus download ekstensi **"Vector Tiles"** dari website resmi GeoServer (sesuaikan versinya) dan ekstrak ke folder WEB-INF/lib. Restart GeoServer.
- **Tile Caching (GWC):**
    - Masuk ke menu **Layers** \-\> Pilih Layer view_batas_laut_publik \-\> Klik tab **Tile Caching**.
    - Centang **"Create a cached layer for this layer"**.
    - Pada bagian **Tile Image Formats**, pilih/centang:
        - application/x-protobuf;type=mapbox-vector (Ini format standar MVT).
- **Gridset:**
    - Pastikan menggunakan Gridset **EPSG:900913** (atau EPSG:3857) agar cocok dengan Google Maps/OSM.

### **3\. Cara Memanggil di MapLibre**

URL yang digunakan berbeda dengan WMS. Kita menggunakan layanan **TMS (Tile Map Service)** atau **WMTS** yang disediakan GeoWebCache (GWC) di dalam GeoServer.

JavaScript

// URL Template untuk GeoServer Vector Tiles  
// Perhatikan format: workspace:layer / gridset / z / x / y .pbf  
const vectorTileUrl \=  
 'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/' \+  
 'workspace_kamu:view_batas_laut_publik@EPSG:900913@pbf/' \+  
 '{z}/{x}/{y}.pbf';

map.addSource('batas-laut-mvt', {  
 type: 'vector',  
 tiles: \[ vectorTileUrl \],  
 minzoom: 4,  
 maxzoom: 15  
});

## ---

**B. Deep Dive: XYZ Raster Tiles**

Bagian ini menjelaskan teknologi yang digunakan oleh Basemap (OSM, Google, Carto, dll).

### **1\. Definisi Teknis**

XYZ Raster Tiles adalah metode pengiriman peta dasar berbasis **Gambar Statis (Static Images)** yang disusun dalam struktur piramida (Quadtree).

- **X:** Kolom horizontal.
- **Y:** Baris vertikal.
- **Z:** Zoom Level.

### **2\. Struktur Piramida (The Pyramid)**

Bayangkan peta dunia adalah satu lembar gambar.

- **Zoom 0:** 1 gambar utuh (Seluruh Dunia) \-\> 0/0/0.png.
- **Zoom 1:** Gambar Zoom 0 dipotong jadi 4 bagian.
- **Zoom 2:** Setiap potongan dipotong lagi jadi 4 (Total 16 gambar).
- **Zoom 18:** Jumlah gambarnya mencapai miliaran.

Server tidak perlu "berpikir" atau rendering ulang saat user meminta peta. Server hanya bertindak sebagai _File Server_ yang mengambil gambar nomor 10/50/60.png dari harddisk/cache lalu kirim. Itulah sebabnya ia sangat cepat.

### **3\. Perbedaan Utama dengan WMS**

| Fitur             | XYZ Raster Tiles (Basemap)                     | WMS (Layer Data Tradisional)                         |
| :---------------- | :--------------------------------------------- | :--------------------------------------------------- |
| **Isi**           | Gambar Kecil (256x256 px)                      | Gambar Satu Layar Penuh (misal 1920x1080)            |
| **Request**       | /{z}/{x}/{y}.png                               | BBOX=106, \-6, 107, \-7 & WIDTH=...                  |
| **Fleksibilitas** | **Kaku.** Tidak bisa ganti warna jalan/gedung. | **Fleksibel.** Bisa ganti style lewat parameter SLD. |
| **Beban Server**  | Sangat Ringan (Cuma kirim file).               | Berat (Render CPU setiap request).                   |

### **4\. Implementasi di MapLibre**

MapLibre mendukung ini secara _native_ dengan tipe source raster.

JavaScript

// Menambahkan OSM sebagai Basemap  
map.addSource('osm-raster', {  
 'type': 'raster',  
 'tiles': \[  
 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',  
 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png'  
 \],  
 'tileSize': 256,  
 'attribution': '© OpenStreetMap Contributors'  
});

map.addLayer({  
 'id': 'basemap-layer',  
 'type': 'raster',  
 'source': 'osm-raster',  
 'minzoom': 0,  
 'maxzoom': 19  
}, 'nama-layer-lain-di-atasnya'); // Opsional: taruh di bawah layer lain

### ---

**Ringkasan Arsitektur WebGIS Kamu (Final)**

Dengan pemahaman ini, struktur WebGIS kamu secara teknis adalah:

1. **Layer Paling Bawah (Basemap):** Menggunakan **XYZ Raster Tiles** (OSM/MapTiler) untuk kecepatan dan referensi visual.
2. **Layer Tengah (Batas Laut):** Menggunakan **Vector Tiles (MVT)** dari GeoServer untuk interaksi (klik), ketajaman garis, dan keamanan data (obfuscation).
3. **Layer Atas (Analisis):** Menggunakan **GeoJSON** hasil olahan **WPS** (atau Turf.js) untuk menampilkan hasil buffer sementara.
