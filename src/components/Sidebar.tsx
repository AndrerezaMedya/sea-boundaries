import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AttributeTable from '@/components/AttributeTable';
import GeoprocessingPanel from '@/components/GeoprocessingPanel';
import LayerToggles from '@/components/LayerToggles';
import QueryBuilder from '@/components/QueryBuilder';
import { useReadableColor } from '@/hooks/useReadableColor';
import { getLayerSchema } from '@/lib/schema';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

interface SidebarSectionProps {
	heading: string;
	subtitle?: string;
	children: ReactNode;
}

const SidebarSection = ({ heading, subtitle, children }: SidebarSectionProps) => (
	<section className='rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm'>
		<div className='space-y-2'>
			<div className='space-y-0.5'>
				<h3 className='text-sm font-semibold leading-tight text-slate-900'>{heading}</h3>
				{subtitle ? <p className='text-xs text-slate-600'>{subtitle}</p> : null}
			</div>
			<div>{children}</div>
		</div>
	</section>
);

const ActiveLayerSummary = () => {
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	const layerState = useLayersStore((state) => state.layers[activeLayerId]);
	const schema = getLayerSchema(activeLayerId);
	const totalFeatures = layerState?.data.features.length ?? 0;
	const filteredCount = layerState?.filteredIds.length ?? 0;
	const selectionCount = layerState?.selectionIds.length ?? 0;
	const badgeTextColor = useReadableColor('--color-panel-muted');
	const statTextColor = useReadableColor('--color-panel');
	const statLabelColor = useReadableColor('--color-panel', '--color-muted');

	const stats: Array<{ label: string; value: string }> = [
		{
			label: 'Fitur',
			value: totalFeatures.toLocaleString('id-ID'),
		},
		{
			label: 'Tersaring',
			value: layerState?.filter ? filteredCount.toLocaleString('id-ID') : 'Semua',
		},
		{
			label: 'Dipilih',
			value: selectionCount > 0 ? selectionCount.toLocaleString('id-ID') : '0',
		},
	];

	return (
		<div className='space-y-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm'>
			<div className='space-y-1'>
				<p className='text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500'>Layer aktif</p>
				<h2 className='text-base font-semibold text-slate-900'>{schema.label}</h2>
				<p className='text-xs text-slate-600'>Menampilkan {filteredCount.toLocaleString('id-ID')} / {totalFeatures.toLocaleString('id-ID')}</p>
			</div>
			<div className='grid gap-2 sm:grid-cols-3'>
				{stats.map((stat) => (
					<div
						key={stat.label}
						className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium shadow-inner'
						style={{
							backgroundColor: 'var(--color-panel)',
							color: statTextColor,
						}}
					>
						<p
							className='uppercase tracking-[0.16em]'
							style={{
								color: statLabelColor,
							}}
						>
							{stat.label}
						</p>
						<p className='mt-1 text-sm font-semibold text-[color:var(--color-text)]'>{stat.value}</p>
					</div>
				))}
			</div>
			{activeLayerId && (
				<div
					className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium'
					style={{
						backgroundColor: 'var(--color-panel-muted)',
						color: badgeTextColor,
					}}
				>
					ID: <span className='font-semibold text-[color:var(--color-text)]'>{activeLayerId}</span>
				</div>
			)}
		</div>
	);
};

const SidebarContent = () => {
	const activeTab = useUIStore((state) => state.activeTab);
	const setActiveTab = useUIStore((state) => state.setActiveTab);

	return (
		<div className='flex h-full flex-col gap-5 text-slate-900'>
			<ActiveLayerSummary />
			<SidebarSection heading='Layer peta'>
				<LayerToggles compact />
			</SidebarSection>
			<SidebarSection heading='Analisis' subtitle='Filter, tabel, geoprocessing'>
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className='flex flex-col gap-3'>
					<TabsList className='grid grid-cols-3 rounded-lg bg-slate-100 p-1 text-[11px] font-semibold text-slate-500'>
						<TabsTrigger value='query' className='rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900'>
							Query
						</TabsTrigger>
						<TabsTrigger value='table' className='rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900'>
							Tabel
						</TabsTrigger>
						<TabsTrigger value='geoprocessing' className='rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900'>
							Geo
						</TabsTrigger>
					</TabsList>
					<TabsContent value='query' className='mt-1'>
						<QueryBuilder />
					</TabsContent>
					<TabsContent value='table' className='mt-1'>
						<AttributeTable />
					</TabsContent>
					<TabsContent value='geoprocessing' className='mt-1'>
						<GeoprocessingPanel />
					</TabsContent>
				</Tabs>
			</SidebarSection>
		</div>
	);
};

const Sidebar = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
	return (
		<>
			<aside className='hidden h-full w-[360px] shrink-0 border-r border-slate-200 bg-slate-100/60 md:flex'>
				<div className='flex h-full w-full flex-col'>
					<div className='flex-1 overflow-y-auto px-5 py-6'>
						<SidebarContent />
					</div>
				</div>
			</aside>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className='left-0 right-auto flex h-full max-w-md flex-col border-r border-slate-200 bg-slate-100/90 p-0 sm:max-w-lg'>
					<div className='flex-1 overflow-y-auto px-5 py-6'>
						<SidebarContent />
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default Sidebar;
