// ============================================
// Bot — Inicialização do grammy + Middleware
// ============================================

import { Bot } from 'grammy';
import { registerCommands } from './commands';
import { authMiddleware, commandLoggerMiddleware, rateLimitMiddleware, setupErrorHandler } from './middleware';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

/** Cria e configura o bot com middleware enterprise */
export function createBot(): Bot {
  const config = getConfig();
  const token = config.TELEGRAM_BOT_TOKEN;

  const bot = new Bot(token);

  // ─── Middleware stack (ordem importa!) ────
  // 1. Auth: bloqueia acessos não autorizados
  bot.use(authMiddleware());

  // 2. Rate limiting: 20 comandos por minuto
  bot.use(rateLimitMiddleware(20, 60_000));

  // 3. Command logger: loga todos os comandos
  bot.use(commandLoggerMiddleware());

  // ─── Comandos ────────────────────────────
  registerCommands(bot);

  // ─── Error handler global ────────────────
  setupErrorHandler(bot);

  logger.info('Bot configurado com middleware: auth, rate-limit, logger');
  return bot;
}
