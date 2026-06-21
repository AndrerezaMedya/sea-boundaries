import { ExternalLink, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { formatFieldDisplayValue, getFieldLabel } from '@/i18n/webgis-catalog';
import { useWebGisT } from '@/i18n/useWebGisT';
import { getLayerSchema } from '@/lib/schema';
import { normaliseFeatureProperties, resolveFeatureUnitId } from '@/lib/featureId';
import type { CoreLayerId, FeatureWithProps, LayerId } from '@/lib/types';
import { useLayersStore } from '@/store/useLayersStore';
import { fetchFeatureDetail } from '@/lib/apiClient';

interface FeatureDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	layerId: LayerId;
	featureId: string;
}

const formatValue = (
	value: unknown,
	yesLabel: string,
	noLabel: string,
): { text: string; empty: boolean } => {
	if (value === undefined || value === null || value === '') return { text: '—', empty: true };
	if (typeof value === 'boolean') return { text: value ? yesLabel : noLabel, empty: false };
	return { text: String(value), empty: false };
};

/** Hidden in detail modal UI (shown in header or not needed). */
const DETAIL_ATTR_OMIT = new Set(['said', 'fuid', 'horizontal_datum', 'start_life_span', 'end_life_span']);

const CORE_LAYERS = new Set<string>([
	'basepoints', 'basepoints_2026', 'landas_kontinen_ekstensi',
	'titik_perjanjian_lt', 'titik_perjanjian_lk', 'titik_perjanjian_zee',
	'territorial_sea', 'contiguous_zone', 'eez_limit', 'continental_shelf', 'fisheries', 'baseline',
]);

