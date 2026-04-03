export type MapStyleKey = 'light';

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
};

export const DEFAULT_MAP_STYLE: MapStyleKey = 'light';
