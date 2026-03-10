import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type SwitchRef = ElementRef<typeof SwitchPrimitive.Root>;

type SwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

const Switch = forwardRef<SwitchRef, SwitchProps>(({ className, ...props }, ref) => {
	const isChecked = props.checked ?? props.defaultChecked ?? false;

	return (
		<SwitchPrimitive.Root
			ref={ref}
			className={cn(
				'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			style={{
				backgroundColor: isChecked ? 'var(--switch-checked-bg)' : 'var(--switch-unchecked-bg)',
				borderColor: isChecked ? 'var(--switch-checked-border)' : 'var(--switch-unchecked-border)',
			}}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className='pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-4'
			/>
		</SwitchPrimitive.Root>
	);
});

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
