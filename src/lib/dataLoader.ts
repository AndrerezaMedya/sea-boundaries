import type { Feature, Geometry } from 'geojson';

import { fetchLayerData, fetchLayersInBbox } from './apiClient';
import type { Bbox } from './bbox';
import { expandBbox, INDONESIA_BBOX } from './bbox';
import { isMvtDisplayMode } from '@/lib/mapDisplay';
import { DATE_FIELDS_BY_LAYER, LAYER_SCHEMAS } from '@/lib/schema';
import { FEATURE_ROW_ID_PROP, normaliseFeatureProperties, resolveFeatureRowId } from '@/lib/featureId';
import type { CoreLayerId, FeatureCollectionWithProps, FeatureWithProps } from '@/lib/types';

const toTimestamp = (value: unknown): number | null => {
	if (value instanceof Date) {
		return value.getTime();
	}
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}
	if (typeof value !== 'string') {
		return null;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}
	const isoLike = /^\d{4}-\d{2}-\d{2}$/;
	const dmy = /^\d{2}-\d{2}-\d{4}$/;
	let isoString = trimmed;
	if (isoLike.test(trimmed)) {
		isoString = `${trimmed}T00:00:00Z`;
	} else if (dmy.test(trimmed)) {
		const [day, month, year] = trimmed.split('-');
		isoString = `${year}-${month}-${day}T00:00:00Z`;
	} else {
		const fallback = new Date(trimmed);
		const timestamp = fallback.getTime();
		return Number.isNaN(timestamp) ? null : timestamp;
	}
	const timestamp = new Date(isoString).getTime();
	return Number.isNaN(timestamp) ? null : timestamp;
};

const normaliseFeature = (
	layerId: CoreLayerId,
	feature: Feature<Geometry, Record<string, unknown>>,
	index: number,
): FeatureWithProps => {
	if (!feature.geometry) {
		throw new Error(`Fitur pada layer ${layerId} tidak memiliki geometry.`);
	}
	const schema = LAYER_SCHEMAS[layerId];
	const properties: Record<string, unknown> = normaliseFeatureProperties({ ...(feature.properties ?? {}) });
	const dateFields = new Set(DATE_FIELDS_BY_LAYER[layerId] ?? []);

	schema.fields.forEach((field) => {
		const value = properties[field.name];
		if (value === undefined || value === null) {
			return;
		}
		if (field.type === 'number' && typeof value !== 'number') {
			const numeric = Number(value);
			if (!Number.isNaN(numeric)) {
				properties[field.name] = numeric;
			}
		}
		if (field.type === 'date') {
			const rawTimestamp = toTimestamp(value);
			if (rawTimestamp !== null) {
				const expressionField = field.expressionField ?? `${field.name}__ts`;
				properties[expressionField] = rawTimestamp;
			}
		}
	});

	dateFields.forEach((fieldName) => {
		if (!(fieldName in properties)) {
			return;
		}
		const expressionField = `${fieldName}__ts`;
		if (!(expressionField in properties)) {
			const timestamp = toTimestamp(properties[fieldName]);
			if (timestamp !== null) {
				properties[expressionField] = timestamp;
			}
		}
	});

	const featureId = resolveFeatureRowId(layerId, properties, index);
	properties[FEATURE_ROW_ID_PROP] = featureId;

	return {
		...feature,
		id: featureId,
		properties,
	} as FeatureWithProps;
};

/** Load one layer for attribute table (GeoJSON: national bbox; MVT: no bbox — filtered client-side). */
export const loadLayerCollectionForBbox = async (
	layerId: CoreLayerId,
	bbox?: Bbox,
): Promise<FeatureCollectionWithProps> => {
	const queryBbox = isMvtDisplayMode() ? undefined : (bbox ?? expandBbox(INDONESIA_BBOX));
	const raw = await fetchLayerData(layerId, queryBbox);
	const features = (raw.features || []).map((feature, index) =>
		normaliseFeature(layerId, feature, index),
	) as FeatureWithProps[];
	return { type: 'FeatureCollection', features };
};

/** Load all core layers for a map bounding box (display channel). */
export const loadLayerCollections = async (
	bbox: Bbox,
): Promise<Record<CoreLayerId, FeatureCollectionWithProps>> => {
	const rawCollections = await fetchLayersInBbox(bbox);
	const result: Partial<Record<CoreLayerId, FeatureCollectionWithProps>> = {};

	(Object.keys(rawCollections) as CoreLayerId[]).forEach((layerId) => {
		const features = (rawCollections[layerId]?.features || []).map((feature, index) =>
			normaliseFeature(layerId, feature, index),
		) as FeatureWithProps[];
		result[layerId] = {
			type: 'FeatureCollection',
			features,
		};
	});

	return result as Record<CoreLayerId, FeatureCollectionWithProps>;
};
