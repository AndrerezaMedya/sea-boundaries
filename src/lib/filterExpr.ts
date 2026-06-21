import { getFieldSchema } from '@/lib/schema';
import { classifyStatusTier, statusPropertyExpression, type StatusSymbologyTier } from '@/lib/statusSymbology';
import type {
	FieldSchema,
	FilterDefinition,
	FilterExpression,
	FilterJoin,
	FilterCondition,
	LayerId,
} from '@/lib/types';
import type { FeatureWithProps } from '@/lib/types';

const normaliseString = (value: unknown): string => {
	if (value === undefined || value === null) {
		return '';
	}
	return String(value);
};

const toNumber = (value: unknown): number | null => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}
	if (value instanceof Date) {
		return value.getTime();
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) {
			return null;
		}
		const numeric = Number(trimmed);
		return Number.isNaN(numeric) ? null : numeric;
	}
	return null;
};

const toTimestamp = (value: unknown): number | null => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}
	if (value instanceof Date) {
		return value.getTime();
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

const resolveAccessor = (field: FieldSchema): string => field.expressionField ?? field.name;

const buildNumericExpression = (
	field: FieldSchema,
	op: FilterCondition['operator'],
	value: number | null,
	value2?: number | null,
): FilterExpression => {
	const accessor = ['to-number', ['get', resolveAccessor(field)]];
	switch (op) {
		case '=':
			return ['==', accessor, value ?? 0];
		case '!=':
			return ['!=', accessor, value ?? 0];
		case '<':
			return ['<', accessor, value ?? 0];
		case '<=':
			return ['<=', accessor, value ?? 0];
		case '>':
			return ['>', accessor, value ?? 0];
		case '>=':
			return ['>=', accessor, value ?? 0];
		case 'between':
			return [
				'all',
				['>=', accessor, value ?? 0],
				['<=', accessor, value2 ?? value ?? 0],
			];
		case 'is_null':
			return [
				'any',
				['!', ['has', resolveAccessor(field)]],
				['==', ['typeof', ['get', resolveAccessor(field)]], 'null'],
				['==', ['get', resolveAccessor(field)], '']
			];
		case 'is_not_null':
			return [
				'all',
				['has', resolveAccessor(field)],
				['!=', ['typeof', ['get', resolveAccessor(field)]], 'null'],
				['!=', ['get', resolveAccessor(field)], '']
			];
		default:
			return ['==', accessor, value ?? 0];
	}
};

const isStatusField = (field: FieldSchema): boolean => field.name.toLowerCase() === 'status';

const buildStatusInExpression = (labels: string[]): FilterExpression => {
	const statusValue = statusPropertyExpression();
	const lowerLabels = labels.map((l) => normaliseString(l).toLowerCase());
	if (lowerLabels.length === 0) return ['==', statusValue, '__no-match__'];
	if (lowerLabels.length === 1) return ['==', statusValue, lowerLabels[0]];
	return ['any', ...lowerLabels.map((l) => ['==', statusValue, l])] as FilterExpression;
};

const buildStringExpression = (
	field: FieldSchema,
	op: FilterCondition['operator'],
	value: string | string[],
): FilterExpression => {
	if (isStatusField(field)) {
		const statusValue = statusPropertyExpression();
		switch (op) {
			case '=':
				return ['==', statusValue, normaliseString(value).toLowerCase()];
			case '!=':
				return ['!=', statusValue, normaliseString(value).toLowerCase()];
			case 'contains':
				return ['in', normaliseString(value).toLowerCase(), statusValue];
			case 'in': {
				const labels = Array.isArray(value) ? value : [value];
				return buildStatusInExpression(labels);
			}
			default:
				return ['==', statusValue, normaliseString(value).toLowerCase()];
		}
	}

	const accessor = ['coalesce', ['get', resolveAccessor(field)], ''];
	switch (op) {
		case '=':
			return ['==', accessor, value];
		case '!=':
			return ['!=', accessor, value];
		case 'contains':
			// ['in', needle, haystack]: checks if needle is a substring of haystack.
			// NOTE: needle must be first, haystack (the field value) second.
			return ['in', normaliseString(value as string).toLowerCase(), ['downcase', accessor]];
		case 'startsWith':
			return [
				'all',
				['>=', ['index-of', ['literal', normaliseString(value as string)], ['downcase', accessor]], 0],
				['==', ['slice', ['downcase', accessor], 0, normaliseString(value as string).length], normaliseString(value as string)],
			];
		case 'is_null':
			return [
				'any',
				['!', ['has', resolveAccessor(field)]],
				['==', ['typeof', ['get', resolveAccessor(field)]], 'null'],
				['==', ['get', resolveAccessor(field)], '']
			];
		case 'is_not_null':
			return [
				'all',
				['has', resolveAccessor(field)],
				['!=', ['typeof', ['get', resolveAccessor(field)]], 'null'],
				['!=', ['get', resolveAccessor(field)], '']
			];
		case 'in': {
			const labels = Array.isArray(value) ? value : [value];
			if (labels.length === 0) return ['==', accessor, '__no-match__'];

			const lowerLabels = labels.map((l) => normaliseString(l).toLowerCase());
			const downcased = ['downcase', accessor] as FilterExpression;
			if (lowerLabels.length === 1) return ['==', downcased, lowerLabels[0]];
			return ['any', ...lowerLabels.map((l) => ['==', downcased, l])] as FilterExpression;
		}
		default:
			return ['==', accessor, value];
	}
};

export const toMapLibreFilter = (layerId: LayerId, definition: FilterDefinition): FilterExpression => {
	if (definition.conditions.length === 0) {
		return ['all'];
	}

	const buildConditionExpression = (condition: FilterCondition): FilterExpression => {
		const field = getFieldSchema(layerId, condition.field);
		if (!field) {
			return ['all'];
		}
		if (field.type === 'number') {
			const primary = toNumber(condition.value);
			const secondary = toNumber(condition.value2);
			return buildNumericExpression(field, condition.operator, primary, secondary);
		}
		if (field.type === 'date') {
			const primary = toTimestamp(condition.value);
			const secondary = toTimestamp(condition.value2);
			return buildNumericExpression(field, condition.operator, primary, secondary);
		}
		return buildStringExpression(field, condition.operator, Array.isArray(condition.value) ? condition.value.map((item) => normaliseString(item)) : normaliseString(condition.value));
	};

	const expressions = definition.conditions.map((condition) => buildConditionExpression(condition));
	if (expressions.length === 1) {
		return expressions[0];
	}
	return [definition.join === 'all' ? 'all' : 'any', ...expressions];
};

const evaluateNumeric = (
	field: FieldSchema,
	operator: FilterCondition['operator'],
	value: number | null,
	value2: number | null,
	featureValue: unknown,
): boolean => {
	if (operator === 'is_null') {
		return featureValue === null || featureValue === undefined;
	}
	if (operator === 'is_not_null') {
		return featureValue !== null && featureValue !== undefined;
	}
	const numeric = field.type === 'date' ? toTimestamp(featureValue) : toNumber(featureValue);
	if (numeric === null) {
		return false;
	}
	switch (operator) {
		case '=':
			return value !== null && numeric === value;
		case '!=':
			return value !== null && numeric !== value;
		case '<':
			return value !== null && numeric < value;
		case '<=':
			return value !== null && numeric <= value;
		case '>':
			return value !== null && numeric > value;
		case '>=':
			return value !== null && numeric >= value;
		case 'between':
			if (value === null || value2 === null) {
				return false;
			}
			return numeric >= Math.min(value, value2) && numeric <= Math.max(value, value2);
		default:
			return false;
	}
};

const evaluateString = (
	operator: FilterCondition['operator'],
	value: string | string[],
	featureValue: unknown,
): boolean => {
	if (operator === 'is_null') {
		return featureValue === null || featureValue === undefined || featureValue === '';
	}
	if (operator === 'is_not_null') {
		return featureValue !== null && featureValue !== undefined && featureValue !== '';
	}
	const text = normaliseString(featureValue);
	if (!text) {
		return false;
	}
	const lower = text.toLowerCase();
	if (Array.isArray(value)) {
		const normalised = value.map((item) => normaliseString(item));
		switch (operator) {
			case 'in':
				return normalised.includes(text) || normalised.includes(lower) || normalised.includes(text.trim());
			default:
				return false;
		}
	}
	const target = normaliseString(value);
	switch (operator) {
		case '=':
			return text === target;
		case '!=':
			return text !== target;
		case 'contains':
			return target !== '' && lower.includes(target.toLowerCase());
		case 'startsWith':
			return lower.startsWith(target.toLowerCase());
		case 'in':
			return text === target;
		default:
			return false;
	}
};

const evaluateStatusIn = (selected: string[], featureValue: unknown): boolean => {
	const text = normaliseString(featureValue).toLowerCase();
	if (!text) return false;
	return selected.some((label) => normaliseString(label).toLowerCase() === text);
};

const evaluateCondition = (layerId: LayerId, feature: FeatureWithProps, condition: FilterCondition): boolean => {
	const field = getFieldSchema(layerId, condition.field);
	if (!field) {
		return false;
	}
	const properties = feature.properties ?? {};
	const accessor = resolveAccessor(field);
	const rawValue =
		properties[accessor] ??
		properties[condition.field] ??
		properties[field.name] ??
		properties[field.name.toLowerCase()];
	if (field.name.toLowerCase() === 'status' && condition.operator === 'in') {
		const selected = Array.isArray(condition.value)
			? condition.value.map((item) => normaliseString(item))
			: [normaliseString(condition.value)];
		return evaluateStatusIn(selected, rawValue);
	}
	if (field.type === 'number') {
		const primary = toNumber(condition.value);
		const secondary = toNumber(condition.value2);
		return evaluateNumeric(field, condition.operator, primary, secondary, rawValue);
	}
	if (field.type === 'date') {
		const primary = toTimestamp(condition.value);
		const secondary = toTimestamp(condition.value2);
		return evaluateNumeric(field, condition.operator, primary, secondary, rawValue);
	}
	return evaluateString(condition.operator, Array.isArray(condition.value) ? condition.value.map((item) => normaliseString(item)) : normaliseString(condition.value), rawValue);
};

const evaluateConditionList = (
	layerId: LayerId,
	feature: FeatureWithProps,
	conditions: FilterCondition[],
	join: FilterJoin,
): boolean => {
	if (conditions.length === 0) {
		return true;
	}
	if (join === 'all') {
		return conditions.every((condition) => evaluateCondition(layerId, feature, condition));
	}
	return conditions.some((condition) => evaluateCondition(layerId, feature, condition));
};

export const featureMatchesFilter = (
	layerId: LayerId,
	feature: FeatureWithProps,
	definition: FilterDefinition,
): boolean => {
	if (definition.conditions.length === 0) {
		return true;
	}
	return evaluateConditionList(layerId, feature, definition.conditions, definition.join);
};

import { FEATURE_ROW_ID_PROP } from '@/lib/featureId';

/** Symbology tiers implied by a status `in` filter (for map layer visibility). */
export const getStatusFilterTiers = (definition: FilterDefinition | null): Set<StatusSymbologyTier> | null => {
	if (!definition) return null;
	const statusCond = definition.conditions.find(
		(c) => c.field.toLowerCase() === 'status' && c.operator === 'in',
	);
	if (!statusCond) return null;
	const values = Array.isArray(statusCond.value) ? statusCond.value : [statusCond.value];
	const tiers = new Set<StatusSymbologyTier>();
	for (const value of values) {
		tiers.add(classifyStatusTier(value));
	}
	return tiers.size > 0 ? tiers : null;
};

export const definitionWithoutStatus = (definition: FilterDefinition): FilterDefinition => ({
	join: definition.join,
	conditions: definition.conditions.filter((c) => c.field !== 'status'),
});

export const buildIdMatchExpression = (ids: string[]): FilterExpression => {
	const accessor: FilterExpression = ['get', FEATURE_ROW_ID_PROP];
	if (ids.length === 0) {
		return ['==', accessor, '__no-match__'];
	}
	if (ids.length === 1) {
		return ['==', accessor, ids[0]];
	}
	// MapLibre 'match' requires labels as a plain array, NOT ['literal', [...]]
	return ['match', accessor, ids, true, false];
};
