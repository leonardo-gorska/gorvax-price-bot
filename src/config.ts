import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z
    .string()
    .min(10, 'TELEGRAM_BOT_TOKEN é obrigatório. Obtenha via @BotFather.'),

  TELEGRAM_CHAT_ID: z
    .string()
    .optional()
    .default(''),

  CRON_SCHEDULE: z
    .string()
    .regex(/^[\d*/, -]+$/, 'CRON_SCHEDULE inválido. Ex: "0 */6 * * *"')
    .optional()
    .default('0 */6 * * *'),

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error', 'fatal'])
    .optional()
    .default('info'),

  PROXY_URL: z.string().optional(),
  PROXY_AUTH: z.string().optional(), // username:password
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  PROXY_LIST: z.string().optional(), // urls separadas por vírgula

  DASHBOARD_PORT: z.coerce.number().default(3001),
  DASHBOARD_USER: z.string().default('admin'),
  DASHBOARD_PASSWORD: z.string().min(6, 'DASHBOARD_PASSWORD deve ter pelo menos 6 caracteres').default('gorvax123'),
  ADMIN_ID: z.string().optional().default(''),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

/** Valida e retorna as variáveis de ambiente */
export function loadConfig(): EnvConfig {
  if (_config) return _config;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ❌ ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.error('❌ Config Validation Error:', errors);
    throw new Error(
      `\n============================================\n` +
      `Erro na configuração (.env):\n${errors}\n` +
      `============================================\n` +
      `Copie .env.example para .env e preencha os valores.`
    );
  }

  _config = result.data;
  return _config;
}

/** Retorna a config já carregada (throws se não foi carregada ainda) */
export function getConfig(): EnvConfig {
  if (!_config) return loadConfig();
  return _config;
}

// ─── Constantes centralizadas ──────────────

/** Delay entre scrapes (ms) — base */
export const SCRAPE_DELAY_BASE_MS = 4000;

/** Jitter máximo adicionado ao delay (ms) */
export const SCRAPE_DELAY_JITTER_MS = 4000;

/** Calcula delay com jitter aleatório */
export function scrapeDelay(): number {
  return SCRAPE_DELAY_BASE_MS + Math.floor(Math.random() * SCRAPE_DELAY_JITTER_MS);
}

/** Timeout máximo para um scrape (ms) */
export const SCRAPER_TIMEOUT_MS = 60000; // 60 segundos

/** Máximo de dias de histórico mantido */
export const HISTORY_RETENTION_DAYS = 90;

/** Máximo de falhas consecutivas antes de desativar produto */
export const MAX_CONSECUTIVE_FAILURES = 10;

/** Itens por página na listagem */
export const ITEMS_PER_PAGE = 8;

/** Limite de RAM para o processo antes do auto-restart do browser (MB) */
export const MAX_RAM_MB = 512;

/** User-Agents para rotação */
export const USER_AGENTS: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
];

/** Retorna um User-Agent aleatório */
export function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
