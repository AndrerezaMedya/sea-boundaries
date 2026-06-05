import { useEffect, useState } from 'react';

import MapView from '@/components/Map';
import LegendFloating from '@/components/LegendFloating';
import Ribbon from '@/components/Ribbon';
import FilterPanel from '@/components/panels/FilterPanel';
import GeoPanel from '@/components/panels/GeoPanel';
import LayerPanel from '@/components/panels/LayerPanel';
import BasemapPanel from '@/components/panels/BasemapPanel';
import MapPanelBackdrop from '@/components/map/MapPanelBackdrop';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useUIStore } from '@/store/useUI';
import { useLayersStore, initializeLayersStore } from '@/store/useLayersStore';

const WebGisPage = () => {
    const { t } = useWebGisT();
    const initializationStatus = useLayersStore((state) => state.initializationStatus);
    const initializationError = useLayersStore((state) => state.initializationError);
    const loadInitialFilters = useLayersStore((state) => state.loadInitialFilters);
    const activePanel = useUIStore((s) => s.activePanel);
    const setActivePanel = useUIStore((s) => s.setActivePanel);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                await initializeLayersStore();
                if (mounted) {
                    setInitialized(true);
                    loadInitialFilters();
                }
            } catch (err) {
                console.error('Initialization failed:', err);
            }
        };
        init();
        return () => {
            mounted = false;
        };
    }, [loadInitialFilters]);

    if (initializationStatus === 'loading' && !initialized) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-sm font-medium text-slate-600'>
                {t('page.loadingMap')}
            </div>
        );
    }

    if (initializationStatus === 'error') {
        return (
            <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-sm font-medium text-red-600'>
                <div>
                    <p className='mb-2'>Gagal memuat data peta.</p>
                    <p className='text-xs text-slate-500'>{initializationError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                    >
                        {t('page.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='app-theme flex h-screen flex-col overflow-hidden'>
            <Ribbon />
            <div className='relative flex-1 overflow-hidden'>
                <MapView />
                {activePanel && <MapPanelBackdrop onClose={() => setActivePanel(null)} />}
                <LayerPanel />
                <FilterPanel />
                <GeoPanel />
                <BasemapPanel />
                <LegendFloating />
            </div>
        </div>
    );
};

export default WebGisPage;
