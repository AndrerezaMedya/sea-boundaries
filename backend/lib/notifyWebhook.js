const { logger } = require('./logging');

/** Fire-and-forget webhook for new data requests (optional). */
async function notifyDataRequestWebhook(payload) {
  const url = (process.env.DATA_REQUEST_NOTIFY_WEBHOOK_URL || '').trim();
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      logger.warn({ status: res.status, url }, 'Data request webhook returned non-OK');
    }
  } catch (err) {
    logger.warn({ err, url }, 'Data request webhook failed');
  }
}

module.exports = { notifyDataRequestWebhook };
