import { getLayerSchema } from '@/lib/schema';
import type { CoreLayerId, LayerId } from '@/lib/types';

/** Stable row id stored on feature.properties — used for selection/hover/filter matching in MapLibre. */
export const FEATURE_ROW_ID_PROP = '_rowId';

const LIMIT_LAYER_IDS = new Set<CoreLayerId>([
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'landas_kontinen_ekstensi',
	'fisheries',
	'baseline',
]);

const LOCATION_LAYER_IDS = new Set<CoreLayerId>([
	'basepoints',
	'basepoints_2026',
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
]);

const POPUP_PROPERTY_ALIASES: Record<string, string> = {
	Label: 'label',
	label: 'label',
	Status: 'status',
	status: 'status',
	Limit_Object_Type: 'limit_object_type',
	limit_object_type: 'limit_object_type',
	Location_Type_List: 'location_type_list',
	location_type_list: 'location_type_list',
	Point_Location: 'point_location',
	point_location: 'point_location',
	Horizontal_Datum: 'horizontal_datum',
	horizontal_datum: 'horizontal_datum',
	Source_Ids: 'source_ids',
	source_ids: 'source_ids',
	fuID: 'fuid',
	FUID: 'fuid',
	fuid: 'fuid',
	saID: 'said',
	SAID: 'said',
	said: 'said',
};

/** Normalise backend / MVT property aliases to schema field names. */
export const normaliseFeatureProperties = (properties: Record<string, unknown>): Record<string, unknown> => {
	const next: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(properties)) {
		const canonical = POPUP_PROPERTY_ALIASES[key] ?? key;
		if (next[canonical] === undefined || next[canonical] === null || next[canonical] === '') {
			next[canonical] = value;
		}
	}
	if (next.fuid == null || next.fuid === '') {
		const alt = properties.fuID ?? properties.FUID;
		if (alt != null && alt !== '') next.fuid = alt;
	}
	if (next.said == null || next.said === '') {
		const alt = properties.saID ?? properties.SAID;
		if (alt != null && alt !== '') next.said = alt;
	}
	return next;
};

/**
 * Canonical row identifier for store index, selection, and MapLibre property filters.
 *
 * - Location layers: `fuid` is unique; `said` may repeat (many feature units → one point).
 * - Limit layers: one `fuid` may span many curve segments (`said`); row id = `fuid::said`.
 */
export const resolveFeatureRowId = (
	layerId: LayerId,
	properties: Record<string, unknown>,
	fallbackIndex?: number,
): string => {
	const props = normaliseFeatureProperties(properties);
	const fuid = props.fuid;
	const said = props.said;
	const hasFuid = fuid != null && fuid !== '';
	const hasSaid = said != null && said !== '';

	if (LIMIT_LAYER_IDS.has(layerId as CoreLayerId) && hasFuid && hasSaid) {
		return `${fuid}::${said}`;
	}

	if (LOCATION_LAYER_IDS.has(layerId as CoreLayerId) && hasFuid) {
		return String(fuid);
	}

	if (hasFuid) {
		return String(fuid);
	}

	const schema = getLayerSchema(layerId);
	const pk = props[schema.primaryKey];
	if (pk != null && pk !== '') return String(pk);
	if (hasSaid) return String(said);

	return fallbackIndex !== undefined ? `${layerId}-${fallbackIndex}` : `${layerId}-unknown`;
};

/** Read stamped row id, or derive from properties (e.g. MapLibre click events). */
export const readFeatureRowId = (layerId: LayerId, properties: Record<string, unknown>): string => {
	const props = normaliseFeatureProperties(properties);
	const stamped = props[FEATURE_ROW_ID_PROP];
	if (stamped != null && stamped !== '') return String(stamped);
	return resolveFeatureRowId(layerId, props);
};

/** Feature-unit id for detail API (`/api/locations/:fuid`, `/api/limits/:fuid`). */
export const resolveFeatureUnitId = (properties: Record<string, unknown>): string | null => {
	const props = normaliseFeatureProperties(properties);
	const fuid = props.fuid;
	if (fuid != null && fuid !== '') return String(fuid);
	return null;
};
