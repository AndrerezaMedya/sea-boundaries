import type { Feature, FeatureCollection, Geometry } from 'geojson';

import type {
	FieldSchema,
	FeatureCollectionWithProps,
	FeatureWithProps,
	FieldType,
	GeometryType,
	LayerSchema,
} from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

const ALLOWED_GEOMETRIES = new Set<GeometryType>([
	'Point',
	'MultiPoint',
	'LineString',
	'MultiLineString',
	'Polygon',
	'MultiPolygon',
]);

type GeometryFamily = 'point' | 'line' | 'polygon';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(:\d{2})?)?/;
const DMY_DATE_REGEX = /^\d{2}[-/]\d{2}[-/]\d{4}$/;

const getGeometryFamily = (type: GeometryType): GeometryFamily => {
	if (type === 'Point' || type === 'MultiPoint') {
		return 'point';
	}
	if (type === 'LineString' || type === 'MultiLineString') {
		return 'line';
	}
	return 'polygon';
};

const labelFromKey = (key: string): string => {
	return key
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^(\w)/, (match) => match.toUpperCase())
		.replace(/\s(\w)/g, (_, char: string) => ` ${char.toUpperCase()}`);
};

const isLikelyDateString = (value: string): boolean => {
	const trimmed = value.trim();
	if (!trimmed) {
		return false;
	}
	if (ISO_DATE_REGEX.test(trimmed) || DMY_DATE_REGEX.test(trimmed)) {
		return true;
	}
	const timestamp = Date.parse(trimmed);
	return !Number.isNaN(timestamp);
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
	if (ISO_DATE_REGEX.test(trimmed)) {
		const iso = trimmed.includes('T') || trimmed.includes(' ') ? trimmed : `${trimmed}T00:00:00Z`;
		const parsed = new Date(iso).getTime();
		return Number.isNaN(parsed) ? null : parsed;
	}
	if (DMY_DATE_REGEX.test(trimmed)) {
		const [day, month, year] = trimmed.split(/[-/]/);
		const formatted = `${year}-${month}-${day}T00:00:00Z`;
		const parsed = new Date(formatted).getTime();
		return Number.isNaN(parsed) ? null : parsed;
	}
	const fallback = new Date(trimmed).getTime();
	return Number.isNaN(fallback) ? null : fallback;
};

const inferFieldType = (value: unknown): FieldType => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return 'number';
	}
	if (typeof value === 'string' && isLikelyDateString(value)) {
		return 'date';
	}
	return 'string';
};

const toFeatureWithProps = (feature: Feature, index: number): FeatureWithProps => {
	const properties: Record<string, unknown> = { ...(feature.properties ?? {}) };
	const rawId =
		feature.id ??
		properties.fid ??
		properties.FID ??
		properties.id ??
		properties.ID ??
		properties.objectid ??
		properties.OBJECTID;
	const featureId = rawId === undefined || rawId === null ? `user-${index + 1}` : String(rawId);
	properties.__fid = featureId;

	return {
		...(feature as Feature<Geometry, Record<string, unknown>>),
		id: featureId,
		properties,
	};
};

const normaliseCollection = (input: FeatureCollection): FeatureCollectionWithProps => {
	const features = input.features.map((feature, index) => toFeatureWithProps(feature, index)) as FeatureWithProps[];
	return {
		type: 'FeatureCollection',
		features,
	};
};

const deriveFields = (features: FeatureWithProps[]): FieldSchema[] => {
	const base: FieldSchema[] = [
		{
			name: '__fid',
			label: 'FID',
			type: 'string',
			description: 'Identifier yang dihasilkan sistem',
		},
	];

	const sampleFeature = features.find((feature) => feature.properties && Object.keys(feature.properties).length > 0);
	if (!sampleFeature) {
		return base;
	}

	const fieldSchemas: FieldSchema[] = [];
	Object.entries(sampleFeature.properties ?? {})
		.filter(([key]) => key !== '__fid')
		.forEach(([key, value]) => {
			if (value === null || typeof value === 'object') {
				return;
			}
			const type = inferFieldType(value);
			fieldSchemas.push({
				name: key,
				label: labelFromKey(key),
				type,
				expressionField: type === 'date' ? `${key}__ts` : undefined,
			});
		});

	return [...base, ...fieldSchemas];
};

