import type { Map as MapLibreMap } from 'maplibre-gl';

import { isMvtDisplayMode, type MvtTileset } from '@/lib/mapDisplay';
import type { CoreLayerId, LayerId } from '@/lib/types';

const TITIK_LAYER_IDS: CoreLayerId[] = [
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
];

/** Layers backed by `source-mvt-points` (MapLibre skips tile fetch if all are hidden). */
const POINTS_TILESET_LAYER_IDS: CoreLayerId[] = [...TITIK_LAYER_IDS, 'basepoints', 'basepoints_2026'];

const BOUNDARY_LAYER_IDS: CoreLayerId[] = [
	'baseline',
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'landas_kontinen_ekstensi',
	'fisheries',
];

type LayerVisibilitySnapshot = Partial<Record<LayerId, boolean>>;

const snapshotVisibility = (
	layers: Partial<Record<LayerId, { visible?: boolean } | undefined>>,
): LayerVisibilitySnapshot => {
	const out: LayerVisibilitySnapshot = {};
	for (const id of [...POINTS_TILESET_LAYER_IDS, ...BOUNDARY_LAYER_IDS] as LayerId[]) {
		out[id] = layers[id]?.visible ?? false;
	}
	return out;
};

const anyVisible = (ids: CoreLayerId[], snap: LayerVisibilitySnapshot): boolean =>
	ids.some((id) => snap[id]);

const visibilityChanged = (
	ids: CoreLayerId[],
	current: LayerVisibilitySnapshot,
	previous: LayerVisibilitySnapshot | null,
): boolean => {
	if (!previous) return true;
	return ids.some((id) => current[id] !== previous[id]);
};

/**
 * MVT layer toggles only change MapLibre visibility/filters — they do not refetch tiles.
 * Reload tiles when visibility changes so MapLibre requests data (and bypasses stale 204 cache).
 */
export const syncMvtTileReload = (
	map: MapLibreMap,
	layers: Partial<Record<LayerId, { visible?: boolean } | undefined>>,
	previous: LayerVisibilitySnapshot | null,
): LayerVisibilitySnapshot => {
	const current = snapshotVisibility(layers);
	if (!isMvtDisplayMode()) {
		return current;
	}

	const pointsVisibilityChanged = visibilityChanged(POINTS_TILESET_LAYER_IDS, current, previous);
	const refreshPoints =
		anyVisible(POINTS_TILESET_LAYER_IDS, current) &&
		(pointsVisibilityChanged || previous === null);

	const refreshBoundaries =
		anyVisible(BOUNDARY_LAYER_IDS, current) &&
		(visibilityChanged(BOUNDARY_LAYER_IDS, current, previous) || previous === null);

	const reload = (tileset: MvtTileset) => {
		const sourceId = `source-mvt-${tileset}`;
		if (map.getSource(sourceId) && typeof map.refreshTiles === 'function') {
			map.refreshTiles(sourceId);
		}
	};

	if (refreshPoints) reload('points');
	if (refreshBoundaries) reload('boundaries');

	return current;
};
