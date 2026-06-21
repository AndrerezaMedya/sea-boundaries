import { isMvtDisplayMode, MVT_TILESETS } from '@/lib/mapDisplay';
import { LAYER_DISPLAY_ORDER } from '@/lib/schema';
import { dashForStatusTier, type StatusSymbologyTier } from '@/lib/statusSymbology';
import type { LayerId, MapRenderKind } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { IHO_BOUNDARY_COLOR, IHO_BOUNDARY_TEXT_COLOR, IHO_FISHERY_ICON_ID } from '@/components/map/ihoSymbology';

type MapGeometryType = 'line' | 'circle' | 'fill' | 'symbol';

interface LayerPaintConfig {
	base: Record<string, unknown>;
	filtered: Record<string, unknown>;
	selection: Record<string, unknown>;
	hover: Record<string, unknown>;
}

export interface MapLayerConfig {
	renderKind: MapRenderKind;
	sourceId: string;
	baseLayerId: string;
	filteredLayerId: string;
	selectionLayerId: string;
	hoverLayerId: string;
	type: MapGeometryType;
	layout?: Record<string, unknown>;
	paint: LayerPaintConfig;
	minzoom?: number;
	maxzoom?: number;
	filter?: any;
	/** Partition line features by maritime status (solid / long dash / short dash). */
	statusTier?: StatusSymbologyTier;
	/** IHO-only decoration (+, labels, fishery icon) — hidden in Easy-Read. */
	ihoOnly?: boolean;
}

export const ALL_LAYER_IDS: LayerId[] = [...LAYER_DISPLAY_ORDER, USER_LAYER_ID];

const ihoBaseLinePaint = {
	'line-color': IHO_BOUNDARY_COLOR,
	'line-width': 2,
	'line-opacity': 0.9,
};

const ihoFilteredLinePaint = {
	'line-color': IHO_BOUNDARY_COLOR,
	'line-width': 3,
	'line-opacity': 1,
};

const ihoSelectionLinePaint = { 'line-color': '#f97316', 'line-width': 5.2, 'line-opacity': 0.97 };
const ihoHoverLinePaint = { 'line-color': '#eab308', 'line-width': 4.5, 'line-opacity': 0.97 };

const STATUS_LINE_LAYOUT = { 'line-cap': 'butt', 'line-join': 'round' };

/**
 * MapLibre 5: `zoom` must be top-level inside `interpolate` only (not inside `max`).
 * Stops enforce a minimum ~4px radius at country scale.
 */
const circleRadiusByZoom = (pixelsAtZ8: number): unknown => {
	const min = (v: number) => Math.max(4, v);
	return [
		'interpolate',
		['linear'],
		['zoom'],
		3,
		min(pixelsAtZ8 * 0.85),
		6,
		min(pixelsAtZ8),
		10,
		min(pixelsAtZ8 * 1.15),
		14,
		min(pixelsAtZ8 * 1.35),
	];
};

const ihoBoundaryLinePaint = (tier: StatusSymbologyTier): LayerPaintConfig => {
	const dash = dashForStatusTier(tier);
	const dashPaint = dash ? { 'line-dasharray': dash } : {};
	return {
		base: { ...ihoBaseLinePaint, ...dashPaint },
		filtered: { ...ihoFilteredLinePaint, ...dashPaint },
		selection: ihoSelectionLinePaint,
		hover: ihoHoverLinePaint,
	};
};

/** Three map layers per boundary source — reliable status dash (no data-driven dasharray). */
const createStatusTierLineStack = (layerSlug: string, sourceId: string): MapLayerConfig[] =>
	(['solid', 'long', 'short'] as const).map((tier) => ({
		renderKind: 'line',
		sourceId,
		baseLayerId: `layer-${layerSlug}-${tier}-base`,
		filteredLayerId: `layer-${layerSlug}-${tier}-filtered`,
		selectionLayerId: `layer-${layerSlug}-${tier}-selected`,
		hoverLayerId: `layer-${layerSlug}-${tier}-hover`,
		type: 'line',
		layout: STATUS_LINE_LAYOUT,
		statusTier: tier,
		paint: ihoBoundaryLinePaint(tier),
	}));

const ihoTextPaint = {
	'text-color': IHO_BOUNDARY_TEXT_COLOR,
	'text-halo-color': 'rgba(255, 255, 255, 0.86)',
	'text-halo-width': 1.4,
	'text-opacity': 0.92,
};

