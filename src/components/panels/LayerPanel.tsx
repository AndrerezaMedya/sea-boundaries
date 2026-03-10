import { X } from 'lucide-react';

import LayerToggles from '@/components/LayerToggles';
import { useReadableColor } from '@/hooks/useReadableColor';
import { getLayerSchema } from '@/lib/schema';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

const LayerPanel = () => {
    const activePanel = useUIStore((s) => s.activePanel);
    const setActivePanel = useUIStore((s) => s.setActivePanel);

    const activeLayerId = useLayersStore((s) => s.activeLayerId);
    const layerState = useLayersStore((s) => s.layers[activeLayerId]);
    const schema = getLayerSchema(activeLayerId);

    const filteredCount = layerState?.filteredIds.length ?? 0;
    const totalCount = layerState?.data.features.length ?? 0;
    const selectionCount = layerState?.selectionIds.length ?? 0;
    const badgeTextColor = useReadableColor('--color-panel-muted');

    if (activePanel !== 'layers') return null;

    return (
        <div
            className='absolute left-0 top-0 z-30 flex h-full w-[280px] flex-col border-r bg-[color:var(--color-panel)] shadow-xl transition-transform duration-200 ease-in-out panel-slide-left'
            style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
        >
            {/* Header */}
            <div
                className='flex shrink-0 items-center justify-between border-b px-4 py-3'
                style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
            >
                <h2 className='text-sm font-semibold text-[color:var(--color-text)]'>Layer Peta</h2>
                <button
                    type='button'
                    onClick={() => setActivePanel(null)}
                    className='rounded-md p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)]'
                    aria-label='Tutup panel'
                >
                    <X className='h-4 w-4' />
                </button>
            </div>

            {/* Active layer summary */}
            <div
                className='shrink-0 border-b p-4 space-y-2'
                style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
            >
                <p className='text-[0.6rem] font-semibold uppercase tracking-widest text-[color:var(--color-muted)]'>
                    Layer Aktif
                </p>
                <h3 className='text-sm font-semibold text-[color:var(--color-text)]'>{schema.label}</h3>
                <div className='grid grid-cols-3 gap-1.5'>
                    {[
                        { label: 'Fitur', value: totalCount.toLocaleString('id-ID') },
                        { label: 'Tersaring', value: layerState?.filter ? filteredCount.toLocaleString('id-ID') : 'Semua' },
                        { label: 'Dipilih', value: selectionCount.toLocaleString('id-ID') },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className='rounded-lg border px-2 py-1.5 text-xs'
                            style={{
                                borderColor: 'var(--color-border, #e2e8f0)',
                                backgroundColor: 'var(--color-panel-muted)',
                                color: 'var(--color-text)',
                            }}
                        >
                            <p
                                className='text-[9px] uppercase tracking-wider'
                                style={{ color: 'var(--color-muted)' }}
                            >
                                {label}
                            </p>
                            <p className='mt-0.5 font-semibold'>{value}</p>
                        </div>
                    ))}
                </div>
                <span
                    className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium'
                    style={{ backgroundColor: 'var(--color-panel-muted)', color: badgeTextColor }}
                >
                    ID: <span className='font-semibold text-[color:var(--color-text)]'>{activeLayerId}</span>
                </span>
            </div>

            {/* Layer list */}
            <div className='flex-1 overflow-y-auto p-4'>
                <LayerToggles />
            </div>
        </div>
    );
};

export default LayerPanel;
