import type { CoreLayerId } from '@/lib/types';

export type AgreementKind = 'TS' | 'CS' | 'EEZ';

const TITIK_PERJANJIAN_LAYERS: CoreLayerId[] = [
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
];

export const isTitikPerjanjianLayer = (layerId: string): layerId is CoreLayerId =>
	TITIK_PERJANJIAN_LAYERS.includes(layerId as CoreLayerId);

const LAYER_TO_KIND: Record<string, AgreementKind> = {
	titik_perjanjian_lt: 'TS',
	titik_perjanjian_lk: 'CS',
	titik_perjanjian_zee: 'EEZ',
};

const KIND_TO_LAYER: Record<AgreementKind, CoreLayerId> = {
	TS: 'titik_perjanjian_lt',
	CS: 'titik_perjanjian_lk',
	EEZ: 'titik_perjanjian_zee',
};

export const getAgreementKindForLayer = (layerId: CoreLayerId): AgreementKind | null =>
	LAYER_TO_KIND[layerId] ?? null;

export const getLayerIdForAgreementKind = (kind: AgreementKind): CoreLayerId => KIND_TO_LAYER[kind];

/**
 * Classify titik perjanjian from fuID (Boundary Point rows only in practice).
 * Honors S-121 prefix conventions; joint P_B_CS/EEZ_C* rows are split in DB.
 */
export const resolveAgreementKindFromFuid = (fuid: string): AgreementKind | null => {
	if (!fuid) return null;
	if (fuid.startsWith('P_B_TS_') || fuid.startsWith('LOC_TS_')) return 'TS';
	if (fuid.startsWith('P_B_CS') || fuid.startsWith('LOC_CS_')) return 'CS';
	if (fuid.startsWith('P_B_EEZ') || fuid.startsWith('LOC_EEZ_')) return 'EEZ';
	return null;
};

/** Canonical UI layer for a boundary-point feature (popup / table routing). */
export const resolveTitikPerjanjianLayerId = (
	fuid: string,
	fallback: CoreLayerId,
): CoreLayerId => {
	const kind = resolveAgreementKindFromFuid(fuid);
	return kind ? getLayerIdForAgreementKind(kind) : fallback;
};
