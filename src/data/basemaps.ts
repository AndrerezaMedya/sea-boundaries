export type BasemapTheme = 'light' | 'dark';

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

const osmStandard: RasterBasemapDefinition = {
	id: 'osm',
	label: 'OSM Standard',
	kind: 'raster',
	tiles: [
		'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
		'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
		'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
	],
	attribution: '© OpenStreetMap contributors',
	tileSize: 256,
	minZoom: 0,
	maxZoom: 19,
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

const cartoDarkMatter: VectorBasemapDefinition = {
	id: 'darkMatter',
	label: 'Carto Dark Matter',
	kind: 'vector',
	styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
	attribution: '© CARTO',
	previewTiles: [
		'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
		'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
		'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
		'https://cartodb-basemaps-d.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
	],
};

export const lightBasemaps: Record<string, BasemapDefinition> = {
	osm: osmStandard,
	topo: openTopoMap,
	esri: esriWorldImagery,
};

export const darkBasemaps: Record<string, BasemapDefinition> = {
	darkMatter: cartoDarkMatter,
	topo: openTopoMap,
	esri: esriWorldImagery,
};

export const BASEMAPS_BY_THEME: Record<BasemapTheme, Record<string, BasemapDefinition>> = {
	light: lightBasemaps,
	dark: darkBasemaps,
};

export const ALL_BASEMAPS: Record<string, BasemapDefinition> = {
	...lightBasemaps,
	darkMatter: cartoDarkMatter,
};

export const DEFAULT_BASEMAP_ID_BY_THEME: Record<BasemapTheme, string> = {
	light: 'osm',
	dark: 'darkMatter',
};

export const mapBasemapId = (id: string, targetTheme: BasemapTheme): string => {
	if (targetTheme === 'dark') {
		if (id === 'osm') {
			return 'darkMatter';
		}
		return id;
	}
	if (id === 'darkMatter') {
		return 'osm';
	}
	return id;
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
