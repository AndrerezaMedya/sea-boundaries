import type { Feature, Geometry } from 'geojson';

import batasMaritimRaw from '@/data/batas_maritim.geojson?raw';
import basepointsRaw from '@/data/basepoints.geojson?raw';
import baselineRaw from '@/data/baseline.geojson?raw';
import titikPerjanjianRaw from '@/data/titik_perjanjian.geojson?raw';
import { DATE_FIELDS_BY_LAYER, LAYER_SCHEMAS } from '@/lib/schema';
import type { CoreLayerId, FeatureCollectionWithProps, FeatureWithProps } from '@/lib/types';

const rawCollections: Record<CoreLayerId, string> = {
	basepoints: basepointsRaw,
	baseline: baselineRaw,
	titik_perjanjian: titikPerjanjianRaw,
	batas_maritim: batasMaritimRaw,
};

const parseRawCollection = (raw: string): Feature<Geometry, Record<string, unknown>>[] => {
	const parsed = JSON.parse(raw);
	if (!parsed || parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
		throw new Error('GeoJSON tidak valid. Pastikan format FeatureCollection.');
	}
	return parsed.features as Feature<Geometry, Record<string, unknown>>[];
};

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
	const properties: Record<string, unknown> = { ...(feature.properties ?? {}) };
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

	const primaryKey = schema.primaryKey;
	const rawId = properties[primaryKey];
	const featureId = rawId === undefined || rawId === null ? `${layerId}-${index}` : String(rawId);

	return {
		...feature,
		id: featureId,
		properties,
	} as FeatureWithProps;
};

export const loadLayerCollections = (): Record<CoreLayerId, FeatureCollectionWithProps> => {
	const result: Partial<Record<CoreLayerId, FeatureCollectionWithProps>> = {};
	(Object.keys(rawCollections) as CoreLayerId[]).forEach((layerId) => {
		const raw = rawCollections[layerId];
		const features = parseRawCollection(raw).map((feature, index) => normaliseFeature(layerId, feature, index)) as FeatureWithProps[];
		result[layerId] = {
			type: 'FeatureCollection',
			features,
		};
	});
	return result as Record<CoreLayerId, FeatureCollectionWithProps>;
};
