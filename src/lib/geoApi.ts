import type { FeatureCollection, Geometry } from 'geojson';

import { ensureDisplaySession, getDisplayToken } from '@/lib/displaySession';
import type { CoreLayerId } from '@/lib/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export interface GeoMeasureResult {
	operation: 'length' | 'area';
	unit: 'km' | 'km2';
	value: number;
	featureCount: number;
	emptyResult?: boolean;
}

export interface GeoInfo {
	version: number;
	bboxRequired: boolean;
	maxInputFeatures: number;
	maxOutputFeatures: number;
	maxBufferKm: number;
}

export interface GeoGeometryMeta {
	operation: string;
	simplified?: boolean;
	distanceKm?: number;
	inputCount?: number;
	outputCount?: number;
	inputTruncated?: boolean;
	pairsCapped?: boolean;
	resultHint?: string;
	layerA?: string;
	layerB?: string;
	clipBy?: string;
}

export function parseGeoApiError(message: string): { code: string; detail: string } {
	const match = message.match(/^([A-Z0-9_]+):\s*(.*)$/);
	if (match) {
		return { code: match[1], detail: match[2] };
	}
	return { code: 'UNKNOWN', detail: message };
}

export async function fetchGeoInfo(): Promise<GeoInfo> {
	if (!API_BASE) {
		throw new Error('VITE_API_BASE is not defined');
	}
	await ensureDisplaySession();
	const headers: Record<string, string> = {};
	const token = getDisplayToken();
	if (token) {
		headers['X-Display-Token'] = token;
	}
	const res = await fetch(`${API_BASE}/api/geo/info`, { cache: 'no-store', headers });
	if (!res.ok) {
		throw new Error(`GEO_INFO_FAILED: ${res.status}`);
	}
	return res.json() as Promise<GeoInfo>;
}

export type GeoFeatureCollectionResponse = FeatureCollection<Geometry, Record<string, unknown>> & {
	meta?: GeoGeometryMeta;
};

async function postGeoJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
	if (!API_BASE) {
		throw new Error('VITE_API_BASE is not defined');
	}
	await ensureDisplaySession();
	const token = getDisplayToken();
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (token) {
		headers['X-Display-Token'] = token;
	}
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		cache: 'no-store',
		headers,
		body: JSON.stringify(body),
	});
	const text = await res.text();
	let payload: unknown = null;
	try {
		payload = text ? JSON.parse(text) : null;
	} catch {
		payload = null;
	}
	if (!res.ok) {
		const err = payload as { error?: { code?: string; message?: string } } | null;
		const code = err?.error?.code ?? `HTTP_${res.status}`;
		const message = err?.error?.message ?? (text || res.statusText);
		throw new Error(`${code}: ${message}`);
	}
	return payload as T;
}

export interface GeoSelectionPayload {
	fuids?: string[];
	curveSaids?: string[];
}

export async function geoMeasure(
	operation: 'length' | 'area',
	layerId: CoreLayerId,
	selection: GeoSelectionPayload,
): Promise<GeoMeasureResult> {
	return postGeoJson<GeoMeasureResult>('/api/geo/measure', {
		operation,
		layerId,
		fuids: selection.fuids ?? [],
		curveSaids: selection.curveSaids ?? [],
	});
}

export async function geoBuffer(
	layerId: CoreLayerId,
	selection: GeoSelectionPayload,
	distanceKm: number,
): Promise<GeoFeatureCollectionResponse> {
	return postGeoJson<GeoFeatureCollectionResponse>('/api/geo/buffer', {
		layerId,
		fuids: selection.fuids ?? [],
		curveSaids: selection.curveSaids ?? [],
		distanceKm,
	});
}

export async function geoIntersect(
	layerA: CoreLayerId,
	layerB: CoreLayerId,
	fuidsA: string[],
	fuidsB: string[],
): Promise<GeoFeatureCollectionResponse> {
	return postGeoJson<GeoFeatureCollectionResponse>('/api/geo/intersect', {
		layerA,
		layerB,
		fuidsA,
		fuidsB,
	});
}

export async function geoClip(
	layerId: CoreLayerId,
	fuids: string[],
	clipLayerId: CoreLayerId,
): Promise<GeoFeatureCollectionResponse> {
	return postGeoJson<GeoFeatureCollectionResponse>('/api/geo/clip', {
		layerId,
		fuids,
		clipBy: 'layer',
		clipLayerId,
	});
}
