import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(function Table(
	{ className, ...props },
	ref,
) {
	return (
		<div className='relative w-full overflow-auto rounded-md border border-border'>
			<table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	);
});

Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	function TableHeader({ className, ...props }, ref) {
		return <thead ref={ref} className={cn('[&_tr]:border-b bg-muted/50', className)} {...props} />;
	},
);

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	function TableBody({ className, ...props }, ref) {
		return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
	},
);

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow(
	{ className, ...props },
	ref,
) {
	return (
		<tr
			ref={ref}
			className={cn(
				'border-b transition-colors hover:bg-muted/60 data-[state=selected]:bg-muted',
				className,
			)}
			{...props}
		/>
	);
});

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(function TableCell(
	{ className, ...props },
	ref,
) {
	return <td ref={ref} className={cn('p-3 align-middle', className)} {...props} />;
});

const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(function TableHead(
	{ className, ...props },
	ref,
) {
	return (
		<th
			ref={ref}
			className={cn('h-11 px-4 text-left align-middle text-sm font-semibold text-foreground', className)}
			{...props}
		/>
	);
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
