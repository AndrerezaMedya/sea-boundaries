# Spesifikasi Basis Data Spasial: Batas Laut NKRI Berbasis Web

Dokumen spesifikasi struktur, tipe data, dan constraint basis data spasial batas laut NKRI. Skema diimplementasikan berdasarkan standar **IHO S-121 (Maritime Limits and Boundaries)**, **ISO 19152:2012 / LADM (Land Administration Domain Model)**, dan **ISO 19115 (Metadata Geospatial)**.

---

### 1. Tabel: party
* **Paket:** Party Group (ISO 19152 LADM Party Package)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `pID` / 11 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Party::Party`. Entitas negara (coastal state / adjacent state) yang memiliki yurisdiksi batas maritim.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | pID | VARCHAR(50) | PRIMARY KEY, NOT NULL | Kode unik negara (ISO 3166-1 alpha-3), misal: IDN, AUS. |
| 2 | partyName | VARCHAR(255) | NOT NULL | Nama resmi entitas negara. |
| 3 | partyRole | VARCHAR(255) | NOT NULL, CHECK value IN ('rightsHolder', 'adjacentState') | Peran negara (rightsHolder / adjacentState). |
| 4 | partyType | VARCHAR(255) | NOT NULL | Tipe entitas, default: 'stateCountry'. |
| 5 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 6 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 2. Tabel: "right"
* **Paket:** Administrative Group (ISO 19152 LADM Administrative Package)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `rrrID` / 4 Records
* **IHO S-121 / ISO 19152 Mapping:** Turunan `S121 Administrative::Right Restriction Responsibility`. Merepresentasikan Right (hak) di zona maritim.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | rrrID | VARCHAR(50) | PRIMARY KEY | Identifier unik instrumen Right. |
| 2 | rightType | VARCHAR(255) | NOT NULL | Jenis Right (contoh: sovereignty, sovereignRight). |
| 3 | rightRestrictionResponsibilityDescription | TEXT | NULLABLE | Deskripsi instrumen Right. |
| 4 | rightRestrictionResponsibilityShare | NUMERIC | NULLABLE | Proporsi kepemilikan, default: 1 (100%). |
| 5 | rightRestrictionResponsibilityShareCheck | BOOLEAN | NULLABLE | Flag validasi persentase pembagian. |
| 6 | pID | VARCHAR(50) | FOREIGN KEY (party.pID) | Referensi ke Party pemegang Right (rightsHolder). |
| 7 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 8 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 3. Tabel: responsibility
* **Paket:** Administrative Group (ISO 19152 LADM Administrative Package)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `rrrID` / 6 Records
* **IHO S-121 / ISO 19152 Mapping:** Turunan `S121 Administrative::Right Restriction Responsibility`. Merepresentasikan Responsibility (tanggung jawab/kewajiban) negara.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | rrrID | VARCHAR(50) | PRIMARY KEY | Identifier unik instrumen Responsibility. |
| 2 | responsibilityType | VARCHAR(255) | NOT NULL | Jenis Responsibility. |
| 3 | rightRestrictionResponsibilityDescription | TEXT | NULLABLE | Deskripsi operasional Responsibility. |
| 4 | rightRestrictionResponsibilityShare | NUMERIC | NULLABLE | Proporsi beban Responsibility. |
| 5 | rightRestrictionResponsibilityShareCheck | BOOLEAN | NULLABLE | Flag validasi alokasi proporsi. |
| 6 | pID | VARCHAR(50) | FOREIGN KEY (party.pID) | Referensi ke Party yang mengemban Responsibility. |
| 7 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 8 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 4. Tabel: restriction
* **Paket:** Administrative Group (ISO 19152 LADM Administrative Package)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `rrrID` / 11 Records
* **IHO S-121 / ISO 19152 Mapping:** Turunan `S121 Administrative::Right Restriction Responsibility`. Merepresentasikan Restriction (pembatasan) pemanfaatan ruang maritim.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | rrrID | VARCHAR(50) | PRIMARY KEY | Identifier unik instrumen Restriction. |
| 2 | restrictionType | VARCHAR(255) | NOT NULL | Jenis Restriction di suatu zona maritim. |
| 3 | partyRequired | BOOLEAN | NULLABLE | Indikator butuh atau tidaknya pihak ketiga/Party tertentu. |
| 4 | rightRestrictionResponsibilityDescription | TEXT | NULLABLE | Deskripsi aturan Restriction. |
| 5 | rightRestrictionResponsibilityShare | NUMERIC | NULLABLE | Proporsi Restriction. |
| 6 | rightRestrictionResponsibilityShareCheck | BOOLEAN | NULLABLE | Flag validasi alokasi porsi. |
| 7 | pID | VARCHAR(50) | FOREIGN KEY (party.pID) | Referensi ke Party yang terikat Restriction. |
| 8 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 9 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 5. Tabel: basic_administrative_unit
* **Paket:** Administrative Group (ISO 19152 LADM Administrative Package)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `uID` / 9 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Administrative::BasicAdministrativeUnit` (BAUnit). Kesatuan administrasi spasial laut (contoh: Territorial Sea).

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | uID | VARCHAR(50) | PRIMARY KEY | Identifier unik BAUnit (contoh: BA_01). |
| 2 | basicAdministrativeUnitName | VARCHAR(255) | NOT NULL | Nama zona administrasi (contoh: Territorial Sea). |
| 3 | basicAdministrativeUnitType | VARCHAR(100) | NOT NULL | Tipe BAUnit (MaritimeLimitsAndBoundaries). |
| 4 | basicAdministrativeUnitContext | TEXT | NULLABLE | Konteks legal BAUnit. |
| 5 | pID | VARCHAR(50) | FOREIGN KEY (party.pID) | Referensi Party yang memiliki yurisdiksi. |
| 6 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 7 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 6. Tabel: governance
* **Paket:** Administrative Group (S-121 Governance)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `govID` / 7 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Administrative::Governance`. Instrumen tata kelola/produk hukum yang mengatur BAUnit.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | govID | VARCHAR(50) | PRIMARY KEY | Identifier unik Governance (contoh: GOV001). |
| 2 | reference_number | VARCHAR(100) | NOT NULL | Nomor referensi dokumen hukum (misal: UU 17/1985). |
| 3 | label | VARCHAR(255) | NOT NULL | Label alias Governance. |
| 4 | name | VARCHAR(255) | NOT NULL | Nama singkat instrumen perundangan. |
| 5 | governance_title | TEXT | NOT NULL | Judul resmi instrumen Governance. |
| 6 | governance_description | TEXT | NULLABLE | Deskripsi Governance. |
| 7 | releasibility_type | VARCHAR(50) | NOT NULL | Tingkat rilis instrumen (contoh: Public). |
| 8 | date_approved | DATE | NULLABLE | Tanggal pengesahan instrumen. |
| 9 | date_introduced | DATE | NULLABLE | Tanggal berlakunya (entry into force) instrumen. |
| 10 | sID | VARCHAR(50) | NOT NULL, FOREIGN KEY (source.sID) | Referensi Source yang memuat Governance ini. |
| 11 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 12 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 7. Tabel: feature_model_limit
* **Paket:** Feature/Attribute Group (S-121 Feature Model)
* **Tipe Geometri / SRID:** None / None (Geometri berelasi)
* **Primary Key / Record:** `fuID` / 240 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Feature::FeatureUnit` (Limit). Entitas logis demarkasi batas maritim.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuID | VARCHAR(50) | PRIMARY KEY | Identifier Feature Unit Limit. |
| 2 | label | VARCHAR(255) | NOT NULL | Keterangan teknis Limit (contoh: Limit Baseline). |
| 3 | status | VARCHAR(50) | NOT NULL | Status Limit (contoh: Unilateral, Agreement). |
| 4 | releasibility_type | VARCHAR(50) | NOT NULL | Tingkat rilis Limit. |
| 5 | limit_object_type | VARCHAR(100) | NOT NULL | Jenis Limit S-121 (contoh: Archipelagic Baseline). |
| 6 | arc_geometry_type | VARCHAR(50) | NOT NULL | Model interpolasi segmen (default: geodesic). |
| 7 | start_life_span | DATE | NOT NULL | Tanggal mulai berlaku Feature Limit. |
| 8 | end_life_span | DATE | NULLABLE | Tanggal kedaluwarsa Feature Limit (NULL jika aktif). |
| 9 | horizontal_datum | VARCHAR(50) | NOT NULL | Referensi geodesi horizontal (WGS84). |

