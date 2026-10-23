import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function PageFrame({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative mx-auto w-full max-w-[1200px] border-x border-border', className)}
      {...props}
    />
  );
}
