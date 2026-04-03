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
import { buildLayerState, computeBounds } from '@/store/layers/stateBuilders';
import type { LayersStoreState } from '@/store/layers/storeTypes';

type SetState = Parameters<StateCreator<LayersStoreState>>[0];
type GetState = Parameters<StateCreator<LayersStoreState>>[1];

export const createLayersStoreActions = (set: SetState, get: GetState): Omit<
	LayersStoreState,
	'layers' | 'activeLayerId' | 'tableRows' | 'pendingZoom' | 'uniqueValueCache' | 'userLayerMeta' | 'lastUserLayerUrl'
> => {
	return {
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
	};
};