---

### 8. Tabel: feature_model_zone
* **Paket:** Feature/Attribute Group (S-121 Feature Model)
* **Tipe Geometri / SRID:** None / None (Geometri berelasi)
* **Primary Key / Record:** `fuID` / 6 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Feature::FeatureUnit` (Zone). Entitas logis luasan poligon laut.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuID | VARCHAR(50) | PRIMARY KEY | Identifier Feature Unit Zone (contoh: ZONE_TS). |
| 2 | label | VARCHAR(255) | NOT NULL | Nama penanda Zone. |
| 3 | releasibility_type | VARCHAR(50) | NOT NULL | Tingkat rilis data Zone. |
| 4 | zone_object_type | VARCHAR(100) | NOT NULL | Tipe Zone S-121 (contoh: Exclusive Economic Zone). |
| 5 | jurisdiction_domain_type_list | VARCHAR(100) | NOT NULL | Domain yurisdiksi (misal: Water Surface). |
| 6 | surface_relation | VARCHAR(50) | NOT NULL | Posisi spasial Zone (misal: On Surface). |
| 7 | horizontal_datum | VARCHAR(50) | NOT NULL | Referensi sistem koordinat (WGS84). |
| 8 | start_life_span | DATE | NOT NULL | Tanggal berlakunya Zone. |
| 9 | end_life_span | DATE | NULLABLE | Tanggal kedaluwarsa Zone (NULL jika aktif). |

---

### 9. Tabel: feature_model_location
* **Paket:** Feature/Attribute Group (S-121 Feature Model)
* **Tipe Geometri / SRID:** None / None (Geometri berelasi)
* **Primary Key / Record:** `fuID` / 21671 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Feature::FeatureUnit` (Location). Entitas logis verteks/node pembentuk garis batas.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuID | VARCHAR(50) | PRIMARY KEY | Identifier Feature Unit Location (misal: LOC_TD.001). |
| 2 | label | VARCHAR(255) | NOT NULL | Nama penanda Location. |
| 3 | status | VARCHAR(50) | NOT NULL | Status Location (misal: Agreement). |
| 4 | releasibility_type | VARCHAR(50) | NOT NULL | Tingkat rilis data Location. |
| 5 | location_type_list | VARCHAR(100) | NOT NULL | Tipe fungsional Location (misal: Baseline Point). |
| 6 | interpolation_role | VARCHAR(50) | NOT NULL | Peran interpolasi ke titik berikutnya. |
| 7 | point_type | VARCHAR(50) | NOT NULL | Cara penetapan titik (default: defined). |
| 8 | start_life_span | DATE | NOT NULL | Tanggal mulai berlaku Feature Location. |
| 9 | end_life_span | DATE | NULLABLE | Tanggal kedaluwarsa Feature Location. |

