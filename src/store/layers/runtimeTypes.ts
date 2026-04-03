import type {
	CoreLayerId,
	FeatureCollectionWithProps,
	FeatureWithProps,
	FilterDefinition,
	FilterExpression,
	GeometryType,
	LayerId,
	LayerSchema,
	MapRenderKind,
} from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

export type LayersDictionary = Record<CoreLayerId, LayerRuntimeState> &
	Partial<Record<typeof USER_LAYER_ID, LayerRuntimeState>>;

export type UserLayerSource = 'file' | 'url';

export type SetUserLayerArgs = {
	collection: FeatureCollectionWithProps;
	schema: LayerSchema;
	source?: UserLayerSource;
	name?: string;
	url?: string;
};

export interface LayerRuntimeState {
	id: LayerId;
	label: string;
	visible: boolean;
	data: FeatureCollectionWithProps;
	featureIndex: Record<string, FeatureWithProps>;
	filter: FilterDefinition | null;
	filterExpression: FilterExpression;
	filteredIds: string[];
	selectionIds: string[];
	hoveredId: string | null;
	geometryType: GeometryType;
	renderKind: MapRenderKind;
}

export interface UserLayerMeta {
	loaded: boolean;
	name?: string;
	source?: UserLayerSource;
	url?: string;
	featureCount?: number;
	geometryType?: GeometryType;
}
