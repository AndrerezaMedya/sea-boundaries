import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, NavigationControl, Popup, ScaleControl } from 'maplibre-gl';
import { MapLibreSearchControl } from '@stadiamaps/maplibre-search-box';

import FeatureDetailModal from '@/components/FeatureDetailModal';
import {
	DEFAULT_BASEMAP_ID_BY_THEME,
	getBasemapDefinition,
} from '@/data/basemaps';
import type { BasemapTheme } from '@/data/basemaps';
import { ALL_LAYER_IDS, mapLayerConfigs } from '@/components/map/layerConfigs';
import { setupMapControls } from '@/components/map/controlsRuntime';
import { bindLayerInteractions } from '@/components/map/layerInteractions';
import { ensureMapLayerStack } from '@/components/map/sourceBootstrap';
import { createFeatureClickHandler } from '@/components/map/popupInteraction';
import { fitMapToFeatures, syncMapWithState } from '@/components/map/runtimeSync';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, getBaseMapStyle } from '@/lib/map';
import type { FeatureWithProps, LayerId } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

const MapView = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const [modalState, setModalState] = useState<{ isOpen: boolean; layerId: LayerId | null; featureId: string | null }>({
		isOpen: false,
		layerId: null,
		featureId: null,
	});
	const mapReadyRef = useRef(false);
	const initialBasemapTheme: BasemapTheme = 'light';
	const initialBasemapId = DEFAULT_BASEMAP_ID_BY_THEME[initialBasemapTheme];
	const initialBasemapDefinition = getBasemapDefinition(initialBasemapTheme, initialBasemapId);
	const currentThemeRef = useRef<BasemapTheme>(initialBasemapTheme);
	const currentBasemapIdRef = useRef<string>(initialBasemapDefinition.id);
	const styleModeRef = useRef<'raster' | 'vector'>(initialBasemapDefinition.kind === 'vector' ? 'vector' : 'raster');
	const currentBasemapKindRef = useRef<'raster' | 'vector'>(
		initialBasemapDefinition.kind === 'vector' ? 'vector' : 'raster',
	);
	const currentVectorStyleRef = useRef<string | null>(
		initialBasemapDefinition.kind === 'vector' ? initialBasemapDefinition.styleUrl : null,
	);

	const layersState = useLayersStore((state) => state.layers);
	const pendingZoom = useLayersStore((state) => state.pendingZoom);
	const consumeZoomRequest = useLayersStore((state) => state.consumeZoomRequest);
	const getFeatureById = useLayersStore((state) => state.getFeatureById);
	const setSelection = useLayersStore((state) => state.setSelection);
	const setHoveredFeature = useLayersStore((state) => state.setHoveredFeature);
	const setActiveLayer = useLayersStore((state) => state.setActiveLayer);
	const requestZoomToIds = useLayersStore((state) => state.requestZoomToIds);
	const setActiveTab = useUIStore((state) => state.setActiveTab);
	const showCoordinates = useUIStore((state) => state.showCoordinates);

	const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);
	const showCoordinatesRef = useRef(showCoordinates);
	// Keep ref in sync so the stable mousemove closure sees latest toggle
	showCoordinatesRef.current = showCoordinates;

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const map = new maplibregl.Map({
			container: containerRef.current,
			style: getBaseMapStyle(),
			center: MAP_DEFAULT_CENTER,
			zoom: MAP_DEFAULT_ZOOM,
		});
		mapRef.current = map;

		const popup = new maplibregl.Popup({
			closeButton: true,
			closeOnClick: false,
			offset: 15,
			className: 'app-popup',
			maxWidth: '380px'
		});
		popupRef.current = popup;

		const navigationControl = new NavigationControl({ visualizePitch: true });
		map.addControl(navigationControl, 'top-right');
		map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-right');

		const handleMapMouseMove = (e: maplibregl.MapMouseEvent) => {
			if (!showCoordinatesRef.current) {
				setCoords(null);
				return;
			}
			setCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
		};
		const handleMapMouseLeave = () => setCoords(null);
		map.on('mousemove', handleMapMouseMove);
		map.on('mouseleave', handleMapMouseLeave);

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

		const handleFeatureClick = createFeatureClickHandler({
			getMap: () => mapRef.current,
			getPopup: () => popupRef.current,
			getCurrentSelectionIds: (layerId) => useLayersStore.getState().layers[layerId]?.selectionIds ?? [],
			setSelection,
			setActiveLayer,
			requestZoomToIds,
			openFeatureDetail: (layerId, featureId) => {
				setModalState({ isOpen: true, layerId, featureId });
			},
		});

		const initialiseSources = () => {
			ALL_LAYER_IDS.forEach((layerId) => {
				const configs = mapLayerConfigs[layerId] ?? [];
				configs.forEach((config) => {
					ensureMapLayerStack(map, config);
					const interactiveLayers = [
						config.baseLayerId,
						config.filteredLayerId,
						config.selectionLayerId,
						config.hoverLayerId,
					];
					bindLayerInteractions(map, layerId, interactiveLayers, {
						getCurrentHoveredId: (targetLayerId) =>
							useLayersStore.getState().layers[targetLayerId]?.hoveredId ?? null,
						setHoveredFeature,
						handleFeatureClick,
					});
				});
			});
		};

		const controls = setupMapControls({
			map,
			currentThemeRef,
			currentBasemapIdRef,
			styleModeRef,
			currentBasemapKindRef,
			currentVectorStyleRef,
			onReinitialize: () => {
				initialiseSources();
				syncMapWithState(map, useLayersStore.getState().layers);
			},
		});

		map.on('load', () => {
			mapReadyRef.current = true;
			controls.ensureBasemapLayers(currentBasemapIdRef.current, {
				theme: currentThemeRef.current,
				forceReinitialize: true,
			});
			initialiseSources();
			syncMapWithState(map, useLayersStore.getState().layers);
		});

		const resize = () => map.resize();
		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			accessibilityCleanup.forEach((fn) => fn());
			controls.cleanup();
			map.off('mousemove', handleMapMouseMove);
			map.off('mouseleave', handleMapMouseLeave);
			map.removeControl(navigationControl);
			map.removeControl(controls.basemapControl);
			map.removeControl(searchControl);
			popup.remove();
			map.remove();
			mapReadyRef.current = false;
			mapRef.current = null;
			popupRef.current = null;
		};
	}, [requestZoomToIds, setActiveLayer, setActiveTab, setHoveredFeature, setSelection]);

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

	return (
		<>
			<div ref={containerRef} className='h-full w-full' />
			{showCoordinates && coords && (
				<div
					className='pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-md border px-2.5 py-1 text-[11px] font-mono tabular-nums shadow-sm backdrop-blur-sm'
					style={{
						backgroundColor: 'rgba(var(--color-panel-rgb, 255 255 255) / 0.88)',
						borderColor: 'var(--color-border, #e2e8f0)',
						color: 'var(--color-text)',
					}}
				>
					{coords.lat >= 0 ? `${coords.lat.toFixed(6)}°N` : `${Math.abs(coords.lat).toFixed(6)}°S`}&nbsp;&nbsp;
					{coords.lng >= 0 ? `${coords.lng.toFixed(6)}°E` : `${Math.abs(coords.lng).toFixed(6)}°W`}
				</div>
			)}
			{modalState.isOpen && modalState.layerId && modalState.featureId && (
				<FeatureDetailModal
					isOpen={modalState.isOpen}
					onClose={() => setModalState({ isOpen: false, layerId: null, featureId: null })}
					layerId={modalState.layerId}
					featureId={modalState.featureId}
				/>
			)}
		</>
	);
};

export default MapView;

