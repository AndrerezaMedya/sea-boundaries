import { useState } from 'react';
import { Info, X } from 'lucide-react';

import Legend from '@/components/Legend';
import { Button } from '@/components/ui/button';

const LegendFloating = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className='pointer-events-none absolute right-4 top-28 z-40 flex flex-col items-end gap-2 sm:right-6 sm:top-28'>
            <Button
                onClick={() => setOpen((prev) => !prev)}
                variant='secondary'
                size='sm'
                className='pointer-events-auto shadow-sm'
            >
                <Info className='mr-2 h-4 w-4' />
                Legenda
            </Button>
            {open ? (
                <div className='pointer-events-auto w-[300px] max-w-[80vw] rounded-xl border border-slate-200/80 bg-white p-3 shadow-lg sm:w-[340px]'>
                    <div className='mb-2 flex items-start justify-between gap-2'>
                        <h3 className='text-sm font-semibold text-slate-900'>Legenda</h3>
                        <Button variant='ghost' size='icon' onClick={() => setOpen(false)} className='h-8 w-8 text-slate-500'>
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                    <Legend />
                </div>
            ) : null}
        </div>
    );
};

export default LegendFloating;
