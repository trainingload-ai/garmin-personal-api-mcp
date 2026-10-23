import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { afterEach, describe, expect, it } from 'vitest';

import { TOOL_NAMES } from '../../src/tools/index.js';

const homes: string[] = [];

afterEach(async () => {
  await Promise.all(homes.splice(0).map((home) => fs.rm(home, { force: true, recursive: true })));
});

describe('stdio MCP contract', () => {
  it('initializes, lists the complete read-only tool surface, and returns stable errors', async () => {
    const home = await fs.mkdtemp(path.join(tmpdir(), 'garmin-mcp-stdio-'));
    homes.push(home);
    const client = new Client({ name: 'contract-test', version: '1.0.0' });
    const transport = new StdioClientTransport({
      args: ['--import', 'tsx', 'src/index.ts'],
      command: process.execPath,
      cwd: path.resolve(import.meta.dirname, '../..'),
      env: {
        ...Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== undefined)),
        GARMIN_PERSONAL_API_KEY: '',
        HOME: home,
        USERPROFILE: home,
      },
      stderr: 'pipe',
    });
    try {
      await client.connect(transport);
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name).sort()).toEqual([...TOOL_NAMES].sort());
      for (const tool of tools) {
        expect(tool.annotations).toMatchObject({
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
          readOnlyHint: true,
        });
        expect(tool.outputSchema).toBeDefined();
      }
      const result = await client.callTool({ name: 'garmin_get_profile', arguments: {} });
      expect(result.isError).toBe(true);
      expect(result.content[0]).toMatchObject({ type: 'text' });
      if (result.content[0]?.type === 'text') {
        expect(result.content[0].text).toContain('credentials_missing');
      }
    } finally {
      await client.close();
    }
  }, 30_000);
});
