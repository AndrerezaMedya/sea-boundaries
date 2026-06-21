import { type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchFilterOptions } from '@/lib/apiClient';
import { isMvtDisplayMode } from '@/lib/mapDisplay';
import { Check, ChevronDown, RotateCcw, X } from 'lucide-react';

import type { CoreLayerId, FilterCondition, FilterDefinition } from '@/lib/types';
import { mapToolPanelClassName } from '@/lib/mapPanelLayout';
import { cn } from '@/lib/utils';
import {
	getTipeBatasOptionsForTarget,
	isTipeBatasKeyForTarget,
	TIPE_BATAS_LAYER_IDS,
} from '@/i18n/webgis-catalog';
import { useWebGisT } from '@/i18n/useWebGisT';
import { useLayersStore } from '@/store/useLayersStore';
import { useUIStore } from '@/store/useUI';
import type { FilterTarget, SimpleFilterState } from '@/store/useUI';

// ── Layer classification ──────────────────────────────────────────────────────
// Drives which simple-filter fields apply to which layer (per-schema field names).

const LIMIT_LAYER_IDS: readonly CoreLayerId[] = [
	'territorial_sea',
	'contiguous_zone',
	'eez_limit',
	'continental_shelf',
	'landas_kontinen_ekstensi',
	'fisheries',
	'baseline',
] as const;

const LOCATION_LAYER_IDS: readonly CoreLayerId[] = [
	'basepoints',
	'basepoints_2026',
	'titik_perjanjian_lt',
	'titik_perjanjian_lk',
	'titik_perjanjian_zee',
	'titik_referensi',
] as const;

const ALL_CORE_IDS: readonly CoreLayerId[] = [...LIMIT_LAYER_IDS, ...LOCATION_LAYER_IDS];

const LAYER_IDS_BY_TARGET: Record<FilterTarget, readonly CoreLayerId[]> = {
	limit: LIMIT_LAYER_IDS,
	point: LOCATION_LAYER_IDS,
};

const isLimitLayer = (id: CoreLayerId): boolean => LIMIT_LAYER_IDS.includes(id);
const isLocationLayer = (id: CoreLayerId): boolean => LOCATION_LAYER_IDS.includes(id);

const layerInTarget = (layerId: CoreLayerId, target: FilterTarget): boolean =>
	LAYER_IDS_BY_TARGET[target].includes(layerId);

const selectedTipeForTarget = (sf: SimpleFilterState, target: FilterTarget): string[] =>
	sf.tipeBatas.filter((key) => isTipeBatasKeyForTarget(key, target));

// ── Tipe Batas grouping (drives layer visibility) ─────────────────────────────

const DEFAULT_SHOW_COUNT = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeId = () => Math.random().toString(36).slice(2, 10);

