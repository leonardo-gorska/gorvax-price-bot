import Redis from 'ioredis';
import { getConfig } from '../config';
import { logger } from './logger';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const config = getConfig();
    logger.debug({ url: config.REDIS_URL }, 'Conectando ao Redis...');
    
    const isSsl = config.REDIS_URL.startsWith('rediss://');
    redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null, // BullMQ requer isso
      tls: isSsl ? {} : undefined,
    });

    redis.on('error', (err) => {
      logger.error({ error: err.message }, 'Erro de conexão no Redis');
    });

    redis.on('connect', () => {
      logger.info('✅ Conectado ao Redis');
    });
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('✅ Conexão Redis fechada');
  }
}
