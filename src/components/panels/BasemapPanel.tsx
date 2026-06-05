import { X } from 'lucide-react';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useUIStore } from '@/store/useUI';
import { lightBasemaps, type BasemapDefinition } from '@/data/basemaps';
import { mapToolPanelClassName } from '@/lib/mapPanelLayout';

const resolvePreviewSrc = (definition: BasemapDefinition): string => {
	const sourceTile =
		definition.previewTiles?.[0] ??
		(definition.kind === 'raster' ? definition.tiles[0] : '');

	if (!sourceTile) {
		return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="100%25" height="100%25" fill="%23dbeafe"/%3E%3C/svg%3E';
	}

	const minZoom = typeof definition.minZoom === 'number' ? definition.minZoom : 0;
	return sourceTile
		.replace('{x}', '0')
		.replace('{y}', '0')
		.replace('{z}', String(minZoom));
};

const BasemapPanel = () => {
	const { t } = useWebGisT();
	const activePanel = useUIStore((s) => s.activePanel);
	const setActivePanel = useUIStore((s) => s.setActivePanel);
	const activeBasemapId = useUIStore((s) => s.activeBasemapId);
	const setActiveBasemapId = useUIStore((s) => s.setActiveBasemapId);

	if (activePanel !== 'basemap') return null;

	const definitions = Object.values(lightBasemaps);

	return (
		<div className={mapToolPanelClassName()}>
			<div className='flex shrink-0 items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3'>
				<h2 className='text-sm font-semibold text-[color:var(--color-text)]'>{t('ribbon.basemap') || 'Peta Dasar'}</h2>
				<button
					type='button'
					onClick={() => setActivePanel(null)}
					className='rounded-md p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)]'
					aria-label={t('common.closePanel') || 'Tutup'}
				>
					<X className='h-4 w-4' />
				</button>
			</div>
			
			<div className='flex-1 overflow-y-auto p-4'>
				<div className='grid grid-cols-2 gap-4'>
					{definitions.map((def) => {
						const isActive = activeBasemapId === def.id;
						return (
							<button
								key={def.id}
								type='button'
								onClick={() => setActiveBasemapId(def.id)}
								className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-1 transition-all duration-200 ${
									isActive 
										? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]' 
										: 'border-transparent hover:bg-slate-50'
								}`}
							>
								<div className='relative w-full overflow-hidden rounded-xl bg-slate-200' style={{ aspectRatio: '1/1' }}>
									<img 
										src={resolvePreviewSrc(def)} 
										alt={def.label} 
										className={`h-full w-full object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
									/>
									{isActive && (
										<div className='absolute inset-0 ring-4 ring-[color:var(--color-accent)] ring-inset rounded-xl' />
									)}
								</div>
								<span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? 'text-[color:var(--color-accent)]' : 'text-slate-600 group-hover:text-slate-900'}`}>
									{def.label}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default BasemapPanel;
