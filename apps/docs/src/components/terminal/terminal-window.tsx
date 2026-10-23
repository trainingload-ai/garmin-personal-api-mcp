import { Check, CircleDot, LoaderCircle } from 'lucide-react';

import type { LandingMessages } from '@/lib/content/types';
import { cn } from '@/lib/utils';

type Scenario = LandingMessages['terminal']['scenarios'][number];

export function TerminalWindow({
  answerStage,
  copy,
  prefersReducedMotion,
  scenario,
  scenarioCount,
  scenarioIndex,
  visualStage,
}: {
  answerStage: number;
  copy: LandingMessages['terminal'];
  prefersReducedMotion: boolean;
  scenario: Scenario;
  scenarioCount: number;
  scenarioIndex: number;
  visualStage: number;
}) {
  return (
    <div aria-hidden="true" className="min-h-[28rem] overflow-hidden rounded-lg border border-terminal-border bg-terminal-background text-terminal-foreground">
      <div className="grid min-h-11 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-terminal-border px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="max-w-[42vw] truncate rounded-md border border-terminal-border bg-terminal-surface px-2.5 py-1 font-mono text-[11px] text-terminal-muted">
          garminpersonalapi.com/mcp
        </div>
        <div className="flex items-center justify-self-end gap-1.5 font-mono text-[10px] text-terminal-success">
          <span className="mr-1 hidden text-terminal-muted sm:inline">
            {copy.demo} {String(scenarioIndex + 1).padStart(2, '0')} / {String(scenarioCount).padStart(2, '0')}
          </span>
          <CircleDot className="size-3" />
          <span className="hidden sm:inline">{copy.connected}</span>
        </div>
      </div>

      <div className="px-4 pt-6 pb-5 font-mono sm:px-5" key={scenarioIndex}>
        <div className="flex min-h-7 items-start gap-2.5 text-[13px] leading-6">
          <span className="text-terminal-success">›</span>
          <strong className={cn('min-w-0 font-semibold', prefersReducedMotion ? null : 'terminal-type')}>
            {scenario.question}
          </strong>
          <i className={cn('mt-0.5 h-[18px] w-1.5 shrink-0 bg-terminal-success', prefersReducedMotion ? 'hidden' : 'terminal-cursor')} />
        </div>

        <div className="mt-5">
          {scenario.calls.map(([name, detail], index) => {
            const callStage = index + 1;
            const isVisible = visualStage >= callStage;
            const isComplete = visualStage > callStage;

            return (
              <div
                className={cn(
                  'grid min-h-14 translate-y-1.5 grid-cols-1 items-center gap-1 border-t border-terminal-border py-3 opacity-0 transition-[opacity,transform] duration-200 motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:grid-cols-[minmax(12rem,0.46fr)_minmax(0,0.54fr)] sm:gap-4',
                  isVisible ? 'translate-y-0 opacity-100' : null,
                )}
                key={name}
              >
                <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-terminal-success">
                  <span className="grid size-3.5 shrink-0 place-items-center [&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:size-3.5">
                    {prefersReducedMotion || isComplete ? <Check /> : <LoaderCircle className="animate-spin" />}
                  </span>
                  <span>{name}</span>
                </div>
                <div className="pl-5.5 text-[10px] leading-5 text-terminal-muted sm:pl-0">{detail}</div>
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            'mt-5 min-h-20 translate-y-1.5 border-l-2 border-terminal-success bg-terminal-surface px-3.5 py-3 text-[11px] leading-5 text-terminal-muted opacity-0 transition-[opacity,transform] duration-200 motion-reduce:translate-y-0 motion-reduce:opacity-100',
            visualStage >= answerStage ? 'translate-y-0 opacity-100' : null,
          )}
        >
          {scenario.answer}
        </div>
      </div>
    </div>
  );
}
