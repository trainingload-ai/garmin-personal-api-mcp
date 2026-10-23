import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getLandingMessages } from '@/i18n/get-messages';
import { site } from '@/lib/site';

import { SectionHeading, SectionShell } from './section-shell';

export async function ProjectFacts() {
  const copy = (await getLandingMessages()).projectFacts;
  const sources = [
    { href: site.garminPersonalApi, label: copy.sourceLabels.garmin },
    { href: site.mcp, label: copy.sourceLabels.mcp },
    { href: site.github, label: copy.sourceLabels.github },
    { href: site.npm, label: copy.sourceLabels.npm },
  ];

  return (
    <SectionShell aria-labelledby="project-facts-title" className="bg-surface" id="project-facts">
      <SectionHeading
        description={copy.description}
        id="project-facts-title"
        kicker={copy.kicker}
        title={copy.title}
      />

      <div className="grid gap-px border-x border-b border-border bg-border md:grid-cols-2">
        {copy.items.map((item) => (
          <dl className="bg-card px-6 py-6 sm:px-7" key={item.label}>
            <dt className="font-mono text-xs font-semibold tracking-[0.1em] text-primary uppercase">
              {item.label}
            </dt>
            <dd className="mt-3 text-sm leading-6 text-muted-foreground">{item.value}</dd>
          </dl>
        ))}
      </div>

      <aside className="grid gap-6 border-x border-b border-border bg-card px-6 py-7 md:grid-cols-12 md:items-center sm:px-7">
        <div className="md:col-span-5">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">{copy.sourcesTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.sourcesDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-7 md:justify-end">
          {sources.map((source) => (
            <Button asChild key={source.href} size="sm" variant="outline">
              <a href={source.href} rel="noreferrer" target="_blank">
                {source.label}
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          ))}
        </div>
      </aside>
    </SectionShell>
  );
}
