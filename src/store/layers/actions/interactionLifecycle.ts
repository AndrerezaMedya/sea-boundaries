import type { LayerId } from '@/lib/types';
import { setLayerHovered, setLayerSelection } from '@/store/layers/actions/interaction';
import type { LayersDictionary } from '@/store/layers/runtimeTypes';

export const applySelectionLifecycle = (
	layers: LayersDictionary,
	layerId: LayerId,
	ids: string[],
): LayersDictionary | null => {
	const layer = layers[layerId];
	if (!layer) {
		return null;
	}
	const updatedLayer = setLayerSelection(layer, ids);
	return {
		...layers,
		[layerId]: updatedLayer,
	};
};

export const applyHoverLifecycle = (
	layers: LayersDictionary,
	layerId: LayerId,
	hoveredId: string | null,
): LayersDictionary | null => {
	const layer = layers[layerId];
	if (!layer) {
		return null;
	}
	const updatedLayer = setLayerHovered(layer, hoveredId);
	return {
		...layers,
		[layerId]: updatedLayer,
	};
};
