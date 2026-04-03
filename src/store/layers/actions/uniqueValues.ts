import { getFieldSchema } from '@/lib/schema';
import type { LayerId } from '@/lib/types';
import type { LayerRuntimeState } from '@/store/layers/runtimeTypes';

interface CollectUniqueValuesArgs {
	layerId: LayerId;
	layer: LayerRuntimeState;
	field: string;
	limit: number;
}

export const collectUniqueValues = ({ layerId, layer, field, limit }: CollectUniqueValuesArgs): (string | number)[] => {
	const schemaField = getFieldSchema(layerId, field);
	if (!schemaField) {
		return [];
	}

	const seen = new Set<string>();
	const values: (string | number)[] = [];
	for (const feature of layer.data.features) {
		const value = feature.properties?.[field];
		if (value === undefined || value === null) {
			continue;
		}
		const key = typeof value === 'number' ? value.toString() : String(value);
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		if (schemaField.type === 'number') {
			const numeric = typeof value === 'number' ? value : Number(value);
			if (!Number.isNaN(numeric)) {
				values.push(numeric);
			}
		} else {
			values.push(String(value));
		}
		if (values.length >= limit) {
			break;
		}
	}
	return values;
};
