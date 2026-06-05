import { X } from 'lucide-react';

import Legend from '@/components/Legend';
import { Button } from '@/components/ui/button';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useUIStore } from '@/store/useUI';

const LegendFloating = () => {
    const { t } = useWebGisT();
    const legendOpen = useUIStore((s) => s.legendOpen);
    const setLegendOpen = useUIStore((s) => s.setLegendOpen);

    if (!legendOpen) return null;

    return (
        <div className='pointer-events-none absolute inset-x-3 bottom-3 z-[35] md:inset-x-auto md:right-6 md:bottom-20 md:left-auto'>
            <div
                className='pointer-events-auto flex w-full max-h-[min(calc(100dvh-5rem),26rem)] flex-col overflow-hidden rounded-xl border p-3 shadow-lg panel-slide-up md:w-[340px] md:max-h-[min(calc(100dvh-7.5rem),32rem)]'
                style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
            >
                <div className='mb-2 flex shrink-0 items-start justify-between gap-2'>
                    <h3 className='text-sm font-semibold text-[color:var(--color-text)]'>{t('legend.title')}</h3>
                    <Button variant='ghost' size='icon' onClick={() => setLegendOpen(false)} className='h-8 w-8 text-[color:var(--color-muted)]'>
                        <X className='h-4 w-4' />
                    </Button>
                </div>
                <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-1'>
                    <Legend />
                </div>
            </div>
        </div>
    );
};

export default LegendFloating;
