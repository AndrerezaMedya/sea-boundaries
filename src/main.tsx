import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';
import { ToastManagerProvider, Toaster } from '@/components/ui/use-toast';

import '@/styles/tailwind.css';
import '@/styles/globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<ToastManagerProvider>
			<App />
			<Toaster />
		</ToastManagerProvider>
	</React.StrictMode>,
);
