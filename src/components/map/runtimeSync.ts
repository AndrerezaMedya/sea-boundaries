import { bbox } from '@turf/turf';
import type { FeatureCollection, Geometry } from 'geojson';
import type { FilterSpecification, GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { mapLayerConfigs } from '@/components/map/layerConfigs';
import {
	buildMvtDisplayFilter,
	isVectorSourceId,
	resolveMapSourceId,
	usesVectorDisplaySource,
} from '@/components/map/sourceBootstrap';
import { getStatusFilterTiers, toMapLibreFilter, buildIdMatchExpression } from '@/lib/filterExpr';
import { isMvtDisplayMode } from '@/lib/mapDisplay';
import { statusTierFilter, statusTiersUnionFilter } from '@/lib/statusSymbology';
import type { CoreLayerId } from '@/lib/types';
import type { FeatureWithProps, LayerId } from '@/lib/types';
import { useLayersStore } from '@/store/useLayersStore';
import type { SymbologyMode } from '@/store/useUI';

const combineFilters = (...parts: (FilterSpecification | null | undefined)[]): FilterSpecification => {
	const active = parts.filter(Boolean) as FilterSpecification[];
	if (active.length === 0) return ['all'] as FilterSpecification;
	if (active.length === 1) return active[0];
	return ['all', ...active] as FilterSpecification;
};

const buildAttributeMapFilter = (
	layerId: LayerId,
	state: NonNullable<ReturnType<typeof useLayersStore.getState>['layers'][LayerId]>,
): FilterSpecification => {
	// Keep exact status (and other attribute) conditions on the map — do not replace
	// status `in` filters with symbology tier only (e.g. Terminated → solid tier would show Agreement too).
	let attrFilter: FilterSpecification = ['all'];
	if (state.filter && state.filter.conditions.length > 0) {
		attrFilter = toMapLibreFilter(layerId, state.filter) as unknown as FilterSpecification;
	}

	if (isMvtDisplayMode() && usesVectorDisplaySource(layerId)) {
		const keyFilter = buildMvtDisplayFilter(layerId as CoreLayerId);
		attrFilter =
			state.filter && state.filter.conditions.length > 0
				? (['all', keyFilter, attrFilter] as FilterSpecification)
				: keyFilter;
	}

	return attrFilter;
};

const buildSymbologyMapFilter = (
	config: (typeof mapLayerConfigs)[LayerId][number],
	statusTiers: ReturnType<typeof getStatusFilterTiers>,
): FilterSpecification | null => {
	if (config.statusTier) {
		return statusTierFilter(config.statusTier);
	}
	if (config.ihoOnly && statusTiers) {
		return statusTiersUnionFilter(statusTiers);
	}
	return null;
};

export const syncMapWithState = (
	map: MapLibreMap,
	layers: ReturnType<typeof useLayersStore.getState>['layers'],
	symbologyMode: SymbologyMode = 'iho',
) => {
	const hideIhoDecor = symbologyMode === 'easyRead';

	(Object.entries(layers) as [LayerId, ReturnType<typeof useLayersStore.getState>['layers'][LayerId]][]).forEach(
		([layerId, state]) => {
			if (!state) {
				return;
			}
			const configs = mapLayerConfigs[layerId] ?? [];
			const statusTiers = getStatusFilterTiers(state.filter);
			const updatedSources = new Set<string>();

			configs.forEach((config) => {
				const srcId = resolveMapSourceId(layerId, config.sourceId);
				if (!updatedSources.has(srcId) && !isVectorSourceId(srcId)) {
					const source = map.getSource(srcId) as GeoJSONSource | undefined;
					if (source && 'setData' in source) {
						source.setData(state.data as FeatureCollection<Geometry>);
					}
					updatedSources.add(srcId);
				}

				const isActiveKind = config.renderKind === state.renderKind;
				const tierAllowed =
					!config.statusTier || !statusTiers || statusTiers.has(config.statusTier);
				const showLayer =
					isActiveKind && state.visible && !(hideIhoDecor && config.ihoOnly) && tierAllowed;
				const baseVisibility = showLayer ? 'visible' : 'none';

				if (map.getLayer(config.baseLayerId)) {
					map.setLayoutProperty(config.baseLayerId, 'visibility', baseVisibility);
					if (isActiveKind) {
						const attrFilter = buildAttributeMapFilter(layerId, state);
						const symbologyFilter = buildSymbologyMapFilter(config, statusTiers);
						map.setFilter(config.baseLayerId, combineFilters(config.filter, attrFilter, symbologyFilter));
					} else {
						map.setFilter(config.baseLayerId, ['all'] as FilterSpecification);
					}
				}

				if (map.getLayer(config.filteredLayerId)) {
					map.setLayoutProperty(config.filteredLayerId, 'visibility', 'none');
					map.setFilter(
						config.filteredLayerId,
						buildIdMatchExpression(isActiveKind ? state.filteredIds : []) as unknown as FilterSpecification,
					);
				}
				if (map.getLayer(config.selectionLayerId)) {
					map.setLayoutProperty(config.selectionLayerId, 'visibility', 'none');
					map.setFilter(
						config.selectionLayerId,
						buildIdMatchExpression(isActiveKind ? state.selectionIds : []) as unknown as FilterSpecification,
					);
				}
				if (map.getLayer(config.hoverLayerId)) {
					map.setLayoutProperty(config.hoverLayerId, 'visibility', 'none');
				}
			});
		},
	);
};

export const fitMapToFeatures = (map: MapLibreMap, features: FeatureWithProps[], padding: number) => {
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
