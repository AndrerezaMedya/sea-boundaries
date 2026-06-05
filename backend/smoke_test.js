const http = require('http');
const https = require('https');

const API_URL = 'https://s121-backend-339962740894.asia-southeast1.run.app/api/health';

https.get(API_URL, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Smoke test passed! API is healthy.');
      console.log('Response:', data);
    } else {
      console.error(`❌ Smoke test failed. Status: ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Smoke test request failed:', err.message);
});
