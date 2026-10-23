import { ArrowRight, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getLandingMessages } from '@/i18n/get-messages';
import { site } from '@/lib/site';

import { CopyButton } from './copy-button';
import { GridCrosses } from './grid-crosses';
import { PageFrame } from './page-frame';

export async function FinalCta() {
  const copy = await getLandingMessages();

  return (
    <section className="border-b border-border">
      <PageFrame className="instrument-grid overflow-hidden px-5 py-16 text-center sm:px-8 md:py-24 lg:px-10">
        <GridCrosses className="hidden sm:block" />
        <p className="font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">{copy.finalCta.kicker}</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.045em] sm:text-5xl md:text-6xl">
          {copy.finalCta.titleLineOne}<br /><span className="text-primary">{copy.finalCta.titleLineTwo}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground">{copy.finalCta.description}</p>
        <div aria-label={copy.finalCta.commandLabel} className="mx-auto mt-8 grid max-w-2xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card p-2 pl-4 text-left">
          <span className="font-mono font-bold text-primary">›</span>
          <code className="overflow-x-auto whitespace-nowrap text-xs text-muted-foreground">{site.setupPrompt}</code>
          <CopyButton copiedLabel={copy.common.copied} label={copy.common.copy} text={site.setupPrompt} />
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button asChild size="lg">
            <a href="#quickstart">{copy.finalCta.steps}<ArrowRight data-icon="inline-end" aria-hidden="true" /></a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={site.github} rel="noreferrer" target="_blank">{copy.finalCta.github}<Github data-icon="inline-end" aria-hidden="true" /></a>
          </Button>
        </div>
      </PageFrame>
    </section>
  );
}
