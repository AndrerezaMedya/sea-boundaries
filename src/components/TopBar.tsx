import { Menu, Sparkles, Table2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getLayerSchema } from '@/lib/schema';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

type TopBarProps = {
	onOpenSidebar: () => void;
};

const TopBar = ({ onOpenSidebar }: TopBarProps) => {
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	const layerState = useLayersStore((state) => state.layers[activeLayerId]);
	const schema = getLayerSchema(activeLayerId);
	const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
	const setActiveTab = useUIStore((state) => state.setActiveTab);

	const filteredCount = layerState?.filteredIds.length ?? 0;
	const totalCount = layerState?.data.features.length ?? 0;

	const handleOpenQuery = () => {
		setActiveTab('query');
		setSidebarOpen(true);
	};

	return (
		<header className='relative flex items-center gap-4 border-b border-slate-900/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-white shadow-lg'>
			<Button
				variant='ghost'
				size='icon'
				onClick={onOpenSidebar}
				className='md:hidden text-white/80 hover:text-white'
				aria-label='Buka panel samping'
			>
				<Menu className='h-5 w-5' />
			</Button>
			<div className='flex flex-1 flex-col gap-1'>
				<div className='flex flex-wrap items-center gap-2'>
					<h1 className='text-lg font-semibold tracking-tight'>Indonesia Sea Boundaries Explorer</h1>
					<span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest text-white/80'>
						<Sparkles className='h-[0.9rem] w-[0.9rem]' />
						Beta
					</span>
				</div>
				<p className='text-xs text-white/70'>Eksplorasi layer batas laut Indonesia, bangun kueri MapLibre, dan analisis atribut secara interaktif.</p>
				<div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-white/70'>
					<span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-medium'>
						Layer aktif: <span className='font-semibold text-white'>{schema.label}</span>
					</span>
					<span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-medium'>
						{filteredCount.toLocaleString('id-ID')} / {totalCount.toLocaleString('id-ID')} fitur ditampilkan
					</span>
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<Button
					variant='secondary'
					size='sm'
					onClick={handleOpenQuery}
					className='flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100'
				>
					<Table2 className='h-4 w-4' />
					Buka Query Builder
				</Button>
			</div>
		</header>
	);
};

export default TopBar;
