<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580.6381666666666 466.6" width="580.6381666666666" height="466.6" style="--bg:#FFFFFF;--fg:#000000;--line:#555555;--accent:#000000;--surface:#FFFFFF;--border:#555555;background:var(--bg)">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
  text { font-family: 'Inter', system-ui, sans-serif; }
  svg {
    /* Derived from --bg and --fg (overridable via --line, --accent, etc.) */
    --_text:          var(--fg);
    --_text-sec:      var(--muted, color-mix(in srgb, var(--fg) 60%, var(--bg)));
    --_text-muted:    var(--muted, color-mix(in srgb, var(--fg) 40%, var(--bg)));
    --_text-faint:    color-mix(in srgb, var(--fg) 25%, var(--bg));
    --_line:          var(--line, color-mix(in srgb, var(--fg) 50%, var(--bg)));
    --_arrow:         var(--accent, color-mix(in srgb, var(--fg) 85%, var(--bg)));
    --_node-fill:     var(--surface, color-mix(in srgb, var(--fg) 3%, var(--bg)));
    --_node-stroke:   var(--border, color-mix(in srgb, var(--fg) 20%, var(--bg)));
    --_group-fill:    var(--bg);
    --_group-hdr:     color-mix(in srgb, var(--fg) 5%, var(--bg));
    --_inner-stroke:  color-mix(in srgb, var(--fg) 12%, var(--bg));
    --_key-badge:     color-mix(in srgb, var(--fg) 10%, var(--bg));
  }
</style>
<defs>
  <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
    <polygon points="0 0, 8 2.5, 0 5" fill="var(--_arrow)" stroke="var(--_arrow)" stroke-width="0.75" stroke-linejoin="round" />
  </marker>
  <marker id="arrowhead-start" markerWidth="8" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">
    <polygon points="8 0, 0 2.5, 8 5" fill="var(--_arrow)" stroke="var(--_arrow)" stroke-width="0.75" stroke-linejoin="round" />
  </marker>
</defs>
<polyline class="edge" data-from="U" data-to="FH" data-style="solid" data-arrow-start="false" data-arrow-end="true" data-label="1 Muat antarmuka" points="253.08724999999998,93.80000000000001 253.08724999999998,105.80000000000001 111.73349999999999,105.80000000000001 111.73349999999999,186.1" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)" />
<polyline class="edge" data-from="FH" data-to="DIST" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="111.73349999999999,239.9 111.73349999999999,287.90000000000003" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)" />
<polyline class="edge" data-from="U" data-to="CR" data-style="solid" data-arrow-start="false" data-arrow-end="true" data-label="2 Data spasial
(tile, atribut, geo)" points="287.3245833333333,93.80000000000001 287.3245833333333,129.8 349.64091666666667,129.8 349.64091666666667,224.4" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)" />
<polyline class="edge" data-from="CR" data-to="SM" data-style="solid" data-arrow-start="false" data-arrow-end="true" data-label="Kredensial" points="329.92875,278.20000000000005 329.92875,309.40000000000003 246.30866666666668,309.40000000000003 246.30866666666668,380.1" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)" />
<polyline class="edge" data-from="CR" data-to="CS" data-style="solid" data-arrow-start="false" data-arrow-end="true" data-label="Unix socket" points="369.3530833333333,278.20000000000005 369.3530833333333,290.20000000000005 452.97316666666666,290.20000000000005 452.97316666666666,380.1" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)" />
<g class="edge-label" data-from="U" data-to="FH" data-label="1 Muat antarmuka">
  <rect x="63.23349999999999" y="112.80000000000001" width="96.65200000000002" height="30.3" rx="2" ry="2" fill="var(--bg)" stroke="var(--_inner-stroke)" stroke-width="1" />
  <text x="111.5595" y="127.95000000000002" text-anchor="middle" font-size="11" font-weight="400" fill="var(--_text-sec)" dy="3.8499999999999996">1 Muat antarmuka</text>
