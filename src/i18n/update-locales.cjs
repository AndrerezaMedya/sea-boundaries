const fs = require('fs');
const file = 'd:/web/coba-gis/sea-boundaries/src/i18n/webgis-messages.ts';

let content = fs.readFileSync(file, 'utf8');

// We need to insert `methodology: methodologyId,` at the end of the `id` object.
// The `id` object is defined as `const id = { ... };`.
// To find the end of `id`, let's just replace `};` before `const en = {`
content = content.replace(/\t\}\n\};\n\nconst en = \{/m, '\t},\n\tmethodology: methodologyId,\n};\n\nconst en = {');

// For the `en` object, replace `};` before `export const webgisMessages`
content = content.replace(/\t\}\n\};\n\nexport const webgisMessages/m, '\t},\n\tmethodology: methodologyEn,\n};\n\nexport const webgisMessages');

fs.writeFileSync(file, content, 'utf8');
console.log('Done mapping.');
