import { Switch } from '@/components/ui/switch';
import { LAYER_DISPLAY_ORDER, getLayerSchema } from '@/lib/schema';
import type { LayerId } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';

type LayerTogglesProps = {
	compact?: boolean;
};

// Konfigurasi simbol dan warna untuk setiap layer
const LAYER_SYMBOLS: Record<
	LayerId,
	{ color: string; type: 'point' | 'line'; dashArray?: string }
> = {
	basepoints: { color: '#1d4ed8', type: 'point' },
	baseline: { color: '#1e293b', type: 'line', dashArray: '1 3' }, // Kesepakatan belum ratifikasi
	titik_perjanjian: { color: '#0ea5e9', type: 'point' },
	batas_maritim: { color: '#64748b', type: 'line', dashArray: '5 3' }, // Perlu Kesepakatan
	laut_teritorial: { color: '#2563eb', type: 'line' }, // Solid
	zee: { color: '#16a34a', type: 'line' }, // Solid
	landas_kontinen: { color: '#f59e0b', type: 'line', dashArray: '1 2' }, // Unilateral
	user_layer: { color: '#14b8a6', type: 'point' },
};

const LayerSymbol = ({ layerId }: { layerId: LayerId; isActive: boolean }) => {
	const symbol = LAYER_SYMBOLS[layerId];

	if (symbol.type === 'point') {
		return (
			<div
				className='flex h-5 w-5 items-center justify-center'
			>
				<div
					className='h-3 w-3 rounded-full border-2 border-white shadow-sm'
					style={{ backgroundColor: symbol.color }}
				/>
			</div>
		);
	}

	// Line symbol
	return (
		<div className='flex h-5 w-5 items-center justify-center'>
			<svg width='16' height='20' viewBox='0 0 16 20' className='overflow-visible'>
				<line
					x1='0'
					y1='10'
					x2='16'
					y2='10'
					stroke={symbol.color}
					strokeWidth='2'
					strokeDasharray={symbol.dashArray}
					strokeLinecap='round'
				/>
			</svg>
		</div>
	);
};

const LayerToggles = ({ compact: _compact = false }: LayerTogglesProps) => {
	const layers = useLayersStore((state) => state.layers);
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	const setActiveLayer = useLayersStore((state) => state.setActiveLayer);
	const setLayerVisibility = useLayersStore((state) => state.setLayerVisibility);

	const handleVisibilityChange = (layerId: LayerId, visible: boolean) => {
		setLayerVisibility(layerId, visible);
	};

	return (
		<div className='space-y-2'>
			{LAYER_DISPLAY_ORDER.map((layerId) => {
				const schema = getLayerSchema(layerId);
				const layerState = layers[layerId];
				if (!layerState) {
					return null;
				}
				const isActive = activeLayerId === layerId;
				const isVisible = layerState.visible;

				return (
					<div
						key={layerId}
						className={`group flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md ${isActive ? 'border-blue-500 bg-blue-50/30 shadow-md' : 'border-slate-200'
							}`}
					>
						{/* Layer Symbol */}
						<LayerSymbol layerId={layerId} isActive={isActive} />

						{/* Layer Name */}
						<button
							type='button'
							onClick={() => setActiveLayer(layerId)}
							className='flex-1 text-left'
						>
							<span className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
								{schema.label}
							</span>
						</button>

						{/* Visibility Toggle */}
						<Switch
							checked={isVisible}
							onCheckedChange={(checked) => handleVisibilityChange(layerId, checked)}
							aria-label={`Tampilkan/sembunyikan layer ${schema.label}`}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default LayerToggles;
