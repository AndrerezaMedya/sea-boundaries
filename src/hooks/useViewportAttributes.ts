import { useEffect } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

import { isMvtDisplayMode } from '@/lib/mapDisplay';
import type { LayerId } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { useLayersStore } from '@/store/useLayersStore';

/**
 * MVT mode: load attribute table data for the active layer once per layer switch.
 * Map geometry comes from MVT tiles (not viewport-bounded GeoJSON harvest).
 */
export const useViewportAttributes = (
	map: MapLibreMap | null,
	mapReady: boolean,
	activeLayerId: LayerId,
) => {
	const refreshActiveLayerAttributes = useLayersStore((s) => s.refreshActiveLayerAttributes);

	useEffect(() => {
		if (!mapReady || !map || !isMvtDisplayMode() || activeLayerId === USER_LAYER_ID) {
			return;
		}
		void refreshActiveLayerAttributes(activeLayerId);
	}, [map, mapReady, activeLayerId, refreshActiveLayerAttributes]);
};
