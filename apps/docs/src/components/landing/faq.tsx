import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { getLandingMessages } from '@/i18n/get-messages';

import { SectionHeading, SectionShell } from './section-shell';

export async function FAQ() {
  const copy = (await getLandingMessages()).faq;

  return (
    <SectionShell aria-labelledby="faq-title" className="bg-surface" id="faq">
      <SectionHeading description={copy.description} id="faq-title" kicker={copy.kicker} title={copy.title} />
      <div className="grid gap-8 pt-10 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="text-6xl font-semibold tracking-[-0.055em] tabular-nums">{String(copy.items.length).padStart(2, '0')}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground uppercase">{copy.answers}</p>
        </div>
        <Accordion className="overflow-hidden rounded-lg border border-border bg-card lg:col-span-9" collapsible type="single">
          {copy.items.map((item, index) => (
            <AccordionItem className="px-5 sm:px-6" key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-base hover:no-underline">
                <span className="flex items-start gap-4 pr-4">
                  <Badge variant="outline">{String(index + 1).padStart(2, '0')}</Badge>
                  <span>{item.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pr-8 pb-6 pl-12 text-sm leading-6 text-muted-foreground">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionShell>
  );
}
