import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': resolve(rootDir, 'src'),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					const normalizedId = id.replace(/\\/g, '/');

					if (normalizedId.includes('/data/pembaharuan/')) {
						if (
							normalizedId.includes('TitikDasar') ||
							normalizedId.includes('TitikPerjanjian')
						) {
							return 'dataset-points';
						}

						if (
							normalizedId.includes('BZEE') ||
							normalizedId.includes('LandasKontinen')
						) {
							return 'dataset-zones';
						}

						return 'dataset-lines';
					}

					if (!normalizedId.includes('/node_modules/')) return;

					if (
						normalizedId.includes('/maplibre-gl/') ||
						normalizedId.includes('/maplibre-gl/dist/')
					) {
						return 'vendor-map-core';
					}

					if (
						normalizedId.includes('@stadiamaps/maplibre-search-box') ||
						normalizedId.includes('maplibre-gl-basemaps') ||
						normalizedId.includes('maplibre-gl-style-flipper')
					) {
						return 'vendor-map-controls';
					}

					if (normalizedId.includes('/@turf/')) {
						return 'vendor-geo';
					}

					if (
						normalizedId.includes('react-dom') ||
						normalizedId.includes('react-router') ||
						normalizedId.includes('/react/') ||
						normalizedId.includes('zustand') ||
						normalizedId.includes('motion') ||
						normalizedId.includes('framer-motion') ||
						normalizedId.includes('lucide-react')
					) {
						return 'vendor-react';
					}

					if (normalizedId.includes('@radix-ui')) {
						return 'vendor-radix';
					}

					if (normalizedId.includes('papaparse')) {
						return 'vendor-data';
					}

					return 'vendor-misc';
				},
			},
		},
	},
});
