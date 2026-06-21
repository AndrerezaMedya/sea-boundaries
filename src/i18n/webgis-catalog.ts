import type { CoreLayerId, LayerId } from '@/lib/types';
import type { Locale } from '@/i18n/types';
import type { FilterTarget } from '@/store/useUI';

export type FilterOption = { value: string; label: string };

const pick = (locale: Locale, id: string, en: string) => (locale === 'en' ? en : id);

/** Layer & group labels for sidebar / geoprocessing selects */
export const layerLabels: Record<CoreLayerId, { id: string; en: string }> = {
	basepoints: { id: 'Titik Dasar', en: 'Base Points' },
	basepoints_2026: { id: 'Titik Dasar 2026', en: 'Base Points 2026' },
	landas_kontinen_ekstensi: { id: 'Landas Kontinen Ekstensi', en: 'Extended Continental Shelf' },
	titik_perjanjian_lt: { id: 'Titik Perjanjian — Laut Teritorial', en: 'Agreement Points — Territorial Sea' },
	titik_perjanjian_lk: { id: 'Titik Perjanjian — Landas Kontinen', en: 'Agreement Points — Continental Shelf' },
	titik_perjanjian_zee: { id: 'Titik Perjanjian — ZEE', en: 'Agreement Points — EEZ' },
	territorial_sea: { id: 'Laut Teritorial', en: 'Territorial Sea' },
	contiguous_zone: { id: 'Zona Tambahan', en: 'Contiguous Zone' },
	eez_limit: { id: 'Zona Ekonomi Eksklusif', en: 'Exclusive Economic Zone' },
	continental_shelf: { id: 'Landas Kontinen', en: 'Continental Shelf' },
	fisheries: { id: 'Zona Perikanan', en: 'Fisheries Zone' },
	baseline: { id: 'Garis Pangkal', en: 'Baseline' },
	titik_referensi: { id: 'Titik Referensi', en: 'Reference Points' },
};

export const groupLabels: Record<string, { id: string; en: string }> = {
	baseline: { id: 'Garis Pangkal', en: 'Baseline' },
	territorial_sea: { id: 'Laut Teritorial', en: 'Territorial Sea' },
	contiguous_zone: { id: 'Zona Tambahan', en: 'Contiguous Zone' },
	eez_limit: { id: 'Zona Ekonomi Eksklusif', en: 'Exclusive Economic Zone' },
	continental_shelf: { id: 'Landas Kontinen', en: 'Continental Shelf' },
	fisheries: { id: 'Zona Perikanan', en: 'Fisheries Zone' },
	titik_perjanjian: { id: 'Titik Perjanjian', en: 'Agreement Points' },
	basepoints: { id: 'Titik Dasar', en: 'Base Points' },
	basepoints_2026: { id: 'Titik Dasar 2026', en: 'Base Points 2026' },
};

export const sublayerLabels: Partial<Record<CoreLayerId, { id: string; en: string }>> = {
	continental_shelf: { id: 'Batas Landas Kontinen', en: 'Continental Shelf Limit' },
	landas_kontinen_ekstensi: { id: 'Ekstensi', en: 'Extension' },
	eez_limit: { id: 'ZEE', en: 'EEZ' },
	fisheries: { id: 'Zona Perikanan MOU 1981', en: 'Fisheries Zone MOU 1981' },
	titik_perjanjian_lt: { id: 'Laut Teritorial', en: 'Territorial Sea' },
	titik_perjanjian_lk: { id: 'Landas Kontinen', en: 'Continental Shelf' },
	titik_perjanjian_zee: { id: 'ZEE', en: 'EEZ' },
	basepoints: { id: 'Titik Dasar', en: 'Base Points' },
	basepoints_2026: { id: 'Titik Dasar 2026', en: 'Base Points 2026' },
};

export function getLayerLabel(layerId: LayerId, locale: Locale): string {
	const entry = layerLabels[layerId as CoreLayerId];
	if (layerId === 'user_layer') return locale === 'id' ? 'Lapisan Pengguna' : 'User Layer';
	return entry ? pick(locale, entry.id, entry.en) : layerId;
}

export function getGroupLabel(groupId: string, locale: Locale, fallback: string): string {
	const entry = groupLabels[groupId];
	return entry ? pick(locale, entry.id, entry.en) : fallback;
}

