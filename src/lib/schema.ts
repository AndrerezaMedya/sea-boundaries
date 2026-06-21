import type { CoreLayerId, FieldSchema, LayerGroup, LayerId, LayerSchema } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

// ── Real Layer Fields (ISO/IHO S-121 schema) ──────────────────────────────────
const realLayerFields: FieldSchema[] = [
	{ name: 'said', label: 'Segment ID', type: 'string', example: 'CURVE_EEZ_01', description: 'ID segmen/arc individu' },
	{ name: 'fuid', label: 'Feature Unit ID', type: 'string', example: 'LIM_EEZ_01', description: 'ID unit fitur batas maritim' },
	{ name: 'label', label: 'Label', type: 'string', example: 'Outer Limit of Exclusive Economic Zone' },
	{
		name: 'status',
		label: 'Status',
		type: 'string',
		enum: [
			'Agreement',
			'Agreement Not Ratified',
			'Agreement Not Ratified Yet',
			'Not Ratified Yet',
			'Need Agreement',
			'Unilateral',
			'Unilateral Proposed',
			'Terminated',
		],
	},
	{
		name: 'limit_object_type',
		label: 'Tipe Batas',
		type: 'string',
		enum: [
			'Outer Limit of Territorial Sea',
			'Outer Limit of Exclusive Economic Zone',
			'Outer Limit of Continental Shelf',
			'Outer Limit of Contiguous Zone',
			'International Boundary',
			'Normal Baseline (Garis Pangkal Normal)',
			'Straight Baseline (Garis Pangkal Lurus)',
			'Archipelagic Baseline (Garis Pangkal Kepulauan)',
		],
	},
	{ name: 'start_life_span', label: 'Start Life Span', type: 'date' },
	{ name: 'end_life_span', label: 'End Life Span', type: 'date' },
	{ name: 'releasibility_type', label: 'Releasibility', type: 'string' },
	{ name: 'horizontal_datum', label: 'Datum', type: 'string' },
	{ name: 'source_ids', label: 'Sumber (ID)', type: 'string' },
];

const realLocationFields: FieldSchema[] = [
	{ name: 'said', label: 'Point ID', type: 'string', example: 'P_CS_0001' },
	{ name: 'fuid', label: 'Feature Unit ID', type: 'string', example: 'LOC_CS_0001' },
	{ name: 'label', label: 'Label', type: 'string', example: 'Boundary Point' },
	{
		name: 'location_type_list',
		label: 'Tipe Titik',
		type: 'string',
		enum: ['Boundary Point', 'Baseline Point', 'Limit Point'],
	},
	{ name: 'start_life_span', label: 'Start Life Span', type: 'date' },
	{ name: 'end_life_span', label: 'End Life Span', type: 'date' },
	{ name: 'status', label: 'Status', type: 'string' },
	{ name: 'point_location', label: 'Lokasi Perairan', type: 'string' },
	{ name: 'horizontal_datum', label: 'Datum', type: 'string' },
	{ name: 'source_ids', label: 'Sumber (ID)', type: 'string' },
];

const POPUP_REAL_LAYER = ['label', 'status', 'limit_object_type', 'horizontal_datum'];
const POPUP_REAL_LOCATION = ['label', 'status', 'location_type_list', 'point_location', 'horizontal_datum'];

