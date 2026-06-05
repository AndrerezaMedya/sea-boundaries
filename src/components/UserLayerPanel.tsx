import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CloudUpload, FolderPlus, Link2, RefreshCcw, Trash2 } from 'lucide-react';

import FileDrop from '@/components/FileDrop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { isFeatureCountHigh, parseUserGeoJson } from '@/lib/userLayer';
import { USER_LAYER_ID } from '@/lib/types';
import { useLayersStore } from '@/store/useLayersStore';
import { useUIStore } from '@/store/useUI';

const HIGH_FEATURE_THRESHOLD = 50000;

const normaliseName = (name?: string | null): string | undefined => {
	if (!name) {
		return undefined;
	}
	const trimmed = name.trim();
	if (!trimmed) {
		return undefined;
	}
	if (trimmed.toLowerCase().endsWith('.geojson')) {
		return trimmed.slice(0, -8);
	}
	if (trimmed.toLowerCase().endsWith('.json')) {
		return trimmed.slice(0, -5);
	}
	return trimmed;
};

const buildDisplayNameFromUrl = (url: string): string | undefined => {
	try {
		const parsed = new URL(url);
		const pathname = parsed.pathname.split('/').filter(Boolean);
		if (pathname.length === 0) {
			return parsed.hostname;
		}
		return normaliseName(pathname[pathname.length - 1]) ?? parsed.hostname;
	} catch {
		return normaliseName(url);
	}
};

