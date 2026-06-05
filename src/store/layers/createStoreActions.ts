import type { StateCreator } from 'zustand';

import { getLayerSchema } from '@/lib/schema';
import { USER_LAYER_ID } from '@/lib/types';
import { applyFilterLifecycle, clearFilterLifecycle } from '@/store/layers/actions/filterLifecycle';
import { applyHoverLifecycle, applySelectionLifecycle } from '@/store/layers/actions/interactionLifecycle';
import { buildActiveLayerStateUpdate, buildLayerVisibilityUpdate } from '@/store/layers/actions/layerState';
import { consumePendingZoomRequest, getFeatureFromLayers } from '@/store/layers/actions/readAccess';
import { resolveUniqueValues } from '@/store/layers/actions/uniqueValueLifecycle';
import { buildRemoveUserLayerState, buildSetUserLayerState } from '@/store/layers/actions/userLayer';
import { createZoomToBoundsRequest, createZoomToIdsRequest } from '@/store/layers/actions/zoom';
import { CORE_LAYER_IDS, DEFAULT_ACTIVE_LAYER } from '@/store/layers/bootstrap';
import { EMPTY_USER_COLLECTION, UNIQUE_VALUE_LIMIT } from '@/store/layers/config';
import {
	applyUserLayerSchemaEffect,
	clearUserLayerSchemaEffect,
	persistUserLayerUrlEffect,
} from '@/store/layers/effects/userLayerEffects';
import { loadLayerCollectionForBbox } from '@/lib/dataLoader';
import { ensureDisplaySession } from '@/lib/displaySession';
import { isMvtDisplayMode } from '@/lib/mapDisplay';
import type { Bbox } from '@/lib/bbox';
import type { CoreLayerId, FeatureCollectionWithProps } from '@/lib/types';
import { buildLayerState, buildTableRows, computeBounds } from '@/store/layers/stateBuilders';
import type { LayersStoreState } from '@/store/layers/storeTypes';

type SetState = Parameters<StateCreator<LayersStoreState>>[0];
type GetState = Parameters<StateCreator<LayersStoreState>>[1];

let attributesFetchGeneration = 0;

export const createLayersStoreActions = (set: SetState, get: GetState): Omit<
	LayersStoreState,
	| 'layers'
	| 'activeLayerId'
	| 'tableRows'
	| 'pendingZoom'
	| 'uniqueValueCache'
	| 'userLayerMeta'
	| 'lastUserLayerUrl'
	| 'initializationStatus'
	| 'initializationError'
	| 'attributesLoading'
	| 'attributeRefreshTargets'
