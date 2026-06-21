export const userGuideId = {
	hero: {
		badge: 'Referensi Operasional',
		title: 'Petunjuk Penggunaan SEA-BANDL',
		desc: 'Panduan ini membantu pengguna memahami alur navigasi, pembacaan atribut batas laut, pemanfaatan filter, serta tata cara penggunaan data secara tepat dan bertanggung jawab.',
	},
	sectionTitle: 'Petunjuk Penggunaan',
	sectionSubtitle: 'SEA-BANDL',
	sections: {
		accessMap: {
			title: 'Mengakses Peta Interaktif',
			desc: 'Peta interaktif digunakan untuk melihat dan mengeksplorasi informasi spasial batas laut NKRI. Pengguna dapat membuka peta dari halaman beranda atau navigation bar.',
			steps: [
				{ t: 'Buka halaman peta', d: 'Klik tombol Akses Peta pada halaman beranda atau navigation bar.' },
				{ t: 'Tunggu halaman dimuat', d: 'Tunggu hingga basemap dan layer selesai dimuat.' },
				{ t: 'Eksplorasi tampilan peta', d: 'Gunakan kontrol zoom atau geser peta untuk melihat wilayah tertentu.' },
				{ t: 'Gunakan fitur pendukung', d: 'Pilih fitur Layer, Filter, Basemap, atau Geo sesuai kebutuhan eksplorasi.' },
			],
		},
		layers: {
			title: 'Mengatur Layer Peta',
			desc: 'Panel Layer digunakan untuk mengatur data batas laut yang ditampilkan pada peta. Fitur ini membantu pengguna memilih informasi spasial yang ingin dilihat.',
			steps: [
				{ t: 'Buka panel Layer', d: 'Klik menu Layer pada toolbar peta.' },
				{ t: 'Aktifkan atau nonaktifkan layer', d: 'Gunakan toggle pada layer yang ingin ditampilkan atau disembunyikan.' },
				{ t: 'Buka sub-layer', d: 'Klik tanda panah pada layer yang memiliki turunan apabila ingin melihat rincian layer.' },
				{ t: 'Pilih mode simbologi', d: 'Gunakan mode IHO Standard atau Easy-Read apabila diperlukan.' },
			],
		},
		filter: {
			title: 'Menggunakan Filter Atribut',
			desc: 'Panel Filter digunakan untuk menyaring objek berdasarkan kategori dan atribut tertentu. Fitur ini membantu pengguna menampilkan objek yang lebih spesifik tanpa menonaktifkan layer satu per satu.',
			steps: [
				{ t: 'Buka panel Filter', d: 'Klik menu Filter pada toolbar peta.' },
				{ t: 'Pilih kategori objek', d: 'Pilih LIMIT untuk objek batas/garis/zona atau POINT untuk objek titik.' },
				{ t: 'Pilih atribut filter', d: 'Gunakan atribut yang tersedia, seperti tipe objek, status, lokasi perairan, atau datum.' },
				{ t: 'Terapkan filter', d: 'Klik Terapkan Filter untuk menampilkan hasil sesuai kriteria.' },
				{ t: 'Reset filter', d: 'Klik Reset untuk menghapus filter aktif dan mengembalikan tampilan awal.' },
			],
		},
		detail: {
			title: 'Membuka Detail Atribut',
			desc: 'Detail Atribut menampilkan informasi objek secara lebih lengkap. Bagian ini dapat memuat atribut utama, sumber data, tautan sumber, dan batas terkait.',
			steps: [
				{ t: 'Pilih objek pada peta', d: 'Klik objek yang ingin dilihat informasinya.' },
				{ t: 'Buka Detail Atribut', d: 'Pada pop-up informasi, klik tombol Detail Atribut.' },
				{ t: 'Periksa bagian Atribut', d: 'Baca informasi utama objek, seperti label, tipe, status, lokasi perairan, dan ID sumber.' },
				{ t: 'Periksa bagian Sumber', d: 'Lihat daftar dokumen atau data rujukan yang berkaitan dengan objek. Klik tautan sumber apabila tersedia.' },
				{ t: 'Periksa Batas Terkait', d: 'Lihat objek batas lain yang berkaitan dengan objek terpilih apabila tersedia.' },
				{ t: 'Tutup panel detail', d: 'Klik Tutup untuk kembali ke tampilan peta.' },
			],
		},
		geo: {
			title: 'Menggunakan Geoprocessing',
			desc: 'Panel Geo menyediakan operasi spasial sederhana untuk eksplorasi awal, seperti Buffer, Hitung Panjang, dan Hitung Luas.',
			steps: [
				{ t: 'Buka panel Geo', d: 'Klik menu Geo pada toolbar peta.' },
				{ t: 'Pilih operasi', d: 'Pilih Buffer, Hitung Panjang, atau Hitung Luas.' },
				{ t: 'Pilih layer input', d: 'Pilih layer yang akan diproses.' },
				{ t: 'Isi parameter', d: 'Untuk Buffer, masukkan jarak buffer dalam satuan nautical mile (NM).' },
				{ t: 'Jalankan operasi', d: 'Klik Jalankan Operasi untuk menampilkan hasil.' },
				{ t: 'Hapus hasil', d: 'Klik Hapus Hasil apabila hasil operasi tidak lagi diperlukan.' },
			],
			listTitle: 'Daftar Operasi Geo',
			operations: [
				{ t: 'Buffer', d: 'Membuat zona penyangga di sekitar objek atau layer.' },
				{ t: 'Hitung Panjang', d: 'Menghitung panjang objek garis pada layer input.' },
				{ t: 'Hitung Luas', d: 'Menghitung luas objek area/poligon pada layer input.' },
			]
		},
		requestData: {
			title: 'Mengajukan Request Data',
			desc: 'Halaman Request Data digunakan untuk mengajukan permintaan data batas laut melalui formulir yang tersedia pada website.',
			steps: [
				{ t: 'Buka halaman Request Data', d: 'Klik menu Request Data pada navigation bar atau tombol yang tersedia.' },
				{ t: 'Baca prosedur pengajuan', d: 'Perhatikan ketentuan dan informasi pengajuan yang ditampilkan pada halaman.' },
				{ t: 'Isi data pemohon', d: 'Lengkapi identitas, institusi, kontak, keperluan data, dan keterangan tambahan.' },
				{ t: 'Unggah dokumen pendukung', d: 'Pilih dokumen yang sesuai format dan ukuran yang ditentukan.' },
				{ t: 'Periksa kembali isian', d: 'Pastikan seluruh data dan dokumen sudah benar.' },
				{ t: 'Kirim permintaan', d: 'Klik Kirim Permintaan Data dan tunggu konfirmasi dari sistem.' },
			],
		},
	},
	cta: {
		title: 'Panduan Pengguna',
		desc: 'Unduh dengan tombol dibawah',
		btn: 'Unduh Panduan Lengkap'
	}
};

