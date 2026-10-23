import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getMessagesForLocale } from '@/i18n/messages';

import { TerminalWindow } from './terminal-window';

describe('TerminalWindow', () => {
  it('renders a complete, non-looping result for reduced motion', () => {
    const copy = getMessagesForLocale('en').terminal;
    const scenario = copy.scenarios[0]!;
    const answerStage = scenario.calls.length + 1;
    const html = renderToStaticMarkup(
      <TerminalWindow
        answerStage={answerStage}
        copy={copy}
        prefersReducedMotion
        scenario={scenario}
        scenarioCount={copy.scenarios.length}
        scenarioIndex={0}
        visualStage={answerStage}
      />,
    );

    expect(html).toContain(scenario.question);
    expect(html).toContain(scenario.answer);
    for (const [toolName] of scenario.calls) expect(html).toContain(toolName);
    expect(html).not.toContain('animate-spin');
    expect(html).not.toContain('terminal-type');
    expect(html).not.toContain('terminal-cursor');
  });
});
