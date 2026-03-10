import { create } from 'zustand';
import { bbox } from '@turf/turf';

import { loadLayerCollections } from '@/lib/dataLoader';
import { featureMatchesFilter, toMapLibreFilter } from '@/lib/filterExpr';
import { getFieldSchema, getLayerSchema, LAYER_SCHEMAS, setUserLayerSchema } from '@/lib/schema';
import type {
	CoreLayerId,
	FeatureCollectionWithProps,
	FeatureWithProps,
	FilterDefinition,
	FilterExpression,
	GeometryType,
	LayerId,
	LayerSchema,
	MapRenderKind,
	TableRow,
	ZoomRequest,
} from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

const LAST_FILTER_KEY = 'sea-boundaries:last-filter';
const LAST_USER_URL_KEY = 'sea-boundaries:last-user-url';
const UNIQUE_VALUE_LIMIT = 200;

const EMPTY_COLLECTION: FeatureCollectionWithProps = {
	type: 'FeatureCollection',
	features: [],
};

const CORE_LAYER_IDS = Object.keys(LAYER_SCHEMAS) as CoreLayerId[];

type LayersDictionary = Record<CoreLayerId, LayerRuntimeState> & Partial<Record<typeof USER_LAYER_ID, LayerRuntimeState>>;

type UserLayerSource = 'file' | 'url';

type SetUserLayerArgs = {
	collection: FeatureCollectionWithProps;
	schema: LayerSchema;
	source?: UserLayerSource;
	name?: string;
	url?: string;
};

interface LayerRuntimeState {
	id: LayerId;
	label: string;
	visible: boolean;
	data: FeatureCollectionWithProps;
	featureIndex: Record<string, FeatureWithProps>;
	filter: FilterDefinition | null;
	filterExpression: FilterExpression;
	filteredIds: string[];
	selectionIds: string[];
	hoveredId: string | null;
	geometryType: GeometryType;
	renderKind: MapRenderKind;
}

type PersistedFilters = Partial<Record<CoreLayerId, FilterDefinition>>;

interface UserLayerMeta {
	loaded: boolean;
	name?: string;
	source?: UserLayerSource;
	url?: string;
	featureCount?: number;
	geometryType?: GeometryType;
}

interface LayersStoreState {
	layers: LayersDictionary;
	activeLayerId: LayerId;
	tableRows: TableRow[];
	pendingZoom: ZoomRequest | null;
	uniqueValueCache: Record<LayerId, Record<string, (string | number)[]>>;
	userLayerMeta: UserLayerMeta;
	lastUserLayerUrl: string;
	loadInitialFilters: () => void;
	setActiveLayer: (layerId: LayerId) => void;
	setLayerVisibility: (layerId: LayerId, visible: boolean) => void;
	applyFilter: (layerId: LayerId, definition: FilterDefinition) => void;
	clearFilter: (layerId: LayerId) => void;
	setSelection: (layerId: LayerId, ids: string[]) => void;
	setHoveredFeature: (layerId: LayerId, id: string | null) => void;
	setUserLayer: (args: SetUserLayerArgs) => void;
	removeUserLayer: () => void;
	setLastUserLayerUrl: (url: string) => void;
	requestZoomToIds: (layerId: LayerId, ids: string[], padding?: number) => void;
	requestZoomToBounds: (bounds: [number, number, number, number], padding?: number) => void;
	consumeZoomRequest: () => ZoomRequest | null;
	getFeatureById: (layerId: LayerId, id: string) => FeatureWithProps | undefined;
	getUniqueValues: (layerId: LayerId, field: string) => (string | number)[];
}

const collections = loadLayerCollections();

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

