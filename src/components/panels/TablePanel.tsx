import { ChevronDown } from 'lucide-react';

import AttributeTable from '@/components/AttributeTable';
import { useUIStore } from '@/store/useUI';

const TablePanel = () => {
	const tableOpen = useUIStore((s) => s.tableOpen);
	const setTableOpen = useUIStore((s) => s.setTableOpen);

	if (!tableOpen) return null;

	return (
		<div
			className='absolute bottom-0 left-0 right-0 z-30 flex flex-col border-t bg-[color:var(--color-panel)] shadow-2xl panel-slide-up'
			style={{ height: '62%', borderColor: 'var(--color-border, #e2e8f0)' }}
		>
			<div
				className='flex shrink-0 items-center justify-between border-b px-4 py-2'
				style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
			>
				<h2 className='text-sm font-semibold text-[color:var(--color-text)]'>Tabel Atribut</h2>
				<button
					type='button'
					onClick={() => setTableOpen(false)}
					className='flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)]'
					aria-label='Tutup tabel'
				>
					<ChevronDown className='h-4 w-4' />
					<span>Tutup</span>
				</button>
			</div>
			<div className='flex min-h-0 flex-1 flex-col'>
				<AttributeTable />
			</div>
		</div>
	);
};

export default TablePanel;
