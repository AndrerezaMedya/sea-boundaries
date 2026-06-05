import type { Bbox } from '@/lib/bbox';
import type {
	CoreLayerId,
	FeatureCollectionWithProps,
	FeatureWithProps,
	FilterDefinition,
	LayerId,
	TableRow,
	ZoomRequest,
} from '@/lib/types';
import type { LayersDictionary, SetUserLayerArgs, UserLayerMeta } from '@/store/layers/runtimeTypes';

export type UniqueValueCache = Record<LayerId, Record<string, (string | number)[]>>;

export type InitializationStatus = 'loading' | 'ready' | 'error';

export interface LayersStoreState {
	layers: LayersDictionary;
	activeLayerId: LayerId;
	tableRows: TableRow[];
	pendingZoom: ZoomRequest | null;
	uniqueValueCache: UniqueValueCache;
	userLayerMeta: UserLayerMeta;
	lastUserLayerUrl: string;
	initializationStatus: InitializationStatus;
	initializationError: string | null;
	/** True while viewport attribute fetch runs (MVT mode). */
	attributesLoading: boolean;
	/** Bumped after filter apply — Map refreshes attributes for these layers in viewport. */
	attributeRefreshTargets: CoreLayerId[] | null;
	requestAttributeRefresh: (layerIds: CoreLayerId[]) => void;
	clearAttributeRefreshTargets: () => void;
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
	setCoreLayerData: (layerId: CoreLayerId, collection: FeatureCollectionWithProps) => void;
	refreshActiveLayerAttributes: (layerId: LayerId, bbox?: Bbox) => Promise<void>;
}