function toggleSet(arr: string[], value: string): string[] {
	return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function buildDefinition(sf: SimpleFilterState, layerId: CoreLayerId, target: FilterTarget): FilterDefinition {
	if (!layerInTarget(layerId, target)) {
		return { join: 'all', conditions: [] };
	}

	const conditions: FilterCondition[] = [];
	const limitLayer = target === 'limit' && isLimitLayer(layerId);
	const locationLayer = target === 'point' && isLocationLayer(layerId);

	const statusValues = target === 'limit' ? sf.statusLimit : sf.statusPoint;
	if (statusValues.length > 0) {
		conditions.push({ id: makeId(), field: 'status', operator: 'in', value: statusValues, type: 'string' });
	}
	if (sf.horizontalDatum.length > 0) {
		conditions.push({ id: makeId(), field: 'horizontal_datum', operator: 'in', value: sf.horizontalDatum, type: 'string' });
	}
	if (limitLayer && sf.limitObjectType.length > 0) {
		conditions.push({ id: makeId(), field: 'limit_object_type', operator: 'in', value: sf.limitObjectType, type: 'string' });
	}
	if (locationLayer && sf.locationType.length > 0) {
		conditions.push({ id: makeId(), field: 'location_type_list', operator: 'in', value: sf.locationType, type: 'string' });
	}
	if (locationLayer && sf.pointLocation.length > 0) {
		conditions.push({ id: makeId(), field: 'point_location', operator: 'in', value: sf.pointLocation, type: 'string' });
	}

	const validityValues = target === 'limit' ? sf.validityStatusLimit : sf.validityStatusPoint;
	if (validityValues.length === 1) {
		const val = validityValues[0];
		if (val === 'Active') {
			conditions.push({ id: makeId(), field: 'end_life_span', operator: 'is_null', value: '', type: 'string' });
		} else if (val === 'Terminated') {
			conditions.push({ id: makeId(), field: 'end_life_span', operator: 'is_not_null', value: '', type: 'string' });
		}
	} else if (validityValues.length === 2) {
		// If both are selected, return nothing as requested (is_null AND is_not_null is impossible)
		conditions.push({ id: makeId(), field: 'end_life_span', operator: 'is_null', value: '', type: 'string' });
		conditions.push({ id: makeId(), field: 'end_life_span', operator: 'is_not_null', value: '', type: 'string' });
	}

	return { join: 'all', conditions };
}

function filterAppliesToLayer(sf: SimpleFilterState, layerId: CoreLayerId, target: FilterTarget): boolean {
	if (!layerInTarget(layerId, target)) return false;
	const statusValues = target === 'limit' ? sf.statusLimit : sf.statusPoint;
	const validityValues = target === 'limit' ? sf.validityStatusLimit : sf.validityStatusPoint;
	if (statusValues.length > 0 || sf.horizontalDatum.length > 0 || validityValues.length > 0) return true;
	if (target === 'limit' && isLimitLayer(layerId) && sf.limitObjectType.length > 0) return true;
	if (target === 'point' && isLocationLayer(layerId) && (sf.locationType.length > 0 || sf.pointLocation.length > 0)) {
		return true;
	}
	return false;
}

function activeFilterCount(sf: SimpleFilterState, target: FilterTarget): number {
	const tipe = selectedTipeForTarget(sf, target).length;
	if (target === 'limit') {
		return tipe + sf.statusLimit.length + sf.horizontalDatum.length + sf.validityStatusLimit.length;
	}
	return tipe + sf.statusPoint.length + sf.pointLocation.length + sf.horizontalDatum.length + sf.validityStatusPoint.length;
}

function hasAttributeFilterForTarget(sf: SimpleFilterState, target: FilterTarget): boolean {
	if (target === 'limit') {
		return sf.statusLimit.length > 0 || sf.horizontalDatum.length > 0 || sf.validityStatusLimit.length > 0;
	}
	return sf.statusPoint.length > 0 || sf.horizontalDatum.length > 0 || sf.pointLocation.length > 0 || sf.validityStatusPoint.length > 0;
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

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
			'inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[11px] leading-tight transition-colors duration-100 rounded-full',
			selected
				? 'border-[color:var(--color-text)] bg-[color:var(--color-text)] text-[color:var(--color-panel)]'
				: 'border-[color:var(--color-border)] bg-[color:var(--color-panel)] text-[color:var(--color-text)] hover:border-[color:var(--color-text)]',
		)}
	>
		{selected && <Check className='h-3 w-3 shrink-0' strokeWidth={2.5} />}
		<span>{label}</span>
	</button>
);

interface SectionProps {
	code: string;
	title: string;
}

const Section = ({ code, title, children }: PropsWithChildren<SectionProps>) => (
	<section className='flex flex-col gap-2 border-b border-[color:var(--color-border)] py-3.5 last:border-b-0'>
		<header className='flex items-baseline gap-2'>
			<span className='text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'>{code}</span>
			<h3 className='text-[13px] font-semibold text-[color:var(--color-text)]'>{title}</h3>
		</header>
		<div>{children}</div>
	</section>
);

interface ChipGridProps {
	options: readonly { value: string; label: string }[];
	selected: string[];
	onToggle: (value: string) => void;
	defaultShowCount?: number;
	emptyMessage?: string;
	showLessLabel: string;
	showAllLabel: (count: number) => string;
}

