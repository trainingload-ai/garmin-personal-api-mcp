import { spawn } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { GarminMcpError, normalizeError } from './errors.js';

const LOOPBACK_HOST = '127.0.0.1';
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;
const GARMIN_PERSONAL_API_TOKEN_URL =
  'https://connect.garmin.com/app/settings/personalApiToken';
const PRODUCT_WEBSITE_URL = 'https://garminpersonalapi.com';
const SUCCESS_FALLBACK_MS = 15 * 1000;

export type LocalAuthLocale = 'en' | 'zh';

type LocalAuthPageOptions = {
  locale?: LocalAuthLocale;
  onSubmit: (apiKey: string) => Promise<void>;
  timeoutMs?: number;
};

export type LocalAuthSession = {
  close: () => Promise<void>;
  completion: Promise<void>;
  url: string;
};

type AuthCopy = {
  browserTitle: string;
  button: string;
  description: string;
  errorInvalidForm: string;
  errorInvalidLink: string;
  errorRequired: string;
  errorTitle: string;
  errorUnsupportedForm: string;
  eyebrow: string;
  finePrint: string;
  formDescription: string;
  formEyebrow: string;
  formTitle: string;
  heading: string;
  inputHint: string;
  inputLabel: string;
  inputPlaceholder: string;
  languageLabel: string;
  privacyItems: readonly string[];
  privacyTitle: string;
  retryButton: string;
  sourceDescription: string;
  sourceEyebrow: string;
  sourceLink: string;
  sourceTitle: string;
  successDescription: string;
  successBrowserTitle: string;
  successEyebrow: string;
  successHeading: string;
  successItems: readonly string[];
  successNext: string;
  successTitle: string;
  successWebsite: string;
};

