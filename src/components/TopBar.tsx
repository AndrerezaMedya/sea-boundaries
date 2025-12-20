import { Menu, Table2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useReadableColor } from '@/hooks/useReadableColor';
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
	const badgeTextColor = useReadableColor('--color-accent-soft');
	const infoBadgeColor = useReadableColor('--color-panel-muted');

	const filteredCount = layerState?.filteredIds.length ?? 0;
	const totalCount = layerState?.data.features.length ?? 0;

	const handleOpenQuery = () => {
		setActiveTab('query');
		setSidebarOpen(true);
	};

	return (
		<header className='app-topbar relative flex items-center gap-3 border-b px-4 py-3'>
			<Button
				variant='ghost'
				size='icon'
				onClick={onOpenSidebar}
				className='md:hidden'
				aria-label='Buka panel samping'
			>
				<Menu className='h-5 w-5' />
			</Button>
			<div className='flex flex-1 flex-col gap-1'>
				<div className='flex flex-wrap items-center gap-2'>
					<h1 className='text-lg font-semibold tracking-tight text-[color:var(--color-text)]'>SEA-BANDL</h1>
					<span
						className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest'
						style={{
							backgroundColor: 'var(--color-accent-soft)',
							color: badgeTextColor,
						}}
					>
						{schema.label}
					</span>
				</div>
				<div className='flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]'>
					<span
						className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium'
						style={{
							backgroundColor: 'var(--color-panel-muted)',
							color: infoBadgeColor,
						}}
					>
						{filteredCount.toLocaleString('id-ID')} / {totalCount.toLocaleString('id-ID')} fitur
					</span>
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<Button
					variant='secondary'
					size='sm'
					onClick={handleOpenQuery}
					className='flex items-center gap-2'
					style={{
						backgroundColor: 'var(--color-panel)',
						color: 'var(--color-text)',
					}}
				>
					<Table2 className='h-4 w-4' />
					Buka Query Builder
				</Button>
			</div>
		</header>
	);
};

export default TopBar;
