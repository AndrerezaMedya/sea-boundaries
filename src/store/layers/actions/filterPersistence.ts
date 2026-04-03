import type { CoreLayerId, FilterDefinition } from '@/lib/types';
import { persistFilters, safeParseFilters } from '@/store/layers/persistence';

export const persistLayerFilter = (
	layerId: CoreLayerId,
	definition: FilterDefinition,
	coreLayerIds: CoreLayerId[],
) => {
	const persistedSnapshot = safeParseFilters(coreLayerIds);
	persistedSnapshot[layerId] = definition;
	persistFilters(persistedSnapshot);
};

export const clearPersistedLayerFilter = (layerId: CoreLayerId, coreLayerIds: CoreLayerId[]) => {
	const persistedSnapshot = safeParseFilters(coreLayerIds);
	if (!(layerId in persistedSnapshot)) {
		return;
	}
	delete persistedSnapshot[layerId];
	persistFilters(persistedSnapshot);
};
