declare module 'maplibre-gl-style-flipper' {
	const StyleFlipperControl: new (
		styles: Record<string, { name?: string; code: string; url: string; image?: string }>,
		onStyleChange?: (styleKey: string, styleCode: string) => void,
	) => maplibregl.IControl & {
		setCurrentStyleCode?: (code: string) => void;
		saveCustomSourcesAndLayers?: () => void;
		restoreCustomSourcesAndLayers?: () => void;
	};
	export default StyleFlipperControl;
}
