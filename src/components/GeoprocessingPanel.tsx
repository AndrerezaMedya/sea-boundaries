import { useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';

import { useLayersStore } from '@/store/useLayers';
import type { LayerId } from '@/lib/types';
import { getLayerSchema } from '@/lib/schema';

type GeoprocessingOperation = 
	| 'buffer'
	| 'union'
	| 'intersect'
	| 'difference'
	| 'area'
	| 'length'
	| 'centroid'
	| 'bbox'
	| 'simplify'
	| 'convexHull';

interface OperationConfig {
	label: string;
	description: string;
	requiresInput: boolean;
	requiresSecondLayer?: boolean;
	parameterType?: 'distance' | 'tolerance';
}

const OPERATIONS: Record<GeoprocessingOperation, OperationConfig> = {
	buffer: {
		label: 'Buffer',
		description: 'Buat zona penyangga di sekitar fitur',
		requiresInput: true,
		parameterType: 'distance',
	},
	union: {
		label: 'Union',
		description: 'Gabungkan dua layer menjadi satu',
		requiresInput: true,
		requiresSecondLayer: true,
	},
	intersect: {
		label: 'Intersect',
		description: 'Potong dua layer untuk mendapatkan area tumpang tindih',
		requiresInput: true,
		requiresSecondLayer: true,
	},
	difference: {
		label: 'Difference',
		description: 'Kurangi satu layer dari layer lain',
		requiresInput: true,
		requiresSecondLayer: true,
	},
	area: {
		label: 'Hitung Area',
		description: 'Hitung luas total fitur terpilih',
		requiresInput: true,
	},
	length: {
		label: 'Hitung Panjang',
		description: 'Hitung panjang total garis terpilih',
		requiresInput: true,
	},
	centroid: {
		label: 'Centroid',
		description: 'Temukan titik pusat geometri',
		requiresInput: true,
	},
	bbox: {
		label: 'Bounding Box',
		description: 'Buat kotak pembatas untuk fitur',
		requiresInput: true,
	},
	simplify: {
		label: 'Simplify',
		description: 'Sederhanakan geometri dengan mengurangi titik',
		requiresInput: true,
		parameterType: 'tolerance',
	},
	convexHull: {
		label: 'Convex Hull',
		description: 'Buat polygon cembung mengelilingi fitur',
		requiresInput: true,
	},
};

const GeoprocessingPanel = () => {
	const layers = useLayersStore((state) => state.layers);
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	
	const [selectedOperation, setSelectedOperation] = useState<GeoprocessingOperation | null>(null);
	const [inputLayer, setInputLayer] = useState<LayerId>(activeLayerId);
	const [secondLayer, setSecondLayer] = useState<LayerId | null>(null);
	const [parameter, setParameter] = useState<string>('10');
	const [result, setResult] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);

	const availableLayers = Object.keys(layers).filter(
		(layerId) => {
			const layer = layers[layerId as LayerId];
			return layer?.data?.features && layer.data.features.length > 0;
		}
	) as LayerId[];

	const handleProcess = async () => {
		if (!selectedOperation) return;

		setProcessing(true);
		setResult(null);

		try {
			const inputData = layers[inputLayer]?.data;
			const selectedFeatures = layers[inputLayer]?.selectionIds || [];
			
			let features: Feature[] = inputData?.features || [];
			if (selectedFeatures.length > 0) {
				const schema = getLayerSchema(inputLayer);
				features = features.filter((f) => 
					selectedFeatures.includes(String(f.properties?.[schema.primaryKey]))
				);
			}

			if (features.length === 0) {
				setResult('❌ Tidak ada fitur yang dipilih atau tersedia');
				setProcessing(false);
				return;
			}

			const collection: FeatureCollection = {
				type: 'FeatureCollection',
				features,
			};

			let output: string = '';

			switch (selectedOperation) {
				case 'buffer': {
					const distance = parseFloat(parameter);
					if (isNaN(distance)) {
						setResult('❌ Jarak buffer harus berupa angka');
						break;
					}
					const buffered = turf.buffer(collection, distance, { units: 'kilometers' });
					output = `✅ Buffer berhasil dibuat\n📏 Jarak: ${distance} km\n📊 Fitur hasil: ${buffered?.features?.length || 0}`;
					break;
				}

				case 'area': {
					let totalArea = 0;
					features.forEach((feature) => {
						if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
							totalArea += turf.area(feature);
						}
					});
					const areaKm2 = totalArea / 1_000_000;
					output = `✅ Perhitungan selesai\n📐 Total Area: ${areaKm2.toFixed(2)} km²\n📊 Fitur dihitung: ${features.length}`;
					break;
				}

				case 'length': {
					let totalLength = 0;
					features.forEach((feature) => {
						if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
							totalLength += turf.length(feature, { units: 'kilometers' });
						}
					});
					output = `✅ Perhitungan selesai\n📏 Total Panjang: ${totalLength.toFixed(2)} km\n📊 Fitur dihitung: ${features.length}`;
					break;
				}

				case 'centroid': {
					const centroids = features.map((f) => turf.centroid(f));
					output = `✅ Centroid berhasil dihitung\n📍 Jumlah titik pusat: ${centroids.length}`;
					break;
				}

				case 'bbox': {
					const box = turf.bbox(collection);
					output = `✅ Bounding Box berhasil dibuat\n📦 Koordinat: [${box.map(v => v.toFixed(4)).join(', ')}]`;
					break;
				}

				case 'simplify': {
					const tolerance = parseFloat(parameter) / 1000; // convert to km
					if (isNaN(tolerance)) {
						setResult('❌ Tolerance harus berupa angka');
						break;
					}
					const simplified = turf.simplify(collection, { tolerance, highQuality: true });
					output = `✅ Simplify berhasil\n📉 Tolerance: ${parseFloat(parameter).toFixed(2)} m\n📊 Fitur hasil: ${simplified.features.length}`;
					break;
				}

				case 'convexHull': {
					const hull = turf.convex(collection);
					const hullFeatures = hull ? 1 : 0;
					output = `✅ Convex Hull berhasil dibuat\n📊 Fitur input: ${features.length}\n🔷 Hasil: ${hullFeatures} polygon cembung`;
					break;
				}

				case 'union':
				case 'intersect':
				case 'difference': {
					if (!secondLayer) {
						setResult('❌ Layer kedua harus dipilih');
						break;
					}
					const secondData = layers[secondLayer]?.data;
					if (!secondData?.features.length) {
						setResult('❌ Layer kedua tidak memiliki fitur');
						break;
					}
					output = `⚠️ Operasi ${OPERATIONS[selectedOperation].label} akan tersedia dalam versi mendatang (WPS integration)`;
					break;
				}

				default:
					output = '⚠️ Operasi belum diimplementasikan';
			}

			setResult(output);
		} catch (error) {
			setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setProcessing(false);
		}
	};

	const operationConfig = selectedOperation ? OPERATIONS[selectedOperation] : null;

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<label className='text-xs font-semibold text-[color:var(--color-text)]'>Operasi Geoprocessing</label>
				<select
					value={selectedOperation || ''}
					onChange={(e) => setSelectedOperation(e.target.value as GeoprocessingOperation)}
					className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
				>
					<option value=''>Pilih operasi...</option>
					{Object.entries(OPERATIONS).map(([key, config]) => (
						<option key={key} value={key}>
							{config.label}
						</option>
					))}
				</select>
				{operationConfig && (
					<p className='text-xs text-[color:var(--color-muted)]'>{operationConfig.description}</p>
				)}
			</div>

			{selectedOperation && (
				<>
					<div className='space-y-2'>
						<label className='text-xs font-semibold text-[color:var(--color-text)]'>Layer Input</label>
						<select
							value={inputLayer}
							onChange={(e) => setInputLayer(e.target.value as LayerId)}
							className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
						>
							{availableLayers.map((layerId) => {
								const schema = getLayerSchema(layerId);
								return (
									<option key={layerId} value={layerId}>
										{schema.label}
									</option>
								);
							})}
						</select>
					</div>

					{operationConfig?.requiresSecondLayer && (
						<div className='space-y-2'>
							<label className='text-xs font-semibold text-[color:var(--color-text)]'>Layer Kedua</label>
							<select
								value={secondLayer || ''}
								onChange={(e) => setSecondLayer(e.target.value as LayerId)}
							className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
							>
								<option value=''>Pilih layer...</option>
								{availableLayers
									.filter((id) => id !== inputLayer)
									.map((layerId) => {
										const schema = getLayerSchema(layerId);
										return (
											<option key={layerId} value={layerId}>
												{schema.label}
											</option>
										);
									})}
							</select>
						</div>
					)}

					{operationConfig?.parameterType === 'distance' && (
						<div className='space-y-2'>
							<label className='text-xs font-semibold text-[color:var(--color-text)]'>
								Jarak Buffer (km)
							</label>
							<input
								type='number'
								value={parameter}
								onChange={(e) => setParameter(e.target.value)}
								step='0.1'
								min='0'
								className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
							/>
						</div>
					)}

					{operationConfig?.parameterType === 'tolerance' && (
						<div className='space-y-2'>
							<label className='text-xs font-semibold text-[color:var(--color-text)]'>
								Tolerance (meter)
							</label>
							<input
								type='number'
								value={parameter}
								onChange={(e) => setParameter(e.target.value)}
								step='1'
								min='0'
								className='w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
							/>
						</div>
					)}

					<button
						type='button'
						onClick={handleProcess}
						disabled={processing}
						className='w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
					>
						{processing ? 'Memproses...' : 'Jalankan Operasi'}
					</button>

					{result && (
						<div className='rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel-muted)] p-3'>
							<p className='whitespace-pre-line text-xs text-[color:var(--color-text)]'>{result}</p>
						</div>
					)}
				</>
			)}

			<div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
				<p className='text-xs text-blue-900'>
					<strong>ℹ️ Catatan:</strong> Saat ini menggunakan Turf.js untuk operasi geometri lokal. 
					Kedepannya akan diganti dengan WPS (Web Processing Service) untuk geoprocessing server-side.
				</p>
			</div>
		</div>
	);
};

export default GeoprocessingPanel;
