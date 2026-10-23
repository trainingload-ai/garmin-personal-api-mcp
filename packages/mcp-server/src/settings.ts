import { constants, promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { GarminMcpError } from './errors.js';

export const DEFAULT_BASE_URL = 'https://personal.connectapi.garmin.com';
export const DEFAULT_API_KEY_RELATIVE_PATH = path.join('.config', 'garmin', 'connect-personal-api-key');
export const DEFAULT_TOKEN_RELATIVE_PATH = path.join(
  '.config',
  'garmin',
  'connect-personal-api-bearer-token.json',
);

export type RuntimeSettings = {
  apiKeyFile: string;
  baseUrl: string;
  tokenCacheFile: string;
  timeoutMs: number;
};

export function getRuntimeSettings(
  env: NodeJS.ProcessEnv = process.env,
  homeDirectory = homedir(),
): RuntimeSettings {
  const apiKeyFile = env.GARMIN_PERSONAL_API_KEY_FILE?.trim();
  if (Object.hasOwn(env, 'GARMIN_PERSONAL_API_KEY_FILE') && !apiKeyFile) {
    throw new GarminMcpError(
      'credentials_missing',
      'GARMIN_PERSONAL_API_KEY_FILE is set but empty. Set a file path or unset it.',
    );
  }
  const tokenCacheFile = env.GARMIN_PERSONAL_API_TOKEN_CACHE_FILE?.trim();
  if (Object.hasOwn(env, 'GARMIN_PERSONAL_API_TOKEN_CACHE_FILE') && !tokenCacheFile) {
    throw new GarminMcpError(
      'invalid_input',
      'GARMIN_PERSONAL_API_TOKEN_CACHE_FILE is set but empty. Set a file path or unset it.',
    );
  }
  const timeout = Number(env.GARMIN_PERSONAL_API_TIMEOUT_MS ?? 30_000);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new GarminMcpError('invalid_input', 'GARMIN_PERSONAL_API_TIMEOUT_MS must be positive.');
  }
  return {
    apiKeyFile: apiKeyFile || path.join(homeDirectory, DEFAULT_API_KEY_RELATIVE_PATH),
    baseUrl: (env.GARMIN_PERSONAL_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    tokenCacheFile: tokenCacheFile || path.join(homeDirectory, DEFAULT_TOKEN_RELATIVE_PATH),
    timeoutMs: timeout,
  };
}

export type ResolvedApiKey = {
  key: string;
  source: 'environment' | 'explicit-file' | 'default-file';
  path?: string;
};

export async function resolveApiKey(
  env: NodeJS.ProcessEnv = process.env,
  homeDirectory = homedir(),
): Promise<ResolvedApiKey> {
  if (Object.hasOwn(env, 'GARMIN_PERSONAL_API_KEY')) {
    const key = env.GARMIN_PERSONAL_API_KEY?.trim();
    if (!key) {
      throw new GarminMcpError(
        'credentials_missing',
        'GARMIN_PERSONAL_API_KEY is set but empty. Set a valid key or unset it.',
      );
    }
    return { key, source: 'environment' };
  }

  const settings = getRuntimeSettings(env, homeDirectory);
  const explicit = Boolean(env.GARMIN_PERSONAL_API_KEY_FILE);
  let raw: string;
  try {
    raw = await fs.readFile(settings.apiKeyFile, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new GarminMcpError(
        'credentials_missing',
        explicit
          ? `Garmin Personal API key file does not exist: ${settings.apiKeyFile}`
          : `No Garmin Personal API key found. Run "npx -y @trainingloadai/garmin-personal-api-mcp auth" or set GARMIN_PERSONAL_API_KEY.`,
        { cause: error },
      );
    }
    throw new GarminMcpError(
      'credentials_missing',
      `Could not read the Garmin Personal API key file: ${settings.apiKeyFile}`,
      { cause: error },
    );
  }

  const key = raw.trim();
  if (!key) {
    throw new GarminMcpError(
      'credentials_missing',
      `Garmin Personal API key file is empty: ${settings.apiKeyFile}`,
    );
  }
  return { key, path: settings.apiKeyFile, source: explicit ? 'explicit-file' : 'default-file' };
}

export async function writeApiKey(apiKey: string, filePath: string): Promise<void> {
  const key = apiKey.trim();
  if (!key) throw new GarminMcpError('credentials_missing', 'The Garmin Personal API key is empty.');

  try {
    await fs.mkdir(path.dirname(filePath), { mode: 0o700, recursive: true });
    await fs.chmod(path.dirname(filePath), 0o700).catch(() => undefined);
    await fs.writeFile(filePath, `${key}\n`, { encoding: 'utf8', mode: 0o600 });
    await fs.chmod(filePath, 0o600).catch(() => undefined);
  } catch (error) {
    throw new GarminMcpError(
      'credentials_missing',
      `Could not save the Garmin Personal API key to ${filePath}. Check the directory permissions and retry.`,
      { cause: error },
    );
  }
}

export async function credentialPermissionWarnings(filePath: string): Promise<string[]> {
  if (process.platform === 'win32') return [];
  try {
    const stat = await fs.stat(filePath);
    return stat.mode & (constants.S_IRWXG | constants.S_IRWXO)
      ? [`Credential file is accessible by group or other users: ${filePath}. Run chmod 600.`]
      : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    return [`Could not inspect credential file permissions: ${filePath}`];
  }
}
