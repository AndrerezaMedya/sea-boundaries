from pathlib import Path

path = Path("src/components/Sidebar.tsx")
path.write_text("""import { Database, FlaskConical, Info, MapPinned, UploadCloud } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import LayerToggle from '@/components/LayerToggle';
import DataTable from '@/components/DataTable';
import FileDrop from '@/components/FileDrop';
import MeasurePanel from '@/components/MeasurePanel';
import { buildAnalysisRows, parseGeoJson, readFileAsText, toFeatureCollection } from '@/lib/geo';
import { LAYERS, useSeaBoundariesStore } from '@/lib/store';
import type { MaritimeZoneKey, ToolKey, ZoneFeatureCollection } from '@/lib/types';

const SidebarContent = ({ onCloseMobile }: { onCloseMobile?: () => void }) => {
\tconst layers = useSeaBoundariesStore((state) => state.layers);
\tconst toggleLayer = useSeaBoundariesStore((state) => state.toggleLayer);
\tconst activeTool = useSeaBoundariesStore((state) => state.activeTool);
\tconst setActiveTool = useSeaBoundariesStore((state) => state.setActiveTool);
\tconst userLayer = useSeaBoundariesStore((state) => state.userLayer);
\tconst setUserLayer = useSeaBoundariesStore((state) => state.setUserLayer);
\tconst setAnalysisRows = useSeaBoundariesStore((state) => state.setAnalysisRows);
\tconst setIsAnalyzing = useSeaBoundariesStore((state) => state.setIsAnalyzing);
\tconst isSampleDataLoaded = useSeaBoundariesStore((state) => state.isSampleDataLoaded);
\tconst selectedZone = useSeaBoundariesStore((state) => state.selectedZone);
\tconst loadSampleData = useSeaBoundariesStore((state) => state.loadSampleData);
\tconst analysisRows = useSeaBoundariesStore((state) => state.analysisRows);
\tconst isAnalyzing = useSeaBoundariesStore((state) => state.isAnalyzing);
\tconst { toast } = useToast();

\tconst zoneData = useSeaBoundariesStore((state) => state.layers[selectedZone]?.data);
\tconst selectedLayer = LAYERS.find((layer) => layer.key === selectedZone);
\tconst userFeatureCount = userLayer?.features.length ?? 0;

\tconst handleLayerToggle = (key: MaritimeZoneKey, visible: boolean) => {
\t\ttoggleLayer(key, visible);
\t};

\tconst runAnalysis = useCallback(
\t	(collection: ZoneFeatureCollection, zone: ZoneFeatureCollection | undefined) => {
\t		if (!zone || zone.features.length === 0) {
\t			setAnalysisRows([]);
\t			return { rows: [], skipped: 0, noIntersection: 0 };
\t		}
\t		const summary = buildAnalysisRows(collection, zone);
\t		setAnalysisRows(summary.rows);
\t		return summary;
\t	},
\t	[setAnalysisRows],
\t);

\tconst handleFileSelected = async (file: File) => {
\t	setIsAnalyzing(true);
\t	try {
\t		const text = await readFileAsText(file);
\t		const parsed = parseGeoJson(text);
\t		const collection = toFeatureCollection(parsed);
\t		if (collection.features.length === 0) {
\t			throw new Error('FeatureCollection tidak memiliki fitur.');
\t		}

\t		setUserLayer(collection);

\t		if (!isSampleDataLoaded || !zoneData) {
\t			setAnalysisRows([]);
\t			toast({
\t				title: 'Dataset disimpan',
\t				description: 'Sample data belum dimuat. Klik "Load sample data" untuk menjalankan analisis.',
\t			});
\t			return;
\t		}

\t		const summary = runAnalysis(collection, zoneData);
\t		const total = collection.features.length;
\t		const processed = summary.rows.length;
\t		const messages: string[] = [];
\t		if (summary.skipped > 0) {
\t			messages.push(summary.skipped + ' fitur dilewati (bukan poligon).');
\t		}
\t		if (summary.noIntersection > 0) {
\t			messages.push(summary.noIntersection + ' fitur tanpa irisan.');
\t		}
\t		const baseMessage = processed + ' irisan dihitung dari ' + total + ' fitur.';
\t		const detailMessage = messages.length > 0 ? ' ' + messages.join(' ') : '';
\t		toast({
\t			title: 'Analisis selesai',
\t			description: (baseMessage + detailMessage).trim(),
\t		});
\t	} catch (error) {
\t		setUserLayer(null);
\t		setAnalysisRows([]);
\t		toast({
\t			title: 'Gagal membaca file',
\t			description: error instanceof Error ? error.message : 'Periksa format GeoJSON dan coba lagi.',
\t			variant: 'destructive',
\t		});
\t	} finally {
\t		setIsAnalyzing(false);
\t		if (onCloseMobile) {
\t			onCloseMobile();
\t		}
\t	}
\t};

\tuseEffect(() => {
\t	if (!userLayer || !isSampleDataLoaded) {
\t		setAnalysisRows([]);
\t		return;
\t	}
\t	runAnalysis(userLayer, zoneData);
\t}, [userLayer, zoneData, isSampleDataLoaded, runAnalysis, setAnalysisRows]);

\tconst stats = [
\t	{
\t		icon: MapPinned,
\t		label: 'Zona aktif',
\t		value: selectedLayer ? selectedLayer.label : 'Belum dipilih',
\t	},
\t	{
\t		icon: UploadCloud,
\t		label: 'Fitur pengguna',
\t		value: userFeatureCount > 0 ? userFeatureCount.toLocaleString('id-ID') : 'Belum ada',
\t	},
\t	{
\t		icon: Database,
\t		label: 'Hasil analisis',
\t		value: isAnalyzing ? 'Memproses...' : analysisRows.length > 0 ? analysisRows.length.toLocaleString('id-ID') : 'Belum ada',
\t	},
\t];

\tconst handleToolChange = (value: string) => {
\t	setActiveTool(value as ToolKey);
\t};

\tconst handleZoneChange = (value: MaritimeZoneKey) => {
\t	setActiveTool('analysis');
\t	useSeaBoundariesStore.getState().setSelectedZone(value);
\t};

\tconst handleLoadSamples = () => {
\t	loadSampleData();
\t	toast({
\t		title: 'Sample data dimuat',
\t		description: 'Seluruh layer demo siap ditampilkan di peta.',
\t	});
\t};

\treturn (
\t	<div className='flex h-full flex-col gap-6 bg-gradient-to-b from-slate-50 via-slate-100 to-white px-1 text-slate-800'>
\t		<section className='rounded-4xl border border-white/40 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white shadow-2xl'>
\t			<div className='space-y-4 p-6'>
\t				<div className='space-y-2'>
\t					<p className='text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60'>Workspace</p>
\t					<h2 className='text-xl font-semibold'>Kelola dataset kerja</h2>
\t					<p className='text-sm text-white/75'>Muat sample zona maritim atau unggah GeoJSON Anda, lalu jalankan analisis serta pengukuran langsung dari browser.</p>
\t				</div>
\t				<div className='flex flex-wrap items-center gap-2'>
\t					<Button
\t						variant='secondary'
\t						size='sm'
\t						onClick={handleLoadSamples}
\t						className='inline-flex items-center gap-2 rounded-full bg-white/90 px-4 text-slate-900 hover:bg-white'
\t					>
\t						<FlaskConical className='h-4 w-4' />
\t						{isSampleDataLoaded ? 'Muat ulang sample' : 'Load sample data'}
\t					</Button>
\t					{userFeatureCount > 0 ? (
\t						<span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80'>
\t							<UploadCloud className='h-3.5 w-3.5' />
\t							{userFeatureCount.toLocaleString('id-ID')} fitur diunggah
\t						</span>
\t					) : null}
\t				</div>
\t				<div className='flex items-start gap-3 rounded-3xl bg-white/10 px-4 py-3 text-xs text-white/80 shadow-inner'>
\t					<Info className='mt-0.5 h-4 w-4 flex-none text-white/60' />
\t					<span>Simpan dataset asli Anda dalam proyeksi WGS84. Untuk kinerja optimal, lakukan simplifikasi apabila fitur lebih dari 5.000.</span>
\t				</div>
\t			</div>
\t		</section>

\t		<section className='rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-slate-900/5'>
\t			<header className='mb-4 space-y-1'>
\t				<p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>Status dataset</p>
\t				<h3 className='text-base font-semibold text-slate-800'>Snapshot sesi saat ini</h3>
\t			</header>
\t			<div className='grid gap-3 md:grid-cols-3'>
\t				{stats.map(({ icon: Icon, label, value }) => (
\t					<div key={label} className='flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner'>
\t						<span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/10 text-slate-700'>
\t							<Icon className='h-4 w-4' />
\t						</span>
\t						<div className='flex flex-col'>
\t							<span className='text-[11px] font-semibold uppercase tracking-widest text-slate-500'>{label}</span>
\t							<span className='text-sm font-semibold text-slate-800'>{value}</span>
\t						</div>
\t					</div>
\t				))}
\t			</div>
\t	</section>

\t	<section className='rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-900/5'>
\t	<header className='mb-3 space-y-1'>
\t		<h2 className='text-sm font-semibold text-slate-800'>Layer zona maritim</h2>
\t		<p className='text-xs text-slate-500'>Atur visibilitas layer sample untuk membandingkan dengan data unggahan Anda.</p>
\t	</header>
\t	<LayerToggle layers={layers} onToggle={handleLayerToggle} />
\t</section>

\t	<section className='rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-900/5'>
\t	<header className='mb-3 space-y-1'>
\t		<h2 className='text-sm font-semibold text-slate-800'>Unggah data GeoJSON</h2>
\t		<p className='text-xs text-slate-500'>Gunakan WGS84 (EPSG:4326) dan hindari dataset masif; lakukan simplifikasi terlebih dahulu.</p>
\t	</header>
\t	<FileDrop onFileSelected={handleFileSelected} />
\t	<p className='mt-2 text-xs text-slate-400'>Tip: aktifkan sample data lalu unggah poligon untuk melihat overlay cepat terhadap zona tujuan.</p>
\t</section>

\t	<section className='mt-auto flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white/95 px-3 py-4 shadow-sm ring-1 ring-slate-900/5'>
\t	<Tabs value={activeTool} onValueChange={handleToolChange} className='flex h-full flex-col'>
\t		<TabsList className='grid w-full grid-cols-3 gap-1 rounded-xl bg-slate-100/90 p-1 text-slate-600'>
\t			<TabsTrigger value='measure'>Measure</TabsTrigger>
\t			<TabsTrigger value='analysis'>Analysis</TabsTrigger>
\t			<TabsTrigger value='data'>Data</TabsTrigger>
\t		</TabsList>
\t		<TabsContent value='measure' className='mt-3 flex-1'>
\t			<MeasurePanel />
\t		</TabsContent>
\t		<TabsContent value='analysis' className='mt-3 flex-1'>
\t			<div className='space-y-4'>
\t				<div className='rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600'>
\t					<p className='text-xs font-semibold uppercase tracking-widest text-slate-500'>Zona tujuan</p>
\t					<p className='text-sm font-semibold text-slate-800'>{selectedLayer ? selectedLayer.label : 'Belum dipilih'}</p>
\t				</div>
\t				<select
\t					className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none'
\t					value={selectedZone}
\t					onChange={(event) => handleZoneChange(event.target.value as MaritimeZoneKey)}
\t				>
\t					{LAYERS.filter((layer) => layer.key !== 'baseline').map((layer) => (
\t						<option key={layer.key} value={layer.key}>
\t							{layer.label}
\t						</option>
\t					))}
\t				</select>
\t				<DataTable />
\t			</div>
\t		</TabsContent>
\t		<TabsContent value='data' className='mt-3 flex-1'>
\t			<div className='space-y-3 text-sm text-slate-600'>
\t				<p>Dataset contoh bersifat sintetis untuk demo. Ganti dengan GeoJSON resmi untuk studi yang akurat.</p>
\t				<p>
\t					Pastikan atribut <code className='rounded bg-slate-100 px-1'>zone</code>, <code className='rounded bg-slate-100 px-1'>name</code>, dan <code className='rounded bg-slate-100 px-1'>updated_at</code> tersedia agar popup dan tabel analisis menampilkan informasi lengkap.
\t				</p>
\t			</div>
\t		</TabsContent>
\t	</Tabs>
\t</section>
\t</div>
);
};

const Sidebar = ({ open, onOpenChange }: { open: boolean; onOpenChange: Dispatch<SetStateAction<boolean>> }) => (
	<>
		<aside className='hidden h-full w-[360px] shrink-0 overflow-y-auto border-r border-slate-200 bg-gradient-to-b from-slate-900/10 via-white to-white px-5 py-6 shadow-inner md:flex'>
			<SidebarContent />
		</aside>
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className='left-0 right-auto flex h-full max-w-md flex-col overflow-y-auto border-l-0 border-r bg-slate-50 px-4 py-5 sm:px-6'>
				<SidebarContent onCloseMobile={() => onOpenChange(false)} />
			</SheetContent>
		</Sheet>
	</>
);

export default Sidebar;
""", encoding='utf-8')
