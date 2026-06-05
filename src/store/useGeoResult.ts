import type { FeatureCollection, Geometry } from 'geojson';
import { create } from 'zustand';

interface GeoResultState {
	collection: FeatureCollection<Geometry, Record<string, unknown>> | null;
	visible: boolean;
	setCollection: (collection: FeatureCollection<Geometry, Record<string, unknown>> | null) => void;
	setVisible: (visible: boolean) => void;
	clear: () => void;
}

export const useGeoResultStore = create<GeoResultState>((set) => ({
	collection: null,
	visible: true,
	setCollection: (collection) => set({ collection, visible: true }),
	setVisible: (visible) => set({ visible }),
	clear: () => set({ collection: null, visible: true }),
}));
