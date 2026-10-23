import { Badge } from '@/components/ui/badge';
import { getLandingMessages } from '@/i18n/get-messages';

import { SectionHeading, SectionShell } from './section-shell';

export async function DataGuide() {
  const copy = (await getLandingMessages()).data;

  return (
    <SectionShell aria-labelledby="data-title" className="bg-surface" id="data">
      <SectionHeading description={copy.description} id="data-title" kicker={copy.kicker} title={copy.title} />
      <div className="divide-y divide-border border-x border-b border-border bg-card">
        {copy.topics.map((topic) => (
          <article className="grid gap-5 px-6 py-8 md:grid-cols-12 md:gap-8 sm:px-8" key={topic.title}>
            <div className="md:col-span-1"><Badge variant="outline">{topic.index}</Badge></div>
            <div className="md:col-span-7">
              <h3 className="text-xl font-semibold tracking-[-0.02em]">{topic.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{topic.body}</p>
            </div>
            <ul aria-label={`${topic.title} ${copy.examplesLabel}`} className="flex flex-col gap-2 md:col-span-4">
              {topic.examples.map((example) => (
                <li className="flex items-center gap-2 text-sm text-muted-foreground" key={example}>
                  <span aria-hidden="true" className="size-1.5 rounded-sm bg-primary" />
                  {example}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
