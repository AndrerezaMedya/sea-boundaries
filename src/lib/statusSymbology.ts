import type { ExpressionSpecification, FilterSpecification } from 'maplibre-gl';

/** Dash panjang — disepakati, belum diratifikasi */
export const STATUS_DASH_LONG: [number, number] = [12, 5];

/** Dash pendek — belum / perlu kesepakatan */
export const STATUS_DASH_SHORT: [number, number] = [3, 2.5];

export type StatusSymbologyTier = 'solid' | 'long' | 'short';

export const STATUS_TIERS: StatusSymbologyTier[] = ['solid', 'long', 'short'];

/** Normalised MVT/GeoJSON `status` for filters and symbology (always lowercase string). */
export const statusPropertyExpression = (): ExpressionSpecification => [
	'downcase',
	['to-string', ['coalesce', ['get', 'status'], '']],
];

const statusField = statusPropertyExpression;

const statusContains = (needle: string): FilterSpecification => [
	'!=',
	['index-of', needle, statusField()],
	-1,
];

const STATUS_FILTER_LONG = [
	'any',
	statusContains('not ratif'),
	statusContains('belum ratifikasi'),
] as FilterSpecification;

const STATUS_FILTER_SHORT = [
	'all',
	[
		'any',
		statusContains('need agreement'),
		statusContains('perlu kesepakatan'),
		statusContains('unilateral proposed'),
		// DB may use em dash (—) between words
		statusContains('unilateral \u2014 proposed'),
	],
	['!', STATUS_FILTER_LONG],
] as FilterSpecification;

const STATUS_FILTER_DASHED_ANY = ['any', STATUS_FILTER_LONG, STATUS_FILTER_SHORT] as FilterSpecification;

/** MVT / GeoJSON filter: one status symbology tier per map layer. */
export function statusTierFilter(tier: StatusSymbologyTier): FilterSpecification {
	switch (tier) {
		case 'long':
			return STATUS_FILTER_LONG;
		case 'short':
			return STATUS_FILTER_SHORT;
		default:
			return ['!', STATUS_FILTER_DASHED_ANY] as FilterSpecification;
	}
}

/** Normalise status text for tier heuristics (em dash, en dash, hyphen → space). */
export const normalizeStatusKey = (status: unknown): string =>
	String(status ?? '')
		.trim()
		.toLowerCase()
		.replace(/\s*[—–−-]\s*/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

/** Classify status string (API / MVT `status` property) for symbology. */
export function classifyStatusTier(status: unknown): StatusSymbologyTier {
	if (status == null || status === '') return 'solid';
	const s = normalizeStatusKey(status);
	if (
		s.includes('not ratif') ||
		s.includes('belum ratifikasi') ||
		s === 'agreement not ratified' ||
		s === 'agreement not ratified yet' ||
		s === 'not ratified yet'
	) {
		return 'long';
	}
	if (
		s.includes('need agreement') ||
		s.includes('perlu kesepakatan') ||
		s.includes('unilateral proposed')
	) {
		return 'short';
	}
	return 'solid';
}

export function dashForStatusTier(tier: StatusSymbologyTier): number[] | undefined {
	switch (tier) {
		case 'long':
			return [...STATUS_DASH_LONG];
		case 'short':
			return [...STATUS_DASH_SHORT];
		default:
			return undefined;
	}
}

export const STATUS_LEGEND_ITEMS: { tier: StatusSymbologyTier; label: string }[] = [
	{ tier: 'solid', label: 'Unilateral / disepakati dan berlaku' },
	{ tier: 'long', label: 'Disepakati, belum diratifikasi' },
	{ tier: 'short', label: 'Belum disepakati / perlu kesepakatan' },
];

/** Map filter: feature status matches any of the selected symbology tiers. */
export function statusTiersUnionFilter(tiers: Iterable<StatusSymbologyTier>): FilterSpecification {
	const parts = [...tiers].map((tier) => statusTierFilter(tier));
	if (parts.length === 0) return ['all'] as FilterSpecification;
	if (parts.length === 1) return parts[0];
	return ['any', ...parts] as FilterSpecification;
}
