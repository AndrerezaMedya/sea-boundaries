/// <reference types='vite/client' />

declare module '*.geojson?raw' {
	const value: string;
	export default value;
}

interface ImportMetaEnv {
	readonly VITE_API_BASE?: string;
}

