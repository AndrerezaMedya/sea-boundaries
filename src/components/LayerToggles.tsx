import { ChevronDown } from 'lucide-react';

import { useState } from 'react';

import { Switch } from '@/components/ui/switch';

import { EASY_READ_COLORS } from '@/components/map/ihoSymbology';

import { getGroupLabel, getSublayerLabel } from '@/i18n/webgis-catalog';
import { useWebGisT } from '@/i18n/useWebGisT';
import { LAYER_GROUPS } from '@/lib/schema';

import type { CoreLayerId } from '@/lib/types';

import { useLayersStore } from '@/store/useLayersStore';

import { useGeoResultStore } from '@/store/useGeoResult';

import { useUIStore } from '@/store/useUI';



type SymbolConfig = { color: string; type: 'circle' | 'line' | 'fill'; dashArray?: string };



const LAYER_SYMBOLS: Record<CoreLayerId, SymbolConfig> = {
	basepoints: { color: '#475569', type: 'circle' },
	basepoints_2026: { color: '#0ea5e9', type: 'circle' },
	titik_referensi: { color: '#dc2626', type: 'circle' },
	landas_kontinen_ekstensi: { color: EASY_READ_COLORS.landas_kontinen_ekstensi, type: 'line' },
	titik_perjanjian_lt: { color: '#3730a3', type: 'circle' },
	titik_perjanjian_lk: { color: '#78350f', type: 'circle' },
	titik_perjanjian_zee: { color: '#0d9488', type: 'circle' },
	territorial_sea: { color: EASY_READ_COLORS.territorial_sea, type: 'line' },
	contiguous_zone: { color: EASY_READ_COLORS.contiguous_zone, type: 'line' },
	eez_limit: { color: EASY_READ_COLORS.eez_limit, type: 'line' },
	continental_shelf: { color: EASY_READ_COLORS.continental_shelf, type: 'line' },
	fisheries: { color: EASY_READ_COLORS.fisheries, type: 'line', dashArray: '4 2' },
	baseline: { color: EASY_READ_COLORS.baseline, type: 'line' },
};



const LayerSymbol = ({ layerId, isIhoMode }: { layerId: CoreLayerId; isIhoMode?: boolean }) => {

	const sym = LAYER_SYMBOLS[layerId];



	const isLimit = sym.type === 'line';

	const effectiveColor = isIhoMode && isLimit ? '#7a3f8f' : sym.color;

	const effectiveDash = isIhoMode && isLimit ? undefined : sym.dashArray;



	if (sym.type === 'circle') {

		return (

			<span className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>

				<span

					className='h-2.5 w-2.5 rounded-full ring-2 ring-white'

					style={{ backgroundColor: effectiveColor, boxShadow: `0 0 0 1px ${effectiveColor}40` }}

				/>

			</span>

		);

	}

	if (sym.type === 'fill') {

		return (

			<span className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>

				<span

					className='h-3 w-3 rounded-[3px]'

					style={{

						backgroundColor: `${effectiveColor}cc`,

						border: `1px solid ${effectiveColor}`,

					}}

				/>

			</span>

		);

	}

	return (

		<span className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>

			<svg width='16' height='16' viewBox='0 0 16 16'>

				<line

					x1='1'

					y1='8'

					x2='15'

					y2='8'

					stroke={effectiveColor}

					strokeWidth='2.5'

					strokeDasharray={effectiveDash}

					strokeLinecap='round'

				/>

			</svg>

		</span>

	);

};



const buildInitialExpanded = () => {

	const result: Record<string, boolean> = {};

	for (const g of LAYER_GROUPS) {

		if (g.entries.length > 1) {

			result[g.id] = g.defaultExpanded ?? true;

		}

	}

	return result;

};



const groupAccentColor = (groupId: string, groupColor: string, isIhoMode: boolean) => {
	if (isIhoMode && !['titik_perjanjian', 'basepoints', 'user_layer'].includes(groupId)) return '#7a3f8f';
	const easyReadKey = groupId as keyof typeof EASY_READ_COLORS;
	if (!isIhoMode && (easyReadKey in EASY_READ_COLORS)) return EASY_READ_COLORS[easyReadKey];
	return groupColor;
};



type LayerRowProps = {

	layerId: CoreLayerId;

	label: string;

	isActive: boolean;

	isVisible: boolean;

	isIhoMode: boolean;

	onSelect: () => void;

	onVisibilityChange: (visible: boolean) => void;

};



const LayerRow = ({

	layerId,

	label,

	isActive,

	isVisible,

	isIhoMode,

	onSelect,

	onVisibilityChange,

}: LayerRowProps) => {
	const { t } = useWebGisT();

	return (
	<div

		className='group flex items-center gap-2 py-1'

		style={

			isActive

				? { borderLeft: '2px solid var(--color-accent)', paddingLeft: '6px', marginLeft: '-8px' }

				: { borderLeft: '2px solid transparent', paddingLeft: '6px', marginLeft: '-8px' }

		}

	>

		<LayerSymbol layerId={layerId} isIhoMode={isIhoMode} />

		<button type='button' onClick={onSelect} className='min-w-0 flex-1 text-left'>

			<span

				className={`block truncate text-[12px] ${

					isActive

						? 'font-medium text-[color:var(--color-text)]'

						: isVisible

							? 'text-[color:var(--color-text)]'

							: 'text-[color:var(--color-muted)]'

				}`}

			>

				{label}

			</span>

		</button>

		<Switch

			checked={isVisible}

			onCheckedChange={onVisibilityChange}

			aria-label={t('layerPanel.toggleVisibility', { label })}

		/>

	</div>
	);
};



