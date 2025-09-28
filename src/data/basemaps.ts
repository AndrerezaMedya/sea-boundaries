export interface RasterBasemap {
	id: string;
	label: string;
	tiles: string[];
	attribution: string;
	tileSize?: number;
	minZoom?: number;
	maxZoom?: number;
}

export const rasterBasemaps: RasterBasemap[] = [
	{
		id: 'osm-standard',
		label: 'OSM Standard',
		tiles: [
			'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
		],
		attribution: '© OpenStreetMap contributors',
		tileSize: 256,
		minZoom: 0,
		maxZoom: 19,
	},
	{
		id: 'opentopomap',
		label: 'OpenTopoMap',
		tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png', 'https://b.tile.opentopomap.org/{z}/{x}/{y}.png', 'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'],
		attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
		tileSize: 256,
		minZoom: 0,
		maxZoom: 17,
	},
	{
		id: 'esri-world-imagery',
		label: 'Esri Satellite',
		tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
		attribution: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
		tileSize: 256,
		minZoom: 0,
		maxZoom: 22,
	},
];

export const DEFAULT_RASTER_BASEMAP_ID = rasterBasemaps[0]?.id ?? 'osm-standard';