export function getSublayerLabel(layerId: CoreLayerId, locale: Locale, fallback: string): string {
	const entry = sublayerLabels[layerId];
	return entry ? pick(locale, entry.id, entry.en) : fallback;
}

export const TIPE_BATAS_LAYER_IDS: Record<string, readonly CoreLayerId[]> = {
	baseline: ['baseline'],
	territorial_sea: ['territorial_sea'],
	contiguous_zone: ['contiguous_zone'],
	eez_limit: ['eez_limit'],
	continental_shelf: ['continental_shelf', 'landas_kontinen_ekstensi'],
	fisheries: ['fisheries'],
	basepoints: ['basepoints'],
	basepoints_2026: ['basepoints_2026'],
	titik_perjanjian: ['titik_perjanjian_lt', 'titik_perjanjian_lk', 'titik_perjanjian_zee'],
};

const LIMIT_TIPE_BATAS_KEYS = [
	'baseline',
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'fisheries',
] as const;

const POINT_TIPE_BATAS_KEYS = ['basepoints', 'basepoints_2026', 'titik_perjanjian'] as const;

export function getTipeBatasOptions(locale: Locale): FilterOption[] {
	return getTipeBatasOptionsForTarget(locale, 'limit').concat(getTipeBatasOptionsForTarget(locale, 'point'));
}

export function getTipeBatasOptionsForTarget(locale: Locale, target: FilterTarget): FilterOption[] {
	const keys = target === 'limit' ? LIMIT_TIPE_BATAS_KEYS : POINT_TIPE_BATAS_KEYS;
	const labels: Record<string, { id: string; en: string }> = {
		baseline: { id: 'Garis Pangkal', en: 'Baseline' },
		territorial_sea: { id: 'Laut Teritorial', en: 'Territorial Sea' },
		contiguous_zone: { id: 'Zona Tambahan', en: 'Contiguous Zone' },
		eez_limit: { id: 'Zona Ekonomi Eksklusif', en: 'Exclusive Economic Zone' },
		continental_shelf: { id: 'Landas Kontinen', en: 'Continental Shelf' },
		fisheries: { id: 'Zona Perikanan', en: 'Fisheries Zone' },
		basepoints: { id: 'Titik Dasar', en: 'Base Points' },
		basepoints_2026: { id: 'Titik Dasar 2026', en: 'Base Points 2026' },
		titik_perjanjian: { id: 'Titik Perjanjian', en: 'Agreement Points' },
	};
	return keys.map((value) => {
		const entry = labels[value];
		return { value, label: entry ? pick(locale, entry.id, entry.en) : value };
	});
}

export function isTipeBatasKeyForTarget(key: string, target: FilterTarget): boolean {
	const allowed = target === 'limit' ? LIMIT_TIPE_BATAS_KEYS : POINT_TIPE_BATAS_KEYS;
	return (allowed as readonly string[]).includes(key);
}

export const fieldLabels: Record<string, { id: string; en: string }> = {
	said: { id: 'ID Segmen', en: 'Segment ID' },
	fuid: { id: 'ID Unit Fitur', en: 'Feature Unit ID' },
	label: { id: 'Label', en: 'Label' },
	status: { id: 'Status', en: 'Status' },
	limit_object_type: { id: 'Tipe Batas', en: 'Limit Type' },
	releasibility_type: { id: 'Releasibility', en: 'Releasibility' },
	horizontal_datum: { id: 'Datum', en: 'Datum' },
	source_ids: { id: 'Sumber (ID)', en: 'Source (ID)' },
	location_type_list: { id: 'Tipe Titik', en: 'Point Type' },
	point_location: { id: 'Lokasi', en: 'Location' },
};

export function getFieldLabel(fieldName: string, locale: Locale, fallback: string): string {
	const entry = fieldLabels[fieldName];
	return entry ? pick(locale, entry.id, entry.en) : fallback;
}

/** Localize known enum / coded attribute values for popup & detail UI. */
export function formatFieldDisplayValue(_locale: Locale, _fieldName: string, value: unknown): string {
	if (value === undefined || value === null || value === '') {
		return '—';
	}
	const raw = String(value).trim();
	if (!raw) return '—';

	// Filter chips and popups show database values as-is (status, limit_object_type, etc.).
	return raw;
}
