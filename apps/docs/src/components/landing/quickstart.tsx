import { ArrowUpRight, Bot, KeyRound, RotateCw, TerminalSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLandingMessages } from '@/i18n/get-messages';
import { site } from '@/lib/site';

import { CodePanel } from './code-panel';
import { SectionHeading, SectionShell } from './section-shell';

const stepIcons = [KeyRound, Bot, TerminalSquare, RotateCw] as const;

export async function Quickstart() {
  const copy = await getLandingMessages();
  const steps = [
    {
      title: copy.quickstart.keyTitle,
      description: copy.quickstart.keyDescription,
      extra: (
        <Button asChild size="sm" variant="outline">
          <a href={site.garminApiKey} rel="noreferrer" target="_blank">
            {copy.quickstart.keyLink}
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </a>
        </Button>
      ),
    },
    {
      title: copy.quickstart.agentTitle,
      description: copy.quickstart.agentDescription,
      extra: (
        <div className="flex flex-col gap-3">
          <CodePanel copy={site.setupPrompt} copiedLabel={copy.common.copied} copyLabel={copy.common.copy} label={copy.quickstart.commandLabel}>
            {site.setupPrompt}
          </CodePanel>
          <p className="text-xs leading-5 text-muted-foreground">
            {copy.quickstart.contractBefore}<a className="underline underline-offset-4 hover:text-foreground" href={site.agentInstructions}>{copy.quickstart.contractLink}</a>{copy.quickstart.contractAfter}
          </p>
        </div>
      ),
    },
    {
      title: copy.quickstart.localTitle,
      description: (
        <>{copy.quickstart.localDescriptionBefore}<code className="rounded-sm bg-muted px-1 py-0.5 text-xs">127.0.0.1</code>{copy.quickstart.localDescriptionAfter}</>
      ),
      extra: (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-xs">
          <span className="text-muted-foreground">{copy.quickstart.clientHandles}</span>
          <code>auth → register → doctor → verify</code>
        </div>
      ),
    },
    {
      title: copy.quickstart.reloadTitle,
      description: copy.quickstart.reloadDescription,
      extra: (
        <div className="flex flex-col gap-3">
          <blockquote className="border-l-2 border-primary bg-surface px-4 py-3 text-sm leading-6">{copy.quickstart.examplePrompt}</blockquote>
          <p className="text-xs leading-5 text-muted-foreground">
            {copy.quickstart.docsBefore}<a className="underline underline-offset-4 hover:text-foreground" href={site.codexMcpDocs}>{copy.quickstart.docsCodex}</a>,{' '}
            <a className="underline underline-offset-4 hover:text-foreground" href={site.claudeMcpDocs}>{copy.quickstart.docsClaude}</a>, {copy.quickstart.docsOr}{' '}
            <a className="underline underline-offset-4 hover:text-foreground" href={site.cursorMcpDocs}>{copy.quickstart.docsCursor}</a>{copy.quickstart.docsAfter}
          </p>
        </div>
      ),
    },
  ];

  return (
    <SectionShell aria-labelledby="quickstart-title" id="quickstart">
      <SectionHeading description={copy.quickstart.description} id="quickstart-title" kicker={copy.quickstart.kicker} title={copy.quickstart.title} />
      <ol className="grid border-x border-b border-border lg:grid-cols-2">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] ?? Bot;
          return (
            <li className="grid min-w-0 grid-cols-[auto_1fr] gap-4 border-b border-border p-6 last:border-b-0 sm:p-8 lg:border-r lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(n+3)]:border-b-0" key={step.title}>
              <Badge className="self-start" variant="outline">{String(index + 1).padStart(2, '0')}</Badge>
              <div className="min-w-0">
                <Icon aria-hidden="true" className="size-5 text-primary" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                <div className="mt-5">{step.extra}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
