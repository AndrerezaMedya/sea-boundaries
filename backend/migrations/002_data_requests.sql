-- Institutional data request workflow (Phase 3 security plan).
-- Apply: psql ... -f backend/migrations/002_data_requests.sql

CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  nama_lengkap TEXT NOT NULL,
  nik_nim TEXT NOT NULL,
  institusi TEXT NOT NULL,
  alamat_institusi TEXT NOT NULL,
  email TEXT NOT NULL,
  no_telepon TEXT NOT NULL,
  keperluan_data TEXT NOT NULL,
  keterangan TEXT,
  surat_filename TEXT,
  surat_mime TEXT,
  surat_size_bytes INTEGER,
  surat_storage_key TEXT,
  client_ip TEXT,
  user_agent TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_requests_status_created
  ON data_requests (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_requests_email
  ON data_requests (lower(email));
