import type { FieldSchema } from '@/lib/types';

const YEAR_FIELD_PATTERN = /(tahun|thn|year)/i;

const toNumeric = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			return null;
		}
		const parsed = Number(trimmed);
		if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
			return parsed;
		}
	}
	return null;
};

const isYearField = (field: FieldSchema | null | undefined): boolean => {
	if (!field) {
		return false;
	}
	return YEAR_FIELD_PATTERN.test(field.name) || YEAR_FIELD_PATTERN.test(field.label);
};

const isYearValue = (numeric: number): boolean => Number.isInteger(numeric) && numeric >= 1000 && numeric <= 9999;

const formatDateValue = (value: unknown): string => {
	if (value === undefined || value === null) {
		return '—';
	}
	if (typeof value === 'number') {
		return new Date(value).toLocaleDateString('id-ID');
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			return '—';
		}
		const parsed = new Date(trimmed);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toLocaleDateString('id-ID');
		}
		const parts = trimmed.split('-');
		if (parts.length === 3) {
			const [first, second, third] = parts;
			if (first.length === 2 && third.length === 4) {
				return `${first}/${second}/${third}`;
			}
		}
		return trimmed;
	}
	return String(value);
};

export const formatFieldValue = (field: FieldSchema | null | undefined, value: unknown): string => {
	if (value === undefined || value === null || value === '') {
		return '—';
	}

	if (field?.type === 'date') {
		return formatDateValue(value);
	}

	if (field?.type === 'number') {
		const numeric = toNumeric(value);
		if (numeric !== null) {
			if (isYearField(field) && isYearValue(numeric)) {
				return String(Math.trunc(numeric));
			}
			return numeric.toLocaleString('id-ID');
		}
	}

	return String(value);
};
