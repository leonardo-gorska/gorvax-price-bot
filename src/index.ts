// ============================================
// Entry Point — Boot do bot + scheduler + DB
// ============================================

import { loadConfig } from './config';
import { initDatabase, closeDatabase } from './db/index';
import { createBot } from './bot/index';
import { startScheduler } from './scheduler/index';
import { setSetting } from './db/queries';
import { closeBrowser } from './scrapers/base';
import { closeRedis, getRedis } from './utils/redis';
import { logger } from './utils/logger';
import { startDashboard, closeDashboard } from './scheduler/dashboard';
import { startHealthService, setupHealthAlerts } from './utils/health';

async function main(): Promise<void> {
  logger.info('   🚀 GORVAX BOT — RASTREADOR DE PREÇOS ENTERPRISE');
  logger.info('   ================================================');
  logger.info('   [MODO]: ESTÁVEL | [VERSÃO]: 2.2.5');
  logger.info('   ================================================');

  logger.info('⚙️ [SISTEMA] Validando configurações do ambiente...');
  const config = loadConfig();
  logger.info({ logLevel: config.LOG_LEVEL, cronSchedule: config.CRON_SCHEDULE }, '✅ [SISTEMA] Configurações validadas com sucesso');

  // 2. Inicializa o banco de dados
  logger.info('📦 [BANCO] Conectando ao SQLite (promo.db)...');
  initDatabase();
  logger.info('✅ [BANCO] Banco de dados inicializado e pronto');

  // 3. Cria e configura o bot
  logger.info('🤖 [TELEGRAM] Configurando núcleo do bot...');
  const bot = createBot();

  // 3.1. Configura alertas de saúde
  setupHealthAlerts(bot, config.TELEGRAM_CHAT_ID || config.ADMIN_ID || '');
  startHealthService();

  // 3.5. Verifica conexão com Redis
  logger.info('🔍 [REDIS] Verificando conectividade com Upstash...');
  try {
    const redis = getRedis();
    await redis.ping();
    logger.info('✅ [REDIS] Conexão estabelecida');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ error: msg }, '❌ [REDIS] Erro crítico de conexão!');
    process.exit(1);
  }

  // 4. Inicia o scheduler (BullMQ)
  logger.info('⏰ [SCHEDULER] Inicializando motor de agendamento BullMQ...');
  await startScheduler(bot);

  // 4.1 Inicia o Dashboard BullMQ
  logger.info(`📊 [DASHBOARD] Subindo painel de controle (Porta: ${config.DASHBOARD_PORT})...`);
  await startDashboard();

  // 5. Salvar hora de início
  setSetting('start_time', new Date().toISOString());

  // 6. Graceful shutdown (fecha tudo corretamente)
  const shutdown = async (signal: string) => {
    logger.info({ signal }, '🛑 Desligando bot...');

    try {
      await bot.stop();
      logger.info('✅ Bot Telegram parado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, 'Erro ao parar bot');
    }

    try {
      await closeBrowser();
      logger.info('✅ Browser Puppeteer fechado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, 'Erro ao fechar browser');
    }

    try {
      await closeDashboard();
      logger.info('✅ Dashboard BullMQ fechado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, 'Erro ao fechar dashboard');
    }

    try {
      await closeRedis();
      logger.info('✅ Conexão Redis fechada');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, 'Erro ao fechar Redis');
    }

    try {
      closeDatabase();
      logger.info('✅ Banco de dados fechado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, 'Erro ao fechar DB');
    }

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ error: err.message, stack: err.stack }, '💀 Exceção não capturada');
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    logger.fatal({ error: message }, '💀 Promise rejection não tratada');
  });

  // 7. Startup self-test + Long Polling com Reconnect & Backoff
  let retryCount = 0;
  const MIN_BACKOFF = 5000; // 5s
  const MAX_BACKOFF = 60000; // 60s

  while (true) {
    try {
      logger.info('🔍 [AUTO-TESTE] Verificando integridade da API do Telegram...');
      const botInfo = await bot.api.getMe();
      logger.info({ username: botInfo.username, id: botInfo.id }, '✅ [TELEGRAM] API respondendo corretamente');

      logger.info('🚀 [STATUS] GORVAX BOT ONLINE E OPERANTE!');
      logger.info('💬 [STATUS] Aguardando mensagens e comandos...');
      
      // Reset retry count on successful connection
      retryCount = 0;

      await bot.start({
        onStart: (botInfo) => {
          logger.info({ username: botInfo.username }, '✅ [CONEXÃO] Bot autenticado no Telegram');
        },
      });
      
      // Se bot.start() retornar normalmente (ex: bot.stop() chamado), sai do loop
      break;
    } catch (err: unknown) {
      retryCount++;
      const msg = err instanceof Error ? err.message : String(err);
      const backoff = Math.min(MIN_BACKOFF * Math.pow(2, retryCount - 1), MAX_BACKOFF);

      logger.error(
        { error: msg, retryCount, nextRetryIn: `${backoff / 1000}s` },
        '❌ Falha na conexão com Telegram. Tentando reconectar...'
      );

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.fatal({ error: message, stack }, '💀 Erro fatal ao iniciar o bot');
  process.exit(1);
});
