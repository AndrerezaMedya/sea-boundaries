import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from '@/App';
import { ToastManagerProvider, Toaster } from '@/components/ui/use-toast';
import { useThemeStore } from '@/store/useTheme';

import '@/styles/tailwind.css';
import '@/styles/globals.css';
import '@/styles/theme.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-basemaps/lib/basemaps.css';

export const ThemeInitializer = () => {
	const theme = useThemeStore((state) => state.theme);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove('dark');
		root.setAttribute('data-theme', 'light');
		root.style.setProperty('color-scheme', 'light');
	}, [theme]);

	return null;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<ToastManagerProvider>
				<ThemeInitializer />
				<App />
				<Toaster />
			</ToastManagerProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
