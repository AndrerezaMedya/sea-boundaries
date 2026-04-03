import type { CoreLayerId, FilterDefinition, LayerId, TableRow } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { clearPersistedLayerFilter, persistLayerFilter } from '@/store/layers/actions/filterPersistence';
import { applyFilterToLayer, clearFilterOnLayer } from '@/store/layers/actions/filtering';
import type { LayersDictionary } from '@/store/layers/runtimeTypes';
import { buildTableRows } from '@/store/layers/stateBuilders';

interface FilterLifecycleState {
	layers: LayersDictionary;
	activeLayerId: LayerId;
	tableRows: TableRow[];
}

interface FilterLifecycleResult {
	layers: LayersDictionary;
	tableRows: TableRow[];
}

interface ApplyFilterLifecycleArgs {
	state: FilterLifecycleState;
	layerId: LayerId;
	definition: FilterDefinition;
	coreLayerIds: CoreLayerId[];
}

interface ClearFilterLifecycleArgs {
	state: FilterLifecycleState;
	layerId: LayerId;
	coreLayerIds: CoreLayerId[];
}

export const applyFilterLifecycle = (args: ApplyFilterLifecycleArgs): FilterLifecycleResult | null => {
	const layer = args.state.layers[args.layerId];
	if (!layer) {
		return null;
	}
	const updatedLayer = applyFilterToLayer(args.layerId, layer, args.definition);
	const layers: LayersDictionary = {
		...args.state.layers,
		[args.layerId]: updatedLayer,
	};
	const tableRows =
		args.state.activeLayerId === args.layerId ? buildTableRows(args.layerId, updatedLayer) : args.state.tableRows;
	if (args.layerId !== USER_LAYER_ID) {
		persistLayerFilter(args.layerId as CoreLayerId, args.definition, args.coreLayerIds);
	}
	return {
		layers,
		tableRows,
	};
};

export const clearFilterLifecycle = (args: ClearFilterLifecycleArgs): FilterLifecycleResult | null => {
	const layer = args.state.layers[args.layerId];
	if (!layer) {
		return null;
	}
	const updatedLayer = clearFilterOnLayer(layer);
	const layers: LayersDictionary = {
		...args.state.layers,
		[args.layerId]: updatedLayer,
	};
	const tableRows =
		args.state.activeLayerId === args.layerId ? buildTableRows(args.layerId, updatedLayer) : args.state.tableRows;
	if (args.layerId !== USER_LAYER_ID) {
		clearPersistedLayerFilter(args.layerId as CoreLayerId, args.coreLayerIds);
	}
	return {
		layers,
		tableRows,
	};
};
