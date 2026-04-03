import type { Map as MapLibreMap, LayerSpecification } from 'maplibre-gl';

import { EMPTY_GEOJSON } from '@/lib/map';
import { buildIdMatchExpression } from '@/lib/filterExpr';
import { mapLayerConfigs } from '@/components/map/layerConfigs';
import type { LayerId } from '@/lib/types';

type LayerConfig = (typeof mapLayerConfigs)[LayerId][number];

export const ensureMapLayerStack = (map: MapLibreMap, config: LayerConfig) => {
	if (!map.getSource(config.sourceId)) {
		map.addSource(config.sourceId, {
			type: 'geojson',
			data: EMPTY_GEOJSON,
		});
	}

	const baseLayer: LayerSpecification = {
		id: config.baseLayerId,
		type: config.type,
		source: config.sourceId,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.base,
	};
	if (!map.getLayer(config.baseLayerId)) {
		map.addLayer(baseLayer);
	}

	const filteredLayer: LayerSpecification = {
		id: config.filteredLayerId,
		type: config.type,
		source: config.sourceId,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.filtered,
		filter: buildIdMatchExpression([]) as any,
	};
	if (!map.getLayer(config.filteredLayerId)) {
		map.addLayer(filteredLayer);
	}

	const selectionLayer: LayerSpecification = {
		id: config.selectionLayerId,
		type: config.type,
		source: config.sourceId,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.selection,
		filter: buildIdMatchExpression([]) as any,
	};
	if (!map.getLayer(config.selectionLayerId)) {
		map.addLayer(selectionLayer);
	}

	const hoverLayer: LayerSpecification = {
		id: config.hoverLayerId,
		type: config.type,
		source: config.sourceId,
		layout: { visibility: 'none', ...(config.layout ?? {}) },
		paint: config.paint.hover,
		filter: buildIdMatchExpression([]) as any,
	};
	if (!map.getLayer(config.hoverLayerId)) {
		map.addLayer(hoverLayer);
	}
};
