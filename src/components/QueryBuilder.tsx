import { useMemo, useRef, useState } from 'react';
import { Filter, MinusCircle, PlusCircle, Sparkles, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getFieldSchema, getLayerSchema } from '@/lib/schema';
import { toMapLibreFilter } from '@/lib/filterExpr';
import type {
	FieldType,
	FilterCondition,
	FilterDefinition,
	FilterGroup,
	FilterJoin,
	Operator,
	PresetDefinition,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLayersStore } from '@/store/useLayers';
import { useUIStore } from '@/store/useUI';

const stringOperators: Operator[] = ['=', '!=', 'contains', 'startsWith', 'in'];
const numericOperators: Operator[] = ['=', '!=', '<', '<=', '>', '>=', 'between'];

const makeId = (prefix: string) => (typeof crypto !== 'undefined' && crypto.randomUUID ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Math.random().toString(36).slice(2, 10)}`);

const getDefaultOperator = (type: FieldType): Operator => (type === 'string' ? '=' : '=');

const getOperatorOptions = (type: FieldType): Operator[] => (type === 'string' ? stringOperators : numericOperators);

const ensureArrayValue = (value: unknown, type: FieldType): string[] | number[] => {
	const array = Array.isArray(value) ? (value as Array<string | number>) : [];
	if (type === 'number' || type === 'date') {
		return array
			.map((item) => (typeof item === 'number' ? item : Number(item)))
			.filter((item): item is number => !Number.isNaN(item));
	}
	return array.map((item) => String(item));
};

const parseListInput = (raw: string, type: FieldType): string[] | number[] => {
	const entries = raw
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
	if (type === 'number' || type === 'date') {
		return entries
			.map((entry) => Number(entry))
			.filter((value): value is number => !Number.isNaN(value));
	}
	return entries;
};

const conditionIsComplete = (condition: FilterCondition): boolean => {
	if (condition.operator === 'between') {
		return condition.value !== undefined && condition.value !== '' && condition.value2 !== undefined && condition.value2 !== '';
	}
	if (condition.operator === 'in') {
		if (!Array.isArray(condition.value)) {
			return false;
		}
		return condition.value.length > 0;
	}
	return condition.value !== undefined && condition.value !== '' && condition.value !== null;
};

const cloneDefinition = (definition: FilterDefinition): FilterDefinition => ({
	join: definition.join,
	groups: definition.groups.map((group) => ({ ...group })),
	conditions: definition.conditions.map((condition) => ({
		...condition,
		value: Array.isArray(condition.value)
			? condition.type === 'number' || condition.type === 'date'
				? (condition.value as Array<string | number>)
					.map((item) => (typeof item === 'number' ? item : Number(item)))
					.filter((item): item is number => !Number.isNaN(item))
				: (condition.value as Array<string | number>).map((item) => String(item))
			: condition.value,
	})),
});

const QueryBuilder = () => {
	const { toast } = useToast();
	const {
		activeLayerId,
		layers,
		applyFilter,
		clearFilter,
		requestZoomToIds,
		getUniqueValues,
	} = useLayersStore();
	const {
		builderState: builderStateMap,
		setBuilderState,
		updateBuilderState,
		resetBuilderState,
		presets: allPresets,
		createPreset,
		deletePreset,
		renamePreset,
		setActiveTab,
	} = useUIStore();
	const layerState = layers[activeLayerId];
	const layerPresets = useMemo(
		() => allPresets.filter((preset: PresetDefinition) => preset.layerId === activeLayerId),
		[allPresets, activeLayerId],
	);
	const emptyDefinitionRef = useRef<FilterDefinition>({ conditions: [], join: 'all', groups: [] });
	const builderState = builderStateMap[activeLayerId];

	const [preview, setPreview] = useState<string | null>(null);
	const [valuesPanel, setValuesPanel] = useState<{ conditionId: string; field: string } | null>(null);
	const [uniqueValues, setUniqueValues] = useState<(string | number)[]>([]);
	const [selectedPresetId, setSelectedPresetId] = useState<string>('');

	const schema = useMemo(() => getLayerSchema(activeLayerId), [activeLayerId]);
	const builder = builderState ?? emptyDefinitionRef.current;
	const conditions: FilterCondition[] = builder.conditions ?? [];
	const groups: FilterGroup[] = builder.groups ?? [];
	const layerVisible = layerState?.visible ?? false;
	const filteredIds = layerState?.filteredIds ?? [];

	const isDisabled = !layerVisible;
	const canApply = conditions.length > 0 && conditions.every((condition) => conditionIsComplete(condition));

	const addCondition = () => {
		const firstField = schema.fields[0];
		if (!firstField) {
			toast({ title: 'Skema belum tersedia', description: 'Tambahkan definisi field terlebih dahulu.', variant: 'destructive' });
			return;
		}
		const newCondition: FilterCondition = {
			id: makeId('cond'),
			field: firstField.name,
			operator: getDefaultOperator(firstField.type),
			value: firstField.type === 'number' ? '' : '',
			type: firstField.type,
		};
		updateBuilderState(activeLayerId, (previous) => ({
			...previous,
			conditions: [...previous.conditions, newCondition],
		}));
	};

	const updateCondition = (conditionId: string, updater: (condition: FilterCondition) => FilterCondition) => {
		updateBuilderState(activeLayerId, (previous) => ({
			...previous,
			conditions: previous.conditions.map((condition) => (condition.id === conditionId ? updater(condition) : condition)),
		}));
	};

	const removeCondition = (conditionId: string) => {
		updateBuilderState(activeLayerId, (previous) => ({
			...previous,
			conditions: previous.conditions.filter((condition) => condition.id !== conditionId),
		}));
	};

	const handleFieldChange = (conditionId: string, fieldName: string) => {
		const fieldSchema = getFieldSchema(activeLayerId, fieldName);
		if (!fieldSchema) {
			toast({ title: 'Field tidak ditemukan', description: 'Periksa kembali nama field di skema.', variant: 'destructive' });
			return;
		}
		updateCondition(conditionId, (condition) => ({
			...condition,
			field: fieldName,
			type: fieldSchema.type,
			operator: getDefaultOperator(fieldSchema.type),
			value: '',
			value2: undefined,
			groupId: condition.groupId,
		}));
	};

	const handleOperatorChange = (conditionId: string, operator: Operator) => {
		updateCondition(conditionId, (condition) => {
			const next: FilterCondition = { ...condition, operator };
			if (operator === 'between') {
				next.value2 = ''; // placeholder
			} else {
				next.value2 = undefined;
			}
			if (operator === 'in') {
				next.value = ensureArrayValue(next.value, condition.type);
			} else if (Array.isArray(next.value)) {
				next.value = '';
			}
			return next;
		});
	};

	const handleValueChange = (conditionId: string, value: string) => {
		updateCondition(conditionId, (condition) => {
			if (condition.operator === 'in') {
				const parsed = parseListInput(value, condition.type);
				return { ...condition, value: parsed };
			}
			if (condition.type === 'number') {
				const numeric = Number(value);
				return { ...condition, value: Number.isNaN(numeric) ? value : numeric };
			}
			if (condition.type === 'date') {
				return { ...condition, value: value.trim() };
			}
			return { ...condition, value };
		});
	};

	const handleSecondValueChange = (conditionId: string, value: string) => {
		updateCondition(conditionId, (condition) => {
			if (condition.type === 'number') {
				const numeric = Number(value);
				return { ...condition, value2: Number.isNaN(numeric) ? value : numeric };
			}
			if (condition.type === 'date') {
				return { ...condition, value2: value.trim() };
			}
			return { ...condition, value2: value };
		});
	};

	const handleGroupChange = (conditionId: string, groupId: string | null) => {
		updateCondition(conditionId, (condition) => ({ ...condition, groupId: groupId || undefined }));
	};

	const setJoin = (join: FilterJoin) => {
		setBuilderState(activeLayerId, { ...builder, join });
	};

	const updateGroup = (groupId: string, updater: (group: FilterGroup) => FilterGroup) => {
		updateBuilderState(activeLayerId, (previous) => ({
			...previous,
			groups: previous.groups.map((group) => (group.id === groupId ? updater(group) : group)),
		}));
	};

	const addGroup = () => {
		const group: FilterGroup = {
			id: makeId('group'),
			label: `Group ${builder.groups.length + 1}`,
			join: 'all',
		};
		updateBuilderState(activeLayerId, (previous) => ({
			...previous,
			groups: [...previous.groups, group],
		}));
	};

	const removeGroup = (groupId: string) => {
		updateBuilderState(activeLayerId, (previous) => ({
			...previous,
			groups: previous.groups.filter((group) => group.id !== groupId),
			conditions: previous.conditions.map((condition) => (condition.groupId === groupId ? { ...condition, groupId: undefined } : condition)),
		}));
	};

	const handlePreview = () => {
		if (conditions.length === 0) {
			toast({ title: 'Belum ada kondisi', description: 'Tambahkan minimal satu kondisi filter.', variant: 'destructive' });
			return;
		}
		try {
			const expression = toMapLibreFilter(activeLayerId, builder);
			setPreview(JSON.stringify(expression, null, 2));
			toast({ title: 'Preview siap', description: 'Ekspresi MapLibre dapat dilihat di bawah.' });
		} catch (error) {
			toast({ title: 'Gagal membangun ekspresi', description: error instanceof Error ? error.message : 'Periksa konfigurasi filter.', variant: 'destructive' });
		}
	};

	const handleApply = () => {
		if (!canApply) {
			toast({ title: 'Kondisi belum lengkap', description: 'Periksa kembali nilai setiap kondisi.', variant: 'destructive' });
			return;
		}
		applyFilter(activeLayerId, cloneDefinition(builder));
		setPreview(null);
		toast({ title: 'Filter diterapkan', description: `${filteredIds.length} fitur terpilih.` });
		setActiveTab('table');
	};

	const handleClear = () => {
		resetBuilderState(activeLayerId);
		clearFilter(activeLayerId);
		setPreview(null);
		setValuesPanel(null);
		setUniqueValues([]);
		toast({ title: 'Filter dibersihkan', description: 'Semua fitur akan ditampilkan kembali.' });
	};

	const handleSavePreset = () => {
		if (!canApply) {
			toast({ title: 'Kondisi belum lengkap', description: 'Lengkapi filter sebelum menyimpan preset.', variant: 'destructive' });
			return;
		}
		const name = window.prompt('Nama preset kueri', `Preset ${layerPresets.length + 1}`);
		if (!name) {
			return;
		}
		createPreset(name.trim(), activeLayerId, builder);
		toast({ title: 'Preset tersimpan', description: `Preset "${name}" siap digunakan.` });
	};

	const handleApplyPreset = () => {
		if (!selectedPresetId) {
			toast({ title: 'Pilih preset terlebih dahulu', variant: 'destructive' });
			return;
		}
		const preset = layerPresets.find((item) => item.id === selectedPresetId);
		if (!preset) {
			toast({ title: 'Preset tidak ditemukan', variant: 'destructive' });
			return;
		}
		setBuilderState(activeLayerId, preset.definition);
		applyFilter(activeLayerId, cloneDefinition(preset.definition));
		toast({ title: 'Preset diterapkan', description: `Filter "${preset.name}" aktif.` });
		setActiveTab('table');
	};

	const handleShowValues = (conditionId: string, fieldName: string) => {
		const values = getUniqueValues(activeLayerId, fieldName);
		setUniqueValues(values);
		setValuesPanel({ conditionId, field: fieldName });
	};

	const handleSelectValue = (value: string | number) => {
		if (!valuesPanel) {
			return;
		}
		updateCondition(valuesPanel.conditionId, (condition) => {
			if (condition.operator === 'in') {
				if (condition.type === 'number' || condition.type === 'date') {
					const current = Array.isArray(condition.value) ? (condition.value as number[]) : ([] as number[]);
					const numeric = typeof value === 'number' ? value : Number(value);
					if (Number.isNaN(numeric)) {
						return condition;
					}
					const exists = current.includes(numeric);
					const next = exists ? current.filter((item) => item !== numeric) : [...current, numeric];
					return { ...condition, value: next };
				}
				const current = Array.isArray(condition.value) ? (condition.value as string[]) : ([] as string[]);
				const textValue = String(value);
				const exists = current.includes(textValue);
				const next = exists ? current.filter((item) => item !== textValue) : [...current, textValue];
				return { ...condition, value: next };
			}
			if (condition.type === 'number' || condition.type === 'date') {
				const numeric = typeof value === 'number' ? value : Number(value);
				if (Number.isNaN(numeric)) {
					return condition;
				}
				return { ...condition, value: numeric };
			}
			return { ...condition, value: String(value) };
		});
	};

	const handleZoomToFiltered = () => {
		if (filteredIds.length === 0) {
			toast({ title: 'Tidak ada hasil filter', description: 'Terapkan filter sebelum melakukan zoom.', variant: 'destructive' });
			return;
		}
		requestZoomToIds(activeLayerId, filteredIds);
	};

	return (
		<div className='space-y-5'>
			<div className='space-y-2 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm'>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<h3 className='text-sm font-semibold text-slate-900'>Query Builder</h3>
						<p className='text-xs text-slate-500'>Bangun ekspresi filter ala QGIS dengan kombinasi kondisi.</p>
					</div>
					<span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500'>
						<Filter className='h-3.5 w-3.5' />
						{schema.label}
					</span>
				</div>
				{isDisabled ? (
					<div className='rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700'>Aktifkan visibilitas layer untuk mengakses Query Builder.</div>
				) : null}
				<div className='flex items-center gap-2 text-xs font-medium text-slate-500'>
					<span>Gabung kondisi dengan</span>
					<div className='inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-[11px] uppercase tracking-wide'>
						<button
							type='button'
							onClick={() => setJoin('all')}
							className={cn('rounded-full px-3 py-1 transition', builder.join === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
						>
							AND
						</button>
						<button
							type='button'
							onClick={() => setJoin('any')}
							className={cn('rounded-full px-3 py-1 transition', builder.join === 'any' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
						>
							OR
						</button>
					</div>
				</div>

				<div className='space-y-3'>
					{conditions.length === 0 ? (
						<div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500'>Belum ada kondisi. Klik "Tambah kondisi" untuk memulai.</div>
					) : (
						conditions.map((condition) => {
							const fieldSchema = getFieldSchema(activeLayerId, condition.field) ?? schema.fields[0];
							const operators = getOperatorOptions(fieldSchema.type);
							const groupId = condition.groupId ?? '';
							const valuesText = Array.isArray(condition.value) ? condition.value.join(', ') : condition.value;
							return (
								<div key={condition.id} className='rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-inner'>
									<div className='flex flex-wrap items-center gap-2 text-xs text-slate-600'>
										<select
											value={condition.field}
											onChange={(event) => handleFieldChange(condition.id, event.target.value)}
											className='min-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-1'
											disabled={isDisabled}
										>
											{schema.fields.map((field) => (
												<option key={field.name} value={field.name}>
													{field.label}
												</option>
											))}
										</select>
										<select
											value={condition.operator}
											onChange={(event) => handleOperatorChange(condition.id, event.target.value as Operator)}
											className='rounded-md border border-slate-200 bg-white px-2 py-1'
											disabled={isDisabled}
										>
											{operators.map((operator) => (
												<option key={operator} value={operator}>
													{operator}
												</option>
											))}
										</select>
										{condition.operator === 'in' ? (
											<textarea
												value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
												onChange={(event) => handleValueChange(condition.id, event.target.value)}
												className='min-h-[60px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-2'
												placeholder='Pisahkan dengan koma'
												disabled={isDisabled}
											/>
										) : (
											<Input
												value={valuesText as string}
												onChange={(event) => handleValueChange(condition.id, event.target.value)}
												placeholder='Nilai'
												className='flex-1'
												disabled={isDisabled}
											/>
										)}
										{condition.operator === 'between' ? (
											<Input
												value={(condition.value2 as string) ?? ''}
												onChange={(event) => handleSecondValueChange(condition.id, event.target.value)}
												placeholder='Nilai akhir'
												className='flex-1'
												disabled={isDisabled}
											/>
										) : null}
										<select
											value={groupId}
											onChange={(event) => handleGroupChange(condition.id, event.target.value || null)}
											className='min-w-[120px] rounded-md border border-slate-200 bg-white px-2 py-1'
											disabled={isDisabled || groups.length === 0}
										>
											<option value=''>Tanpa group</option>
											{groups.map((group) => (
												<option key={group.id} value={group.id}>
													{group.label}
												</option>
											))}
										</select>
										<Button
											onClick={() => handleShowValues(condition.id, condition.field)}
											variant='secondary'
											size='sm'
											disabled={isDisabled}
										>
											Daftar nilai
										</Button>
										<Button
											onClick={() => removeCondition(condition.id)}
											variant='ghost'
											size='icon'
											className='text-slate-400 hover:text-red-500'
											disabled={isDisabled}
										>
											<MinusCircle className='h-4 w-4' />
										</Button>
									</div>
								</div>
							);
						})
					)}
				</div>
				<Button
					onClick={addCondition}
					variant='outline'
					size='sm'
					className='inline-flex items-center gap-2 text-slate-600'
					disabled={isDisabled}
				>
					<PlusCircle className='h-4 w-4' />
					Tambah kondisi
				</Button>
			</div>

			<div className='rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm'>
				<div className='mb-3 flex items-center justify-between text-sm font-semibold text-slate-900'>
					<span>Grouping sederhana "( )"</span>
					<Button onClick={addGroup} size='sm' variant='outline' disabled={isDisabled}>
						Tambah group
					</Button>
				</div>
				{groups.length === 0 ? (
					<p className='text-xs text-slate-500'>Gunakan group untuk membuat kombinasi AND/OR bersarang satu level.</p>
				) : (
					<div className='space-y-2'>
						{groups.map((group) => (
							<div key={group.id} className='flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
								<Input
									value={group.label}
									onChange={(event) => updateGroup(group.id, (current) => ({ ...current, label: event.target.value }))}
									placeholder='Nama group'
									className='max-w-[180px]'
									disabled={isDisabled}
								/>
								<select
									value={group.join}
									onChange={(event) => updateGroup(group.id, (current) => ({ ...current, join: event.target.value as FilterJoin }))}
									className='rounded-md border border-slate-200 bg-white px-2 py-1'
									disabled={isDisabled}
								>
									<option value='all'>AND</option>
									<option value='any'>OR</option>
								</select>
								<Button
									onClick={() => removeGroup(group.id)}
									variant='ghost'
									size='icon'
									className='text-slate-400 hover:text-red-500'
									disabled={isDisabled}
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				<Button onClick={handlePreview} variant='outline' className='justify-start gap-2 text-slate-700' disabled={conditions.length === 0}>
					<Sparkles className='h-4 w-4' />
					Preview ekspresi
				</Button>
				<Button onClick={handleZoomToFiltered} variant='outline' className='justify-start gap-2 text-slate-700' disabled={filteredIds.length === 0}>
					Zoom ke hasil filter
				</Button>
				<Button onClick={handleApply} className='justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800' disabled={!canApply || isDisabled}>
					Terapkan filter
				</Button>
				<Button onClick={handleClear} variant='secondary' className='justify-center gap-2 text-slate-700'>
					Reset
				</Button>
			</div>

			<div className='rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm'>
				<div className='mb-2 flex items-center justify-between text-sm font-semibold text-slate-900'>
					<span>Preset kueri</span>
					<Button onClick={handleSavePreset} size='sm' variant='outline' disabled={!canApply}>
						Simpan sebagai preset
					</Button>
				</div>
				{layerPresets.length === 0 ? (
					<p className='text-xs text-slate-500'>Belum ada preset. Simpan kueri favorit untuk pakai ulang.</p>
				) : (
					<div className='space-y-2'>
						<div className='flex flex-wrap items-center gap-2'>
							<select
								value={selectedPresetId}
								onChange={(event) => setSelectedPresetId(event.target.value)}
								className='rounded-md border border-slate-200 bg-white px-2 py-1 text-sm'
							>
								<option value=''>Pilih preset</option>
								{layerPresets.map((preset) => (
									<option key={preset.id} value={preset.id}>
										{preset.name}
									</option>
								))}
							</select>
							<Button onClick={handleApplyPreset} variant='secondary' size='sm' disabled={!selectedPresetId}>
								Terapkan preset
							</Button>
						</div>
						<ul className='space-y-1 text-xs text-slate-600'>
							{layerPresets.map((preset) => (
								<li key={preset.id} className='flex items-center justify-between rounded-md bg-slate-50 px-2 py-1'>
									<span className='font-medium text-slate-700'>{preset.name}</span>
									<div className='flex items-center gap-2'>
										<Button
											onClick={() => {
												const nextName = window.prompt('Ubah nama preset', preset.name);
												if (!nextName) {
													return;
												}
												renamePreset(preset.id, nextName.trim());
											}}
											variant='ghost'
											size='sm'
										>
											Ubah nama
										</Button>
										<Button onClick={() => deletePreset(preset.id)} variant='ghost' size='sm' className='text-red-500 hover:text-red-600'>
											Hapus
										</Button>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{valuesPanel ? (
				<div className='rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-xs text-slate-600'>
					<p className='mb-2 font-semibold'>Nilai unik untuk field {valuesPanel.field}</p>
					{uniqueValues.length === 0 ? (
						<p>Tidak ada nilai unik (atau data belum dimuat).</p>
					) : (
						<div className='flex flex-wrap gap-2'>
							{uniqueValues.map((value) => (
								<button
									key={String(value)}
									onClick={() => handleSelectValue(value)}
									type='button'
									className='rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100'
								>
									{String(value)}
								</button>
							))}
						</div>
					)}
					<Button onClick={() => setValuesPanel(null)} variant='ghost' size='sm' className='mt-3 text-slate-500'>Tutup daftar nilai</Button>
				</div>
			) : null}

			{preview ? (
				<div className='rounded-xl border border-slate-200/70 bg-slate-900/95 p-4 text-xs text-slate-100 shadow-inner'>
					<p className='mb-3 font-semibold text-slate-100'>Preview MapLibre expression</p>
					<pre className='max-h-64 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed text-emerald-200'>{preview}</pre>
				</div>
			) : null}
		</div>
	);
};

export default QueryBuilder;
