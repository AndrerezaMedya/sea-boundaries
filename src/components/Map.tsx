import { useEffect, useRef } from 'react';
import { bbox } from '@turf/turf';
import maplibregl, { Map as MapLibreMap, NavigationControl, Popup, ScaleControl } from 'maplibre-gl';
import { MapLibreSearchControl } from '@stadiamaps/maplibre-search-box';
import BasemapsControl from 'maplibre-gl-basemaps';
import StyleFlipperControl from 'maplibre-gl-style-flipper';
import type { FilterSpecification, GeoJSONSource, LayerSpecification, MapLayerMouseEvent, RasterSourceSpecification } from 'maplibre-gl';
import type { FeatureCollection, Geometry } from 'geojson';

import { rasterBasemaps, DEFAULT_RASTER_BASEMAP_ID } from '@/data/basemaps';
import type { MapStyleKey } from '@/data/mapStyles';
import { DEFAULT_MAP_STYLE, mapStyles } from '@/data/mapStyles';
import { buildIdMatchExpression } from '@/lib/filterExpr';
import { EMPTY_GEOJSON, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, buildPopupHtml, getBaseMapStyle } from '@/lib/map';
import { LAYER_DISPLAY_ORDER } from '@/lib/schema';
import type { FeatureWithProps, LayerId, MapRenderKind } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';
import { useThemeStore } from '@/store/useTheme';

type MapGeometryType = 'line' | 'circle' | 'fill';

interface LayerPaintConfig {
	base: Record<string, unknown>;
	filtered: Record<string, unknown>;
	selection: Record<string, unknown>;
	hover: Record<string, unknown>;
}

interface MapLayerConfig {
	renderKind: MapRenderKind;
	sourceId: string;
	baseLayerId: string;
	filteredLayerId: string;
	selectionLayerId: string;
	hoverLayerId: string;
	type: MapGeometryType;
	layout?: Record<string, unknown>;
	paint: LayerPaintConfig;
}

const zoneColorExpression: unknown[] = [
	'match',
	['coalesce', ['get', 'TipeZona'], ''],
	'Teritorial', '#2563eb',
	'Teritorial Laut', '#2563eb',
	'Zona Tambahan', '#0ea5e9',
	'ZEE', '#16a34a',
	'Landas Kontinen', '#f59e0b',
	'Landas Kontinen Ekstensi', '#f97316',
	'#64748b',
];

const ALL_LAYER_IDS: LayerId[] = [...LAYER_DISPLAY_ORDER, USER_LAYER_ID];

