const express = require('express');
const { pool } = require('../db/pool');
const { sendError, asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

/**
 * GET /api/meta/filter-options
 * Distinct values for simple filter chips (not bbox-limited).
 */
router.get('/meta/filter-options', asyncRoute(async (_req, res) => {
	res.set('Cache-Control', 'no-store, must-revalidate');
	const [
		datumQuery,
		pointLocation,
		statusLimit,
		statusLocation,
		limitObjectTypes,
		locationTypes,
	] = await Promise.all([
		pool.query(`
      SELECT DISTINCT TRIM(horizontal_datum) AS value
        FROM spatial_information_type
       WHERE horizontal_datum IS NOT NULL AND TRIM(horizontal_datum) <> ''
       ORDER BY 1
    `),
		pool.query(`
      SELECT DISTINCT TRIM(location_by_text) AS value
        FROM spatial_information_type
       WHERE location_by_text IS NOT NULL AND TRIM(location_by_text) <> ''
       ORDER BY 1
    `),
		pool.query(`
      SELECT DISTINCT TRIM(status) AS value
        FROM feature_model_limit
       WHERE status IS NOT NULL AND TRIM(status) <> ''
       ORDER BY 1
    `),
		pool.query(`
      SELECT DISTINCT TRIM(status) AS value
        FROM feature_model_location
       WHERE status IS NOT NULL AND TRIM(status) <> ''
       ORDER BY 1
    `),
		pool.query(`
      SELECT DISTINCT TRIM(limit_object_type) AS value
        FROM feature_model_limit
       WHERE limit_object_type IS NOT NULL AND TRIM(limit_object_type) <> ''
       ORDER BY 1
    `),
		pool.query(`
      SELECT DISTINCT TRIM(location_type_list) AS value
        FROM feature_model_location
       WHERE location_type_list IS NOT NULL AND TRIM(location_type_list) <> ''
       ORDER BY 1
    `),
	]);

	const horizontal_datum = datumQuery.rows.map((r) => r.value);
	const point_location = pointLocation.rows.map((r) => r.value);

	const status_limit = statusLimit.rows.map((r) => r.value);
	const status_point = statusLocation.rows.map((r) => r.value);

	const limit_object_type = limitObjectTypes.rows.map((r) => r.value);
	const location_type_list = locationTypes.rows.map((r) => r.value);

	res.json({
		horizontal_datum,
		point_location,
		status_limit,
		status_point,
		limit_object_type,
		location_type_list,
	});
}));

module.exports = router;