const ihoSymbolPaint = {
	base: ihoTextPaint,
	filtered: { ...ihoTextPaint, 'text-opacity': 1 },
	selection: { ...ihoTextPaint, 'text-color': '#f97316', 'text-opacity': 1 },
	hover: { ...ihoTextPaint, 'text-color': '#eab308', 'text-opacity': 1 },
};

const ihoLabelLayout = (text: string, textOffset: [number, number] = [0, 0]) => ({
	'symbol-placement': 'line',
	'symbol-spacing': 320,
	'text-field': text,
	'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
	'text-size': 13,
	'text-line-height': 1.05,
	'text-offset': textOffset,
	'text-keep-upright': true,
	'text-rotation-alignment': 'map',
	'text-allow-overlap': true,
	'text-ignore-placement': true,
});

const ihoMarkerLayout = (text: string, spacing = 160) => ({
	'symbol-placement': 'line',
	'symbol-spacing': spacing,
	'text-field': text,
	'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
	'text-size': 18,
	'text-keep-upright': true,
	'text-rotation-alignment': 'map',
	'text-allow-overlap': false,
	'text-ignore-placement': false,
});

const ihoFisheryLayout = {
	'symbol-placement': 'line',
	'symbol-spacing': 210,
	'icon-image': IHO_FISHERY_ICON_ID,
	'icon-size': 1.05,
	'icon-rotation-alignment': 'map',
	'icon-keep-upright': true,
	'icon-allow-overlap': false,
	'icon-ignore-placement': false,
};

const ihoIconPaint = {
	'icon-opacity': 0.92,
};

const ihoIconLayerPaint = {
	base: ihoIconPaint,
	filtered: { 'icon-opacity': 1 },
	selection: { 'icon-opacity': 1 },
	hover: { 'icon-opacity': 1 },
};

