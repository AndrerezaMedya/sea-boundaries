import { cn } from '@/lib/utils';

/** Shared layout for map tool panels: bottom sheet on mobile, left dock on md+. */
export const mapToolPanelClassName = (extra?: string) =>
	cn(
		'absolute z-40 flex flex-col overflow-hidden',
		'border border-[color:var(--color-border)] bg-[color:var(--color-panel)] shadow-[var(--shadow-strong)]',
		'inset-x-0 bottom-0 max-h-[min(88dvh,calc(100dvh-3.25rem))] rounded-t-2xl panel-slide-up',
		'md:inset-x-auto md:left-4 md:top-4 md:bottom-4 md:w-[min(340px,calc(100vw-2rem))] md:max-h-none md:rounded-2xl md:panel-slide-left',
		extra,
	);
