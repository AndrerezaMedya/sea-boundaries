import type { CoreLayerId, FieldSchema, LayerId, LayerSchema } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

const basepointsFields: FieldSchema[] = [
	{ name: 'TitikDasar', label: 'Titik Dasar', type: 'string', example: 'TD-001' },
	{ name: 'Lintang', label: 'Lintang', type: 'number', example: -5.5678 },
	{ name: 'Bujur', label: 'Bujur', type: 'number', example: 106.7891 },
	{ name: 'Lokasi', label: 'Lokasi', type: 'string', example: 'Pulau Seribu' },
	{ name: 'TitikRefer', label: 'Titik Referensi', type: 'string', example: 'Pulau Pari' },
	{ name: 'JarakTitik', label: 'Jarak Titik (km)', type: 'number', example: 12.4 },
	{ name: 'Chart_Numb', label: 'Chart Number', type: 'string', example: 'INT 1234' },
	{ name: 'Datum_H', label: 'Datum Horizontal', type: 'string', enum: ['WGS84'], example: 'WGS84' },
	{ name: 'Datum_V', label: 'Datum Vertikal', type: 'string', enum: ['MSL', 'LAT'], example: 'MSL' },
	{ name: 'Laut', label: 'Laut', type: 'string', example: 'Jawa' },
	{ name: 'Sumber', label: 'Sumber', type: 'string', example: 'BIG' },
	{ name: 'Sumber_No', label: 'No. Sumber', type: 'string', example: 'SK-01' },
	{ name: 'Sumber_Th', label: 'Tahun Sumber', type: 'number', example: 2019 },
];

const baselineFields: FieldSchema[] = [
	{ name: 'ID', label: 'ID Segmen', type: 'string', example: 'BL-01' },
	{ name: 'TipeSegmen', label: 'Tipe Segmen', type: 'string', enum: ['Garis lurus', 'Garis lengkung'] },
	{ name: 'Datum_H', label: 'Datum Horizontal', type: 'string', enum: ['WGS84'] },
	{ name: 'Datum_V', label: 'Datum Vertikal', type: 'string', enum: ['MSL', 'LAT'] },
	{ name: 'Panjang', label: 'Panjang (km)', type: 'number', example: 24.6 },
	{ name: 'Panjang_NM', label: 'Panjang (NM)', type: 'number', example: 13.3 },
	{ name: 'Laut', label: 'Laut', type: 'string', example: 'Jawa' },
	{ name: 'Sumber', label: 'Sumber', type: 'string', example: 'BIG' },
	{ name: 'Sumber_No', label: 'No. Sumber', type: 'string', example: 'SK-11' },
	{ name: 'Sumber_Th', label: 'Tahun Sumber', type: 'number', example: 2018 },
];

const titikPerjanjianFields: FieldSchema[] = [
	{ name: 'Titik', label: 'Kode Titik', type: 'string', example: 'TP-01' },
	{ name: 'Lintang', label: 'Lintang', type: 'number', example: -10.123 },
	{ name: 'Bujur', label: 'Bujur', type: 'number', example: 123.456 },
	{ name: 'Jenis', label: 'Jenis', type: 'string', example: 'Koordinat' },
	{ name: 'TipeZona', label: 'Tipe Zona', type: 'string' },
	{ name: 'Datum', label: 'Datum', type: 'string', enum: ['WGS84'] },
	{ name: 'Batas_Ngr', label: 'Batas Negara', type: 'string', example: 'Australia' },
	{ name: 'StatusLaut', label: 'Status Laut', type: 'string', enum: ['Perlu Kesepakatan', 'Disepakati', 'Unilateral'] },
	{ name: 'Jenis_Janj', label: 'Jenis Perjanjian', type: 'string', example: 'Perjanjian bilateral' },
	{ name: 'Janji_Tgl', label: 'Tanggal Perjanjian', type: 'date', example: '1997-09-12', expressionField: 'Janji_Tgl__ts' },
	{ name: 'Janji_Thn', label: 'Tahun Perjanjian', type: 'number', example: 1997 },
	{ name: 'Ratif_Jns', label: 'Jenis Ratifikasi', type: 'string', example: 'UU' },
	{ name: 'Ratif_No', label: 'Nomor Ratifikasi', type: 'string', example: 'No. 5' },
	{ name: 'Ratif_Thn', label: 'Tahun Ratifikasi', type: 'number', example: 1999 },
];

