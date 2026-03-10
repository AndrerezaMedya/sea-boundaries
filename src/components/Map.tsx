import { useEffect, useRef, useState } from 'react';
import { bbox } from '@turf/turf';
import maplibregl, { Map as MapLibreMap, NavigationControl, Popup, ScaleControl } from 'maplibre-gl';
import { MapLibreSearchControl } from '@stadiamaps/maplibre-search-box';
import BasemapsControl, { type MapLibreBasemapsControlOptions } from 'maplibre-gl-basemaps';
import StyleFlipperControl from 'maplibre-gl-style-flipper';
import type {
	FilterSpecification,
	GeoJSONSource,
	LayerSpecification,
	MapLayerMouseEvent,
	RasterLayerSpecification,
	RasterSourceSpecification,
} from 'maplibre-gl';
import type { FeatureCollection, Geometry } from 'geojson';

import FeatureDetailModal from '@/components/FeatureDetailModal';
import {
	BASEMAPS_BY_THEME,
	DEFAULT_BASEMAP_ID_BY_THEME,
	getBasemapDefinition,
	getBasemapDefinitionById,
	getBasemapIdsForTheme,
	isRasterBasemapDefinition,
	mapBasemapId,
} from '@/data/basemaps';
import type { BasemapDefinition, BasemapTheme } from '@/data/basemaps';
import type { MapStyleKey } from '@/data/mapStyles';
import { DEFAULT_MAP_STYLE, mapStyles } from '@/data/mapStyles';
import { buildIdMatchExpression } from '@/lib/filterExpr';
import { EMPTY_GEOJSON, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, buildPopupHtml, getBaseMapStyle } from '@/lib/map';
import { LAYER_DISPLAY_ORDER, getLayerSchema } from '@/lib/schema';
import type { FeatureWithProps, LayerId, MapRenderKind } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';
import { useThemeStore } from '@/store/useTheme';

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


const ALL_LAYER_IDS: LayerId[] = [...LAYER_DISPLAY_ORDER, USER_LAYER_ID];