</g>
<g class="edge-label" data-from="U" data-to="CR" data-label="2 Data spasial
(tile, atribut, geo)">
  <rect x="303.14091666666667" y="136.8" width="92.49400000000003" height="44.6" rx="2" ry="2" fill="var(--bg)" stroke="var(--_inner-stroke)" stroke-width="1" />
  <text x="349.3879166666667" y="159.10000000000002" text-anchor="middle" font-size="11" font-weight="400" fill="var(--_text-sec)"><tspan x="349.3879166666667" dy="-3.3000000000000007">2 Data spasial</tspan><tspan x="349.3879166666667" dy="14.3">(tile, atribut, geo)</tspan></text>
</g>
<g class="edge-label" data-from="CR" data-to="SM" data-label="Kredensial">
  <rect x="211.30866666666668" y="316.40000000000003" width="69.92200000000001" height="30.3" rx="2" ry="2" fill="var(--bg)" stroke="var(--_inner-stroke)" stroke-width="1" />
  <text x="246.2696666666667" y="331.55" text-anchor="middle" font-size="11" font-weight="400" fill="var(--_text-sec)" dy="3.8499999999999996">Kredensial</text>
</g>
<g class="edge-label" data-from="CR" data-to="CS" data-label="Unix socket">
  <rect x="416.47316666666666" y="297.20000000000005" width="72.89200000000001" height="30.3" rx="2" ry="2" fill="var(--bg)" stroke="var(--_inner-stroke)" stroke-width="1" />
  <text x="452.9191666666667" y="312.35" text-anchor="middle" font-size="11" font-weight="400" fill="var(--_text-sec)" dy="3.8499999999999996">Unix socket</text>
</g>
<g class="node" data-id="U" data-label="Pengguna
(Browser)" data-shape="rectangle">
  <rect x="218.84991666666667" y="40" width="102.71199999999999" height="53.800000000000004" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="270.20591666666667" y="66.9" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)"><tspan x="270.20591666666667" dy="-3.9000000000000012">Pengguna</tspan><tspan x="270.20591666666667" dy="16.900000000000002">(Browser)</tspan></text>
</g>
<g class="node" data-id="FH" data-label="Firebase Hosting
(CDN global)" data-shape="rectangle">
  <rect x="40" y="186.1" width="143.467" height="53.800000000000004" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="111.7335" y="213" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)"><tspan x="111.7335" dy="-3.9000000000000012">Firebase Hosting</tspan><tspan x="111.7335" dy="16.900000000000002">(CDN global)</tspan></text>
</g>
<g class="node" data-id="DIST" data-label="Berkas dist/
(HTML, CSS, JS)" data-shape="rectangle">
  <rect x="40.740999999999985" y="287.90000000000003" width="141.985" height="53.800000000000004" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="111.73349999999999" y="314.8" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)"><tspan x="111.73349999999999" dy="-3.9000000000000012">Berkas dist/</tspan><tspan x="111.73349999999999" dy="16.900000000000002">(HTML, CSS, JS)</tspan></text>
</g>
<g class="node" data-id="CR" data-label="Cloud Run
s121-backend" data-shape="rectangle">
  <rect x="290.50441666666666" y="224.4" width="118.273" height="53.800000000000004" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="349.64091666666667" y="251.3" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)"><tspan x="349.64091666666667" dy="-3.9000000000000012">Cloud Run</tspan><tspan x="349.64091666666667" dy="16.900000000000002">s121-backend</tspan></text>
</g>
<g class="node" data-id="SM" data-label="Google Secret Manager" data-shape="rectangle">
  <rect x="155.30916666666667" y="380.1" width="181.999" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="246.30866666666668" y="398.55" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">Google Secret Manager</text>
</g>
<g class="node" data-id="CS" data-label="Cloud SQL
PostgreSQL + PostGIS" data-shape="rectangle">
  <rect x="365.3081666666667" y="380.1" width="175.32999999999996" height="53.800000000000004" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="452.97316666666666" y="407" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)"><tspan x="452.97316666666666" dy="-3.9000000000000012">Cloud SQL</tspan><tspan x="452.97316666666666" dy="16.900000000000002">PostgreSQL + PostGIS</tspan></text>
</g>
</svg>