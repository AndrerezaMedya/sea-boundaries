export type BasemapTheme = 'light';

interface BaseBasemapDefinition {
	id: string;
	label: string;
	attribution?: string;
	tileSize?: number;
	minZoom?: number;
	maxZoom?: number;
	previewTiles?: string[];
}

export interface RasterBasemapDefinition extends BaseBasemapDefinition {
	kind: 'raster';
	tiles: string[];
}

export interface VectorBasemapDefinition extends BaseBasemapDefinition {
	kind: 'vector';
	styleUrl: string;
}

export type BasemapDefinition = RasterBasemapDefinition | VectorBasemapDefinition;

const esriLightGray: RasterBasemapDefinition = {
	id: 'osm',
	label: 'ESRI Light Gray',
	kind: 'raster',
	tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
	attribution: 'Source: Esri, HERE, Garmin, FAO, NOAA, USGS, EPA',
	tileSize: 256,
	minZoom: 0,
	maxZoom: 16,
};

const openTopoMap: RasterBasemapDefinition = {
	id: 'topo',
	label: 'OpenTopoMap',
	kind: 'raster',
	tiles: [
		'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
		'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
		'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
	],
	attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
	tileSize: 256,
	minZoom: 0,
	maxZoom: 17,
};

const esriWorldImagery: RasterBasemapDefinition = {
	id: 'esri',
	label: 'Esri Satellite',
	kind: 'raster',
	tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
	attribution: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
	tileSize: 256,
	minZoom: 0,
	maxZoom: 22,
};

const rbiBasemap: RasterBasemapDefinition = {
	id: 'rbi',
	label: 'Rupabumi Indonesia',
	kind: 'raster',
	tiles: ['https://geoservices.big.go.id/rbi/rest/services/BASEMAP/Rupabumi_Indonesia/MapServer/tile/{z}/{y}/{x}'],
	attribution: '© Badan Informasi Geospasial',
	tileSize: 256,
	minZoom: 0,
	maxZoom: 20,
	previewTiles: ['https://tanahair.indonesia.go.id/portal-web/static/media/rbi.494852622726ecff0319.png'],
};

export const lightBasemaps: Record<string, BasemapDefinition> = {
	osm: esriLightGray,
	rbi: rbiBasemap,
	topo: openTopoMap,
	esri: esriWorldImagery,
};

export const BASEMAPS_BY_THEME: Record<BasemapTheme, Record<string, BasemapDefinition>> = {
	light: lightBasemaps,
};

export const ALL_BASEMAPS: Record<string, BasemapDefinition> = {
	...lightBasemaps,
};

export const DEFAULT_BASEMAP_ID_BY_THEME: Record<BasemapTheme, string> = {
	light: 'esri',
};

export const mapBasemapId = (id: string, targetTheme: BasemapTheme): string => {
	if (targetTheme !== 'light') {
		return 'esri';
	}
	return lightBasemaps[id] ? id : 'esri';
};

export const getBasemapDefinition = (theme: BasemapTheme, id?: string): BasemapDefinition => {
	const themeBasemaps = BASEMAPS_BY_THEME[theme];
	if (id && themeBasemaps[id]) {
		return themeBasemaps[id];
	}
	const fallbackId = DEFAULT_BASEMAP_ID_BY_THEME[theme];
	return themeBasemaps[fallbackId];
};

export const getBasemapDefinitionById = (id: string): BasemapDefinition | undefined => ALL_BASEMAPS[id];

export const getBasemapIdsForTheme = (theme: BasemapTheme): string[] => Object.keys(BASEMAPS_BY_THEME[theme]);

export const isRasterBasemapDefinition = (
	definition: BasemapDefinition,
): definition is RasterBasemapDefinition => definition.kind === 'raster';

export const isVectorBasemapDefinition = (
	definition: BasemapDefinition,
): definition is VectorBasemapDefinition => definition.kind === 'vector';
