import { type PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

import { LAYER_SCHEMAS } from '@/lib/schema';
import type { CoreLayerId, FilterCondition, FilterDefinition } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';
import type { SimpleFilterState } from '@/store/useUI';

// ── Static option lists ──────────────────────────────────────────────────────

const TIPE_BATAS_OPTIONS = [
	{ value: 'laut_teritorial', label: 'Laut Teritorial', layerIds: ['laut_teritorial_sepakat', 'laut_teritorial_perlu'] as CoreLayerId[] },
	{ value: 'zee', label: 'ZEE', layerIds: ['zee_sepakat', 'zee_sepakat_ratif', 'zee_perlu'] as CoreLayerId[] },
	{ value: 'landas_kontinen', label: 'Landas Kontinen', layerIds: ['landas_kontinen_sepakat', 'landas_kontinen_sepakat_ratif', 'landas_kontinen_perlu', 'landas_kontinen_ekstensi'] as CoreLayerId[] },
	{ value: 'zona_tambahan', label: 'Zona Tambahan', layerIds: ['zona_tambahan'] as CoreLayerId[] },
	{ value: 'garis_pangkal', label: 'Garis Pangkal', layerIds: ['baseline'] as CoreLayerId[] },
	{ value: 'titik_perjanjian', label: 'Titik Perjanjian', layerIds: ['titik_perjanjian_lt', 'titik_perjanjian_lk', 'titik_perjanjian_zee'] as CoreLayerId[] },
	{ value: 'titik_dasar', label: 'Titik Dasar', layerIds: ['basepoints'] as CoreLayerId[] },
];

const STATUS_KESEPAKATAN_OPTIONS = [
	{ value: 'Kesepakatan sudah ratifikasi', label: 'Sudah Ratifikasi' },
	{ value: 'Kesepakatan belum ratifikasi', label: 'Belum Ratifikasi' },
	{ value: 'Perlu Kesepakatan', label: 'Perlu Kesepakatan' },
	{ value: 'Unilateral', label: 'Unilateral' },
];

const STATUS_LAUT_OPTIONS = [
	{ value: 'Unilateral', label: 'Unilateral' },
	{ value: 'Bilateral', label: 'Bilateral' },
	{ value: 'Trilateral', label: 'Trilateral' },
];

// Layers that carry boundary attributes (excludes basepoints & baseline)
const ALL_CORE_IDS = Object.keys(LAYER_SCHEMAS) as CoreLayerId[];
const BOUNDARY_LAYER_IDS: CoreLayerId[] = ALL_CORE_IDS.filter((id) => id !== 'basepoints' && id !== 'baseline');
const PERAIRAN_LAYER_IDS: CoreLayerId[] = ['basepoints', 'baseline'];

const DEFAULT_SHOW_COUNT = 8;

// ── Helper ──────────────────────────────────────────────────────────────────

const makeId = () => Math.random().toString(36).slice(2, 10);

function toggleSet(arr: string[], value: string): string[] {
	return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function buildDefinition(
	sf: SimpleFilterState,
	layerId: CoreLayerId,
): FilterDefinition {
	const conditions: FilterCondition[] = [];
	const isBoundary = BOUNDARY_LAYER_IDS.includes(layerId);
	const hasPerairan = PERAIRAN_LAYER_IDS.includes(layerId);

	if (isBoundary) {
		if (sf.statusKesepakatan.length > 0) {
			conditions.push({ id: makeId(), field: 'StatusLaut', operator: 'in', value: sf.statusKesepakatan, type: 'string' });
		}
		if (sf.batasNegara.length > 0) {
			conditions.push({ id: makeId(), field: 'Batas_Ngr', operator: 'in', value: sf.batasNegara, type: 'string' });
		}
		if (sf.statusLaut.length > 0) {
			conditions.push({ id: makeId(), field: 'Jenis', operator: 'in', value: sf.statusLaut, type: 'string' });
		}
		const minP = sf.tahunPerjanjianMin !== '' ? Number(sf.tahunPerjanjianMin) : null;
		const maxP = sf.tahunPerjanjianMax !== '' ? Number(sf.tahunPerjanjianMax) : null;
		if (minP !== null && maxP !== null && !Number.isNaN(minP) && !Number.isNaN(maxP)) {
			conditions.push({ id: makeId(), field: 'Janji_Thn', operator: 'between', value: Math.min(minP, maxP), value2: Math.max(minP, maxP), type: 'number' });
		} else if (minP !== null && !Number.isNaN(minP)) {
			conditions.push({ id: makeId(), field: 'Janji_Thn', operator: '>=', value: minP, type: 'number' });
		} else if (maxP !== null && !Number.isNaN(maxP)) {
			conditions.push({ id: makeId(), field: 'Janji_Thn', operator: '<=', value: maxP, type: 'number' });
		}
		const minR = sf.tahunRatifikasiMin !== '' ? Number(sf.tahunRatifikasiMin) : null;
		const maxR = sf.tahunRatifikasiMax !== '' ? Number(sf.tahunRatifikasiMax) : null;
		if (minR !== null && maxR !== null && !Number.isNaN(minR) && !Number.isNaN(maxR)) {
			conditions.push({ id: makeId(), field: 'Ratif_Thn', operator: 'between', value: Math.min(minR, maxR), value2: Math.max(minR, maxR), type: 'number' });
		} else if (minR !== null && !Number.isNaN(minR)) {
			conditions.push({ id: makeId(), field: 'Ratif_Thn', operator: '>=', value: minR, type: 'number' });
		} else if (maxR !== null && !Number.isNaN(maxR)) {
			conditions.push({ id: makeId(), field: 'Ratif_Thn', operator: '<=', value: maxR, type: 'number' });
		}
	}

	if (hasPerairan && sf.perairan.length > 0) {
		conditions.push({ id: makeId(), field: 'Perairan', operator: 'in', value: sf.perairan, type: 'string' });
	}

	return { join: 'all', conditions };
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface ChipButtonProps {
	label: string;
	selected: boolean;
	onClick: () => void;
}

const ChipButton = ({ label, selected, onClick }: ChipButtonProps) => (
	<button
		type='button'
		onClick={onClick}
		className={cn(
			'flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
			selected
				? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]'
				: 'border-[color:var(--color-border)] bg-[color:var(--color-panel)] text-[color:var(--color-text)] hover:border-[color:var(--color-accent)]/60 hover:text-[color:var(--color-accent)]',
		)}
	>
		{selected && <Check className='h-3 w-3 shrink-0' />}
		{label}
	</button>
);

interface SectionProps {
	title: string;
	note?: string;
}

const Section = ({ title, note, children }: PropsWithChildren<SectionProps>) => (
	<div className='flex flex-col gap-2 pb-4'>
		<div className='flex items-baseline gap-2'>
			<span className='text-xs font-semibold text-[color:var(--color-text)]'>{title}</span>
			{note && <span className='text-[10px] text-[color:var(--color-muted)]'>{note}</span>}
		</div>
		{children}
	</div>
);

interface YearRangeProps {
	minValue: string;
	maxValue: string;
	onMinChange: (v: string) => void;
	onMaxChange: (v: string) => void;
}

const YearRange = ({ minValue, maxValue, onMinChange, onMaxChange }: YearRangeProps) => (
	<div className='flex items-center gap-2'>
		<input
			type='number'
			placeholder='Min'
			value={minValue}
			onChange={(e) => onMinChange(e.target.value)}
			min={1945}
			max={2099}
			className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-xs text-[color:var(--color-text)] placeholder-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none'
		/>
		<span className='shrink-0 text-xs text-[color:var(--color-muted)]'>–</span>
		<input
			type='number'
			placeholder='Max'
			value={maxValue}
			onChange={(e) => onMaxChange(e.target.value)}
			min={1945}
			max={2099}
			className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-xs text-[color:var(--color-text)] placeholder-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none'
		/>
	</div>
);

interface ChipGridProps {
	options: { value: string; label: string }[];
	selected: string[];
	onToggle: (value: string) => void;
	defaultShowCount?: number;
}

const ChipGrid = ({ options, selected, onToggle, defaultShowCount = DEFAULT_SHOW_COUNT }: ChipGridProps) => {
	const [expanded, setExpanded] = useState(false);
	const visible = expanded ? options : options.slice(0, defaultShowCount);
	const hasMore = options.length > defaultShowCount;

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-wrap gap-1.5'>
				{visible.map((opt) => (
					<ChipButton key={opt.value} label={opt.label} selected={selected.includes(opt.value)} onClick={() => onToggle(opt.value)} />
				))}
			</div>
			{hasMore && (
				<button
					type='button'
					onClick={() => setExpanded((prev) => !prev)}
					className='flex items-center gap-1 self-start text-[10px] font-medium text-[color:var(--color-accent)] hover:underline'
				>
					{expanded ? (
						<>
							<ChevronUp className='h-3 w-3' /> Tampilkan Lebih Sedikit
						</>
					) : (
						<>
							<ChevronDown className='h-3 w-3' /> Lihat Lainnya ({options.length - defaultShowCount} lagi)
						</>
					)}
				</button>
			)}
		</div>
	);
};

// ── Main FilterPanel ─────────────────────────────────────────────────────────

const FilterPanel = () => {
	const activePanel = useUIStore((s) => s.activePanel);
	const setActivePanel = useUIStore((s) => s.setActivePanel);
	const simpleFilter = useUIStore((s) => s.simpleFilter);
	const setSimpleFilter = useUIStore((s) => s.setSimpleFilter);
	const resetSimpleFilter = useUIStore((s) => s.resetSimpleFilter);

	// For options derivation only — stable selectors
	const getUniqueValues = useLayersStore((s) => s.getUniqueValues);

	// Derive dynamic options from loaded data
	const batasNegaraOptions = useMemo(() => {
		const combined = new Set<string>();
		for (const id of BOUNDARY_LAYER_IDS) {
			for (const v of getUniqueValues(id, 'Batas_Ngr')) {
				const s = String(v).trim();
				if (s && s !== '-') combined.add(s);
			}
		}
		return [...combined].sort().map((v) => ({ value: v, label: v }));
	}, [getUniqueValues]);

	const perairanOptions = useMemo(() => {
		const combined = new Set<string>();
		for (const id of PERAIRAN_LAYER_IDS) {
			for (const v of getUniqueValues(id, 'Perairan')) {
				const s = String(v).trim();
				if (s && s !== '-') combined.add(s);
			}
		}
		return [...combined].sort().map((v) => ({ value: v, label: v }));
	}, [getUniqueValues]);

	// Count active filter conditions (for badge)
	const activeCount = useMemo(() => {
		let n = 0;
		if (simpleFilter.tipeBatas.length > 0) n++;
		if (simpleFilter.statusKesepakatan.length > 0) n++;
		if (simpleFilter.batasNegara.length > 0) n++;
		if (simpleFilter.statusLaut.length > 0) n++;
		if (simpleFilter.tahunPerjanjianMin || simpleFilter.tahunPerjanjianMax) n++;
		if (simpleFilter.tahunRatifikasiMin || simpleFilter.tahunRatifikasiMax) n++;
		if (simpleFilter.perairan.length > 0) n++;
		return n;
	}, [simpleFilter]);

	// Read freshest state from store directly so the callback never holds stale closure values
	const handleApply = useCallback(() => {
		const sf = useUIStore.getState().simpleFilter;
		const { applyFilter, clearFilter, setLayerVisibility } = useLayersStore.getState();

		const hasTipeBatas = sf.tipeBatas.length > 0;
		const hasBoundaryFilter =
			sf.statusKesepakatan.length > 0 ||
			sf.batasNegara.length > 0 ||
			sf.statusLaut.length > 0 ||
			sf.tahunPerjanjianMin !== '' ||
			sf.tahunPerjanjianMax !== '' ||
			sf.tahunRatifikasiMin !== '' ||
			sf.tahunRatifikasiMax !== '';
		const hasPerairanFilter = sf.perairan.length > 0;
		const hasAttributeFilter = hasBoundaryFilter || hasPerairanFilter;
		const anyFilterActive = hasTipeBatas || hasAttributeFilter;

		// Resolve target layer IDs from tipeBatas selection
		let tipeBatasTargets: CoreLayerId[];
		if (!hasTipeBatas) {
			tipeBatasTargets = ALL_CORE_IDS;
		} else {
			const ids = new Set<CoreLayerId>();
			for (const tipe of sf.tipeBatas) {
				const opt = TIPE_BATAS_OPTIONS.find((o) => o.value === tipe);
				if (opt) for (const id of opt.layerIds) ids.add(id);
			}
			tipeBatasTargets = [...ids];
		}

		for (const id of ALL_CORE_IDS) {
			const isBoundaryLayer = BOUNDARY_LAYER_IDS.includes(id);
			const isPerairanLayer = PERAIRAN_LAYER_IDS.includes(id);

			// Whether ALL active attribute filter categories are supported by this layer's schema.
			// Uses AND logic: if boundary filters AND perairan filters are both active,
			// the layer must support BOTH — which is impossible (they're mutually exclusive schemas),
			// so the layer is hidden. This enforces strict cross-category filtering.
			const allActiveFiltersRelevant =
				(!hasBoundaryFilter || isBoundaryLayer) &&
				(!hasPerairanFilter || isPerairanLayer);

			// Determine visibility
			let shouldBeVisible: boolean;
			if (!anyFilterActive) {
				// No filter active → restore all layers
				shouldBeVisible = true;
			} else if (hasTipeBatas && !tipeBatasTargets.includes(id)) {
				// Tipe Batas filter active but this layer is not in selection → hide
				shouldBeVisible = false;
			} else if (hasAttributeFilter && !allActiveFiltersRelevant) {
				// Active attribute filters exist but NONE apply to this layer's schema
				// (e.g. boundary filter on a perairan layer, or perairan filter on a boundary layer)
				// → hide regardless of tipe batas selection
				shouldBeVisible = false;
			} else {
				shouldBeVisible = true;
			}

			setLayerVisibility(id, shouldBeVisible);

			if (shouldBeVisible) {
				const def = buildDefinition(sf, id);
				if (def.conditions.length > 0) {
					applyFilter(id, def);
				} else {
					clearFilter(id);
				}
			} else {
				clearFilter(id);
			}
		}
	}, []);

	const handleReset = useCallback(() => {
		resetSimpleFilter();
		const { clearFilter, setLayerVisibility } = useLayersStore.getState();
		for (const id of ALL_CORE_IDS) {
			clearFilter(id);
			setLayerVisibility(id, true);
		}
	}, [resetSimpleFilter]);

	if (activePanel !== 'filter') return null;

	const sf = simpleFilter;

	return (
		<div
			className='absolute left-0 top-0 z-30 flex h-full w-[340px] flex-col border-r shadow-xl panel-slide-left'
			style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border, #e2e8f0)' }}
		>
			{/* Header */}
			<div
				className='flex shrink-0 items-center justify-between border-b px-4 py-3'
				style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
			>
				<div className='flex items-center gap-2'>
					<SlidersHorizontal className='h-4 w-4 text-[color:var(--color-accent)]' />
					<h2 className='text-sm font-semibold text-[color:var(--color-text)]'>Filter Batas Maritim</h2>
					{activeCount > 0 && (
						<span className='rounded-full bg-[color:var(--color-accent)] px-1.5 py-0.5 text-[10px] font-bold text-white'>
							{activeCount}
						</span>
					)}
				</div>
				<button
					type='button'
					onClick={() => setActivePanel(null)}
					className='rounded-md p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)]'
					aria-label='Tutup panel'
				>
					<X className='h-4 w-4' />
				</button>
			</div>

			{/* Scrollable body */}
			<div className='flex-1 overflow-y-auto px-4 py-3'>
				<div className='flex flex-col'>

					{/* 1. Tipe Batas Laut */}
					<div className='border-b py-4 first:pt-0' style={{ borderColor: 'var(--color-border)' }}>
						<Section title='Tipe Batas Laut'>
							<ChipGrid
								options={TIPE_BATAS_OPTIONS}
								selected={sf.tipeBatas}
								onToggle={(v) => setSimpleFilter({ tipeBatas: toggleSet(sf.tipeBatas, v) })}
							/>
						</Section>
					</div>

					{/* 2. Status Laut */}
					<div className='border-b py-4' style={{ borderColor: 'var(--color-border)' }}>
						<Section title='Status Laut'>
							<ChipGrid
								options={STATUS_KESEPAKATAN_OPTIONS}
								selected={sf.statusKesepakatan}
								onToggle={(v) => setSimpleFilter({ statusKesepakatan: toggleSet(sf.statusKesepakatan, v) })}
							/>
						</Section>
					</div>

					{/* 3. Berbatasan dengan Negara */}
					<div className='border-b py-4' style={{ borderColor: 'var(--color-border)' }}>
						<Section title='Berbatasan dengan Negara'>
							{batasNegaraOptions.length === 0 ? (
								<p className='text-[11px] text-[color:var(--color-muted)]'>Data belum dimuat.</p>
							) : (
								<ChipGrid
									options={batasNegaraOptions}
									selected={sf.batasNegara}
									onToggle={(v) => setSimpleFilter({ batasNegara: toggleSet(sf.batasNegara, v) })}
									defaultShowCount={6}
								/>
							)}
						</Section>
					</div>

					{/* 4. Jenis */}
					<div className='border-b py-4' style={{ borderColor: 'var(--color-border)' }}>
						<Section title='Jenis'>
							<ChipGrid
								options={STATUS_LAUT_OPTIONS}
								selected={sf.statusLaut}
								onToggle={(v) => setSimpleFilter({ statusLaut: toggleSet(sf.statusLaut, v) })}
							/>
						</Section>
					</div>

					{/* 5. Tahun Perjanjian */}
					<div className='border-b py-4' style={{ borderColor: 'var(--color-border)' }}>
						<Section title='Tahun Perjanjian'>
							<YearRange
								minValue={sf.tahunPerjanjianMin}
								maxValue={sf.tahunPerjanjianMax}
								onMinChange={(v) => setSimpleFilter({ tahunPerjanjianMin: v })}
								onMaxChange={(v) => setSimpleFilter({ tahunPerjanjianMax: v })}
							/>
						</Section>
					</div>

					{/* 6. Tahun Ratifikasi */}
					<div className='border-b py-4' style={{ borderColor: 'var(--color-border)' }}>
						<Section title='Tahun Ratifikasi'>
							<YearRange
								minValue={sf.tahunRatifikasiMin}
								maxValue={sf.tahunRatifikasiMax}
								onMinChange={(v) => setSimpleFilter({ tahunRatifikasiMin: v })}
								onMaxChange={(v) => setSimpleFilter({ tahunRatifikasiMax: v })}
							/>
						</Section>
					</div>

					{/* 7. Wilayah Perairan (Titik Dasar & Garis Pangkal) */}
					<div className='py-4'>
						<Section title='Wilayah Perairan' note='Titik Dasar & Garis Pangkal (Baseline)'>
							{perairanOptions.length === 0 ? (
								<p className='text-[11px] text-[color:var(--color-muted)]'>Data belum dimuat.</p>
							) : (
								<ChipGrid
									options={perairanOptions}
									selected={sf.perairan}
									onToggle={(v) => setSimpleFilter({ perairan: toggleSet(sf.perairan, v) })}
									defaultShowCount={6}
								/>
							)}
						</Section>
					</div>

				</div>
			</div>

			{/* Sticky footer */}
			<div
				className='flex shrink-0 gap-2 border-t px-4 py-3'
				style={{ borderColor: 'var(--color-border, #e2e8f0)' }}
			>
				<button
					type='button'
					onClick={handleReset}
					className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[color:var(--color-border)] py-2.5 text-xs font-semibold text-[color:var(--color-accent)] hover:bg-[color:var(--color-panel-muted)] active:scale-95'
				>
					<RotateCcw className='h-3.5 w-3.5' />
					Atur Ulang
				</button>
				<button
					type='button'
					onClick={handleApply}
					className='flex flex-[2] items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-accent)] py-2.5 text-xs font-semibold text-white hover:opacity-90 active:scale-95'
				>
					Terapkan
				</button>
			</div>
		</div>
	);
};

export default FilterPanel;

