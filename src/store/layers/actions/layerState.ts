import { buildTableRows } from '@/store/layers/stateBuilders';
import type { LayersDictionary } from '@/store/layers/runtimeTypes';
import type { LayerId } from '@/lib/types';

interface ActiveLayerStateInput {
	layers: LayersDictionary;
	layerId: LayerId;
}

export const buildActiveLayerStateUpdate = (input: ActiveLayerStateInput) => {
	const layer = input.layers[input.layerId];
	if (!layer) {
		return null;
	}
	return {
		activeLayerId: input.layerId,
		tableRows: buildTableRows(input.layerId, layer),
	};
};

export const buildLayerVisibilityUpdate = (
	layers: LayersDictionary,
	layerId: LayerId,
	visible: boolean,
): LayersDictionary | null => {
	const layer = layers[layerId];
	if (!layer) {
		return null;
	}
	return {
		...layers,
		[layerId]: {
			...layer,
			visible,
		},
	};
};
