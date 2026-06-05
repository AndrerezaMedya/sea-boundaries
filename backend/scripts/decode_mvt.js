/**
 * Decode MVT and print feature properties. Usage: node scripts/decode_mvt.js [path.mvt]
 */
const fs = require('fs');
const path = require('path');

async function main() {
  const file = process.argv[2] || path.join(__dirname, '_sample.mvt');
  const buf = fs.readFileSync(file);
  let VectorTile;
  let Pbf;
  try {
    VectorTile = require('@mapbox/vector-tile').VectorTile;
    const pbfMod = require('pbf');
    Pbf = pbfMod.default ?? pbfMod;
  } catch {
    console.error('Install: npm install @mapbox/vector-tile pbf');
    process.exit(1);
  }
  const tile = new VectorTile(new Pbf(buf));
  for (const layerName of Object.keys(tile.layers)) {
    const layer = tile.layers[layerName];
    console.log(`\nLayer "${layerName}" features: ${layer.length}`);
    for (let i = 0; i < Math.min(layer.length, 15); i++) {
      const f = layer.feature(i);
      f.toGeoJSON(0, 0, 6);
      console.log(i, JSON.stringify(f.properties));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
