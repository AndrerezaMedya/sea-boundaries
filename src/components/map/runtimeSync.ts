import { bbox } from '@turf/turf';
import type { FeatureCollection, Geometry } from 'geojson';
import type { FilterSpecification, GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { mapLayerConfigs } from '@/components/map/layerConfigs';
import { buildIdMatchExpression } from '@/lib/filterExpr';
import type { FeatureWithProps, LayerId } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';

export const syncMapWithState = (map: MapLibreMap, layers: ReturnType<typeof useLayersStore.getState>['layers']) => {
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
