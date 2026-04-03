import { bbox } from '@turf/turf';

import { featureMatchesFilter, toMapLibreFilter } from '@/lib/filterExpr';
import type {
	CoreLayerId,
	FeatureCollectionWithProps,
	FeatureWithProps,
	FilterDefinition,
	GeometryType,
	LayerId,
	LayerSchema,
	MapRenderKind,
	TableRow,
} from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import type { LayerRuntimeState } from '@/store/layers/runtimeTypes';

const geometryToRenderKind = (geometry: GeometryType): MapRenderKind => {
	switch (geometry) {
		case 'Point':
		case 'MultiPoint':
			return 'circle';
		case 'Polygon':
		case 'MultiPolygon':
			return 'fill';
		default:
			return 'line';
	}
};

const buildFeatureIndex = (collection: FeatureCollectionWithProps): Record<string, FeatureWithProps> => {
	const index: Record<string, FeatureWithProps> = {};
	(collection.features as FeatureWithProps[]).forEach((feature) => {
		index[feature.id] = feature;
	});
	return index;
};

export const buildLayerState = (
	layerId: LayerId,
	schema: LayerSchema,
	collection: FeatureCollectionWithProps,
	options?: { visible?: boolean; filter?: FilterDefinition | null },
): LayerRuntimeState => {
	const featureIndex = buildFeatureIndex(collection);
	const filterDefinition = options?.filter ?? null;
	const filterExpression = filterDefinition ? toMapLibreFilter(layerId, filterDefinition) : ['all'];
	const features = collection.features as FeatureWithProps[];
	const filteredFeatures = filterDefinition
		? features.filter((feature) => featureMatchesFilter(layerId, feature, filterDefinition))
		: features;
	const filteredIds = filteredFeatures.map((feature) => feature.id);
	return {
		id: layerId,
		label: schema.label,
		visible: options?.visible ?? true,
		data: collection,
		featureIndex,
		filter: filterDefinition,
		filterExpression,
		filteredIds,
		selectionIds: [],
		hoveredId: null,
		geometryType: schema.geometryType,
		renderKind: geometryToRenderKind(schema.geometryType),
	};
};

export const buildTableRows = (layerId: LayerId, layer: LayerRuntimeState): TableRow[] => {
	return layer.filteredIds
		.map((id) => {
			const feature = layer.featureIndex[id];
			if (!feature) {
				return null;
			}
			return {
				id,
				layerId,
				properties: feature.properties ?? {},
				geometry: feature.geometry,
			};
		})
		.filter((row): row is TableRow => row !== null);
};

export const createInitialCache = (
	coreLayerIds: CoreLayerId[],
): Record<LayerId, Record<string, (string | number)[]>> => {
	const cache: Partial<Record<LayerId, Record<string, (string | number)[]>>> = {};
	coreLayerIds.forEach((id) => {
		cache[id] = {};
	});
	cache[USER_LAYER_ID] = {};
	return cache as Record<LayerId, Record<string, (string | number)[]>>;
};

export const computeBounds = (collection: FeatureCollectionWithProps): [number, number, number, number] | null => {
	if (!collection.features.length) {
		return null;
	}
	const bounds = bbox(collection as any) as [number, number, number, number];
	if (!bounds || bounds.some((value) => Number.isNaN(value))) {
		return null;
	}
	return bounds;
};
