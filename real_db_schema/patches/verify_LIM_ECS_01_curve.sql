-- Verify Extended Continental Shelf limit ↔ curve linkage (DBeaver)

SELECT l.fuID, l.label, rel.said_curve, ST_GeometryType(c.geom) AS geom_type
FROM feature_model_limit l
LEFT JOIN fmlimit_to_sacurve rel ON rel.fuid_limit = l.fuID
LEFT JOIN spatial_curves c ON c.saID = rel.said_curve
WHERE l.fuID LIKE 'LIM_ECS_%'
ORDER BY l.fuID;

-- Expected: LIM_ECS_01 | CURVE_ECS_01 | ST_LineString (or ST_MultiLineString)

-- If missing, insert:
-- INSERT INTO fmlimit_to_sacurve (fuid_limit, said_curve)
-- VALUES ('LIM_ECS_01', 'CURVE_ECS_01')
-- ON CONFLICT (fuid_limit, said_curve) DO NOTHING;