---

### 10. Tabel: spatial_information_type
* **Paket:** Feature/Attribute Group (S-121 Feature Model)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `siID` / 451 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121_AdditionalSpatialInformationType`. Menyimpan informasi referensi geospasial mendetail terkait fitur.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | siID | VARCHAR(50) | PRIMARY KEY | Identifier informasi spasial tambahan. |
| 2 | location_by_text | VARCHAR(255) | NULLABLE | Deskripsi lokasi dalam bentuk teks. |
| 3 | horizontal_datum | VARCHAR(50) | NULLABLE | Datum horizontal (WGS84). |
| 4 | vertical_datum | VARCHAR(50) | NULLABLE | Datum vertikal (elevasi pasut, misal LWS). |
| 5 | start_life_span | DATE | NULLABLE | Tanggal mulai berlaku. |
| 6 | end_life_span | DATE | NULLABLE | Tanggal berakhir/kedaluwarsa (NULL = aktif). |

---

### 11. Tabel: spatial_points
* **Paket:** Spatial Unit Package (S-121 Spatial Attribute)
* **Tipe Geometri / SRID:** GEOMETRY(MultiPoint) / 4326
* **Primary Key / Record:** `saID` / 16756 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Feature::S121_SpatialAttributeType` (Point). Menyimpan titik koordinat fisik untuk Feature Location.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | saID | VARCHAR(50) | PRIMARY KEY | Identifier Spatial Attribute Point. |
| 2 | location | VARCHAR(255) | NULLABLE | Keterangan letak lokasi. |
| 3 | latitude | VARCHAR(50) | NULLABLE | Nilai lintang (DMS/Desimal). |
| 4 | longitude | VARCHAR(50) | NULLABLE | Nilai bujur (DMS/Desimal). |
| 5 | geom | GEOMETRY(Geometry, 4326) | SPATIAL INDEX (GIST) | Geometri fisik (MultiPoint/Point) pada EPSG:4326. |

