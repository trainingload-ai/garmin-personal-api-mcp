import { once } from 'node:events';
import process from 'node:process';

import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { TokenProvider } from './auth.js';
import { normalizeError } from './errors.js';
import { GarminClient } from './garmin-client.js';
import {
  detectLocalAuthLocale,
  isSupportedLocalAuthLocale,
  openLocalAuthPage,
  resolveLocalAuthLocale,
  startLocalAuthPage,
  type LocalAuthLocale,
} from './local-auth-page.js';
import { createServer, SERVER_VERSION } from './server.js';
import {
  credentialPermissionWarnings,
  getRuntimeSettings,
  resolveApiKey,
  writeApiKey,
} from './settings.js';

const HELP = `Garmin Personal API MCP ${SERVER_VERSION}

Usage:
  garmin-personal-api-mcp              Start the local stdio MCP server
  garmin-personal-api-mcp auth [--locale en|zh]
                                     Open a localized page to validate and save an API key
  garmin-personal-api-mcp auth --terminal  Use a hidden terminal prompt instead
  garmin-personal-api-mcp auth --check Check saved credentials and Garmin connectivity
  garmin-personal-api-mcp doctor       Check Node.js, local credentials, permissions, and connectivity
  garmin-personal-api-mcp --version    Print the version
  garmin-personal-api-mcp --help       Show this help
`;

export async function runCli(args = process.argv.slice(2)): Promise<number> {
  const [command, ...rest] = args;
  if (!command) {
    void serveStdio(() => createServer());
    return 0;
  }
  if (command === '--version' || command === '-v') {
    process.stdout.write(`${SERVER_VERSION}\n`);
    return 0;
  }
  if (command === '--help' || command === '-h' || command === 'help') {
    process.stdout.write(HELP);
    return 0;
  }
  if (command === 'auth') return runAuth(rest);
  if (command === 'doctor') return runDoctor();
  process.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
  return 2;
}

async function runAuth(args: string[]): Promise<number> {
  const parsed = parseAuthOptions(args);
  if ('error' in parsed) {
    process.stderr.write(`${parsed.error}\n`);
    return 2;
  }
  if (parsed.check && parsed.terminal) {
    process.stderr.write('Use either auth --check or auth --terminal, not both.\n');
    return 2;
  }
  if (parsed.check) {
    try {
      const resolved = await resolveApiKey();
      await new GarminClient().getJson('/userprofile-service/userprofile/settings');
      process.stdout.write(`Credentials are valid (${resolved.source}).\n`);
      return 0;
    } catch (error) {
      printCliError(error);
      return 1;
    }
  }

  try {
    const settings = getRuntimeSettings();
    const validateAndSave = async (apiKey: string) => {
      const tokenProvider = new TokenProvider({ apiKey, settings });
      // Authorization must validate the key that was just submitted, even when a
      // bearer token for the same key is still present in the local cache.
      await tokenProvider.getToken({ forceRefresh: true });
      await new GarminClient({ tokenProvider }).getJson('/userprofile-service/userprofile/settings');
      await writeApiKey(apiKey, settings.apiKeyFile);
      const environmentKey = process.env.GARMIN_PERSONAL_API_KEY?.trim();
      if (environmentKey && environmentKey !== apiKey) {
        process.stderr.write(
          'Warning: GARMIN_PERSONAL_API_KEY is set and overrides the saved key. Unset it to use the key saved by this authorization flow.\n',
        );
      }
    };

    if (parsed.terminal) {
      await validateAndSave(await readSecret('Garmin Personal API key: '));
    } else {
      const session = await startLocalAuthPage({ locale: parsed.locale, onSubmit: validateAndSave });
      process.stderr.write(`Local authorization page: ${session.url}\n`);
      if (await openLocalAuthPage(session.url)) {
        process.stderr.write('Opened the authorization page in your browser.\n');
      } else {
        process.stderr.write(
          'Could not open a browser automatically. Open the URL above, or cancel and run auth --terminal.\n',
        );
      }
      await session.completion;
    }
    process.stdout.write(`API key validated and saved to ${settings.apiKeyFile}\n`);
    return 0;
  } catch (error) {
    printCliError(error);
    return 1;
  }
}

