import type { CoreLayerId, FieldSchema, LayerGroup, LayerId, LayerSchema } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

// â”€â”€ Titik Dasar â”€â”€
const basepointsFields: FieldSchema[] = [
	{ name: 'TitikDasar', label: 'Titik Dasar', type: 'string', example: 'TD.001' },
	{ name: 'Lintang', label: 'Lintang', type: 'number', example: 1.2408 },
	{ name: 'Bujur', label: 'Bujur', type: 'number', example: 104.5756 },
	{ name: 'Lokasi', label: 'Lokasi', type: 'string', example: 'Tg. Berakit' },
	{ name: 'TitikRefer', label: 'Titik Referensi', type: 'string', example: 'TR.001' },
	{ name: 'JarakTitik', label: 'Jarak Titik (km)', type: 'number', example: 19.19 },
	{ name: 'Nomor_Peta', label: 'Nomor Peta', type: 'string', example: '431' },
	{ name: 'Datum_H', label: 'Datum Horizontal', type: 'string', enum: ["WGS'84", 'WGS-84'] },
	{ name: 'Datum_V', label: 'Datum Vertikal', type: 'string', enum: ['MLWS', 'LAT', 'MSL'] },
	{ name: 'Perairan', label: 'Perairan', type: 'string', example: 'Laut Natuna' },
	{ name: 'Sumber', label: 'Sumber', type: 'string', example: 'PP' },
	{ name: 'Sumber_No', label: 'No. Sumber', type: 'string', example: '38' },
	{ name: 'Sumber_Th', label: 'Tahun Sumber', type: 'number', example: 2002 },
];

// â”€â”€ Garis Pangkal â”€â”€
const baselineFields: FieldSchema[] = [
	{ name: 'ID', label: 'ID Segmen', type: 'string', example: '1' },
	{ name: 'TipeSegmen', label: 'Tipe Segmen', type: 'string', enum: ['Garis Pangkal Lurus Kepulauan', 'Garis Pangkal Biasa'] },
	{ name: 'Datum_H', label: 'Datum Horizontal', type: 'string', enum: ["WGS'84", 'WGS-84'] },
	{ name: 'Datum_V', label: 'Datum Vertikal', type: 'string', enum: ['MLWS', 'LAT', 'MSL'] },
	{ name: 'Panjang', label: 'Panjang (km)', type: 'number', example: 19.173 },
	{ name: 'Panjang_NM', label: 'Panjang (NM)', type: 'string', example: '19.173 mil laut' },
	{ name: 'Perairan', label: 'Perairan', type: 'string', example: 'Laut Natuna' },
	{ name: 'Sumber', label: 'Sumber', type: 'string', example: 'PP' },
	{ name: 'Sumber_No', label: 'No. Sumber', type: 'string', example: '38' },
	{ name: 'Sumber_Th', label: 'Tahun Sumber', type: 'number', example: 2002 },
];

// â”€â”€ Batas Maritim garis — shared for all line-boundary layers â”€â”€
const batasMaritimFields: FieldSchema[] = [
	{ name: 'ID', label: 'ID Segmen', type: 'string', example: '1' },
	{ name: 'Jenis', label: 'Jenis', type: 'string', enum: ['Bilateral', 'Trilateral', 'Unilateral', '-'] },
	{ name: 'TipeZona', label: 'Tipe Zona', type: 'string' },
	{ name: 'Datum', label: 'Datum', type: 'string', enum: ['WGS-84', "WGS'84"] },
	{ name: 'Panjang', label: 'Panjang', type: 'string', example: '317.854 mil laut' },
	{ name: 'Batas_Ngr', label: 'Batas Negara', type: 'string', example: 'Malaysia' },
	{ name: 'StatusLaut', label: 'Status Laut', type: 'string', enum: ['Kesepakatan sudah ratifikasi', 'Kesepakatan belum ratifikasi', 'Perlu Kesepakatan', 'Unilateral'] },
	{ name: 'Jenis_Janj', label: 'Jenis Perjanjian', type: 'string', example: 'Treaty' },
	{ name: 'Janji_Tgl', label: 'Tanggal Perjanjian', type: 'string', example: '12 September 1997' },
	{ name: 'Janji_Thn', label: 'Tahun Perjanjian', type: 'number', example: 1997 },
	{ name: 'Ratif_Jns', label: 'Jenis Ratifikasi', type: 'string', example: 'UU' },
	{ name: 'Ratif_No', label: 'Nomor Ratifikasi', type: 'string', example: 'No. 5' },
	{ name: 'Ratif_Thn', label: 'Tahun Ratifikasi', type: 'number', example: 1999 },
];

