import { isMvtDisplayMode } from '@/lib/mapDisplay';
import type { LayerRuntimeState } from '@/store/layers/runtimeTypes';

export const setLayerSelection = (layer: LayerRuntimeState, ids: string[]): LayerRuntimeState => {
	const trimmed = ids.map((id) => id.trim()).filter(Boolean);
	// MVT: geometry from tiles — featureIndex/filteredIds often empty; keep map click ids.
	const validIds = isMvtDisplayMode()
		? trimmed
		: trimmed.filter((id) => layer.filteredIds.includes(id));
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