const mapLayerConfigs: Record<LayerId, MapLayerConfig[]> = {
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

const CUSTOM_SOURCE_IDS = new Set<string>();
const CUSTOM_LAYER_IDS = new Set<string>();

Object.values(mapLayerConfigs).forEach((configs) => {
	configs.forEach((config) => {
		CUSTOM_SOURCE_IDS.add(config.sourceId);
		CUSTOM_LAYER_IDS.add(config.baseLayerId);
		CUSTOM_LAYER_IDS.add(config.filteredLayerId);
		CUSTOM_LAYER_IDS.add(config.selectionLayerId);
		CUSTOM_LAYER_IDS.add(config.hoverLayerId);
	});
});

interface CapturedLayerState {
	definition: LayerSpecification;
	beforeId: string | null;
}

interface CapturedMapState {
	sources: Record<string, unknown>;
	layers: Record<string, CapturedLayerState>;
}

type BasemapsControlOptionsWithCompact = MapLibreBasemapsControlOptions & { compact?: boolean };

const captureCustomLayers = (map: MapLibreMap): CapturedMapState => {
	const style = map.getStyle();
	const captured: CapturedMapState = {
		sources: {},
		layers: {},
	};

	Object.entries(style.sources ?? {}).forEach(([sourceId, sourceSpec]) => {
		if (!CUSTOM_SOURCE_IDS.has(sourceId)) {
			return;
		}
		captured.sources[sourceId] = JSON.parse(JSON.stringify(sourceSpec));
	});

	const layers = style.layers ?? [];
	layers.forEach((layer, index) => {
		if (!CUSTOM_LAYER_IDS.has(layer.id)) {
			return;
		}
		let beforeId: string | null = null;
		for (let i = index + 1; i < layers.length; i += 1) {
			const candidate = layers[i].id;
			if (!CUSTOM_LAYER_IDS.has(candidate)) {
				beforeId = candidate;
				break;
			}
		}
		captured.layers[layer.id] = {
			definition: JSON.parse(JSON.stringify(layer)) as LayerSpecification,
			beforeId,
		};
	});

	return captured;
};

const RASTER_SOURCE_PREFIX = 'basemap-src-';
const RASTER_LAYER_PREFIX = 'basemap-';
const OVERLAY_SOURCE_PREFIXES = ['source-', 'measure-', 'user-'];

const enterRasterMode = (map: MapLibreMap) => {
	const style = map.getStyle();
	if (!style) {
		return;
	}
	const layers = [...(style.layers ?? [])];
	layers.forEach((layer) => {
		if (layer.id === 'background') {
			return;
		}
		const candidateSource = (layer as { source?: string }).source;
		const keep =
			typeof candidateSource === 'string' &&
			OVERLAY_SOURCE_PREFIXES.some((prefix) => candidateSource.startsWith(prefix));
		if (!keep) {
			try {
				map.removeLayer(layer.id);
			} catch (error) {
				console.warn(`Tidak dapat menghapus layer ${layer.id} saat masuk mode raster`, error);
			}
		}
	});
	const sources = Object.keys(style.sources ?? {});
	sources.forEach((sourceId) => {
		const keep = OVERLAY_SOURCE_PREFIXES.some((prefix) => sourceId.startsWith(prefix));
		if (!keep) {
			try {
				map.removeSource(sourceId);
			} catch (error) {
				console.warn(`Tidak dapat menghapus source ${sourceId} saat masuk mode raster`, error);
			}
		}
	});
	try {
		map.setPaintProperty('background', 'background-color', '#ffffff');
	} catch (error) {
		console.warn('Gagal mengatur warna latar belakang ke putih pada mode raster', error);
	}
};

const reapplyCustomLayers = (map: MapLibreMap, captured: CapturedMapState) => {
	Object.entries(captured.sources).forEach(([sourceId, sourceSpec]) => {
		const source = map.getSource(sourceId);
		if (source && 'setData' in source && sourceSpec && typeof sourceSpec === 'object' && sourceSpec !== null) {
			const geoSpec = sourceSpec as { data?: unknown };
			if (geoSpec.data) {
				try {
					(source as GeoJSONSource).setData(geoSpec.data as FeatureCollection<Geometry>);
				} catch (error) {
					console.warn(`Gagal mengatur ulang data untuk source ${sourceId}`, error);
				}
			}
		}
	});

	Object.values(captured.layers).forEach(({ definition, beforeId }) => {
		const layerId = definition.id;
		const filter = (definition as unknown as { filter?: FilterSpecification }).filter;
		const layout = (definition as unknown as { layout?: Record<string, unknown> }).layout;
		const paint = (definition as unknown as { paint?: Record<string, unknown> }).paint;
		if (!map.getLayer(layerId)) {
			try {
				map.addLayer(definition);
			} catch (error) {
				console.warn(`Tidak dapat menambahkan layer ${layerId} saat pemulihan`, error);
			}
		}
		if (filter) {
			try {
				map.setFilter(layerId, filter as FilterSpecification);
			} catch (error) {
				console.warn(`Tidak dapat memulihkan filter untuk layer ${layerId}`, error);
			}
		}
		if (layout) {
			Object.entries(layout).forEach(([key, value]) => {
				try {
					map.setLayoutProperty(layerId, key, value as unknown);
				} catch (error) {
					console.warn(`Tidak dapat memulihkan properti layout ${key} pada layer ${layerId}`, error);
				}
			});
		}
		if (paint) {
			Object.entries(paint).forEach(([key, value]) => {
				try {
					map.setPaintProperty(layerId, key, value as unknown);
				} catch (error) {
					console.warn(`Tidak dapat memulihkan properti paint ${key} pada layer ${layerId}`, error);
				}
			});
		}
		if (beforeId && map.getLayer(beforeId)) {
			try {
				map.moveLayer(layerId, beforeId);
			} catch (error) {
				console.warn(`Tidak dapat memindahkan layer ${layerId} sebelum ${beforeId}`, error);
			}
		}
	});
};

const popupButtonClass =
	'inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const MapView = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const [modalState, setModalState] = useState<{ isOpen: boolean; layerId: LayerId | null; featureId: string | null }>({
		isOpen: false,
		layerId: null,
		featureId: null,
	});
	const mapReadyRef = useRef(false);
	const capturedStateRef = useRef<CapturedMapState | null>(null);
	const themeFromStore = useThemeStore((state) => state.theme);
	const setTheme = useThemeStore((state) => state.setTheme);
	const initialThemeKey = (themeFromStore ?? DEFAULT_MAP_STYLE) as MapStyleKey;
	const initialBasemapTheme: BasemapTheme = initialThemeKey === 'dark' ? 'dark' : 'light';
	const initialBasemapId = DEFAULT_BASEMAP_ID_BY_THEME[initialBasemapTheme];
	const initialBasemapDefinition = getBasemapDefinition(initialBasemapTheme, initialBasemapId);
	const currentThemeRef = useRef<BasemapTheme>(initialBasemapTheme);
	const currentBasemapIdRef = useRef<string>(initialBasemapDefinition.id);
	const styleModeRef = useRef<'raster' | 'vector'>(initialBasemapDefinition.kind === 'vector' ? 'vector' : 'raster');
	const currentBasemapKindRef = useRef<'raster' | 'vector'>(
		initialBasemapDefinition.kind === 'vector' ? 'vector' : 'raster',
	);
	const currentVectorStyleRef = useRef<string | null>(
		initialBasemapDefinition.kind === 'vector' ? initialBasemapDefinition.styleUrl : null,
	);
	const initialThemeRef = useRef<MapStyleKey>(themeFromStore);

	const layersState = useLayersStore((state) => state.layers);
	const pendingZoom = useLayersStore((state) => state.pendingZoom);
	const consumeZoomRequest = useLayersStore((state) => state.consumeZoomRequest);
	const getFeatureById = useLayersStore((state) => state.getFeatureById);
	const setSelection = useLayersStore((state) => state.setSelection);
	const setHoveredFeature = useLayersStore((state) => state.setHoveredFeature);
	const setActiveLayer = useLayersStore((state) => state.setActiveLayer);
	const requestZoomToIds = useLayersStore((state) => state.requestZoomToIds);
	const setActiveTab = useUIStore((state) => state.setActiveTab);
	const showCoordinates = useUIStore((state) => state.showCoordinates);

	const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);
	const showCoordinatesRef = useRef(showCoordinates);
	// Keep ref in sync so the stable mousemove closure sees latest toggle
	showCoordinatesRef.current = showCoordinates;

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const initialTheme = initialThemeRef.current;
		const initialStyleKey: MapStyleKey = initialTheme ?? DEFAULT_MAP_STYLE;
		const initialStyleCandidate = mapStyles[initialStyleKey]?.url;
		const map = new maplibregl.Map({
			container: containerRef.current,
			style: typeof initialStyleCandidate === 'string' ? initialStyleCandidate : getBaseMapStyle(),
			center: MAP_DEFAULT_CENTER,
			zoom: MAP_DEFAULT_ZOOM,
		});
		mapRef.current = map;

		const popup = new maplibregl.Popup({
			closeButton: true,
			closeOnClick: false,
			offset: 15,
			className: 'app-popup',
			maxWidth: '380px'
		});
		popupRef.current = popup;

		const navigationControl = new NavigationControl({ visualizePitch: true });
		map.addControl(navigationControl, 'top-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-right');

		const handleMapMouseMove = (e: maplibregl.MapMouseEvent) => {
			if (!showCoordinatesRef.current) {
				setCoords(null);
				return;
			}
			setCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
		};
		const handleMapMouseLeave = () => setCoords(null);
		map.on('mousemove', handleMapMouseMove);
		map.on('mouseleave', handleMapMouseLeave);

		const accessibilityCleanup: Array<() => void> = [];

		const searchControl = new MapLibreSearchControl({
			useMapFocusPoint: true,
			mapFocusPointMinZoom: 5,
			maxResults: 8,
			minWaitPeriodMs: 150,
			onResultSelected: () => {
				popup.remove();
			},
		});
		const controlWithApi = searchControl as unknown as {
			api?: {
				configuration?: {
					configuration?: Record<string, unknown>;
					config?: Record<string, unknown>;
				};
			};
		};
		const stadiaApiKey = import.meta.env.VITE_STADIA_MAPS_API_KEY;
		if (stadiaApiKey && controlWithApi.api?.configuration) {
			const configWrapper = controlWithApi.api.configuration;
			const baseConfig = (configWrapper.configuration ?? {}) as Record<string, unknown>;
			const nextConfig = {
				...baseConfig,
				apiKey: stadiaApiKey,
			};
			try {
				// prefer setter when available to preserve internal observers
				configWrapper.config = nextConfig;
			} catch {
				// fallback to direct mutation if setter is unavailable in future versions
				configWrapper.configuration = nextConfig;
			}
		} else if (!stadiaApiKey) {
			console.warn('VITE_STADIA_MAPS_API_KEY is not defined; Stadia Maps search will use anonymous access.');
		}
		map.addControl(searchControl, 'top-left');

		const searchContainer = typeof searchControl.getContainer === 'function' ? searchControl.getContainer() : null;
		if (searchContainer) {
			searchContainer.setAttribute('role', 'search');
			searchContainer.setAttribute('aria-label', 'Pencarian lokasi Stadia Maps');
			const searchInput = searchContainer.querySelector('input');
			if (searchInput) {
				searchInput.setAttribute('aria-label', 'Cari lokasi di peta');
				const keyHandler = (event: KeyboardEvent) => {
					if (event.key === 'Escape') {
						(event.currentTarget as HTMLInputElement).blur();
					}
				};
				searchInput.addEventListener('keydown', keyHandler);
				accessibilityCleanup.push(() => searchInput.removeEventListener('keydown', keyHandler));
			}
		}

		const basemapDefinitionMap = new Map<string, BasemapDefinition>();
		Object.values(BASEMAPS_BY_THEME).forEach((entries) => {
			Object.entries(entries).forEach(([id, definition]) => {
				if (!basemapDefinitionMap.has(id)) {
					basemapDefinitionMap.set(id, definition);
				}
			});
		});

		const rasterBasemapDefinitions = Array.from(basemapDefinitionMap.values()).filter(isRasterBasemapDefinition);
		const rasterBasemapIdSet = new Set(rasterBasemapDefinitions.map((definition) => definition.id));
		const basemapIdsByTheme: Record<BasemapTheme, Set<string>> = {
			light: new Set(getBasemapIdsForTheme('light')),
			dark: new Set(getBasemapIdsForTheme('dark')),
		};

		const basemapControlOptions: BasemapsControlOptionsWithCompact = {
			basemaps: Array.from(basemapDefinitionMap.values()).map((definition) => {
				const tiles =
					definition.previewTiles && definition.previewTiles.length > 0
						? definition.previewTiles
						: definition.kind === 'raster'
							? definition.tiles
							: [];
				const sourceExtraParams: Partial<RasterSourceSpecification> = {};
				if (definition.kind === 'raster') {
					if (typeof definition.tileSize === 'number') {
						sourceExtraParams.tileSize = definition.tileSize;
					}
					if (typeof definition.attribution === 'string' && definition.attribution.trim().length > 0) {
						sourceExtraParams.attribution = definition.attribution;
					}
					if (typeof definition.minZoom === 'number') {
						sourceExtraParams.minzoom = definition.minZoom;
					}
					if (typeof definition.maxZoom === 'number') {
						sourceExtraParams.maxzoom = definition.maxZoom;
					}
				}
				const layerExtraParams: Partial<RasterLayerSpecification> = {};
				if (definition.kind === 'raster') {
					if (typeof definition.minZoom === 'number') {
						layerExtraParams.minzoom = definition.minZoom;
					}
					if (typeof definition.maxZoom === 'number') {
						layerExtraParams.maxzoom = definition.maxZoom;
					}
				}
				return {
					id: definition.id,
					tiles,
					sourceExtraParams,
					layerExtraParams,
				};
			}),
			initialBasemap: currentBasemapIdRef.current,
			expandDirection: 'down',
			compact: false,
		};
		const basemapControl = new BasemapsControl(basemapControlOptions);
		map.addControl(basemapControl, 'top-left');

		const basemapContainer = (basemapControl as unknown as { _container?: HTMLElement })._container;

		const purgeRasterBasemapArtifacts = () => {
			const style = map.getStyle();
			if (!style) {
				return;
			}
			const existingLayers = [...(style.layers ?? [])];
			existingLayers.forEach((layer) => {
				const shouldRemove =
					layer.type === 'raster' &&
					(layer.id.startsWith(RASTER_LAYER_PREFIX) || rasterBasemapIdSet.has(layer.id));
				if (shouldRemove) {
					try {
						map.removeLayer(layer.id);
					} catch (error) {
						console.warn(`Tidak dapat menghapus layer raster ${layer.id}`, error);
					}
				}
			});
			const existingSources = Object.keys(style.sources ?? {});
			existingSources.forEach((sourceId) => {
				const shouldRemove =
					sourceId.startsWith(RASTER_SOURCE_PREFIX) || rasterBasemapIdSet.has(sourceId);
				if (shouldRemove) {
					try {
						map.removeSource(sourceId);
					} catch (error) {
						console.warn(`Tidak dapat menghapus source raster ${sourceId}`, error);
					}
				}
			});
		};

		const ensureRasterBasemapLayers = (activeId: string) => {
			const style = map.getStyle();
			if (!style) {
				return;
			}

			let retryScheduled = false;
			const scheduleRetry = () => {
				if (retryScheduled) {
					return;
				}
				retryScheduled = true;
				map.once('styledata', () => {
					ensureRasterBasemapLayers(activeId);
				});
			};

			const styleLayers = style.layers ?? [];
			const beforeId = styleLayers.find((layer) => layer.id !== 'background' && !layer.id.startsWith(RASTER_LAYER_PREFIX))?.id;

			rasterBasemapDefinitions.forEach((definition) => {
				const sourceId = `${RASTER_SOURCE_PREFIX}${definition.id}`;
				const layerId = `${RASTER_LAYER_PREFIX}${definition.id}`;
				const visibility = definition.id === activeId ? 'visible' : 'none';

				const sourceConfig: RasterSourceSpecification = {
					type: 'raster',
					tiles: definition.tiles,
				};
				if (typeof definition.tileSize === 'number') {
					sourceConfig.tileSize = definition.tileSize;
				}
				if (typeof definition.attribution === 'string' && definition.attribution.trim().length > 0) {
					sourceConfig.attribution = definition.attribution;
				}
				if (typeof definition.minZoom === 'number') {
					sourceConfig.minzoom = definition.minZoom;
				}
				if (typeof definition.maxZoom === 'number') {
					sourceConfig.maxzoom = definition.maxZoom;
				}

				if (!map.getSource(sourceId)) {
					try {
						map.addSource(sourceId, sourceConfig);
					} catch (error) {
						console.warn(`Tidak dapat menambahkan source raster ${sourceId}`, error);
						scheduleRetry();
						return;
					}
				}

				const layerConfig: LayerSpecification = {
					id: layerId,
					type: 'raster',
					source: sourceId,
					layout: {
						visibility,
					},
				};
				if (typeof definition.minZoom === 'number') {
					(layerConfig as RasterLayerSpecification).minzoom = definition.minZoom;
				}
				if (typeof definition.maxZoom === 'number') {
					(layerConfig as RasterLayerSpecification).maxzoom = definition.maxZoom;
				}

				if (!map.getLayer(layerId)) {
					try {
						map.addLayer(layerConfig, beforeId ?? undefined);
					} catch (error) {
						console.warn(`Tidak dapat menambahkan layer raster ${layerId}`, error);
						scheduleRetry();
						return;
					}
				} else {
					try {
						map.setLayoutProperty(layerId, 'visibility', visibility);
					} catch (error) {
						console.warn(`Tidak dapat mengatur visibilitas layer raster ${layerId}`, error);
						scheduleRetry();
					}
				}
			});
		};

		const updateBasemapThumbnailState = (activeId: string, theme: BasemapTheme) => {
			if (!basemapContainer) {
				return;
			}
			const allowedIds = basemapIdsByTheme[theme];
			basemapContainer.querySelectorAll<HTMLImageElement>('img.basemap').forEach((img) => {
				const identifier = img.dataset.id ?? '';
				const isAllowed = allowedIds.has(identifier);
				img.classList.toggle('hidden', !isAllowed);
				img.setAttribute('aria-hidden', isAllowed ? 'false' : 'true');
				img.setAttribute('tabindex', isAllowed ? '0' : '-1');
				img.style.pointerEvents = isAllowed ? '' : 'none';
				const isActive = isAllowed && identifier === activeId;
				img.classList.toggle('active', isActive);
				img.setAttribute('aria-pressed', isActive ? 'true' : 'false');
			});
		};

		const ensureBasemapLayers = (
			overrideActiveId?: string,
			options?: { theme?: BasemapTheme; forceReinitialize?: boolean },
		) => {
			const targetTheme = options?.theme ?? currentThemeRef.current;
			currentThemeRef.current = targetTheme;

			const fallbackId = overrideActiveId ?? currentBasemapIdRef.current;
			const themeDefinition = getBasemapDefinition(targetTheme, fallbackId);
			let activeId = themeDefinition.id;

			if (!basemapDefinitionMap.has(activeId) && overrideActiveId) {
				const anyDefinition = getBasemapDefinitionById(overrideActiveId);
				if (anyDefinition) {
					activeId = anyDefinition.id;
				}
			}

			if (!basemapDefinitionMap.has(activeId)) {
				activeId = DEFAULT_BASEMAP_ID_BY_THEME[targetTheme];
			}

			currentBasemapIdRef.current = activeId;
			updateBasemapThumbnailState(activeId, targetTheme);

			const definition = basemapDefinitionMap.get(activeId);
			if (!definition) {
				return;
			}

			const forceReinitialize = options?.forceReinitialize ?? false;

			const runPostApply = (styleUpdated: boolean) => {
				const shouldReinitialize = styleUpdated || forceReinitialize;
				if (shouldReinitialize) {
					initialiseSources();
					syncMapWithState(map, useLayersStore.getState().layers);
				}
				updateBasemapThumbnailState(activeId, targetTheme);
			};

			if (definition.kind === 'vector') {
				const needsStyleChange =
					currentBasemapKindRef.current !== 'vector' || currentVectorStyleRef.current !== definition.styleUrl;

				if (!needsStyleChange) {
					runPostApply(forceReinitialize);
					return;
				}

				map.setStyle(definition.styleUrl, { diff: false });
				map.once('styledata', () => {
					styleModeRef.current = 'vector';
					currentBasemapKindRef.current = 'vector';
					currentVectorStyleRef.current = definition.styleUrl;
					runPostApply(true);
				});
				return;
			}

			const applyRaster = (styleUpdated: boolean) => {
				styleModeRef.current = 'raster';
				currentBasemapKindRef.current = 'raster';
				currentVectorStyleRef.current = null;
				purgeRasterBasemapArtifacts();
				ensureRasterBasemapLayers(activeId);
				runPostApply(styleUpdated);
			};

			if (currentBasemapKindRef.current === 'vector') {
				map.setStyle(mapStyles.light.url, { diff: false });
				map.once('styledata', () => {
					enterRasterMode(map);
					applyRaster(true);
				});
				return;
			}

			if (!map.isStyleLoaded()) {
				map.once('styledata', () => {
					applyRaster(false);
				});
				return;
			}

			applyRaster(false);
		};

		if (basemapContainer) {
			const getBasemapLabel = (identifier: string) => {
				const definition = getBasemapDefinitionById(identifier);
				return definition?.label ?? `Basemap ${identifier}`;
			};

			const decorateBasemapThumbnails = () => {
				basemapContainer.querySelectorAll<HTMLImageElement>('img.basemap').forEach((img) => {
					if (img.dataset.decorated) {
						return;
					}
					img.dataset.decorated = 'true';
					img.classList.remove('hidden');
					const identifier = img.dataset.id ?? '';
					const label = getBasemapLabel(identifier);
					img.alt = label;
					img.title = label;
					img.setAttribute('role', 'button');
					img.setAttribute('tabindex', '0');
					const keyHandler = (event: KeyboardEvent) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							img.click();
						}
					};
					img.addEventListener('keydown', keyHandler);
					const clickHandler = (clickEvent: MouseEvent) => {
						clickEvent.preventDefault();
						clickEvent.stopImmediatePropagation();
						clickEvent.stopPropagation();
						const id = img.dataset.id ?? '';
						if (!id) {
							return;
						}
						ensureBasemapLayers(id, { theme: currentThemeRef.current });
					};
					img.addEventListener('click', clickHandler, true);
					accessibilityCleanup.push(() => {
						img.removeEventListener('keydown', keyHandler);
						img.removeEventListener('click', clickHandler, true);
					});
				});
				updateBasemapThumbnailState(currentBasemapIdRef.current, currentThemeRef.current);
			};

			decorateBasemapThumbnails();
			const basemapObserver = new MutationObserver((mutations) => {
				let shouldDecorate = false;
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList') {
						shouldDecorate = true;
					}
				});
				if (shouldDecorate) {
					decorateBasemapThumbnails();
				} else {
					updateBasemapThumbnailState(currentBasemapIdRef.current, currentThemeRef.current);
				}
			});
			basemapObserver.observe(basemapContainer, {
				subtree: true,
				attributes: true,
				attributeFilter: ['class'],
				childList: true,
			});
			accessibilityCleanup.push(() => basemapObserver.disconnect());
			basemapContainer.setAttribute('role', 'group');
			basemapContainer.setAttribute('aria-label', 'Pemilih basemap');
			const keepPanelExpanded = () => {
				basemapContainer.classList.remove('closed');
			};
			keepPanelExpanded();
			const keepPanelExpandedDeferred = () => {
				requestAnimationFrame(keepPanelExpanded);
			};
			basemapContainer.addEventListener('mouseenter', keepPanelExpanded);
			basemapContainer.addEventListener('mouseleave', keepPanelExpandedDeferred);
			accessibilityCleanup.push(() => {
				basemapContainer.removeEventListener('mouseenter', keepPanelExpanded);
				basemapContainer.removeEventListener('mouseleave', keepPanelExpandedDeferred);
			});
		}

		const styleDefinitions = Object.fromEntries(
			Object.entries(mapStyles).map(([key, value]) => [key, { ...value }]),
		);
		const styleControl = new StyleFlipperControl(styleDefinitions, (_styleKey, styleCode) => {
			const styleKey = (styleCode as MapStyleKey) ?? DEFAULT_MAP_STYLE;
			const targetTheme: BasemapTheme = styleKey === 'dark' ? 'dark' : 'light';
			const mappedBasemapId = mapBasemapId(currentBasemapIdRef.current, targetTheme);
			setTheme(targetTheme);
			ensureBasemapLayers(mappedBasemapId, { theme: targetTheme, forceReinitialize: true });
		});
		const styleControlAny = styleControl as unknown as {
			saveCustomSourcesAndLayers?: () => void;
			restoreCustomSourcesAndLayers?: () => void;
			setCurrentStyleCode?: (code: string) => void;
			_container?: HTMLElement;
		};

		if (styleControlAny.saveCustomSourcesAndLayers) {
			const originalSave = styleControlAny.saveCustomSourcesAndLayers.bind(styleControlAny);
			styleControlAny.saveCustomSourcesAndLayers = () => {
				capturedStateRef.current = captureCustomLayers(map);
				originalSave();
			};
		}

		if (styleControlAny.restoreCustomSourcesAndLayers) {
			const originalRestore = styleControlAny.restoreCustomSourcesAndLayers.bind(styleControlAny);
			styleControlAny.restoreCustomSourcesAndLayers = () => {
				originalRestore();
				if (capturedStateRef.current) {
					reapplyCustomLayers(map, capturedStateRef.current);
					syncMapWithState(map, useLayersStore.getState().layers);
					capturedStateRef.current = null;
				}
			};
		}

		map.addControl(styleControl, 'bottom-left');
		if (styleControlAny.setCurrentStyleCode) {
			styleControlAny.setCurrentStyleCode(mapStyles[initialStyleKey].code);
		}

		const styleContainer = styleControlAny._container;
		if (styleContainer) {
			const updateAriaPressed = () => {
				styleContainer.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
					button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
				});
			};
			const styleObserver = new MutationObserver(updateAriaPressed);
			styleObserver.observe(styleContainer, { subtree: true, attributes: true, attributeFilter: ['class'] });
			accessibilityCleanup.push(() => styleObserver.disconnect());
			styleContainer.setAttribute('role', 'group');
			styleContainer.setAttribute('aria-label', 'Pemilih gaya peta vektor');
			if (!styleContainer.getAttribute('title')) {
				styleContainer.setAttribute('title', 'Ganti gaya vektor (terang/gelap)');
			}
			styleContainer.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
				button.setAttribute('tabindex', '0');
				const keyHandler = (event: KeyboardEvent) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						button.click();
					}
				};
				button.addEventListener('keydown', keyHandler);
				accessibilityCleanup.push(() => button.removeEventListener('keydown', keyHandler));
			});
			updateAriaPressed();
		}

		const initialiseSources = () => {
			ALL_LAYER_IDS.forEach((layerId) => {
				const configs = mapLayerConfigs[layerId] ?? [];
				configs.forEach((config) => {
					if (!map.getSource(config.sourceId)) {
						map.addSource(config.sourceId, {
							type: 'geojson',
							data: EMPTY_GEOJSON,
						});
					}
					const baseLayer: LayerSpecification = {
						id: config.baseLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.base,
					};
					if (!map.getLayer(config.baseLayerId)) {
						map.addLayer(baseLayer);
					}
					const filteredLayer: LayerSpecification = {
						id: config.filteredLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.filtered,
						filter: buildIdMatchExpression([]) as any,
					};
					if (!map.getLayer(config.filteredLayerId)) {
						map.addLayer(filteredLayer);
					}
					const selectionLayer: LayerSpecification = {
						id: config.selectionLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.selection,
						filter: buildIdMatchExpression([]) as any,
					};
					if (!map.getLayer(config.selectionLayerId)) {
						map.addLayer(selectionLayer);
					}
					const hoverLayer: LayerSpecification = {
						id: config.hoverLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.hover,
						filter: buildIdMatchExpression([]) as any,
					};
					if (!map.getLayer(config.hoverLayerId)) {
						map.addLayer(hoverLayer);
					}
					const interactiveLayers = [
						config.baseLayerId,
						config.filteredLayerId,
						config.selectionLayerId,
						config.hoverLayerId,
					];
					interactiveLayers.forEach((mapLayerId) => {
						map.on('mouseenter', mapLayerId, () => {
							map.getCanvas().style.cursor = 'pointer';
						});
						map.on('mouseleave', mapLayerId, () => {
							map.getCanvas().style.cursor = '';
							const currentHovered = useLayersStore.getState().layers[layerId]?.hoveredId ?? null;
							if (currentHovered !== null) {
								setHoveredFeature(layerId, null);
							}
						});
						map.on('mousemove', mapLayerId, (event: MapLayerMouseEvent) => {
							const feature = event.features?.[0];
							if (!feature || feature.id === undefined || feature.id === null) {
								return;
							}
							const featureId = String(feature.id);
							const currentHovered = useLayersStore.getState().layers[layerId]?.hoveredId;
							if (currentHovered !== featureId) {
								setHoveredFeature(layerId, featureId);
							}
						});
						map.on('click', mapLayerId, (event: MapLayerMouseEvent) => {
							handleFeatureClick(layerId, event);
						});
					});
				});
			});
		};

		const handleFeatureClick = (layerId: LayerId, event: MapLayerMouseEvent) => {
			const mapInstance = mapRef.current;
			const popupInstance = popupRef.current;
			if (!mapInstance || !popupInstance) {
				return;
			}
			const feature = event.features?.[0] as FeatureWithProps | undefined;
			if (!feature || feature.id === undefined || feature.id === null) {
				popupInstance.remove();
				return;
			}

			// Get schema untuk mendapatkan primaryKey
			const schema = getLayerSchema(layerId);
			const properties = feature.properties ?? {};

			// Gunakan primaryKey dari properties sebagai featureId, fallback ke feature.id
			const featureId = properties[schema.primaryKey] !== undefined && properties[schema.primaryKey] !== null
				? String(properties[schema.primaryKey])
				: String(feature.id);

			const currentLayerState = useLayersStore.getState().layers[layerId];
			const currentSelection = currentLayerState?.selectionIds ?? [];
			const isAlreadySelected = currentSelection.includes(featureId);
			if (!isAlreadySelected || currentSelection.length > 1) {
				setSelection(layerId, [featureId]);
			}
			setActiveLayer(layerId);

			const popupHtml = `
				<div class="popup-content">
					${buildPopupHtml(layerId, feature.properties ?? {})}
					<div class="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
						<button class="${popupButtonClass}" data-action="detail" data-layer="${layerId}" data-id="${featureId}" title="Buka detail lengkap atribut fitur">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
							Lihat di Tabel Atribut
						</button>
						<button class="${popupButtonClass}" data-action="zoom" data-layer="${layerId}" data-id="${featureId}" title="Zoom ke fitur ini">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
							Zoom
						</button>
					</div>
				</div>
			`;
			popupInstance.setLngLat(event.lngLat).setHTML(popupHtml).addTo(mapInstance);

			const element = popupInstance.getElement();
			const handlePopupClick = (popupEvent: MouseEvent) => {
				const target = popupEvent.target as HTMLElement | null;
				if (!target) {
					return;
				}
				const button = target.closest<HTMLButtonElement>('[data-action]');
				if (!button) {
					return;
				}
				const action = button.dataset.action;
				const id = button.dataset.id;
				const layer = button.dataset.layer as LayerId | undefined;
				if (!action || !id || !layer) {
					return;
				}
				if (action === 'zoom') {
					requestZoomToIds(layer, [id], 160);
				}
				if (action === 'detail') {
					setModalState({ isOpen: true, layerId: layer, featureId: id });
					popupInstance.remove();
				}
			};
			element.addEventListener('click', handlePopupClick);
			popupInstance.once('close', () => {
				element.removeEventListener('click', handlePopupClick);
			});
		};

		map.on('load', () => {
			mapReadyRef.current = true;
			ensureBasemapLayers(currentBasemapIdRef.current, {
				theme: currentThemeRef.current,
				forceReinitialize: true,
			});
		});

		const resize = () => map.resize();
		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			accessibilityCleanup.forEach((fn) => fn());
			map.off('mousemove', handleMapMouseMove);
			map.off('mouseleave', handleMapMouseLeave);
			map.removeControl(navigationControl);
			map.removeControl(basemapControl);
			map.removeControl(styleControl);
			map.removeControl(searchControl);
			popup.remove();
			map.remove();
			mapReadyRef.current = false;
			mapRef.current = null;
			popupRef.current = null;
			capturedStateRef.current = null;
		};
	}, [requestZoomToIds, setActiveLayer, setActiveTab, setHoveredFeature, setSelection, setTheme]);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current) {
			return;
		}
		syncMapWithState(mapRef.current, layersState);
	}, [layersState]);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current || !pendingZoom) {
			return;
		}
		const request = consumeZoomRequest();
		if (!request) {
			return;
		}
		const mapInstance = mapRef.current;
		if (!mapInstance) {
			return;
		}
		if (request.bounds) {
			const [minX, minY, maxX, maxY] = request.bounds;
			mapInstance.fitBounds(
				[
					[minX, minY],
					[maxX, maxY],
				],
				{
					padding: request.padding ?? 120,
					duration: 700,
				},
			);
			return;
		}
		const ids = request.featureIds ?? [];
		if (ids.length === 0) {
			return;
		}
		const features: FeatureWithProps[] = [];
		ids.forEach((id) => {
			const feature = getFeatureById(request.layerId, id);
			if (feature) {
				features.push(feature);
			}
		});
		if (features.length === 0) {
			return;
		}
		fitMapToFeatures(mapInstance, features, request.padding ?? 120);
	}, [consumeZoomRequest, getFeatureById, pendingZoom]);

	return (
		<>
			<div ref={containerRef} className='h-full w-full' />
			{showCoordinates && coords && (
				<div
					className='pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-md border px-2.5 py-1 text-[11px] font-mono tabular-nums shadow-sm backdrop-blur-sm'
					style={{
						backgroundColor: 'rgba(var(--color-panel-rgb, 255 255 255) / 0.88)',
						borderColor: 'var(--color-border, #e2e8f0)',
						color: 'var(--color-text)',
					}}
				>
					{coords.lat >= 0 ? `${coords.lat.toFixed(6)}°N` : `${Math.abs(coords.lat).toFixed(6)}°S`}&nbsp;&nbsp;
					{coords.lng >= 0 ? `${coords.lng.toFixed(6)}°E` : `${Math.abs(coords.lng).toFixed(6)}°W`}
				</div>
			)}
			{modalState.isOpen && modalState.layerId && modalState.featureId && (
				<FeatureDetailModal
					isOpen={modalState.isOpen}
					onClose={() => setModalState({ isOpen: false, layerId: null, featureId: null })}
					layerId={modalState.layerId}
					featureId={modalState.featureId}
				/>
			)}
		</>
	);
};

