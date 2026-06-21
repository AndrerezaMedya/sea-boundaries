import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FilterDefinition, LayerId, PresetDefinition } from '@/lib/types';
import { USER_LAYER_ID, ALL_CORE_IDS } from '@/lib/types';

// ── Simple Filter (friendly, cross-layer) ───────────────────────────────────
export interface SimpleFilterState {
	// Layer visibility selector (tipe batas laut)
	tipeBatas: string[];
	// `status` on line limits vs point locations (separate vocabularies in DB)
	statusLimit: string[];
	statusPoint: string[];
	// validity status (Active/Terminated based on endlifespan)
	validityStatusLimit: string[];
	validityStatusPoint: string[];
	// `limit_object_type` field — applies to limit layers only
	limitObjectType: string[];
	// `location_type_list` field — applies to location layers only
	locationType: string[];
	// `point_location` field — applies to location layers only
	pointLocation: string[];
	// `horizontal_datum` field — common
	horizontalDatum: string[];
}

const defaultSimpleFilter = (): SimpleFilterState => ({
	tipeBatas: [],
	statusLimit: [],
	statusPoint: [],
	validityStatusLimit: [],
	validityStatusPoint: [],
	limitObjectType: [],
	locationType: [],
	pointLocation: [],
	horizontalDatum: [],
});

// Migrate / defend against stale persisted shape so reads never crash on undefined fields.
const normalizeSimpleFilter = (raw: unknown): SimpleFilterState => {
	const base = defaultSimpleFilter();
	if (!raw || typeof raw !== 'object') return base;
	const src = raw as Record<string, unknown>;
	const keepArr = (k: keyof SimpleFilterState): string[] => {
		const v = src[k];
		return Array.isArray(v) ? (v.filter((x) => typeof x === 'string') as string[]) : base[k];
	};
	const legacyStatus = Array.isArray(src.status)
		? (src.status as unknown[]).filter((x): x is string => typeof x === 'string')
		: [];
	const statusLimitNext = keepArr('statusLimit');
	return {
		tipeBatas: keepArr('tipeBatas'),
		statusLimit: statusLimitNext.length > 0 ? statusLimitNext : legacyStatus,
		statusPoint: keepArr('statusPoint'),
		validityStatusLimit: keepArr('validityStatusLimit'),
		validityStatusPoint: keepArr('validityStatusPoint'),
		limitObjectType: keepArr('limitObjectType'),
		locationType: keepArr('locationType'),
		pointLocation: keepArr('pointLocation'),
		horizontalDatum: keepArr('horizontalDatum'),
	};
};

const STORAGE_KEY = 'sea-boundaries:ui';

type SidebarTab = 'query' | 'table' | 'legend' | 'geoprocessing';

const emptyDefinition = (): FilterDefinition => ({
	conditions: [],
	join: 'all',
});

