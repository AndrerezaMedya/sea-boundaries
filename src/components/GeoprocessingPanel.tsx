import { useEffect, useMemo, useState } from 'react';
import bbox from '@turf/bbox';
import type { FeatureCollection, Geometry } from 'geojson';

import { getLayerLabel } from '@/i18n/webgis-catalog';
import { useWebGisT } from '@/i18n/useWebGisT';
import {
	geoBuffer,
	geoMeasure,
	fetchGeoInfo,
	parseGeoApiError,
	type GeoFeatureCollectionResponse,
	type GeoInfo,
} from '@/lib/geoApi';
import {
	layersForGeoOperation,
	isPointLayer,
	type GeoprocessingOperation,
} from '@/lib/geoLayerCatalog';
import { selectionDisplayIds, selectionToGeoScope } from '@/lib/geoSelection';
import { km2ToNauticalMilesSquared, kmToNauticalMiles, nauticalMilesToKm } from '@/lib/geoUnits';
import type { CoreLayerId } from '@/lib/types';
import { useGeoResultStore } from '@/store/useGeoResult';
import { useLayersStore } from '@/store/useLayersStore';
import { Switch } from '@/components/ui/switch';

const GEO_OP_KEYS: GeoprocessingOperation[] = ['length', 'area', 'buffer'];

interface OperationConfig {
	label: string;
	description: string;
	parameterType?: 'distance';
}

const buildOperations = (t: (key: string) => string): Record<GeoprocessingOperation, OperationConfig> => ({
	length: {
		label: t('geo.ops.length.label'),
		description: t('geo.ops.length.description'),
	},
	area: {
		label: t('geo.ops.area.label'),
		description: t('geo.ops.area.description'),
	},
	buffer: {
		label: t('geo.ops.buffer.label'),
		description: t('geo.ops.buffer.description'),
		parameterType: 'distance',
	},
});

function formatGeoError(
	message: string,
	t: (key: string, vars?: Record<string, string | number>) => string,
): string {
	const { code } = parseGeoApiError(message);
	switch (code) {
		case 'GEO_NO_FEATURES':
			return t('geo.errors.noFeatures');
		case 'GEO_UNSUPPORTED_LAYER':
		case 'GEO_LINE_LAYER_REQUIRED':
			return t('geo.errors.unsupportedLayer');
		case 'GEO_BUFFER_TOO_LARGE':
			return t('geo.errors.bufferTooLarge');
		case 'GEO_INFO_FAILED':
		case 'DISPLAY_TOKEN_REQUIRED':
			return t('geo.errors.backendUnavailable');
		default:
			return parseGeoApiError(message).detail || message;
	}
}

