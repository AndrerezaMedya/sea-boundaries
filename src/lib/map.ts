import type { FeatureCollection } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';

import { DEFAULT_BASEMAP_ID_BY_THEME, getBasemapDefinition, isRasterBasemapDefinition } from '@/data/basemaps';
import { classifyStatusTier, dashForStatusTier } from '@/lib/statusSymbology';
import { formatFieldDisplayValue, getFieldLabel, getLayerLabel, layerLabels } from '@/i18n/webgis-catalog';
import { getActiveLocale, normalizeLocale } from '@/i18n/locale';
import type { Locale } from '@/i18n/types';
import { normaliseFeatureProperties } from '@/lib/featureId';
import { getFieldSchema, getLayerSchema, ZONA_COLOR_MAPPING } from '@/lib/schema';
import type { CoreLayerId } from '@/lib/types';
import { resolveSourceLinks } from '@/lib/sourceLookup';
import type { LayerId } from '@/lib/types';
export const MAP_DEFAULT_CENTER: [number, number] = [118, -2];
export const MAP_DEFAULT_ZOOM = 4.2;

export const EMPTY_GEOJSON: FeatureCollection = {
	type: 'FeatureCollection',
	features: [],
};

export const getBaseMapStyle = (): StyleSpecification => {
	const defaultBasemap = getBasemapDefinition('light', DEFAULT_BASEMAP_ID_BY_THEME.light);
	if (!isRasterBasemapDefinition(defaultBasemap)) {
		return emptyBaseMapStyle;
	}

	return {
		version: 8,
		name: defaultBasemap.label,
		sources: {
			'default-basemap': {
				type: 'raster',
				tiles: defaultBasemap.tiles,
				tileSize: defaultBasemap.tileSize ?? 256,
				attribution: defaultBasemap.attribution,
				minzoom: defaultBasemap.minZoom,
				maxzoom: defaultBasemap.maxZoom,
			},
		},
		layers: [
			{
				id: 'default-basemap',
				type: 'raster',
				source: 'default-basemap',
			},
		],
		glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
	};
};

export const emptyBaseMapStyle: StyleSpecification = {
	version: 8,
	name: 'Empty Light Raster Shell',
	sources: {},
	layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#eef2f6' } }],
	glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

/** Not shown in map popup table (segment/point id — keep FU id in header only). */
const POPUP_TABLE_OMIT_FIELDS = new Set(['said', '_rowId', 'layer_id']);

const formatPopupFieldValue = (fieldName: string, value: unknown, fallbackValue: string): string => {
	if (fieldName !== 'Source') {
		return escapeHtml(fallbackValue);
	}

	const sourceLinks = resolveSourceLinks(value);
	if (sourceLinks.length === 0) {
		return escapeHtml(fallbackValue);
	}

	return sourceLinks
		.map(
			(link) => `
				<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2" style="color:#2563eb">
					${escapeHtml(link.label)}
				</a>
			`,
		)
		.join('<br />');
};

export const buildPopupHtml = (
	layerId: LayerId,
	properties: Record<string, unknown>,
	locale?: Locale,
): string => {
	const activeLocale = normalizeLocale(locale ?? getActiveLocale());
	const props = normaliseFeatureProperties(properties);
	const schema = getLayerSchema(layerId);
	const headerLabel =
		layerId in layerLabels
			? getLayerLabel(layerId as CoreLayerId, activeLocale)
			: schema.label;
	const primaryKeyLabel = getFieldLabel(
		schema.primaryKey,
		activeLocale,
		getFieldSchema(layerId, schema.primaryKey)?.label ?? schema.primaryKey,
	);

	const rows = schema.popupFields
		.filter(
			(fieldName) =>
				!POPUP_TABLE_OMIT_FIELDS.has(fieldName) && fieldName !== schema.primaryKey,
		)
		.map((fieldName) => {
			const fieldSchema = getFieldSchema(layerId, fieldName);
			if (!fieldSchema) {
				return null;
			}
			const value = props[fieldName];
			const displayText = formatFieldDisplayValue(activeLocale, fieldName, value);
			return {
				label: getFieldLabel(fieldName, activeLocale, fieldSchema.label),
				value: formatPopupFieldValue(
					fieldName,
					value,
					escapeHtml(displayText === '—' ? displayText : displayText),
				),
			};
		})
		.filter((row): row is { label: string; value: string } => row !== null);

	const primaryValue = escapeHtml(String(props[schema.primaryKey] ?? '—'));
	const rowsHtml = rows
		.map(
			(row) => `
				<tr class="border-b border-[color:var(--color-border)] last:border-0">
					<td class="py-2.5 pr-3 text-[11px] font-medium align-top" style="color:var(--color-muted)">${escapeHtml(row.label)}</td>
					<td class="py-2.5 text-[12px] font-semibold" style="color:var(--color-text)">${row.value}</td>
				</tr>
			`,
		)
		.join('');
	
	return `
		<div class="min-w-[280px]">
			<div class="mb-2 pb-3 border-b" style="border-color:var(--color-border)">
				<div class="text-[10px] font-bold uppercase tracking-widest mb-2" style="color:var(--color-accent, #3b82f6)">${escapeHtml(headerLabel)}</div>
				<div class="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-1" style="color:var(--color-muted)">${escapeHtml(primaryKeyLabel)}</div>
				<div class="text-base font-extrabold tracking-tight" style="color:var(--color-text)">${primaryValue}</div>
			</div>
			<table class="w-full">
				<tbody>${rowsHtml}</tbody>
			</table>
		</div>
	`;
};

export const resolveZoneColor = (tipeZona: unknown): string => {
	if (typeof tipeZona !== 'string' || tipeZona.length === 0) {
		return ZONA_COLOR_MAPPING.default;
	}
	return ZONA_COLOR_MAPPING[tipeZona] ?? ZONA_COLOR_MAPPING.default;
};

export const resolveStatusDash = (status: unknown): number[] | undefined =>
	dashForStatusTier(classifyStatusTier(status));
