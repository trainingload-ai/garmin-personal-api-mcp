import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLandingMessages } from '@/i18n/get-messages';
import { cn } from '@/lib/utils';

import { SectionHeading, SectionShell } from './section-shell';

const cardSpans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7', 'lg:col-span-7', 'lg:col-span-5'] as const;

export async function Capabilities() {
  const copy = (await getLandingMessages()).capabilities;

  return (
    <SectionShell aria-labelledby="capabilities-title" id="capabilities">
      <SectionHeading description={copy.description} id="capabilities-title" kicker={copy.kicker} title={copy.title} />
      <div className="grid gap-px border-x border-b border-border bg-border lg:grid-cols-12">
        {copy.groups.map((group, index) => (
          <Card className={cn('rounded-none border-0 py-0 hover:border-0', cardSpans[index])} key={group.title}>
            <CardHeader className="gap-4 px-6 pt-7 pb-4 sm:px-8">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{group.index}</Badge>
                <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
              </div>
              <CardTitle><h3 className="text-xl tracking-[-0.02em]">{group.title}</h3></CardTitle>
              <CardDescription className="max-w-xl leading-6">{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 px-6 pb-7 sm:px-8">
              {group.tools.map((tool) => <Badge key={tool} variant="secondary">{tool}</Badge>)}
            </CardContent>
          </Card>
        ))}
      </div>

      <aside className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex flex-col gap-2 border-b border-border px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-mono text-xs font-semibold tracking-[0.12em] text-primary uppercase">{copy.tryAsking}</p>
          <h3 className="text-lg font-semibold">{copy.promptTitle}</h3>
        </div>
        <div className="grid lg:grid-cols-3">
          {copy.prompts.map(([label, prompt]) => (
            <article className="border-b border-border px-6 py-6 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0" key={label}>
              <Badge variant="outline">{label}</Badge>
              <p className="mt-4 text-sm leading-6">“{prompt}”</p>
            </article>
          ))}
        </div>
      </aside>
    </SectionShell>
  );
}
