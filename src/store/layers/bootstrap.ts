import { loadLayerCollections } from '@/lib/dataLoader';
import { expandBbox, INDONESIA_BBOX } from '@/lib/bbox';
import { isMvtDisplayMode } from '@/lib/mapDisplay';
import { ensureDisplaySession } from '@/lib/displaySession';
import { getLayerSchema, LAYER_SCHEMAS } from '@/lib/schema';
import type {
	CoreLayerId,
	FeatureCollectionWithProps,
	LayerId,
	TableRow,
} from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { readLastUserLayerUrl, safeParseFilters } from '@/store/layers/persistence';
import type { LayersDictionary } from '@/store/layers/runtimeTypes';
import { buildLayerState, buildTableRows, createInitialCache } from '@/store/layers/stateBuilders';

const EMPTY_COLLECTION: FeatureCollectionWithProps = {
	type: 'FeatureCollection',
	features: [],
};

export const CORE_LAYER_IDS = Object.keys(LAYER_SCHEMAS) as CoreLayerId[];
export const DEFAULT_ACTIVE_LAYER: CoreLayerId = 'eez_limit';

const initialiseLayers = async (collections: Record<CoreLayerId, FeatureCollectionWithProps>): Promise<LayersDictionary> => {
	const persistedFilters = safeParseFilters(CORE_LAYER_IDS);
	const next: Partial<LayersDictionary> = {};
	CORE_LAYER_IDS.forEach((layerId) => {
		const schema = LAYER_SCHEMAS[layerId];
		const collection = collections[layerId];
		const persistedFilter = persistedFilters[layerId];
		next[layerId] = buildLayerState(layerId, schema, collection, {
			visible: schema.defaultVisible ?? true,
			filter: persistedFilter ?? null,
		});
	});
	next[USER_LAYER_ID] = buildLayerState(USER_LAYER_ID, getLayerSchema(USER_LAYER_ID), EMPTY_COLLECTION, {
		visible: false,
	});
	return next as LayersDictionary;
};

export interface InitialLayersStoreSlice {
	layers: LayersDictionary;
	activeLayerId: LayerId;
	tableRows: TableRow[];
	uniqueValueCache: Record<LayerId, Record<string, (string | number)[]>>;
	lastUserLayerUrl: string;
}

export const createInitialLayersStoreSlice = async (): Promise<InitialLayersStoreSlice> => {
	if (isMvtDisplayMode()) {
		await ensureDisplaySession();
	}
	let collections: Record<CoreLayerId, FeatureCollectionWithProps>;
	if (isMvtDisplayMode()) {
		collections = {} as Record<CoreLayerId, FeatureCollectionWithProps>;
		CORE_LAYER_IDS.forEach((id) => {
			collections[id] = EMPTY_COLLECTION;
		});
	} else {
		const bbox = expandBbox(INDONESIA_BBOX);
		collections = await loadLayerCollections(bbox);
	}
	const layers = await initialiseLayers(collections);
	const activeLayerId = DEFAULT_ACTIVE_LAYER;
	const activeLayer = layers[activeLayerId];
	return {
		layers,
		activeLayerId,
		tableRows: buildTableRows(activeLayerId, activeLayer),
		uniqueValueCache: createInitialCache(CORE_LAYER_IDS),
		lastUserLayerUrl: readLastUserLayerUrl(),
	};
};
