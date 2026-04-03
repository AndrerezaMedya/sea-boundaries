import { setUserLayerSchema } from '@/lib/schema';
import type { LayerSchema } from '@/lib/types';
import { writeLastUserLayerUrl } from '@/store/layers/persistence';

export const applyUserLayerSchemaEffect = (schema: LayerSchema) => {
	setUserLayerSchema(schema);
};

export const clearUserLayerSchemaEffect = () => {
	setUserLayerSchema(undefined);
};

export const persistUserLayerUrlEffect = (url: string) => {
	writeLastUserLayerUrl(url);
};
