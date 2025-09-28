import { useEffect } from 'react';

import MapView from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

const App = () => {
	const sidebarOpen = useUIStore((state) => state.sidebarOpen);
	const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
	const loadInitialFilters = useLayersStore((state) => state.loadInitialFilters);

	useEffect(() => {
		loadInitialFilters();
	}, [loadInitialFilters]);

	return (
		<div className='app-theme flex h-screen flex-col overflow-hidden'>
			<TopBar onOpenSidebar={() => setSidebarOpen(true)} />
			<div className='flex flex-1 overflow-hidden'>
				<Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
				<main className='relative flex-1 overflow-hidden'>
					<MapView />
				</main>
			</div>
		</div>
	);
};

export default App;