const LayerToggles = () => {
	const { t, locale } = useWebGisT();
	const [expanded, setExpanded] = useState<Record<string, boolean>>(buildInitialExpanded);



	const layers = useLayersStore((s) => s.layers);

	const activeLayerId = useLayersStore((s) => s.activeLayerId);

	const setActiveLayer = useLayersStore((s) => s.setActiveLayer);

	const setLayerVisibility = useLayersStore((s) => s.setLayerVisibility);



	const symbologyMode = useUIStore((s) => s.symbologyMode);

	const isIhoMode = symbologyMode === 'iho';

	const geoResultCollection = useGeoResultStore((s) => s.collection);

	const geoResultVisible = useGeoResultStore((s) => s.visible);

	const setGeoResultVisible = useGeoResultStore((s) => s.setVisible);



	const toggleGroup = (groupId: string) =>

		setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));



	const groupVisibilityState = (groupId: string): 'all' | 'some' | 'none' => {

		const group = LAYER_GROUPS.find((g) => g.id === groupId);

		if (!group) return 'none';

		const visibleCount = group.entries.filter((e) => layers[e.layerId]?.visible).length;

		if (visibleCount === 0) return 'none';

		if (visibleCount === group.entries.length) return 'all';

		return 'some';

	};



	const handleGroupMaster = (groupId: string, on: boolean) => {

		const group = LAYER_GROUPS.find((g) => g.id === groupId);

		if (!group) return;

		for (const entry of group.entries) setLayerVisibility(entry.layerId, on);

	};



	return (

		<div className='space-y-2'>

			{LAYER_GROUPS.map((group) => {
				const groupLabel = getGroupLabel(group.id, locale, group.label);
				const isCollapsible = group.entries.length > 1;

				const accent = groupAccentColor(group.id, group.color, isIhoMode);



				if (!isCollapsible) {

					const { layerId } = group.entries[0];

					const layerState = layers[layerId];

					if (!layerState) return null;



					return (

						<div

							key={group.id}

							className='flex items-center gap-2 border-b py-1'

							style={{ borderColor: 'var(--color-border)' }}

						>

							<span className='h-3 w-[3px] flex-shrink-0' style={{ backgroundColor: accent }} aria-hidden />

							<LayerSymbol layerId={layerId} isIhoMode={isIhoMode} />

							<button

								type='button'

								onClick={() => setActiveLayer(layerId)}

								className='min-w-0 flex-1 text-left'

							>

								<span

									className={`block truncate text-[12px] font-semibold ${

										activeLayerId === layerId

											? 'text-[color:var(--color-text)]'

											: layerState.visible

												? 'text-[color:var(--color-text)]'

												: 'text-[color:var(--color-muted)]'

									}`}

								>

									{groupLabel}

								</span>

							</button>

							<Switch

								checked={layerState.visible}

								onCheckedChange={(checked) => setLayerVisibility(layerId, checked)}

								aria-label={t('layerPanel.toggleVisibility', { label: groupLabel })}

							/>

						</div>

					);

				}



				const isOpen = expanded[group.id] ?? true;

				const visState = groupVisibilityState(group.id);

				const visibleCount = group.entries.filter((e) => layers[e.layerId]?.visible).length;



				return (

					<div key={group.id}>

						<div

							className='flex items-center gap-2 py-1'

							style={{ borderBottom: '1px solid var(--color-border)' }}

						>

							<span className='h-3 w-[3px] flex-shrink-0' style={{ backgroundColor: accent }} aria-hidden />

							<button

								type='button'

								onClick={() => toggleGroup(group.id)}

								className='flex min-w-0 flex-1 items-center gap-1.5 text-left'

								aria-expanded={isOpen}

							>

								<ChevronDown

									size={11}

									className={`flex-shrink-0 text-[color:var(--color-muted)] transition-transform ${isOpen ? '' : '-rotate-90'}`}

								/>

								<span className='truncate text-[12px] font-semibold text-[color:var(--color-text)]'>

									{groupLabel}

								</span>

								<span className='text-[11px] tabular-nums text-[color:var(--color-muted)]'>

									{visibleCount}/{group.entries.length}

								</span>

							</button>

							<Switch

								checked={visState === 'all'}

								onCheckedChange={(checked) => handleGroupMaster(group.id, checked)}

								aria-label={t('layerPanel.toggleVisibility', { label: groupLabel })}

							/>

						</div>



						{isOpen && (

							<div className='pl-3'>

								{group.entries.map(({ layerId, sublabel }) => {

									const layerState = layers[layerId];

									if (!layerState) return null;



									return (

										<LayerRow

											key={layerId}

											layerId={layerId}

											label={getSublayerLabel(layerId, locale, sublabel)}

											isActive={activeLayerId === layerId}

											isVisible={layerState.visible}

											isIhoMode={isIhoMode}

											onSelect={() => setActiveLayer(layerId)}

											onVisibilityChange={(checked) => setLayerVisibility(layerId, checked)}

										/>

									);

								})}

							</div>

						)}

					</div>

				);

			})}

			{geoResultCollection && geoResultCollection.features.length > 0 && (
				<div
					className='mt-3 flex items-center gap-2 border-t border-[color:var(--color-border)] pt-3'
				>
					<span className='flex h-4 w-4 flex-shrink-0 items-center justify-center'>
						<span
							className='h-2.5 w-2.5 rounded-full ring-2 ring-white'
							style={{ backgroundColor: '#d97706', boxShadow: '0 0 0 1px #d9770640' }}
						/>
					</span>
					<span className='min-w-0 flex-1 truncate text-xs text-[color:var(--color-text)]'>
						{t('geo.resultLayerLabel')}
					</span>
					<Switch
						checked={geoResultVisible}
						onCheckedChange={setGeoResultVisible}
						aria-label={t('geo.showResultLayer')}
					/>
				</div>
			)}

		</div>

	);

};



export default LayerToggles;


