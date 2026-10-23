// Claude по подписке: запросы идут на мост scripts/claude-bridge.mjs,
// который запускает Claude Code на компьютере пользователя.

export interface BridgeConfig {
  url: string;
  token: string;
}

export interface BridgeHealth {
  ok: boolean;
  version?: string;
  authMethod?: string;
  subscription?: string | null;
  error?: string;
}

export function isBridgeConfigured(bridge: BridgeConfig): boolean {
  return !!bridge.url.trim() && !!bridge.token.trim();
}

function endpoint(bridge: BridgeConfig, path: string): string {
  let base = bridge.url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
  return `${base}${path}`;
}

async function request(bridge: BridgeConfig, path: string, init: RequestInit = {}, timeoutMs: number): Promise<any> {
  if (!isBridgeConfigured(bridge)) {
    throw new Error('Подписка Claude не настроена — укажи адрес и токен моста в настройках.');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(endpoint(bridge, path), {
      ...init,
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${bridge.token.trim()}`,
        'content-type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Мост не ответил вовремя');
    throw new Error('Мост недоступен. Проверь, что Mac включён, bridge запущен и телефон в той же сети.');
  } finally {
    clearTimeout(timer);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`);
  return data;
}

export async function claudeChat(
  bridge: BridgeConfig,
  prompt: string,
  systemPrompt?: string,
  model: 'haiku' | 'sonnet' | 'opus' = 'haiku',
): Promise<string> {
  const data = await request(bridge, '/chat', {
    method: 'POST',
    body: JSON.stringify({ system: systemPrompt, prompt, model }),
  }, 10 * 60 * 1000);
  return String(data.text ?? '');
}

export async function checkBridge(bridge: BridgeConfig): Promise<BridgeHealth> {
  try {
    return await request(bridge, '/health?probe=1', {}, 60 * 1000);
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
