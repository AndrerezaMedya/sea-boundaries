import type { FeatureWithProps, LayerId, ZoomRequest } from '@/lib/types';
import type { LayersDictionary } from '@/store/layers/runtimeTypes';

export const getFeatureFromLayers = (
	layers: LayersDictionary,
	layerId: LayerId,
	id: string,
): FeatureWithProps | undefined => {
	return layers[layerId]?.featureIndex[id];
};

export const consumePendingZoomRequest = (
	pendingZoom: ZoomRequest | null,
): { request: ZoomRequest | null; nextPendingZoom: ZoomRequest | null } => {
	if (!pendingZoom) {
		return {
			request: null,
			nextPendingZoom: null,
		};
	}
	return {
		request: pendingZoom,
		nextPendingZoom: null,
	};
};
