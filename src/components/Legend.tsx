import { STATUS_LAUT_DASH } from '@/lib/schema';

const dashClassName = (dash?: number[]) => {
	if (!dash || dash.length === 0) {
		return 'border-[color:var(--color-muted)]';
	}
	if (dash[0] === 2) {
		return 'border-dashed border-[color:var(--color-muted)]';
	}
	return 'border-dotted border-[color:var(--color-muted)]';
};

const ZONE_LAYER_COLORS = [
	{ label: 'Zona Laut Teritorial', color: '#2563eb' },
	{ label: 'Zona Ekonomi Eksklusif (ZEE)', color: '#16a34a' },
	{ label: 'Landas Kontinen', color: '#f59e0b' },
];

const Legend = () => {
	const statusEntries = Object.entries(STATUS_LAUT_DASH);

	return (
		<div className='space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel)] p-4 shadow-sm'>
			<div>
				<h3 className='text-sm font-semibold text-[color:var(--color-text)]'>Warna garis per layer zona</h3>
				<p className='text-xs text-[color:var(--color-muted)]'>Tiap layer zona punya warna tetap.</p>
				<ul className='mt-3 space-y-2'>
					{ZONE_LAYER_COLORS.map((item) => (
						<li key={item.label} className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
							<span className='h-3 w-3 rounded-full' style={{ backgroundColor: item.color }} />
							<span>{item.label}</span>
						</li>
					))}
				</ul>
			</div>
			<div>
				<h3 className='text-sm font-semibold text-[color:var(--color-text)]'>Pola garis berdasarkan StatusLaut</h3>
				<p className='text-xs text-[color:var(--color-muted)]'>Garis putus-putus menandakan status batas yang belum final.</p>
				<ul className='mt-3 space-y-2'>
					{statusEntries.map(([status, dash]) => (
						<li key={status} className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
							<span className={`inline-flex h-0 w-12 border-b-2 ${dashClassName(dash)}`} />
							<span>{status}</span>
						</li>
					))}
					<li className='flex items-center gap-3 text-sm text-[color:var(--color-text)]'>
						<span className='inline-flex h-0 w-12 border-b-2 border-[color:var(--color-muted)]' />
						<span>Lainnya (solid)</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Legend;