const buildLayerState = (
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

const buildTableRows = (layerId: LayerId, layer: LayerRuntimeState): TableRow[] => {
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

const safeParseFilters = (): PersistedFilters => {
	if (typeof window === 'undefined') {
		return {};
	}
	try {
		const raw = window.localStorage.getItem(LAST_FILTER_KEY);
		if (!raw) {
			return {};
		}
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') {
			return {};
		}
		const result: PersistedFilters = {};
		CORE_LAYER_IDS.forEach((layerId) => {
			if (layerId in parsed) {
				result[layerId] = parsed[layerId];
			}
		});
		return result;
	} catch (error) {
		console.warn('Gagal memuat filter tersimpan', error);
		return {};
	}
};

const persistFilters = (filters: PersistedFilters) => {
	if (typeof window === 'undefined') {
		return;
	}
	try {
		window.localStorage.setItem(LAST_FILTER_KEY, JSON.stringify(filters));
	} catch (error) {
		console.warn('Gagal menyimpan filter', error);
	}
};

const readLastUserLayerUrl = (): string => {
	if (typeof window === 'undefined') {
		return '';
	}
	return window.localStorage.getItem(LAST_USER_URL_KEY) ?? '';
};

const writeLastUserLayerUrl = (url: string) => {
	if (typeof window === 'undefined') {
		return;
	}
	try {
		window.localStorage.setItem(LAST_USER_URL_KEY, url);
	} catch (error) {
		console.warn('Gagal menyimpan URL layer pengguna', error);
	}
};

const initialiseLayers = (persisted: PersistedFilters): LayersDictionary => {
	const next: Partial<LayersDictionary> = {};
	CORE_LAYER_IDS.forEach((layerId) => {
		const schema = LAYER_SCHEMAS[layerId];
		const collection = collections[layerId];
		const persistedFilter = persisted[layerId];
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

const createInitialCache = (): Record<LayerId, Record<string, (string | number)[]>> => {
	const cache: Partial<Record<LayerId, Record<string, (string | number)[]>>> = {};
	CORE_LAYER_IDS.forEach((id) => {
		cache[id] = {};
	});
	cache[USER_LAYER_ID] = {};
	return cache as Record<LayerId, Record<string, (string | number)[]>>;
};

const computeBounds = (collection: FeatureCollectionWithProps): [number, number, number, number] | null => {
	if (!collection.features.length) {
		return null;
	}
	const bounds = bbox(collection as any) as [number, number, number, number];
	if (!bounds || bounds.some((value) => Number.isNaN(value))) {
		return null;
	}
	return bounds;
};

const defaultActiveLayer: CoreLayerId = 'laut_teritorial_sepakat';

export const useLayersStore = create<LayersStoreState>((set, get) => {
	const persistedFilters = safeParseFilters();
	const layers = initialiseLayers(persistedFilters);
	const activeLayer = layers[defaultActiveLayer];
	const initialRows = buildTableRows(activeLayer.id, activeLayer);

	return {
		layers,
		activeLayerId: activeLayer.id,
		tableRows: initialRows,
		pendingZoom: null,
		uniqueValueCache: createInitialCache(),
		userLayerMeta: { loaded: false },
		lastUserLayerUrl: readLastUserLayerUrl(),
		loadInitialFilters: () => {
			// Filters have been applied during initialisation
		},
		setActiveLayer: (layerId) => {
			set((state) => {
				const layer = state.layers[layerId];
				if (!layer) {
					return state;
				}
				return {
					...state,
					activeLayerId: layerId,
					tableRows: buildTableRows(layerId, layer),
				};
			});
		},
		setLayerVisibility: (layerId, visible) => {
			set((state) => {
				const layer = state.layers[layerId];
				if (!layer) {
					return state;
				}
				return {
					...state,
					layers: {
						...state.layers,
						[layerId]: {
							...layer,
							visible,
						},
					},
				};
			});
		},
		applyFilter: (layerId, definition) => {
			set((state) => {
				const layer = state.layers[layerId];
				if (!layer) {
					return state;
				}
				const expression = toMapLibreFilter(layerId, definition);
				const features = layer.data.features as FeatureWithProps[];
				const filteredFeatures = features.filter((feature) => featureMatchesFilter(layerId, feature, definition));
				const filteredIds = filteredFeatures.map((feature) => feature.id);
				const updatedLayer: LayerRuntimeState = {
					...layer,
					filter: definition,
					filterExpression: expression,
					filteredIds,
					selectionIds: layer.selectionIds.filter((id) => filteredIds.includes(id)),
				};
				const updatedLayers: LayersDictionary = {
					...state.layers,
					[layerId]: updatedLayer,
				};
				const nextTableRows = state.activeLayerId === layerId ? buildTableRows(layerId, updatedLayer) : state.tableRows;
				if (layerId !== USER_LAYER_ID) {
					const persistedSnapshot = safeParseFilters();
					persistedSnapshot[layerId as CoreLayerId] = definition;
					persistFilters(persistedSnapshot);
				}
				return {
					...state,
					layers: updatedLayers,
					tableRows: nextTableRows,
				};
			});
		},
		clearFilter: (layerId) => {
			set((state) => {
				const layer = state.layers[layerId];
				if (!layer) {
					return state;
				}
				const allIds = (layer.data.features as FeatureWithProps[]).map((feature) => feature.id);
				const updatedLayer: LayerRuntimeState = {
					...layer,
					filter: null,
					filterExpression: ['all'],
					filteredIds: allIds,
					selectionIds: [],
				};
				const updatedLayers: LayersDictionary = {
					...state.layers,
					[layerId]: updatedLayer,
				};
				const nextTableRows = state.activeLayerId === layerId ? buildTableRows(layerId, updatedLayer) : state.tableRows;
				if (layerId !== USER_LAYER_ID) {
					const persistedSnapshot = safeParseFilters();
					if (layerId in persistedSnapshot) {
						delete persistedSnapshot[layerId as CoreLayerId];
						persistFilters(persistedSnapshot);
					}
				}
				return {
					...state,
					layers: updatedLayers,
					tableRows: nextTableRows,
				};
			});
		},
		setSelection: (layerId, ids) => {
			set((state) => {
				const layer = state.layers[layerId];
				if (!layer) {
					return state;
				}
				const validIds = ids.filter((id) => layer.filteredIds.includes(id));
				return {
					...state,
					layers: {
						...state.layers,
						[layerId]: {
							...layer,
							selectionIds: validIds,
						},
					},
				};
			});
		},
		setHoveredFeature: (layerId, id) => {
			set((state) => {
				const layer = state.layers[layerId];
				if (!layer) {
					return state;
				}
				return {
					...state,
					layers: {
						...state.layers,
						[layerId]: {
							...layer,
							hoveredId: id,
						},
					},
				};
			});
		},
		setUserLayer: ({ collection, schema, source, name, url }) => {
			const layerState = buildLayerState(USER_LAYER_ID, schema, collection, { visible: true });
			const bounds = computeBounds(collection);
			setUserLayerSchema(schema);
			set((state) => {
				const nextLayers: LayersDictionary = {
					...state.layers,
					[USER_LAYER_ID]: layerState,
				};
				const nextCache = {
					...state.uniqueValueCache,
					[USER_LAYER_ID]: {},
				};
				const updates: Partial<LayersStoreState> = {
					layers: nextLayers,
					activeLayerId: USER_LAYER_ID,
					tableRows: buildTableRows(USER_LAYER_ID, layerState),
					uniqueValueCache: nextCache,
					userLayerMeta: {
						loaded: true,
						name,
						source,
						url,
						featureCount: layerState.filteredIds.length,
						geometryType: layerState.geometryType,
					},
				};
				if (bounds) {
					updates.pendingZoom = {
						layerId: USER_LAYER_ID,
						bounds,
						padding: 160,
						timestamp: Date.now(),
					};
				}
				return {
					...state,
					...updates,
				};
			});
			if (url) {
				writeLastUserLayerUrl(url);
				set({ lastUserLayerUrl: url });
			}
		},
		removeUserLayer: () => {
			setUserLayerSchema(undefined);
			set((state) => {
				const placeholder = buildLayerState(USER_LAYER_ID, getLayerSchema(USER_LAYER_ID), EMPTY_COLLECTION, {
					visible: false,
				});
				const nextLayers: LayersDictionary = {
					...state.layers,
					[USER_LAYER_ID]: placeholder,
				};
				const nextActive = state.activeLayerId === USER_LAYER_ID ? defaultActiveLayer : state.activeLayerId;
				const activeLayer = nextLayers[nextActive]!;
				return {
					...state,
					layers: nextLayers,
					activeLayerId: nextActive,
					tableRows: buildTableRows(nextActive, activeLayer),
					uniqueValueCache: {
						...state.uniqueValueCache,
						[USER_LAYER_ID]: {},
					},
					userLayerMeta: { loaded: false },
				};
			});
		},
		setLastUserLayerUrl: (url) => {
			writeLastUserLayerUrl(url);
			set({ lastUserLayerUrl: url });
		},
		requestZoomToIds: (layerId, ids, padding = 80) => {
			if (ids.length === 0) {
				return;
			}
			const request: ZoomRequest = {
				layerId,
				featureIds: ids,
				padding,
				timestamp: Date.now(),
			};
			set({ pendingZoom: request });
		},
		requestZoomToBounds: (bounds, padding = 120) => {
			set({
				pendingZoom: {
					layerId: USER_LAYER_ID,
					bounds,
					padding,
					timestamp: Date.now(),
				},
			});
		},
		consumeZoomRequest: () => {
			const request = get().pendingZoom;
			if (!request) {
				return null;
			}
			set({ pendingZoom: null });
			return request;
		},
		getFeatureById: (layerId, id) => {
			const layer = get().layers[layerId];
			return layer?.featureIndex[id];
		},
		getUniqueValues: (layerId, field) => {
			const state = get();
			const cache = state.uniqueValueCache[layerId] ?? {};
			const cached = cache[field];
			if (cached) {
				return cached;
			}
			const layer = state.layers[layerId];
			if (!layer) {
				return [];
			}
			const schemaField = getFieldSchema(layerId, field);
			if (!schemaField) {
				return [];
			}
			const seen = new Set<string>();
			const values: (string | number)[] = [];
			for (const feature of layer.data.features) {
				const value = feature.properties?.[field];
				if (value === undefined || value === null) {
					continue;
				}
				const key = typeof value === 'number' ? value.toString() : String(value);
				if (seen.has(key)) {
					continue;
				}
				seen.add(key);
				if (schemaField.type === 'number') {
					const numeric = typeof value === 'number' ? value : Number(value);
					if (!Number.isNaN(numeric)) {
						values.push(numeric);
					}
				} else {
					values.push(String(value));
				}
				if (values.length >= UNIQUE_VALUE_LIMIT) {
					break;
				}
			}
			set((current) => ({
				uniqueValueCache: {
					...current.uniqueValueCache,
					[layerId]: {
						...current.uniqueValueCache[layerId],
						[field]: values,
					},
				},
			}));
			return values;
		},
	};
});
