const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { mockPool, buildTestApp } = require('./helpers');

let app;
let mock;

beforeEach(() => {
  mock = mockPool();
  app = buildTestApp();
});
afterEach(() => mock.reset());

test('POST /api/data-requests creates row and returns 201', async () => {
  mock.enqueue({
    rows: [{
      id: '11111111-1111-1111-1111-111111111111',
      created_at: '2026-05-26T10:00:00.000Z',
      status: 'pending',
    }],
  });

  const res = await request(app)
    .post('/api/data-requests')
    .field('namaLengkap', 'Andi Wijaya')
    .field('nikNim', '3201010101900001')
    .field('institusi', 'Universitas Contoh')
    .field('alamatInstitusi', 'Jl. Merdeka No. 1, Jakarta')
    .field('email', 'andi@example.com')
    .field('noTelepon', '+6281234567890')
    .field('keperluanData', 'Penelitian batas maritim untuk tugas akhir')
    .field('keterangan', 'Opsional')
    .attach('suratInstitusi', Buffer.from('%PDF-1.4 test'), {
      filename: 'surat.pdf',
      contentType: 'application/pdf',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'pending');
  assert.equal(res.body.id, '11111111-1111-1111-1111-111111111111');
  assert.match(mock.calls[0].sql, /INSERT INTO data_requests/i);
});

test('POST /api/data-requests rejects missing file', async () => {
  const res = await request(app)
    .post('/api/data-requests')
    .field('namaLengkap', 'Andi Wijaya')
    .field('nikNim', '3201010101900001')
    .field('institusi', 'Universitas Contoh')
    .field('alamatInstitusi', 'Jl. Merdeka No. 1')
    .field('email', 'andi@example.com')
    .field('noTelepon', '+6281234567890')
    .field('keperluanData', 'Penelitian batas maritim');

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'FILE_REQUIRED');
  assert.equal(mock.calls.length, 0);
});

test('POST /api/data-requests rejects invalid email', async () => {
  const res = await request(app)
    .post('/api/data-requests')
    .field('namaLengkap', 'Andi')
    .field('nikNim', '1234')
    .field('institusi', 'UGM')
    .field('alamatInstitusi', 'Alamat panjang')
    .field('email', 'not-an-email')
    .field('noTelepon', '+62812')
    .field('keperluanData', 'Keperluan cukup panjang')
    .attach('suratInstitusi', Buffer.from('x'), { filename: 'a.pdf', contentType: 'application/pdf' });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_FIELD');
});

test('GET /api/data-requests requires admin key', async () => {
  const prev = process.env.DATA_REQUEST_ADMIN_KEY;
  process.env.DATA_REQUEST_ADMIN_KEY = 'test-admin-key';
  const res = await request(app).get('/api/data-requests');
  process.env.DATA_REQUEST_ADMIN_KEY = prev;
  assert.equal(res.status, 401);
});

test('GET /api/data-requests lists pending for admin', async () => {
  const prev = process.env.DATA_REQUEST_ADMIN_KEY;
  process.env.DATA_REQUEST_ADMIN_KEY = 'test-admin-key';
  mock.enqueue({ rows: [{ id: '11111111-1111-1111-1111-111111111111', status: 'pending' }] });
  mock.enqueue({ rows: [{ total: 1 }] });

  const res = await request(app)
    .get('/api/data-requests?status=pending')
    .set('X-Admin-Key', 'test-admin-key');

  process.env.DATA_REQUEST_ADMIN_KEY = prev;
  assert.equal(res.status, 200);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.items.length, 1);
});

test('PATCH /api/data-requests/:id approves pending row', async () => {
  const prev = process.env.DATA_REQUEST_ADMIN_KEY;
  process.env.DATA_REQUEST_ADMIN_KEY = 'test-admin-key';
  mock.enqueue({
    rows: [{
      id: '11111111-1111-1111-1111-111111111111',
      status: 'approved',
      reviewed_at: '2026-05-26T12:00:00.000Z',
      review_notes: 'OK',
    }],
  });

  const res = await request(app)
    .patch('/api/data-requests/11111111-1111-1111-1111-111111111111')
    .set('X-Admin-Key', 'test-admin-key')
    .send({ status: 'approved', review_notes: 'OK' });

  process.env.DATA_REQUEST_ADMIN_KEY = prev;
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'approved');
  assert.match(mock.calls[0].sql, /UPDATE data_requests/i);
});
