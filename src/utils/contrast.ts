type RGB = [number, number, number];

const clamp = (value: number, min = 0, max = 255): number => Math.min(Math.max(value, min), max);

const parseHex = (input: string): RGB | null => {
	const value = input.replace('#', '').trim();
	if (value.length === 3) {
		const r = parseInt(value[0] + value[0], 16);
		const g = parseInt(value[1] + value[1], 16);
		const b = parseInt(value[2] + value[2], 16);
		return [r, g, b];
	}
	if (value.length === 6) {
		const r = parseInt(value.slice(0, 2), 16);
		const g = parseInt(value.slice(2, 4), 16);
		const b = parseInt(value.slice(4, 6), 16);
		return [r, g, b];
	}
	return null;
};

const parseRgb = (input: string): RGB | null => {
	const match = input.match(/rgba?\(([^)]+)\)/i);
	if (!match) {
		return null;
	}
	const parts = match[1]
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length < 3) {
		return null;
	}
	const numbers = parts.slice(0, 3).map((part) => {
		if (part.endsWith('%')) {
			return clamp((parseFloat(part) / 100) * 255);
		}
		return clamp(parseFloat(part));
	});
	if (numbers.some((num) => Number.isNaN(num))) {
		return null;
	}
	return numbers as RGB;
};

const resolveCssVariable = (input: string): string | null => {
	const variableMatch = input.match(/^var\((--[^)]+)\)$/);
	if (!variableMatch) {
		return null;
	}
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return null;
	}
	const value = getComputedStyle(document.documentElement).getPropertyValue(variableMatch[1]);
	return value ? value.trim() : null;
};

const parseColor = (input: string): RGB | null => {
	if (!input) {
		return null;
	}
	let color = input.trim();
	if (color.startsWith('var(')) {
		const resolved = resolveCssVariable(color);
		color = resolved ?? color;
	}
	if (color.startsWith('#')) {
		return parseHex(color);
	}
	if (color.startsWith('rgb')) {
		return parseRgb(color);
	}
	return null;
};

export const luminance = (color: string): number => {
	const rgb = parseColor(color);
	if (!rgb) {
		return 0;
	}
	const [r, g, b] = rgb.map((channel) => {
		const normalized = channel / 255;
		return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
	}) as RGB;
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (foreground: string, background: string): number => {
	const lum1 = luminance(foreground);
	const lum2 = luminance(background);
	const [lighter, darker] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
	return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

const FALLBACK_LIGHT = '#ffffff';
const FALLBACK_DARK = '#000000';

export const ensureReadable = (foreground: string, background: string, target = 4.5): string => {
	const current = contrastRatio(foreground, background);
	if (current >= target) {
		return foreground;
	}
	const lightContrast = contrastRatio(FALLBACK_LIGHT, background);
	const darkContrast = contrastRatio(FALLBACK_DARK, background);
	if (lightContrast >= target && lightContrast >= darkContrast) {
		return FALLBACK_LIGHT;
	}
	if (darkContrast >= target) {
		return FALLBACK_DARK;
	}
	return lightContrast > darkContrast ? FALLBACK_LIGHT : FALLBACK_DARK;
};
