import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FilterDefinition, LayerId, PresetDefinition } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

const STORAGE_KEY = 'sea-boundaries:ui';

type SidebarTab = 'query' | 'table' | 'legend';

const emptyDefinition = (): FilterDefinition => ({
	conditions: [],
	join: 'all',
	groups: [],
});

const createEmptyBuilderState = (): Record<LayerId, FilterDefinition> => ({
	basepoints: emptyDefinition(),
	baseline: emptyDefinition(),
	titik_perjanjian: emptyDefinition(),
	batas_maritim: emptyDefinition(),
	[USER_LAYER_ID]: emptyDefinition(),
});

const cloneConditionValue = (value: FilterDefinition['conditions'][number]['value']): typeof value => {
	if (Array.isArray(value)) {
		if (value.every((item) => typeof item === 'number')) {
			return [...value] as number[];
		}
		return value.map((item) => String(item)) as string[];
	}
	return value;
};

const cloneDefinition = (definition: FilterDefinition): FilterDefinition => ({
	join: definition.join,
	groups: definition.groups.map((group) => ({ ...group })),
	conditions: definition.conditions.map((condition) => ({
		...condition,
		value: cloneConditionValue(condition.value),
	})),
});

const makeId = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_PRESETS: PresetDefinition[] = [
	{
		id: 'preset-batas-australia',
		name: 'Batas_Ngr = "Australia"',
		layerId: 'batas_maritim',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: {
			join: 'all',
			groups: [],
			conditions: [
				{
					id: 'cond-batas-aus',
					field: 'Batas_Ngr',
					operator: '=',
					value: 'Australia',
					type: 'string',
				},
			],
		},
	},
	{
		id: 'preset-tipezona-status',
		name: 'TipeZona & StatusLaut',
		layerId: 'batas_maritim',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: {
			join: 'all',
			groups: [],
			conditions: [
				{
					id: 'cond-tipezona',
					field: 'TipeZona',
					operator: '=',
					value: 'Batas Landas Kontinen',
					type: 'string',
				},
				{
					id: 'cond-statuslaut',
					field: 'StatusLaut',
					operator: '=',
					value: 'Perlu Kesepakatan',
					type: 'string',
				},
			],
		},
	},
	{
		id: 'preset-ratif-before-2000',
		name: 'Ratif_Thn < 2000',
		layerId: 'batas_maritim',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: {
			join: 'all',
			groups: [],
			conditions: [
				{
					id: 'cond-ratif',
					field: 'Ratif_Thn',
					operator: '<',
					value: 2000,
					type: 'number',
				},
			],
		},
	},
];

interface UIStoreState {
	sidebarOpen: boolean;
	activeTab: SidebarTab;
	builderState: Record<LayerId, FilterDefinition>;
	presets: PresetDefinition[];
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	setActiveTab: (tab: SidebarTab) => void;
	setBuilderState: (layerId: LayerId, definition: FilterDefinition) => void;
	updateBuilderState: (layerId: LayerId, updater: (previous: FilterDefinition) => FilterDefinition) => void;
	resetBuilderState: (layerId: LayerId) => void;
	createPreset: (name: string, layerId: LayerId, definition: FilterDefinition) => PresetDefinition;
	deletePreset: (presetId: string) => void;
	renamePreset: (presetId: string, name: string) => void;
	restoreDefaultPresets: () => void;
}

export const useUIStore = create(
	persist<UIStoreState>(
		(set) => ({
			sidebarOpen: false,
			activeTab: 'query',
			builderState: createEmptyBuilderState(),
			presets: DEFAULT_PRESETS.map((preset) => ({
				...preset,
				definition: cloneDefinition(preset.definition),
			})),
			setSidebarOpen: (open) => set({ sidebarOpen: open }),
			toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
			setActiveTab: (tab) => set({ activeTab: tab }),
			setBuilderState: (layerId, definition) => {
				set((state) => ({
					builderState: {
						...state.builderState,
						[layerId]: cloneDefinition(definition),
					},
				}));
			},
			updateBuilderState: (layerId, updater) => {
				set((state) => ({
					builderState: {
						...state.builderState,
						[layerId]: cloneDefinition(updater(state.builderState[layerId] ?? emptyDefinition())),
					},
				}));
			},
			resetBuilderState: (layerId) => {
				set((state) => ({
					builderState: {
						...state.builderState,
						[layerId]: emptyDefinition(),
					},
				}));
			},
			createPreset: (name, layerId, definition) => {
				const preset: PresetDefinition = {
					id: `preset-${makeId()}`,
					name,
					layerId,
					definition: cloneDefinition(definition),
					createdAt: new Date().toISOString(),
				};
				set((state) => ({ presets: [...state.presets, preset] }));
				return preset;
			},
			deletePreset: (presetId) => {
				set((state) => ({ presets: state.presets.filter((preset) => preset.id !== presetId) }));
			},
			renamePreset: (presetId, name) => {
				set((state) => ({
					presets: state.presets.map((preset) =>
						preset.id === presetId
							? {
								...preset,
								name,
							}
							: preset,
					),
				}));
			},
			restoreDefaultPresets: () => {
				set({
					presets: DEFAULT_PRESETS.map((preset) => ({
						...preset,
						definition: cloneDefinition(preset.definition),
					})),
				});
			},
		}),
		{
			name: STORAGE_KEY,
			version: 1,
			onRehydrateStorage: () => (state) => {
				if (!state) {
					return;
				}
				const builder = state.builderState ?? createEmptyBuilderState();
				state.builderState = {
					...createEmptyBuilderState(),
					...builder,
				};
				if (!state.presets || state.presets.length === 0) {
					state.presets = DEFAULT_PRESETS.map((preset) => ({
						...preset,
						definition: cloneDefinition(preset.definition),
					}));
				} else {
					state.presets = state.presets.map((preset) => ({
						...preset,
						definition: cloneDefinition(preset.definition),
					}));
				}
			},
		},
	),
);
