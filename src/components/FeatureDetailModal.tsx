import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLayerSchema } from '@/lib/schema';
import type { LayerId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLayersStore } from '@/store/useLayers';

interface FeatureDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	layerId: LayerId;
	featureId: string;
}

const formatValue = (value: unknown): string => {
	if (value === undefined || value === null || value === '') {
		return '—';
	}
	if (typeof value === 'boolean') {
		return value ? 'Ya' : 'Tidak';
	}
	// Semua value ditampilkan sebagai string, tidak ada formatting number
	return String(value);
};

const FeatureDetailModal = ({ isOpen, onClose, layerId, featureId }: FeatureDetailModalProps) => {
	const getFeatureById = useLayersStore((state) => state.getFeatureById);
	const schema = getLayerSchema(layerId);
	const modalRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	const feature = useMemo(() => {
		return getFeatureById(layerId, featureId);
	}, [getFeatureById, layerId, featureId]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen) {
			// Reset position saat modal dibuka
			setPosition({ x: 0, y: 0 });
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const dx = e.clientX - dragStart.x;
			const dy = e.clientY - dragStart.y;
			setPosition({ x: dx, y: dy });
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragStart]);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		// Only start drag if clicking on the header, not on the close button
		if ((e.target as HTMLElement).closest('button')) {
			return;
		}
		setIsDragging(true);
		setDragStart({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});
	};

	if (!isOpen) {
		return null;
	}

	if (!feature) {
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
				<div className='w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl'>
					<p className='text-center text-slate-600'>Fitur tidak ditemukan</p>
					<div className='mt-4 text-center'>
						<Button onClick={onClose} variant='outline'>
							Tutup
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const properties = feature.properties ?? {};
	const attributes = schema.fields.map((field) => ({
		name: field.name,
		label: field.label,
		value: properties[field.name],
		type: field.type,
	}));

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div 
				ref={modalRef}
				className='flex h-[70vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl'
				style={{
					transform: `translate(${position.x}px, ${position.y}px)`,
					cursor: isDragging ? 'grabbing' : 'default',
				}}
			>
				{/* Header - Draggable */}
				<div 
					className='flex items-center justify-between border-b border-slate-200 px-5 py-3.5 cursor-grab active:cursor-grabbing select-none'
					onMouseDown={handleMouseDown}
				>
					<div>
						<h2 className='text-base font-semibold text-slate-900'>Atribut Fitur</h2>
						<p className='text-xs text-slate-600'>
							{schema.label} - ID: {featureId}
						</p>
					</div>
					<Button variant='ghost' size='icon' onClick={onClose} aria-label='Tutup' className='h-8 w-8'>
						<X className='h-4 w-4' />
					</Button>
				</div>

				{/* Content */}
				<div className='flex-1 overflow-auto p-5'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[40%] text-xs font-semibold text-slate-900'>Field</TableHead>
								<TableHead className='text-xs font-semibold text-slate-900'>Value</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{attributes.map((attr, index) => (
								<TableRow key={attr.name} className={cn(index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white')}>
									<TableCell className='py-2 text-xs font-medium text-slate-700'>{attr.label}</TableCell>
									<TableCell className='py-2 font-mono text-xs text-slate-900'>{formatValue(attr.value)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Footer */}
				<div className='border-t border-slate-200 px-5 py-3'>
					<div className='flex items-center justify-between'>
						<p className='text-xs text-slate-600'>
							Total: {attributes.length} atribut
						</p>
						<Button onClick={onClose} variant='secondary' size='sm'>
							Tutup
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeatureDetailModal;
