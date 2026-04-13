// ============================================
// Health Service — Monitoramento e Auto-Recovery
// ============================================

import { Bot } from 'grammy';
import { logger } from './logger';
import { getRedis } from './redis';

const MEMORY_THRESHOLD_MB = 500;
const HEARTBEAT_INTERVAL_MS = 1 * 60 * 60 * 1000; // 1 hora
const MONITOR_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

let botInstance: Bot | null = null;
let alertChatId: string | null = null;

/** Configura a instância do bot e o chat de alertas */
export function setupHealthAlerts(bot: Bot, chatId: string) {
  botInstance = bot;
  alertChatId = chatId;
  logger.info({ chatId }, '🔔 Alertas de saúde configurados para o Telegram');
}

export function startHealthService() {
  logger.info('🏥 Serviço de Health Check iniciado');

  // 1. Heartbeat inicial (aguarda um pouco para o bot inicializar)
  setTimeout(() => logHeartbeat(), 10000);

  // 2. Agendar Heartbeat (a cada 1h)
  setInterval(() => {
    logHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);

  // 3. Monitoramento de Memória (a cada 5 min)
  setInterval(() => {
    checkMemoryUsage();
  }, MONITOR_INTERVAL_MS);
}

async function sendAlert(message: string) {
  if (botInstance && alertChatId) {
    try {
      await botInstance.api.sendMessage(alertChatId, message, { parse_mode: 'HTML' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, '❌ Falha ao enviar alerta de saúde para o Telegram');
    }
  }
}

async function logHeartbeat() {
  const uptime = process.uptime();
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);

  // Verificações de conectividade
  let redisStatus = '✅ OK';
  let telegramStatus = '✅ OK';

  try {
    await getRedis().ping();
  } catch {
    redisStatus = '❌ ERRO';
  }

  try {
    if (botInstance) await botInstance.api.getMe();
  } catch {
    telegramStatus = '❌ ERRO';
  }

  const statusMsg = `🟢 <b>Heartbeat: GorvaxBot Operacional</b>\n\n` +
    `⏱ <b>Uptime:</b> ${uptimeHours}h ${uptimeMinutes}m\n` +
    `📦 <b>Redis:</b> ${redisStatus}\n` +
    `🤖 <b>Telegram API:</b> ${telegramStatus}\n` +
    `🧠 <b>RAM RSS:</b> ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`;

  logger.info(
    { uptime: `${uptimeHours}h ${uptimeMinutes}m`, redis: redisStatus, telegram: telegramStatus },
    '🟢 Heartbeat: GorvaxBot está online e operacional'
  );

  await sendAlert(statusMsg);
}

async function checkMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);

  if (rssMB > MEMORY_THRESHOLD_MB) {
    const errorMsg = `🚨 <b>ERRO CRÍTICO: LIMITE DE MEMÓRIA EXCEDIDO!</b>\n\n` +
      `O bot atingiu ${rssMB}MB (Limite: ${MEMORY_THRESHOLD_MB}MB).\n` +
      `Reiniciando processo para auto-recovery...`;
    
    logger.fatal({ rssMB, thresholdMB: MEMORY_THRESHOLD_MB }, '🚨 LIMITE DE MEMÓRIA EXCEDIDO!');
    
    await sendAlert(errorMsg);

    // Pequeno delay para garantir que o log e a mensagem sejam processados
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  } else if (rssMB > MEMORY_THRESHOLD_MB * 0.8) {
    logger.warn(
      { rssMB, thresholdMB: MEMORY_THRESHOLD_MB },
      '⚠️ Uso de memória elevado (>80% do limite)'
    );
  }
}
