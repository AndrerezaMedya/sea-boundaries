const express = require('express');
const multer = require('multer');
const { pool } = require('../db/pool');
const { sendError, asyncRoute, ensureEnum, parsePagination } = require('../lib/queryHelpers');
const { buildRequestSubmitLimiter } = require('../lib/security');
const { requireDataRequestAdmin } = require('../lib/adminAuth');
const { isAllowedMime, saveRequestLetter } = require('../lib/requestUpload');
const { notifyDataRequestWebhook } = require('../lib/notifyWebhook');
const { logger } = require('../lib/logging');

const router = express.Router();
const submitLimiter = buildRequestSubmitLimiter();

const REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[-()\s\d]{9,20}$/;

function trimField(value) {
  return value == null ? '' : String(value).trim();
}

function validatePayload(body) {
  const nama_lengkap = trimField(body.namaLengkap);
  const nik_nim = trimField(body.nikNim);
  const institusi = trimField(body.institusi);
  const alamat_institusi = trimField(body.alamatInstitusi);
  const email = trimField(body.email);
  const no_telepon = trimField(body.noTelepon);
  const keperluan_data = trimField(body.keperluanData);

  if (nama_lengkap.length < 2) return 'namaLengkap';
  if (nik_nim.length < 4) return 'nikNim';
  if (institusi.length < 2) return 'institusi';
  if (alamat_institusi.length < 4) return 'alamatInstitusi';
  if (!EMAIL_RE.test(email)) return 'email';
  if (!PHONE_RE.test(no_telepon)) return 'noTelepon';
  if (keperluan_data.length < 8) return 'keperluanData';
  return null;
}

const LIST_COLUMNS = `
  id, created_at, status, nama_lengkap, institusi, email,
  keperluan_data, surat_filename, surat_storage_key
`;

// POST /api/data-requests — public submit
router.post(
  '/data-requests',
  submitLimiter,
  upload.single('suratInstitusi'),
  asyncRoute(async (req, res) => {
    const invalid = validatePayload(req.body);
    if (invalid) {
      return sendError(res, 400, 'INVALID_FIELD', `Field '${invalid}' is invalid or missing`);
    }

    const file = req.file;
    if (!file) {
      return sendError(res, 400, 'FILE_REQUIRED', 'Surat institusi wajib dilampirkan');
    }
    if (!isAllowedMime(file.mimetype)) {
      return sendError(res, 400, 'INVALID_FILE_TYPE', 'Tipe file tidak didukung');
    }

    const payload = {
      nama_lengkap: trimField(req.body.namaLengkap),
      nik_nim: trimField(req.body.nikNim),
      institusi: trimField(req.body.institusi),
      alamat_institusi: trimField(req.body.alamatInstitusi),
      email: trimField(req.body.email),
      no_telepon: trimField(req.body.noTelepon),
      keperluan_data: trimField(req.body.keperluanData),
      keterangan: trimField(req.body.keterangan) || null,
    };

    const insertSql = `
      INSERT INTO data_requests (
        nama_lengkap, nik_nim, institusi, alamat_institusi, email, no_telepon,
        keperluan_data, keterangan,
        surat_filename, surat_mime, surat_size_bytes,
        client_ip, user_agent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id, created_at, status
    `;

    const { rows } = await pool.query(insertSql, [
      payload.nama_lengkap,
      payload.nik_nim,
      payload.institusi,
      payload.alamat_institusi,
      payload.email,
      payload.no_telepon,
      payload.keperluan_data,
      payload.keterangan,
      file.originalname,
      file.mimetype,
      file.size,
      req.ip,
      req.get('user-agent') || null,
    ]);

    const row = rows[0];
    let storageKey = null;
    try {
      storageKey = await saveRequestLetter(row.id, file);
      if (storageKey) {
        await pool.query(
          'UPDATE data_requests SET surat_storage_key = $2, updated_at = now() WHERE id = $1',
          [row.id, storageKey],
        );
      }
    } catch (err) {
      logger.warn({ err, requestId: row.id }, 'Failed to persist request letter file');
    }

    logger.info({
      event: 'data_request_submitted',
      requestId: row.id,
      institusi: payload.institusi,
      email: payload.email,
      hasStorage: Boolean(storageKey),
      ip: req.ip,
    });

    void notifyDataRequestWebhook({
      event: 'data_request_submitted',
      id: row.id,
      created_at: row.created_at,
      institusi: payload.institusi,
      email: payload.email,
    });

    res.status(201).json({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      message: 'Permintaan data berhasil diterima dan akan ditinjau.',
      file_stored: Boolean(storageKey),
    });
  }),
);

// GET /api/data-requests — operator list (admin key)
router.get(
  '/data-requests',
  requireDataRequestAdmin,
  asyncRoute(async (req, res) => {
    const status = ensureEnum('status', req.query.status, REQUEST_STATUSES) || 'pending';
    const { limit, offset } = parsePagination(req.query.limit, req.query.offset, 50, 200);

    const { rows } = await pool.query(
      `SELECT ${LIST_COLUMNS}
         FROM data_requests
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [status, limit, offset],
    );

    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*)::int AS total FROM data_requests WHERE status = $1',
      [status],
    );

    res.json({ items: rows, total: countRows[0].total, status, limit, offset });
  }),
);

// GET /api/data-requests/:id — operator detail (admin key)
router.get(
  '/data-requests/:id',
  requireDataRequestAdmin,
  asyncRoute(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM data_requests WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Request not found');
    }
    res.json(rows[0]);
  }),
);

// PATCH /api/data-requests/:id — approve / reject (admin key)
router.patch(
  '/data-requests/:id',
  requireDataRequestAdmin,
  asyncRoute(async (req, res) => {
    const status = ensureEnum('status', req.body?.status, ['approved', 'rejected']);
    if (!status) {
      return sendError(res, 400, 'INVALID_STATUS', 'status must be approved or rejected');
    }
    const review_notes = trimField(req.body?.review_notes) || null;

    const { rows } = await pool.query(
      `UPDATE data_requests
          SET status = $2,
              review_notes = $3,
              reviewed_at = now(),
              updated_at = now()
        WHERE id = $1
          AND status = 'pending'
      RETURNING id, status, reviewed_at, review_notes`,
      [req.params.id, status, review_notes],
    );

    if (rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Request not found or already reviewed');
    }

    logger.info({
      event: 'data_request_reviewed',
      requestId: req.params.id,
      status,
      ip: req.ip,
    });

    res.json(rows[0]);
  }),
);

module.exports = router;
