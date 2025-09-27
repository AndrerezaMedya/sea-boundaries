import { Radio, Layers, Eye, EyeOff } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { LAYER_DISPLAY_ORDER, getLayerSchema } from '@/lib/schema';
import type { LayerId } from '@/lib/types';
import { USER_LAYER_ID } from '@/lib/types';
import { useLayersStore } from '@/store/useLayers';

const LayerToggles = () => {
	const layers = useLayersStore((state) => state.layers);
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	const setActiveLayer = useLayersStore((state) => state.setActiveLayer);
	const setLayerVisibility = useLayersStore((state) => state.setLayerVisibility);
	const userLayerMeta = useLayersStore((state) => state.userLayerMeta);

	const handleVisibilityChange = (layerId: LayerId, visible: boolean) => {
		setLayerVisibility(layerId, visible);
	};

	return (
		<div className='space-y-3'>
			{[...LAYER_DISPLAY_ORDER, USER_LAYER_ID].map((layerId) => {
				const schema = getLayerSchema(layerId);
				const layerState = layers[layerId];
				if (!layerState) {
					return null;
				}
				const featureCount = layerState.data.features.length;
				const isActive = activeLayerId === layerId;
				const isVisible = layerState.visible;
				const isUserLayer = layerId === USER_LAYER_ID;
				const userLoaded = !isUserLayer || userLayerMeta.loaded;
				return (
					<div
						key={layerId}
						className='flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md'
					>
						<button
							type='button'
							onClick={() => userLoaded && setActiveLayer(layerId)}
							className={`flex h-9 w-9 items-center justify-center rounded-full border ${
								isActive ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-500'
							}`}
							aria-label={`Pilih ${schema.label} sebagai layer aktif`}
							disabled={!userLoaded}
						>
							<Radio className='h-4 w-4' />
						</button>
						<div className='flex flex-1 flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<span className='text-sm font-semibold text-slate-900'>{schema.label}</span>
								<span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500'>
									<Layers className='h-3.5 w-3.5' />
									{schema.geometryType}
								</span>
							</div>
							<p className='text-xs text-slate-500'>
								{isUserLayer && !userLayerMeta.loaded ? 'Belum ada data pengguna yang dimuat.' : schema.description}
							</p>
							<p className='text-[11px] font-medium text-slate-400'>
								{featureCount.toLocaleString('id-ID')} fitur tersedia
							</p>
						</div>
						<div className='flex items-center gap-2'>
							{isVisible ? <Eye className='h-4 w-4 text-slate-400' /> : <EyeOff className='h-4 w-4 text-slate-400' />}
							<Switch
								checked={isVisible}
								onCheckedChange={(checked) => handleVisibilityChange(layerId, checked)}
								aria-label={`Tampilkan/ sembunyikan layer ${schema.label}`}
								disabled={!userLoaded}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default LayerToggles;
