export type MapStyleKey = 'light' | 'dark';

type VectorStyleDefinition = {
	name: string;
	code: MapStyleKey;
	url: string;
	image: string;
};

export const mapStyles: Record<MapStyleKey, VectorStyleDefinition> = {
	light: {
		name: 'Base Light',
		code: 'light',
		url: '/styles/base.json',
		image: '/icons/style-light.svg',
	},
	dark: {
		name: 'Carto Dark Matter',
		code: 'dark',
		url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
		image: '/icons/style-dark.svg',
	},
};

export const DEFAULT_MAP_STYLE: MapStyleKey = 'light';
