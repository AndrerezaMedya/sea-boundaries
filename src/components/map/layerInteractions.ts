import type { Map as MapLibreMap, MapLayerMouseEvent } from 'maplibre-gl';

import type { LayerId } from '@/lib/types';

interface BindLayerInteractionsDeps {
	getCurrentHoveredId: (layerId: LayerId) => string | null;
	setHoveredFeature: (layerId: LayerId, featureId: string | null) => void;
	handleFeatureClick: (layerId: LayerId, event: MapLayerMouseEvent) => void;
}

export const bindLayerInteractions = (
	map: MapLibreMap,
	layerId: LayerId,
	interactiveLayerIds: string[],
	deps: BindLayerInteractionsDeps,
) => {
	interactiveLayerIds.forEach((mapLayerId) => {
		map.on('mouseenter', mapLayerId, () => {
			map.getCanvas().style.cursor = 'pointer';
		});
		map.on('mouseleave', mapLayerId, () => {
			map.getCanvas().style.cursor = '';
			const currentHovered = deps.getCurrentHoveredId(layerId);
			if (currentHovered !== null) {
				deps.setHoveredFeature(layerId, null);
			}
		});
		map.on('mousemove', mapLayerId, (event: MapLayerMouseEvent) => {
			const feature = event.features?.[0];
			if (!feature || feature.id === undefined || feature.id === null) {
				return;
			}
			const featureId = String(feature.id);
			const currentHovered = deps.getCurrentHoveredId(layerId);
			if (currentHovered !== featureId) {
				deps.setHoveredFeature(layerId, featureId);
			}
		});
		map.on('click', mapLayerId, (event: MapLayerMouseEvent) => {
			deps.handleFeatureClick(layerId, event);
		});
	});
};
