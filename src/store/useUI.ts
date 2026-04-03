import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FilterDefinition, LayerId, PresetDefinition } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';

// ── Simple Filter (friendly, cross-layer) ───────────────────────────────────
export interface SimpleFilterState {
	tipeBatas: string[];         // layer-group keys
	statusKesepakatan: string[]; // StatusLaut values
	batasNegara: string[];       // Batas_Ngr values
	statusLaut: string[];        // Jenis field values (Unilateral/Bilateral/Trilateral)
	tahunPerjanjianMin: string;
	tahunPerjanjianMax: string;
	tahunRatifikasiMin: string;
	tahunRatifikasiMax: string;
	perairan: string[];          // Perairan values (basepoints/baseline only)
}

const defaultSimpleFilter = (): SimpleFilterState => ({
	tipeBatas: [],
	statusKesepakatan: [],
	batasNegara: [],
	statusLaut: [],
	tahunPerjanjianMin: '',
	tahunPerjanjianMax: '',
	tahunRatifikasiMin: '',
	tahunRatifikasiMax: '',
	perairan: [],
});

const STORAGE_KEY = 'sea-boundaries:ui';

type SidebarTab = 'query' | 'table' | 'legend' | 'geoprocessing';

const emptyDefinition = (): FilterDefinition => ({
	conditions: [],
	join: 'all',
});

const createEmptyBuilderState = (): Record<LayerId, FilterDefinition> => ({
	basepoints: emptyDefinition(),
	baseline: emptyDefinition(),
	laut_teritorial_sepakat: emptyDefinition(),
	laut_teritorial_perlu: emptyDefinition(),
	zee_sepakat: emptyDefinition(),
	zee_sepakat_ratif: emptyDefinition(),
	zee_perlu: emptyDefinition(),
	landas_kontinen_sepakat: emptyDefinition(),
	landas_kontinen_sepakat_ratif: emptyDefinition(),
	landas_kontinen_perlu: emptyDefinition(),
	landas_kontinen_ekstensi: emptyDefinition(),
	zona_tambahan: emptyDefinition(),
	titik_perjanjian_lt: emptyDefinition(),
	titik_perjanjian_lk: emptyDefinition(),
	titik_perjanjian_zee: emptyDefinition(),
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
	join: definition.join ?? 'all',
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
		layerId: 'zee_sepakat',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: {
			join: 'all',
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
		layerId: 'laut_teritorial_sepakat',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: {
			join: 'all',
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
		layerId: 'landas_kontinen_sepakat',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: {
			join: 'all',
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

export type ActivePanel = 'layers' | 'filter' | 'geoprocessing' | 'import';

interface UIStoreState {
	sidebarOpen: boolean;
	activeTab: SidebarTab;
	builderState: Record<LayerId, FilterDefinition>;
	presets: PresetDefinition[];
	activePanel: ActivePanel | null;
	tableOpen: boolean;
	legendOpen: boolean;
	showCoordinates: boolean;
	simpleFilter: SimpleFilterState;
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
	setActivePanel: (panel: ActivePanel | null) => void;
	togglePanel: (panel: ActivePanel) => void;
	setTableOpen: (open: boolean) => void;
	toggleTable: () => void;
	setLegendOpen: (open: boolean) => void;
	setShowCoordinates: (show: boolean) => void;
	setSimpleFilter: (patch: Partial<SimpleFilterState>) => void;
	resetSimpleFilter: () => void;
}

export const useUIStore = create(
	persist<UIStoreState>(
		(set) => ({
			sidebarOpen: false,
			activeTab: 'query',
			activePanel: null,
			tableOpen: false,
			legendOpen: true,
			showCoordinates: true,
			simpleFilter: defaultSimpleFilter(),
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
			setActivePanel: (panel) => set({ activePanel: panel }),
			togglePanel: (panel) => set((state) => ({ activePanel: state.activePanel === panel ? null : panel })),
			setTableOpen: (open) => set({ tableOpen: open }),
			toggleTable: () => set((state) => ({ tableOpen: !state.tableOpen })),
			setLegendOpen: (open) => set({ legendOpen: open }),
			setShowCoordinates: (show) => set({ showCoordinates: show }),
			setSimpleFilter: (patch) => set((state) => ({ simpleFilter: { ...state.simpleFilter, ...patch } })),
			resetSimpleFilter: () => set({ simpleFilter: defaultSimpleFilter() }),
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
				if (!state.simpleFilter) {
					state.simpleFilter = defaultSimpleFilter();
				}
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
