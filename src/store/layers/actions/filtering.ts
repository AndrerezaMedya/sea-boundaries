import { featureMatchesFilter, toMapLibreFilter } from '@/lib/filterExpr';
import type { FeatureWithProps, FilterDefinition, FilterExpression, LayerId } from '@/lib/types';
import type { LayerRuntimeState } from '@/store/layers/runtimeTypes';

export const applyFilterToLayer = (
	layerId: LayerId,
	layer: LayerRuntimeState,
	definition: FilterDefinition,
): LayerRuntimeState => {
	const expression = toMapLibreFilter(layerId, definition);
	const features = layer.data.features as FeatureWithProps[];
	const filteredFeatures = features.filter((feature) => featureMatchesFilter(layerId, feature, definition));
	const filteredIds = filteredFeatures.map((feature) => feature.id);
	return {
		...layer,
		filter: definition,
		filterExpression: expression,
		filteredIds,
		selectionIds: layer.selectionIds.filter((id) => filteredIds.includes(id)),
	};
};

export const clearFilterOnLayer = (layer: LayerRuntimeState): LayerRuntimeState => {
	const allIds = (layer.data.features as FeatureWithProps[]).map((feature) => feature.id);
	return {
		...layer,
		filter: null,
		filterExpression: ['all'] as FilterExpression,
		filteredIds: allIds,
		selectionIds: layer.selectionIds,
	};
};
