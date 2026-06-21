import type { CoreLayerId, LayerId } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

/** MapLibre vector source-layer name (must match backend ST_AsMVT layer). */
export const MVT_SOURCE_LAYER = 'display';

export type MvtTileset = 'boundaries' | 'points';

export const MVT_TILESETS: MvtTileset[] = ['boundaries', 'points'];

const parseMode = (raw: string | undefined): 'mvt' | 'geojson' => {
	const v = (raw || '').trim().toLowerCase();
	if (v === 'mvt') return 'mvt';
	if (v === 'geojson') return 'geojson';
	return 'geojson';
};

export const isMvtDisplayMode = (): boolean => parseMode(import.meta.env.VITE_DISPLAY_MODE) === 'mvt';

/** MVT `layer_id` (must match backend tileSql / agreementPointKind.js). */
const MVT_LAYER_KEY: Record<CoreLayerId, string> = {
	baseline: 'baseline',
	territorial_sea: 'territorial_sea',
	contiguous_zone: 'contiguous_zone',
	eez_limit: 'eez_limit',
	continental_shelf: 'continental_shelf',
	landas_kontinen_ekstensi: 'landas_kontinen_ekstensi',
	fisheries: 'fisheries',
	basepoints: 'basepoints',
	basepoints_2026: 'basepoints',
	titik_perjanjian_lt: 'boundary_point_ts',
	titik_perjanjian_lk: 'boundary_point_cs',
	titik_perjanjian_zee: 'boundary_point_eez',
	titik_referensi: 'titik_referensi',
};

const BOUNDARY_LAYERS = new Set<CoreLayerId>([
	'baseline',
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'landas_kontinen_ekstensi',
	'fisheries',
]);

export const getMvtLayerKey = (layerId: CoreLayerId): string => MVT_LAYER_KEY[layerId] ?? layerId;

export const getTilesetForLayer = (layerId: LayerId): MvtTileset | null => {
	if (layerId === USER_LAYER_ID) return null;
	if (BOUNDARY_LAYERS.has(layerId as CoreLayerId)) return 'boundaries';
	return 'points';
};

export const getMvtSourceId = (layerId: LayerId): string => {
	const tileset = getTilesetForLayer(layerId);
	return tileset ? `source-mvt-${tileset}` : '';
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

/** Bump when point-tile SQL changes (invalidates browser/CDN tile cache). */
export const MVT_TILE_CACHE_VERSION = '10';

export const getTileUrlTemplate = (tileset: MvtTileset): string =>
	`${API_BASE}/api/tiles/${tileset}/{z}/{x}/{y}.mvt?v=${MVT_TILE_CACHE_VERSION}`;