type AuthOptions = {
  check: boolean;
  locale: LocalAuthLocale;
  terminal: boolean;
};

function parseAuthOptions(args: string[]): AuthOptions | { error: string } {
  let locale = detectLocalAuthLocale();
  let localeWasSet = false;
  const flags = new Set<string>();

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === '--locale') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { error: 'Missing value for --locale. Supported values: en, zh.' };
      }
      if (!isSupportedLocalAuthLocale(value)) {
        return { error: `Unsupported auth locale: ${value}. Supported values: en, zh.` };
      }
      locale = resolveLocalAuthLocale(value);
      localeWasSet = true;
      index += 1;
      continue;
    }
    if (argument.startsWith('--locale=')) {
      const value = argument.slice('--locale='.length);
      if (!isSupportedLocalAuthLocale(value)) {
        return { error: `Unsupported auth locale: ${value || '(empty)'}. Supported values: en, zh.` };
      }
      locale = resolveLocalAuthLocale(value);
      localeWasSet = true;
      continue;
    }
    if (argument === '--check' || argument === '--terminal') {
      flags.add(argument);
      continue;
    }
    return { error: `Unknown auth option: ${argument}` };
  }

  if (localeWasSet && (flags.has('--check') || flags.has('--terminal'))) {
    return { error: 'The --locale option is only used by the browser authorization page.' };
  }

  return {
    check: flags.has('--check'),
    locale,
    terminal: flags.has('--terminal'),
  };
}

async function runDoctor(): Promise<number> {
  const checks: Array<{ name: string; status: 'ok' | 'warning' | 'error'; detail: string }> = [];
  const major = Number(process.versions.node.split('.')[0]);
  checks.push({
    name: 'Node.js',
    status: major >= 22 ? 'ok' : 'error',
    detail: `${process.version} (requires 20 or newer)`,
  });

  try {
    const resolved = await resolveApiKey();
    checks.push({ name: 'API key', status: 'ok', detail: resolved.source });
    if (resolved.path) {
      const warnings = await credentialPermissionWarnings(resolved.path);
      checks.push({
        name: 'Key permissions',
        status: warnings.length > 0 ? 'warning' : 'ok',
        detail: warnings.join(' ') || 'credential file is user-only',
      });
    }
    const tokenWarnings = await credentialPermissionWarnings(getRuntimeSettings().tokenCacheFile);
    if (tokenWarnings.length > 0) {
      checks.push({
        name: 'Token cache permissions',
        status: 'warning',
        detail: tokenWarnings.join(' '),
      });
    }
    await new GarminClient().getJson('/userprofile-service/userprofile/settings');
    checks.push({ name: 'Garmin connectivity', status: 'ok', detail: 'profile request succeeded' });
  } catch (error) {
    const normalized = normalizeError(error);
    checks.push({ name: 'Garmin credentials/connectivity', status: 'error', detail: normalized.message });
  }

  for (const check of checks) {
    process.stdout.write(`${check.status.toUpperCase().padEnd(7)} ${check.name}: ${check.detail}\n`);
  }
  return checks.some((check) => check.status === 'error') ? 1 : 0;
}

export async function readSecret(prompt: string): Promise<string> {
  process.stderr.write(prompt);
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    let value = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => {
      value += chunk;
    });
    await once(process.stdin, 'end');
    process.stderr.write('\n');
    return value.trim();
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  let value = '';
  try {
    while (true) {
      const [chunk] = (await once(process.stdin, 'data')) as [string];
      for (const character of chunk) {
        if (character === '\u0003') throw new Error('Authentication cancelled.');
        if (character === '\r' || character === '\n') {
          process.stderr.write('\n');
          return value.trim();
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
        } else if (character >= ' ') {
          value += character;
        }
      }
    }
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

function printCliError(error: unknown): void {
  const normalized = normalizeError(error);
  process.stderr.write(`${normalized.code}: ${normalized.message}\n`);
}
