import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { GridCrosses } from './grid-crosses';
import { PageFrame } from './page-frame';

export function SectionShell({ className, children, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('border-b border-border', className)} {...props}>
      <PageFrame className="px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <GridCrosses className="hidden sm:block" />
        {children}
      </PageFrame>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
  id,
  className,
}: {
  kicker: string;
  title: ReactNode;
  description: ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-6 border-b border-border pb-10 md:grid-cols-12 md:items-end md:gap-8 md:pb-14',
        className,
      )}
    >
      <div className="md:col-span-7">
        <p className="font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          {kicker}
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-4xl md:text-5xl" id={id}>
          {title}
        </h2>
      </div>
      <p className="max-w-xl text-base leading-7 text-muted-foreground md:col-span-5 md:justify-self-end">
        {description}
      </p>
    </div>
  );
}