const batasMaritimFields: FieldSchema[] = [
	{ name: 'ID', label: 'ID Segmen', type: 'string', example: 'BM-01' },
	{ name: 'Jenis', label: 'Jenis', type: 'string', example: 'Perjanjian' },
	{ name: 'TipeZona', label: 'Tipe Zona', type: 'string' },
	{ name: 'Datum', label: 'Datum', type: 'string', enum: ['WGS84'] },
	{ name: 'Panjang', label: 'Panjang (km)', type: 'number', example: 145.2 },
	{ name: 'Panjang_NM', label: 'Panjang (NM)', type: 'number', example: 78.4 },
	{ name: 'Batas_Ngr', label: 'Batas Negara', type: 'string', example: 'Australia' },
	{ name: 'StatusLaut', label: 'Status Laut', type: 'string', enum: ['Perlu Kesepakatan', 'Disepakati', 'Unilateral'] },
	{ name: 'Jenis_Janj', label: 'Jenis Perjanjian', type: 'string', example: 'Treaty' },
	{ name: 'Janji_Tgl', label: 'Tanggal Perjanjian', type: 'date', example: '1997-09-12', expressionField: 'Janji_Tgl__ts' },
	{ name: 'Janji_Thn', label: 'Tahun Perjanjian', type: 'number', example: 1997 },
	{ name: 'Ratif_Jns', label: 'Jenis Ratifikasi', type: 'string', example: 'UU' },
	{ name: 'Ratif_No', label: 'Nomor Ratifikasi', type: 'string', example: 'No. 5' },
	{ name: 'Ratif_Thn', label: 'Tahun Ratifikasi', type: 'number', example: 1999 },
];

export const LAYER_SCHEMAS: Record<CoreLayerId, LayerSchema> = {
	basepoints: {
		id: 'basepoints',
		label: 'Basepoints',
		geometryType: 'Point',
		primaryKey: 'TitikDasar',
		popupFields: ['TitikDasar', 'Lokasi', 'Datum_H', 'Datum_V', 'Sumber', 'Sumber_Th'],
		fields: basepointsFields,
		description: 'Titik dasar pantai Indonesia sebagai referensi garis pangkal.',
	},
	baseline: {
		id: 'baseline',
		label: 'Baseline',
		geometryType: 'LineString',
		primaryKey: 'ID',
		popupFields: ['ID', 'TipeSegmen', 'Datum_H', 'Datum_V', 'Panjang', 'Sumber'],
		fields: baselineFields,
		description: 'Garis pangkal resmi untuk perhitungan batas maritim.',
	},
	titik_perjanjian: {
		id: 'titik_perjanjian',
		label: 'Titik Perjanjian',
		geometryType: 'Point',
		primaryKey: 'Titik',
		popupFields: ['Titik', 'Batas_Ngr', 'TipeZona', 'StatusLaut', 'Janji_Tgl', 'Ratif_Thn'],
		fields: titikPerjanjianFields,
		description: 'Koordinat titik yang disepakati dalam perjanjian batas laut.',
	},
	batas_maritim: {
		id: 'batas_maritim',
		label: 'Batas Maritim',
		geometryType: 'MultiLineString',
		primaryKey: 'ID',
		popupFields: ['Jenis', 'TipeZona', 'Datum', 'Panjang_NM', 'Batas_Ngr'],
		fields: batasMaritimFields,
		description: 'Garis batas maritim antar negara beserta metadata hukumnya.',
	},
};

export const LAYER_DISPLAY_ORDER: CoreLayerId[] = ['batas_maritim', 'baseline', 'titik_perjanjian', 'basepoints'];

export const ZONA_COLOR_MAPPING: Record<string, string> = {
	Teritorial: '#2563eb',
	'Teritorial Laut': '#2563eb',
	'Zona Tambahan': '#0ea5e9',
	ZEE: '#16a34a',
	'Landas Kontinen': '#f59e0b',
	'Landas Kontinen Ekstensi': '#f97316',
	default: '#64748b',
};

export const STATUS_LAUT_DASH: Record<string, number[] | undefined> = {
	'Perlu Kesepakatan': [2, 1],
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
	titik_perjanjian: ['Janji_Tgl'],
	batas_maritim: ['Janji_Tgl'],
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
