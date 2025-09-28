import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
	theme: ThemeMode;
	setTheme: (mode: ThemeMode) => void;
	toggleTheme: () => void;
}

const STORAGE_KEY = 'sea-boundaries:theme';

export const useThemeStore = create(
	persist<ThemeState>(
		(set, get) => ({
			theme: 'light',
			setTheme: (mode) => set({ theme: mode }),
			toggleTheme: () => {
				const next = get().theme === 'light' ? 'dark' : 'light';
				set({ theme: next });
			},
		}),
		{
			name: STORAGE_KEY,
			version: 1,
		},
	),
);
