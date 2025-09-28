import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
	default: 'btn-default',
	secondary: 'btn-secondary',
	outline: 'btn-outline',
	ghost: 'btn-ghost',
	destructive: 'btn-destructive',
};

const sizeStyles: Record<ButtonSize, string> = {
	default: 'h-10 px-4 py-2',
	sm: 'h-8 rounded-md px-3 text-xs',
	lg: 'h-11 rounded-md px-8 text-base',
	icon: 'h-10 w-10',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ asChild = false, className, variant = 'default', size = 'default', ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(
					'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:pointer-events-none disabled:opacity-80',
					variantStyles[variant],
					sizeStyles[size],
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Button.displayName = 'Button';

export { Button };