---

### 12. Tabel: spatial_curves
* **Paket:** Spatial Unit Package (S-121 Spatial Attribute)
* **Tipe Geometri / SRID:** GEOMETRY(LineString) / 4326
* **Primary Key / Record:** `saID` / 89 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Feature::S121_SpatialAttributeType` (Curve). Linestring untuk batas wilayah laut di luar baseline.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | saID | VARCHAR(50) | PRIMARY KEY | Identifier Spatial Attribute Curve. |
| 2 | location | VARCHAR(255) | NULLABLE | Keterangan lokasi perairan. |
| 3 | geom | GEOMETRY(Geometry, 4326) | SPATIAL INDEX (GIST) | Geometri linestring fisik batas di EPSG:4326. |

---

### 13. Tabel: spatial_baselines
* **Paket:** Spatial Unit Package (S-121 Spatial Attribute)
* **Tipe Geometri / SRID:** GEOMETRY(LineString) / 4326
* **Primary Key / Record:** `saID` / 193 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Feature::S121_SpatialAttributeType` (Baseline). Menyimpan linestring garis pangkal.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | saID | VARCHAR(50) | PRIMARY KEY | Identifier Spatial Attribute Baseline. |
| 2 | location | VARCHAR(255) | NULLABLE | Penamaan perairan sekitar. |
| 3 | bsl_type | VARCHAR(255) | NULLABLE | Jenis operasional baseline (contoh: Straight Archipelagic Baseline). |
| 4 | geom | GEOMETRY(Geometry, 4326) | SPATIAL INDEX (GIST) | Geometri linestring fisik garis pangkal di EPSG:4326. |

---

