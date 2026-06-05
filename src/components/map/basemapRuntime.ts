import type { MapLibreBasemapsControlOptions } from 'maplibre-gl-basemaps';
import type { Map as MapLibreMap, LayerSpecification, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';

import {
	BASEMAPS_BY_THEME,
	getBasemapIdsForTheme,
	type BasemapDefinition,
	type BasemapTheme,
} from '@/data/basemaps';
import { RASTER_LAYER_PREFIX, RASTER_SOURCE_PREFIX } from '@/components/map/styleState';

type RasterBasemapDefinition = Extract<BasemapDefinition, { kind: 'raster' }>;
const INITIAL_BASEMAP_ID = 'default-basemap';

export type BasemapsControlOptionsWithCompact = MapLibreBasemapsControlOptions & { compact?: boolean };

export const createBasemapDefinitionMap = () => {
	const basemapDefinitionMap = new Map<string, BasemapDefinition>();
	Object.values(BASEMAPS_BY_THEME).forEach((entries) => {
		Object.entries(entries).forEach(([id, definition]) => {
			if (!basemapDefinitionMap.has(id)) {
				basemapDefinitionMap.set(id, definition);
			}
		});
	});
	return basemapDefinitionMap;
};

export const createBasemapIdsByTheme = (): Record<BasemapTheme, Set<string>> => ({
	light: new Set(getBasemapIdsForTheme('light')),
});

export const buildBasemapControlOptions = (
	definitions: BasemapDefinition[],
	initialBasemapId: string,
): BasemapsControlOptionsWithCompact => {
	return {
		basemaps: definitions.map((definition) => {
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
		initialBasemap: initialBasemapId,
		expandDirection: 'down',
		compact: false,
	};
};

export const purgeRasterBasemapArtifacts = (map: MapLibreMap, rasterBasemapIdSet: Set<string>) => {
	const style = map.getStyle();
	if (!style) {
		return;
	}
	const existingLayers = [...(style.layers ?? [])];
	existingLayers.forEach((layer) => {
		const layerSourceId = typeof (layer as { source?: unknown }).source === 'string'
			? ((layer as { source?: string }).source ?? '')
			: '';
		const shouldRemove =
			layer.type === 'raster' && (
				layer.id === INITIAL_BASEMAP_ID ||
				layer.id.startsWith(RASTER_LAYER_PREFIX) ||
				rasterBasemapIdSet.has(layer.id) ||
				layerSourceId === INITIAL_BASEMAP_ID ||
				layerSourceId.startsWith(RASTER_SOURCE_PREFIX) ||
				rasterBasemapIdSet.has(layerSourceId)
			);
		if (shouldRemove) {
			try {
				map.removeLayer(layer.id);
			} catch (error) {
				console.warn(`Tidak dapat menghapus layer raster ${layer.id}`, error);
			}
		}
	});

	const layersAfterRemoval = map.getStyle()?.layers ?? [];
	const sourceIdsStillInUse = new Set(
		layersAfterRemoval
			.map((layer) => (layer as { source?: unknown }).source)
			.filter((sourceId): sourceId is string => typeof sourceId === 'string'),
	);

	const existingSources = Object.keys(map.getStyle()?.sources ?? {});
	existingSources.forEach((sourceId) => {
		const shouldRemove =
			sourceId === INITIAL_BASEMAP_ID ||
			sourceId.startsWith(RASTER_SOURCE_PREFIX) ||
			rasterBasemapIdSet.has(sourceId);
		if (shouldRemove && !sourceIdsStillInUse.has(sourceId)) {
			try {
				map.removeSource(sourceId);
			} catch (error) {
				console.warn(`Tidak dapat menghapus source raster ${sourceId}`, error);
			}
		}
	});
};

export const ensureRasterBasemapLayers = (
	map: MapLibreMap,
	activeId: string,
	rasterBasemapDefinitions: RasterBasemapDefinition[],
) => {
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
			ensureRasterBasemapLayers(map, activeId, rasterBasemapDefinitions);
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

export const updateBasemapThumbnailState = (
	basemapContainer: HTMLElement | undefined,
	activeId: string,
	theme: BasemapTheme,
	basemapIdsByTheme: Record<BasemapTheme, Set<string>>,
) => {
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
