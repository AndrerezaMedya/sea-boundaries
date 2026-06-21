import { X } from 'lucide-react';

import GeoprocessingPanel from '@/components/GeoprocessingPanel';
import { useWebGisT } from '@/i18n/useWebGisT';
import { mapToolPanelClassName } from '@/lib/mapPanelLayout';
import { useUIStore } from '@/store/useUI';

const GeoPanel = () => {
    const { t } = useWebGisT();
    const activePanel = useUIStore((s) => s.activePanel);
    const setActivePanel = useUIStore((s) => s.setActivePanel);

    if (activePanel !== 'geoprocessing') return null;

    return (
        <div className={mapToolPanelClassName()}>
            <div className='flex shrink-0 items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3'>
                <h2 className='text-sm font-semibold text-[color:var(--color-text)]'>{t('geo.title')}</h2>
                <button
                    type='button'
                    onClick={() => setActivePanel(null)}
                    className='rounded-md p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)]'
                    aria-label={t('common.closePanel')}
                >
                    <X className='h-4 w-4' />
                </button>
            </div>
            <div className='flex-1 overflow-y-auto p-4 pb-16 md:pb-4'>
                <GeoprocessingPanel />
            </div>
        </div>
    );
};

export default GeoPanel;