const createEmptyBuilderState = (): Record<LayerId, FilterDefinition> => {
	const state = {} as Record<LayerId, FilterDefinition>;
	for (const id of ALL_CORE_IDS) {
		state[id] = emptyDefinition();
	}
	state[USER_LAYER_ID] = emptyDefinition();
	return state;
};

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
		id: 'preset-eez-australia',
		name: 'ZEE — Indonesia - Australia',
		layerId: 'eez_limit',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-eez-au', field: 'Country', operator: 'contains', value: 'Australia', type: 'string' }] },
	},
	{
		id: 'preset-eez-need-agreement',
		name: 'ZEE — Perlu Kesepakatan',
		layerId: 'eez_limit',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-eez-need', field: 'Status', operator: '=', value: 'Need Agreement', type: 'string' }] },
	},
	{
		id: 'preset-eez-natuna',
		name: 'ZEE — Laut Natuna',
		layerId: 'eez_limit',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-eez-natuna', field: 'Location', operator: '=', value: 'Natuna Sea', type: 'string' }] },
	},
	{
		id: 'preset-eez-intl-boundary',
		name: 'ZEE — International Boundary',
		layerId: 'eez_limit',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-eez-intl', field: 'Limit Type', operator: '=', value: 'International Boundary', type: 'string' }] },
	},
	{
		id: 'preset-ts-need-agreement',
		name: 'Laut Teritorial — Perlu Kesepakatan',
		layerId: 'territorial_sea',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-ts-need', field: 'Status', operator: '=', value: 'Need Agreement', type: 'string' }] },
	},
	{
		id: 'preset-ts-outer-limit',
		name: 'Laut Teritorial — Outer Limit',
		layerId: 'territorial_sea',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-ts-outer', field: 'Limit Type', operator: '=', value: 'Outer Limit of Territorial Sea', type: 'string' }] },
	},
	{
		id: 'preset-cs-agreement',
		name: 'Landas Kontinen — Telah Disepakati',
		layerId: 'continental_shelf',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-cs-agr', field: 'Status', operator: '=', value: 'Agreement', type: 'string' }] },
	},
	{
		id: 'preset-cs-not-ratified',
		name: 'Landas Kontinen — Belum Diratifikasi',
		layerId: 'continental_shelf',
		createdAt: '2025-01-01T00:00:00.000Z',
		definition: { join: 'all', conditions: [{ id: 'cond-cs-ratif', field: 'Status', operator: '=', value: 'Not Ratified Yet', type: 'string' }] },
	},
];

export type ActivePanel = 'layers' | 'filter' | 'geoprocessing' | 'basemap';

export type SymbologyMode = 'iho' | 'easyRead';

/** Attribute filter targets line limits vs point locations (mutually exclusive on apply). */
export type FilterTarget = 'limit' | 'point';

interface UIStoreState {
	sidebarOpen: boolean;
	activeTab: SidebarTab;
	builderState: Record<LayerId, FilterDefinition>;
	presets: PresetDefinition[];
	activePanel: ActivePanel | null;
	legendOpen: boolean;
	showCoordinates: boolean;
	symbologyMode: SymbologyMode;
	simpleFilter: SimpleFilterState;
	filterTarget: FilterTarget;
	activeBasemapId: string | null;
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
	setLegendOpen: (open: boolean) => void;
	setShowCoordinates: (show: boolean) => void;
	setSymbologyMode: (mode: SymbologyMode) => void;
	setSimpleFilter: (patch: Partial<SimpleFilterState>) => void;
	resetSimpleFilter: () => void;
	setFilterTarget: (target: FilterTarget) => void;
	setActiveBasemapId: (id: string | null) => void;
}

export const useUIStore = create(
	persist<UIStoreState>(
		(set) => ({
			sidebarOpen: false,
			activeTab: 'query',
			activePanel: null,
			legendOpen: true,
			showCoordinates: true,
			symbologyMode: 'iho',
			simpleFilter: defaultSimpleFilter(),
			filterTarget: 'limit',
			activeBasemapId: null,
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
			setLegendOpen: (open) => set({ legendOpen: open }),
			setShowCoordinates: (show) => set({ showCoordinates: show }),
			setSymbologyMode: (mode) => set({ symbologyMode: mode }),
			setSimpleFilter: (patch) => set((state) => ({ simpleFilter: { ...state.simpleFilter, ...patch } })),
			resetSimpleFilter: () => set({ simpleFilter: defaultSimpleFilter() }),
			setFilterTarget: (target) => set({ filterTarget: target }),
			setActiveBasemapId: (id) => set({ activeBasemapId: id }),
		}),
		{
			name: STORAGE_KEY,
			version: 3,
			onRehydrateStorage: () => (state) => {
				if (!state) {
					return;
				}
				const builder = state.builderState ?? createEmptyBuilderState();
				state.builderState = {
					...createEmptyBuilderState(),
					...builder,
				};
				state.simpleFilter = normalizeSimpleFilter(state.simpleFilter);
				state.filterTarget = state.filterTarget === 'point' ? 'point' : 'limit';
				if ((state.activePanel as string | null) === 'import') {
					state.activePanel = null;
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