const AUTH_COPY: Record<LocalAuthLocale, AuthCopy> = {
  en: {
    browserTitle: 'Connect Garmin Personal API',
    button: 'Verify key and connect',
    description:
      'Create a Personal API key in Garmin Connect, paste it here, and return to your AI client ready to ask about your Garmin data.',
    errorInvalidForm: 'This authorization form is invalid or has expired.',
    errorInvalidLink: 'This authorization link is invalid or has expired.',
    errorRequired: 'Enter a Garmin Personal API key to continue.',
    errorTitle: 'Verification failed',
    errorUnsupportedForm: 'Unsupported form submission.',
    eyebrow: 'Two-step local setup',
    finePrint:
      'Your key goes only to Garmin for verification, then stays in your local user configuration. It never enters an AI conversation.',
    formDescription:
      'We verify it directly with Garmin. After it is accepted, setup finishes automatically on this computer.',
    formEyebrow: 'Step 2 · on this computer',
    formTitle: 'Paste the key you just copied',
    heading: 'Connect your Garmin data',
    inputHint: 'Copy it from Garmin Connect’s Personal API Token page.',
    inputLabel: 'Garmin Personal API key',
    inputPlaceholder: 'Paste key here',
    languageLabel: 'Authorization language',
    privacyItems: [
      'This page is available only on your computer',
      'The key is verified directly by Garmin',
      'The key is not shared with an AI client',
    ],
    privacyTitle: 'Your key stays local',
    retryButton: 'Try another key',
    sourceDescription: 'Garmin shows a new key only once. Copy it before leaving the page.',
    sourceEyebrow: 'Step 1 · in Garmin Connect',
    sourceLink: 'Open Personal API Token settings',
    sourceTitle: 'Create and copy a key',
    successDescription:
      'Garmin accepted the key and it has been saved for this user on this computer.',
    successBrowserTitle: 'Garmin Personal API verified',
    successEyebrow: 'Verification complete',
    successHeading: 'Your Garmin Personal API is ready.',
    successItems: [
      'Verified directly with Garmin',
      'Saved only in your local user configuration',
      'Ready for read-only access',
    ],
    successNext:
      'The client that opened this page can now finish the local connection. You may close this tab.',
    successTitle: 'Return to your AI client',
    successWebsite: 'Visit project website',
  },
  zh: {
    browserTitle: '连接 Garmin Personal API',
    button: '验证密钥并连接',
    description:
      '只需两步：先在 Garmin Connect 创建 Personal API Key，再粘贴到这里。完成后，就可以回到 AI 客户端直接询问你的 Garmin 数据。',
    errorInvalidForm: '此授权表单无效或已过期。',
    errorInvalidLink: '此授权链接无效或已过期。',
    errorRequired: '请输入 Garmin Personal API Key 后继续。',
    errorTitle: '验证未通过',
    errorUnsupportedForm: '无法处理此次表单提交。',
    eyebrow: '两步完成本机接入',
    finePrint:
      '密钥只会发送给 Garmin 验证，随后保存在当前用户的本地配置中，不会进入任何 AI 对话。',
    formDescription: '我们会直接向 Garmin 验证。通过后，这台电脑上的接入配置会自动完成。',
    formEyebrow: '第 2 步 · 在这台电脑上',
    formTitle: '粘贴刚刚复制的密钥',
    heading: '连接你的 Garmin 数据',
    inputHint: '从 Garmin Connect 的 Personal API Token 页面复制。',
    inputLabel: 'Garmin Personal API Key',
    inputPlaceholder: '在此粘贴密钥',
    languageLabel: '授权页面语言',
    privacyItems: ['此页面只能从你的电脑访问', '密钥由 Garmin 直接验证', '密钥不会交给 AI 客户端'],
    privacyTitle: '密钥始终留在本机',
    retryButton: '换一个 Key 重新验证',
    sourceDescription: 'Garmin 只展示一次新密钥，请在离开页面前复制。',
    sourceEyebrow: '第 1 步 · 在 Garmin Connect 中',
    sourceLink: '打开 Personal API Token 设置',
    sourceTitle: '创建并复制密钥',
    successDescription:
      'Garmin 已接受这个密钥，并将它保存在这台电脑的当前用户配置中。',
    successBrowserTitle: 'Garmin Personal API 验证完成',
    successEyebrow: '验证完成',
    successHeading: 'Garmin Personal API 已准备就绪',
    successItems: ['已由 Garmin 直接验证', '只保存在本机用户配置中', '已可用于只读查询'],
    successNext: '刚才打开此页面的客户端会继续完成接入。你现在可以关闭此页面。',
    successTitle: '返回你的 AI 客户端',
    successWebsite: '返回项目官网',
  },
};

export function resolveLocalAuthLocale(value: string | null | undefined): LocalAuthLocale {
  return normalizeLocale(value)?.startsWith('zh') ? 'zh' : 'en';
}

export function isSupportedLocalAuthLocale(value: string | null | undefined): boolean {
  const normalized = normalizeLocale(value);
  return normalized === 'en' || normalized?.startsWith('en-') === true
    || normalized === 'zh' || normalized?.startsWith('zh-') === true;
}

export function detectLocalAuthLocale(
  environment: NodeJS.ProcessEnv = process.env,
): LocalAuthLocale {
  const candidate = environment.GARMIN_PERSONAL_API_LOCALE
    ?? environment.LC_ALL
    ?? environment.LC_MESSAGES
    ?? environment.LANGUAGE?.split(':')[0]
    ?? environment.LANG;
  return resolveLocalAuthLocale(candidate);
}

