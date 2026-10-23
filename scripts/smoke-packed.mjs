import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';

const workspace = path.resolve(import.meta.dirname, '..');
const packageDirectory = path.join(workspace, 'packages', 'mcp-server');
const expectedPackage = JSON.parse(await readFile(path.join(packageDirectory, 'package.json'), 'utf8'));
const expectedVersion = expectedPackage.version;
const temporary = await mkdtemp(path.join(tmpdir(), 'garmin-mcp-pack-'));
const packedDirectory = path.join(temporary, 'packed');
const consumerDirectory = path.join(temporary, 'consumer');
await mkdir(packedDirectory);
await mkdir(consumerDirectory);

run('pnpm', ['pack', '--pack-destination', packedDirectory], packageDirectory);
const tarballName = (await readdir(packedDirectory)).find((name) => name.endsWith('.tgz'));
if (!tarballName) throw new Error('pnpm pack did not produce a tarball');
const tarball = path.join(packedDirectory, tarballName);

await writeFile(
  path.join(consumerDirectory, 'package.json'),
  JSON.stringify({ name: 'garmin-mcp-smoke-consumer', private: true, version: '0.0.0' }),
);
run(
  'npm',
  ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball],
  consumerDirectory,
  { ...process.env, npm_config_cache: path.join(temporary, 'npm-cache') },
);

const installedPackage = JSON.parse(
  await readFile(
    path.join(
      consumerDirectory,
      'node_modules',
      '@trainingloadai',
      'garmin-personal-api-mcp',
      'package.json',
    ),
    'utf8',
  ),
);
if (installedPackage.version !== expectedVersion) {
  throw new Error(`Unexpected installed version: ${installedPackage.version}`);
}

const executable = path.join(
  consumerDirectory,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'garmin-personal-api-mcp.cmd' : 'garmin-personal-api-mcp',
);
const version = spawnSync(executable, ['--version'], { cwd: consumerDirectory, encoding: 'utf8' });
if (version.status !== 0 || version.stdout.trim() !== expectedVersion) {
  throw new Error(`Packed CLI version check failed: ${version.stderr || version.stdout}`);
}

await smokeStdio(executable, consumerDirectory, temporary);
process.stdout.write(`Packed smoke test passed: ${tarballName}\n`);

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env, stdio: 'pipe' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
}

async function smokeStdio(command, cwd, home) {
  const child = spawn(command, [], {
    cwd,
    env: { ...process.env, GARMIN_PERSONAL_API_KEY: '', HOME: home, USERPROFILE: home },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const lines = readline.createInterface({ input: child.stdout });
  let phase = 'initialize';
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const timeout = setTimeout(() => child.kill('SIGKILL'), 20_000);
  const completed = new Promise((resolve, reject) => {
    lines.on('line', (line) => {
      if (!line.trim()) return;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        reject(new Error(`Non-JSON text polluted stdout: ${line}`));
        child.kill('SIGKILL');
        return;
      }

      if (phase === 'initialize' && message.id === 1) {
        phase = 'tools';
        child.stdin.write(
          `${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`,
        );
        child.stdin.write(
          `${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`,
        );
      } else if (phase === 'tools' && message.id === 2) {
        if (!Array.isArray(message.result?.tools) || message.result.tools.length !== 25) {
          reject(new Error(`Expected 25 tools, received ${message.result?.tools?.length ?? 'none'}`));
          child.kill('SIGKILL');
          return;
        }
        phase = 'call';
        child.stdin.write(
          `${JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'garmin_get_profile', arguments: {} },
          })}\n`,
        );
      } else if (phase === 'call' && message.id === 3) {
        if (message.result?.isError !== true) {
          reject(new Error('Expected missing credentials to be a normal MCP tool error'));
          child.kill('SIGKILL');
          return;
        }
        phase = 'done';
        child.stdin.end();
      }
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      clearTimeout(timeout);
      if (phase !== 'done') {
        reject(new Error(`stdio process exited before completion (${code ?? signal})\n${stderr}`));
      } else if (code !== 0) {
        reject(new Error(`stdio process exited with ${code ?? signal}\n${stderr}`));
      } else {
        resolve();
      }
    });
  });

  child.stdin.write(
    `${JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'packed-smoke-test', version: '1.0.0' },
      },
    })}\n`,
  );
  await completed;
}
