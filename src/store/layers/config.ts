import type { FeatureCollectionWithProps } from '@/lib/types';

export const UNIQUE_VALUE_LIMIT = 200;
export const ZOOM_TO_IDS_DEFAULT_PADDING = 80;
export const ZOOM_TO_BOUNDS_DEFAULT_PADDING = 120;
export const USER_LAYER_FIT_PADDING = 160;

export const EMPTY_USER_COLLECTION: FeatureCollectionWithProps = {
	type: 'FeatureCollection',
	features: [],
};
