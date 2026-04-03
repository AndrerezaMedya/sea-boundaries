import { create } from 'zustand';

import { createInitialLayersStoreSlice } from '@/store/layers/bootstrap';
import { createLayersStoreActions } from '@/store/layers/createStoreActions';
import type { LayersStoreState } from '@/store/layers/storeTypes';

export const useLayersStore = create<LayersStoreState>((set, get) => {
	const initialSlice = createInitialLayersStoreSlice();
	const actions = createLayersStoreActions(set, get);

	return {
		layers: initialSlice.layers,
		activeLayerId: initialSlice.activeLayerId,
		tableRows: initialSlice.tableRows,
		pendingZoom: null,
		uniqueValueCache: initialSlice.uniqueValueCache,
		userLayerMeta: { loaded: false },
		lastUserLayerUrl: initialSlice.lastUserLayerUrl,
		...actions,
	};
});
