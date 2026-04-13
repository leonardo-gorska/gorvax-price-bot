// ============================================
// Bot — Middleware (auth, logging, throttle, errors)
// ============================================

import { Bot, type Context, type NextFunction } from 'grammy';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

// ─── Auth Middleware ────────────────────────

/** Restringe o bot ao CHAT_ID configurado */
export function authMiddleware(): (ctx: Context, next: NextFunction) => Promise<void> {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const config = getConfig();
    const allowedId = config.TELEGRAM_CHAT_ID;

    // Se CHAT_ID não está configurado, permite tudo (primeiro uso)
    if (!allowedId) {
      await next();
      return;
    }

    const chatId = ctx.chat?.id?.toString();
    const text = ctx.message?.text || '';
    const isPublicCommand = 
      text.startsWith('/start') || 
      text.startsWith('/subscribe') || 
      text.startsWith('/unsubscribe') ||
      text.startsWith('/help') ||
      text.startsWith('/tutorial');

    if (chatId !== allowedId && !isPublicCommand) {
      logger.warn({ chatId, allowedId }, '🚫 Acesso não autorizado');
      await ctx.reply('🚫 Acesso negado. Este bot é de uso pessoal.');
      return;
    }

    await next();
  };
}

// ─── Command Logger Middleware ──────────────

/** Loga cada comando recebido */
export function commandLoggerMiddleware(): (ctx: Context, next: NextFunction) => Promise<void> {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const text = ctx.message?.text;
    if (text?.startsWith('/')) {
      const command = text.split(/\s+/)[0];
      logger.info(
        { command, chatId: ctx.chat?.id, user: ctx.from?.username },
        `📥 Comando recebido: ${command}`
      );
    }
    await next();
  };
}

// ─── Rate Limiting (simple in-memory) ──────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

/** Rate limiter — máx N comandos por janela de tempo */
export function rateLimitMiddleware(
  maxPerWindow: number = 20,
  windowMs: number = 60_000
): (ctx: Context, next: NextFunction) => Promise<void> {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const userId = ctx.from?.id?.toString();
    if (!userId) {
      await next();
      return;
    }

    const now = Date.now();
    const entry = rateLimits.get(userId);

    if (!entry || now >= entry.resetAt) {
      rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= maxPerWindow) {
      logger.warn({ userId, count: entry.count }, '⏱️ Rate limit atingido');
      await ctx.reply('⏱️ Você enviou muitos comandos. Aguarde um minuto.');
      return;
    }

    entry.count++;
    await next();
  };
}

// ─── Global Error Boundary ─────────────────

/** Configura error handler global no bot */
export function setupErrorHandler(bot: Bot): void {
  bot.catch((err) => {
    const ctx = err.ctx;
    const error = err.error;

    logger.error(
      {
        chatId: ctx.chat?.id,
        command: ctx.message?.text,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      '💥 Erro no handler do bot'
    );

    // Tenta notificar o usuário
    ctx.reply('⚠️ Ocorreu um erro interno. Tente novamente.').catch(() => {});
  });
}
