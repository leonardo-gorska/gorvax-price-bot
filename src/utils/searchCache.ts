// ============================================
// Utils — Search Results Cache (Redis)
// ============================================

import { getRedis } from './redis';
import { logger } from './logger';
import { CrossSearchResult } from '../services/crossSearch';

const SEARCH_CACHE_TTL = 30 * 60; // 30 minutos

/**
 * Salva os resultados de uma busca no Redis para posterior monitoramento via botões
 */
export async function saveSearchResults(chatId: string, results: CrossSearchResult[]): Promise<void> {
  const redis = getRedis();
  const key = `search:results:${chatId}`;
  
  try {
    await redis.set(key, JSON.stringify(results), 'EX', SEARCH_CACHE_TTL);
    logger.debug({ chatId, count: results.length }, 'Resultados de busca salvos no cache');
  } catch (err) {
    logger.error({ error: (err as Error).message }, 'Erro ao salvar cache de busca');
  }
}

/**
 * Recupera os resultados de busca salvos para um chat específico
 */
export async function getSearchResults(chatId: string): Promise<CrossSearchResult[]> {
  const redis = getRedis();
  const key = `search:results:${chatId}`;
  
  try {
    const data = await redis.get(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    logger.error({ error: (err as Error).message }, 'Erro ao ler cache de busca');
    return [];
  }
}
