import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Clipboard, Download, FilterIcon, Layers, Search, ZoomIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { downloadAttributeCsv } from '@/lib/export';
import { getLayerSchema } from '@/lib/schema';
import type { LayerId, SortDirection, TableRow as TableRowData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLayersStore } from '@/store/useLayers';

const PAGE_SIZE = 10;

const pillPrimaryClass =
	'rounded-full bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-60 disabled:text-white/80';
const pillOutlineClass =
	'rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-4 py-1.5 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border)] disabled:opacity-90';
const paginationButtonClass =
	'rounded-full bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-60 disabled:text-white/70';

const AttributeTable = () => {
	const { toast } = useToast();
	const activeLayerId = useLayersStore((state) => state.activeLayerId);
	const layers = useLayersStore((state) => state.layers);
	const setSelection = useLayersStore((state) => state.setSelection);
	const requestZoomToIds = useLayersStore((state) => state.requestZoomToIds);
	const setHoveredFeature = useLayersStore((state) => state.setHoveredFeature);

	// Local layer selector — independent of the map's active layer
	const [selectedLayerId, setSelectedLayerId] = useState<LayerId>(activeLayerId);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown on outside click
	useEffect(() => {
		if (!dropdownOpen) return;
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [dropdownOpen]);

	// Keep in sync only on first mount; after that user drives it themselves
	useEffect(() => {
		setSelectedLayerId(activeLayerId);
	}, [activeLayerId]);

	const layerState = layers[selectedLayerId];

	// Derive tableRows directly from the selected layer's filtered data
	const tableRows = useMemo<TableRowData[]>(() => {
		if (!layerState) return [];
		return layerState.filteredIds
			.map((id) => {
				const feature = layerState.featureIndex[id];
				if (!feature) return null;
				return { id, layerId: selectedLayerId, properties: feature.properties ?? {}, geometry: feature.geometry };
			})
			.filter((r): r is TableRowData => r !== null);
	}, [layerState, selectedLayerId]);

	// Sorted list of loaded layers for the dropdown
	const layerOptions = useMemo(() => {
		return Object.values(layers)
			.filter((l) => l.data.features.length > 0)
			.map((l) => ({ id: l.id, label: l.label }))
			.sort((a, b) => a.label.localeCompare(b.label, 'id'));
	}, [layers]);

	const schema = useMemo(() => getLayerSchema(selectedLayerId), [selectedLayerId]);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	// Per-layer column visibility: Map<layerId, Set<visibleFieldName>>
	// If no entry exists for a layer, all columns are shown by default.
	const [columnPrefsMap, setColumnPrefsMap] = useState<Map<string, Set<string>>>(new Map());
	const [sortField, setSortField] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

	// Synchronously derive visible columns for the current layer
	const visibleColumns = useMemo(() => {
		const allFields = new Set(schema.fields.map((f) => f.name));
		return columnPrefsMap.get(selectedLayerId) ?? allFields;
	}, [schema, selectedLayerId, columnPrefsMap]);

	const selectionIds = layerState?.selectionIds ?? [];
	const hoveredId = layerState?.hoveredId ?? null;

	// Reset search/sort/page when layer changes
	useEffect(() => {
		setPage(0);
		setSortField(null);
		setSortDirection('asc');
		setSearchTerm('');
	}, [selectedLayerId]);

	const filteredRows = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		let rows = tableRows;
		if (term.length > 0) {
			rows = rows.filter((row) =>
				Object.values(row.properties).some((value) =>
					value !== undefined && value !== null && String(value).toLowerCase().includes(term),
				),
			);
		}
		if (sortField) {
			rows = [...rows].sort((a, b) => {
				const valueA = a.properties[sortField];
				const valueB = b.properties[sortField];
				if (valueA === valueB) {
					return 0;
				}
				if (valueA === undefined || valueA === null) {
					return 1;
				}
				if (valueB === undefined || valueB === null) {
					return -1;
				}
				if (typeof valueA === 'number' && typeof valueB === 'number') {
					return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
				}
				return sortDirection === 'asc'
					? String(valueA).localeCompare(String(valueB))
					: String(valueB).localeCompare(String(valueA));
			});
		}
		return rows;
	}, [searchTerm, sortField, sortDirection, tableRows]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const pagedRows = filteredRows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

	const toggleColumn = (column: string) => {
		setColumnPrefsMap((prev) => {
			// Initialise from full field list if no entry yet for this layer
			const current = prev.get(selectedLayerId) ?? new Set(schema.fields.map((f) => f.name));
			const next = new Set(current);
			if (next.has(column)) {
				next.delete(column);
			} else {
				next.add(column);
			}
			const map = new Map(prev);
			map.set(selectedLayerId, next);
			return map;
		});
	};

	const handleSort = (column: string) => {
		if (sortField === column) {
			setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(column);
			setSortDirection('asc');
		}
	};

	const handleSelectRow = (id: string) => {
		setSelection(selectedLayerId, selectionIds.includes(id) ? [] : [id]);
	};

	const handleZoomRow = (id: string) => {
		requestZoomToIds(selectedLayerId, [id], 120);
	};

	const handleZoomFiltered = () => {
		if (filteredRows.length === 0) {
			toast({
				title: 'Tidak ada baris terfilter',
				description: 'Terapkan filter sebelum melakukan zoom.',
				variant: 'destructive',
			});
			return;
		}
		requestZoomToIds(selectedLayerId, filteredRows.map((row) => row.id));
	};

	const handleCopyRow = async (id: string) => {
		const row = tableRows.find((item) => item.id === id);
		if (!row) {
			return;
		}
		const text = JSON.stringify(row.properties, null, 2);
		try {
			await navigator.clipboard.writeText(text);
			toast({ title: 'Atribut disalin', description: 'Data baris berhasil disalin ke clipboard.' });
		} catch {
			toast({ title: 'Tidak dapat menyalin', description: 'Izin clipboard ditolak.', variant: 'destructive' });
		}
	};

	const handleExport = () => {
		const fields = schema.fields.map((field) => field.name).filter((field) => visibleColumns.has(field));
		downloadAttributeCsv(selectedLayerId, filteredRows, fields);
		toast({ title: 'CSV dibuat', description: `${filteredRows.length} baris diekspor.` });
	};

	return (
		<div className='flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md'>
			{/* Layer selector row */}
			<div
				className='flex flex-shrink-0 items-center gap-2 border-b px-4 py-2.5'
				style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border, #e2e8f0)' }}
			>
				<Layers className='h-4 w-4 shrink-0 text-[color:var(--color-accent)]' />
				<span className='shrink-0 text-xs font-medium text-[color:var(--color-muted)]'>Layer</span>

				{/* Custom dropdown */}
				<div ref={dropdownRef} className='relative min-w-0 flex-1'>
					<button
						type='button'
						onClick={() => setDropdownOpen((o) => !o)}
						className='flex w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-3 py-1.5 text-left text-xs font-semibold text-[color:var(--color-text)] shadow-sm transition hover:bg-[color:var(--color-panel-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]'
					>
						<span className='truncate'>
							{layerOptions.find((o) => o.id === selectedLayerId)?.label ?? selectedLayerId}
						</span>
						<ChevronDown
							className={cn('h-3.5 w-3.5 shrink-0 text-[color:var(--color-muted)] transition-transform duration-150', dropdownOpen && 'rotate-180')}
						/>
					</button>

					{dropdownOpen && (
						<div className='absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-panel)] py-1 shadow-xl'>
							{layerOptions.map((opt) => (
								<button
									key={opt.id}
									type='button'
									onClick={() => { setSelectedLayerId(opt.id as LayerId); setDropdownOpen(false); }}
									className={cn(
										'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition',
										opt.id === selectedLayerId
											? 'bg-[color:var(--color-accent)] font-semibold text-white'
											: 'text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-muted)]',
									)}
								>
									{opt.id === selectedLayerId
										? <Check className='h-3.5 w-3.5 shrink-0' />
										: <span className='h-3.5 w-3.5 shrink-0' />}
									<span className='truncate'>{opt.label}</span>
								</button>
							))}
						</div>
					)}
				</div>

				<span className='shrink-0 rounded-full bg-[color:var(--color-panel-muted)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-muted)]'>
					{tableRows.length.toLocaleString('id-ID')} baris
				</span>
			</div>

			<div className='flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2'>
				<h3 className='text-sm font-semibold text-[color:var(--color-text)]'>Attribute Table</h3>
				<div className='flex items-center gap-2'>
					<Button onClick={handleZoomFiltered} variant='outline' size='sm' className={cn('gap-1.5', pillOutlineClass)}>
						<ZoomIn className='h-3.5 w-3.5' />
						Zoom ke hasil
					</Button>
					<Button onClick={handleExport} variant='default' size='sm' className={cn('gap-1.5', pillPrimaryClass)}>
						<Download className='h-3.5 w-3.5' />
						Export CSV
					</Button>
				</div>
			</div>

			<div className='flex flex-shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-200 bg-[color:var(--color-panel-muted)] px-3 py-1.5'>
				<Search className='h-3.5 w-3.5 shrink-0 text-[color:var(--color-muted)]' />
				<input
					type='text'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder='Cari atribut...'
					className='w-36 shrink-0 rounded border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-2 py-0.5 text-xs text-[color:var(--color-text)] outline-none focus:ring-1 focus:ring-blue-500'
				/>
				<div className='mx-1 h-4 w-px shrink-0 bg-[color:var(--color-border)]' />
				<FilterIcon className='h-3.5 w-3.5 shrink-0 text-[color:var(--color-muted)]' />
				{schema.fields.map((field) => (
					<label key={field.name} className='flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-panel)] px-2 py-0.5 text-xs text-[color:var(--color-text)] hover:bg-[color:var(--color-panel-elevated)]'>
						<input
							type='checkbox'
							checked={visibleColumns.has(field.name)}
							onChange={() => toggleColumn(field.name)}
							className='h-3 w-3 accent-slate-700'
						/>
						<span className='whitespace-nowrap'>{field.label}</span>
					</label>
				))}
			</div>

			<div className='min-h-0 flex-1 overflow-auto px-5 py-2'>
				<div className='overflow-x-auto rounded-xl border border-slate-200 bg-white'>
					<Table>
						<TableHeader className='bg-slate-900 text-white [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide'>
							<TableRow>
								<TableHead className='w-20 text-center'>Aksi</TableHead>
								{schema.fields
									.filter((field) => visibleColumns.has(field.name))
									.map((field) => (
										<TableHead
											key={field.name}
											onClick={() => handleSort(field.name)}
											className='cursor-pointer select-none whitespace-nowrap'
										>
											{field.label}
											{sortField === field.name ? (
												<span className='ml-1 text-[10px] text-white/70'>{sortDirection === 'asc' ? '▲' : '▼'}</span>
											) : null}
										</TableHead>
									))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{pagedRows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={visibleColumns.size + 1} className='py-6 text-center text-sm text-slate-600'>
										Tidak ada fitur yang cocok dengan filter.
									</TableCell>
								</TableRow>
							) : (
								pagedRows.map((row) => {
									const isSelected = selectionIds.includes(row.id);
									return (
										<TableRow
											key={row.id}
											onMouseEnter={() => setHoveredFeature(selectedLayerId, row.id)}
											onMouseLeave={() => setHoveredFeature(selectedLayerId, null)}
											className={cn(
												'border-b border-slate-200 text-sm transition-colors',
												isSelected ? 'bg-slate-900 text-white' : 'bg-white text-slate-800',
												hoveredId === row.id && !isSelected ? 'bg-slate-100 text-slate-900' : undefined,
											)}
										>
											<TableCell className='py-1 pl-3 pr-2'>
												<div className='flex items-center gap-1'>
													<Button size='sm' variant='default' onClick={() => handleSelectRow(row.id)} className='h-6 rounded-full bg-[color:var(--color-accent)] px-2.5 text-[11px] font-semibold text-white transition hover:opacity-90'>
														{isSelected ? 'Batal' : 'Pilih'}
													</Button>
													<Button size='sm' variant='outline' onClick={() => handleZoomRow(row.id)} className='h-6 rounded-full border border-[color:var(--color-border)] px-2.5 text-[11px] font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-panel-muted)]'>
														Zoom
													</Button>
													<Button size='sm' variant='ghost' onClick={() => handleCopyRow(row.id)} className='h-6 w-6 rounded-full p-0 text-[color:var(--color-muted)] transition hover:text-[color:var(--color-text)]'>
														<Clipboard className='h-3.5 w-3.5' />
													</Button>
												</div>
											</TableCell>
											{schema.fields
												.filter((field) => visibleColumns.has(field.name))
												.map((field) => {
													const value = row.properties[field.name];
													const displayValue =
														value === undefined || value === null
															? '—'
															: typeof value === 'number'
																?
																value.toLocaleString('id-ID')
																: String(value);
													return (
														<TableCell
															key={field.name}
															className={cn('whitespace-nowrap py-1 text-xs', isSelected ? 'text-white' : 'text-slate-800')}
														>
															{displayValue}
														</TableCell>
													);
												})}
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className='flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-600'>
				<p>
					Menampilkan {pagedRows.length} dari {filteredRows.length.toLocaleString('id-ID')} baris
				</p>
				<div className='flex items-center gap-2'>
					<Button
						onClick={() => setPage((previous) => Math.max(0, previous - 1))}
						variant='outline'
						size='sm'
						disabled={currentPage === 0}
						className={pillOutlineClass}
					>
						Sebelumnya
					</Button>
					<span>
						Halaman {currentPage + 1} dari {totalPages}
					</span>
					<Button
						onClick={() => setPage((previous) => (previous + 1 >= totalPages ? previous : previous + 1))}
						variant='default'
						size='sm'
						disabled={currentPage + 1 >= totalPages}
						className={paginationButtonClass}
					>
						Berikutnya
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AttributeTable;
