import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Locale } from '@/i18n/types';
import { DEFAULT_LOCALE } from '@/i18n/types';

const STORAGE_KEY = 'sea-boundaries:locale';

interface LocaleStoreState {
	locale: Locale;
	setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create(
	persist<LocaleStoreState>(
		(set) => ({
			locale: DEFAULT_LOCALE,
			setLocale: (locale) => set({ locale }),
		}),
		{
			name: STORAGE_KEY,
			version: 1,
		},
	),
);