### 14. Tabel: source_reference
* **Paket:** Source Group (ISO 19115 / S-121 Metadata)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `sourceReferenceID` / 6 Records
* **IHO S-121 / ISO 19152 Mapping:** Ekstraksi dari `responsibleParty`. Entitas atau organisasi yang bertanggung jawab merilis/menyimpan Source.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | sourceReferenceID | VARCHAR(50) | PRIMARY KEY | Identifier unik penanggung jawab (Source Reference). |
| 2 | responsiblePartyOganizationName | TEXT | NULLABLE | Nama entitas/organisasi (contoh: UN, BIG). |
| 3 | responsiblePartyPositionName | TEXT | NULLABLE | Jabatan/posisi otoritas entitas. |
| 4 | responsiblePartyRole | VARCHAR(50) | NULLABLE | Peran entitas (contoh: Custodian, Publisher). |
| 5 | responsiblePartyContactOnline | TEXT | NULLABLE | Tautan URL kontak organisasi. |
| 6 | responsiblePartyContactPhone | VARCHAR(50) | NULLABLE | Nomor telepon resmi. |
| 7 | responsiblePartyContactAddressCountry | VARCHAR(100) | NULLABLE | Negara asal entitas. |
| 8 | responsiblePartyContactAddressDeliveryPoint | TEXT | NULLABLE | Alamat fisik pengiriman. |
| 9 | responsiblePartyContactAddressCity | VARCHAR(100) | NULLABLE | Kota asal. |
| 10 | responsiblePartyContactElectronicMailAddress | VARCHAR(255) | NULLABLE | Email resmi. |
| 11 | responsiblePartyContactAddressAdministrativeArea | VARCHAR(100) | NULLABLE | Provinsi atau setingkat. |
| 12 | responsiblePartyContactAddressPostalCode | VARCHAR(50) | NULLABLE | Kode pos wilayah. |

---

### 15. Tabel: source_online_resource
* **Paket:** Source Group (ISO 19115 / S-121 Metadata)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `sourceOnlineResourceID` / 54 Records
* **IHO S-121 / ISO 19152 Mapping:** Ekstraksi dari `onlineResource`. Rujukan URL dokumen digital.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | sourceOnlineResourceID | VARCHAR(50) | PRIMARY KEY | Identifier Source Online Resource. |
| 2 | sourceOnlineResourceLinkageURL | TEXT | NOT NULL | Tautan repositori referensi dokumen digital (URL). |
| 3 | sourceOnlineResourceProtocol | VARCHAR(50) | NULLABLE | Protokol URI (misal: HTTPS). |
| 4 | sourceOnlineResourceApplicationProfile | VARCHAR(100) | NULLABLE | Profil akses aplikasi. |
| 5 | sourceOnlineResourceName | TEXT | NULLABLE | Nama identifikasi link tersebut. |
| 6 | sourceOnlineResourceDescription | TEXT | NULLABLE | Deskripsi rujukan dokumen. |
| 7 | sourceOnlineResourceFunction | VARCHAR(100) | NULLABLE | Fungsi URI (misal: download, information). |

---

### 16. Tabel: source
* **Paket:** Source Group (S-121 Source Model)
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** `sID` / 54 Records
* **IHO S-121 / ISO 19152 Mapping:** Implementasi `S121 Source::Source`. Dokumen legal pembentuk batas (Treaty, UU, dll).

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | sID | VARCHAR(50) | PRIMARY KEY | Identifier dokumen Source. |
| 2 | sourceDocumentName | TEXT | NOT NULL | Judul resmi dokumen. |
| 3 | sourceRegistryNumber | TEXT | NULLABLE | Kode arsip registrasi (misal: DOALOS). |
| 4 | sourceAdministrativeDateStamp | DATE | NULLABLE | Tanggal stempel administrasi. |
| 5 | sourceAuthoritativeDate | DATE | NULLABLE | Tanggal entry into force dokumen. |
| 6 | sourceDocumentType | VARCHAR(100) | NOT NULL | Jenis instrumen (contoh: Treaty). |
| 7 | sourceAvailabilityStatus | VARCHAR(50) | NULLABLE | Status ketersediaan akses (misal: Public). |
| 8 | administrativeSourceType | VARCHAR(50) | NULLABLE | Sub-klasifikasi tipe administratif. |
| 9 | spatialSourceType | VARCHAR(50) | NULLABLE | Sub-klasifikasi tipe rujukan spasial. |
| 10 | sourceType | VARCHAR(50) | NULLABLE | Tipe hierarki general dokumen. |
| 11 | sourceRecordation | DATE | NULLABLE | Tanggal deposit arsip dokumen. |
| 12 | sourceOnlineResourceID | VARCHAR(50) | NOT NULL, FOREIGN KEY (source_online_resource) | Referensi ke Source Online Resource. |
| 13 | sourceReferenceID | VARCHAR(50) | NOT NULL, FOREIGN KEY (source_reference) | Referensi ke Source Reference (penanggung jawab). |