const enrichFeatureProperties = (features: FeatureWithProps[], fields: FieldSchema[]) => {
	const numericFields = fields.filter((field) => field.type === 'number').map((field) => field.name);
	const dateFields = fields.filter((field) => field.type === 'date');

	features.forEach((feature) => {
		const properties = feature.properties ?? {};
		numericFields.forEach((fieldName) => {
			const value = properties[fieldName];
			if (value === undefined || value === null || typeof value === 'number') {
				return;
			}
			const numeric = Number(value);
			if (!Number.isNaN(numeric)) {
				properties[fieldName] = numeric;
			}
		});
		dateFields.forEach((field) => {
			const value = properties[field.name];
			if (value === undefined || value === null) {
				return;
			}
			const timestamp = toTimestamp(value);
			if (timestamp !== null) {
				const accessor = field.expressionField ?? `${field.name}__ts`;
				properties[accessor] = timestamp;
			}
		});
		feature.properties = properties;
	});
};

const determineGeometryType = (features: FeatureWithProps[]): GeometryType => {
	for (const feature of features) {
		const geometry = feature.geometry;
		if (!geometry) {
			continue;
		}
		const type = geometry.type as GeometryType;
		if (!ALLOWED_GEOMETRIES.has(type)) {
			throw new Error(`Tipe geometri "${type}" tidak didukung. Gunakan Point/LineString/Polygon.`);
		}
		return type;
	}
	throw new Error('GeoJSON tidak memiliki geometri yang valid.');
};

const validateGeometryFamily = (features: FeatureWithProps[], primaryType: GeometryType) => {
	const family = getGeometryFamily(primaryType);
	for (const feature of features) {
		const geometry = feature.geometry;
		if (!geometry) {
			throw new Error('Setiap fitur harus memiliki geometri.');
		}
		const type = geometry.type as GeometryType;
		if (!ALLOWED_GEOMETRIES.has(type)) {
			throw new Error(`Tipe geometri "${type}" tidak didukung. Gunakan Point/LineString/Polygon.`);
		}
		if (getGeometryFamily(type) !== family) {
			throw new Error('GeoJSON harus memiliki geometri sejenis (semua titik, garis, atau poligon).');
		}
	}
};

const buildSchema = (fields: FieldSchema[], geometryType: GeometryType, name?: string): LayerSchema => {
	const popupFields = fields
		.filter((field) => field.name !== '__fid')
		.slice(0, 5)
		.map((field) => field.name);

	return {
		id: USER_LAYER_ID,
		label: name ?? 'Layer Pengguna',
		geometryType,
		primaryKey: '__fid',
		popupFields: popupFields.length > 0 ? popupFields : ['__fid'],
		fields,
		description: 'GeoJSON pengguna yang dimuat selama sesi.',
		defaultVisible: true,
	};
};

export interface UserLayerParseResult {
	collection: FeatureCollectionWithProps;
	schema: LayerSchema;
	geometryType: GeometryType;
	featureCount: number;
}

export const parseUserGeoJson = (raw: string, options?: { name?: string }): UserLayerParseResult => {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error('Berkas bukan JSON yang valid.');
	}

	if (!parsed || typeof parsed !== 'object' || (parsed as { type?: unknown }).type !== 'FeatureCollection') {
		throw new Error('GeoJSON harus berupa FeatureCollection.');
	}

	const featureCollection = parsed as FeatureCollection;
	if (!Array.isArray(featureCollection.features) || featureCollection.features.length === 0) {
		throw new Error('FeatureCollection harus memiliki minimal satu fitur.');
	}

	const normalised = normaliseCollection(featureCollection);
	const features = normalised.features;
	const geometryType = determineGeometryType(features);
	validateGeometryFamily(features, geometryType);

	const fields = deriveFields(features);
	enrichFeatureProperties(features, fields);
	const schema = buildSchema(fields, geometryType, options?.name);

	return {
		collection: normalised,
		schema,
		geometryType,
		featureCount: features.length,
	};
};

export const isFeatureCountHigh = (count: number, threshold = 50000): boolean => count > threshold;
