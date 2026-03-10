/**
 * Auth scaffold store — UI-layer only.
 * No real backend yet. Will be wired to JWT / GatewayAuth in production.
 *
 * Architecture (see docs/architecture-overview.md):
 *   - 'public'         → sees obfuscated MVT tiles only; no raw data download
 *   - 'authenticated'  → approved user; can access WFS (raw GeoJSON) + download SHP/ZIP
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'sea-boundaries:auth';

export type UserRole = 'public' | 'authenticated';

interface AuthState {
	role: UserRole;
	username: string | null;
	/**
	 * DEV ONLY — mock login, no real credential check.
	 * Replace with: POST /api/auth/login → JWT → set token in httpOnly cookie.
	 */
	mockLogin: (username: string) => void;
	logout: () => void;
}

export const useAuthStore = create(
	persist<AuthState>(
		(set) => ({
			role: 'public',
			username: null,
			mockLogin: (username) => set({ role: 'authenticated', username: username.trim() || 'User' }),
			logout: () => set({ role: 'public', username: null }),
		}),
		{ name: STORAGE_KEY },
	),
);
