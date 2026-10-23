import { ArrowRight, Github } from 'lucide-react';

import { McpTerminalDemo } from '@/components/terminal/mcp-terminal-demo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLandingMessages } from '@/i18n/get-messages';
import type { Locale } from '@/lib/content/types';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

import { CopyButton } from './copy-button';
import { GridCrosses } from './grid-crosses';
import { PageFrame } from './page-frame';

export async function Hero({ locale }: { locale: Locale }) {
  const copy = await getLandingMessages();
  const trust = copy.hero.trust;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border" id="top">
        <div aria-hidden="true" className="instrument-grid pointer-events-none absolute inset-0 opacity-55 [mask-image:linear-gradient(to_bottom,black,transparent_95%)]" />
        <PageFrame className="grid min-h-[42rem] grid-cols-1 lg:grid-cols-12">
          <GridCrosses className="hidden sm:block" />
          <div className="relative flex min-w-0 flex-col justify-center border-b border-border px-5 py-16 sm:px-8 md:py-20 lg:col-span-5 lg:border-r lg:border-b-0 lg:px-10 lg:py-24">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">{copy.hero.eyebrow}</p>
              <Badge variant="secondary">v0.1</Badge>
            </div>
            <h1 className={cn('mt-7 text-5xl leading-[0.96] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]', locale === 'zh' ? 'leading-[1.04] tracking-[-0.045em]' : null)}>
              <span className="block">{copy.hero.titleLead}</span>
              <span className="mt-1 block text-primary">{copy.hero.titleAccent}</span>
            </h1>
            <p className="mt-7 max-w-[62ch] text-base leading-7 text-muted-foreground">{copy.hero.description}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button asChild size="lg">
                <a href="#quickstart">
                  {copy.hero.start}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={site.github} rel="noreferrer" target="_blank">
                  {copy.hero.source}
                  <Github data-icon="inline-end" aria-hidden="true" />
                </a>
              </Button>
            </div>
            <div aria-label={copy.hero.commandLabel} className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-border bg-card p-2 pl-3">
              <span className="font-mono font-bold text-primary">›</span>
              <code className="overflow-x-auto whitespace-nowrap text-[11px] text-muted-foreground">{site.setupPrompt}</code>
              <CopyButton copiedLabel={copy.common.copied} label={copy.common.copy} text={site.setupPrompt} />
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5">
              {trust.slice(0, 3).map((item) => (
                <li className="flex items-center gap-2 text-xs text-muted-foreground" key={item}>
                  <span aria-hidden="true" className="size-1.5 rounded-sm bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 items-center lg:col-span-7">
            <McpTerminalDemo copy={copy.terminal} />
          </div>
        </PageFrame>
      </section>

      <aside aria-label={copy.hero.trustLabel} className="border-b border-border bg-surface">
        <PageFrame className="grid grid-cols-2 md:grid-cols-4">
          {trust.map((item, index) => (
            <div className="flex min-h-16 items-center gap-3 border-r border-border px-5 last:border-r-0 even:border-r-0 md:even:border-r md:last:border-r-0" key={item}>
              <strong className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, '0')}</strong>
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </PageFrame>
      </aside>
    </>
  );
}
