import { X } from 'lucide-react';

import UserLayerPanel from '@/components/UserLayerPanel';
import { useUIStore } from '@/store/useUI';

const ImportPanel = () => {
    const activePanel = useUIStore((s) => s.activePanel);
    const setActivePanel = useUIStore((s) => s.setActivePanel);

    if (activePanel !== 'import') return null;

    return (
        <div
            className='absolute left-0 top-0 z-30 flex h-full w-[360px] flex-col border-r bg-[color:var(--color-panel)] shadow-xl'
            style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
        >
            <div
                className='flex shrink-0 items-center justify-between border-b px-4 py-3'
                style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
            >
                <h2 className='text-sm font-semibold text-[color:var(--color-text)]'>Import Layer</h2>
                <button
                    type='button'
                    onClick={() => setActivePanel(null)}
                    className='rounded-md p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)]'
                    aria-label='Tutup panel'
                >
                    <X className='h-4 w-4' />
                </button>
            </div>
            <div className='flex-1 overflow-y-auto p-4'>
                <UserLayerPanel />
            </div>
        </div>
    );
};

export default ImportPanel;
