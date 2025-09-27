import { ZONA_COLOR_MAPPING, STATUS_LAUT_DASH } from '@/lib/schema';

const dashClassName = (dash?: number[]) => {
	if (!dash || dash.length === 0) {
		return 'border-slate-500';
	}
	if (dash[0] === 2) {
		return 'border-dashed border-slate-500';
	}
	return 'border-dotted border-slate-500';
};

const Legend = () => {
	const zonaEntries = Object.entries(ZONA_COLOR_MAPPING).filter(([key]) => key !== 'default');
	const statusEntries = Object.entries(STATUS_LAUT_DASH);

	return (
		<div className='space-y-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm'>
			<div>
				<h3 className='text-sm font-semibold text-slate-800'>Warna garis berdasarkan TipeZona</h3>
				<p className='text-xs text-slate-500'>Warna menandai kategori hukum batas maritim.</p>
				<ul className='mt-3 space-y-2'>
					{zonaEntries.map(([zona, color]) => (
						<li key={zona} className='flex items-center gap-3 text-sm text-slate-700'>
							<span className='h-3 w-3 rounded-full' style={{ backgroundColor: color }} />
							<span>{zona}</span>
						</li>
					))}
				</ul>
			</div>
			<div>
				<h3 className='text-sm font-semibold text-slate-800'>Pola garis berdasarkan StatusLaut</h3>
				<p className='text-xs text-slate-500'>Garis putus-putus menandakan status batas yang belum final.</p>
				<ul className='mt-3 space-y-2'>
					{statusEntries.map(([status, dash]) => (
						<li key={status} className='flex items-center gap-3 text-sm text-slate-700'>
							<span className={`inline-flex h-0 w-12 border-b-2 ${dashClassName(dash)}`} />
							<span>{status}</span>
						</li>
					))}
					<li className='flex items-center gap-3 text-sm text-slate-700'>
						<span className='inline-flex h-0 w-12 border-b-2 border-slate-500' />
						<span>Lainnya (solid)</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Legend;
