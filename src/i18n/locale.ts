import type { Locale } from '@/i18n/types';
import { DEFAULT_LOCALE } from '@/i18n/types';
import { useLocaleStore } from '@/store/useLocale';

const STORAGE_KEY = 'sea-boundaries:locale';

export function normalizeLocale(raw: unknown): Locale {
	if (raw === 'en' || raw === 'EN') return 'en';
	return 'id';
}

/** Read persisted locale (works before zustand rehydration finishes). */
export function readPersistedLocale(): Locale {
	if (typeof window === 'undefined') return DEFAULT_LOCALE;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_LOCALE;
		const parsed = JSON.parse(raw) as { state?: { locale?: unknown } };
		return normalizeLocale(parsed?.state?.locale);
	} catch {
		return DEFAULT_LOCALE;
	}
}

/** Locale for map popups and other non-React code paths. */
export function getActiveLocale(): Locale {
	const fromStore = useLocaleStore.getState().locale;
	return normalizeLocale(fromStore ?? readPersistedLocale());
}
