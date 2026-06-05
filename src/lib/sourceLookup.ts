import Papa from 'papaparse';

import sourceCsvRaw from '../../data/source.csv?raw';

interface SourceCsvRow {
	sourceDocumentName?: string;
	sourceOnlineResourceLinkageURL?: string;
}

export interface SourceLink {
	label: string;
	url: string;
}

const DATE_PATTERN =
	/\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i;

const STOP_WORDS = new Set([
	'a',
	'an',
	'and',
	'at',
	'between',
	'in',
	'of',
	'on',
	'relating',
	'the',
	'to',
	'with',
]);

const normaliseSourceText = (value: string): string =>
	value
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.replace(/[“”"]/g, '')
		.trim();

const extractDateKey = (value: string): string | null => value.match(DATE_PATTERN)?.[0].toLowerCase() ?? null;

const tokeniseSourceText = (value: string): Set<string> =>
	new Set(
		normaliseSourceText(value)
			.replace(/[^a-z0-9]+/g, ' ')
			.split(' ')
			.filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
	);

const getTokenCoverage = (fragmentTokens: Set<string>, rowTokens: Set<string>): number => {
	if (fragmentTokens.size === 0) {
		return 0;
	}

	let matches = 0;
	fragmentTokens.forEach((token) => {
		if (rowTokens.has(token)) {
			matches += 1;
		}
	});

	return matches / fragmentTokens.size;
};

const sourceRows = Papa.parse<SourceCsvRow>(sourceCsvRaw, {
	header: true,
	skipEmptyLines: true,
}).data
	.map((row) => ({
		name: row.sourceDocumentName?.trim() ?? '',
		url: row.sourceOnlineResourceLinkageURL?.trim() ?? '',
	}))
	.filter((row) => row.name.length > 0 && row.url.length > 0)
	.map((row) => ({
		...row,
		normalisedName: normaliseSourceText(row.name),
		dateKey: extractDateKey(row.name),
		tokens: tokeniseSourceText(row.name),
	}));

const splitSourceFragments = (sourceText: string): string[] => {
	const numberedParts = sourceText
		.split(/\s*\d+\.\s+/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (numberedParts.length > 1) {
		return numberedParts;
	}

	return [sourceText.trim()].filter(Boolean);
};

const findSourceMatch = (fragment: string): SourceLink | null => {
	const normalisedFragment = normaliseSourceText(fragment);
	if (normalisedFragment.length < 12) {
		return null;
	}

	const exactOrSubstringMatch = sourceRows.find(
		(row) =>
			row.normalisedName === normalisedFragment ||
			row.normalisedName.includes(normalisedFragment) ||
			normalisedFragment.includes(row.normalisedName),
	);

	const match =
		exactOrSubstringMatch ??
		sourceRows.find((row) => {
			const fragmentDateKey = extractDateKey(fragment);
			const hasConflictingDate =
				fragmentDateKey !== null && row.dateKey !== null && fragmentDateKey !== row.dateKey;
			if (hasConflictingDate) {
				return false;
			}

			const coverage = getTokenCoverage(tokeniseSourceText(fragment), row.tokens);
			if (fragmentDateKey !== null && fragmentDateKey === row.dateKey) {
				return coverage >= 0.55;
			}

			return coverage >= 0.75;
		});

	if (!match) {
		return null;
	}

	return {
		label: fragment,
		url: match.url,
	};
};

export const resolveSourceLinks = (sourceValue: unknown): SourceLink[] => {
	if (typeof sourceValue !== 'string') {
		return [];
	}

	const seenUrls = new Set<string>();
	return splitSourceFragments(sourceValue)
		.map(findSourceMatch)
		.filter((link): link is SourceLink => link !== null)
		.filter((link) => {
			if (seenUrls.has(link.url)) {
				return false;
			}
			seenUrls.add(link.url);
			return true;
		});
};
