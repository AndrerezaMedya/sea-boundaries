import type { Map as MapLibreMap, MapLayerMouseEvent, Popup } from 'maplibre-gl';

import { isTitikPerjanjianLayer, resolveTitikPerjanjianLayerId } from '@/lib/agreementPointKind';
import { readFeatureRowId } from '@/lib/featureId';
import { getActiveLocale } from '@/i18n/locale';
import { t } from '@/i18n/translate';
import { buildPopupHtml } from '@/lib/map';
import { normaliseFeatureProperties } from '@/lib/featureId';
import type { CoreLayerId, FeatureWithProps, LayerId } from '@/lib/types';

const popupButtonClass =
	'inline-flex flex-1 justify-center items-center gap-1.5 rounded-full bg-[color:var(--color-panel-muted)] px-3 py-2 text-[11px] font-bold text-[color:var(--color-text)] shadow-sm transition-all duration-200 hover:bg-[color:var(--color-accent-soft)] hover:text-[color:var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]';

interface FeatureClickHandlerDeps {
	getMap: () => MapLibreMap | null;
	getPopup: () => Popup | null;
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
		if (!feature) {
			popupInstance.remove();
			return;
		}

		const properties = normaliseFeatureProperties(feature.properties ?? {});
		const fuid = String(properties.fuid ?? '');
		const displayLayer: LayerId = isTitikPerjanjianLayer(layerId)
			? resolveTitikPerjanjianLayerId(fuid, layerId as CoreLayerId)
			: layerId;
		const featureId = readFeatureRowId(displayLayer, properties);

		// Track selection for attribute table / detail — without changing map symbology.
		deps.setSelection(displayLayer, [featureId]);
		deps.setActiveLayer(displayLayer);

		const locale = getActiveLocale();
		const popupHtml = `
			<div class="popup-content">
				${buildPopupHtml(displayLayer, properties, locale)}
				<div class="mt-4 flex flex-wrap gap-2">
					<button class="${popupButtonClass}" data-action="detail" data-layer="${displayLayer}" data-id="${featureId}" title="${t(locale, 'popup.detailTitle')}">
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
						${t(locale, 'popup.detail')}
					</button>
					<button class="${popupButtonClass}" data-action="zoom" data-layer="${displayLayer}" data-id="${featureId}" title="${t(locale, 'popup.zoomTitle')}">
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
						${t(locale, 'popup.zoom')}
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
