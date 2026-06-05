import { X } from 'lucide-react';

import LayerToggles from '@/components/LayerToggles';
import { useWebGisT } from '@/i18n/useWebGisT';
import { mapToolPanelClassName } from '@/lib/mapPanelLayout';
import { useUIStore } from '@/store/useUI';
import type { SymbologyMode } from '@/store/useUI';

const LayerPanel = () => {
	const { t } = useWebGisT();
	const activePanel = useUIStore((s) => s.activePanel);
	const setActivePanel = useUIStore((s) => s.setActivePanel);
	const symbologyMode = useUIStore((s) => s.symbologyMode);
	const setSymbologyMode = useUIStore((s) => s.setSymbologyMode);

	if (activePanel !== 'layers') return null;

	return (
		<aside className={mapToolPanelClassName()}>
			{/* ── Document classification strip ─────────────────── */}
			<div
				className='flex shrink-0 items-center justify-between px-4 py-1.5 text-[11px] font-medium tracking-wide'
				style={{
					borderBottom: '1px solid var(--color-border)',
					backgroundColor: 'var(--color-panel-elevated)',
					color: 'var(--color-muted)',
				}}
			>
				<span>Layers · Control</span>
				<button
					type='button'
					onClick={() => setActivePanel(null)}
					className='p-1 transition-colors hover:text-[color:var(--color-text)]'
					aria-label='Tutup panel'
				>
					<X className='h-3 w-3' />
				</button>
			</div>

			{/* ── Symbology toggle ──────────────────────────────── */}
			<section
				className='shrink-0 px-4 py-3'
				style={{ borderBottom: '1px solid var(--color-border)' }}
			>
				<p className='mb-1.5 text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'>
					{t('layerPanel.symbology')}
				</p>
				<div className='flex gap-1 rounded-full p-1 border border-[color:var(--color-border)] bg-[color:var(--color-panel-muted)]' role='tablist'>
					{([
						{ mode: 'iho' as SymbologyMode, label: t('layerPanel.ihoStandard') },
						{ mode: 'easyRead' as SymbologyMode, label: t('layerPanel.easyRead') },
					]).map(({ mode, label }) => {
						const active = symbologyMode === mode;
						return (
							<button
								key={mode}
								type='button'
								onClick={() => setSymbologyMode(mode)}
								role='tab'
								aria-selected={active}
								className='flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-all duration-200'
								style={{
									backgroundColor: active ? 'var(--color-panel)' : 'transparent',
									color: active ? 'var(--color-text)' : 'var(--color-muted)',
									boxShadow: active ? '0 2px 4px rgba(15, 23, 42, 0.05)' : 'none',
								}}
							>
								{label}
							</button>
						);
					})}
				</div>
			</section>

			{/* ── Layer list ────────────────────────────────────── */}
			<section className='flex min-h-0 flex-1 flex-col'>
				<div
					className='flex shrink-0 items-center justify-between px-4 py-1.5'
					style={{ backgroundColor: 'var(--color-panel-elevated)', borderBottom: '1px solid var(--color-border)' }}
				>
					<p className='text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'>
						{t('layerPanel.layerIndex')}
					</p>
				</div>
				<div className='min-h-0 flex-1 overflow-y-auto p-3'>
					<LayerToggles />
				</div>
			</section>
		</aside>
	);
};

export default LayerPanel;
