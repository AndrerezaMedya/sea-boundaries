import type { Map as MapLibreMap } from 'maplibre-gl';

export const IHO_BOUNDARY_COLOR = '#7a3f8f';
export const IHO_BOUNDARY_TEXT_COLOR = '#7a3f8f';
export const IHO_FISHERY_ICON_ID = 'iho-fishery-zone';

/** Garis Pangkal (BSL) — distinct from generic IHO boundary purple; matches LAYER_GROUPS / sidebar swatch. */
export const BASELINE_LINE_COLOR = '#eab308';

/** Line markers, labels, and icons — hidden in Easy-Read mode. */
export const isIhoDecorationLayerId = (mapLayerId: string): boolean =>
	mapLayerId.includes('-marker-') ||
	mapLayerId.includes('-label-') ||
	mapLayerId.includes('-icon-');

// ── Easy-Read symbology constants ─────────────────────────────────────────────

export type EasyReadLineLayerId =
	| 'baseline'
	| 'territorial_sea'
	| 'contiguous_zone'
	| 'eez_limit'
	| 'continental_shelf'
	| 'landas_kontinen_ekstensi'
	| 'fisheries';

export const EASY_READ_LINE_LAYER_IDS: EasyReadLineLayerId[] = [
	'baseline',
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'landas_kontinen_ekstensi',
	'fisheries',
];

export const EASY_READ_COLORS: Record<EasyReadLineLayerId, string> = {
	baseline: '#eab308', // Yellow
	territorial_sea: '#ef4444', // Red
	contiguous_zone: '#a855f7', // Purple
	eez_limit: '#22c55e', // Green
	continental_shelf: '#f97316', // Orange
	landas_kontinen_ekstensi: '#ec4899', // Pink
	fisheries: '#f472b6', // Soft Pink
};

export const EASY_READ_WIDTH: Record<EasyReadLineLayerId, number> = {
	baseline: 2.5,
	territorial_sea: 2.5,
	contiguous_zone: 2.5,
	eez_limit: 2.8,
	continental_shelf: 2.5,
	landas_kontinen_ekstensi: 2.8,
	fisheries: 2.5,
};

/** Point layers shown in the map legend (circle symbology). */
export type PointLegendLayerId =
	| 'basepoints'
	| 'basepoints_2026'
	| 'user_layer'
	| 'titik_referensi'
	| 'titik_perjanjian_lt'
	| 'titik_perjanjian_lk'
	| 'titik_perjanjian_zee';

export const POINT_LEGEND_LAYER_IDS: PointLegendLayerId[] = [
	'basepoints',
	'basepoints_2026',
	'user_layer',
	'titik_referensi',
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
];

/** Base circle colors — match `layerConfigs.ts` paint.base. */
export const POINT_LEGEND_COLORS: Record<PointLegendLayerId, string> = {
	basepoints: '#475569',
	basepoints_2026: '#0ea5e9',
	user_layer: '#14b8a6',
	titik_referensi: '#dc2626',
	titik_perjanjian_lt: '#3730a3',
	titik_perjanjian_lk: '#78350f',
	titik_perjanjian_zee: '#0d9488',
};

const createFisheryIconImage = (): ImageData => {
	const size = 64;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas 2D context is not available for IHO fishery icon.');
	}

	context.clearRect(0, 0, size, size);
	context.strokeStyle = IHO_BOUNDARY_COLOR;
	context.fillStyle = 'rgba(255, 255, 255, 0.78)';
	context.lineWidth = 3.2;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	context.beginPath();
	context.ellipse(35, 32, 17, 8, 0, 0, Math.PI * 2);
	context.fill();
	context.stroke();

	context.beginPath();
	context.moveTo(18, 32);
	context.lineTo(7, 24);
	context.moveTo(18, 32);
	context.lineTo(7, 40);
	context.stroke();

	context.beginPath();
	context.moveTo(18, 32);
	context.lineTo(7, 32);
	context.stroke();

	context.beginPath();
	context.arc(43.5, 30, 1.7, 0, Math.PI * 2);
	context.fillStyle = IHO_BOUNDARY_COLOR;
	context.fill();

	return context.getImageData(0, 0, size, size);
};

export const registerIhoSymbolImages = (map: MapLibreMap) => {
	if (map.hasImage(IHO_FISHERY_ICON_ID)) {
		map.removeImage(IHO_FISHERY_ICON_ID);
	}

	map.addImage(IHO_FISHERY_ICON_ID, createFisheryIconImage(), { pixelRatio: 2 });
};
