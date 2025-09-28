import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';
import { ToastManagerProvider, Toaster } from '@/components/ui/use-toast';
import { useThemeStore } from '@/store/useTheme';

import '@/styles/tailwind.css';
import '@/styles/globals.css';
import '@/styles/theme.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@stadiamaps/maplibre-search-box/dist/maplibre-search-box.css';
import 'maplibre-gl-basemaps/lib/basemaps.css';

const ThemeInitializer = () => {
	const theme = useThemeStore((state) => state.theme);

	useEffect(() => {
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		root.setAttribute('data-theme', theme);
		root.style.setProperty('color-scheme', theme);
	}, [theme]);

	return null;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<ToastManagerProvider>
			<ThemeInitializer />
			<App />
			<Toaster />
		</ToastManagerProvider>
	</React.StrictMode>,
);
