import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  credentialPermissionWarnings,
  getRuntimeSettings,
  resolveApiKey,
  writeApiKey,
} from '../../src/settings.js';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { force: true, recursive: true })));
});

async function temporaryHome(): Promise<string> {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'garmin-mcp-settings-'));
  directories.push(directory);
  return directory;
}

describe('API key settings', () => {
  it('prefers the environment over an explicit or default file', async () => {
    const home = await temporaryHome();
    expect(
      await resolveApiKey(
        { GARMIN_PERSONAL_API_KEY: ' from-env ', GARMIN_PERSONAL_API_KEY_FILE: '/missing' },
        home,
      ),
    ).toEqual({ key: 'from-env', source: 'environment' });
  });

  it('does not fall back when an explicitly selected file is missing', async () => {
    const home = await temporaryHome();
    await expect(
      resolveApiKey({ GARMIN_PERSONAL_API_KEY_FILE: path.join(home, 'missing') }, home),
    ).rejects.toMatchObject({ code: 'credentials_missing' });
  });

  it('rejects an explicitly empty key-file setting', async () => {
    const home = await temporaryHome();
    await expect(resolveApiKey({ GARMIN_PERSONAL_API_KEY_FILE: ' ' }, home)).rejects.toMatchObject({
      code: 'credentials_missing',
    });
  });

  it('rejects an explicitly empty bearer-token cache setting', async () => {
    const home = await temporaryHome();
    expect(() => getRuntimeSettings({ GARMIN_PERSONAL_API_TOKEN_CACHE_FILE: ' ' }, home))
      .toThrow('GARMIN_PERSONAL_API_TOKEN_CACHE_FILE is set but empty');
  });

  it('writes POSIX credentials as user-only', async () => {
    const home = await temporaryHome();
    const file = path.join(home, '.config', 'garmin', 'connect-personal-api-key');
    await writeApiKey('secret', file);
    expect((await fs.readFile(file, 'utf8')).trim()).toBe('secret');
    if (process.platform !== 'win32') {
      expect((await fs.stat(file)).mode & 0o777).toBe(0o600);
      expect(await credentialPermissionWarnings(file)).toEqual([]);
    }
  });
});