// â”€â”€ Landas Kontinen Ekstensi (polygon) â”€â”€
const ekstensiFields: FieldSchema[] = [
	{ name: 'ID', label: 'ID', type: 'string', example: '1' },
	{ name: 'Jenis', label: 'Jenis', type: 'string', enum: ['Unilateral'] },
	{ name: 'TipeZona', label: 'Tipe Zona', type: 'string' },
	{ name: 'Datum', label: 'Datum', type: 'string', enum: ['WGS-84', "WGS'84"] },
	{ name: 'Luas', label: 'Luas (km²)', type: 'number', example: 1181.961 },
	{ name: 'Luas_SNM', label: 'Luas (SNM)', type: 'string', example: '1181.961 mil laut persegi' },
	{ name: 'Batas_Ngr', label: 'Batas Negara', type: 'string', example: '-' },
	{ name: 'StatusLaut', label: 'Status Laut', type: 'string', enum: ['Unilateral'] },
	{ name: 'Jenis_Janj', label: 'Jenis Perjanjian', type: 'string' },
	{ name: 'Janji_Thn', label: 'Tahun Perjanjian', type: 'number' },
	{ name: 'Ratif_Jns', label: 'Jenis Ratifikasi', type: 'string' },
	{ name: 'Ratif_No', label: 'Nomor Ratifikasi', type: 'string' },
	{ name: 'Ratif_Thn', label: 'Tahun Ratifikasi', type: 'number' },
];

// â”€â”€ Titik Perjanjian â”€â”€
const titikPerjanjianFields: FieldSchema[] = [
	{ name: 'Titik', label: 'Kode Titik', type: 'string', example: 'TP-01' },
	{ name: 'Lintang', label: 'Lintang', type: 'number', example: 3.111 },
	{ name: 'Bujur', label: 'Bujur', type: 'number', example: 119.926 },
	{ name: 'Jenis', label: 'Jenis', type: 'string', enum: ['Bilateral', 'Trilateral', 'Unilateral'] },
	{ name: 'TipeZona', label: 'Tipe Zona', type: 'string' },
	{ name: 'Datum', label: 'Datum', type: 'string', enum: ['WGS-84', "WGS'84"] },
	{ name: 'Batas_Ngr', label: 'Batas Negara', type: 'string', example: 'Filipina' },
	{ name: 'StatusLaut', label: 'Status Laut', type: 'string', enum: ['Kesepakatan sudah ratifikasi', 'Kesepakatan belum ratifikasi', 'Perlu Kesepakatan', 'Unilateral'] },
	{ name: 'Jenis_Janj', label: 'Jenis Perjanjian', type: 'string', example: 'Agreement' },
	{ name: 'Janji_Tgl', label: 'Tanggal Perjanjian', type: 'string', example: '23 Mei' },
	{ name: 'Janji_Thn', label: 'Tahun Perjanjian', type: 'number', example: 2014 },
	{ name: 'Ratif_Jns', label: 'Jenis Ratifikasi', type: 'string', example: 'UU' },
	{ name: 'Ratif_No', label: 'Nomor Ratifikasi', type: 'string', example: '4' },
	{ name: 'Ratif_Thn', label: 'Tahun Ratifikasi', type: 'number', example: 2017 },
];

const POPUP_BATAS = ['Jenis', 'TipeZona', 'Datum', 'Panjang', 'Batas_Ngr', 'StatusLaut'];
const POPUP_BATAS_RATIF = [...POPUP_BATAS, 'Janji_Thn', 'Ratif_Thn'];

