import { logger } from '../utils/logger';

async function simulateReconnect() {
  let retryCount = 0;
  const MIN_BACKOFF = 1000; // Reduzido para teste rápido (1s)
  const MAX_BACKOFF = 5000; // Reduzido para teste rápido (5s)
  const MAX_TEST_RETRIES = 5;

  logger.info('🧪 Iniciando teste de reconexão...');

  while (retryCount < MAX_TEST_RETRIES) {
    try {
      logger.info('🔍 [Mock] Verificando conectividade...');
      
      // Simula falha nas primeiras 3 tentativas
      if (retryCount < 3) {
        throw new Error('Telegram API connection timeout (Simulado)');
      }

      logger.info('✅ [Mock] Telegram API OK');
      logger.info('🚀 [Mock] Bot iniciado!');
      break;
    } catch (err: unknown) {
      retryCount++;
      const msg = err instanceof Error ? err.message : String(err);
      const backoff = Math.min(MIN_BACKOFF * Math.pow(2, retryCount - 1), MAX_BACKOFF);

      logger.warn(
        { error: msg, retryCount, nextRetryIn: `${backoff / 1000}s` },
        '⚠️ [Mock] Falha na conexão. Tentando reconectar...'
      );

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  if (retryCount >= 3) {
    logger.info('🎯 Teste de reconexão concluído com sucesso (recuperou após 3 falhas)');
  } else {
    logger.error('❌ Teste de reconexão falhou');
  }
}

simulateReconnect().catch(console.error);
