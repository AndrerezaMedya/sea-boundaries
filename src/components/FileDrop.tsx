import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

type FileDropProps = {
	onFiles: (files: FileList) => void;
	accept?: string;
	idleHint?: ReactNode;
	activeHint?: ReactNode;
	children?: ReactNode;
};

const FileDrop = ({ onFiles, accept, idleHint, activeHint, children }: FileDropProps) => {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (!isDragging) {
			setIsDragging(true);
		}
	}, [isDragging]);

	const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			setIsDragging(false);
			const files = event.dataTransfer.files;
			if (!files || files.length === 0) {
				return;
			}
			if (accept) {
				const acceptedTypes = accept.split(',').map((entry) => entry.trim().toLowerCase());
				const filtered = Array.from(files).filter((file) => {
					const lowerName = file.name.toLowerCase();
					const lowerType = file.type.toLowerCase();
					return acceptedTypes.some((type) => {
						if (type === '*/*') {
							return true;
						}
						if (type.startsWith('.')) {
							return lowerName.endsWith(type);
						}
						return lowerType === type;
					});
				});
				if (filtered.length === 0) {
					return;
				}
				const dataTransfer = new DataTransfer();
				filtered.forEach((file) => dataTransfer.items.add(file));
				onFiles(dataTransfer.files);
				return;
			}
			onFiles(files);
		},
		[accept, onFiles],
	);

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`relative flex min-h-[140px] flex-col items-center justify-center rounded-2xl border-2 border-dashed shadow-sm transition ${
				isDragging ? 'border-slate-400 bg-slate-100/70' : 'border-slate-300 bg-white'
			}`}
		>
			<div className='pointer-events-none flex flex-col items-center gap-2 px-4 text-center text-xs font-medium text-slate-600'>
				{isDragging ? activeHint ?? 'Lepaskan berkas di sini' : idleHint ?? 'Seret & jatuhkan berkas GeoJSON Anda'}
			</div>
			{children ? <div className='pointer-events-none mt-3 px-4 text-[11px] text-slate-500'>{children}</div> : null}
		</div>
	);
};

export default FileDrop;
export {};