const mapLayerConfigs: Record<LayerId, MapLayerConfig[]> = {
	batas_maritim: [
		{
			renderKind: 'line',
			sourceId: 'source-batas-maritim',
			baseLayerId: 'layer-batas-maritim-base',
			filteredLayerId: 'layer-batas-maritim-filtered',
			selectionLayerId: 'layer-batas-maritim-selected',
			hoverLayerId: 'layer-batas-maritim-hover',
			type: 'line',
			layout: {
				'line-cap': 'round',
				'line-join': 'round',
			},
			paint: {
				base: {
					'line-color': zoneColorExpression,
					'line-width': 2.8,
					'line-opacity': 0.85,
					'line-dasharray': [1, 0],
				},
				filtered: {
					'line-color': zoneColorExpression,
					'line-width': 3.6,
					'line-opacity': 0.9,
				},
				selection: {
					'line-color': '#f97316',
					'line-width': 5,
					'line-opacity': 0.95,
				},
				hover: {
					'line-color': '#eab308',
					'line-width': 4.2,
					'line-opacity': 0.95,
				},
			},
		},
	],
	baseline: [
		{
			renderKind: 'line',
			sourceId: 'source-baseline',
			baseLayerId: 'layer-baseline-base',
			filteredLayerId: 'layer-baseline-filtered',
			selectionLayerId: 'layer-baseline-selected',
			hoverLayerId: 'layer-baseline-hover',
			type: 'line',
			layout: {
				'line-cap': 'round',
				'line-join': 'round',
			},
			paint: {
				base: {
					'line-color': '#1e293b',
					'line-width': 2.4,
					'line-opacity': 0.8,
				},
				filtered: {
					'line-color': '#2563eb',
					'line-width': 3.2,
					'line-opacity': 0.95,
				},
				selection: {
					'line-color': '#f97316',
					'line-width': 4,
					'line-opacity': 0.95,
				},
				hover: {
					'line-color': '#eab308',
					'line-width': 3.5,
					'line-opacity': 0.95,
				},
			},
		},
	],
	titik_perjanjian: [
		{
			renderKind: 'circle',
			sourceId: 'source-titik-perjanjian',
			baseLayerId: 'layer-titik-perjanjian-base',
			filteredLayerId: 'layer-titik-perjanjian-filtered',
			selectionLayerId: 'layer-titik-perjanjian-selected',
			hoverLayerId: 'layer-titik-perjanjian-hover',
			type: 'circle',
			paint: {
				base: {
					'circle-radius': 5,
					'circle-color': '#0ea5e9',
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 1.1,
					'circle-opacity': 0.8,
				},
				filtered: {
					'circle-radius': 6.2,
					'circle-color': '#0ea5e9',
					'circle-stroke-color': '#1f2937',
					'circle-stroke-width': 2,
					'circle-opacity': 0.9,
				},
				selection: {
					'circle-radius': 7.4,
					'circle-color': '#f97316',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2.2,
					'circle-opacity': 0.95,
				},
				hover: {
					'circle-radius': 6.8,
					'circle-color': '#eab308',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2,
					'circle-opacity': 0.95,
				},
			},
		},
	],
	basepoints: [
		{
			renderKind: 'circle',
			sourceId: 'source-basepoints',
			baseLayerId: 'layer-basepoints-base',
			filteredLayerId: 'layer-basepoints-filtered',
			selectionLayerId: 'layer-basepoints-selected',
			hoverLayerId: 'layer-basepoints-hover',
			type: 'circle',
			paint: {
				base: {
					'circle-radius': 4.5,
					'circle-color': '#1d4ed8',
					'circle-opacity': 0.75,
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 1,
				},
				filtered: {
					'circle-radius': 5.8,
					'circle-color': '#1d4ed8',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 1.8,
					'circle-opacity': 0.9,
				},
				selection: {
					'circle-radius': 7,
					'circle-color': '#f97316',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2.2,
					'circle-opacity': 0.95,
				},
				hover: {
					'circle-radius': 6.2,
					'circle-color': '#eab308',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2,
					'circle-opacity': 0.95,
				},
			},
		},
	],
	[USER_LAYER_ID]: [
		{
			renderKind: 'circle',
			sourceId: 'source-user-layer',
			baseLayerId: 'layer-user-circle-base',
			filteredLayerId: 'layer-user-circle-filtered',
			selectionLayerId: 'layer-user-circle-selected',
			hoverLayerId: 'layer-user-circle-hover',
			type: 'circle',
			paint: {
				base: {
					'circle-radius': 5.2,
					'circle-color': '#14b8a6',
					'circle-opacity': 0.78,
					'circle-stroke-color': '#f8fafc',
					'circle-stroke-width': 1.2,
				},
				filtered: {
					'circle-radius': 6.4,
					'circle-color': '#0ea5e9',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2,
					'circle-opacity': 0.9,
				},
				selection: {
					'circle-radius': 7.6,
					'circle-color': '#f97316',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2.2,
					'circle-opacity': 0.95,
				},
				hover: {
					'circle-radius': 6.8,
					'circle-color': '#facc15',
					'circle-stroke-color': '#0f172a',
					'circle-stroke-width': 2,
					'circle-opacity': 0.95,
				},
			},
		},
		{
			renderKind: 'line',
			sourceId: 'source-user-layer',
			baseLayerId: 'layer-user-line-base',
			filteredLayerId: 'layer-user-line-filtered',
			selectionLayerId: 'layer-user-line-selected',
			hoverLayerId: 'layer-user-line-hover',
			type: 'line',
			layout: {
				'line-cap': 'round',
				'line-join': 'round',
			},
			paint: {
				base: {
					'line-color': '#0f766e',
					'line-width': 2.6,
					'line-opacity': 0.82,
				},
				filtered: {
					'line-color': '#0ea5e9',
					'line-width': 3.4,
					'line-opacity': 0.9,
				},
				selection: {
					'line-color': '#f97316',
					'line-width': 4.6,
					'line-opacity': 0.95,
				},
				hover: {
					'line-color': '#facc15',
					'line-width': 3.8,
					'line-opacity': 0.95,
				},
			},
		},
		{
			renderKind: 'fill',
			sourceId: 'source-user-layer',
			baseLayerId: 'layer-user-fill-base',
			filteredLayerId: 'layer-user-fill-filtered',
			selectionLayerId: 'layer-user-fill-selected',
			hoverLayerId: 'layer-user-fill-hover',
			type: 'fill',
			paint: {
				base: {
					'fill-color': '#38bdf8',
					'fill-opacity': 0.28,
					'fill-outline-color': '#0f172a',
				},
				filtered: {
					'fill-color': '#0ea5e9',
					'fill-opacity': 0.45,
					'fill-outline-color': '#0f172a',
				},
				selection: {
					'fill-color': '#f97316',
					'fill-opacity': 0.55,
					'fill-outline-color': '#7c2d12',
				},
				hover: {
					'fill-color': '#facc15',
					'fill-opacity': 0.5,
					'fill-outline-color': '#ca8a04',
				},
			},
		},
	],
};

