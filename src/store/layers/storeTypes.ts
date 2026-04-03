import type {
	FeatureWithProps,
	FilterDefinition,
	LayerId,
	TableRow,
	ZoomRequest,
} from '@/lib/types';
import type { LayersDictionary, SetUserLayerArgs, UserLayerMeta } from '@/store/layers/runtimeTypes';

export type UniqueValueCache = Record<LayerId, Record<string, (string | number)[]>>;

export interface LayersStoreState {
	layers: LayersDictionary;
	activeLayerId: LayerId;
	tableRows: TableRow[];
	pendingZoom: ZoomRequest | null;
	uniqueValueCache: UniqueValueCache;
	userLayerMeta: UserLayerMeta;
	lastUserLayerUrl: string;
	loadInitialFilters: () => void;
	setActiveLayer: (layerId: LayerId) => void;
	setLayerVisibility: (layerId: LayerId, visible: boolean) => void;
	applyFilter: (layerId: LayerId, definition: FilterDefinition) => void;
	clearFilter: (layerId: LayerId) => void;
	setSelection: (layerId: LayerId, ids: string[]) => void;
	setHoveredFeature: (layerId: LayerId, id: string | null) => void;
	setUserLayer: (args: SetUserLayerArgs) => void;
	removeUserLayer: () => void;
	setLastUserLayerUrl: (url: string) => void;
	requestZoomToIds: (layerId: LayerId, ids: string[], padding?: number) => void;
	requestZoomToBounds: (bounds: [number, number, number, number], padding?: number) => void;
	consumeZoomRequest: () => ZoomRequest | null;
	getFeatureById: (layerId: LayerId, id: string) => FeatureWithProps | undefined;
	getUniqueValues: (layerId: LayerId, field: string) => (string | number)[];
}
