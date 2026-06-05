import type { FeatureCollection, Geometry } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

const SOURCE_ID = 'geo_result_source';
const FILL_ID = 'geo_result_fill';
const LINE_ID = 'geo_result_line';
const POINT_ID = 'geo_result_point';

export function syncGeoResultLayer(
	map: MapLibreMap,
	collection: FeatureCollection<Geometry, Record<string, unknown>> | null,
	visible = true,
): void {
	if (!visible || !collection || collection.features.length === 0) {
		removeGeoResultLayer(map);
		return;
	}

	if (map.getSource(SOURCE_ID)) {
		(map.getSource(SOURCE_ID) as GeoJSONSource).setData(collection);
	} else {
		map.addSource(SOURCE_ID, { type: 'geojson', data: collection });
		map.addLayer({
			id: FILL_ID,
			type: 'fill',
			source: SOURCE_ID,
			filter: ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false],
			paint: {
				'fill-color': '#f59e0b',
				'fill-opacity': 0.25,
			},
		});
		map.addLayer({
			id: LINE_ID,
			type: 'line',
			source: SOURCE_ID,
			filter: [
				'match',
				['geometry-type'],
				['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
				true,
				false,
			],
			paint: {
				'line-color': '#d97706',
				'line-width': 2,
			},
		});
		map.addLayer({
			id: POINT_ID,
			type: 'circle',
			source: SOURCE_ID,
			filter: ['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false],
			paint: {
				'circle-radius': 5,
				'circle-color': '#d97706',
				'circle-stroke-width': 1,
				'circle-stroke-color': '#fff',
			},
		});
	}
}

export function removeGeoResultLayer(map: MapLibreMap): void {
	for (const id of [POINT_ID, LINE_ID, FILL_ID]) {
		if (map.getLayer(id)) {
			map.removeLayer(id);
		}
	}
	if (map.getSource(SOURCE_ID)) {
		map.removeSource(SOURCE_ID);
	}
}