export const LAYER_SCHEMAS: Record<CoreLayerId, LayerSchema> = {
	// ── Dipertahankan ────────────────────────────────────────────────────────
	basepoints: {
		id: 'basepoints',
		label: 'Titik Dasar',
		geometryType: 'Point',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LOCATION,
		fields: realLocationFields,
		defaultVisible: true,
		description: 'Titik-titik dasar garis pangkal kepulauan Indonesia',
	},
	basepoints_2026: {
		id: 'basepoints_2026',
		label: 'Titik Dasar 2026',
		geometryType: 'Point',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LOCATION,
		fields: realLocationFields,
		defaultVisible: false,
		description: 'Titik-titik dasar garis pangkal kepulauan Indonesia (PP 14 2026)',
	},
	titik_referensi: {
		id: 'titik_referensi',
		label: 'Titik Referensi',
		geometryType: 'Point',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LOCATION,
		fields: realLocationFields,
		defaultVisible: false,
		description: 'Reference Point of Determination Baseline Point',
	},
	landas_kontinen_ekstensi: {
		id: 'landas_kontinen_ekstensi',
		label: 'Landas Kontinen Ekstensi',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Batas luar landas kontinen ekstensi (>200 NM) — LIM_ECS_01 / CURVE_ECS_01',
	},
	titik_perjanjian_lt: {
		id: 'titik_perjanjian_lt',
		label: 'Titik Perjanjian — Laut Teritorial',
		geometryType: 'Point',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LOCATION,
		fields: realLocationFields,
		defaultVisible: false,
	},
	titik_perjanjian_lk: {
		id: 'titik_perjanjian_lk',
		label: 'Titik Perjanjian — Landas Kontinen',
		geometryType: 'Point',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LOCATION,
		fields: realLocationFields,
		defaultVisible: false,
	},
	titik_perjanjian_zee: {
		id: 'titik_perjanjian_zee',
		label: 'Titik Perjanjian — ZEE',
		geometryType: 'Point',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LOCATION,
		fields: realLocationFields,
		defaultVisible: false,
	},

	// ── Layer Real Baru (ISO/IHO S-121) ──────────────────────────────────────
	territorial_sea: {
		id: 'territorial_sea',
		label: 'Laut Teritorial',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Batas laut teritorial 12 NM Indonesia sesuai UNCLOS 1982',
	},
	contiguous_zone: {
		id: 'contiguous_zone',
		label: 'Zona Tambahan',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Zona tambahan 24 NM (contiguous zone) Indonesia',
	},
	eez_limit: {
		id: 'eez_limit',
		label: 'Zona Ekonomi Eksklusif',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Batas Zona Ekonomi Eksklusif (ZEE) 200 NM Indonesia',
	},
	continental_shelf: {
		id: 'continental_shelf',
		label: 'Landas Kontinen',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Batas landas kontinen Indonesia (bilateral & unilateral)',
	},
	fisheries: {
		id: 'fisheries',
		label: 'Zona Perikanan',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Zona perikanan berdasarkan MOU RI-Australia 1981',
	},
	baseline: {
		id: 'baseline',
		label: 'Garis Pangkal',
		geometryType: 'MultiLineString',
		primaryKey: 'fuid',
		popupFields: POPUP_REAL_LAYER,
		fields: realLayerFields,
		defaultVisible: true,
		description: 'Garis Pangkal Kepulauan, Lurus, dan Biasa',
	},
};

// ── Map rendering order (bottom → top) ────────────────────────────────────────
export const LAYER_DISPLAY_ORDER: CoreLayerId[] = [
	'landas_kontinen_ekstensi',   // ECS outer limit line — paling bawah
	'continental_shelf',
	'eez_limit',
	'contiguous_zone',
	'fisheries',
	'territorial_sea',
	'baseline',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
	'titik_perjanjian_lt',
	'titik_referensi',
	'basepoints',
	'basepoints_2026',
];

