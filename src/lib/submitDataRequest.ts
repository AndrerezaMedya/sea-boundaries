import type { RequestFormData } from '@/lib/submitDataRequestTypes';

export type { RequestFormData } from '@/lib/submitDataRequestTypes';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export type DataRequestSubmitResult = {
	id: string;
	status: string;
	created_at: string;
	message: string;
	file_stored: boolean;
};

export async function submitDataRequest(form: RequestFormData): Promise<DataRequestSubmitResult> {
	if (!API_BASE) {
		throw new Error('VITE_API_BASE is not defined');
	}
	if (!form.suratInstitusi) {
		throw new Error('Surat institusi wajib dilampirkan');
	}

	const body = new FormData();
	body.append('namaLengkap', form.namaLengkap.trim());
	body.append('nikNim', form.nikNim.trim());
	body.append('institusi', form.institusi.trim());
	body.append('alamatInstitusi', form.alamatInstitusi.trim());
	body.append('email', form.email.trim());
	body.append('noTelepon', form.noTelepon.trim());
	body.append('keperluanData', form.keperluanData.trim());
	body.append('keterangan', form.keterangan.trim());
	body.append('suratInstitusi', form.suratInstitusi, form.suratInstitusi.name);

	const res = await fetch(`${API_BASE}/api/data-requests`, {
		method: 'POST',
		body,
	});

	const text = await res.text();
	let payload: unknown = {};
	try {
		payload = text ? JSON.parse(text) : {};
	} catch {
		// ignore
	}

	if (!res.ok) {
		const err = payload as { error?: { message?: string; code?: string } };
		throw new Error(err.error?.message || `Pengajuan gagal (${res.status})`);
	}

	return payload as DataRequestSubmitResult;
}
