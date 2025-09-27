import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AttributeTable from '@/components/AttributeTable';
import LayerToggles from '@/components/LayerToggles';
import Legend from '@/components/Legend';
import QueryBuilder from '@/components/QueryBuilder';
import UserLayerPanel from '@/components/UserLayerPanel';
import { getLayerSchema } from '@/lib/schema';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

interface SidebarSectionProps {
	kicker: string;
	heading: string;
	description?: string;
	children: ReactNode;
}

const SidebarSection = ({ kicker, heading, description, children }: SidebarSectionProps) => (
	<section className='rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm'>
		<div className='space-y-3'>
			<div className='space-y-1.5'>
				<p className='text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400'>{kicker}</p>
				<h3 className='text-base font-semibold leading-tight text-slate-900'>{heading}</h3>
				{description ? <p className='text-sm leading-relaxed text-slate-600'>{description}</p> : null}
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

	const stats: Array<{ label: string; value: string }> = [
		{
			label: 'Total fitur',
			value: totalFeatures.toLocaleString('id-ID'),
		},
		{
			label: 'Hasil filter',
			value: layerState?.filter ? filteredCount.toLocaleString('id-ID') : 'Semua',
		},
		{
			label: 'Terpilih',
			value: selectionCount > 0 ? selectionCount.toLocaleString('id-ID') : '0',
		},
	];

	return (
		<div className='space-y-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm'>
			<div className='space-y-1.5'>
				<p className='text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400'>Layer aktif</p>
				<h2 className='text-lg font-semibold text-slate-900'>{schema.label}</h2>
				<p className='text-sm text-slate-600'>Menampilkan {filteredCount.toLocaleString('id-ID')} dari {totalFeatures.toLocaleString('id-ID')} fitur.</p>
			</div>
			<div className='grid gap-2 sm:grid-cols-3'>
				{stats.map((stat) => (
					<div key={stat.label} className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-inner'>
						<p className='uppercase tracking-[0.16em] text-slate-400'>{stat.label}</p>
						<p className='mt-1 text-sm font-semibold text-slate-900'>{stat.value}</p>
					</div>
				))}
			</div>
		</div>
	);
};

const SidebarContent = () => {
	const activeTab = useUIStore((state) => state.activeTab);
	const setActiveTab = useUIStore((state) => state.setActiveTab);

	return (
		<div className='flex h-full flex-col gap-6 text-slate-900'>
			<ActiveLayerSummary />
			<SidebarSection
				kicker='Data pengguna'
				heading='Muat GeoJSON Anda'
				description='Seret berkas, pilih file, atau masukkan URL untuk menambahkan layer kustom ke peta.'
			>
				<UserLayerPanel />
			</SidebarSection>
			<SidebarSection
				kicker='Layer'
				heading='Kontrol visibilitas'
				description='Aktifkan atau jadikan layer sebagai fokus untuk Query Builder dan tabel atribut.'
			>
				<LayerToggles />
			</SidebarSection>
			<SidebarSection
				kicker='Analisis'
				heading='Filter & presisi data'
				description='Bangun kueri ala QGIS, tinjau hasilnya, dan simpan preset untuk digunakan ulang.'
			>
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className='flex flex-col gap-4'>
					<TabsList className='grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-500'>
						<TabsTrigger value='query' className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'>
							Query
						</TabsTrigger>
						<TabsTrigger value='table' className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'>
							Tabel
						</TabsTrigger>
						<TabsTrigger value='legend' className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'>
							Legenda
						</TabsTrigger>
					</TabsList>
					<TabsContent value='query' className='mt-2'>
						<QueryBuilder />
					</TabsContent>
					<TabsContent value='table' className='mt-2'>
						<AttributeTable />
					</TabsContent>
					<TabsContent value='legend' className='mt-2'>
						<Legend />
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