> => {
	return {
		requestAttributeRefresh: (layerIds) => {
			set({ attributeRefreshTargets: [...layerIds] });
		},
		clearAttributeRefreshTargets: () => {
			set({ attributeRefreshTargets: null });
		},
		loadInitialFilters: () => {
			// Filters have been applied during initialisation
		},
		setActiveLayer: (layerId) => {
			set((state) => {
				const updates = buildActiveLayerStateUpdate({
					layers: state.layers,
					layerId,
				});
				if (!updates) {
					return state;
				}
				return {
					...state,
					...updates,
				};
			});
		},
		setLayerVisibility: (layerId, visible) => {
			set((state) => {
				const layersUpdate = buildLayerVisibilityUpdate(state.layers, layerId, visible);
				if (!layersUpdate) {
					return state;
				}
				return {
					...state,
					layers: layersUpdate,
				};
			});
		},
		applyFilter: (layerId, definition) => {
			set((state) => {
				const updates = applyFilterLifecycle({
					state: {
						layers: state.layers,
						activeLayerId: state.activeLayerId,
						tableRows: state.tableRows,
					},
					layerId,
					definition,
					coreLayerIds: CORE_LAYER_IDS,
				});
				if (!updates) {
					return state;
				}
				return {
					...state,
					...updates,
				};
			});
		},
		clearFilter: (layerId) => {
			set((state) => {
				const updates = clearFilterLifecycle({
					state: {
						layers: state.layers,
						activeLayerId: state.activeLayerId,
						tableRows: state.tableRows,
					},
					layerId,
					coreLayerIds: CORE_LAYER_IDS,
				});
				if (!updates) {
					return state;
				}
				return {
					...state,
					...updates,
				};
			});
		},
		setSelection: (layerId, ids) => {
			set((state) => {
				const layers = applySelectionLifecycle(state.layers, layerId, ids);
				if (!layers) {
					return state;
				}
				return {
					...state,
					layers,
				};
			});
		},
		setHoveredFeature: (layerId, id) => {
			set((state) => {
				const layers = applyHoverLifecycle(state.layers, layerId, id);
				if (!layers) {
					return state;
				}
				return {
					...state,
					layers,
				};
			});
		},
		setUserLayer: ({ collection, schema, source, name, url }) => {
			const layerState = buildLayerState(USER_LAYER_ID, schema, collection, { visible: true });
			const bounds = computeBounds(collection);
			applyUserLayerSchemaEffect(schema);
			set((state) => {
				const updates = buildSetUserLayerState({
					layers: state.layers,
					uniqueValueCache: state.uniqueValueCache,
					layerState,
					source,
					name,
					url,
					bounds,
				});
				return {
					...state,
					...updates,
				};
			});
			if (url) {
				persistUserLayerUrlEffect(url);
				set({ lastUserLayerUrl: url });
			}
		},
		removeUserLayer: () => {
			clearUserLayerSchemaEffect();
			set((state) => {
				const placeholder = buildLayerState(USER_LAYER_ID, getLayerSchema(USER_LAYER_ID), EMPTY_USER_COLLECTION, {
					visible: false,
				});
				const updates = buildRemoveUserLayerState({
					layers: state.layers,
					uniqueValueCache: state.uniqueValueCache,
					activeLayerId: state.activeLayerId,
					placeholder,
					defaultActiveLayer: DEFAULT_ACTIVE_LAYER,
				});
				return {
					...state,
					...updates,
				};
			});
		},
		setLastUserLayerUrl: (url) => {
			persistUserLayerUrlEffect(url);
			set({ lastUserLayerUrl: url });
		},
		requestZoomToIds: (layerId, ids, padding) => {
			const request = createZoomToIdsRequest(layerId, ids, padding);
			if (!request) {
				return;
			}
			set({ pendingZoom: request });
		},
		requestZoomToBounds: (bounds, padding) => {
			set({
				pendingZoom: createZoomToBoundsRequest(bounds, padding),
			});
		},
		consumeZoomRequest: () => {
			const { request, nextPendingZoom } = consumePendingZoomRequest(get().pendingZoom);
			if (!request) {
				return null;
			}
			set({ pendingZoom: nextPendingZoom });
			return request;
		},
		getFeatureById: (layerId, id) => {
			return getFeatureFromLayers(get().layers, layerId, id);
		},
		getUniqueValues: (layerId, field) => {
			const state = get();
			const { values, nextUniqueValueCache } = resolveUniqueValues({
				layers: state.layers,
				uniqueValueCache: state.uniqueValueCache,
				layerId,
				field,
				limit: UNIQUE_VALUE_LIMIT,
			});
			if (nextUniqueValueCache) {
				set({ uniqueValueCache: nextUniqueValueCache });
			}
			return values;
		},
		setCoreLayerData: (layerId: CoreLayerId, collection: FeatureCollectionWithProps) => {
			set((state) => {
				const schema = getLayerSchema(layerId);
				const layerState = buildLayerState(layerId, schema, collection, {
					visible: state.layers[layerId]?.visible ?? schema.defaultVisible ?? true,
					filter: state.layers[layerId]?.filter ?? null,
				});
				const layers = {
					...state.layers,
					[layerId]: layerState,
				};
				const updates: Partial<LayersStoreState> = {
					layers,
					uniqueValueCache: { ...state.uniqueValueCache, [layerId]: {} },
				};
				if (state.activeLayerId === layerId) {
					updates.tableRows = buildTableRows(layerId, layerState);
				}
				return { ...state, ...updates };
			});
		},
		refreshActiveLayerAttributes: async (layerId, _bbox?: Bbox) => {
			if (!isMvtDisplayMode() || layerId === USER_LAYER_ID) {
				return;
			}
			const coreLayerId = layerId as CoreLayerId;
			const generation = ++attributesFetchGeneration;
			set({ attributesLoading: true });
			try {
				await ensureDisplaySession();
				const collection = await loadLayerCollectionForBbox(coreLayerId);
				if (generation !== attributesFetchGeneration) {
					return;
				}
				get().setCoreLayerData(coreLayerId, collection);
			} catch (err) {
				console.error(`Viewport attributes failed for ${layerId}:`, err);
			} finally {
				if (generation === attributesFetchGeneration) {
					set({ attributesLoading: false });
				}
			}
		},
	};
};
