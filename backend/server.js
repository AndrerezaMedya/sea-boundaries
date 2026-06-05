require('dotenv').config();
const { createApp } = require('./app');
const { logger } = require('./lib/logging');

const port = process.env.PORT || 8080;
const app = createApp();

app.listen(port, () => {
  logger.info(
    {
      displayMode: process.env.DISPLAY_MODE || 'geojson',
      apiRateLimit: false,
    },
    `S-121 backend listening on port ${port} (display APIs without rate limit)`,
  );
});
