import type { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';

import { CopyButton } from './copy-button';

export function CodePanel({
  children,
  copy,
  copyLabel,
  copiedLabel,
  label,
}: {
  children: ReactNode;
  copy: string;
  copyLabel?: string;
  copiedLabel?: string;
  label: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex min-h-11 items-center justify-between gap-3 px-3">
        <span className="truncate font-mono text-xs text-muted-foreground">{label}</span>
        <CopyButton
          {...(copiedLabel === undefined ? {} : { copiedLabel })}
          {...(copyLabel === undefined ? {} : { label: copyLabel })}
          text={copy}
        />
      </div>
      <Separator />
      <pre className="max-h-80 overflow-auto p-4 text-xs leading-6" tabIndex={0}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