const UserLayerPanel = () => {
	const { toast } = useToast();
	const setUserLayer = useLayersStore((state) => state.setUserLayer);
	const removeUserLayer = useLayersStore((state) => state.removeUserLayer);
	const userLayerMeta = useLayersStore((state) => state.userLayerMeta);
	const lastUrl = useLayersStore((state) => state.lastUserLayerUrl);
	const setLastUserLayerUrl = useLayersStore((state) => state.setLastUserLayerUrl);
	const resetBuilderState = useUIStore((state) => state.resetBuilderState);

	const [urlInput, setUrlInput] = useState<string>('');
	const [loadingUrl, setLoadingUrl] = useState(false);
	const [loadingFile, setLoadingFile] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (lastUrl) {
			setUrlInput((value) => (value ? value : lastUrl));
		}
	}, [lastUrl]);

	const resetUserBuilderState = () => {
		resetBuilderState(USER_LAYER_ID);
	};

	const ingestGeoJson = async (raw: string, options: { source: 'file' | 'url'; name?: string; url?: string }) => {
		try {
			const { collection, schema, featureCount, geometryType } = parseUserGeoJson(raw, { name: options.name });
			setUserLayer({
				collection,
				schema,
				source: options.source,
				name: schema.label,
				url: options.url,
			});
			resetUserBuilderState();
			toast({
				title: 'Layer pengguna dimuat',
				description: `${featureCount.toLocaleString('id-ID')} fitur geometri ${geometryType} siap dianalisis.`,
			});
			if (isFeatureCountHigh(featureCount, HIGH_FEATURE_THRESHOLD)) {
				toast({
					title: 'Dataset sangat besar',
					description: 'Layer dengan >50.000 fitur dapat memperlambat peta dan Query Builder.',
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({
				title: 'Gagal memuat GeoJSON',
				description: error instanceof Error ? error.message : 'Pastikan berkas adalah GeoJSON FeatureCollection.',
				variant: 'destructive',
			});
		}
	};

	const handleFiles = async (files: FileList) => {
		if (!files || files.length === 0) {
			return;
		}
		const file = files[0];
		setLoadingFile(true);
		try {
			const text = await file.text();
			await ingestGeoJson(text, {
				source: 'file',
				name: normaliseName(file.name),
			});
		} finally {
			setLoadingFile(false);
		}
	};

	const handleSelectFile = () => {
		fileInputRef.current?.click();
	};

	const handleUrlLoad = async (overrideUrl?: string) => {
		const candidate = overrideUrl ?? urlInput;
		const trimmed = candidate.trim();
		if (!trimmed) {
			toast({ title: 'Masukkan URL GeoJSON', variant: 'destructive' });
			return;
		}
		setLoadingUrl(true);
		try {
			const response = await fetch(trimmed, { cache: 'no-store' });
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			const text = await response.text();
			await ingestGeoJson(text, {
				source: 'url',
				name: buildDisplayNameFromUrl(trimmed),
				url: trimmed,
			});
			setLastUserLayerUrl(trimmed);
			setUrlInput(trimmed);
		} catch (error) {
			toast({
				title: 'Gagal memuat URL',
				description: error instanceof Error ? error.message : 'Tidak dapat mengambil GeoJSON dari URL tersebut.',
				variant: 'destructive',
			});
		} finally {
			setLoadingUrl(false);
		}
	};

	const handleRemove = () => {
		removeUserLayer();
		resetUserBuilderState();
		toast({ title: 'Layer pengguna dihapus', description: 'Anda dapat memuat GeoJSON baru kapan saja.' });
	};

	const showLastUrlPrompt = !userLayerMeta.loaded && lastUrl && !urlInput.trim();

	return (
		<div className='space-y-4'>
			<FileDrop
				onFiles={handleFiles}
				accept='.geojson,application/geo+json,application/json'
				idleHint={
					<div className='flex flex-col items-center gap-2'>
						<CloudUpload className='h-7 w-7 text-[color:var(--color-muted)]' />
						<span className='text-sm font-semibold text-[color:var(--color-text)]'>Seret & jatuhkan berkas GeoJSON</span>
						<span className='max-w-[220px] text-[11px] text-[color:var(--color-muted)]'>Mendukung FeatureCollection dengan geometri sejenis</span>
					</div>
				}
				activeHint={
					<div className='flex flex-col items-center gap-2'>
						<CloudUpload className='h-7 w-7 text-[color:var(--color-muted)]' />
						<span className='text-sm font-semibold text-[color:var(--color-text)]'>Lepaskan untuk memuat GeoJSON</span>
					</div>
				}
			/>

			<div className='grid gap-2 sm:grid-cols-2'>
				<Button
					onClick={handleSelectFile}
					variant='outline'
					className='w-full min-w-0 gap-2 border-[color:var(--color-border)] bg-[color:var(--color-panel)] text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]'
					disabled={loadingFile || loadingUrl}
				>
					<FolderPlus className='h-4 w-4' />
					Pilih berkas
				</Button>
				<Button
					onClick={() => {
						if (!lastUrl) {
							toast({ title: 'Belum ada URL tersimpan', variant: 'destructive' });
							return;
						}
						void handleUrlLoad(lastUrl);
					}}
					variant='outline'
					className='w-full min-w-0 gap-2 border-[color:var(--color-border)] bg-[color:var(--color-panel)] text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)] disabled:text-[color:var(--color-muted)]'
					disabled={loadingUrl || loadingFile || !lastUrl}
				>
					<RefreshCcw className='h-4 w-4' />
					Muat ulang URL
				</Button>
			</div>

			<div className='flex flex-col gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-3 shadow-sm'>
				<label className='text-[12px] font-semibold text-[color:var(--color-muted)]'>URL GeoJSON</label>
				<div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
					<Input
						value={urlInput}
						onChange={(event) => setUrlInput(event.target.value)}
						placeholder='https://example.com/data.geojson'
						className='flex-1 border-[color:var(--color-border)] text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)]'
					/>
					<Button
						onClick={() => void handleUrlLoad()}
						className='w-full gap-2 bg-[color:var(--color-accent)] text-white hover:opacity-90 sm:w-auto'
						disabled={loadingUrl}
					>
						{loadingUrl ? 'Memuat...' : (
							<>
								<Link2 className='h-4 w-4' />
								Muat dari URL
							</>
						)}
					</Button>
				</div>
				{showLastUrlPrompt ? (
					<p className='text-[11px] text-[color:var(--color-muted)]'>URL terakhir: <button type='button' className='underline' onClick={() => setUrlInput(lastUrl)}>{lastUrl}</button></p>
				) : null}
			</div>

			{userLayerMeta.loaded ? (
				<div className='space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm'>
					<div className='flex items-center justify-between gap-3'>
						<div>
							<p className='text-[12px] font-semibold text-emerald-600'>Layer aktif</p>
							<h4 className='text-base font-semibold text-emerald-900'>{userLayerMeta.name ?? 'Layer Pengguna'}</h4>
						</div>
						<Button onClick={handleRemove} variant='ghost' size='sm' className='gap-1 text-emerald-800 hover:text-red-600'>
							<Trash2 className='mr-1 h-4 w-4' />Hapus
						</Button>
					</div>
					<ul className='space-y-1 text-xs text-emerald-800'>
						<li>Fitur: {userLayerMeta.featureCount?.toLocaleString('id-ID') ?? '0'}</li>
						<li>Geometri: {userLayerMeta.geometryType}</li>
						{userLayerMeta.source === 'url' && userLayerMeta.url ? <li>URL: <a href={userLayerMeta.url} target='_blank' rel='noreferrer' className='underline'>{userLayerMeta.url}</a></li> : null}
					</ul>
					<p className='text-[11px] text-emerald-700'>Layer ini otomatis aktif di peta, Query Builder, dan tabel atribut.</p>
				</div>
			) : (
				<div className='flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-3 text-xs text-[color:var(--color-muted)] shadow-sm'>
					<AlertTriangle className='h-4 w-4 text-[color:var(--color-muted)]' />
					<span>Belum ada GeoJSON pengguna yang dimuat. Gunakan salah satu opsi di atas.</span>
				</div>
			)}

			<input
				type='file'
				accept='.geojson,application/geo+json,application/json'
				ref={fileInputRef}
				onChange={(event) => {
					if (event.target.files) {
						void handleFiles(event.target.files);
					}
					event.target.value = '';
				}}
				className='hidden'
			/>
		</div>
	);
};

export default UserLayerPanel;

