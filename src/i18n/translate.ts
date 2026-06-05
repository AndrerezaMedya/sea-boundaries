import type { Locale } from '@/i18n/types';
import { webgisMessages } from '@/i18n/webgis-messages';

type MessageTree = Record<string, string | { [key: string]: unknown }>;

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
	const parts = key.split('.');
	let node: unknown = webgisMessages[locale];
	for (const part of parts) {
		if (!node || typeof node !== 'object') {
			return key;
		}
		node = (node as MessageTree)[part];
	}
	if (typeof node !== 'string') {
		return key;
	}
	if (!vars) {
		return node;
	}
	return node.replace(/\{(\w+)\}/g, (_, name: string) => {
		const value = vars[name];
		return value === undefined ? `{${name}}` : String(value);
	});
}