// ── Sidebar layer groups ───────────────────────────────────────────────────────
export const LAYER_GROUPS: LayerGroup[] = [
	{
		id: 'baseline',
		label: 'Garis Pangkal',
		color: '#eab308',
		defaultExpanded: true,
		entries: [{ layerId: 'baseline', sublabel: 'Garis Pangkal (BSL)' }],
	},
	{
		id: 'territorial_sea',
		label: 'Laut Teritorial',
		color: '#1d4ed8',
		defaultExpanded: true,
		entries: [{ layerId: 'territorial_sea', sublabel: 'Laut Teritorial' }],
	},
	{
		id: 'contiguous_zone',
		label: 'Zona Tambahan',
		color: '#0891b2',
		defaultExpanded: true,
		entries: [{ layerId: 'contiguous_zone', sublabel: 'Zona Tambahan' }],
	},
	{
		id: 'eez_limit',
		label: 'Zona Ekonomi Eksklusif',
		color: '#15803d',
		defaultExpanded: true,
		entries: [{ layerId: 'eez_limit', sublabel: 'ZEE' }],
	},
	{
		id: 'continental_shelf',
		label: 'Landas Kontinen',
		color: '#92400e',
		defaultExpanded: true,
		entries: [
			{ layerId: 'continental_shelf', sublabel: 'Batas Landas Kontinen' },
			{ layerId: 'landas_kontinen_ekstensi', sublabel: 'Ekstensi' },
		],
	},
	{
		id: 'fisheries',
		label: 'Zona Perikanan',
		color: '#7c3aed',
		defaultExpanded: false,
		entries: [{ layerId: 'fisheries', sublabel: 'Zona Perikanan MOU 1981' }],
	},
	{
		id: 'titik_perjanjian',
		label: 'Titik Perjanjian',
		color: '#3730a3',
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
		entries: [
			{ layerId: 'basepoints', sublabel: 'Edisi 2002/2008' },
			{ layerId: 'basepoints_2026', sublabel: 'Edisi PP 14 2026' }
		],
	},
	{
		id: 'titik_referensi',
		label: 'Titik Referensi',
		color: '#dc2626',
		defaultExpanded: false,
		entries: [{ layerId: 'titik_referensi', sublabel: 'Reference Point' }],
	},
];

export const ZONA_COLOR_MAPPING: Record<string, string> = {
	'Outer Limit of Territorial Sea': '#2563eb',
	'Outer Limit of Contiguous Zone': '#0891b2',
	'Outer Limit of Exclusive Economic Zone': '#16a34a',
	'Outer Limit of Continental Shelf': '#f59e0b',
	'Landas Kontinen Ekstensi': '#f97316',
	'Zona Perikanan': '#7c3aed',
	'International Boundary': '#e11d48',
	'Normal Baseline (Garis Pangkal Normal)': '#475569',
	'Straight Baseline (Garis Pangkal Lurus)': '#475569',
	'Archipelagic Baseline (Garis Pangkal Kepulauan)': '#475569',
	default: '#64748b',
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
export const setUserLayerSchema = (schema: LayerSchema | undefined): void => { userLayerSchema = schema; };
export const getUserLayerSchema = (): LayerSchema | undefined => userLayerSchema;
export const hasUserLayerSchema = (): boolean => Boolean(userLayerSchema);

export const getLayerSchema = (layerId: LayerId): LayerSchema => {
	if (layerId === USER_LAYER_ID) return userLayerSchema ?? EMPTY_USER_SCHEMA;
	return LAYER_SCHEMAS[layerId];
};

export const getFieldSchema = (layerId: LayerId, field: string) =>
	getLayerSchema(layerId).fields.find((item) => item.name.toLowerCase() === field.toLowerCase());

export const DATE_FIELDS_BY_LAYER: Record<CoreLayerId, string[]> = {
	basepoints: [],
	basepoints_2026: [],
	titik_referensi: [],
	landas_kontinen_ekstensi: [],
	titik_perjanjian_lt: [],
	titik_perjanjian_lk: [],
	titik_perjanjian_zee: [],
	territorial_sea: [],
	contiguous_zone: [],
	eez_limit: [],
	continental_shelf: [],
	fisheries: [],
	baseline: [],
};

export const getDateFieldsForLayer = (layerId: LayerId): string[] => {
	if (layerId === USER_LAYER_ID) {
		const schema = getUserLayerSchema();
		if (!schema) return [];
		return schema.fields.filter((f) => f.type === 'date').map((f) => f.name);
	}
	return DATE_FIELDS_BY_LAYER[layerId];
};
