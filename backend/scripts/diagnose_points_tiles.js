/**
 * Diagnose MVT point tiles: classification counts + sample tile feature counts.
 * Usage: node scripts/diagnose_points_tiles.js [z] [x] [y]
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../db/pool');
const { buildTilesetQuery } = require('../lib/tileSql');
const { agreementKindSqlExpr, boundaryPointMvtLayerIdExpr } = require('../lib/agreementPointKind');

async function main() {
  const z = Number(process.argv[2] ?? 6);
  const x = Number(process.argv[3] ?? 52);
  const y = Number(process.argv[4] ?? 34);

  const classify = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE loc.location_type_list = 'Boundary Point') AS boundary_total,
      COUNT(*) FILTER (WHERE loc.location_type_list = 'Boundary Point'
        AND (${boundaryPointMvtLayerIdExpr('loc')}) = 'boundary_point_ts') AS ts,
      COUNT(*) FILTER (WHERE loc.location_type_list = 'Boundary Point'
        AND (${boundaryPointMvtLayerIdExpr('loc')}) = 'boundary_point_cs') AS cs,
      COUNT(*) FILTER (WHERE loc.location_type_list = 'Boundary Point'
        AND (${boundaryPointMvtLayerIdExpr('loc')}) = 'boundary_point_eez') AS eez,
      COUNT(*) FILTER (WHERE loc.location_type_list = 'Boundary Point'
        AND (${boundaryPointMvtLayerIdExpr('loc')}) = 'boundary_point_other') AS other
    FROM feature_model_location loc
    JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
    JOIN spatial_points pt ON rel.said_point = pt.saID
    WHERE pt.geom IS NOT NULL AND NOT ST_IsEmpty(pt.geom)
  `);
  console.log('Boundary point classification (global):', classify.rows[0]);

  const { sql, params } = buildTilesetQuery('points', z);
  const tile = await pool.query(sql, params(z, x, y));
  const buf = tile.rows[0]?.mvt;
  console.log(`Tile points z=${z} x=${x} y=${y}: mvt bytes=${buf ? buf.length : 0}`);

  const inTile = await pool.query(
    `
    WITH tile AS (
      SELECT ST_TileEnvelope($1::int, $2::int, $3::int) AS env3857
    ),
    point_src AS (
      SELECT
        loc.fuID,
        loc.location_type_list,
        ST_Centroid(pt.geom) AS geom_4326
      FROM feature_model_location loc
      JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
      JOIN spatial_points pt ON rel.said_point = pt.saID
      WHERE loc.location_type_list IN ('Baseline Point', 'Boundary Point')
        AND pt.geom IS NOT NULL
        AND NOT ST_IsEmpty(pt.geom)
    )
    SELECT
      CASE
        WHEN ps.location_type_list = 'Baseline Point' THEN 'basepoints'
        WHEN ps.location_type_list = 'Boundary Point' THEN ${boundaryPointMvtLayerIdExpr('ps')}
        ELSE 'location_other'
      END AS layer_id,
      ${agreementKindSqlExpr('ps')} AS agreement_kind,
      COUNT(*) AS n
    FROM point_src ps
    CROSS JOIN tile
    WHERE ST_Intersects(ST_Transform(ps.geom_4326, 3857), tile.env3857)
    GROUP BY 1, 2
    ORDER BY 1, 2
    `,
    [z, x, y],
  );
  console.log('Features in tile by layer_id / agreement_kind:', inTile.rows);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
