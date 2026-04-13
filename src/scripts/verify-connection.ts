import { Bot } from 'grammy';
import Redis from 'ioredis';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

async function verify() {
  const config = getConfig();
  logger.info('🔍 Iniciando Auditoria de Conectividade...');

  // 1. Validar Redis
  logger.info('📡 Testando Conexão Redis (Upstash)...');
  try {
    const redis = new Redis(config.REDIS_URL, {
      tls: { rejectUnauthorized: false } // Necessário para Upstash às vezes
    });
    const pong = await redis.ping();
    if (pong === 'PONG') {
      logger.info('✅ Redis Online!');
    } else {
      logger.error('❌ Redis respondeu inesperadamente: ' + pong);
    }
    await redis.quit();
  } catch (err: any) {
    logger.error('❌ Erro na Conexão Redis: ' + err.message);
  }

  // 2. Validar Telegram
  logger.info('🤖 Testando API do Telegram...');
  try {
    const bot = new Bot(config.TELEGRAM_BOT_TOKEN);
    const botInfo = await bot.api.getMe();
    logger.info(`✅ Telegram Online! Bot: @${botInfo.username}`);
    
    // Testar envio de mensagem se houver CHAT_ID
    const chatId = config.TELEGRAM_CHAT_ID || (await (await import('../db/queries')).getSetting('chat_id'));
    
    if (chatId) {
      await bot.api.sendMessage(parseInt(chatId), '✅ *Auditoria de Infraestrutura CONCLUÍDA*\nRedis e API do Telegram operacionais.', { parse_mode: 'Markdown' });
      logger.info(`✅ Mensagem de teste enviada para Chat ID: ${chatId}`);
    } else {
      logger.warn('⚠️ Chat ID não encontrado, skipando teste de envio.');
    }
  } catch (err: any) {
    logger.error('❌ Erro no Telegram: ' + err.message);
  }

  logger.info('🏁 Auditoria Finalizada.');
  process.exit(0);
}

verify();