export async function startLocalAuthPage(options: LocalAuthPageOptions): Promise<LocalAuthSession> {
  const state = randomBytes(32).toString('base64url');
  const styleNonce = randomBytes(18).toString('base64url');
  const defaultLocale = options.locale ?? detectLocalAuthLocale();
  let expectedHost = '';
  let authorized = false;
  let settled = false;
  let submitting = false;
  let successFallback: NodeJS.Timeout | undefined;
  let resolveCompletion!: () => void;
  let rejectCompletion!: (error: Error) => void;

  const completion = new Promise<void>((resolve, reject) => {
    resolveCompletion = resolve;
    rejectCompletion = reject;
  });

  const server = createServer((request, response) => {
    void handleRequest(request, response).catch((error: unknown) => {
      const normalized = normalizeError(error);
      if (response.headersSent) {
        response.destroy(normalized);
        return;
      }
      setSecurityHeaders(response, styleNonce);
      sendText(response, 500, localizedError(defaultLocale, normalized));
    });
  });

  async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    setSecurityHeaders(response, styleNonce);

    if (request.headers.host !== expectedHost) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    const requestUrl = new URL(request.url ?? '/', `http://${expectedHost}`);
    const requestLocale = resolveLocalAuthLocale(
      requestUrl.searchParams.get('lang') ?? defaultLocale,
    );

    if (request.method === 'GET' && requestUrl.pathname === '/favicon.svg') {
      sendSvg(response, BRAND_ICON_SVG);
      return;
    }
    if (request.method === 'GET' && requestUrl.pathname === '/favicon.ico') {
      response.writeHead(204).end();
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/authorize') {
      const copy = AUTH_COPY[requestLocale];
      if (!secureEqual(requestUrl.searchParams.get('state') ?? '', state)) {
        sendText(response, 403, copy.errorInvalidLink);
        return;
      }
      sendHtml(response, 200, renderPage({ locale: requestLocale, state, styleNonce }));
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/complete') {
      const copy = AUTH_COPY[requestLocale];
      if (!authorized || !secureEqual(requestUrl.searchParams.get('state') ?? '', state)) {
        sendHtml(response, 403, renderPage({
          error: copy.errorInvalidLink,
          locale: requestLocale,
          state,
          styleNonce,
        }));
        return;
      }
      response.once('finish', finishSuccessfully);
      sendHtml(response, 200, renderPage({
        locale: requestLocale,
        state,
        styleNonce,
        success: true,
      }));
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/authorize') {
      const origin = request.headers.origin;
      if (origin && origin !== 'null' && origin !== `http://${expectedHost}`) {
        sendText(response, 403, 'Forbidden');
        return;
      }
      if (!request.headers['content-type']?.startsWith('application/x-www-form-urlencoded')) {
        sendText(response, 415, AUTH_COPY[requestLocale].errorUnsupportedForm);
        return;
      }
      if (submitting) {
        sendText(
          response,
          409,
          requestLocale === 'zh' ? '授权正在进行中。' : 'Authorization is already in progress.',
        );
        return;
      }

      try {
        const body = new URLSearchParams(await readBody(request));
        const locale = resolveLocalAuthLocale(body.get('lang') ?? requestLocale);
        const copy = AUTH_COPY[locale];
        if (!secureEqual(body.get('state') ?? '', state)) {
          sendText(response, 403, copy.errorInvalidForm);
          return;
        }
        if (authorized) {
          sendRedirect(response, completionPath(state, locale));
          return;
        }
        const apiKey = body.get('apiKey')?.trim() ?? '';
        if (!apiKey) {
          sendHtml(response, 400, renderPage({
            error: copy.errorRequired,
            locale,
            state,
            styleNonce,
          }));
          return;
        }

        submitting = true;
        try {
          await options.onSubmit(apiKey);
        } catch (error) {
          const normalized = normalizeError(error);
          sendHtml(response, 400, renderPage({
            error: localizedError(locale, normalized),
            locale,
            state,
            styleNonce,
          }));
          return;
        } finally {
          submitting = false;
        }

        authorized = true;
        successFallback = setTimeout(finishSuccessfully, SUCCESS_FALLBACK_MS);
        successFallback.unref();
        sendRedirect(response, completionPath(state, locale));
      } catch (error) {
        const normalized = normalizeError(error);
        sendHtml(response, 400, renderPage({
          error: localizedError(requestLocale, normalized),
          locale: requestLocale,
          state,
          styleNonce,
        }));
      }
      return;
    }

    sendText(response, 404, requestLocale === 'zh' ? '未找到页面' : 'Not found');
  }

  server.on('clientError', (_error, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, LOOPBACK_HOST, () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new GarminMcpError('network_error', 'Could not start the local authorization page.');
  }
  expectedHost = `${LOOPBACK_HOST}:${address.port}`;

  const timeout = setTimeout(() => {
    if (settled) return;
    settled = true;
    server.close();
    server.closeAllConnections();
    rejectCompletion(
      new GarminMcpError('invalid_input', 'Local authorization timed out. Run the auth command again.'),
    );
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  timeout.unref();

  function finishSuccessfully(): void {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    if (successFallback) clearTimeout(successFallback);
    resolveCompletion();
    server.close();
    server.closeAllConnections();
  }

  const query = new URLSearchParams({ lang: defaultLocale, state });
  return {
    completion,
    url: `http://${expectedHost}/authorize?${query.toString()}`,
    close: async () => {
      clearTimeout(timeout);
      if (successFallback) clearTimeout(successFallback);
      if (!settled) {
        settled = true;
        rejectCompletion(new GarminMcpError('invalid_input', 'Local authorization was cancelled.'));
      }
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      });
    },
  };
}

