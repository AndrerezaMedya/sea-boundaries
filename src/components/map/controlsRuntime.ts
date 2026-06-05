import type { Map as MapLibreMap } from 'maplibre-gl';

import {
	DEFAULT_BASEMAP_ID_BY_THEME,
	type BasemapDefinition,
	getBasemapDefinition,
	getBasemapDefinitionById,
	isRasterBasemapDefinition,
	type BasemapTheme,
} from '@/data/basemaps';
import { mapStyles } from '@/data/mapStyles';
import {
	createBasemapDefinitionMap,
	createBasemapIdsByTheme,
	ensureRasterBasemapLayers as ensureRasterBasemapLayersRuntime,
	purgeRasterBasemapArtifacts as purgeRasterBasemapArtifactsRuntime,
} from '@/components/map/basemapRuntime';
import {
	enterRasterMode,
} from '@/components/map/styleState';

type MutableRef<T> = { current: T };

type EnsureBasemapLayersOptions = {
	theme?: BasemapTheme;
	forceReinitialize?: boolean;
};

type BasemapControlOptions = {
	definitions: BasemapDefinition[];
	initialBasemapId: string;
	onSelect: (id: string) => void;
};

class BasemapThumbnailControl {
	private _container: HTMLDivElement;
	private _thumbnails = new Map<string, HTMLImageElement>();
	private options: BasemapControlOptions;

	constructor(options: BasemapControlOptions) {
		this.options = options;
		this._container = document.createElement('div');
		this._container.classList.add('maplibregl-ctrl');
		this._container.classList.add('maplibregl-ctrl-basemaps');
		this._container.classList.add('column');
	}

	private resolvePreviewSrc(definition: BasemapDefinition): string {
		const sourceTile =
			definition.previewTiles?.[0] ??
			(definition.kind === 'raster' ? definition.tiles[0] : '');

		if (!sourceTile) {
			return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="100%25" height="100%25" fill="%23dbeafe"/%3E%3C/svg%3E';
		}

		const minZoom = typeof definition.minZoom === 'number' ? definition.minZoom : 0;
		return sourceTile
			.replace('{x}', '0')
			.replace('{y}', '0')
			.replace('{z}', String(minZoom));
	}

	private mountThumbnails() {
		this._container.innerHTML = '';
		this._thumbnails.clear();

		this.options.definitions.forEach((definition) => {
			const thumbnail = document.createElement('img');
			thumbnail.classList.add('basemap');
			thumbnail.dataset.id = definition.id;
			thumbnail.alt = definition.label;
			thumbnail.title = definition.label;
			thumbnail.src = this.resolvePreviewSrc(definition);
			thumbnail.setAttribute('role', 'button');
			thumbnail.setAttribute('tabindex', '0');
			thumbnail.setAttribute('aria-label', `Basemap ${definition.label}`);

			const onActivate = () => this.options.onSelect(definition.id);
			thumbnail.addEventListener('click', (event) => {
				event.preventDefault();
				onActivate();
			});
			thumbnail.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onActivate();
				}
			});

			this._container.appendChild(thumbnail);
			this._thumbnails.set(definition.id, thumbnail);
		});

		this.updateState(new Set(this._thumbnails.keys()), this.options.initialBasemapId);
	}

	updateState(allowedIds: Set<string>, activeId: string) {
		this._thumbnails.forEach((thumbnail, id) => {
			const isAllowed = allowedIds.has(id);
			const isActive = isAllowed && id === activeId;

			thumbnail.classList.toggle('hidden', !isAllowed);
			thumbnail.classList.toggle('active', isActive);
			thumbnail.setAttribute('aria-hidden', isAllowed ? 'false' : 'true');
			thumbnail.setAttribute('aria-pressed', isActive ? 'true' : 'false');
			thumbnail.setAttribute('tabindex', isAllowed ? '0' : '-1');
			thumbnail.style.pointerEvents = isAllowed ? '' : 'none';
		});
	}

	onAdd() {
		this._container.setAttribute('role', 'group');
		this._container.setAttribute('aria-label', 'Pemilih basemap');
		this.mountThumbnails();
		return this._container;
	}

	onRemove() {
		this._thumbnails.clear();
		this._container.parentNode?.removeChild(this._container);
	}
}

interface SetupMapControlsDeps {
	map: MapLibreMap;
	currentThemeRef: MutableRef<BasemapTheme>;
	currentBasemapIdRef: MutableRef<string>;
	styleModeRef: MutableRef<'raster' | 'vector'>;
	currentBasemapKindRef: MutableRef<'raster' | 'vector'>;
	currentVectorStyleRef: MutableRef<string | null>;
	onReinitialize: () => void;
}