const SelectMenu = ({
	value,
	onChange,
	options,
	placeholder
}: {
	value: string;
	onChange: (v: string) => void;
	options: { value: string; label: string }[];
	placeholder: string;
}) => {
	const [open, setOpen] = useState(false);
	const selectedOption = options.find(o => o.value === value);

	useEffect(() => {
		if (!open) return;
		const handle = () => setOpen(false);
		window.addEventListener('click', handle);
		return () => window.removeEventListener('click', handle);
	}, [open]);

	return (
		<div className="relative" onClick={(e) => e.stopPropagation()}>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel-muted)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--color-text)] shadow-sm transition-all hover:border-[color:var(--color-text)] focus:border-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text)]"
			>
				<span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
				<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='2' stroke='currentColor' className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
					<path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
				</svg>
			</button>
			{open && (
				<div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-panel)] py-1.5 shadow-xl max-h-60 overflow-auto">
					{options.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => {
								onChange(opt.value);
								setOpen(false);
							}}
							className={`w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-[color:var(--color-panel-muted)] ${value === opt.value ? 'font-semibold text-[color:var(--color-text)] bg-[color:var(--color-panel-muted)]' : 'text-[color:var(--color-text)]'
								}`}
						>
							{opt.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

const GeoprocessingPanel = () => {
	const { t, locale } = useWebGisT();
	const operations = useMemo(() => buildOperations(t), [t]);

	const layers = useLayersStore((state) => state.layers);
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	const requestZoomToBounds = useLayersStore((state) => state.requestZoomToBounds);
	const setGeoResult = useGeoResultStore((s) => s.setCollection);
	const clearGeoResult = useGeoResultStore((s) => s.clear);
	const geoResultCollection = useGeoResultStore((s) => s.collection);
	const geoResultVisible = useGeoResultStore((s) => s.visible);
	const setGeoResultVisible = useGeoResultStore((s) => s.setVisible);

	const [selectedOperation, setSelectedOperation] = useState<GeoprocessingOperation | null>(null);
	const [inputLayer, setInputLayer] = useState<CoreLayerId>('eez_limit');
	const [parameter, setParameter] = useState<string>('12');
	const [result, setResult] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);
	const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
	const [geoInfoError, setGeoInfoError] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void fetchGeoInfo()
			.then((info) => {
				if (!cancelled) {
					setGeoInfo(info);
					setGeoInfoError(false);
				}
			})
			.catch(() => {
				if (!cancelled) setGeoInfoError(true);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const layerOptions = useMemo(
		() => layersForGeoOperation(selectedOperation),
		[selectedOperation],
	);

	// Ikuti layer aktif saat user mengklik fitur di peta (hindari operasi layer yang salah).
	useEffect(() => {
		if (!selectedOperation) return;
		const active = activeLayerId as CoreLayerId;
		if (layerOptions.includes(active)) {
			setInputLayer(active);
		}
	}, [activeLayerId, selectedOperation, layerOptions]);

	useEffect(() => {
		if (!layerOptions.includes(inputLayer)) {
			setInputLayer(layerOptions[0] ?? 'eez_limit');
		}
	}, [layerOptions, inputLayer]);

	// Pakai seleksi dari layer aktif di peta jika ada — hindari buffer layer dropdown yang tidak punya pilihan.
	const effectiveInputLayer = useMemo((): CoreLayerId => {
		const active = activeLayerId as CoreLayerId;
		const activeState = layers[active];
		if (
			activeState?.selectionIds?.length &&
			layerOptions.includes(active)
		) {
			return active;
		}
		return inputLayer;
	}, [activeLayerId, layers, inputLayer, layerOptions]);

	const inputLayerState = layers[effectiveInputLayer];
	const dropdownLayerState = layers[inputLayer];
	const geoSelection = useMemo(
		() => selectionToGeoScope(effectiveInputLayer, inputLayerState),
		[effectiveInputLayer, inputLayerState],
	);
	const selectedIds = useMemo(
		() => selectionDisplayIds(inputLayerState),
		[inputLayerState],
	);

	const inputLayerMismatch =
		effectiveInputLayer !== inputLayer &&
		(dropdownLayerState?.selectionIds?.length ?? 0) === 0 &&
		(inputLayerState?.selectionIds?.length ?? 0) > 0;

	const selectionKey = inputLayerState?.selectionIds?.join('|') ?? '';

	useEffect(() => {
		clearGeoResult();
		setResult(null);
	}, [selectionKey, effectiveInputLayer, clearGeoResult]);

	const maxBufferNm =
		geoInfo?.maxBufferKm != null ? kmToNauticalMiles(geoInfo.maxBufferKm) : undefined;

	const scopeHint =
		selectedIds.length > 0
			? t('geo.selectionHint', { count: selectedIds.length })
			: t('geo.wholeLayerHint');

	const formatSelectedIdLine = (entry: { fuid: string; segment?: string }) =>
		entry.segment ? `${entry.fuid} · ${entry.segment}` : entry.fuid;

	const zoomToCollection = (collection: FeatureCollection<Geometry, Record<string, unknown>>) => {
		try {
			const bounds = bbox(collection);
			if (bounds.every(Number.isFinite)) {
				requestZoomToBounds(bounds as [number, number, number, number], 80);
			}
		} catch {
			// ignore
		}
	};

	const handleProcess = async () => {
		if (!selectedOperation) return;

		setProcessing(true);
		setResult(null);

		try {
			if (geoInfoError || (geoInfo && geoInfo.bboxRequired)) {
				setResult(`❌ ${t('geo.errors.backendOutdated')}`);
				return;
			}

			if (
				(selectedOperation === 'length' || selectedOperation === 'area') &&
				isPointLayer(effectiveInputLayer)
			) {
				setResult(
					`❌ ${selectedOperation === 'length' ? t('geo.errors.lengthOnPoints') : t('geo.errors.areaOnPoints')}`,
				);
				return;
			}

			if (selectedOperation === 'length' || selectedOperation === 'area') {
				const measure = await geoMeasure(selectedOperation, effectiveInputLayer, geoSelection);
				if (selectedOperation === 'length') {
					const lengthNm = kmToNauticalMiles(measure.value);
					const text = t('geo.results.length', {
						length: lengthNm.toFixed(3),
						count: measure.featureCount,
					});
					const prefix = measure.emptyResult ? `⚠️ ${t('geo.results.emptyMeasure')}\n` : '✅ ';
					setResult(`${prefix}${text}`);
				} else {
					const areaNm2 = km2ToNauticalMilesSquared(measure.value);
					const text = t('geo.results.area', {
						area: areaNm2.toFixed(3),
						count: measure.featureCount,
					});
					const prefix = measure.emptyResult ? `⚠️ ${t('geo.results.areaNoPolygons')}\n` : '✅ ';
					setResult(`${prefix}${text}`);
				}
				clearGeoResult();
				return;
			}

			const distanceNm = parseFloat(parameter);
			if (Number.isNaN(distanceNm) || distanceNm <= 0) {
				setResult(`❌ ${t('geo.errors.bufferNaN')}`);
				return;
			}
			if (maxBufferNm != null && distanceNm > maxBufferNm) {
				setResult(`❌ ${t('geo.errors.bufferTooLarge')}`);
				return;
			}

			const fc = await geoBuffer(
				effectiveInputLayer,
				geoSelection,
				nauticalMilesToKm(distanceNm),
			);
			const inputCount =
				fc.meta?.inputCount ??
				(geoSelection.curveSaids.length || geoSelection.fuids.length || 0);
			let summary = t('geo.results.buffer', {
				distance: distanceNm.toFixed(2),
				count: fc.features?.length ?? 0,
			});
			if (inputCount > 0) {
				summary += `\n${t('geo.results.segmentsProcessed', { count: inputCount })}`;
			}
			if (geoSelection.curveSaids.length > 0) {
				summary += `\n${t('geo.results.bufferSegmentNote')}`;
			}
			if (fc.meta?.inputTruncated) {
				const note = t('geo.results.truncated', { max: geoInfo?.maxInputFeatures ?? 500 });
				applyGeometryResult(fc, `${summary}\n${note}`);
			} else {
				applyGeometryResult(fc, summary);
			}
		} catch (error) {
			const raw = error instanceof Error ? error.message : t('geo.errors.unknown');
			setResult(`❌ ${formatGeoError(raw, t)}`);
		} finally {
			setProcessing(false);
		}
	};

	const applyGeometryResult = (fc: GeoFeatureCollectionResponse, summary: string) => {
		const { meta: _meta, ...collection } = fc;
		if (!collection.features?.length) {
			setResult(`⚠️ ${t('geo.results.emptyGeometry')}`);
			clearGeoResult();
			return;
		}
		setGeoResult(collection);
		setResult(`✅ ${summary}`);
		zoomToCollection(collection);
	};

	const handleClearResult = () => {
		clearGeoResult();
		setResult(null);
	};

	const operationConfig = selectedOperation ? operations[selectedOperation] : null;

	return (
		<div className='space-y-4'>
			<div className='space-y-1'>
				<p className='text-[11px] leading-snug text-[color:var(--color-muted)]'>{scopeHint}</p>
				{selectedIds.length > 0 && (
					<p className='text-[11px] leading-snug text-[color:var(--color-text)]'>
						<span className='font-medium'>{t('geo.selectedIdsLabel')}: </span>
						<span className='break-all font-mono text-[10px]'>
							{selectedIds.map(formatSelectedIdLine).join(', ')}
						</span>
					</p>
				)}
			</div>
			{inputLayerMismatch && (
				<p className='text-[11px] text-amber-700'>{t('geo.inputLayerMismatch')}</p>
			)}
			{geoInfoError && (
				<p className='text-[11px] text-amber-700'>{t('geo.errors.backendUnavailable')}</p>
			)}

			<div className='space-y-2'>
				<label className='text-xs font-semibold text-[color:var(--color-text)]'>
					{t('geo.operationLabel')}
				</label>
				<SelectMenu
					value={selectedOperation || ''}
					onChange={(v) => {
						setSelectedOperation((v || null) as GeoprocessingOperation | null);
						setResult(null);
					}}
					options={GEO_OP_KEYS.map((key) => ({
						value: key,
						label: operations[key].label
					}))}
					placeholder={t('geo.chooseOperation')}
				/>
				{operationConfig && (
					<p className='text-xs text-[color:var(--color-muted)]'>{operationConfig.description}</p>
				)}
			</div>

			{selectedOperation && (
				<>
					<div className='space-y-2'>
						<label className='text-xs font-semibold text-[color:var(--color-text)]'>
							{t('geo.inputLayer')}
						</label>
						<SelectMenu
							value={inputLayer}
							onChange={(v) => setInputLayer(v as CoreLayerId)}
							options={layerOptions.map((layerId) => ({
								value: layerId,
								label: `${getLayerLabel(layerId, locale)}${layerId === activeLayerId ? ` (${t('geo.activeLayerMark')})` : ''}`
							}))}
							placeholder={t('geo.chooseLayer')}
						/>
					</div>

					{operationConfig?.parameterType === 'distance' && (
						<div className='space-y-2'>
							<label className='text-xs font-semibold text-[color:var(--color-text)]'>
								{t('geo.bufferDistance')}
							</label>
							<input
								type='number'
								value={parameter}
								onChange={(e) => setParameter(e.target.value)}
								step='0.1'
								min='0'
								max={maxBufferNm}
								className='w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel-muted)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--color-text)] shadow-sm transition-all focus:border-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text)]'
							/>
							{maxBufferNm != null && (
								<p className='text-[11px] text-[color:var(--color-muted)]'>
									{t('geo.bufferMaxHint', { max: maxBufferNm.toFixed(1) })}
								</p>
							)}
						</div>
					)}

					<button
						type='button'
						onClick={handleProcess}
						disabled={processing}
						className='w-full rounded-full bg-[color:var(--color-text)] px-4 py-3 text-[13px] font-bold text-[color:var(--color-panel)] shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
					>
						{processing ? t('geo.processing') : t('geo.run')}
					</button>

					<button
						type='button'
						onClick={handleClearResult}
						className='w-full rounded-full border border-[color:var(--color-border)] px-4 py-2.5 text-[13px] font-medium text-[color:var(--color-muted)] hover:bg-[color:var(--color-panel-muted)] hover:text-[color:var(--color-text)] transition-colors'
					>
						{t('geo.clearResult')}
					</button>

					{selectedOperation === 'buffer' &&
						geoResultCollection &&
						geoResultCollection.features.length > 0 && (
							<label className='flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] px-3 py-2'>
								<span className='text-xs font-medium text-[color:var(--color-text)]'>
									{t('geo.showResultLayer')}
								</span>
								<Switch
									checked={geoResultVisible}
									onCheckedChange={setGeoResultVisible}
									aria-label={t('geo.showResultLayer')}
								/>
							</label>
						)}

					{result && (
						<div className='rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel-muted)] p-3'>
							<p className='whitespace-pre-line text-xs text-[color:var(--color-text)]'>{result}</p>
						</div>
					)}
				</>
			)}

		</div>
	);
};

export default GeoprocessingPanel;
