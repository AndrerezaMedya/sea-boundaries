import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { LAYER_GROUPS } from '@/lib/schema';
import type { CoreLayerId } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';

type SymbolConfig = { color: string; type: 'circle' | 'line' | 'fill'; dashArray?: string };

const LAYER_SYMBOLS: Record<CoreLayerId, SymbolConfig> = {
	basepoints: { color: '#475569', type: 'circle' },
	baseline: { color: '#1e293b', type: 'line', dashArray: '1 3' },
	laut_teritorial_sepakat: { color: '#1d4ed8', type: 'line' },
	laut_teritorial_perlu: { color: '#6366f1', type: 'line', dashArray: '4 2' },
	zee_sepakat: { color: '#15803d', type: 'line' },
	zee_sepakat_ratif: { color: '#22c55e', type: 'line', dashArray: '4 2' },
	zee_perlu: { color: '#84cc16', type: 'line', dashArray: '2 2' },
	landas_kontinen_sepakat: { color: '#92400e', type: 'line' },
	landas_kontinen_sepakat_ratif: { color: '#c2410c', type: 'line', dashArray: '4 2' },
	landas_kontinen_perlu: { color: '#f59e0b', type: 'line', dashArray: '2 2' },
	landas_kontinen_ekstensi: { color: '#f97316', type: 'fill' },
	zona_tambahan: { color: '#0891b2', type: 'line' },
	titik_perjanjian_lt: { color: '#3730a3', type: 'circle' },
	titik_perjanjian_lk: { color: '#78350f', type: 'circle' },
	titik_perjanjian_zee: { color: '#0d9488', type: 'circle' },
};

const LayerSymbol = ({ layerId }: { layerId: CoreLayerId }) => {
	const sym = LAYER_SYMBOLS[layerId];
	if (sym.type === 'circle') {
		return (
			<div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
				<div
					className='h-3 w-3 rounded-full border-[1.5px] border-white shadow-sm'
					style={{ backgroundColor: sym.color }}
				/>
			</div>
		);
	}
	if (sym.type === 'fill') {
		return (
			<div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
				<div
					className='h-3.5 w-3.5 rounded-sm border border-white opacity-80'
					style={{ backgroundColor: sym.color }}
				/>
			</div>
		);
	}
	return (
		<div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>
			<svg width='16' height='20' viewBox='0 0 16 20' className='overflow-visible'>
				<line
					x1='0' y1='10' x2='16' y2='10'
					stroke={sym.color}
					strokeWidth='2.2'
					strokeDasharray={sym.dashArray}
					strokeLinecap='round'
				/>
			</svg>
		</div>
	);
};

// Build initial expanded state from group defaults
const buildInitialExpanded = () => {
	const result: Record<string, boolean> = {};
	for (const g of LAYER_GROUPS) result[g.id] = g.defaultExpanded ?? true;
	return result;
};

type LayerTogglesProps = { compact?: boolean };

const LayerToggles = ({ compact: _compact = false }: LayerTogglesProps) => {
	const [expanded, setExpanded] = useState<Record<string, boolean>>(buildInitialExpanded);

	const layers = useLayersStore((s) => s.layers);
	const activeLayerId = useLayersStore((s) => s.activeLayerId);
	const setActiveLayer = useLayersStore((s) => s.setActiveLayer);
	const setLayerVisibility = useLayersStore((s) => s.setLayerVisibility);

	const toggleGroup = (groupId: string) =>
		setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

	const groupMasterVisible = (groupId: string) => {
		const group = LAYER_GROUPS.find((g) => g.id === groupId);
		if (!group) return false;
		return group.entries.every((e) => layers[e.layerId]?.visible ?? false);
	};

	const handleGroupMaster = (groupId: string, on: boolean) => {
		const group = LAYER_GROUPS.find((g) => g.id === groupId);
		if (!group) return;
		for (const entry of group.entries) setLayerVisibility(entry.layerId, on);
	};

	return (
		<div className='space-y-1.5'>
			{LAYER_GROUPS.map((group) => {
				const isOpen = expanded[group.id] ?? true;
				const allVisible = groupMasterVisible(group.id);

				return (
					<div key={group.id} className='rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] shadow-sm overflow-hidden'>
						{/* ── Group Header ── */}
						<div className='flex items-center gap-2 px-3 py-2.5'>
							{/* Expand toggle */}
							<button
								type='button'
								onClick={() => toggleGroup(group.id)}
								className='flex items-center gap-1.5 flex-1 min-w-0 text-left'
								aria-expanded={isOpen}
							>
								<span
									className='h-2.5 w-2.5 flex-shrink-0 rounded-full'
									style={{ backgroundColor: group.color }}
								/>
								<span className='text-sm font-semibold text-[color:var(--color-text)] truncate'>
									{group.label}
								</span>
								<span className='ml-1 text-xs text-[color:var(--color-muted)] tabular-nums'>
									({group.entries.length})
								</span>
								<span className='ml-auto text-[color:var(--color-muted)]'>
									{isOpen
										? <ChevronDown size={14} />
										: <ChevronRight size={14} />}
								</span>
							</button>
							{/* Master visibility switch */}
							<Switch
								checked={allVisible}
								onCheckedChange={(checked) => handleGroupMaster(group.id, checked)}
								aria-label={`Tampilkan/sembunyikan semua layer ${group.label}`}
							/>
						</div>

						{/* ── Sub-layer rows ── */}
						{isOpen && (
							<div className='border-t border-[color:var(--color-border)] divide-y divide-[color:var(--color-border)]'>
								{group.entries.map(({ layerId, sublabel }) => {
									const layerState = layers[layerId];
									if (!layerState) return null;
									const isActive = activeLayerId === layerId;
									const isVisible = layerState.visible;

									return (
										<div
											key={layerId}
											className={`flex items-center gap-2 pl-5 pr-3 py-2 transition-colors ${isActive ? 'bg-[color:var(--color-panel-elevated)]' : 'hover:bg-[color:var(--color-panel-elevated)]/40'}`}
										>
											<LayerSymbol layerId={layerId} />
											<button
												type='button'
												onClick={() => setActiveLayer(layerId)}
												className='flex-1 min-w-0 text-left'
											>
												<span className={`text-xs ${isActive ? 'font-semibold text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-muted)]'}`}>
													{sublabel}
												</span>
											</button>
											<Switch
												checked={isVisible}
												onCheckedChange={(checked) => setLayerVisibility(layerId, checked)}
												aria-label={`Tampilkan/sembunyikan ${sublabel}`}
											/>
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default LayerToggles;