const CUSTOM_SOURCE_IDS = new Set<string>();
const CUSTOM_LAYER_IDS = new Set<string>();

Object.values(mapLayerConfigs).forEach((configs) => {
	configs.forEach((config) => {
		CUSTOM_SOURCE_IDS.add(config.sourceId);
		CUSTOM_LAYER_IDS.add(config.baseLayerId);
		CUSTOM_LAYER_IDS.add(config.filteredLayerId);
		CUSTOM_LAYER_IDS.add(config.selectionLayerId);
		CUSTOM_LAYER_IDS.add(config.hoverLayerId);
	});
});

interface CapturedLayerState {
	definition: LayerSpecification;
	beforeId: string | null;
}

interface CapturedMapState {
	sources: Record<string, unknown>;
	layers: Record<string, CapturedLayerState>;
}

const captureCustomLayers = (map: MapLibreMap): CapturedMapState => {
	const style = map.getStyle();
	const captured: CapturedMapState = {
		sources: {},
		layers: {},
	};

	Object.entries(style.sources ?? {}).forEach(([sourceId, sourceSpec]) => {
		if (!CUSTOM_SOURCE_IDS.has(sourceId)) {
			return;
		}
		captured.sources[sourceId] = JSON.parse(JSON.stringify(sourceSpec));
	});

	const layers = style.layers ?? [];
	layers.forEach((layer, index) => {
		if (!CUSTOM_LAYER_IDS.has(layer.id)) {
			return;
		}
		let beforeId: string | null = null;
		for (let i = index + 1; i < layers.length; i += 1) {
			const candidate = layers[i].id;
			if (!CUSTOM_LAYER_IDS.has(candidate)) {
				beforeId = candidate;
				break;
			}
		}
		captured.layers[layer.id] = {
			definition: JSON.parse(JSON.stringify(layer)) as LayerSpecification,
			beforeId,
		};
	});

	return captured;
};

const reapplyCustomLayers = (map: MapLibreMap, captured: CapturedMapState) => {
	Object.entries(captured.sources).forEach(([sourceId, sourceSpec]) => {
		const source = map.getSource(sourceId);
		if (source && 'setData' in source && sourceSpec && typeof sourceSpec === 'object' && sourceSpec !== null) {
			const geoSpec = sourceSpec as { data?: unknown };
			if (geoSpec.data) {
				try {
					(source as GeoJSONSource).setData(geoSpec.data as FeatureCollection<Geometry>);
				} catch (error) {
					console.warn(`Gagal mengatur ulang data untuk source ${sourceId}`, error);
				}
			}
		}
	});

	Object.values(captured.layers).forEach(({ definition, beforeId }) => {
		const layerId = definition.id;
		const filter = (definition as unknown as { filter?: FilterSpecification }).filter;
		const layout = (definition as unknown as { layout?: Record<string, unknown> }).layout;
		const paint = (definition as unknown as { paint?: Record<string, unknown> }).paint;
		if (!map.getLayer(layerId)) {
			try {
				map.addLayer(definition);
			} catch (error) {
				console.warn(`Tidak dapat menambahkan layer ${layerId} saat pemulihan`, error);
			}
		}
		if (filter) {
			try {
				map.setFilter(layerId, filter as FilterSpecification);
			} catch (error) {
				console.warn(`Tidak dapat memulihkan filter untuk layer ${layerId}`, error);
			}
		}
		if (layout) {
			Object.entries(layout).forEach(([key, value]) => {
				try {
					map.setLayoutProperty(layerId, key, value as unknown);
				} catch (error) {
					console.warn(`Tidak dapat memulihkan properti layout ${key} pada layer ${layerId}`, error);
				}
			});
		}
		if (paint) {
			Object.entries(paint).forEach(([key, value]) => {
				try {
					map.setPaintProperty(layerId, key, value as unknown);
				} catch (error) {
					console.warn(`Tidak dapat memulihkan properti paint ${key} pada layer ${layerId}`, error);
				}
			});
		}
		if (beforeId && map.getLayer(beforeId)) {
			try {
				map.moveLayer(layerId, beforeId);
			} catch (error) {
				console.warn(`Tidak dapat memindahkan layer ${layerId} sebelum ${beforeId}`, error);
			}
		}
	});
};

