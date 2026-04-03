import type { CoreLayerId, FilterDefinition } from '@/lib/types';

const LAST_FILTER_KEY = 'sea-boundaries:last-filter';
const LAST_USER_URL_KEY = 'sea-boundaries:last-user-url';

export type PersistedFilters = Partial<Record<CoreLayerId, FilterDefinition>>;

export const safeParseFilters = (coreLayerIds: CoreLayerId[]): PersistedFilters => {
	if (typeof window === 'undefined') {
		return {};
	}
	try {
		const raw = window.localStorage.getItem(LAST_FILTER_KEY);
		if (!raw) {
			return {};
		}
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') {
			return {};
		}
		const result: PersistedFilters = {};
		coreLayerIds.forEach((layerId) => {
			if (layerId in parsed) {
				result[layerId] = parsed[layerId];
			}
		});
		return result;
	} catch (error) {
		console.warn('Gagal memuat filter tersimpan', error);
		return {};
	}
};

export const persistFilters = (filters: PersistedFilters) => {
	if (typeof window === 'undefined') {
		return;
	}
	try {
		window.localStorage.setItem(LAST_FILTER_KEY, JSON.stringify(filters));
	} catch (error) {
		console.warn('Gagal menyimpan filter', error);
	}
};

export const readLastUserLayerUrl = (): string => {
	if (typeof window === 'undefined') {
		return '';
	}
	return window.localStorage.getItem(LAST_USER_URL_KEY) ?? '';
};

export const writeLastUserLayerUrl = (url: string) => {
	if (typeof window === 'undefined') {
		return;
	}
	try {
		window.localStorage.setItem(LAST_USER_URL_KEY, url);
	} catch (error) {
		console.warn('Gagal menyimpan URL layer pengguna', error);
	}
};
