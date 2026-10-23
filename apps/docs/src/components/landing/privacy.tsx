import { ArrowUpRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLandingMessages } from '@/i18n/get-messages';
import { site } from '@/lib/site';

import { SectionShell } from './section-shell';

export async function Privacy() {
  const copy = (await getLandingMessages()).privacy;

  return (
    <SectionShell aria-labelledby="privacy-title" id="privacy">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase">{copy.kicker}</p>
          <h2 className="mt-4 text-3xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-4xl" id="privacy-title">{copy.title}</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{copy.description}</p>
          <Button asChild className="mt-7" size="sm" variant="outline">
            <a href={`${site.github}/blob/main/SECURITY.md`} rel="noreferrer" target="_blank">
              {copy.link}
              <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
            </a>
          </Button>
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card lg:col-span-7">
          {copy.boundaries.map(([title, description], index) => (
            <article className="grid grid-cols-[auto_1fr] gap-4 px-5 py-5 sm:px-6" key={title}>
              <Badge className="self-start" variant="outline">{String(index + 1).padStart(2, '0')}</Badge>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
