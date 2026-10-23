import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLandingMessages } from '@/i18n/get-messages';

import { CodePanel } from './code-panel';
import { SectionHeading, SectionShell } from './section-shell';

const configs = {
  codex: `codex mcp add trainingloadai -- npx -y @trainingloadai/garmin-personal-api-mcp
codex mcp list`,
  claude: `claude mcp add trainingloadai --scope user -- npx -y @trainingloadai/garmin-personal-api-mcp
claude mcp get trainingloadai
claude mcp list`,
  cursor: `{
  "mcpServers": {
    "trainingloadai": {
      "command": "npx",
      "args": ["-y", "@trainingloadai/garmin-personal-api-mcp"]
    }
  }
}`,
  windows: `{
  "mcpServers": {
    "trainingloadai": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@trainingloadai/garmin-personal-api-mcp"]
    }
  }
}`,
  source: `{
  "mcpServers": {
    "trainingloadai": {
      "command": "pnpm",
      "args": ["--filter", "@trainingloadai/garmin-personal-api-mcp", "dev"],
      "cwd": "/absolute/path/to/garmin-personal-api-mcp"
    }
  }
}`,
} as const;

export async function ClientConfig() {
  const copy = await getLandingMessages();
  const panels = [
    { value: 'codex', label: 'Codex', panelLabel: 'Codex CLI', code: configs.codex },
    { value: 'claude', label: 'Claude Code', panelLabel: 'Claude Code CLI', code: configs.claude },
    { value: 'cursor', label: 'Cursor', panelLabel: '~/.cursor/mcp.json', code: configs.cursor },
    { value: 'windows', label: 'Windows', panelLabel: copy.clients.windowsConfig, code: configs.windows },
    { value: 'source', label: copy.clients.source, panelLabel: copy.clients.developmentOnly, code: configs.source },
  ];

  return (
    <SectionShell aria-labelledby="clients-title" className="bg-surface" id="clients">
      <SectionHeading description={copy.clients.description} id="clients-title" kicker={copy.clients.kicker} title={copy.clients.title} />
      <div className="grid gap-8 pt-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
            {[
              [copy.clients.transport, copy.clients.transportValue],
              [copy.clients.protocol, copy.clients.protocolValue],
              [copy.clients.verified, copy.clients.verifiedValue],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between gap-4 bg-card px-4 py-3" key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd><Badge variant="secondary">{value}</Badge></dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">{copy.clients.note}</p>
        </div>
        <div className="min-w-0 lg:col-span-8">
          <Tabs defaultValue="codex">
            <TabsList aria-label={copy.clients.tabsLabel} className="max-w-full justify-start overflow-x-auto">
              {panels.map((panel) => <TabsTrigger key={panel.value} value={panel.value}>{panel.label}</TabsTrigger>)}
            </TabsList>
            {panels.map((panel) => (
              <TabsContent key={panel.value} value={panel.value}>
                <CodePanel copy={panel.code} copiedLabel={copy.common.copied} copyLabel={copy.common.copy} label={panel.panelLabel}>{panel.code}</CodePanel>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </SectionShell>
  );
}
