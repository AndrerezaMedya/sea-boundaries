import type { LayerId } from '@/lib/types';
import { collectUniqueValues } from '@/store/layers/actions/uniqueValues';
import type { LayersDictionary } from '@/store/layers/runtimeTypes';
import type { UniqueValueCache } from '@/store/layers/storeTypes';

interface UniqueValueLifecycleArgs {
	layers: LayersDictionary;
	uniqueValueCache: UniqueValueCache;
	layerId: LayerId;
	field: string;
	limit: number;
}

interface UniqueValueLifecycleResult {
	values: (string | number)[];
	nextUniqueValueCache: UniqueValueCache | null;
}

export const resolveUniqueValues = (args: UniqueValueLifecycleArgs): UniqueValueLifecycleResult => {
	const cache = args.uniqueValueCache[args.layerId] ?? {};
	const cached = cache[args.field];
	if (cached) {
		return {
			values: cached,
			nextUniqueValueCache: null,
		};
	}

	const layer = args.layers[args.layerId];
	if (!layer) {
		return {
			values: [],
			nextUniqueValueCache: null,
		};
	}

	const values = collectUniqueValues({
		layerId: args.layerId,
		layer,
		field: args.field,
		limit: args.limit,
	});

	return {
		values,
		nextUniqueValueCache: {
			...args.uniqueValueCache,
			[args.layerId]: {
				...args.uniqueValueCache[args.layerId],
				[args.field]: values,
			},
		},
	};
};