const popupButtonClass =
	'inline-flex min-h-[32px] items-center justify-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300';

const MapView = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const mapReadyRef = useRef(false);
	const capturedStateRef = useRef<CapturedMapState | null>(null);
	const theme = useThemeStore((state) => state.theme);
	const setTheme = useThemeStore((state) => state.setTheme);
	const initialThemeRef = useRef<MapStyleKey>(theme);

	const layersState = useLayersStore((state) => state.layers);
	const pendingZoom = useLayersStore((state) => state.pendingZoom);
	const consumeZoomRequest = useLayersStore((state) => state.consumeZoomRequest);
	const getFeatureById = useLayersStore((state) => state.getFeatureById);
	const setSelection = useLayersStore((state) => state.setSelection);
	const setHoveredFeature = useLayersStore((state) => state.setHoveredFeature);
	const setActiveLayer = useLayersStore((state) => state.setActiveLayer);
	const requestZoomToIds = useLayersStore((state) => state.requestZoomToIds);
	const setActiveTab = useUIStore((state) => state.setActiveTab);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const initialTheme = initialThemeRef.current;
		const initialStyleKey: MapStyleKey = initialTheme ?? DEFAULT_MAP_STYLE;
		const initialStyleCandidate = mapStyles[initialStyleKey]?.url;
		const map = new maplibregl.Map({
			container: containerRef.current,
			style: typeof initialStyleCandidate === 'string' ? initialStyleCandidate : getBaseMapStyle(),
			center: MAP_DEFAULT_CENTER,
			zoom: MAP_DEFAULT_ZOOM,
		});
		mapRef.current = map;

		const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: 'app-popup' });
		popupRef.current = popup;

		const navigationControl = new NavigationControl({ visualizePitch: true });
		map.addControl(navigationControl, 'top-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-right');

		const accessibilityCleanup: Array<() => void> = [];

		const searchControl = new MapLibreSearchControl({
			useMapFocusPoint: true,
			mapFocusPointMinZoom: 5,
			maxResults: 8,
			minWaitPeriodMs: 150,
			onResultSelected: () => {
				popup.remove();
			},
		});
		const controlWithApi = searchControl as unknown as {
			api?: {
				configuration?: {
					configuration?: Record<string, unknown>;
					config?: Record<string, unknown>;
				};
			};
		};
		const stadiaApiKey = import.meta.env.VITE_STADIA_MAPS_API_KEY;
		if (stadiaApiKey && controlWithApi.api?.configuration) {
			const configWrapper = controlWithApi.api.configuration;
			const baseConfig = (configWrapper.configuration ?? {}) as Record<string, unknown>;
			const nextConfig = {
				...baseConfig,
				apiKey: stadiaApiKey,
			};
			try {
				// prefer setter when available to preserve internal observers
				configWrapper.config = nextConfig;
			} catch {
				// fallback to direct mutation if setter is unavailable in future versions
				configWrapper.configuration = nextConfig;
			}
		} else if (!stadiaApiKey) {
			console.warn('VITE_STADIA_MAPS_API_KEY is not defined; Stadia Maps search will use anonymous access.');
		}
		map.addControl(searchControl, 'top-left');

		const searchContainer = typeof searchControl.getContainer === 'function' ? searchControl.getContainer() : null;
		if (searchContainer) {
			searchContainer.setAttribute('role', 'search');
			searchContainer.setAttribute('aria-label', 'Pencarian lokasi Stadia Maps');
			const searchInput = searchContainer.querySelector('input');
			if (searchInput) {
				searchInput.setAttribute('aria-label', 'Cari lokasi di peta');
				const keyHandler = (event: KeyboardEvent) => {
					if (event.key === 'Escape') {
						(event.currentTarget as HTMLInputElement).blur();
					}
				};
				searchInput.addEventListener('keydown', keyHandler);
				accessibilityCleanup.push(() => searchInput.removeEventListener('keydown', keyHandler));
			}
		}

		const basemapDefinitions = rasterBasemaps.map((basemap) => {
			const source: Record<string, unknown> = {};
			if (typeof basemap.tileSize === 'number') {
				source.tileSize = basemap.tileSize;
			}
			if (typeof basemap.attribution === 'string') {
				source.attribution = basemap.attribution;
			}
			if (typeof basemap.minZoom === 'number') {
				source.minzoom = basemap.minZoom;
			}
			if (typeof basemap.maxZoom === 'number') {
				source.maxzoom = basemap.maxZoom;
			}
			const layer: Record<string, unknown> = {};
			if (typeof basemap.minZoom === 'number') {
				layer.minzoom = basemap.minZoom;
			}
			if (typeof basemap.maxZoom === 'number') {
				layer.maxzoom = basemap.maxZoom;
			}
			return {
				id: basemap.id,
				tiles: basemap.tiles,
				source,
				layer,
			};
		});

		const basemapControl = new BasemapsControl({
			basemaps: basemapDefinitions.map((definition) => ({
				id: definition.id,
				tiles: definition.tiles,
				sourceExtraParams: definition.source,
				layerExtraParams: definition.layer,
			})),
			initialBasemap: DEFAULT_RASTER_BASEMAP_ID,
			expandDirection: 'down',
		});
		map.addControl(basemapControl, 'top-left');

		const basemapContainer = (basemapControl as unknown as { _container?: HTMLElement })._container;
		const ensureBasemapLayers = () => {
			if (!map.getStyle() || !map.isStyleLoaded()) {
				return;
			}
			let activeThumbnail = basemapContainer?.querySelector<HTMLImageElement>('.basemap.active') ?? null;
			if (!activeThumbnail) {
				activeThumbnail = basemapContainer?.querySelector<HTMLImageElement>(`.basemap[data-id="${DEFAULT_RASTER_BASEMAP_ID}"]`) ?? null;
				if (activeThumbnail) {
					activeThumbnail.classList.add('active');
				}
			}
			const activeId = activeThumbnail?.dataset.id ?? DEFAULT_RASTER_BASEMAP_ID;
			const styleLayers = map.getStyle().layers ?? [];
			const firstNonBackground = styleLayers.find((layer) => layer.type !== 'background');
			const beforeId = firstNonBackground?.id;

			basemapDefinitions.forEach((definition) => {
				if (!map.getSource(definition.id)) {
					const sourceConfig: Record<string, unknown> = {
						type: 'raster',
						tiles: definition.tiles,
					};
					if (typeof definition.source.tileSize === 'number') {
						sourceConfig.tileSize = definition.source.tileSize;
					}
					if (typeof definition.source.minzoom === 'number') {
						sourceConfig.minzoom = definition.source.minzoom;
					}
					if (typeof definition.source.maxzoom === 'number') {
						sourceConfig.maxzoom = definition.source.maxzoom;
					}
					if (typeof definition.source.attribution === 'string') {
						sourceConfig.attribution = definition.source.attribution;
					}
					map.addSource(definition.id, sourceConfig as RasterSourceSpecification);
				}
				const visibility = definition.id === activeId ? 'visible' : 'none';
				if (!map.getLayer(definition.id)) {
					const layerConfig: Record<string, unknown> = {
						id: definition.id,
						type: 'raster',
						source: definition.id,
						layout: {
							visibility,
						},
					};
					if (typeof definition.layer.minzoom === 'number') {
						layerConfig.minzoom = definition.layer.minzoom;
					}
					if (typeof definition.layer.maxzoom === 'number') {
						layerConfig.maxzoom = definition.layer.maxzoom;
					}
					map.addLayer(layerConfig as LayerSpecification, beforeId);
				} else {
					map.setLayoutProperty(definition.id, 'visibility', visibility);
				}
			});
		};

		map.on('style.load', ensureBasemapLayers);
		if (map.isStyleLoaded()) {
			ensureBasemapLayers();
		}
		if (basemapContainer) {
			const basemapObserver = new MutationObserver(() => {
				basemapContainer.querySelectorAll<HTMLImageElement>('img.basemap').forEach((img) => {
					img.setAttribute('aria-pressed', img.classList.contains('active') ? 'true' : 'false');
				});
			});
			basemapObserver.observe(basemapContainer, { subtree: true, attributes: true, attributeFilter: ['class'] });
			accessibilityCleanup.push(() => basemapObserver.disconnect());
			basemapContainer.setAttribute('role', 'group');
			basemapContainer.setAttribute('aria-label', 'Pemilih basemap raster');
			basemapContainer.querySelectorAll<HTMLImageElement>('img.basemap').forEach((img) => {
				const identifier = img.dataset.id ?? '';
				const definition = rasterBasemaps.find((entry) => entry.id === identifier);
				img.alt = definition?.label ?? `Basemap ${identifier}`;
				img.setAttribute('tabindex', '0');
				img.setAttribute('role', 'button');
				img.setAttribute('aria-pressed', img.classList.contains('active') ? 'true' : 'false');
				const keyHandler = (event: KeyboardEvent) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						img.click();
					}
				};
				img.addEventListener('keydown', keyHandler);
				const ensureOnClick = () => {
					if (!map.isStyleLoaded()) {
						return;
					}
					ensureBasemapLayers();
				};
				const ensureOnKey = (event: KeyboardEvent) => {
					if (event.key === 'Enter' || event.key === ' ') {
						ensureBasemapLayers();
					}
				};
				img.addEventListener('click', ensureOnClick, true);
				img.addEventListener('keydown', ensureOnKey, true);
				accessibilityCleanup.push(() => {
					img.removeEventListener('keydown', keyHandler);
					img.removeEventListener('click', ensureOnClick, true);
					img.removeEventListener('keydown', ensureOnKey, true);
				});
			});
		}

		const styleDefinitions = Object.fromEntries(
			Object.entries(mapStyles).map(([key, value]) => [key, { ...value }]),
		);
		const styleControl = new StyleFlipperControl(styleDefinitions, (_styleKey, styleCode) => {
			const nextMode: 'light' | 'dark' = styleCode.toLowerCase().includes('dark') ? 'dark' : 'light';
			setTheme(nextMode);
		});
		const styleControlAny = styleControl as unknown as {
			saveCustomSourcesAndLayers?: () => void;
			restoreCustomSourcesAndLayers?: () => void;
			setCurrentStyleCode?: (code: string) => void;
			_container?: HTMLElement;
		};

		if (styleControlAny.saveCustomSourcesAndLayers) {
			const originalSave = styleControlAny.saveCustomSourcesAndLayers.bind(styleControlAny);
			styleControlAny.saveCustomSourcesAndLayers = () => {
				capturedStateRef.current = captureCustomLayers(map);
				originalSave();
			};
		}

		if (styleControlAny.restoreCustomSourcesAndLayers) {
			const originalRestore = styleControlAny.restoreCustomSourcesAndLayers.bind(styleControlAny);
			styleControlAny.restoreCustomSourcesAndLayers = () => {
				originalRestore();
				if (capturedStateRef.current) {
					reapplyCustomLayers(map, capturedStateRef.current);
					syncMapWithState(map, useLayersStore.getState().layers);
					capturedStateRef.current = null;
				}
			};
		}

		map.addControl(styleControl, 'bottom-left');
		if (styleControlAny.setCurrentStyleCode) {
			styleControlAny.setCurrentStyleCode(mapStyles[initialStyleKey].code);
		}

		const styleContainer = styleControlAny._container;
		if (styleContainer) {
			const updateAriaPressed = () => {
				styleContainer.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
					button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
				});
			};
			const styleObserver = new MutationObserver(updateAriaPressed);
			styleObserver.observe(styleContainer, { subtree: true, attributes: true, attributeFilter: ['class'] });
			accessibilityCleanup.push(() => styleObserver.disconnect());
			styleContainer.setAttribute('role', 'group');
			styleContainer.setAttribute('aria-label', 'Pemilih gaya peta vektor');
			styleContainer.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
				button.setAttribute('tabindex', '0');
				const keyHandler = (event: KeyboardEvent) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						button.click();
					}
				};
				button.addEventListener('keydown', keyHandler);
				accessibilityCleanup.push(() => button.removeEventListener('keydown', keyHandler));
			});
			updateAriaPressed();
		}

		const initialiseSources = () => {
			ALL_LAYER_IDS.forEach((layerId) => {
				const configs = mapLayerConfigs[layerId] ?? [];
				configs.forEach((config) => {
					if (!map.getSource(config.sourceId)) {
						map.addSource(config.sourceId, {
							type: 'geojson',
							data: EMPTY_GEOJSON,
						});
					}
					const baseLayer: LayerSpecification = {
						id: config.baseLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.base,
					};
					if (!map.getLayer(config.baseLayerId)) {
						map.addLayer(baseLayer);
					}
					const filteredLayer: LayerSpecification = {
						id: config.filteredLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.filtered,
						filter: buildIdMatchExpression([]) as any,
					};
					if (!map.getLayer(config.filteredLayerId)) {
						map.addLayer(filteredLayer);
					}
					const selectionLayer: LayerSpecification = {
						id: config.selectionLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.selection,
						filter: buildIdMatchExpression([]) as any,
					};
					if (!map.getLayer(config.selectionLayerId)) {
						map.addLayer(selectionLayer);
					}
					const hoverLayer: LayerSpecification = {
						id: config.hoverLayerId,
						type: config.type,
						source: config.sourceId,
						layout: { visibility: 'none', ...(config.layout ?? {}) },
						paint: config.paint.hover,
						filter: buildIdMatchExpression([]) as any,
					};
					if (!map.getLayer(config.hoverLayerId)) {
						map.addLayer(hoverLayer);
					}
					const interactiveLayers = [
						config.baseLayerId,
						config.filteredLayerId,
						config.selectionLayerId,
						config.hoverLayerId,
					];
					interactiveLayers.forEach((mapLayerId) => {
						map.on('mouseenter', mapLayerId, () => {
							map.getCanvas().style.cursor = 'pointer';
						});
						map.on('mouseleave', mapLayerId, () => {
							map.getCanvas().style.cursor = '';
							const currentHovered = useLayersStore.getState().layers[layerId]?.hoveredId ?? null;
							if (currentHovered !== null) {
								setHoveredFeature(layerId, null);
							}
						});
						map.on('mousemove', mapLayerId, (event: MapLayerMouseEvent) => {
							const feature = event.features?.[0];
							if (!feature || feature.id === undefined || feature.id === null) {
								return;
							}
							const featureId = String(feature.id);
							const currentHovered = useLayersStore.getState().layers[layerId]?.hoveredId;
							if (currentHovered !== featureId) {
								setHoveredFeature(layerId, featureId);
							}
						});
						map.on('click', mapLayerId, (event: MapLayerMouseEvent) => {
							handleFeatureClick(layerId, event);
						});
					});
				});
			});
		};

		const handleFeatureClick = (layerId: LayerId, event: MapLayerMouseEvent) => {
			const mapInstance = mapRef.current;
			const popupInstance = popupRef.current;
			if (!mapInstance || !popupInstance) {
				return;
			}
			const feature = event.features?.[0] as FeatureWithProps | undefined;
			if (!feature || feature.id === undefined || feature.id === null) {
				popupInstance.remove();
				return;
			}
			const featureId = String(feature.id);
			const currentLayerState = useLayersStore.getState().layers[layerId];
			const currentSelection = currentLayerState?.selectionIds ?? [];
			const isAlreadySelected = currentSelection.includes(featureId);
			if (!isAlreadySelected || currentSelection.length > 1) {
				setSelection(layerId, [featureId]);
			}
			setActiveLayer(layerId);

			const popupHtml = `
				<div class="space-y-4">
					${buildPopupHtml(layerId, feature.properties ?? {})}
					<div class="flex flex-wrap items-center gap-2">
						<button class="${popupButtonClass}" data-action="zoom" data-layer="${layerId}" data-id="${featureId}">
							Zoom fitur
						</button>
						<button class="${popupButtonClass}" data-action="table" data-layer="${layerId}" data-id="${featureId}">
							Lihat di tabel
						</button>
						<button class="${popupButtonClass}" data-action="clear-selection" data-layer="${layerId}" data-id="${featureId}">
							Batalkan pilihan
						</button>
					</div>
				</div>
			`;
			popupInstance.setLngLat(event.lngLat).setHTML(popupHtml).addTo(mapInstance);

			const element = popupInstance.getElement();
			const handlePopupClick = (popupEvent: MouseEvent) => {
				const target = popupEvent.target as HTMLElement | null;
				if (!target) {
					return;
				}
				const button = target.closest<HTMLButtonElement>('[data-action]');
				if (!button) {
					return;
				}
				const action = button.dataset.action;
				const id = button.dataset.id;
				const layer = button.dataset.layer as LayerId | undefined;
				if (!action || !id || !layer) {
					return;
				}
				if (action === 'zoom') {
					requestZoomToIds(layer, [id], 160);
				}
				if (action === 'table') {
					setActiveLayer(layer);
					setSelection(layer, [id]);
					setActiveTab('table');
				}
				if (action === 'clear-selection') {
					setSelection(layer, []);
					popupInstance.remove();
				}
			};
			element.addEventListener('click', handlePopupClick);
			popupInstance.once('close', () => {
				element.removeEventListener('click', handlePopupClick);
			});
		};

		map.on('load', () => {
			mapReadyRef.current = true;
			initialiseSources();
			syncMapWithState(map, useLayersStore.getState().layers);
		});

		const resize = () => map.resize();
		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			accessibilityCleanup.forEach((fn) => fn());
			map.removeControl(navigationControl);
			map.removeControl(basemapControl);
			map.removeControl(styleControl);
			map.removeControl(searchControl);
			map.off('style.load', ensureBasemapLayers);
			popup.remove();
			map.remove();
			mapReadyRef.current = false;
			mapRef.current = null;
			popupRef.current = null;
			capturedStateRef.current = null;
		};
	}, [requestZoomToIds, setActiveLayer, setActiveTab, setHoveredFeature, setSelection, setTheme]);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current) {
			return;
		}
		syncMapWithState(mapRef.current, layersState);
	}, [layersState]);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current || !pendingZoom) {
			return;
		}
		const request = consumeZoomRequest();
		if (!request) {
			return;
		}
		const mapInstance = mapRef.current;
		if (!mapInstance) {
			return;
		}
		if (request.bounds) {
			const [minX, minY, maxX, maxY] = request.bounds;
			mapInstance.fitBounds(
				[
					[minX, minY],
					[maxX, maxY],
				],
				{
					padding: request.padding ?? 120,
					duration: 700,
				},
			);
			return;
		}
		const ids = request.featureIds ?? [];
		if (ids.length === 0) {
			return;
		}
		const features: FeatureWithProps[] = [];
		ids.forEach((id) => {
			const feature = getFeatureById(request.layerId, id);
			if (feature) {
				features.push(feature);
			}
		});
		if (features.length === 0) {
			return;
		}
		fitMapToFeatures(mapInstance, features, request.padding ?? 120);
	}, [consumeZoomRequest, getFeatureById, pendingZoom]);

	return <div ref={containerRef} className='h-full w-full' />;
};

