import type { Map as MapLibreMap, MapLayerMouseEvent } from 'maplibre-gl';

import type { LayerId } from '@/lib/types';

interface BindLayerInteractionsDeps {
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
		});
		map.on('click', mapLayerId, (event: MapLayerMouseEvent) => {
			deps.handleFeatureClick(layerId, event);
		});
	});
};
