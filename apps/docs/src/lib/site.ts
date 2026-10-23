const packageName = '@trainingloadai/garmin-personal-api-mcp';

export const site = {
  name: 'Garmin Personal API MCP',
  shortName: 'Garmin Personal API MCP',
  publisher: 'Trainingload.ai',
  version: '0.1.0',
  origin: 'https://garminpersonalapi.com',
  description:
    'A local, read-only, open-source Garmin MCP server for activities, sleep, HRV, Body Battery, heart rate, and wellness data through the official Garmin Personal API.',
  github: 'https://github.com/trainingload-ai/garmin-personal-api-mcp',
  npm: `https://www.npmjs.com/package/${packageName}`,
  garminPersonalApi: 'https://developer.garmin.com/gc-developer-program/personal/',
  garminApiKey: 'https://connect.garmin.com/app/settings/personalApiToken',
  mcp: 'https://modelcontextprotocol.io/',
  codexMcpDocs: 'https://learn.chatgpt.com/docs/extend/mcp',
  claudeMcpDocs: 'https://docs.anthropic.com/en/docs/claude-code/mcp',
  cursorMcpDocs: 'https://docs.cursor.com/context/model-context-protocol',
  agentInstructions: 'https://github.com/trainingload-ai/garmin-personal-api-mcp/blob/main/AGENTS.md',
  quickstart: `npx -y ${packageName} auth`,
  setupPrompt: `Connect ${packageName}`,
  packageName,
} as const;
