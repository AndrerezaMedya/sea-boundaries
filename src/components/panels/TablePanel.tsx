import { useCallback, useRef, useState } from 'react';
import { ChevronDown, GripHorizontal } from 'lucide-react';

import AttributeTable from '@/components/AttributeTable';
import { useUIStore } from '@/store/useUI';

const MIN_HEIGHT_PX = 160;
const MAX_HEIGHT_RATIO = 0.88;
const DEFAULT_HEIGHT_RATIO = 0.62;

const TablePanel = () => {
	const tableOpen = useUIStore((s) => s.tableOpen);
	const setTableOpen = useUIStore((s) => s.setTableOpen);
	const [heightPx, setHeightPx] = useState<number | null>(null);
	const dragging = useRef(false);

	const resolvedHeight = heightPx !== null
		? heightPx
		: Math.round(window.innerHeight * DEFAULT_HEIGHT_RATIO);

	const onDragStart = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		dragging.current = true;
		document.body.style.cursor = 'ns-resize';
		document.body.style.userSelect = 'none';

		const onMove = (ev: MouseEvent) => {
			if (!dragging.current) return;
			const newHeight = Math.max(
				MIN_HEIGHT_PX,
				Math.min(window.innerHeight * MAX_HEIGHT_RATIO, window.innerHeight - ev.clientY),
			);
			setHeightPx(newHeight);
		};
		const onUp = () => {
			dragging.current = false;
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	}, []);

	if (!tableOpen) return null;

	return (
		<div
			className='absolute bottom-0 left-0 right-0 z-30 flex flex-col border-t bg-[color:var(--color-panel)] shadow-2xl panel-slide-up'
			style={{ height: resolvedHeight, borderColor: 'var(--color-border, #e2e8f0)' }}
		>
			{/* Resize handle */}
			<div
				onMouseDown={onDragStart}
				className='group flex h-3 w-full shrink-0 cursor-ns-resize items-center justify-center hover:bg-[color:var(--color-panel-muted)] active:bg-[color:var(--color-panel-muted)]'
				aria-label='Resize tabel'
			>
				<GripHorizontal className='h-3.5 w-3.5 text-[color:var(--color-border)] group-hover:text-[color:var(--color-muted)] transition-colors' />
			</div>

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
