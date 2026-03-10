import { X } from 'lucide-react';

import Legend from '@/components/Legend';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/useUI';

const LegendFloating = () => {
    const legendOpen = useUIStore((s) => s.legendOpen);
    const setLegendOpen = useUIStore((s) => s.setLegendOpen);

    if (!legendOpen) return null;

    return (
        <div className='pointer-events-none absolute right-4 bottom-20 z-40 sm:right-6'>
            <div
                className='pointer-events-auto w-[300px] max-w-[80vw] rounded-xl border p-3 shadow-lg sm:w-[340px] panel-slide-up'
                style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}
            >
                <div className='mb-2 flex items-start justify-between gap-2'>
                    <h3 className='text-sm font-semibold text-[color:var(--color-text)]'>Legenda</h3>
                    <Button variant='ghost' size='icon' onClick={() => setLegendOpen(false)} className='h-8 w-8 text-[color:var(--color-muted)]'>
                        <X className='h-4 w-4' />
                    </Button>
                </div>
                <Legend />
            </div>
        </div>
    );
};

export default LegendFloating;