export const LAYER_SCHEMAS: Record<CoreLayerId, LayerSchema> = {
	basepoints: {
		id: 'basepoints',
		label: 'Titik Dasar',
		geometryType: 'Point',
		primaryKey: 'TitikDasar',
		popupFields: ['TitikDasar', 'Lokasi', 'Datum_H', 'Datum_V', 'Sumber', 'Sumber_Th'],
		fields: basepointsFields,
		defaultVisible: true,
	},
	baseline: {
		id: 'baseline',
		label: 'Garis Pangkal',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: ['ID', 'TipeSegmen', 'Datum_H', 'Datum_V', 'Panjang_NM', 'Sumber'],
		fields: baselineFields,
		defaultVisible: true,
	},
	laut_teritorial_sepakat: {
		id: 'laut_teritorial_sepakat',
		label: 'Laut Teritorial — Sepakat',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS_RATIF,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	laut_teritorial_perlu: {
		id: 'laut_teritorial_perlu',
		label: 'Laut Teritorial — Perlu Kesepakatan',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	zee_sepakat: {
		id: 'zee_sepakat',
		label: 'ZEE — Sepakat',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS_RATIF,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	zee_sepakat_ratif: {
		id: 'zee_sepakat_ratif',
		label: 'ZEE — Sepakat, Perlu Ratifikasi',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: [...POPUP_BATAS, 'Janji_Thn'],
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	zee_perlu: {
		id: 'zee_perlu',
		label: 'ZEE — Perlu Kesepakatan',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	landas_kontinen_sepakat: {
		id: 'landas_kontinen_sepakat',
		label: 'Landas Kontinen — Sepakat',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS_RATIF,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	landas_kontinen_sepakat_ratif: {
		id: 'landas_kontinen_sepakat_ratif',
		label: 'Landas Kontinen — Sepakat, Perlu Ratifikasi',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: [...POPUP_BATAS, 'Janji_Thn'],
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	landas_kontinen_perlu: {
		id: 'landas_kontinen_perlu',
		label: 'Landas Kontinen — Perlu Kesepakatan',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	landas_kontinen_ekstensi: {
		id: 'landas_kontinen_ekstensi',
		label: 'Landas Kontinen Ekstensi',
		geometryType: 'MultiPolygon',
		primaryKey: 'ID',
		popupFields: ['TipeZona', 'Datum', 'Luas', 'Luas_SNM', 'StatusLaut'],
		fields: ekstensiFields,
		defaultVisible: true,
	},
	zona_tambahan: {
		id: 'zona_tambahan',
		label: 'Zona Tambahan',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: POPUP_BATAS,
		fields: batasMaritimFields,
		defaultVisible: true,
	},
	titik_perjanjian_lt: {
		id: 'titik_perjanjian_lt',
		label: 'Titik Perjanjian — Laut Teritorial',
		geometryType: 'Point',
		primaryKey: 'Titik',
		popupFields: ['Titik', 'Batas_Ngr', 'TipeZona', 'StatusLaut', 'Janji_Thn', 'Ratif_Thn'],
		fields: titikPerjanjianFields,
		defaultVisible: false,
	},
	titik_perjanjian_lk: {
		id: 'titik_perjanjian_lk',
		label: 'Titik Perjanjian — Landas Kontinen',
		geometryType: 'Point',
		primaryKey: 'Titik',
		popupFields: ['Titik', 'Batas_Ngr', 'TipeZona', 'StatusLaut', 'Janji_Thn', 'Ratif_Thn'],
		fields: titikPerjanjianFields,
		defaultVisible: false,
	},
	titik_perjanjian_zee: {
		id: 'titik_perjanjian_zee',
		label: 'Titik Perjanjian — ZEE',
		geometryType: 'Point',
		primaryKey: 'Titik',
		popupFields: ['Titik', 'Batas_Ngr', 'TipeZona', 'StatusLaut', 'Janji_Thn', 'Ratif_Thn'],
		fields: titikPerjanjianFields,
		defaultVisible: false,
	},
};

// â”€â”€ Map rendering order (bottom â†’ top) â”€â”€
export const LAYER_DISPLAY_ORDER: CoreLayerId[] = [
	'landas_kontinen_ekstensi',     // polygon fill — paling bawah
	'zona_tambahan',
	'landas_kontinen_perlu',
	'landas_kontinen_sepakat_ratif',
	'landas_kontinen_sepakat',
	'zee_perlu',
	'zee_sepakat_ratif',
	'zee_sepakat',
	'laut_teritorial_perlu',
	'laut_teritorial_sepakat',
	'baseline',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
	'titik_perjanjian_lt',
	'basepoints',
];

// â”€â”€ Sidebar layer groups â”€â”€
export const LAYER_GROUPS: LayerGroup[] = [
	{
		id: 'laut_teritorial',
		label: 'Laut Teritorial',
		color: '#1d4ed8', // same as laut_teritorial_sepakat
		defaultExpanded: true,
		entries: [
			{ layerId: 'laut_teritorial_sepakat', sublabel: 'Sepakat' },
			{ layerId: 'laut_teritorial_perlu', sublabel: 'Perlu Kesepakatan' },
		],
	},
	{
		id: 'zee',
		label: 'ZEE',
		color: '#15803d', // same as zee_sepakat
		defaultExpanded: true,
		entries: [
			{ layerId: 'zee_sepakat', sublabel: 'Sepakat' },
			{ layerId: 'zee_sepakat_ratif', sublabel: 'Sepakat, Perlu Ratifikasi' },
			{ layerId: 'zee_perlu', sublabel: 'Perlu Kesepakatan' },
		],
	},
	{
		id: 'landas_kontinen',
		label: 'Landas Kontinen',
		color: '#92400e', // same as landas_kontinen_sepakat
		defaultExpanded: true,
		entries: [
			{ layerId: 'landas_kontinen_sepakat', sublabel: 'Sepakat' },
			{ layerId: 'landas_kontinen_sepakat_ratif', sublabel: 'Sepakat, Perlu Ratifikasi' },
			{ layerId: 'landas_kontinen_perlu', sublabel: 'Perlu Kesepakatan' },
			{ layerId: 'landas_kontinen_ekstensi', sublabel: 'Ekstensi (Unilateral)' },
		],
	},
	{
		id: 'zona_tambahan',
		label: 'Zona Tambahan',
		color: '#0891b2', // same as zona_tambahan layer
		entries: [{ layerId: 'zona_tambahan', sublabel: 'Zona Tambahan' }],
	},
	{
		id: 'baseline',
		label: 'Garis Pangkal',
		color: '#1e293b', // same as baseline layer
		entries: [{ layerId: 'baseline', sublabel: 'Garis Pangkal' }],
	},
	{
		id: 'titik_perjanjian',
		label: 'Titik Perjanjian',
		color: '#3730a3', // same as titik_perjanjian_lt
		defaultExpanded: false,
		entries: [
			{ layerId: 'titik_perjanjian_lt', sublabel: 'Laut Teritorial' },
			{ layerId: 'titik_perjanjian_lk', sublabel: 'Landas Kontinen' },
			{ layerId: 'titik_perjanjian_zee', sublabel: 'ZEE' },
		],
	},
	{
		id: 'basepoints',
		label: 'Titik Dasar',
		color: '#475569',
		entries: [{ layerId: 'basepoints', sublabel: 'Titik Dasar' }],
	},
];

export const ZONA_COLOR_MAPPING: Record<string, string> = {
	'Batas Laut Teritorial': '#2563eb',
	Teritorial: '#2563eb',
	'Teritorial Laut': '#2563eb',
	'Zona Tambahan': '#0ea5e9',
	'Batas ZEE': '#16a34a',
	ZEE: '#16a34a',
	'Zona Ekonomi Eksklusif': '#16a34a',
	'Batas Landas Kontinen': '#f59e0b',
	'Landas Kontinen': '#f59e0b',
	'Batas Landas Kontinen Ekstensi': '#f97316',
	'Landas Kontinen Ekstensi': '#f97316',
	default: '#64748b',
};

export const STATUS_LAUT_DASH: Record<string, number[] | undefined> = {
	'Kesepakatan belum ratifikasi': [4, 2],
	'Perlu Kesepakatan': [2, 2],
	Unilateral: [1, 1],
};

const EMPTY_USER_SCHEMA: LayerSchema = {
	id: USER_LAYER_ID,
	label: 'Layer Pengguna',
	geometryType: 'Polygon',
	primaryKey: '__fid',
	popupFields: [],
	fields: [],
	description: 'Belum ada GeoJSON pengguna yang dimuat.',
};

let userLayerSchema: LayerSchema | undefined;

export const setUserLayerSchema = (schema: LayerSchema | undefined): void => {
	userLayerSchema = schema;
};

export const getUserLayerSchema = (): LayerSchema | undefined => userLayerSchema;

export const hasUserLayerSchema = (): boolean => Boolean(userLayerSchema);

export const getLayerSchema = (layerId: LayerId): LayerSchema => {
	if (layerId === USER_LAYER_ID) {
		return userLayerSchema ?? EMPTY_USER_SCHEMA;
	}
	return LAYER_SCHEMAS[layerId];
};

export const getFieldSchema = (layerId: LayerId, field: string): FieldSchema | undefined =>
	getLayerSchema(layerId).fields.find((item) => item.name === field);

export const DATE_FIELDS_BY_LAYER: Record<CoreLayerId, string[]> = {
	basepoints: [],
	baseline: [],
	laut_teritorial_sepakat: [],
	laut_teritorial_perlu: [],
	zee_sepakat: [],
	zee_sepakat_ratif: [],
	zee_perlu: [],
	landas_kontinen_sepakat: [],
	landas_kontinen_sepakat_ratif: [],
	landas_kontinen_perlu: [],
	landas_kontinen_ekstensi: [],
	zona_tambahan: [],
	titik_perjanjian_lt: [],
	titik_perjanjian_lk: [],
	titik_perjanjian_zee: [],
};

export const getDateFieldsForLayer = (layerId: LayerId): string[] => {
	if (layerId === USER_LAYER_ID) {
		const schema = getUserLayerSchema();
		if (!schema) {
			return [];
		}
		return schema.fields.filter((field) => field.type === 'date').map((field) => field.name);
	}
	return DATE_FIELDS_BY_LAYER[layerId];
};

