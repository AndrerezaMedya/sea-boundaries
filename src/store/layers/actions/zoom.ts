import type { LayerId, ZoomRequest } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { ZOOM_TO_BOUNDS_DEFAULT_PADDING, ZOOM_TO_IDS_DEFAULT_PADDING } from '@/store/layers/config';

export const createZoomToIdsRequest = (
	layerId: LayerId,
	ids: string[],
	padding = ZOOM_TO_IDS_DEFAULT_PADDING,
): ZoomRequest | null => {
	if (ids.length === 0) {
		return null;
	}
	return {
		layerId,
		featureIds: ids,
		padding,
		timestamp: Date.now(),
	};
};

export const createZoomToBoundsRequest = (
	bounds: [number, number, number, number],
	padding = ZOOM_TO_BOUNDS_DEFAULT_PADDING,
): ZoomRequest => {
	return {
		layerId: USER_LAYER_ID,
		bounds,
		padding,
		timestamp: Date.now(),
	};
};
