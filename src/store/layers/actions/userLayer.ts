import type { LayerId, TableRow, ZoomRequest } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { USER_LAYER_FIT_PADDING } from '@/store/layers/config';
import { buildTableRows } from '@/store/layers/stateBuilders';
import type {
	LayerRuntimeState,
	LayersDictionary,
	UserLayerMeta,
	UserLayerSource,
} from '@/store/layers/runtimeTypes';

interface BuildSetUserLayerStateArgs {
	layers: LayersDictionary;
	uniqueValueCache: Record<LayerId, Record<string, (string | number)[]>>;
	layerState: LayerRuntimeState;
	source?: UserLayerSource;
	name?: string;
	url?: string;
	bounds: [number, number, number, number] | null;
}

interface BuildRemoveUserLayerStateArgs {
	layers: LayersDictionary;
	uniqueValueCache: Record<LayerId, Record<string, (string | number)[]>>;
	activeLayerId: LayerId;
	placeholder: LayerRuntimeState;
	defaultActiveLayer: LayerId;
}

export const createUserLayerMeta = (
	layerState: LayerRuntimeState,
	params: { source?: UserLayerSource; name?: string; url?: string },
): UserLayerMeta => {
	return {
		loaded: true,
		name: params.name,
		source: params.source,
		url: params.url,
		featureCount: layerState.filteredIds.length,
		geometryType: layerState.geometryType,
	};
};

export const buildSetUserLayerState = (args: BuildSetUserLayerStateArgs) => {
	const nextLayers: LayersDictionary = {
		...args.layers,
		[USER_LAYER_ID]: args.layerState,
	};
	const nextCache = {
		...args.uniqueValueCache,
		[USER_LAYER_ID]: {},
	};
	const updates: {
		layers: LayersDictionary;
		activeLayerId: typeof USER_LAYER_ID;
		tableRows: TableRow[];
		uniqueValueCache: Record<LayerId, Record<string, (string | number)[]>>;
		userLayerMeta: UserLayerMeta;
		pendingZoom?: ZoomRequest;
	} = {
		layers: nextLayers,
		activeLayerId: USER_LAYER_ID,
		tableRows: buildTableRows(USER_LAYER_ID, args.layerState),
		uniqueValueCache: nextCache,
		userLayerMeta: createUserLayerMeta(args.layerState, {
			name: args.name,
			source: args.source,
			url: args.url,
		}),
	};
	if (args.bounds) {
		updates.pendingZoom = {
			layerId: USER_LAYER_ID,
			bounds: args.bounds,
			padding: USER_LAYER_FIT_PADDING,
			timestamp: Date.now(),
		};
	}
	return updates;
};

export const buildRemoveUserLayerState = (args: BuildRemoveUserLayerStateArgs) => {
	const nextLayers: LayersDictionary = {
		...args.layers,
		[USER_LAYER_ID]: args.placeholder,
	};
	const nextActive = args.activeLayerId === USER_LAYER_ID ? args.defaultActiveLayer : args.activeLayerId;
	const activeLayer = nextLayers[nextActive]!;
	return {
		layers: nextLayers,
		activeLayerId: nextActive,
		tableRows: buildTableRows(nextActive, activeLayer),
		uniqueValueCache: {
			...args.uniqueValueCache,
			[USER_LAYER_ID]: {},
		},
		userLayerMeta: { loaded: false } as UserLayerMeta,
	};
};
