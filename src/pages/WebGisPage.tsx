import { useEffect } from 'react';

import MapView from '@/components/Map';
import LegendFloating from '@/components/LegendFloating';
import Ribbon from '@/components/Ribbon';
import FilterPanel from '@/components/panels/FilterPanel';
import GeoPanel from '@/components/panels/GeoPanel';
import ImportPanel from '@/components/panels/ImportPanel';
import LayerPanel from '@/components/panels/LayerPanel';
import TablePanel from '@/components/panels/TablePanel';
import { useLayersStore } from '@/store/useLayers';

const WebGisPage = () => {
	const loadInitialFilters = useLayersStore((state) => state.loadInitialFilters);

	useEffect(() => {
		loadInitialFilters();
	}, [loadInitialFilters]);

	return (
		<div className='app-theme flex h-screen flex-col overflow-hidden'>
			<Ribbon />
			<div className='relative flex-1 overflow-hidden'>
				<MapView />
				<LayerPanel />
				<FilterPanel />
				<GeoPanel />
				<ImportPanel />
				<TablePanel />
				<LegendFloating />
			</div>
		</div>
	);
};

export default WebGisPage;
