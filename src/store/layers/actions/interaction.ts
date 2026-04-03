import type { LayerRuntimeState } from '@/store/layers/runtimeTypes';

export const setLayerSelection = (layer: LayerRuntimeState, ids: string[]): LayerRuntimeState => {
	const validIds = ids.filter((id) => layer.filteredIds.includes(id));
	return {
		...layer,
		selectionIds: validIds,
	};
};

export const setLayerHovered = (layer: LayerRuntimeState, hoveredId: string | null): LayerRuntimeState => {
	return {
		...layer,
		hoveredId,
	};
};
