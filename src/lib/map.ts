import type { FeatureCollection } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';

import { getFieldSchema, getLayerSchema, STATUS_LAUT_DASH, ZONA_COLOR_MAPPING } from '@/lib/schema';
import type { FieldSchema, LayerId } from '@/lib/types';

export const MAP_DEFAULT_CENTER: [number, number] = [118, -2];
export const MAP_DEFAULT_ZOOM = 4.2;

export const EMPTY_GEOJSON: FeatureCollection = {
	type: 'FeatureCollection',
	features: [],
};

const OSM_ATTRIBUTION = 'OpenStreetMap contributors | Rendered with MapLibre GL';

export const rasterFallbackStyle: StyleSpecification = {
	version: 8,
	name: 'OSM Raster',
	sources: {
		osm: {
			type: 'raster',
			tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
			tileSize: 256,
			attribution: OSM_ATTRIBUTION,
			maxzoom: 19,
		},
	},
	layers: [
		{
			id: 'osm-raster',
			type: 'raster',
			source: 'osm',
		},
	],
	glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

const resolveToken = (): string | undefined => {
	const envToken = import.meta.env.VITE_MAPTILER_TOKEN ?? import.meta.env.MAPTILER_TOKEN;
	return typeof envToken === 'string' && envToken.length > 0 ? envToken : undefined;
};

export const getBaseMapStyle = (): string | StyleSpecification => {
	const token = resolveToken();
	if (token) {
		return `https://api.maptiler.com/maps/streets-v2/style.json?key=${token}`;
	}
	return rasterFallbackStyle;
};

const formatNumber = (value: unknown): string => {
	if (typeof value === 'number') {
		return value.toLocaleString('id-ID');
	}
	if (typeof value === 'string') {
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			return numeric.toLocaleString('id-ID');
		}
	}
	return value === undefined || value === null ? '—' : String(value);
};

const formatDate = (value: unknown): string => {
	if (value === undefined || value === null) {
		return '—';
	}
	if (typeof value === 'number') {
		return new Date(value).toLocaleDateString('id-ID');
	}
	if (typeof value === 'string') {
		if (value.trim().length === 0) {
			return '—';
		}
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toLocaleDateString('id-ID');
		}
		const parts = value.split('-');
		if (parts.length === 3) {
			const [first, second, third] = parts;
			if (first.length === 2 && third.length === 4) {
				return `${first}/${second}/${third}`;
			}
		}
	}
	return String(value);
};

const formatValue = (field: FieldSchema, value: unknown): string => {
	if (value === undefined || value === null) {
		return '—';
	}
	if (field.type === 'number') {
		return formatNumber(value);
	}
	if (field.type === 'date') {
		return formatDate(value);
	}
	return String(value);
};

export const buildPopupHtml = (layerId: LayerId, properties: Record<string, unknown>): string => {
	const schema = getLayerSchema(layerId);
	const rows = schema.popupFields
		.map((fieldName) => {
			const fieldSchema = getFieldSchema(layerId, fieldName);
			if (!fieldSchema) {
				return null;
			}
			const value = properties[fieldName];
			return {
				label: fieldSchema.label,
				value: formatValue(fieldSchema, value),
			};
		})
		.filter((row): row is { label: string; value: string } => row !== null);
	const rowsHtml = rows
		.map(
			(row) => `
				<li class="flex justify-between gap-4 text-sm">
					<span class="font-medium text-slate-200">${row.label}</span>
					<span class="text-right text-slate-100">${row.value}</span>
				</li>
			`,
		)
		.join('');
	return `
		<div class="space-y-3">
			<div class="space-y-1">
				<p class="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300">${schema.label}</p>
				<h3 class="text-base font-semibold text-white">${String(properties[schema.primaryKey] ?? '—')}</h3>
			</div>
			<ul class="space-y-2">${rowsHtml}</ul>
		</div>
	`;
};

export const resolveZoneColor = (tipeZona: unknown): string => {
	if (typeof tipeZona !== 'string' || tipeZona.length === 0) {
		return ZONA_COLOR_MAPPING.default;
	}
	return ZONA_COLOR_MAPPING[tipeZona] ?? ZONA_COLOR_MAPPING.default;
};

export const resolveStatusDash = (status: unknown): number[] | undefined => {
	if (typeof status !== 'string' || status.length === 0) {
		return undefined;
	}
	return STATUS_LAUT_DASH[status] ?? undefined;
};