const FeatureDetailModal = ({ isOpen, onClose, layerId, featureId }: FeatureDetailModalProps) => {
	const { t, locale } = useWebGisT();
	const getFeatureById = useLayersStore((state) => state.getFeatureById);
	const schema = getLayerSchema(layerId);
	const modalRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [detailData, setDetailData] = useState<{ sources?: unknown[]; vertices?: unknown[]; parent_limits?: unknown[] } | null>(null);
	const [apiFeature, setApiFeature] = useState<FeatureWithProps | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);

	const storeFeature = useMemo(() => getFeatureById(layerId, featureId), [getFeatureById, layerId, featureId]);

	useEffect(() => {
		if (!isOpen || !layerId || !featureId) {
			setDetailData(null);
			setApiFeature(null);
			setDetailError(null);
			return;
		}
		if (!CORE_LAYERS.has(layerId)) return;

		setDetailLoading(true);
		setDetailError(null);
		setApiFeature(null);
		const fetchId =
			resolveFeatureUnitId(storeFeature?.properties ?? {}) ??
			(featureId.includes('::') ? featureId.split('::')[0] : featureId);
		fetchFeatureDetail(layerId as CoreLayerId, String(fetchId))
			.then((data) => {
				setDetailData({
					sources: data.sources,
					vertices: data.vertices,
					parent_limits: data.parent_limits,
				});
				setApiFeature({
					type: 'Feature',
					id: featureId,
					geometry: data.geometry,
					properties: normaliseFeatureProperties(data.properties ?? {}),
				} as FeatureWithProps);
			})
			.catch((err) => {
				console.error('Failed to fetch feature detail:', err);
				setDetailError(err instanceof Error ? err.message : String(err));
			})
			.finally(() => setDetailLoading(false));
	}, [isOpen, layerId, featureId, storeFeature]);

	const feature = storeFeature ?? apiFeature;

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) onClose();
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen) setPosition({ x: 0, y: 0 });
	}, [isOpen]);

	useEffect(() => {
		if (!isDragging) return;
		const handleMouseMove = (e: MouseEvent) => {
			setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
		};
		const handleMouseUp = () => setIsDragging(false);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragStart]);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if ((e.target as HTMLElement).closest('button, a')) return;
		setIsDragging(true);
		setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
	};

	if (!isOpen) return null;

	if (detailLoading && !feature) {
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center p-4' style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
				<div
					className='w-full max-w-sm p-6 text-center'
					style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-strong)' }}
				>
					<p className='text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'>{t('detail.loading')}</p>
				</div>
			</div>
		);
	}

	if (!feature) {
		const isRateLimited = detailError?.includes('429') || detailError?.includes('RATE_LIMITED');
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center p-4' style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
				<div
					className='w-full max-w-sm p-6'
					style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-strong)' }}
				>
					<p className='text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'>
						{isRateLimited ? t('detail.serverBusy') : t('detail.notFound')}
					</p>
					<p className='mt-2 text-sm text-[color:var(--color-text)]'>
						{isRateLimited
							? t('detail.rateLimitHint')
							: (detailError ?? t('detail.featureUnavailable'))}
					</p>
					<button
						type='button'
						onClick={onClose}
						className='mt-4 border border-[color:var(--color-border)] px-4 py-1.5 text-[12px] font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-panel-muted)]'
					>
						{t('common.close')}
					</button>
				</div>
			</div>
		);
	}

	const properties = feature.properties ?? {};
	const attributes = schema.fields
		.filter((field) => !DETAIL_ATTR_OMIT.has(field.name))
		.map((field) => {
			const raw = properties[field.name];
			return {
				name: field.name,
				label: getFieldLabel(field.name, locale, field.label),
				value: formatFieldDisplayValue(locale, field.name, raw),
				type: field.type,
			};
		});

	const titleValue = String(properties.label || properties.Label || properties.name || schema.label);
	const fuid = properties.fuid ? String(properties.fuid) : null;
	const displayId = fuid ?? featureId;

	const sources = (detailData?.sources ?? []) as any[];
	const parentLimits = (detailData?.parent_limits ?? []) as any[];

	return (
		<div
			className='fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4'
			style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
		>
			<div
				ref={modalRef}
				className='flex h-[min(92dvh,100%)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:h-[80vh] sm:rounded-2xl'
				style={{
					backgroundColor: 'var(--color-panel)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-strong)',
					transform: `translate(${position.x}px, ${position.y}px)`,
					cursor: isDragging ? 'grabbing' : 'default',
				}}
			>
				<header
					className='shrink-0 select-none'
					style={{
						borderBottom: '1px solid var(--color-border)',
						cursor: isDragging ? 'grabbing' : 'grab',
					}}
					onMouseDown={handleMouseDown}
				>
					<div className='flex items-start justify-between gap-3 px-5 py-3'>
						<div className='min-w-0 flex-1'>
							<h2 className='text-[17px] font-semibold leading-tight text-[color:var(--color-text)]'>
								{titleValue}
							</h2>
							<p className='mt-2 text-[11px] text-[color:var(--color-muted)]'>
								ID{' '}
								<code className='font-mono text-[color:var(--color-text)]'>{displayId}</code>
							</p>
						</div>
						<button
							type='button'
							onClick={onClose}
							className='shrink-0 p-1 text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-text)]'
							aria-label={t('common.close')}
						>
							<X className='h-3.5 w-3.5' />
						</button>
					</div>
				</header>

				{/* ── Body ───────────────────────────────────────────── */}
				<div className='flex-1 overflow-auto'>
					{detailError && (
						<div
							className='mx-5 mt-4 px-3 py-2 text-[12px]'
							style={{
								borderLeft: '2px solid #b91c1c',
								backgroundColor: '#fef2f2',
								color: '#991b1b',
							}}
						>
							{detailError}
						</div>
					)}

					{/* ── Section: Atribut ── */}
					<Section label={t('detail.attributes')} count={attributes.length}>
						<dl>
							{attributes.map((attr, i) => {
								const { text, empty } = formatValue(attr.value, t('common.yes'), t('common.no'));
								const isLast = i === attributes.length - 1;
								return (
									<div
										key={attr.name}
										className='grid grid-cols-[180px_1fr] gap-4 px-5 py-2'
										style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}
									>
										<dt className='text-[12px] text-[color:var(--color-muted)]'>
											{attr.label}
										</dt>
										<dd
											className={
												empty
													? 'text-[12px] text-[color:var(--color-muted)]'
													: 'text-[12px] font-medium text-[color:var(--color-text)] break-words'
											}
										>
											{text}
										</dd>
									</div>
								);
							})}
						</dl>
					</Section>

					{/* ── Section: Sumber Legal ── */}
					{detailLoading && sources.length === 0 ? (
						<Section label='Sumber' count={0} pending>
							<div className='px-5 py-3 text-[11px] text-[color:var(--color-muted)]'>
								Memuat referensi …
							</div>
						</Section>
					) : sources.length > 0 ? (
						<Section label='Sumber' count={sources.length}>
							<ol>
								{sources.map((src, i) => {
									const sid = src.sID || src.sid || '—';
									const citation = src.sourcedocumentname || src.citation || src.name || '—';
									const link = src.sourceonlineresourcelinkageurl;
									const description = src.description;
									const isLast = i === sources.length - 1;
									return (
										<li
											key={i}
											className='grid grid-cols-[28px_1fr] gap-3 px-5 py-3'
											style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}
										>
											<span className='text-[11px] text-[color:var(--color-muted)] tabular-nums'>
												[{i + 1}]
											</span>
											<div className='min-w-0'>
												<div className='flex flex-wrap items-baseline gap-2'>
													<code className='font-mono text-[12px] font-medium text-[color:var(--color-text)]'>
														{sid}
													</code>
													{description && (
														<span className='text-[11px] text-[color:var(--color-muted)]'>
															— {description}
														</span>
													)}
												</div>
												{link ? (
													<a
														href={link}
														target='_blank'
														rel='noopener noreferrer'
														className='mt-1 inline-flex items-baseline gap-1 text-[12px] leading-snug text-[color:var(--color-accent)] hover:underline'
													>
														<span>{citation}</span>
														<ExternalLink className='h-3 w-3 shrink-0 translate-y-0.5' />
													</a>
												) : (
													<p className='mt-1 text-[12px] leading-snug text-[color:var(--color-text)]'>
														{citation}
													</p>
												)}
											</div>
										</li>
									);
								})}
							</ol>
						</Section>
					) : null}

					{/* ── Section: Batas Terkait ── */}
					{parentLimits.length > 0 && (
						<Section label={t('detail.relatedLimits')} count={parentLimits.length}>
							<ol>
								{parentLimits.map((lim, i) => {
									const fid = lim.fuID || lim.fuid || '—';
									const isLast = i === parentLimits.length - 1;
									return (
										<li
											key={i}
											className='grid grid-cols-[28px_1fr] gap-3 px-5 py-3'
											style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}
										>
											<span className='text-[11px] text-[color:var(--color-muted)] tabular-nums'>
												[{i + 1}]
											</span>
											<div className='min-w-0'>
												<div className='flex flex-wrap items-baseline gap-2'>
													<code className='font-mono text-[12px] font-medium text-[color:var(--color-text)]'>
														{fid}
													</code>
													{lim.status && (
														<span className='text-[11px] text-[color:var(--color-muted)]'>
															{lim.status}
														</span>
													)}
												</div>
												<p className='mt-1 text-[12px] leading-snug text-[color:var(--color-text)]'>
													{lim.label || '—'}
												</p>
												{lim.limit_object_type && (
													<p className='mt-0.5 text-[11px] text-[color:var(--color-muted)]'>
														{lim.limit_object_type}
													</p>
												)}
											</div>
										</li>
									);
								})}
							</ol>
						</Section>
					)}
				</div>

				{/* ── Footer ─────────────────────────────────────────── */}
				<footer
					className='flex shrink-0 items-center justify-between gap-3 px-5 py-2.5 text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'
					style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-panel-elevated)' }}
				>
					<div className='flex items-center gap-3'>
						<span>{t('detail.attrCount', { count: attributes.length })}</span>
						{sources.length > 0 && (
							<>
								<span aria-hidden>·</span>
								<span>{t('detail.srcCount', { count: sources.length })}</span>
							</>
						)}
						{parentLimits.length > 0 && (
							<>
								<span aria-hidden>·</span>
								<span>{t('detail.limCount', { count: parentLimits.length })}</span>
							</>
						)}
						{detailLoading && (
							<>
								<span aria-hidden>·</span>
								<span className='text-[color:var(--color-accent)]'>{t('detail.fetching')}</span>
							</>
						)}
					</div>
					<button
						type='button'
						onClick={onClose}
						className='border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-1 text-[12px] font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-panel-muted)]'
					>
						{t('common.close')}
					</button>
				</footer>
			</div>
		</div>
	);
};

// ── Editorial-style section header with hairline rule ──
const Section = ({
	label,
	count,
	pending,
	children,
}: {
	label: string;
	count: number;
	pending?: boolean;
	children: React.ReactNode;
}) => (
	<section style={{ borderBottom: '1px solid var(--color-border)' }}>
		<header
			className='flex items-center justify-between px-5 py-2'
			style={{ backgroundColor: 'var(--color-panel-elevated)', borderBottom: '1px solid var(--color-border)' }}
		>
			<h3 className='text-[12px] font-semibold text-[color:var(--color-text)]'>
				{label}
			</h3>
			<span className='text-[12px] tabular-nums text-[color:var(--color-muted)]'>
				{pending ? '—' : String(count).padStart(2, '0')}
			</span>
		</header>
		<div>{children}</div>
	</section>
);

export default FeatureDetailModal;
