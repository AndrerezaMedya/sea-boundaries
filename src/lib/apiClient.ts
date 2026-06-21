import type { FeatureCollection, Geometry } from 'geojson';
import type { Bbox } from '@/lib/bbox';
import { bboxToParam } from '@/lib/bbox';
import { ensureDisplaySession, getDisplayToken } from '@/lib/displaySession';
import type { CoreLayerId, FeatureWithProps, FeatureCollectionWithProps } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

/** Build URL with query params. */
function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
	const url = new URL(path, API_BASE);
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	});
	return url.toString();
}

/** Fetch with error handling and JSON parsing. */
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	if (!API_BASE) {
		throw new Error('VITE_API_BASE is not defined');
	}
	const headers: Record<string, string> = {};
	const token = getDisplayToken();
	if (token) {
		headers['X-Display-Token'] = token;
	}
	const res = await fetch(url, { cache: 'no-store', ...init, headers: { ...headers, ...init?.headers } });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`API error ${res.status}: ${text}`);
	}
	return res.json() as Promise<T>;
}

/** Mapping CoreLayerId → API endpoint + query params. */
const LAYER_API_CONFIG: Record<
	CoreLayerId,
	{ path: string; params?: Record<string, string> }
> = {
	basepoints: { path: '/api/locations', params: { type: 'Baseline Point', fuid_not_suffix: '_2026' } },
	basepoints_2026: { path: '/api/locations', params: { type: 'Baseline Point', fuid_suffix: '_2026' } },
	landas_kontinen_ekstensi: { path: '/api/limits', params: { type: 'ECS' } },
	titik_perjanjian_lt: { path: '/api/locations', params: { type: 'Boundary Point', agreement: 'TS' } },
	titik_perjanjian_lk: { path: '/api/locations', params: { type: 'Boundary Point', agreement: 'CS' } },
	titik_perjanjian_zee: { path: '/api/locations', params: { type: 'Boundary Point', agreement: 'EEZ' } },
	territorial_sea: { path: '/api/limits', params: { type: 'TS' } },
	contiguous_zone: { path: '/api/limits', params: { type: 'CZ' } },
	eez_limit: { path: '/api/limits', params: { type: 'EEZ' } },
	continental_shelf: { path: '/api/limits', params: { type: 'CS' } },
	fisheries: { path: '/api/limits', params: { type: 'FISH' } },
	baseline: { path: '/api/limits', params: { type: 'BSL' } },
	titik_referensi: { path: '/api/locations', params: { type: 'Location' } },
};

const normalizeCollection = (
	layerId: CoreLayerId,
	raw: FeatureCollection<Geometry, Record<string, unknown>>,
): FeatureCollectionWithProps => {
	const features = (raw.features || []).map((f, i) => {
		const props = f.properties || {};
		const id = props.fuid || props.fid || props.id || `${layerId}-${i}`;
		return { ...f, id: String(id) } as FeatureWithProps;
	});
	return { type: 'FeatureCollection', features };
};

/** Fetch one layer (display channel). Bbox omitted in MVT mode — geometry comes from tiles. */
export async function fetchLayerData(
	layerId: CoreLayerId,
	bbox?: Bbox,
): Promise<FeatureCollectionWithProps> {
	const config = LAYER_API_CONFIG[layerId];
	if (!config) {
		throw new Error(`No API config for layer: ${layerId}`);
	}
	const url = buildUrl(config.path, {
		...config.params,
		...(bbox ? { bbox: bboxToParam(bbox) } : {}),
	});
	const raw = await fetchJson<FeatureCollection<Geometry, Record<string, unknown>>>(url);
	return normalizeCollection(layerId, raw);
}

/** Fetch all core layers for a bounding box (parallel). */
export async function fetchLayersInBbox(
	bbox: Bbox,
): Promise<Record<CoreLayerId, FeatureCollectionWithProps>> {
	const layerIds = Object.keys(LAYER_API_CONFIG) as CoreLayerId[];
	const entries = await Promise.all(
		layerIds.map(async (id) => {
			try {
				const data = await fetchLayerData(id, bbox);
				return [id, data] as const;
			} catch (err) {
				console.error(`Failed to fetch layer ${id}:`, err);
				return [id, { type: 'FeatureCollection', features: [] }] as const;
			}
		}),
	);
	return Object.fromEntries(entries) as Record<CoreLayerId, FeatureCollectionWithProps>;
}

/** @deprecated Use fetchLayersInBbox — kept for compatibility during migration. */
export const fetchAllLayers = fetchLayersInBbox;

export interface FilterOptionsResponse {
	horizontal_datum: string[];
	point_location: string[];
	/** Distinct `status` on line features (`feature_model_limit`). */
	status_limit: string[];
	/** Distinct `status` on point features (`feature_model_location`). */
	status_point: string[];
	limit_object_type: string[];
	location_type_list: string[];
}

/** Bump when filter-options response shape changes (cache bust). */
const FILTER_OPTIONS_QUERY_VERSION = '4';

const FILTER_OPTIONS_ARRAY_KEYS: (keyof FilterOptionsResponse)[] = [
	'horizontal_datum',
	'point_location',
	'status_limit',
	'status_point',
	'limit_object_type',
	'location_type_list',
];

/** Distinct filter chip values from database (not bbox-limited). */
export async function fetchFilterOptions(): Promise<FilterOptionsResponse> {
	await ensureDisplaySession();
	const url = buildUrl('/api/meta/filter-options', { v: FILTER_OPTIONS_QUERY_VERSION });
	const data = await fetchJson<FilterOptionsResponse>(url);
	for (const key of FILTER_OPTIONS_ARRAY_KEYS) {
		if (!Array.isArray(data[key])) {
			throw new Error(
				`FILTER_OPTIONS_MISSING_${key.toUpperCase()}: backend /api/meta/filter-options did not return ${key} — deploy the latest backend`,
			);
		}
	}
	return data;
}

/** Fetch detail for a limit or location by ID (display channel). */
export async function fetchFeatureDetail(
	layerId: CoreLayerId,
	featureId: string,
): Promise<{
	type: 'Feature';
	geometry: Geometry;
	properties: Record<string, unknown>;
	sources?: unknown[];
	vertices?: unknown[];
	parent_limits?: unknown[];
}> {
	const isLocationLayer = [
		'titik_referensi',
		'basepoints',
		'basepoints_2026',
		'titik_perjanjian_lt',
		'titik_perjanjian_lk',
		'titik_perjanjian_zee',
	].includes(layerId);

	const encodedId = encodeURIComponent(featureId);
	const path = isLocationLayer ? `/api/locations/${encodedId}` : `/api/limits/${encodedId}`;
	const url = buildUrl(path, {});
	return fetchJson(url);
}