const ChipGrid = ({
	options,
	selected,
	onToggle,
	defaultShowCount = DEFAULT_SHOW_COUNT,
	emptyMessage,
	showLessLabel,
	showAllLabel,
}: ChipGridProps) => {
	const [expanded, setExpanded] = useState(false);

	if (options.length === 0) {
		return (
			<p className='text-[11px] tracking-wide text-[color:var(--color-muted)]'>
				{emptyMessage ?? 'no data available'}
			</p>
		);
	}

	const visible = expanded ? options : options.slice(0, defaultShowCount);
	const hidden = options.length - defaultShowCount;

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-wrap gap-1.5'>
				{visible.map((opt) => (
					<ChipButton
						key={opt.value}
						label={opt.label}
						selected={selected.includes(opt.value)}
						onClick={() => onToggle(opt.value)}
					/>
				))}
			</div>
			{hidden > 0 && (
				<button
					type='button'
					onClick={() => setExpanded((prev) => !prev)}
					className='inline-flex w-fit items-center gap-1 text-[11px] tracking-wide text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]'
				>
					<ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
					{expanded ? showLessLabel : showAllLabel(hidden)}
				</button>
			)}
		</div>
	);
};

const FILTER_TARGETS: FilterTarget[] = ['limit', 'point'];

interface FilterTargetSwitcherProps {
	target: FilterTarget;
	onChange: (target: FilterTarget) => void;
	modeLimitLabel: string;
	modePointLabel: string;
	ariaLabel: string;
}

const FilterTargetSwitcher = ({
	target,
	onChange,
	modeLimitLabel,
	modePointLabel,
	ariaLabel,
}: FilterTargetSwitcherProps) => (
	<div
		className='flex gap-1 rounded-full border border-[color:var(--color-border)] p-1'
		style={{ backgroundColor: 'var(--color-panel-muted, #f7f7f4)' }}
		role='group'
		aria-label={ariaLabel}
	>
		{FILTER_TARGETS.map((mode) => {
			const active = target === mode;
			return (
				<button
					key={mode}
					type='button'
					onClick={() => onChange(mode)}
					aria-pressed={active}
					className={cn(
						'flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-100',
						active
							? 'bg-[color:var(--color-text)] text-[color:var(--color-panel)] shadow-sm'
							: 'text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]',
					)}
				>
					{mode === 'limit' ? modeLimitLabel : modePointLabel}
				</button>
			);
		})}
	</div>
);

// ── Main panel ────────────────────────────────────────────────────────────────

