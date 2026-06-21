import type { FilterSpecification, Map as MapLibreMap, LayerSpecification } from 'maplibre-gl';

import { EMPTY_GEOJSON } from '@/lib/map';
import { buildIdMatchExpression } from '@/lib/filterExpr';
import { mapLayerConfigs } from '@/components/map/layerConfigs';
import { getAgreementKindForLayer } from '@/lib/agreementPointKind';
import {
	getMvtLayerKey,
	getMvtSourceId,
	getTileUrlTemplate,
	isMvtDisplayMode,
	MVT_SOURCE_LAYER,
	MVT_TILESETS,
	type MvtTileset,
} from '@/lib/mapDisplay';
import type { CoreLayerId, LayerId } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

type LayerConfig = (typeof mapLayerConfigs)[LayerId][number];

const addedVectorSources = new Set<string>();

export const usesVectorDisplaySource = (layerId: LayerId): boolean =>
	isMvtDisplayMode() && layerId !== USER_LAYER_ID;

export const buildMvtLayerKeyFilter = (layerId: CoreLayerId): FilterSpecification =>
	['==', ['get', 'layer_id'], getMvtLayerKey(layerId)] as FilterSpecification;

/** Per-layer MVT filter; titik perjanjian accepts legacy tiles (boundary_point + agreement_kind). */
export const buildMvtDisplayFilter = (layerId: CoreLayerId): FilterSpecification => {
	const layerKey = getMvtLayerKey(layerId);
	const agreementKind = getAgreementKindForLayer(layerId);
	if (agreementKind) {
		return [
			'any',
			['==', ['get', 'layer_id'], layerKey],
			[
				'all',
				['==', ['get', 'layer_id'], 'boundary_point'],
				['==', ['get', 'agreement_kind'], agreementKind],
			],
		] as FilterSpecification;
	}
	return buildMvtLayerKeyFilter(layerId);
};

export const ensureCombinedMvtSources = (map: MapLibreMap) => {
	if (!isMvtDisplayMode()) return;
	MVT_TILESETS.forEach((tileset: MvtTileset) => {
		const sourceId = `source-mvt-${tileset}`;
		if (map.getSource(sourceId)) return;
		map.addSource(sourceId, {
			type: 'vector',
			tiles: [getTileUrlTemplate(tileset)],
			promoteId: '_rowId',
		});
		addedVectorSources.add(sourceId);
	});
};

export const ensureMapLayerStack = (map: MapLibreMap, layerId: LayerId, config: LayerConfig) => {
	const vectorMode = usesVectorDisplaySource(layerId);
	const effectiveSourceId = vectorMode ? getMvtSourceId(layerId) : config.sourceId;

	if (!map.getSource(effectiveSourceId)) {
		if (vectorMode) {
			ensureCombinedMvtSources(map);
		} else {
			map.addSource(effectiveSourceId, {
				type: 'geojson',
				data: EMPTY_GEOJSON,
			});
		}
	}

	const sourceLayerProps = vectorMode ? { 'source-layer': MVT_SOURCE_LAYER } : {};
	const layerKeyFilter = vectorMode ? buildMvtDisplayFilter(layerId as CoreLayerId) : null;

	const withKeyFilter = (extra?: FilterSpecification): FilterSpecification | undefined => {
		if (!layerKeyFilter) return extra;
		if (!extra || (Array.isArray(extra) && extra[0] === 'all' && extra.length === 1)) {
			return layerKeyFilter;
		}
		return ['all', layerKeyFilter, extra] as FilterSpecification;
	};

	const baseLayer: LayerSpecification = {
		id: config.baseLayerId,
		type: config.type,
		source: effectiveSourceId,
		...sourceLayerProps,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.base,
		filter: withKeyFilter(config.filter ?? ['all']),
		...(config.minzoom !== undefined ? { minzoom: config.minzoom } : {}),
		...(config.maxzoom !== undefined ? { maxzoom: config.maxzoom } : {}),
	};
	if (!map.getLayer(config.baseLayerId)) {
		map.addLayer(baseLayer);
	}

	const filteredLayer: LayerSpecification = {
		id: config.filteredLayerId,
		type: config.type,
		source: effectiveSourceId,
		...sourceLayerProps,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.filtered,
		filter: withKeyFilter(buildIdMatchExpression([]) as unknown as FilterSpecification),
		...(config.minzoom !== undefined ? { minzoom: config.minzoom } : {}),
		...(config.maxzoom !== undefined ? { maxzoom: config.maxzoom } : {}),
	};
	if (!map.getLayer(config.filteredLayerId)) {
		map.addLayer(filteredLayer);
	}

	const selectionLayer: LayerSpecification = {
		id: config.selectionLayerId,
		type: config.type,
		source: effectiveSourceId,
		...sourceLayerProps,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.selection,
		filter: withKeyFilter(buildIdMatchExpression([]) as unknown as FilterSpecification),
		...(config.minzoom !== undefined ? { minzoom: config.minzoom } : {}),
		...(config.maxzoom !== undefined ? { maxzoom: config.maxzoom } : {}),
	};
	if (!map.getLayer(config.selectionLayerId)) {
		map.addLayer(selectionLayer);
	}

	const hoverLayer: LayerSpecification = {
		id: config.hoverLayerId,
		type: config.type,
		source: effectiveSourceId,
		...sourceLayerProps,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.hover,
		filter: withKeyFilter(buildIdMatchExpression([]) as unknown as FilterSpecification),
		...(config.minzoom !== undefined ? { minzoom: config.minzoom } : {}),
		...(config.maxzoom !== undefined ? { maxzoom: config.maxzoom } : {}),
	};
	if (!map.getLayer(config.hoverLayerId)) {
		map.addLayer(hoverLayer);
	}
};

export const isVectorSourceId = (sourceId: string): boolean => addedVectorSources.has(sourceId);

export const resolveMapSourceId = (layerId: LayerId, configSourceId: string): string =>
	usesVectorDisplaySource(layerId) ? getMvtSourceId(layerId) : configSourceId;
