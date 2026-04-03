import type { Map as MapLibreMap, MapLayerMouseEvent, Popup } from 'maplibre-gl';

import { buildPopupHtml } from '@/lib/map';
import { getLayerSchema } from '@/lib/schema';
import type { FeatureWithProps, LayerId } from '@/lib/types';

const popupButtonClass =
	'inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

interface FeatureClickHandlerDeps {
	getMap: () => MapLibreMap | null;
	getPopup: () => Popup | null;
	getCurrentSelectionIds: (layerId: LayerId) => string[];
	setSelection: (layerId: LayerId, featureIds: string[]) => void;
	setActiveLayer: (layerId: LayerId) => void;
	requestZoomToIds: (layerId: LayerId, featureIds: string[], padding?: number) => void;
	openFeatureDetail: (layerId: LayerId, featureId: string) => void;
}

export const createFeatureClickHandler = (deps: FeatureClickHandlerDeps) => {
	return (layerId: LayerId, event: MapLayerMouseEvent) => {
		const mapInstance = deps.getMap();
		const popupInstance = deps.getPopup();
		if (!mapInstance || !popupInstance) {
			return;
		}
		const feature = event.features?.[0] as FeatureWithProps | undefined;
		if (!feature || feature.id === undefined || feature.id === null) {
			popupInstance.remove();
			return;
		}

		const schema = getLayerSchema(layerId);
		const properties = feature.properties ?? {};
		const featureId =
			properties[schema.primaryKey] !== undefined && properties[schema.primaryKey] !== null
				? String(properties[schema.primaryKey])
				: String(feature.id);

		const currentSelection = deps.getCurrentSelectionIds(layerId);
		const isAlreadySelected = currentSelection.includes(featureId);
		if (!isAlreadySelected || currentSelection.length > 1) {
			deps.setSelection(layerId, [featureId]);
		}
		deps.setActiveLayer(layerId);

		const popupHtml = `
			<div class="popup-content">
				${buildPopupHtml(layerId, feature.properties ?? {})}
				<div class="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
					<button class="${popupButtonClass}" data-action="detail" data-layer="${layerId}" data-id="${featureId}" title="Buka detail lengkap atribut fitur">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
						Lihat di Tabel Atribut
					</button>
					<button class="${popupButtonClass}" data-action="zoom" data-layer="${layerId}" data-id="${featureId}" title="Zoom ke fitur ini">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
						Zoom
					</button>
				</div>
			</div>
		`;
		popupInstance.setLngLat(event.lngLat).setHTML(popupHtml).addTo(mapInstance);

		const element = popupInstance.getElement();
		const handlePopupClick = (popupEvent: MouseEvent) => {
			const target = popupEvent.target as HTMLElement | null;
			if (!target) {
				return;
			}
			const button = target.closest<HTMLButtonElement>('[data-action]');
			if (!button) {
				return;
			}
			const action = button.dataset.action;
			const id = button.dataset.id;
			const layer = button.dataset.layer as LayerId | undefined;
			if (!action || !id || !layer) {
				return;
			}
			if (action === 'zoom') {
				deps.requestZoomToIds(layer, [id], 160);
			}
			if (action === 'detail') {
				deps.openFeatureDetail(layer, id);
				popupInstance.remove();
			}
		};
		element.addEventListener('click', handlePopupClick);
		popupInstance.once('close', () => {
			element.removeEventListener('click', handlePopupClick);
		});
	};
};
