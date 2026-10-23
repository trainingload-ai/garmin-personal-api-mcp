import { Bot, Braces, Cloud, KeyRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getLandingMessages } from '@/i18n/get-messages';

import { SectionHeading, SectionShell } from './section-shell';

const flowIcons = [Bot, Braces, Cloud] as const;

export async function HowItWorks() {
  const copy = (await getLandingMessages()).how;

  return (
    <SectionShell aria-labelledby="how-title" id="how-it-works">
      <SectionHeading description={copy.description} id="how-title" kicker={copy.kicker} title={copy.title} />

      <div className="grid gap-px border-x border-b border-border bg-border md:grid-cols-3">
        {copy.flow.map((item, index) => {
          const Icon = flowIcons[index] ?? Bot;
          return (
            <Card className="rounded-none border-0 py-0 hover:border-0" key={item.title}>
              <CardHeader className="gap-5 px-6 pt-7 pb-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.index}</Badge>
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                </div>
                <div className="flex flex-col gap-3">
                  <CardTitle><h3 className="text-xl tracking-[-0.02em]">{item.title}</h3></CardTitle>
                  <CardDescription className="leading-6">{item.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-7">
                <code className="text-xs text-muted-foreground">{item.meta}</code>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <article className="mt-8 grid overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-12">
        <div className="flex gap-4 px-6 py-7 lg:col-span-7 lg:px-8">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-primary" aria-hidden="true">
            <KeyRound className="size-5" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.12em] text-primary uppercase">{copy.authKicker}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{copy.authTitle}</h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.authDescription}</p>
          </div>
        </div>
        <Separator className="lg:hidden" />
        <dl className="grid bg-border lg:col-span-5 lg:grid-rows-3 lg:gap-px lg:border-l lg:border-border">
          {copy.facts.map(([label, value]) => (
            <div className="flex items-center justify-between gap-5 border-b border-border bg-card px-6 py-4 last:border-b-0 lg:border-b-0" key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-mono text-xs font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </SectionShell>
  );
}
