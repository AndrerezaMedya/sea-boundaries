const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

type DisplaySession = {
	token: string;
	expiresAt: number;
	displayMode: 'mvt' | 'geojson';
};

let session: DisplaySession | null = null;
let inflight: Promise<DisplaySession> | null = null;

const parseExpiresAt = (iso: string): number => {
	const ms = Date.parse(iso);
	return Number.isFinite(ms) ? ms : Date.now() + 3_600_000;
};

const isSessionValid = (): boolean => {
	if (!session) return false;
	return Date.now() < session.expiresAt - 30_000;
};

export const getDisplayToken = (): string | null => {
	if (!isSessionValid()) return null;
	return session?.token ?? null;
};

export const getDisplayModeFromSession = (): 'mvt' | 'geojson' | null => session?.displayMode ?? null;

async function fetchDisplaySessionOnce(): Promise<DisplaySession> {
	const res = await fetch(`${API_BASE}/api/display/session`);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Display session failed (${res.status}): ${text}`);
	}
	const body = (await res.json()) as {
		token: string;
		expiresAt: string;
		displayMode?: 'mvt' | 'geojson';
	};
	const next: DisplaySession = {
		token: body.token,
		expiresAt: parseExpiresAt(body.expiresAt),
		displayMode: body.displayMode === 'mvt' ? 'mvt' : 'geojson',
	};
	session = next;
	return next;
}

/**
 * Fetch (or reuse) BFF display session token.
 * Single-flight: parallel callers share one in-flight request (avoids 429 on init).
 */
export const ensureDisplaySession = async (): Promise<DisplaySession> => {
	if (isSessionValid() && session) {
		return session;
	}
	if (!inflight) {
		inflight = fetchDisplaySessionOnce().finally(() => {
			inflight = null;
		});
	}
	return inflight;
};

export const clearDisplaySession = (): void => {
	session = null;
	inflight = null;
};