const syncMapWithState = (map: MapLibreMap, layers: ReturnType<typeof useLayersStore.getState>['layers']) => {
	(Object.entries(layers) as [LayerId, ReturnType<typeof useLayersStore.getState>['layers'][LayerId]][]).forEach(
		([layerId, state]) => {
			if (!state) {
				return;
			}
			const configs = mapLayerConfigs[layerId] ?? [];
			const updatedSources = new Set<string>();
			configs.forEach((config) => {
				const source = map.getSource(config.sourceId) as GeoJSONSource | undefined;
				if (source && !updatedSources.has(config.sourceId)) {
					source.setData(state.data as FeatureCollection<Geometry>);
					updatedSources.add(config.sourceId);
				}
				const isActiveKind = config.renderKind === state.renderKind;
				const baseVisibility = isActiveKind && state.visible ? 'visible' : 'none';
				const filteredVisibility =
					isActiveKind && state.visible && state.filter !== null && state.filteredIds.length > 0 ? 'visible' : 'none';
				const selectionVisibility = isActiveKind && state.visible && state.selectionIds.length > 0 ? 'visible' : 'none';
				const hoverIds =
					isActiveKind && state.hoveredId && !state.selectionIds.includes(state.hoveredId)
						? [state.hoveredId]
						: [];
				const hoverVisibility = hoverIds.length > 0 ? 'visible' : 'none';

				if (map.getLayer(config.baseLayerId)) {
					map.setLayoutProperty(config.baseLayerId, 'visibility', baseVisibility);
					const baseFilter = isActiveKind
						? (state.filterExpression as unknown as FilterSpecification)
						: (['all'] as unknown as FilterSpecification);
					map.setFilter(config.baseLayerId, baseFilter);
				}
				if (map.getLayer(config.filteredLayerId)) {
					map.setLayoutProperty(config.filteredLayerId, 'visibility', filteredVisibility);
					map.setFilter(
						config.filteredLayerId,
						buildIdMatchExpression(isActiveKind ? state.filteredIds : []) as unknown as FilterSpecification,
					);
				}
				if (map.getLayer(config.selectionLayerId)) {
					map.setLayoutProperty(config.selectionLayerId, 'visibility', selectionVisibility);
					map.setFilter(
						config.selectionLayerId,
						buildIdMatchExpression(isActiveKind ? state.selectionIds : []) as unknown as FilterSpecification,
					);
				}
				if (map.getLayer(config.hoverLayerId)) {
					map.setLayoutProperty(config.hoverLayerId, 'visibility', isActiveKind ? hoverVisibility : 'none');
					map.setFilter(
						config.hoverLayerId,
						buildIdMatchExpression(isActiveKind ? hoverIds : []) as unknown as FilterSpecification,
					);
				}
			});
		},
	);
};

const fitMapToFeatures = (map: MapLibreMap, features: FeatureWithProps[], padding: number) => {
	const collection: FeatureCollection<Geometry> = {
		type: 'FeatureCollection',
		features: features as unknown as FeatureWithProps[],
	};
	const bounds = bbox(collection) as [number, number, number, number];
	if (!bounds || bounds.some((value) => Number.isNaN(value))) {
		return;
	}
	map.fitBounds(
		[
			[bounds[0], bounds[1]],
			[bounds[2], bounds[3]],
		],
		{
			padding,
			duration: 700,
		},
	);
};

export default MapView;

