import { LAYER_DISPLAY_ORDER } from '@/lib/schema';
import type { LayerId, MapRenderKind } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

type MapGeometryType = 'line' | 'circle' | 'fill';

interface LayerPaintConfig {
	base: Record<string, unknown>;
	filtered: Record<string, unknown>;
	selection: Record<string, unknown>;
	hover: Record<string, unknown>;
}

interface MapLayerConfig {
	renderKind: MapRenderKind;
	sourceId: string;
	baseLayerId: string;
	filteredLayerId: string;
	selectionLayerId: string;
	hoverLayerId: string;
	type: MapGeometryType;
	layout?: Record<string, unknown>;
	paint: LayerPaintConfig;
}


export const ALL_LAYER_IDS: LayerId[] = [...LAYER_DISPLAY_ORDER, USER_LAYER_ID];

export const mapLayerConfigs: Record<LayerId, MapLayerConfig[]> = {
	laut_teritorial_sepakat: [
		{
			renderKind: 'line',
			sourceId: 'source-lt-sepakat',
			baseLayerId: 'layer-lt-sepakat-base',
			filteredLayerId: 'layer-lt-sepakat-filtered',
			selectionLayerId: 'layer-lt-sepakat-selected',
			hoverLayerId: 'layer-lt-sepakat-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#1d4ed8', 'line-width': 2.8, 'line-opacity': 0.85 },
				filtered: { 'line-color': '#1d4ed8', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	laut_teritorial_perlu: [
		{
			renderKind: 'line',
			sourceId: 'source-lt-perlu',
			baseLayerId: 'layer-lt-perlu-base',
			filteredLayerId: 'layer-lt-perlu-filtered',
			selectionLayerId: 'layer-lt-perlu-selected',
			hoverLayerId: 'layer-lt-perlu-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#6366f1', 'line-width': 2.8, 'line-opacity': 0.85, 'line-dasharray': [4, 2] },
				filtered: { 'line-color': '#6366f1', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	zee_sepakat: [
		{
			renderKind: 'line',
			sourceId: 'source-zee-sepakat',
			baseLayerId: 'layer-zee-sepakat-base',
			filteredLayerId: 'layer-zee-sepakat-filtered',
			selectionLayerId: 'layer-zee-sepakat-selected',
			hoverLayerId: 'layer-zee-sepakat-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#15803d', 'line-width': 2.8, 'line-opacity': 0.85 },
				filtered: { 'line-color': '#15803d', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	zee_sepakat_ratif: [
		{
			renderKind: 'line',
			sourceId: 'source-zee-sepakat-ratif',
			baseLayerId: 'layer-zee-sepakat-ratif-base',
			filteredLayerId: 'layer-zee-sepakat-ratif-filtered',
			selectionLayerId: 'layer-zee-sepakat-ratif-selected',
			hoverLayerId: 'layer-zee-sepakat-ratif-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#22c55e', 'line-width': 2.8, 'line-opacity': 0.85, 'line-dasharray': [4, 2] },
				filtered: { 'line-color': '#22c55e', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	zee_perlu: [
		{
			renderKind: 'line',
			sourceId: 'source-zee-perlu',
			baseLayerId: 'layer-zee-perlu-base',
			filteredLayerId: 'layer-zee-perlu-filtered',
			selectionLayerId: 'layer-zee-perlu-selected',
			hoverLayerId: 'layer-zee-perlu-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#84cc16', 'line-width': 2.8, 'line-opacity': 0.85, 'line-dasharray': [2, 2] },
				filtered: { 'line-color': '#84cc16', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	landas_kontinen_sepakat: [
		{
			renderKind: 'line',
			sourceId: 'source-lk-sepakat',
			baseLayerId: 'layer-lk-sepakat-base',
			filteredLayerId: 'layer-lk-sepakat-filtered',
			selectionLayerId: 'layer-lk-sepakat-selected',
			hoverLayerId: 'layer-lk-sepakat-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#92400e', 'line-width': 2.8, 'line-opacity': 0.85 },
				filtered: { 'line-color': '#92400e', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	landas_kontinen_sepakat_ratif: [
		{
			renderKind: 'line',
			sourceId: 'source-lk-sepakat-ratif',
			baseLayerId: 'layer-lk-sepakat-ratif-base',
			filteredLayerId: 'layer-lk-sepakat-ratif-filtered',
			selectionLayerId: 'layer-lk-sepakat-ratif-selected',
			hoverLayerId: 'layer-lk-sepakat-ratif-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#c2410c', 'line-width': 2.8, 'line-opacity': 0.85, 'line-dasharray': [4, 2] },
				filtered: { 'line-color': '#c2410c', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	landas_kontinen_perlu: [
		{
			renderKind: 'line',
			sourceId: 'source-lk-perlu',
			baseLayerId: 'layer-lk-perlu-base',
			filteredLayerId: 'layer-lk-perlu-filtered',
			selectionLayerId: 'layer-lk-perlu-selected',
			hoverLayerId: 'layer-lk-perlu-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#f59e0b', 'line-width': 2.8, 'line-opacity': 0.85, 'line-dasharray': [2, 2] },
				filtered: { 'line-color': '#f59e0b', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	landas_kontinen_ekstensi: [
		{
			renderKind: 'fill',
			sourceId: 'source-lk-ekstensi',
			baseLayerId: 'layer-lk-ekstensi-base',
			filteredLayerId: 'layer-lk-ekstensi-filtered',
			selectionLayerId: 'layer-lk-ekstensi-selected',
			hoverLayerId: 'layer-lk-ekstensi-hover',
			type: 'fill',
			paint: {
				base: { 'fill-color': '#f97316', 'fill-opacity': 0.25, 'fill-outline-color': '#c2410c' },
				filtered: { 'fill-color': '#f97316', 'fill-opacity': 0.4, 'fill-outline-color': '#c2410c' },
				selection: { 'fill-color': '#f97316', 'fill-opacity': 0.55, 'fill-outline-color': '#7c2d12' },
				hover: { 'fill-color': '#facc15', 'fill-opacity': 0.45, 'fill-outline-color': '#ca8a04' },
			},
		},
	],
	zona_tambahan: [
		{
			renderKind: 'line',
			sourceId: 'source-zona-tambahan',
			baseLayerId: 'layer-zona-tambahan-base',
			filteredLayerId: 'layer-zona-tambahan-filtered',
			selectionLayerId: 'layer-zona-tambahan-selected',
			hoverLayerId: 'layer-zona-tambahan-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#0891b2', 'line-width': 2.8, 'line-opacity': 0.85 },
				filtered: { 'line-color': '#0891b2', 'line-width': 3.6, 'line-opacity': 0.9 },
				selection: { 'line-color': '#f97316', 'line-width': 5, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 4.2, 'line-opacity': 0.95 },
			},
		},
	],
	baseline: [
		{
			renderKind: 'line',
			sourceId: 'source-baseline',
			baseLayerId: 'layer-baseline-base',
			filteredLayerId: 'layer-baseline-filtered',
			selectionLayerId: 'layer-baseline-selected',
			hoverLayerId: 'layer-baseline-hover',
			type: 'line',
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				base: { 'line-color': '#1e293b', 'line-width': 2.4, 'line-opacity': 0.8, 'line-dasharray': [1, 3] },
				filtered: { 'line-color': '#1e293b', 'line-width': 3.2, 'line-opacity': 0.95 },
				selection: { 'line-color': '#f97316', 'line-width': 4, 'line-opacity': 0.95 },
				hover: { 'line-color': '#eab308', 'line-width': 3.5, 'line-opacity': 0.95 },
			},
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
				base: { 'circle-radius': 5, 'circle-color': '#3730a3', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': 6.2, 'circle-color': '#3730a3', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': 7.4, 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': 6.8, 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
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
				base: { 'circle-radius': 5, 'circle-color': '#78350f', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': 6.2, 'circle-color': '#78350f', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': 7.4, 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': 6.8, 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
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
				base: { 'circle-radius': 5, 'circle-color': '#0d9488', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.1, 'circle-opacity': 0.85 },
				filtered: { 'circle-radius': 6.2, 'circle-color': '#0d9488', 'circle-stroke-color': '#1f2937', 'circle-stroke-width': 2, 'circle-opacity': 0.9 },
				selection: { 'circle-radius': 7.4, 'circle-color': '#f97316', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2.2, 'circle-opacity': 0.95 },
				hover: { 'circle-radius': 6.8, 'circle-color': '#eab308', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 2, 'circle-opacity': 0.95 },
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
			type: 'circle',
			paint: {
				base: { 'circle-radius': 4.5, 'circle-color': '#475569', 'circle-opacity': 0.75, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 },
				filtered: { 'circle-radius': 5.8, 'circle-color': '#475569', 'circle-stroke-color': '#0f172a', 'circle-stroke-width': 1.8, 'circle-opacity': 0.9 },
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
				base: {
					'circle-radius': 5.2,
					'circle-color': '#14b8a6',
					'circle-opacity': 0.78,
					'circle-stroke-color': '#f8fafc',
					'circle-stroke-width': 1.2,
				},
				filtered: {
					'circle-radius': 6.4,
					'circle-color': '#0ea5e9',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2,
					'circle-opacity': 0.9,
				},
				selection: {
					'circle-radius': 7.6,
					'circle-color': '#f97316',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2.2,
					'circle-opacity': 0.95,
				},
				hover: {
					'circle-radius': 6.8,
					'circle-color': '#facc15',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2,
					'circle-opacity': 0.95,
				},
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
			layout: {
				'line-cap': 'round',
				'line-join': 'round',
			},
			paint: {
				base: {
					'line-color': '#0f766e',
					'line-width': 2.6,
					'line-opacity': 0.82,
				},
				filtered: {
					'line-color': '#0ea5e9',
					'line-width': 3.4,
					'line-opacity': 0.9,
				},
				selection: {
					'line-color': '#f97316',
					'line-width': 4.6,
					'line-opacity': 0.95,
				},
				hover: {
					'line-color': '#facc15',
					'line-width': 3.8,
					'line-opacity': 0.95,
				},
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
				base: {
					'fill-color': '#38bdf8',
					'fill-opacity': 0.28,
					'fill-outline-color': '#0f172a',
				},
				filtered: {
					'fill-color': '#0ea5e9',
					'fill-opacity': 0.45,
					'fill-outline-color': '#0f172a',
				},
				selection: {
					'fill-color': '#f97316',
					'fill-opacity': 0.55,
					'fill-outline-color': '#7c2d12',
				},
				hover: {
					'fill-color': '#facc15',
					'fill-opacity': 0.5,
					'fill-outline-color': '#ca8a04',
				},
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

