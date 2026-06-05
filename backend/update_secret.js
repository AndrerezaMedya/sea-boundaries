const fs = require('fs');
const { execSync } = require('child_process');

// Write EXACTLY the password without any trailing whitespace or newline
fs.writeFileSync('db_pass.txt', 'sea/1boundAries');

console.log('Writing secret...');
execSync('gcloud secrets versions add s121-db-password --data-file=db_pass.txt', { stdio: 'inherit' });
console.log('Done');
