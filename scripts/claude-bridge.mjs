#!/usr/bin/env node
// Мост между телефоном и подпиской Claude: запускает локальный `claude` CLI
// (Claude Code) так же, как это делает amanu, и отдаёт ответ по HTTP.
//
//   node scripts/claude-bridge.mjs            # порт 8787
//   PORT=9000 node scripts/claude-bridge.mjs
//
// Токен доступа создаётся при первом запуске в ~/.config/peakwise/bridge-token
// и печатается в консоль вместе с адресами — их нужно ввести в настройках приложения.

import http from 'node:http';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT ?? 8787);
const CLAUDE = process.env.CLAUDE_BIN ?? 'claude';
const TIMEOUT_MS = 10 * 60 * 1000;
const MAX_BODY = 2 * 1024 * 1024;

const tokenFile = path.join(os.homedir(), '.config', 'peakwise', 'bridge-token');

function loadToken() {
  try {
    const t = fs.readFileSync(tokenFile, 'utf8').trim();
    if (t) return t;
  } catch {}
  const t = crypto.randomBytes(18).toString('base64url');
  fs.mkdirSync(path.dirname(tokenFile), { recursive: true });
  fs.writeFileSync(tokenFile, t + '\n', { mode: 0o600 });
  return t;
}

const TOKEN = loadToken();

// Без ANTHROPIC_API_KEY CLI идёт через вход claude.ai, то есть по подписке.
const childEnv = { ...process.env };
delete childEnv.ANTHROPIC_API_KEY;

function run(args, input) {
  return new Promise(resolve => {
    const child = spawn(CLAUDE, args, { env: childEnv, cwd: os.tmpdir() });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), TIMEOUT_MS);
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', err => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: err.code === 'ENOENT' ? `${CLAUDE} не найден в PATH` : err.message });
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.stdin.end(input ?? '');
  });
}

// Как в amanu: CLI работает как текстовое дополнение, а не агент —
// без инструментов, хуков, MCP, скиллов и истории сессий.
function claudeArgs(system, model) {
  const args = [
    '--print',
    '--output-format', 'json',
    '--tools', '',
    '--setting-sources', '',
    '--mcp-config', '{"mcpServers":{}}',
    '--strict-mcp-config',
    '--disable-slash-commands',
    '--no-session-persistence',
  ];
  if (system) args.push('--system-prompt', system);
  if (model) args.push('--model', model);
  return args;
}

async function complete(system, prompt, model) {
  const { code, stdout, stderr } = await run(claudeArgs(system, model), prompt);
  let data = null;
  try { data = JSON.parse(stdout); } catch {}
  if (data && !data.is_error && code === 0) return { text: String(data.result ?? '') };
  const msg = (data?.result || stderr || stdout || `claude завершился с кодом ${code}`).trim();
  return { error: msg.slice(0, 500) };
}

async function health(probe) {
  const ver = await run(['--version']);
  if (ver.code !== 0) return { ok: false, error: (ver.stderr || 'claude CLI не запускается').trim() };
  const version = ver.stdout.trim();

  const auth = await run(['auth', 'status']);
  let status = null;
  try { status = JSON.parse(auth.stdout); } catch {}
  if (!status?.loggedIn) {
    return { ok: false, version, error: 'Claude Code не залогинен. Выполни на Mac: claude /login' };
  }
  const info = {
    version,
    authMethod: status.authMethod,
    subscription: status.subscriptionType ?? null,
  };
  if (status.authMethod !== 'claude.ai') {
    return { ok: false, ...info, error: `Claude Code вошёл через ${status.authMethod}, а не по подписке claude.ai` };
  }
  if (!probe) return { ok: true, ...info };

  const res = await complete('Ответь одним словом.', 'Скажи: ok', 'haiku');
  if (res.error) return { ok: false, ...info, error: res.error };
  return { ok: true, ...info };
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('Слишком большой запрос')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function authorized(req) {
  const h = req.headers.authorization ?? '';
  const given = Buffer.from(h.replace(/^Bearer\s+/i, ''));
  const want = Buffer.from(TOKEN);
  return given.length === want.length && crypto.timingSafeEqual(given, want);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (!authorized(req)) return send(res, 401, { ok: false, error: 'Неверный токен моста' });

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      const h = await health(url.searchParams.get('probe') === '1');
      return send(res, 200, h);
    }
    if (req.method === 'POST' && url.pathname === '/chat') {
      const { system, prompt, model } = JSON.parse(await readBody(req));
      if (typeof prompt !== 'string' || !prompt.trim()) return send(res, 400, { error: 'Пустой prompt' });
      const started = Date.now();
      const out = await complete(system, prompt, model);
      console.log(`${new Date().toISOString()} /chat ${model ?? 'default'} ${Date.now() - started}ms ${out.error ? 'ERR ' + out.error : 'ok'}`);
      return send(res, out.error ? 502 : 200, out);
    }
    send(res, 404, { error: 'Not found' });
  } catch (e) {
    send(res, 500, { error: e instanceof Error ? e.message : String(e) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const addrs = Object.values(os.networkInterfaces()).flat()
    .filter(a => a && a.family === 'IPv4' && !a.internal)
    .map(a => `http://${a.address}:${PORT}`);
  console.log('Peakwise Claude bridge запущен');
  console.log('Адреса для приложения:');
  for (const a of addrs) console.log('  ' + a);
  console.log(`Токен: ${TOKEN}`);
});
