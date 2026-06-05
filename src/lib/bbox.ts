/** WGS84 bounding box (degrees). */
export type Bbox = {
	minLon: number;
	minLat: number;
	maxLon: number;
	maxLat: number;
};

/** Default extent for initial WebGIS load (Indonesia maritime context). */
export const INDONESIA_BBOX: Bbox = {
	minLon: 95,
	minLat: -11,
	maxLon: 141,
	maxLat: 6,
};

const BBOX_LIMITS = { minLon: 60, maxLon: 160, minLat: -25, maxLat: 20 };

export const bboxToParam = (bbox: Bbox): string =>
	`${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`;

/** Expand bbox by fraction of span (clamped to API bounds). */
export const expandBbox = (bbox: Bbox, fraction = 0.12): Bbox => {
	const lonSpan = bbox.maxLon - bbox.minLon;
	const latSpan = bbox.maxLat - bbox.minLat;
	const padLon = lonSpan * fraction;
	const padLat = latSpan * fraction;
	return {
		minLon: Math.max(BBOX_LIMITS.minLon, bbox.minLon - padLon),
		minLat: Math.max(BBOX_LIMITS.minLat, bbox.minLat - padLat),
		maxLon: Math.min(BBOX_LIMITS.maxLon, bbox.maxLon + padLon),
		maxLat: Math.min(BBOX_LIMITS.maxLat, bbox.maxLat + padLat),
	};
};

export const bboxFromMapBounds = (bounds: {
	getWest: () => number;
	getSouth: () => number;
	getEast: () => number;
	getNorth: () => number;
}): Bbox => ({
	minLon: bounds.getWest(),
	minLat: bounds.getSouth(),
	maxLon: bounds.getEast(),
	maxLat: bounds.getNorth(),
});

export const bboxAreaDeg2 = (bbox: Bbox): number =>
	(bbox.maxLon - bbox.minLon) * (bbox.maxLat - bbox.minLat);

/** Shrink bbox toward its center until area is at most maxAreaDeg2. */
export const clampBboxArea = (bbox: Bbox, maxAreaDeg2: number): Bbox => {
	const area = bboxAreaDeg2(bbox);
	if (area <= maxAreaDeg2) return bbox;
	const scale = Math.sqrt(maxAreaDeg2 / area);
	const cx = (bbox.minLon + bbox.maxLon) / 2;
	const cy = (bbox.minLat + bbox.maxLat) / 2;
	const halfLon = ((bbox.maxLon - bbox.minLon) / 2) * scale;
	const halfLat = ((bbox.maxLat - bbox.minLat) / 2) * scale;
	return {
		minLon: Math.max(BBOX_LIMITS.minLon, cx - halfLon),
		minLat: Math.max(BBOX_LIMITS.minLat, cy - halfLat),
		maxLon: Math.min(BBOX_LIMITS.maxLon, cx + halfLon),
		maxLat: Math.min(BBOX_LIMITS.maxLat, cy + halfLat),
	};
};
