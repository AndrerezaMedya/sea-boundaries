import type { FeatureCollection, Geometry } from 'geojson';
import type { FilterSpecification, GeoJSONSource, LayerSpecification, Map as MapLibreMap } from 'maplibre-gl';

import { CUSTOM_LAYER_IDS, CUSTOM_SOURCE_IDS } from '@/components/map/layerConfigs';

export interface CapturedLayerState {
	definition: LayerSpecification;
	beforeId: string | null;
}

export interface CapturedMapState {
	sources: Record<string, unknown>;
	layers: Record<string, CapturedLayerState>;
}

export const RASTER_SOURCE_PREFIX = 'basemap-src-';
export const RASTER_LAYER_PREFIX = 'basemap-';

const OVERLAY_SOURCE_PREFIXES = ['source-', 'measure-', 'user-'];

export const captureCustomLayers = (map: MapLibreMap): CapturedMapState => {
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

export const enterRasterMode = (map: MapLibreMap) => {
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

export const reapplyCustomLayers = (map: MapLibreMap, captured: CapturedMapState) => {
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