---

### 17. Tabel Relasi: fmlocation_to_sapoint
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_location, said_point)` / 21671 Records
* **IHO S-121 / ISO 19152 Mapping:** Relasi abstrak geometri `spatialCharacteristics`. Mengaitkan Feature Location dengan wujud fisiknya (Spatial Attribute Point).

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_location | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_location.fuID) | Referensi asal Feature Location. |
| 2 | said_point | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (spatial_points.saID) | Referensi fisik Spatial Attribute Point. |

---

### 18. Tabel Relasi: fmlimit_to_fmlocation
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_limit, fuid_location)` / 21526 Records
* **IHO S-121 / ISO 19152 Mapping:** Memetakan daftar verteks Feature Location yang membentuk sebuah Feature Limit.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_limit | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_limit.fuID) | Referensi Feature Limit asal. |
| 2 | fuid_location | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_location.fuID) | Referensi Feature Location pembentuknya. |

---

### 19. Tabel Relasi: fmlimit_to_sacurve
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_limit, said_curve)` / 298 Records
* **IHO S-121 / ISO 19152 Mapping:** Memetakan Feature Limit abstrak dengan objek geometri fisik (Spatial Attribute Curve/Baseline).

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_limit | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_limit.fuID) | Referensi Feature Limit abstrak. |
| 2 | said_curve | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (spatial_curves / spatial_baselines) | Referensi Spatial Attribute (Curve/Baseline) fisik. |

---

### 20. Tabel Relasi: fmlimit_to_siid
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_limit, siID)` / 269 Records
* **IHO S-121 / ISO 19152 Mapping:** Mengaitkan Feature Limit dengan metadata Spatial Information Type.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_limit | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_limit.fuID) | Referensi Feature Limit. |
| 2 | siID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (spatial_information_type.siID) | Referensi ke Additional Spatial Information. |

---

### 21. Tabel Relasi: fmlocation_to_siid
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_location, siID)` / 21671 Records
* **IHO S-121 / ISO 19152 Mapping:** Mengaitkan Feature Location dengan metadata Spatial Information Type.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_location | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_location.fuID) | Referensi Feature Location. |
| 2 | siID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (spatial_information_type.siID) | Referensi ke Additional Spatial Information. |

---

### 22. Tabel Relasi: fmzone_to_siid
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_zone, siID)` / 41 Records
* **IHO S-121 / ISO 19152 Mapping:** Mengaitkan Feature Zone dengan metadata Spatial Information Type.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_zone | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_zone.fuID) | Referensi Feature Zone. |
| 2 | siID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (spatial_information_type.siID) | Referensi ke Additional Spatial Information. |

---

### 23. Tabel Relasi: source_to_party
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(sID, pID)` / 104 Records
* **IHO S-121 / ISO 19152 Mapping:** Memetakan dokumen Source (contoh: Treaty) kepada entitas Party negara terkait perjanjian tersebut.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | sID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (source.sID) | Referensi instrumen Source. |
| 2 | pID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (party.pID) | Referensi entitas Party terkait. |

---

### 24. Tabel Relasi: fmlocation_to_source
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_location, sID)` / 22147 Records
* **IHO S-121 / ISO 19152 Mapping:** Menautkan Feature Location kepada dokumen perundangan (Source) yang mengaturnya.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_location | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_location.fuID) | Referensi Feature Location spasial. |
| 2 | sID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (source.sID) | Referensi dokumen legal Source pengatur titik. |
| 3 | description | TEXT | NULLABLE | Anotasi keterangan tambahan relasi. |

