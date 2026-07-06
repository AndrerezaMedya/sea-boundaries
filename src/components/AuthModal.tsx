/**
 * AuthModal — Full-screen auth overlay, redesigned.
 *
 * Layout: two-panel (desktop) / single-column (mobile)
 *   Left  — brand panel: dark navy gradient + SEA-BANDL identity
 *   Right — form panel: Google + Email/Password tabs (Masuk | Daftar)
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'masuk' | 'daftar';

function parseFirebaseError(msg: string): string {
  if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found'))
    return 'Email atau kata sandi tidak valid.';
  if (msg.includes('email-already-in-use'))
    return 'Email sudah terdaftar. Silakan masuk.';
  if (msg.includes('weak-password'))
    return 'Kata sandi terlalu lemah (minimal 6 karakter).';
  if (msg.includes('too-many-requests'))
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request'))
    return '';
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('masuk');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset state on tab change or open
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  }, [tab, open]);

  // Focus first field when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const clearAndClose = useCallback(() => {
    setEmail(''); setPassword(''); setName(''); setConfirmPassword('');
    setError(null); setSuccess(null);
    onClose();
  }, [onClose]);

  const handleGoogle = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      await signInWithGoogle();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Login Google gagal');
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (tab === 'daftar' && password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'masuk') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name || undefined);
      }
      window.location.reload();
    } catch (e: unknown) {
      const msg = parseFirebaseError(e instanceof Error ? e.message : '');
      if (msg) setError(msg);
      setLoading(false);
    }
  }, [tab, email, password, confirmPassword, name, clearAndClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 10, 40, 0.85)', backdropFilter: 'blur(12px)' }}
      onClick={clearAndClose}
      role="dialog"
      aria-modal="true"
      aria-label="Dialog autentikasi"
    >
      {/* Card */}
      <div
        className="relative flex w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl"
        style={{ minHeight: 520, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── LEFT PANEL — Brand ── */}
        <div
          className="relative hidden flex-col justify-between p-10 md:flex md:w-[44%]"
          style={{
            background: 'linear-gradient(145deg, #0a1060 0%, #111FA2 55%, #1a3ab8 100%)',
          }}
        >
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 70%, rgba(255,222,66,0.08) 0%, transparent 65%)',
            }}
          />
          {/* Grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Logo + brand */}
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/20">
                <img src="/docs/logo_sea-bandl.png" alt="SEA-BANDL" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-white">SEA-BANDL</p>
                <p className="text-[10px] font-medium tracking-wider text-[#FFDE42]/80 uppercase">
                  Maritime Limits &amp; Boundaries
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-bold leading-snug text-white">
              Platform Data<br />
              <span style={{ color: '#FFDE42' }}>Batas Laut</span>
              <br />Nasional
            </h2>
          </div>

          {/* Description */}
          <div className="relative z-10">
            <div className="mb-4 h-px w-10 bg-white/20" />
            <p className="mb-6 text-[13px] leading-relaxed text-white/70">
              Silakan masuk ke akun Anda untuk mengakses fitur lanjutan dan data terintegrasi dari SEA-BANDL.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ── */}
        <div
          className="flex flex-1 flex-col overflow-y-auto"
          style={{ background: '#f8faff' }}
        >
          {/* Close */}
          <button
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            onClick={clearAndClose}
            aria-label="Tutup"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex flex-1 flex-col justify-center px-8 py-10 sm:px-10">
            {/* Mobile brand header */}
            <div className="mb-6 flex items-center gap-2 md:hidden">
              <img src="/docs/logo_sea-bandl.png" alt="SEA-BANDL" className="h-7 w-7 rounded-lg" />
              <span className="text-sm font-bold text-[#111FA2]">SEA-BANDL</span>
            </div>

            {/* Tab switcher */}
            <div
              className="mb-7 flex rounded-xl p-1"
              style={{ background: '#e8edff' }}
            >
              {(['masuk', 'daftar'] as Tab[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200"
                  style={
                    tab === t
                      ? { background: '#fff', color: '#111FA2', boxShadow: '0 1px 4px rgba(17,31,162,0.12)' }
                      : { color: '#6b7a99' }
                  }
                >
                  {t === 'masuk' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              id="auth-google-btn"
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Lanjutkan dengan Google
            </button>

            {/* Divider */}
            <div className="relative mb-5 flex items-center">
              <div className="flex-1 border-t border-slate-200" />
              <span className="mx-3 text-xs text-slate-400">atau dengan email</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {tab === 'daftar' && (
                <Field label="Nama Lengkap" id="auth-name">
                  <input
                    ref={firstInputRef}
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama kamu"
                    disabled={loading}
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Email" id="auth-email">
                <input
                  ref={tab === 'masuk' ? firstInputRef : undefined}
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@instansi.go.id"
                  disabled={loading}
                  className={inputClass}
                />
              </Field>

              <Field label="Kata Sandi" id="auth-password">
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={tab === 'masuk' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={inputClass}
                />
              </Field>

              {tab === 'daftar' && (
                <Field label="Konfirmasi Kata Sandi" id="auth-confirm-password">
                  <input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={inputClass}
                  />
                </Field>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-px shrink-0" aria-hidden>
                    <circle cx="7" cy="7" r="6.5" stroke="#ef4444" />
                    <path d="M7 4v3.5M7 9.5v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs text-green-700">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden>
                    <circle cx="7" cy="7" r="6.5" stroke="#16a34a" />
                    <path d="M4 7l2.5 2.5L10 5" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="auth-submit-btn"
                className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all duration-150 hover:opacity-90 hover:shadow-lg disabled:opacity-60"
                style={{
                  background: loading
                    ? '#6b7a99'
                    : 'linear-gradient(135deg, #111FA2 0%, #1e35c8 100%)',
                }}
              >
                {loading
                  ? 'Memproses...'
                  : tab === 'masuk' ? 'Masuk' : 'Buat Akun'}
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
              Dengan masuk, kamu menyetujui bahwa data yang diakses hanya untuk keperluan penelitian dan akademis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all duration-150 focus:border-[#111FA2] focus:outline-none focus:ring-2 focus:ring-[#111FA2]/15 disabled:bg-slate-50 disabled:opacity-70';

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
