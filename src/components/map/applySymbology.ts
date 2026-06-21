import type { Map as MapLibreMap } from 'maplibre-gl';

import { mapLayerConfigs } from '@/components/map/layerConfigs';
import {
	EASY_READ_COLORS,
	EASY_READ_LINE_LAYER_IDS,
	EASY_READ_WIDTH,
	IHO_BOUNDARY_COLOR,
	IHO_BOUNDARY_TEXT_COLOR,
	type EasyReadLineLayerId,
} from '@/components/map/ihoSymbology';
import type { SymbologyMode } from '@/store/useUI';

const BOUNDARY_LAYER_IDS = [...EASY_READ_LINE_LAYER_IDS] as const;

function applyLinePaint(
	map: MapLibreMap,
	targetLayerId: string,
	lineColor: string,
	lineWidth: number,
) {
	if (!map.getLayer(targetLayerId)) return;
	try {
		map.setPaintProperty(targetLayerId, 'line-color', lineColor);
		map.setPaintProperty(targetLayerId, 'line-width', lineWidth);
	} catch (error) {
		console.warn(`applySymbologyMode: error updating ${targetLayerId}`, error);
	}
}

/**
 * Apply symbology mode: Easy-Read colors vs IHO purple; status dash is per-tier map layer + filter.
 * IHO decorations (+, labels, fishery icon) visibility is handled in syncMapWithState.
 */
export const applySymbologyMode = (map: MapLibreMap, mode: SymbologyMode) => {
	for (const layerId of BOUNDARY_LAYER_IDS) {
		const configs = mapLayerConfigs[layerId] ?? [];
		const easyColor = EASY_READ_COLORS[layerId as EasyReadLineLayerId];
		const easyWidth = EASY_READ_WIDTH[layerId as EasyReadLineLayerId];

		for (const config of configs) {
			if (config.type !== 'line' || !config.statusTier) continue;

			const lineColor = mode === 'easyRead' ? easyColor : IHO_BOUNDARY_COLOR;
			const lineWidth =
				mode === 'easyRead'
					? easyWidth
					: ((config.paint.base as Record<string, unknown>)['line-width'] as number);

			applyLinePaint(map, config.baseLayerId, lineColor, lineWidth);
			applyLinePaint(map, config.filteredLayerId, lineColor, lineWidth + 1);
		}

		if (mode === 'iho') {
			for (const config of configs) {
				if (!config.ihoOnly || config.type !== 'symbol') continue;
				const textColor = IHO_BOUNDARY_TEXT_COLOR;
				for (const targetLayerId of [config.baseLayerId, config.filteredLayerId]) {
					if (!map.getLayer(targetLayerId)) continue;
					try {
						map.setPaintProperty(targetLayerId, 'text-color', textColor);
					} catch {
						// icon-only symbols
					}
				}
			}
		}
	}
};

export const getEffectiveLineColor = (layerId: EasyReadLineLayerId, mode: SymbologyMode): string =>
	mode === 'easyRead' ? EASY_READ_COLORS[layerId] : IHO_BOUNDARY_COLOR;