export async function openLocalAuthPage(url: string): Promise<boolean> {
  const [command, args] = browserCommand(url);
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true });
    child.once('error', () => resolve(false));
    child.once('spawn', () => {
      child.unref();
      resolve(true);
    });
  });
}

function browserCommand(url: string): [string, string[]] {
  if (process.platform === 'darwin') return ['open', [url]];
  if (process.platform === 'win32') return ['cmd.exe', ['/c', 'start', '', url]];
  return ['xdg-open', [url]];
}

function normalizeLocale(value: string | null | undefined): string | undefined {
  return value?.trim().toLowerCase().replaceAll('_', '-').split('.')[0];
}

function localizedError(locale: LocalAuthLocale, error: GarminMcpError): string {
  if (locale === 'en') return error.message;
  switch (error.code) {
    case 'credentials_missing':
      return '无法在这台电脑上读取或保存密钥。请检查本地配置目录的读写权限后重试。';
    case 'credentials_invalid_or_expired':
    case 'garmin_unauthorized':
      return 'Garmin 拒绝了这个 Personal API Key。它可能无效、已过期或已被删除，请创建当前有效的密钥后重试。';
    case 'garmin_rate_limited':
      return error.retryAfterSeconds === undefined
        ? 'Garmin 暂时限制了请求频率，请稍后再试。'
        : `Garmin 暂时限制了请求频率，请在 ${error.retryAfterSeconds} 秒后重试。`;
    case 'network_error':
      return '无法连接 Garmin Personal API。请检查网络后重试。';
    case 'invalid_input':
      return '提交的内容无效，请检查后重试。';
    default:
      return 'Garmin Personal API 暂时无法完成验证，请稍后再试。';
  }
}