const FilterPanel = () => {
	const { t, locale } = useWebGisT();
	const activePanel = useUIStore((s) => s.activePanel);
	const setActivePanel = useUIStore((s) => s.setActivePanel);
	const simpleFilter = useUIStore((s) => s.simpleFilter);
	const setSimpleFilter = useUIStore((s) => s.setSimpleFilter);
	const resetSimpleFilter = useUIStore((s) => s.resetSimpleFilter);
	const filterTarget = useUIStore((s) => s.filterTarget);
	const setFilterTarget = useUIStore((s) => s.setFilterTarget);

	const getUniqueValues = useLayersStore((s) => s.getUniqueValues);
	const [remoteFilterOptions, setRemoteFilterOptions] = useState<{
		horizontal_datum: string[];
		point_location: string[];
		status_limit: string[];
		status_point: string[];
		limit_object_type: string[];
		location_type_list: string[];
	} | null>(null);
	const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
	const [filterOptionsError, setFilterOptionsError] = useState(false);

	useEffect(() => {
		if (activePanel !== 'filter') return;

		let cancelled = false;
		const load = async () => {
			setFilterOptionsLoading(true);
			setFilterOptionsError(false);
			try {
				const data = await fetchFilterOptions();
				if (!cancelled) setRemoteFilterOptions(data);
			} catch (err) {
				console.error('Filter options load failed:', err);
				if (!cancelled) {
					setFilterOptionsError(true);
					setRemoteFilterOptions(null);
				}
			} finally {
				if (!cancelled) setFilterOptionsLoading(false);
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [activePanel]);

	const mergeOptionStrings = useCallback((remote: string[] | undefined, layerIds: readonly CoreLayerId[], field: string) => {
		const set = new Set<string>();
		for (const value of remote ?? []) {
			const s = String(value).trim();
			if (s && s !== '-') set.add(s);
		}
		for (const id of layerIds) {
			for (const v of getUniqueValues(id, field)) {
				const s = String(v).trim();
				if (s && s !== '-') set.add(s);
			}
		}
		return [...set].sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v }));
	}, [getUniqueValues]);

	const scopeLayerIds = LAYER_IDS_BY_TARGET[filterTarget];

	const horizontalDatumOptions = useMemo(
		() => mergeOptionStrings(remoteFilterOptions?.horizontal_datum, scopeLayerIds, 'horizontal_datum'),
		[mergeOptionStrings, remoteFilterOptions, scopeLayerIds],
	);

	const pointLocationOptions = useMemo(
		() => mergeOptionStrings(remoteFilterOptions?.point_location, LOCATION_LAYER_IDS, 'point_location'),
		[mergeOptionStrings, remoteFilterOptions],
	);

	const tipeBatasOptions = useMemo(
		() => getTipeBatasOptionsForTarget(locale, filterTarget),
		[locale, filterTarget],
	);
	const HIDDEN_STATUS_VALUES = new Set(['Proposed', 'Unilateral Proposed']);
	const statusOptions = useMemo(() => {
		const remote =
			filterTarget === 'limit' ? remoteFilterOptions?.status_limit : remoteFilterOptions?.status_point;
		return mergeOptionStrings(remote, scopeLayerIds, 'status')
			.filter((opt) => !HIDDEN_STATUS_VALUES.has(opt.value));
	}, [mergeOptionStrings, remoteFilterOptions, scopeLayerIds, filterTarget]);
	const [seaAreaSearch, setSeaAreaSearch] = useState('');

	useEffect(() => {
		if (filterTarget === 'limit') {
			setSeaAreaSearch('');
		}
	}, [filterTarget]);

	const filteredPointLocationOptions = useMemo(() => {
		const query = seaAreaSearch.trim().toLowerCase();
		if (!query) {
			return pointLocationOptions;
		}
		return pointLocationOptions.filter(
			(opt) =>
				simpleFilter.pointLocation.includes(opt.value) ||
				opt.label.toLowerCase().includes(query) ||
				opt.value.toLowerCase().includes(query),
		);
	}, [pointLocationOptions, seaAreaSearch, simpleFilter.pointLocation]);

	const seaAreaSearchActive = seaAreaSearch.trim().length > 0;

	const dynamicEmptyMessage = (fallback: string) => {
		if (filterOptionsLoading) return t('filter.loadingOptions');
		if (filterOptionsError) return t('filter.loadOptionsFailed');
		return fallback;
	};

	const activeCount = useMemo(
		() => activeFilterCount(simpleFilter, filterTarget),
		[simpleFilter, filterTarget],
	);

	const handleApply = useCallback(() => {
		const target = useUIStore.getState().filterTarget;
		const sf = useUIStore.getState().simpleFilter;
		const { applyFilter, clearFilter, setLayerVisibility, requestAttributeRefresh } =
			useLayersStore.getState();

		const scopedIds = LAYER_IDS_BY_TARGET[target];
		const tipeSelection = selectedTipeForTarget(sf, target);
		const hasTipeBatas = tipeSelection.length > 0;
		const hasAttributeFilter = hasAttributeFilterForTarget(sf, target);

		const mvtRefreshTargets: CoreLayerId[] = [];
		const layersWithActiveFilter = new Set<CoreLayerId>();

		// Off-target layers: clear filters and hide (no bleed from other mode).
		for (const id of ALL_CORE_IDS) {
			if (!layerInTarget(id, target)) {
				clearFilter(id);
				setLayerVisibility(id, false);
			}
		}

		for (const id of scopedIds) {
			if (!filterAppliesToLayer(sf, id, target)) {
				clearFilter(id);
				continue;
			}

			const def = buildDefinition(sf, id, target);
			if (def.conditions.length > 0) {
				applyFilter(id, def);
				layersWithActiveFilter.add(id);
				mvtRefreshTargets.push(id);
			} else {
				clearFilter(id);
			}
		}

		if (hasTipeBatas) {
			const visibilityTargets = new Set<CoreLayerId>();
			for (const tipe of tipeSelection) {
				const layerIds = TIPE_BATAS_LAYER_IDS[tipe];
				if (layerIds) for (const layerId of layerIds) visibilityTargets.add(layerId);
			}
			for (const id of scopedIds) {
				setLayerVisibility(id, visibilityTargets.has(id));
			}
		} else if (hasAttributeFilter) {
			for (const id of scopedIds) {
				setLayerVisibility(id, layersWithActiveFilter.has(id));
			}
		} else {
			for (const id of scopedIds) {
				setLayerVisibility(id, true);
			}
		}

		if (isMvtDisplayMode() && mvtRefreshTargets.length > 0) {
			requestAttributeRefresh(mvtRefreshTargets);
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
	const isLimitMode = filterTarget === 'limit';
	const tipeBatasSelected = selectedTipeForTarget(sf, filterTarget);
	const statusSelected = isLimitMode ? sf.statusLimit : sf.statusPoint;
	const validityStatusSelected = isLimitMode ? sf.validityStatusLimit : sf.validityStatusPoint;
	const validityStatusOptions = [
		{ value: 'Active', label: 'Active' },
		{ value: 'Terminated', label: 'Terminated' }
	];

	return (
		<div className={mapToolPanelClassName()}>
			{/* Classification header */}
			<div className='shrink-0 border-b border-[color:var(--color-border)]'>
				<div
					className='flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-1'
					style={{ backgroundColor: 'var(--color-panel-muted, #f7f7f4)' }}
				>
					<span className='text-[11px] font-medium tracking-wide text-[color:var(--color-muted)]'>
						{t('filter.classification')}
					</span>
					<button
						type='button'
						onClick={() => setActivePanel(null)}
						className='p-0.5 text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]'
						aria-label={t('common.closePanel')}
					>
						<X className='h-3.5 w-3.5' />
					</button>
				</div>
				<div className='flex items-baseline justify-between gap-2 px-4 py-3'>
					<div className='flex flex-col gap-0.5'>
						<h2 className='text-[15px] font-semibold leading-tight text-[color:var(--color-text)]'>
							{t('filter.title')}
						</h2>
						<p className='text-[11px] tracking-wide text-[color:var(--color-muted)]'>
							{activeCount === 0
								? t('filter.noActive')
								: t('filter.activeCount', { count: activeCount })}
						</p>
					</div>
					{activeCount > 0 && (
						<span className='border border-[color:var(--color-text)] bg-[color:var(--color-text)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[color:var(--color-panel)]'>
							{activeCount.toString().padStart(2, '0')}
						</span>
					)}
				</div>
				<div className='border-t border-[color:var(--color-border)] px-4 py-3'>
					<FilterTargetSwitcher
						target={filterTarget}
						onChange={setFilterTarget}
						modeLimitLabel={t('filter.modeLimit')}
						modePointLabel={t('filter.modePoint')}
						ariaLabel={t('filter.targetAria')}
					/>
				</div>
			</div>

			{/* Scrollable body */}
			<div className='flex-1 overflow-y-auto px-4'>
				<Section
					code='01'
					title={isLimitMode ? t('filter.sectionTipeBatas') : t('filter.sectionPointType')}
				>
					<ChipGrid
						options={tipeBatasOptions}
						selected={tipeBatasSelected}
						onToggle={(v) => {
							const other = sf.tipeBatas.filter((key) => !isTipeBatasKeyForTarget(key, filterTarget));
							const next = toggleSet(tipeBatasSelected, v);
							setSimpleFilter({ tipeBatas: [...other, ...next] });
						}}
						showLessLabel={t('common.showLess')}
						showAllLabel={(count) => t('common.showAll', { count })}
					/>
				</Section>

				<Section code='02' title={t('filter.sectionStatus')}>
					<ChipGrid
						options={statusOptions}
						selected={statusSelected}
						onToggle={(v) =>
							setSimpleFilter(
								isLimitMode
									? { statusLimit: toggleSet(sf.statusLimit, v) }
									: { statusPoint: toggleSet(sf.statusPoint, v) },
							)
						}
						emptyMessage={dynamicEmptyMessage(
							isLimitMode ? t('filter.emptyStatusLimit') : t('filter.emptyStatusPoint'),
						)}
						showLessLabel={t('common.showLess')}
						showAllLabel={(count) => t('common.showAll', { count })}
					/>
				</Section>

				<Section code='02.b' title={t('filter.sectionValidityStatus')}>
					<ChipGrid
						options={validityStatusOptions}
						selected={validityStatusSelected}
						onToggle={(v) =>
							setSimpleFilter(
								isLimitMode
									? { validityStatusLimit: toggleSet(sf.validityStatusLimit, v) }
									: { validityStatusPoint: toggleSet(sf.validityStatusPoint, v) },
							)
						}
						emptyMessage=''
						showLessLabel={t('common.showLess')}
						showAllLabel={(count) => t('common.showAll', { count })}
					/>
				</Section>

				{!isLimitMode && (
					<Section code='03' title={t('filter.sectionSeaArea')}>
						<div className='flex flex-col gap-2'>
							<input
								type='search'
								value={seaAreaSearch}
								onChange={(e) => setSeaAreaSearch(e.target.value)}
								placeholder={t('filter.seaAreaSearchPlaceholder')}
								className='w-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-2 py-1 text-[11px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-text)] focus:outline-none'
								aria-label={t('filter.seaAreaSearchPlaceholder')}
							/>
							<ChipGrid
								options={filteredPointLocationOptions}
								selected={sf.pointLocation}
								onToggle={(v) => setSimpleFilter({ pointLocation: toggleSet(sf.pointLocation, v) })}
								defaultShowCount={
									seaAreaSearchActive ? filteredPointLocationOptions.length || 6 : 6
								}
								emptyMessage={
									seaAreaSearchActive
										? t('filter.seaAreaSearchEmpty')
										: dynamicEmptyMessage(t('filter.emptyPointData'))
								}
								showLessLabel={t('common.showLess')}
								showAllLabel={(count) => t('common.showAll', { count })}
							/>
						</div>
					</Section>
				)}

				<Section code={isLimitMode ? '03' : '04'} title={t('filter.sectionDatum')}>
					<ChipGrid
						options={horizontalDatumOptions}
						selected={sf.horizontalDatum}
						onToggle={(v) => setSimpleFilter({ horizontalDatum: toggleSet(sf.horizontalDatum, v) })}
						defaultShowCount={6}
						emptyMessage={dynamicEmptyMessage(t('filter.emptyData'))}
						showLessLabel={t('common.showLess')}
						showAllLabel={(count) => t('common.showAll', { count })}
					/>
				</Section>
			</div>

			{/* Action bar */}
			<div
				className='flex shrink-0 items-stretch gap-3 border-t border-[color:var(--color-border)] p-4'
				style={{ backgroundColor: 'var(--color-panel)' }}
			>
				<button
					type='button'
					onClick={handleReset}
					className='flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[color:var(--color-border)] py-2.5 text-[11px] font-medium tracking-wide text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)] transition-colors'
				>
					<RotateCcw className='h-3 w-3' />
					{t('filter.reset')}
				</button>
				<button
					type='button'
					onClick={handleApply}
					className='flex flex-[2] items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-text)] py-2.5 text-[11px] font-semibold tracking-wide text-[color:var(--color-panel)] shadow-md hover:opacity-90 transition-opacity'
				>
					{t('filter.apply')}
				</button>
			</div>
		</div>
	);
};

export default FilterPanel;
