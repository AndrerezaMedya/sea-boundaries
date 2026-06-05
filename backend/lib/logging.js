const pino = require('pino');
const pinoHttp = require('pino-http');

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  // Cloud Logging in Cloud Run auto-ingests stdout JSON. Use the GCP severity
  // mapping so logs surface at the correct level in the console.
  formatters: isProd
    ? {
        level(label) {
          const map = { trace: 'DEBUG', debug: 'DEBUG', info: 'INFO', warn: 'WARNING', error: 'ERROR', fatal: 'CRITICAL' };
          return { severity: map[label] || 'DEFAULT' };
        },
      }
    : undefined,
  transport: isProd
    ? undefined
    : {
        target: 'pino/file',
        options: { destination: 1 },
      },
});

const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return { method: req.method, url: req.url };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});

module.exports = { logger, httpLogger };