function setSecurityHeaders(response: ServerResponse, styleNonce: string): void {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader(
    'Content-Security-Policy',
    `default-src 'none'; style-src 'nonce-${styleNonce}'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`,
  );
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Referrer-Policy', 'same-origin');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) {
      throw new GarminMcpError('invalid_input', 'The authorization form was too large.');
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sendHtml(response: ServerResponse, status: number, html: string): void {
  response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
}

function sendRedirect(response: ServerResponse, location: string): void {
  response.writeHead(303, {
    'Content-Type': 'text/plain; charset=utf-8',
    Location: location,
  });
  response.end('See other');
}

function sendSvg(response: ServerResponse, svg: string): void {
  response.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
  response.end(svg);
}

function sendText(response: ServerResponse, status: number, message: string): void {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

function renderPage(options: {
  error?: string;
  locale: LocalAuthLocale;
  state: string;
  styleNonce: string;
  success?: boolean;
}): string {
  const copy = AUTH_COPY[options.locale];
  const htmlLanguage = options.locale === 'zh' ? 'zh-CN' : 'en';
  const enUrl = escapeHtml(authorizationPath(options.state, 'en'));
  const zhUrl = escapeHtml(authorizationPath(options.state, 'zh'));
  const productWebsiteUrl = options.locale === 'zh'
    ? `${PRODUCT_WEBSITE_URL}/zh`
    : PRODUCT_WEBSITE_URL;
  const formAction = escapeHtml(authorizationPath(options.state, options.locale));
  const form = `<form method="post" action="${formAction}" autocomplete="off">
        <input type="hidden" name="state" value="${escapeHtml(options.state)}">
        <input type="hidden" name="lang" value="${options.locale}">
        <div class="field-heading">
          <label for="apiKey">${copy.inputLabel}</label>
          <span>${copy.inputHint}</span>
        </div>
        <input id="apiKey" name="apiKey" type="password" required autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${copy.inputPlaceholder}" aria-describedby="input-hint${options.error ? ' form-error' : ''}"${options.error ? ' aria-invalid="true" autofocus' : ''}>
        <span id="input-hint" class="sr-only">${copy.inputHint}</span>
        ${options.error ? `<div id="form-error" class="error" role="alert"><span class="error__mark" aria-hidden="true">!</span><span><strong>${copy.errorTitle}</strong>${escapeHtml(options.error)}</span></div>` : ''}
        <button type="submit"><span>${options.error ? copy.retryButton : copy.button}</span><span aria-hidden="true">→</span></button>
        <p class="fine">${copy.finePrint}</p>
      </form>`;

  return `<!doctype html>
<html lang="${htmlLanguage}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <title>${options.success ? copy.successBrowserTitle : copy.browserTitle} · Garmin Personal API MCP</title>
  <style nonce="${options.styleNonce}">
    :root { color-scheme:light; --bg:#f4f7f4; --surface:#fbfdfb; --surface-2:#eef3ef; --text:#101914; --muted:#66736b; --line:#ced8d1; --grid:rgba(25,72,47,.1); --accent:#0ca678; --accent-strong:#07845f; --accent-ink:#fff; --danger:#b42336; --danger-bg:#fff2f3; }
    @media (prefers-color-scheme:dark) { :root { color-scheme:dark; --bg:#070a08; --surface:#0c110e; --surface-2:#111813; --text:#f0f6f2; --muted:#94a198; --line:#29372f; --grid:rgba(190,229,205,.09); --accent:#35d39a; --accent-strong:#58e3af; --accent-ink:#07100b; --danger:#ff8795; --danger-bg:#251316; } }
    * { box-sizing:border-box; }
    html { min-width:320px; }
    body { min-height:100dvh; display:grid; place-items:center; margin:0; padding:32px; overflow-x:hidden; background-color:var(--bg); background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:56px 56px; color:var(--text); font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; }
    body::before { content:""; position:fixed; inset:0; pointer-events:none; background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--accent) 8%,transparent),transparent 38%); }
    a { color:inherit; }
    .shell { position:relative; width:min(100%,920px); border:1px solid var(--line); border-radius:8px; background:color-mix(in srgb,var(--surface) 97%,transparent); }
    .topbar { min-height:66px; display:flex; align-items:center; justify-content:space-between; gap:20px; padding:14px 20px; border-bottom:1px solid var(--line); }
    .brand { display:flex; align-items:center; gap:11px; min-width:0; text-decoration:none; font-size:13px; font-weight:750; letter-spacing:-.01em; }
    .mark { width:34px; height:34px; display:block; flex:0 0 auto; border-radius:5px; }
    .language { display:flex; align-items:center; gap:5px; padding:3px; border:1px solid var(--line); border-radius:5px; background:var(--surface-2); }
    .language a { min-width:34px; height:26px; display:grid; place-items:center; border-radius:3px; color:var(--muted); text-decoration:none; font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace; }
    .language a:hover { color:var(--text); }
    .language a[aria-current="page"] { background:var(--surface); color:var(--text); box-shadow:inset 0 0 0 1px var(--line); }
    .top-status { display:flex; align-items:center; gap:8px; color:var(--accent-strong); font:750 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.09em; text-transform:uppercase; }
    .top-status::before { content:""; width:7px; height:7px; border-radius:50%; background:var(--accent); box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 13%,transparent); }
    .content { display:grid; grid-template-columns:minmax(0,1.04fr) minmax(0,.96fr); min-height:510px; }
    .intro,.authorization { padding:48px; }
    .intro { display:flex; flex-direction:column; border-right:1px solid var(--line); }
    .authorization { display:flex; flex-direction:column; justify-content:center; background:color-mix(in srgb,var(--surface-2) 48%,transparent); }
    .eyebrow { margin:0; color:var(--accent-strong); font:750 10px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.13em; text-transform:uppercase; }
    h1 { max-width:520px; margin:16px 0 13px; font-size:clamp(36px,4.6vw,54px); line-height:.98; letter-spacing:-.055em; text-wrap:balance; }
    .lede { max-width:520px; margin:0; color:var(--muted); font-size:15px; }
    .source { display:grid; grid-template-columns:34px 1fr 24px; gap:13px; align-items:center; margin-top:34px; padding:16px 0; border-block:1px solid var(--line); text-decoration:none; }
    .source:hover .source__link { color:var(--accent-strong); }
    .source__number { align-self:start; color:var(--accent-strong); font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace; }
    .source__copy { min-width:0; }
    .source__eyebrow { display:block; margin-bottom:3px; color:var(--muted); font-size:11px; }
    .source__title { display:block; font-size:15px; font-weight:750; }
    .source__description { display:block; margin-top:3px; color:var(--muted); font-size:12px; }
    .source__link { width:24px; height:24px; display:grid; place-items:center; color:var(--muted); font-size:18px; transition:color .15s ease,transform .15s ease; }
    .source:hover .source__link { transform:translate(2px,-2px); }
    .privacy { margin-top:auto; padding-top:28px; }
    .privacy h2 { margin:0 0 12px; font-size:12px; letter-spacing:-.01em; }
    .privacy ul { display:grid; gap:7px; margin:0; padding:0; list-style:none; color:var(--muted); font-size:12px; }
    .privacy li { display:flex; align-items:center; gap:9px; }
    .privacy li::before { content:""; width:6px; height:6px; flex:0 0 auto; border:1px solid var(--accent); background:color-mix(in srgb,var(--accent) 18%,transparent); }
    .step { display:inline-flex; min-width:28px; height:21px; align-items:center; justify-content:center; align-self:flex-start; margin-bottom:22px; border:1px solid var(--line); border-radius:3px; color:var(--muted); font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace; }
    .authorization h2 { margin:11px 0 7px; font-size:25px; line-height:1.08; letter-spacing:-.035em; }
    .authorization__description { margin:0 0 28px; color:var(--muted); font-size:13px; }
    .field-heading { display:flex; flex-direction:column; gap:3px; margin-bottom:9px; }
    label { font-size:12px; font-weight:750; }
    .field-heading > span { color:var(--muted); font-size:10px; }
    input { width:100%; height:50px; padding:0 14px; border:1px solid var(--line); border-radius:5px; outline:none; background:var(--surface); color:var(--text); font:13px ui-monospace,SFMono-Regular,Menlo,monospace; transition:border-color .15s ease,box-shadow .15s ease; }
    input::placeholder { color:color-mix(in srgb,var(--muted) 72%,transparent); }
    input:hover { border-color:color-mix(in srgb,var(--accent) 45%,var(--line)); }
    input:focus-visible { border-color:var(--accent); box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 17%,transparent); }
    input[aria-invalid="true"] { border-color:var(--danger); }
    button,.primary-action { height:50px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; border:1px solid var(--accent); border-radius:5px; background:var(--accent); color:var(--accent-ink); cursor:pointer; font:750 13px ui-sans-serif,system-ui,sans-serif; transition:background .15s ease,transform .15s ease; }
    button { width:100%; margin-top:12px; }
    button:hover,.primary-action:hover { background:var(--accent-strong); }
    button:active,.primary-action:active { transform:translateY(1px); }
    button:focus-visible,a:focus-visible { outline:3px solid color-mix(in srgb,var(--accent) 35%,transparent); outline-offset:3px; }
    .fine { margin:16px 0 0; color:var(--muted); font-size:10.5px; }
    .error { display:flex; gap:9px; margin:10px 0 0; padding:11px; border:1px solid color-mix(in srgb,var(--danger) 35%,var(--line)); border-radius:4px; background:var(--danger-bg); color:var(--danger); font-size:11px; }
    .error strong { display:block; margin-bottom:2px; font-size:11px; }
    .error__mark { font-weight:850; }
    .shell--complete { width:min(100%,760px); }
    .completion { padding:60px; }
    .completion__signal { display:flex; align-items:center; gap:14px; margin-bottom:38px; }
    .completion__icon { width:48px; height:48px; display:grid; place-items:center; flex:0 0 auto; border:1px solid color-mix(in srgb,var(--accent) 55%,var(--line)); border-radius:50%; background:color-mix(in srgb,var(--accent) 13%,var(--surface)); color:var(--accent-strong); font-size:22px; font-weight:850; }
    .completion__line { width:72px; height:1px; background:linear-gradient(90deg,var(--accent),var(--line)); }
    .completion__label { color:var(--muted); font:700 10px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.08em; text-transform:uppercase; }
    .completion h1 { max-width:620px; margin-top:14px; }
    .completion__description { max-width:570px; margin:0; color:var(--muted); font-size:15px; }
    .receipt { display:grid; grid-template-columns:repeat(3,1fr); margin-top:38px; border:1px solid var(--line); border-radius:5px; background:color-mix(in srgb,var(--surface-2) 48%,transparent); }
    .receipt__item { min-height:104px; display:flex; flex-direction:column; justify-content:space-between; gap:18px; padding:17px; color:var(--muted); font-size:11px; }
    .receipt__item + .receipt__item { border-left:1px solid var(--line); }
    .receipt__check { color:var(--accent-strong); font:800 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace; }
    .completion__next { display:grid; grid-template-columns:minmax(0,1fr) minmax(250px,.78fr); gap:28px; align-items:center; margin-top:32px; padding-top:30px; border-top:1px solid var(--line); }
    .completion__next strong { display:block; margin-bottom:5px; font-size:14px; }
    .completion__next p { margin:0; color:var(--muted); font-size:12px; }
    .primary-action { min-width:0; gap:16px; text-decoration:none; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    @media (max-width:760px) {
      body { display:block; padding:16px; background-size:44px 44px; }
      .shell { margin:0 auto; }
      .content { grid-template-columns:1fr; min-height:0; }
      .intro,.authorization { padding:34px 28px; }
      .intro { border-right:0; border-bottom:1px solid var(--line); }
      .privacy { margin-top:28px; padding-top:0; }
      .authorization { background:var(--surface); }
      .completion { padding:46px 34px; }
      .receipt { grid-template-columns:1fr; }
      .receipt__item { min-height:72px; }
      .receipt__item + .receipt__item { border-top:1px solid var(--line); border-left:0; }
      .completion__next { grid-template-columns:1fr; }
    }
    @media (max-width:430px) {
      body { padding:10px; }
      .topbar { min-height:58px; padding:11px 13px; }
      .brand span { max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .intro,.authorization { padding:28px 20px; }
      .completion { padding:36px 20px; }
      .completion__signal { margin-bottom:30px; }
      .completion__line { width:36px; }
      h1 { font-size:38px; }
      .source { grid-template-columns:28px 1fr 22px; }
    }
    @media (prefers-reduced-motion:reduce) { *,*::before,*::after { scroll-behavior:auto!important; transition:none!important; } }
  </style>
</head>
<body>
  <div class="shell${options.success ? ' shell--complete' : ''}">
    <header class="topbar">
      <a class="brand" href="${options.success ? productWebsiteUrl : options.locale === 'zh' ? zhUrl : enUrl}" aria-label="Garmin Personal API MCP">
        ${BRAND_ICON_SVG.replace('<svg ', '<svg class="mark" ')}
        <span>Garmin Personal API MCP</span>
      </a>
      ${options.success ? `<span class="top-status">${copy.successEyebrow}</span>` : `<nav class="language" aria-label="${copy.languageLabel}">
        <a href="${enUrl}"${options.locale === 'en' ? ' aria-current="page"' : ''}>EN</a>
        <a href="${zhUrl}"${options.locale === 'zh' ? ' aria-current="page"' : ''}>中</a>
      </nav>`}
    </header>
    ${options.success ? `<main class="completion" aria-labelledby="page-title" role="status">
      <div class="completion__signal" aria-hidden="true">
        <span class="completion__icon">✓</span>
        <span class="completion__line"></span>
        <span class="completion__label">Garmin Personal API</span>
      </div>
      <p class="eyebrow">${copy.successEyebrow}</p>
      <h1 id="page-title">${copy.successHeading}</h1>
      <p class="completion__description">${copy.successDescription}</p>
      <div class="receipt" role="list">
        ${copy.successItems.map((item) => `<div class="receipt__item" role="listitem"><span class="receipt__check" aria-hidden="true">✓</span><span>${item}</span></div>`).join('')}
      </div>
      <div class="completion__next">
        <div>
          <strong>${copy.successTitle}</strong>
          <p>${copy.successNext}</p>
        </div>
        <a class="primary-action" href="${productWebsiteUrl}"><span>${copy.successWebsite}</span><span aria-hidden="true">→</span></a>
      </div>
    </main>` : `<main class="content">
      <section class="intro" aria-labelledby="page-title">
        <p class="eyebrow">${copy.eyebrow}</p>
        <h1 id="page-title">${copy.heading}</h1>
        <p class="lede">${copy.description}</p>
        <a class="source" href="${GARMIN_PERSONAL_API_TOKEN_URL}" target="_blank" rel="noreferrer">
          <span class="source__number" aria-hidden="true">01</span>
          <span class="source__copy">
            <span class="source__eyebrow">${copy.sourceEyebrow}</span>
            <span class="source__title">${copy.sourceTitle}</span>
            <span class="source__description">${copy.sourceDescription}</span>
          </span>
          <span class="source__link" aria-label="${copy.sourceLink}">↗</span>
        </a>
        <div class="privacy">
          <h2>${copy.privacyTitle}</h2>
          <ul>${copy.privacyItems.map((item) => `<li>${item}</li>`).join('')}</ul>
        </div>
      </section>
      <section class="authorization" aria-labelledby="authorization-title">
        <span class="step" aria-hidden="true">02</span>
        <p class="eyebrow">${copy.formEyebrow}</p>
        <h2 id="authorization-title">${copy.formTitle}</h2>
        <p class="authorization__description">${copy.formDescription}</p>
        ${form}
      </section>
    </main>`}
  </div>
</body>
</html>`;
}

function authorizationPath(state: string, locale: LocalAuthLocale): string {
  const query = new URLSearchParams({ lang: locale, state });
  return `/authorize?${query.toString()}`;
}

function completionPath(state: string, locale: LocalAuthLocale): string {
  const query = new URLSearchParams({ lang: locale, state });
  return `/complete?${query.toString()}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const BRAND_ICON_SVG = '<svg viewBox="0 0 64 64" role="img" aria-label="Garmin Personal API MCP" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="8" fill="#0a0c0b"/><path d="M14 38V20h25v7H22v15h17v-5H29v-7h18v19H14V38Z" fill="#34d399"/><path d="M48 14h3v12h-3zM48 30h3v3h-3z" fill="#f4f7f5"/></svg>';
