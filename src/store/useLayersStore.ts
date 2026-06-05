import { create } from 'zustand';

import { createInitialLayersStoreSlice } from '@/store/layers/bootstrap';
import { createLayersStoreActions } from '@/store/layers/createStoreActions';
import type { LayersStoreState } from '@/store/layers/storeTypes';

// Temporary synchronous store with loading state
export const useLayersStore = create<LayersStoreState>((set, get) => {
	const actions = createLayersStoreActions(set, get);

	return {
		...actions,
		layers: {} as LayersStoreState['layers'],
		activeLayerId: 'eez_limit',
		tableRows: [],
		pendingZoom: null,
		uniqueValueCache: {} as LayersStoreState['uniqueValueCache'],
		userLayerMeta: { loaded: false },
		lastUserLayerUrl: '',
		initializationStatus: 'loading',
		initializationError: null,
		attributesLoading: false,
		attributeRefreshTargets: null,
	};
});

/** Initialize the store with data from the API. Call this in App.tsx or root component. */
export async function initializeLayersStore() {
	const store = useLayersStore.getState();
	try {
		store.initializationStatus = 'loading';
		store.initializationError = null;
		const initialSlice = await createInitialLayersStoreSlice();
		store.layers = initialSlice.layers;
		store.activeLayerId = initialSlice.activeLayerId;
		store.tableRows = initialSlice.tableRows;
		store.uniqueValueCache = initialSlice.uniqueValueCache;
		store.lastUserLayerUrl = initialSlice.lastUserLayerUrl;
		store.initializationStatus = 'ready';
	} catch (err) {
		store.initializationStatus = 'error';
		store.initializationError = err instanceof Error ? err.message : String(err);
		console.error('Failed to initialize layers store:', err);
	}
}
