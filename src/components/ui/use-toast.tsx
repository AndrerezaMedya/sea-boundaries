/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';

export type ToastVariant = 'default' | 'destructive';

export interface ToastOptions {
	id?: string;
	title?: string;
	description?: string;
	variant?: ToastVariant;
	duration?: number;
}

interface ToastRecord extends ToastOptions {
	id: string;
}

interface ToastContextValue {
	toast: (options: ToastOptions) => string;
	dismiss: (id?: string) => void;
	toasts: ToastRecord[];
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const createId = (): string => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2);
};

export const ToastManagerProvider = ({ children }: { children: ReactNode }) => {
	const [toasts, setToasts] = useState<ToastRecord[]>([]);

	const toast = useCallback((options: ToastOptions) => {
		const id = options.id ?? createId();
		setToasts((items) => {
			const existingIndex = items.findIndex((item) => item.id === id);
			const payload: ToastRecord = {
				variant: 'default',
				...options,
				id,
			};
			if (existingIndex >= 0) {
				const clone = [...items];
				clone[existingIndex] = payload;
				return clone;
			}
			return [...items, payload];
		});
		return id;
	}, []);

	const dismiss = useCallback((id?: string) => {
		setToasts((items) => {
			if (!id) {
				return [];
			}
			return items.filter((item) => item.id !== id);
		});
	}, []);

	const value = useMemo<ToastContextValue>(
		() => ({ toast, dismiss, toasts }),
		[toast, dismiss, toasts],
	);

	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToastContext = (): ToastContextValue => {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useToastContext must be used within ToastManagerProvider');
	}
	return ctx;
};

export const useToast = () => {
	const { toast, dismiss } = useToastContext();
	return { toast, dismiss };
};

export const Toaster = () => {
	const { toasts, dismiss } = useToastContext();
	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, variant = 'default', duration }) => (
				<Toast
					key={id}
					variant={variant}
					duration={duration}
					open
					onOpenChange={(open) => {
						if (!open) {
							dismiss(id);
						}
					}}
				>
					<div className='flex flex-col gap-1 pr-6'>
						{title ? <ToastTitle>{title}</ToastTitle> : null}
						{description ? <ToastDescription>{description}</ToastDescription> : null}
					</div>
					<ToastClose onClick={() => dismiss(id)} />
				</Toast>
				))}
			<ToastViewport />
		</ToastProvider>
	);
};