---

### 25. Tabel Relasi: baunit_to_source
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(uID, sID)` / 19 Records
* **IHO S-121 / ISO 19152 Mapping:** Memetakan zona pengelolaan BAUnit kepada instrumen pendiriannya (Source).

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | uID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (basic_administrative_unit.uID) | Referensi administrasi BAUnit laut. |
| 2 | sID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (source.sID) | Referensi landasan hukum Source tersebut. |

---

### 26. Tabel Relasi: fmlimit_to_source
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_limit, sID)` / 457 Records
* **IHO S-121 / ISO 19152 Mapping:** Menautkan garis pembatas Feature Limit kepada instrumen hukum traktat asalnya (Source).

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_limit | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_limit.fuID) | Referensi garis batas Feature Limit. |
| 2 | sID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (source.sID) | Referensi traktat batas laut Source. |
| 3 | description | TEXT | NULLABLE | Deskripsi anotasi operasional tambahan. |

---

### 27. Tabel Relasi: rrr_to_source
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(rrrID, sID)` / 45 Records
* **IHO S-121 / ISO 19152 Mapping:** Menghubungkan hak/kewajiban RRR kepada landasan instrumen dokumen Source-nya.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | rrrID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (right/responsibility/restriction.rrrID) | Referensi instrumen legal RRR. |
| 2 | sID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (source.sID) | Referensi dokumen legal Source. |

---

### 28. Tabel Relasi: rrr_to_bau
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(rrrID, uID)` / 47 Records
* **IHO S-121 / ISO 19152 Mapping:** Mengaitkan paket hak/kewajiban RRR pada wilayah BAUnit (Area administrasi yurisdiksi) tempat RRR berlaku.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | rrrID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (right/responsibility/restriction.rrrID) | Referensi paket kedaulatan/hukum RRR. |
| 2 | uID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (basic_administrative_unit.uID) | Referensi wilayah operasi BAUnit. |

---

### 29. Tabel Relasi: fmzone_to_bau
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_zone, uID)` / 6 Records
* **IHO S-121 / ISO 19152 Mapping:** Menyelaraskan Feature Zone spasial abstrak pada administrasi makro ruang laut BAUnit.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_zone | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_zone.fuID) | Referensi abstrak wilayah Feature Zone. |
| 2 | uID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (basic_administrative_unit.uID) | Referensi area administrasi BAUnit terkait. |

---

### 30. Tabel Relasi: fmzone_to_fmlimit
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(fuid_zone, fuid_limit)` / 251 Records
* **IHO S-121 / ISO 19152 Mapping:** Merepresentasikan himpunan garis tepi Feature Limit pembatas yang membangun poligon wilayah Feature Zone.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | fuid_zone | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_zone.fuID) | Referensi entitas Zone yang dibatasi. |
| 2 | fuid_limit | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (feature_model_limit.fuID) | Referensi garis tepi Limit pembatasnya. |

---

### 31. Tabel Relasi: governance_to_bau
* **Paket:** Junction / Association Table
* **Tipe Geometri / SRID:** None / None
* **Primary Key / Record:** Composite PK `(govID, uID)` / 27 Records
* **IHO S-121 / ISO 19152 Mapping:** Memetakan instrumen produk pengatur (Governance) dengan wilayah BAUnit operasionalnya.

| No | Nama Atribut (Field) | Tipe Data | Aturan Validasi / Constraint | Keterangan / Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| 1 | govID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (governance.govID) | Referensi produk regulasi Governance. |
| 2 | uID | VARCHAR(50) | PK, NOT NULL, FOREIGN KEY (basic_administrative_unit.uID) | Referensi ruang lingkup operasi BAUnit. |
