import { resolveFeatureUnitId } from '@/lib/featureId';
import { isLineLayer } from '@/lib/geoLayerCatalog';
import type { LayerRuntimeState } from '@/store/layers/runtimeTypes';
import type { CoreLayerId } from '@/lib/types';

const ROW_ID_SEP = '::';

/** Map row selection id (`fuid` or `fuid::said`) to feature-unit ids for `/api/geo/*`. */
export function rowIdToFuid(rowId: string): string | null {
	const trimmed = rowId.trim();
	if (!trimmed) return null;
	const sep = trimmed.indexOf(ROW_ID_SEP);
	if (sep > 0) return trimmed.slice(0, sep);
	return trimmed;
}

export function rowIdToCurveSaid(rowId: string): string | null {
	const sep = rowId.indexOf(ROW_ID_SEP);
	if (sep <= 0) return null;
	const said = rowId.slice(sep + ROW_ID_SEP.length).trim();
	return said || null;
}

export interface GeoSelectionScope {
	/** Location layers or whole limit feature units. */
	fuids: string[];
	/** Limit layer curve segment (`spatial_curves.saID`) when user picked one line on the map. */
	curveSaids: string[];
}

/**
 * Selected features for geoprocessing.
 * Limit layers: prefer `curveSaids` so one map click = one curve segment, not every segment of the FUID.
 */
export function selectionToGeoScope(
	layerId: CoreLayerId,
	layer: LayerRuntimeState | undefined,
): GeoSelectionScope {
	if (!layer?.selectionIds?.length) {
		return { fuids: [], curveSaids: [] };
	}

	const curveSaids = new Set<string>();
	const fuids = new Set<string>();

	for (const rowId of layer.selectionIds) {
		const saidFromRow = rowIdToCurveSaid(rowId);
		if (saidFromRow && isLineLayer(layerId)) {
			curveSaids.add(saidFromRow);
			continue;
		}

		const feature = layer.featureIndex[rowId];
		if (feature && isLineLayer(layerId)) {
			const props = (feature.properties ?? {}) as Record<string, unknown>;
			const said = props.said;
			if (said != null && said !== '') {
				curveSaids.add(String(said));
				continue;
			}
		}

		const fuid =
			(feature
				? resolveFeatureUnitId((feature.properties ?? {}) as Record<string, unknown>)
				: null) ?? rowIdToFuid(rowId);
		if (fuid) fuids.add(fuid);
	}

	if (curveSaids.size > 0) {
		return { fuids: [], curveSaids: [...curveSaids] };
	}

	return { fuids: [...fuids], curveSaids: [] };
}

/** @deprecated Use selectionToGeoScope — kept for callers that only need FUIDs. */
export function selectionToFuids(
	layerId: CoreLayerId,
	layer: LayerRuntimeState | undefined,
): string[] {
	return selectionToGeoScope(layerId, layer).fuids;
}

/** Human-readable ids for UI (FUID + optional curve segment). */
export function selectionDisplayIds(
	layer: LayerRuntimeState | undefined,
): { fuid: string; segment?: string }[] {
	if (!layer?.selectionIds?.length) return [];
	return layer.selectionIds.map((rowId) => {
		const said = rowIdToCurveSaid(rowId);
		const fuid =
			rowIdToFuid(rowId) ??
			(layer.featureIndex[rowId]
				? resolveFeatureUnitId((layer.featureIndex[rowId].properties ?? {}) as Record<string, unknown>)
				: null) ??
			rowId;
		return said ? { fuid, segment: said } : { fuid };
	});
}
