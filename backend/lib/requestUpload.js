const fs = require('fs');
const path = require('path');

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);

function isAllowedMime(mime) {
  return mime && ALLOWED_MIME.has(mime);
}

/**
 * Persist uploaded letter under REQUEST_UPLOAD_DIR/<requestId>/.
 * Returns storage key (relative path) or null when storage is not configured.
 */
async function saveRequestLetter(requestId, file) {
  const base = (process.env.REQUEST_UPLOAD_DIR || '').trim();
  if (!base || !file || !file.buffer) return null;

  const safeName = path.basename(file.originalname || 'surat').replace(/[^a-zA-Z0-9._-]/g, '_');
  const relKey = path.join(requestId, safeName);
  const absDir = path.join(base, requestId);
  await fs.promises.mkdir(absDir, { recursive: true });
  await fs.promises.writeFile(path.join(base, relKey), file.buffer);
  return relKey;
}

module.exports = { isAllowedMime, saveRequestLetter, ALLOWED_MIME };
