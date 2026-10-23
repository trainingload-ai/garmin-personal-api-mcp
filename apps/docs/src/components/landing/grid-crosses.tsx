import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const positions = [
  'left-0 top-0',
  'right-0 top-0',
  'bottom-0 left-0',
  'right-0 bottom-0',
] as const;

export function GridCrosses({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0', className)}
      {...props}
    >
      {positions.map((position) => (
        <span
          className={cn(
            'absolute size-[9px] before:absolute before:top-1/2 before:h-px before:w-full before:-translate-y-1/2 before:bg-border after:absolute after:left-1/2 after:h-full after:w-px after:-translate-x-1/2 after:bg-border',
            position,
          )}
          key={position}
        />
      ))}
    </div>
  );
}