interface SetupMapControlsResult {
	basemapControl: BasemapThumbnailControl;
	ensureBasemapLayers: (overrideActiveId?: string, options?: EnsureBasemapLayersOptions) => void;
	cleanup: () => void;
}

export const setupMapControls = (deps: SetupMapControlsDeps): SetupMapControlsResult => {
	const {
		map,
		currentThemeRef,
		currentBasemapIdRef,
		styleModeRef,
		currentBasemapKindRef,
		currentVectorStyleRef,
		onReinitialize,
	} = deps;

	const accessibilityCleanup: Array<() => void> = [];

	const basemapDefinitionMap = createBasemapDefinitionMap();
	const rasterBasemapDefinitions = Array.from(basemapDefinitionMap.values()).filter(isRasterBasemapDefinition);
	const rasterBasemapIdSet = new Set(rasterBasemapDefinitions.map((definition) => definition.id));
	const basemapIdsByTheme = createBasemapIdsByTheme();
	const basemapControl = new BasemapThumbnailControl({
		definitions: Array.from(basemapDefinitionMap.values()),
		initialBasemapId: currentBasemapIdRef.current,
		onSelect: (id) => ensureBasemapLayers(id, { theme: currentThemeRef.current, forceReinitialize: true }),
	});
	// map.addControl(basemapControl as IControl, 'top-left');

	const purgeRasterBasemapArtifacts = () => {
		purgeRasterBasemapArtifactsRuntime(map, rasterBasemapIdSet);
	};

	const ensureRasterBasemapLayers = (activeId: string) => {
		ensureRasterBasemapLayersRuntime(map, activeId, rasterBasemapDefinitions);
	};

	const updateBasemapThumbnailState = (activeId: string, theme: BasemapTheme) => {
		basemapControl.updateState(basemapIdsByTheme[theme], activeId);
	};

	const ensureBasemapLayers = (overrideActiveId?: string, options?: EnsureBasemapLayersOptions) => {
		const targetTheme = options?.theme ?? currentThemeRef.current;
		currentThemeRef.current = targetTheme;

		const fallbackId = overrideActiveId ?? currentBasemapIdRef.current;
		const themeDefinition = getBasemapDefinition(targetTheme, fallbackId);
		let activeId = themeDefinition.id;

		if (!basemapDefinitionMap.has(activeId) && overrideActiveId) {
			const anyDefinition = getBasemapDefinitionById(overrideActiveId);
			if (anyDefinition) {
				activeId = anyDefinition.id;
			}
		}

		if (!basemapDefinitionMap.has(activeId)) {
			activeId = DEFAULT_BASEMAP_ID_BY_THEME[targetTheme];
		}

		currentBasemapIdRef.current = activeId;
		updateBasemapThumbnailState(activeId, targetTheme);

		const definition = basemapDefinitionMap.get(activeId);
		if (!definition) {
			return;
		}

		const forceReinitialize = options?.forceReinitialize ?? false;

		const runPostApply = (styleUpdated: boolean) => {
			const shouldReinitialize = styleUpdated || forceReinitialize;
			if (shouldReinitialize) {
				onReinitialize();
			}
			updateBasemapThumbnailState(activeId, targetTheme);
		};

		if (definition.kind === 'vector') {
			const needsStyleChange =
				currentBasemapKindRef.current !== 'vector' || currentVectorStyleRef.current !== definition.styleUrl;

			if (!needsStyleChange) {
				runPostApply(forceReinitialize);
				return;
			}

			map.setStyle(definition.styleUrl, { diff: false });
			map.once('styledata', () => {
				styleModeRef.current = 'vector';
				currentBasemapKindRef.current = 'vector';
				currentVectorStyleRef.current = definition.styleUrl;
				runPostApply(true);
			});
			return;
		}

		const applyRaster = (styleUpdated: boolean) => {
			styleModeRef.current = 'raster';
			currentBasemapKindRef.current = 'raster';
			currentVectorStyleRef.current = null;
			purgeRasterBasemapArtifacts();
			ensureRasterBasemapLayers(activeId);
			runPostApply(styleUpdated);
		};

		if (currentBasemapKindRef.current === 'vector') {
			map.setStyle(mapStyles.light.url, { diff: false });
			map.once('styledata', () => {
				enterRasterMode(map);
				applyRaster(true);
			});
			return;
		}

		if (!map.isStyleLoaded()) {
			map.once('styledata', () => {
				applyRaster(false);
			});
			return;
		}

		applyRaster(false);
	};

	return {
		basemapControl,
		ensureBasemapLayers,
		cleanup: () => {
			accessibilityCleanup.forEach((fn) => fn());
		},
	};
};