const syncMapWithState = (map: MapLibreMap, layers: ReturnType<typeof useLayersStore.getState>['layers']) => {
	(Object.entries(layers) as [LayerId, ReturnType<typeof useLayersStore.getState>['layers'][LayerId]][]).forEach(
		([layerId, state]) => {
			if (!state) {
				return;
			}
			const configs = mapLayerConfigs[layerId] ?? [];
			const updatedSources = new Set<string>();
			configs.forEach((config) => {
				const source = map.getSource(config.sourceId) as GeoJSONSource | undefined;
				if (source && !updatedSources.has(config.sourceId)) {
					source.setData(state.data as FeatureCollection<Geometry>);
					updatedSources.add(config.sourceId);
				}
				const isActiveKind = config.renderKind === state.renderKind;
				const baseVisibility = isActiveKind && state.visible ? 'visible' : 'none';
				const filteredVisibility =
					isActiveKind && state.visible && state.filter !== null && state.filteredIds.length > 0 ? 'visible' : 'none';
				const selectionVisibility = isActiveKind && state.visible && state.selectionIds.length > 0 ? 'visible' : 'none';
				const hoverIds =
					isActiveKind && state.hoveredId && !state.selectionIds.includes(state.hoveredId)
						? [state.hoveredId]
						: [];
				const hoverVisibility = hoverIds.length > 0 ? 'visible' : 'none';

				if (map.getLayer(config.baseLayerId)) {
					map.setLayoutProperty(config.baseLayerId, 'visibility', baseVisibility);
					const baseFilter = isActiveKind
						? (state.filterExpression as unknown as FilterSpecification)
						: (['all'] as unknown as FilterSpecification);
					map.setFilter(config.baseLayerId, baseFilter);
				}
				if (map.getLayer(config.filteredLayerId)) {
					map.setLayoutProperty(config.filteredLayerId, 'visibility', filteredVisibility);
					map.setFilter(
						config.filteredLayerId,
						buildIdMatchExpression(isActiveKind ? state.filteredIds : []) as unknown as FilterSpecification,
					);
				}
				if (map.getLayer(config.selectionLayerId)) {
					map.setLayoutProperty(config.selectionLayerId, 'visibility', selectionVisibility);
					map.setFilter(
						config.selectionLayerId,
						buildIdMatchExpression(isActiveKind ? state.selectionIds : []) as unknown as FilterSpecification,
					);
				}
				if (map.getLayer(config.hoverLayerId)) {
					map.setLayoutProperty(config.hoverLayerId, 'visibility', isActiveKind ? hoverVisibility : 'none');
					map.setFilter(
						config.hoverLayerId,
						buildIdMatchExpression(isActiveKind ? hoverIds : []) as unknown as FilterSpecification,
					);
				}
			});
		},
	);
};

const fitMapToFeatures = (map: MapLibreMap, features: FeatureWithProps[], padding: number) => {
	const collection: FeatureCollection<Geometry> = {
		type: 'FeatureCollection',
		features: features as unknown as FeatureWithProps[],
	};
	const bounds = bbox(collection) as [number, number, number, number];
	if (!bounds || bounds.some((value) => Number.isNaN(value))) {
		return;
	}
	map.fitBounds(
		[
			[bounds[0], bounds[1]],
			[bounds[2], bounds[3]],
		],
		{
			padding,
			duration: 700,
		},
	);
};

export default MapView;

