import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light';

interface ThemeState {
	theme: ThemeMode;
	setTheme: (mode: ThemeMode) => void;
	toggleTheme: () => void;
}

const STORAGE_KEY = 'sea-boundaries:theme';

export const useThemeStore = create(
	persist<ThemeState>(
		(set) => ({
			theme: 'light',
			setTheme: () => set({ theme: 'light' }),
			toggleTheme: () => {
				set({ theme: 'light' });
			},
		}),
		{
			name: STORAGE_KEY,
			version: 2,
		},
	),
);
