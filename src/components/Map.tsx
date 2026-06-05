import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, NavigationControl, Popup, ScaleControl } from 'maplibre-gl';

import FeatureDetailModal from '@/components/FeatureDetailModal';
import {
	DEFAULT_BASEMAP_ID_BY_THEME,
	getBasemapDefinition,
} from '@/data/basemaps';
import type { BasemapTheme } from '@/data/basemaps';
import { ALL_LAYER_IDS, mapLayerConfigs } from '@/components/map/layerConfigs';
import { setupMapControls } from '@/components/map/controlsRuntime';
import { registerIhoSymbolImages } from '@/components/map/ihoSymbology';
import { bindLayerInteractions } from '@/components/map/layerInteractions';
import { ensureCombinedMvtSources, ensureMapLayerStack } from '@/components/map/sourceBootstrap';
import { getDisplayToken } from '@/lib/displaySession';
import { applySymbologyMode } from '@/components/map/applySymbology';
import { createFeatureClickHandler } from '@/components/map/popupInteraction';
import { syncGeoResultLayer } from '@/components/map/geoResultLayer';
import { fitMapToFeatures, syncMapWithState } from '@/components/map/runtimeSync';
import { syncMvtTileReload } from '@/lib/mvtSourceSync';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, getBaseMapStyle } from '@/lib/map';
import { isMvtDisplayMode } from '@/lib/mapDisplay';
import type { FeatureWithProps, LayerId } from '@/lib/types';
import { useViewportAttributes } from '@/hooks/useViewportAttributes';
import { useGeoResultStore } from '@/store/useGeoResult';
import { useLayersStore } from '@/store/useLayersStore';
import { useLocaleStore } from '@/store/useLocale';
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
	const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);
	const [mapReady, setMapReady] = useState(false);
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
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
	const setActiveLayer = useLayersStore((state) => state.setActiveLayer);
	const requestZoomToIds = useLayersStore((state) => state.requestZoomToIds);
	const setActiveTab = useUIStore((state) => state.setActiveTab);
	const activeBasemapId = useUIStore((state) => state.activeBasemapId);
	const setActiveBasemapId = useUIStore((state) => state.setActiveBasemapId);
	const locale = useLocaleStore((state) => state.locale);
	const showCoordinates = useUIStore((state) => state.showCoordinates);
	const symbologyMode = useUIStore((state) => state.symbologyMode);
	const attributeRefreshTargets = useLayersStore((state) => state.attributeRefreshTargets);
	const clearAttributeRefreshTargets = useLayersStore((state) => state.clearAttributeRefreshTargets);
	const refreshActiveLayerAttributes = useLayersStore((state) => state.refreshActiveLayerAttributes);
	const geoResultCollection = useGeoResultStore((state) => state.collection);
	const geoResultVisible = useGeoResultStore((state) => state.visible);

	const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);
	const showCoordinatesRef = useRef(showCoordinates);
	const mvtVisibilityRef = useRef<ReturnType<typeof syncMvtTileReload> | null>(null);
	const ensureBasemapLayersRef = useRef<((id: string, opts?: any) => void) | null>(null);
	// Keep ref in sync so the stable mousemove closure sees latest toggle
	showCoordinatesRef.current = showCoordinates;

	useViewportAttributes(mapInstance, mapReady, activeLayerId);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current) {
			return;
		}
		syncGeoResultLayer(mapRef.current, geoResultCollection, geoResultVisible);
	}, [geoResultCollection, geoResultVisible, mapReady]);

	// Popup HTML is static until the feature is clicked again — close when language changes.
	useEffect(() => {
		popupRef.current?.remove();
	}, [locale]);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const map = new maplibregl.Map({
			container: containerRef.current,
			style: getBaseMapStyle(),
			center: MAP_DEFAULT_CENTER,
			zoom: MAP_DEFAULT_ZOOM,
			transformRequest: (url) => {
				if (!isMvtDisplayMode() || !url.includes('/api/tiles/')) {
					return { url };
				}
				const token = getDisplayToken();
				if (!token) {
					return { url };
				}
				return {
					url,
					headers: { 'X-Display-Token': token },
				};
			},
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

		const handleFeatureClick = createFeatureClickHandler({
			getMap: () => mapRef.current,
			getPopup: () => popupRef.current,
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
					ensureMapLayerStack(map, layerId, config);
					const interactiveLayers = [
						config.baseLayerId,
						config.filteredLayerId,
						config.selectionLayerId,
						config.hoverLayerId,
					];
					bindLayerInteractions(map, layerId, interactiveLayers, {
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
				registerIhoSymbolImages(map);
				initialiseSources();
				syncMapWithState(map, useLayersStore.getState().layers, useUIStore.getState().symbologyMode);
			},
		});
		ensureBasemapLayersRef.current = controls.ensureBasemapLayers;

		map.on('load', () => {
			mapReadyRef.current = true;
			setMapReady(true);
			setMapInstance(map);
			controls.ensureBasemapLayers(activeBasemapId ?? currentBasemapIdRef.current, {
				theme: currentThemeRef.current,
				forceReinitialize: true,
			});
			if (!activeBasemapId) setActiveBasemapId(currentBasemapIdRef.current);
			registerIhoSymbolImages(map);
			ensureCombinedMvtSources(map);
			initialiseSources();
			const mode = useUIStore.getState().symbologyMode;
			const layers = useLayersStore.getState().layers;
			syncMapWithState(map, layers, mode);
			applySymbologyMode(map, mode);
			mvtVisibilityRef.current = syncMvtTileReload(map, layers, null);
		});

		const resize = () => map.resize();
		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			controls.cleanup();
			map.off('mousemove', handleMapMouseMove);
			map.off('mouseleave', handleMapMouseLeave);
			map.removeControl(navigationControl);
			map.removeControl(controls.basemapControl);
			popup.remove();
			map.remove();
			mapReadyRef.current = false;
			setMapReady(false);
			setMapInstance(null);
			mapRef.current = null;
			popupRef.current = null;
		};
	}, [requestZoomToIds, setActiveLayer, setActiveTab, setSelection, activeBasemapId, setActiveBasemapId]);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current) {
			return;
		}
		const map = mapRef.current;
		syncMapWithState(map, layersState, symbologyMode);
		applySymbologyMode(map, symbologyMode);
		mvtVisibilityRef.current = syncMvtTileReload(map, layersState, mvtVisibilityRef.current);
	}, [layersState, symbologyMode]);

	useEffect(() => {
		if (!mapReadyRef.current || !mapRef.current || !attributeRefreshTargets?.length || !isMvtDisplayMode()) {
			return;
		}
		void (async () => {
			for (const layerId of attributeRefreshTargets) {
				await refreshActiveLayerAttributes(layerId);
			}
			clearAttributeRefreshTargets();
		})();
	}, [
		attributeRefreshTargets,
		refreshActiveLayerAttributes,
		clearAttributeRefreshTargets,
	]);

	useEffect(() => {
		if (activeBasemapId && ensureBasemapLayersRef.current) {
			ensureBasemapLayersRef.current(activeBasemapId);
		}
	}, [activeBasemapId]);

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
					className='pointer-events-none absolute left-1/2 top-[3.6rem] z-20 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[11px] font-semibold tabular-nums shadow-lg backdrop-blur-md transition-all sm:top-auto sm:bottom-8 sm:gap-2.5 sm:px-4 sm:text-xs md:max-w-none'
					style={{
						backgroundColor: 'var(--color-panel)',
						color: 'var(--color-text)',
					}}
				>
					<div className='flex items-center justify-center rounded-full bg-[color:var(--color-panel-muted)] p-1 text-[color:var(--color-accent)]'>
						<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='h-3 w-3'>
							<path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' />
							<circle cx='12' cy='10' r='3' />
						</svg>
					</div>
					<div className='flex items-center gap-3 tracking-wide'>
						<span>{coords.lat >= 0 ? `${coords.lat.toFixed(3)}°N` : `${Math.abs(coords.lat).toFixed(3)}°S`}</span>
						<span className='text-[color:var(--color-muted)] opacity-50'>|</span>
						<span>{coords.lng >= 0 ? `${coords.lng.toFixed(3)}°E` : `${Math.abs(coords.lng).toFixed(3)}°W`}</span>
					</div>
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

