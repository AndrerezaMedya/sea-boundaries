import * as ToastPrimitives from '@radix-ui/react-toast';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = forwardRef<
	ElementRef<typeof ToastPrimitives.Viewport>,
	ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed inset-x-0 top-4 z-[100] flex max-h-screen w-full flex-col-reverse items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col sm:items-end',
			className,
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

type ToastVariant = 'default' | 'destructive';

const toastVariants: Record<ToastVariant, string> = {
	default: 'border bg-background text-foreground shadow-lg',
	destructive: 'border-destructive bg-destructive text-destructive-foreground shadow-lg',
};

const Toast = forwardRef<
	ElementRef<typeof ToastPrimitives.Root>,
	ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: ToastVariant }
>(({ className, variant = 'default', ...props }, ref) => (
	<ToastPrimitives.Root
		ref={ref}
		className={cn(
			'pointer-events-auto relative flex w-full min-w-[280px] max-w-sm items-center justify-between gap-3 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[state=closed]:animate-toast-out data-[state=open]:animate-toast-in data-[swipe=end]:animate-toast-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-all',
			toastVariants[variant],
			className,
		)}
		{...props}
	/>
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastTitle = forwardRef<
	ElementRef<typeof ToastPrimitives.Title>,
	ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = forwardRef<
	ElementRef<typeof ToastPrimitives.Description>,
	ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastClose = forwardRef<
	ElementRef<typeof ToastPrimitives.Close>,
	ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn('absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-70 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
		toast-close=''
		{...props}
	/>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose };
