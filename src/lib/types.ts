import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type CoreLayerId =
	| 'basepoints'
	| 'basepoints_2026'
	| 'landas_kontinen_ekstensi'
	| 'titik_perjanjian_lt'
	| 'titik_perjanjian_lk'
	| 'titik_perjanjian_zee'
	| 'territorial_sea'
	| 'contiguous_zone'
	| 'eez_limit'
	| 'continental_shelf'
	| 'fisheries'
	| 'titik_referensi'
	| 'baseline';
export const ALL_CORE_IDS: CoreLayerId[] = [
	'basepoints',
	'basepoints_2026',
	'landas_kontinen_ekstensi',
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'fisheries',
	'titik_referensi',
	'baseline',
];
export type DynamicLayerId = 'user_layer';
export const USER_LAYER_ID: DynamicLayerId = 'user_layer';
export type LayerId = CoreLayerId | DynamicLayerId;

export type GeometryType =
	| 'Point'
	| 'MultiPoint'
	| 'LineString'
	| 'MultiLineString'
	| 'Polygon'
	| 'MultiPolygon';

export type MapRenderKind = 'circle' | 'line' | 'fill';

export type FieldType = 'string' | 'number' | 'date';

export type Operator =
	| '='
	| '!='
	| '<'
	| '<='
	| '>'
	| '>='
	| 'contains'
	| 'startsWith'
	| 'in'
	| 'between'
	| 'is_null'
	| 'is_not_null';

export type ConditionValue = string | number | string[] | number[] | null;

export interface FieldSchema {
	name: string;
	label: string;
	type: FieldType;
	example?: string | number;
	enum?: string[];
	description?: string;
	expressionField?: string;
}

export interface LayerSchema {
	id: LayerId;
	label: string;
	geometryType: GeometryType;
	primaryKey: string;
	popupFields: string[];
	fields: FieldSchema[];
	description?: string;
	defaultVisible?: boolean;
}

export type FilterJoin = 'all' | 'any';

export interface FilterCondition {
	id: string;
	field: string;
	operator: Operator;
	value: ConditionValue;
	value2?: string | number;
	type: FieldType;
}

export interface FilterDefinition {
	conditions: FilterCondition[];
	join: FilterJoin;
}

export type FilterExpression = any[];

export type FeatureWithProps = Feature<Geometry, Record<string, unknown>> & { id: string };

export interface LayerGroupEntry {
	layerId: CoreLayerId;
	sublabel: string;
}

export interface LayerGroup {
	id: string;
	label: string;
	entries: LayerGroupEntry[];
	defaultExpanded?: boolean;
	color: string;
}

export type FeatureCollectionWithProps = FeatureCollection<Geometry, Record<string, unknown>> & {
	features: FeatureWithProps[];
};

export interface TableRow {
	id: string;
	layerId: LayerId;
	properties: Record<string, unknown>;
	geometry: Geometry;
}

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
	field: string;
	direction: SortDirection;
}

export interface PresetDefinition {
	id: string;
	name: string;
	layerId: LayerId;
	definition: FilterDefinition;
	createdAt: string;
}

export interface UniqueValueResult {
	layerId: LayerId;
	field: string;
	values: (string | number)[];
}

export interface ZoomRequest {
	layerId: LayerId;
	featureIds?: string[];
	bounds?: [number, number, number, number];
	padding?: number;
	timestamp: number;
}
