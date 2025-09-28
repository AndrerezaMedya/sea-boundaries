import { useEffect, useState } from 'react';

import { useThemeStore } from '@/store/useTheme';
import { ensureReadable } from '@/utils/contrast';

const resolveVariable = (variable: string, styles: CSSStyleDeclaration): string | null => {
	if (variable.startsWith('--')) {
		const value = styles.getPropertyValue(variable);
		return value ? value.trim() : null;
	}
	return variable.startsWith('#') || variable.startsWith('rgb') ? variable : null;
};

export const useReadableColor = (backgroundVar: string, preferredTextVar = '--color-text', targetRatio = 4.5): string => {
	const theme = useThemeStore((state) => state.theme);
	const [computed, setComputed] = useState(`var(${preferredTextVar})`);

	useEffect(() => {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return;
		}
		const styles = getComputedStyle(document.documentElement);
		const background = resolveVariable(backgroundVar, styles);
		const preferred = resolveVariable(preferredTextVar, styles);

		if (!background || !preferred) {
			setComputed(`var(${preferredTextVar})`);
			return;
		}

		const readable = ensureReadable(preferred, background, targetRatio);
		if (readable === preferred) {
			setComputed(`var(${preferredTextVar})`);
			return;
		}
		setComputed(readable);
	}, [backgroundVar, preferredTextVar, targetRatio, theme]);

	return computed;
};