export const userGuideEn = {
	hero: {
		badge: 'Operational Reference',
		title: 'SEA-BANDL User Guide',
		desc: 'This guide helps users understand navigation flows, sea boundary attribute interpretation, filter utilization, and procedures for using data appropriately and responsibly.',
	},
	sectionTitle: 'User Instructions',
	sectionSubtitle: 'SEA-BANDL',
	sections: {
		accessMap: {
			title: 'Accessing the Interactive Map',
			desc: 'The interactive map is used to view and explore spatial information on Indonesian sea boundaries. Users can open the map from the home page or navigation bar.',
			steps: [
				{ t: 'Open the map page', d: 'Click the Access Map button on the home page or navigation bar.' },
				{ t: 'Wait for the page to load', d: 'Wait until the basemap and layers have finished loading.' },
				{ t: 'Explore the map view', d: 'Use the zoom or pan controls to view specific areas.' },
				{ t: 'Use supporting features', d: 'Select Layer, Filter, Basemap, or Geo features according to your exploration needs.' },
			],
		},
		layers: {
			title: 'Managing Map Layers',
			desc: 'The Layer panel is used to manage the sea boundary data displayed on the map. This feature helps users select the spatial information they want to view.',
			steps: [
				{ t: 'Open the Layer panel', d: 'Click the Layer menu on the map toolbar.' },
				{ t: 'Enable or disable layers', d: 'Use the toggles on the layers you want to show or hide.' },
				{ t: 'Open sub-layers', d: 'Click the arrow on layers with children to see layer details.' },
				{ t: 'Select symbology mode', d: 'Use IHO Standard or Easy-Read mode if necessary.' },
			],
		},
		filter: {
			title: 'Using Attribute Filters',
			desc: 'The Filter panel is used to filter objects based on specific categories and attributes. This feature helps users display specific objects without disabling layers individually.',
			steps: [
				{ t: 'Open the Filter panel', d: 'Click the Filter menu on the map toolbar.' },
				{ t: 'Select object category', d: 'Select LIMIT for boundary/line/zone objects or POINT for point objects.' },
				{ t: 'Select filter attributes', d: 'Use available attributes, such as object type, status, sea area, or datum.' },
				{ t: 'Apply filters', d: 'Click Apply Filter to display results matching the criteria.' },
				{ t: 'Reset filters', d: 'Click Reset to clear active filters and return to the initial view.' },
			],
		},
		detail: {
			title: 'Opening Attribute Details',
			desc: 'Attribute Details display complete object information. This section can include primary attributes, data sources, source links, and related limits.',
			steps: [
				{ t: 'Select an object on the map', d: 'Click the object you want to inspect.' },
				{ t: 'Open Attribute Details', d: 'On the information pop-up, click the Attribute Details button.' },
				{ t: 'Check the Attributes section', d: 'Read the primary object information, such as label, type, status, sea area, and source IDs.' },
				{ t: 'Check the Sources section', d: 'See the list of documents or reference data related to the object. Click source links if available.' },
				{ t: 'Check Related Limits', d: 'See other boundary objects related to the selected object if available.' },
				{ t: 'Close the detail panel', d: 'Click Close to return to the map view.' },
			],
		},
		geo: {
			title: 'Using Geoprocessing',
			desc: 'The Geo panel provides simple spatial operations for initial exploration, such as Buffer, Calculate Length, and Calculate Area.',
			steps: [
				{ t: 'Open the Geo panel', d: 'Click the Geo menu on the map toolbar.' },
				{ t: 'Select an operation', d: 'Choose Buffer, Calculate Length, or Calculate Area.' },
				{ t: 'Select the input layer', d: 'Select the layer to be processed.' },
				{ t: 'Fill in parameters', d: 'For Buffer, enter the buffer distance in nautical miles (NM).' },
				{ t: 'Run the operation', d: 'Click Run Operation to display the results.' },
				{ t: 'Clear results', d: 'Click Clear Result when the operation results are no longer needed.' },
			],
			listTitle: 'Geo Operations List',
			operations: [
				{ t: 'Buffer', d: 'Creates a buffer zone around an object or layer.' },
				{ t: 'Calculate Length', d: 'Calculates the length of line objects on the input layer.' },
				{ t: 'Calculate Area', d: 'Calculates the area of polygon/area objects on the input layer.' },
			]
		},
		requestData: {
			title: 'Submitting a Data Request',
			desc: 'The Request Data page is used to submit sea boundary data requests via a form available on the website.',
			steps: [
				{ t: 'Open the Request Data page', d: 'Click the Request Data menu on the navigation bar or available buttons.' },
				{ t: 'Read the request procedures', d: 'Note the terms and request information displayed on the page.' },
				{ t: 'Fill in applicant data', d: 'Complete identity, institution, contact, data purpose, and additional information.' },
				{ t: 'Upload supporting documents', d: 'Select documents that meet the specified format and size.' },
				{ t: 'Review entries', d: 'Ensure all data and documents are correct.' },
				{ t: 'Submit the request', d: 'Click Submit Data Request and wait for system confirmation.' },
			],
		},
	},
	cta: {
		title: 'User Guide',
		desc: 'Press the button below to download User Guide PDF.',
		btn: 'Download Full Manual'
	}
};
