import { useCallback } from 'react';

import { normalizeLocale } from '@/i18n/locale';
import { t as translate } from '@/i18n/translate';
import type { Locale } from '@/i18n/types';
import { useLocaleStore } from '@/store/useLocale';

export function useWebGisT() {
	const locale = normalizeLocale(useLocaleStore((s) => s.locale));
	const tr = useCallback(
		(key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
		[locale],
	);
	return { locale, t: tr };
}

export function useWebGisLocale(): Locale {
	return useLocaleStore((s) => s.locale);
}