export const mapLayerConfigs: Record<LayerId, MapLayerConfig[]> = {
	// ── Layer Real Baru ───────────────────────────────────────────────────────
	baseline: createStatusTierLineStack('baseline', 'source-baseline'),

	territorial_sea: [
		...createStatusTierLineStack('territorial-sea', 'source-territorial-sea'),
		{
			renderKind: 'line',
			sourceId: 'source-territorial-sea',
			baseLayerId: 'layer-territorial-sea-marker-base',
			filteredLayerId: 'layer-territorial-sea-marker-filtered',
			selectionLayerId: 'layer-territorial-sea-marker-selected',
			hoverLayerId: 'layer-territorial-sea-marker-hover',
			type: 'symbol',
			layout: ihoMarkerLayout('+  +', 210),
			paint: ihoSymbolPaint,
			minzoom: 4,
			ihoOnly: true,
		},
	],

	contiguous_zone: [
		...createStatusTierLineStack('contiguous-zone', 'source-contiguous-zone'),
		{
			renderKind: 'line',
			sourceId: 'source-contiguous-zone',
			baseLayerId: 'layer-contiguous-zone-marker-base',
			filteredLayerId: 'layer-contiguous-zone-marker-filtered',
			selectionLayerId: 'layer-contiguous-zone-marker-selected',
			hoverLayerId: 'layer-contiguous-zone-marker-hover',
			type: 'symbol',
			layout: ihoMarkerLayout('+', 170),
			paint: ihoSymbolPaint,
			minzoom: 4,
			ihoOnly: true,
		},
	],

	eez_limit: [
		...createStatusTierLineStack('eez-limit', 'source-eez-limit'),
		{
			renderKind: 'line',
			sourceId: 'source-eez-limit',
			baseLayerId: 'layer-eez-limit-label-base',
			filteredLayerId: 'layer-eez-limit-label-filtered',
			selectionLayerId: 'layer-eez-limit-label-selected',
			hoverLayerId: 'layer-eez-limit-label-hover',
			type: 'symbol',
			layout: ihoLabelLayout('EEZ', [0, 1.1]),
			paint: ihoSymbolPaint,
			minzoom: 3.5,
			ihoOnly: true,
		},
	],

	continental_shelf: [
		...createStatusTierLineStack('continental-shelf', 'source-continental-shelf'),
		{
			renderKind: 'line',
			sourceId: 'source-continental-shelf',
			baseLayerId: 'layer-continental-shelf-label-base',
			filteredLayerId: 'layer-continental-shelf-label-filtered',
			selectionLayerId: 'layer-continental-shelf-label-selected',
			hoverLayerId: 'layer-continental-shelf-label-hover',
			type: 'symbol',
			layout: ihoLabelLayout('Continental Shelf', [0, -1.1]),
			paint: ihoSymbolPaint,
			minzoom: 3.5,
			ihoOnly: true,
		},
	],

	fisheries: [
		...createStatusTierLineStack('fisheries', 'source-fisheries'),
		{
			renderKind: 'line',
			sourceId: 'source-fisheries',
			baseLayerId: 'layer-fisheries-icon-base',
			filteredLayerId: 'layer-fisheries-icon-filtered',
			selectionLayerId: 'layer-fisheries-icon-selected',
			hoverLayerId: 'layer-fisheries-icon-hover',
			type: 'symbol',
			layout: ihoFisheryLayout,
			paint: ihoIconLayerPaint,
			minzoom: 4,
			ihoOnly: true,
		},
	],

	// ── Layer Dipertahankan ───────────────────────────────────────────────────

	landas_kontinen_ekstensi: [
		...createStatusTierLineStack('lk-ekstensi', 'source-lk-ekstensi'),
		{
			renderKind: 'line',
			sourceId: 'source-lk-ekstensi',
			baseLayerId: 'layer-lk-ekstensi-label-base',
			filteredLayerId: 'layer-lk-ekstensi-label-filtered',
			selectionLayerId: 'layer-lk-ekstensi-label-selected',
			hoverLayerId: 'layer-lk-ekstensi-label-hover',
			type: 'symbol',
			layout: ihoLabelLayout('ECS', [0, 1.4]),
			paint: ihoSymbolPaint,
			minzoom: 3.5,
			ihoOnly: true,
		},
	],

	titik_perjanjian_lt: [
		{
			renderKind: 'circle',
			sourceId: 'source-tp-lt',
			baseLayerId: 'layer-tp-lt-base',
			filteredLayerId: 'layer-tp-lt-filtered',
			selectionLayerId: 'layer-tp-lt-selected',
			hoverLayerId: 'layer-tp-lt-hover',
			type: 'circle',
			paint: {
				base: { 'circle-radius': circleRadiusByZoom(5), 'circle-color': '#3730a3', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': circleRadiusByZoom(6.2), 'circle-color': '#3730a3', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': circleRadiusByZoom(7.4), 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': circleRadiusByZoom(6.8), 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
	],

	titik_referensi: [
		{
			renderKind: 'circle',
			sourceId: 'source-titik-referensi',
			baseLayerId: 'layer-titik-referensi-base',
			filteredLayerId: 'layer-titik-referensi-filtered',
			selectionLayerId: 'layer-titik-referensi-selected',
			hoverLayerId: 'layer-titik-referensi-hover',
			type: 'circle',
			paint: {
				base: { 'circle-radius': circleRadiusByZoom(5), 'circle-color': '#dc2626', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': circleRadiusByZoom(6.2), 'circle-color': '#dc2626', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': circleRadiusByZoom(7.4), 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': circleRadiusByZoom(6.8), 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
	],

	titik_perjanjian_lk: [
		{
			renderKind: 'circle',
			sourceId: 'source-tp-lk',
			baseLayerId: 'layer-tp-lk-base',
			filteredLayerId: 'layer-tp-lk-filtered',
			selectionLayerId: 'layer-tp-lk-selected',
			hoverLayerId: 'layer-tp-lk-hover',
			type: 'circle',
			paint: {
				base: { 'circle-radius': circleRadiusByZoom(5), 'circle-color': '#78350f', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': circleRadiusByZoom(6.2), 'circle-color': '#78350f', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': circleRadiusByZoom(7.4), 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': circleRadiusByZoom(6.8), 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
	],

	titik_perjanjian_zee: [
		{
			renderKind: 'circle',
			sourceId: 'source-tp-zee',
			baseLayerId: 'layer-tp-zee-base',
			filteredLayerId: 'layer-tp-zee-filtered',
			selectionLayerId: 'layer-tp-zee-selected',
			hoverLayerId: 'layer-tp-zee-hover',
			type: 'circle',
			paint: {
				base: { 'circle-radius': circleRadiusByZoom(5), 'circle-color': '#0d9488', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': circleRadiusByZoom(6.2), 'circle-color': '#0d9488', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': circleRadiusByZoom(7.4), 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': circleRadiusByZoom(6.8), 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
	],

	basepoints: [
		{
			renderKind: 'circle',
			sourceId: 'source-basepoints',
			baseLayerId: 'layer-basepoints-base',
			filteredLayerId: 'layer-basepoints-filtered',
			selectionLayerId: 'layer-basepoints-selected',
			hoverLayerId: 'layer-basepoints-hover',
			filter: [
				'any',
				['!=', ['index-of', '_2002', ['get', 'fuid']], -1],
				['!=', ['index-of', '_2008', ['get', 'fuid']], -1],
			],
			type: 'circle',
			paint: {
				base: { 'circle-radius': 4.5, 'circle-color': '#475569', 'circle-opacity': 0.75, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 },
				filtered: { 'circle-radius': 5.8, 'circle-color': '#475569', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 1.8, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': 7, 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': 6.2, 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
	],

	basepoints_2026: [
		{
			renderKind: 'circle',
			sourceId: 'source-basepoints',
			baseLayerId: 'layer-basepoints-2026-base',
			filteredLayerId: 'layer-basepoints-2026-filtered',
			selectionLayerId: 'layer-basepoints-2026-selected',
			hoverLayerId: 'layer-basepoints-2026-hover',
			filter: ['!=', ['index-of', '_2026', ['get', 'fuid']], -1],
			type: 'circle',
			paint: {
				base: { 'circle-radius': 4.5, 'circle-color': '#0ea5e9', 'circle-opacity': 0.75, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 },
				filtered: { 'circle-radius': 5.8, 'circle-color': '#0ea5e9', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 1.8, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': 7, 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': 6.2, 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
	],

	[USER_LAYER_ID]: [
		{
			renderKind: 'circle',
			sourceId: 'source-user-layer',
			baseLayerId: 'layer-user-circle-base',
			filteredLayerId: 'layer-user-circle-filtered',
			selectionLayerId: 'layer-user-circle-selected',
			hoverLayerId: 'layer-user-circle-hover',
			type: 'circle',
			paint: {
				base: { 'circle-radius': 5.2, 'circle-color': '#14b8a6', 'circle-opacity': 0.78, 'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.2 },
				filtered: { 'circle-radius': 6.4, 'circle-color': '#0ea5e9', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': 7.6, 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': 6.8, 'circle-color': '#facc15', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
			},
		},
		{
			renderKind: 'line',
			sourceId: 'source-user-layer',
			baseLayerId: 'layer-user-line-base',
			filteredLayerId: 'layer-user-line-filtered',
			selectionLayerId: 'layer-user-line-selected',
			hoverLayerId: 'layer-user-line-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#0f766e', 'line-width': 2.6, 'line-opacity': 0.82 },
				filtered: { 'line-color': '#0ea5e9', 'line-width': 3.4, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 4.6, 'line-opacity': 0.95 },
				hover: { 'line-color': '#facc15', 'line-width': 3.8, 'line-opacity': 0.95 },
			},
		},
		{
			renderKind: 'fill',
			sourceId: 'source-user-layer',
			baseLayerId: 'layer-user-fill-base',
			filteredLayerId: 'layer-user-fill-filtered',
			selectionLayerId: 'layer-user-fill-selected',
			hoverLayerId: 'layer-user-fill-hover',
			type: 'fill',
			paint: {
				base: { 'fill-color': '#38bdf8', 'fill-opacity': 0.28, 'fill-outline-color': '#0f172a' },
				filtered: { 'fill-color': '#0ea5e9', 'fill-opacity': 0.45, 'fill-outline-color': '#0f172a' },
				selection: { 'fill-color': '#f97316', 'fill-opacity': 0.55, 'fill-outline-color': '#7c2d12' },
				hover: { 'fill-color': '#facc15', 'fill-opacity': 0.5, 'fill-outline-color': '#ca8a04' },
			},
		},
	],
};

export const CUSTOM_SOURCE_IDS = new Set<string>();
export const CUSTOM_LAYER_IDS = new Set<string>();

Object.values(mapLayerConfigs).forEach((configs) => {
	configs.forEach((config) => {
		CUSTOM_SOURCE_IDS.add(config.sourceId);
		CUSTOM_LAYER_IDS.add(config.baseLayerId);
		CUSTOM_LAYER_IDS.add(config.filteredLayerId);
		CUSTOM_LAYER_IDS.add(config.selectionLayerId);
		CUSTOM_LAYER_IDS.add(config.hoverLayerId);
	});
});

if (isMvtDisplayMode()) {
	MVT_TILESETS.forEach((tileset) => {
		CUSTOM_SOURCE_IDS.add(`source-mvt-${tileset}`);
	});
}
