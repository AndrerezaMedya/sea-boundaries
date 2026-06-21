import type { CoreLayerId } from '@/lib/types';

/** Maritime limit layers (LineString / MultiLineString curves). */
export const GEO_LINE_LAYERS: readonly CoreLayerId[] = [
	'baseline',
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'landas_kontinen_ekstensi',
	'fisheries',
] as const;

export const GEO_POINT_LAYERS: readonly CoreLayerId[] = [
	'basepoints',
	'basepoints_2026',
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
] as const;

export const GEO_ALL_LAYERS: readonly CoreLayerId[] = [...GEO_LINE_LAYERS, ...GEO_POINT_LAYERS];

/** Capstone geoprocessing: measure + buffer only. */
export type GeoprocessingOperation = 'length' | 'area' | 'buffer';

export function isPointLayer(layerId: CoreLayerId): boolean {
	return (GEO_POINT_LAYERS as readonly string[]).includes(layerId);
}

export function isLineLayer(layerId: CoreLayerId): boolean {
	return (GEO_LINE_LAYERS as readonly string[]).includes(layerId);
}

export function layersForGeoOperation(op: GeoprocessingOperation | null): readonly CoreLayerId[] {
	if (!op) return GEO_ALL_LAYERS;
	if (op === 'length' || op === 'area') return GEO_LINE_LAYERS;
	return GEO_ALL_LAYERS;
}
