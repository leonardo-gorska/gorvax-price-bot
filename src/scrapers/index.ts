// ============================================
// Scrapers — Index (registry + orchestration)
// ============================================

import type { Scraper } from './base';
import type { ScrapeResult } from '../types';
import { kabumScraper } from './kabum';
import { pichauScraper } from './pichau';
import { terabyteScraper } from './terabyte';
import { amazonScraper } from './amazon';
import { mercadolivreScraper } from './mercadolivre';
import { magazineluizaScraper } from './magazineluiza';
import { aliexpressScraper } from './aliexpress';
import { shopeeScraper } from './shopee';
import { gkinfostoreScraper } from './gkinfostore';
import { zoomScraper } from './zoom';
import { buscapeScraper } from './buscape';
import { logger } from '../utils/logger';
import { pLimit } from '../utils/concurrency';
import { scrapeCache } from '../utils/cache';

/** Todos os scrapers registrados */
export const ALL_SCRAPERS: Scraper[] = [
  kabumScraper,
  pichauScraper,
  terabyteScraper,
  amazonScraper,
  mercadolivreScraper,
  magazineluizaScraper,
  aliexpressScraper,
  shopeeScraper,
  gkinfostoreScraper,
  zoomScraper,
  buscapeScraper,
];

// ─── Per-Store Rate Limiting ────────────────
// Máximo de 1 request simultâneo por loja + delay entre requests da mesma loja
const storeLimiters = new Map<string, ReturnType<typeof pLimit>>();

function getStoreLimiter(storeName: string) {
  if (!storeLimiters.has(storeName)) {
    storeLimiters.set(storeName, pLimit(1));
  }
  return storeLimiters.get(storeName)!;
}

/** Timeout padrão para scraping (60 segundos) */
const SCRAPE_TIMEOUT_MS = 60_000;

/** Encontra o scraper adequado para uma URL */
export function getScraperForUrl(url: string): Scraper | null {
  return ALL_SCRAPERS.find(s => s.canHandle(url)) || null;
}

/** Faz scraping de uma URL com timeout de 60s e rate-limit por loja */
export async function scrapeUrl(url: string, expectedName?: string): Promise<ScrapeResult | null> {
  // 1. Tenta buscar do cache
  const cached = scrapeCache.get(url);
  if (cached) {
    logger.info({ url }, '🎯 Cache hit! Retornando resultado em cache.');
    return cached;
  }

  const scraper = getScraperForUrl(url);
  if (!scraper) {
    logger.warn({ url }, 'Nenhum scraper encontrado para esta URL');
    return null;
  }

  // Rate-limit por loja (máx 1 simultâneo)
  const limiter = getStoreLimiter(scraper.name);

  const result = await limiter(async () => {
    const startTime = performance.now();
    logger.info({ url, scraper: scraper.name }, 'Iniciando scraping');

    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => {
        logger.warn({ url, scraper: scraper.name, timeoutMs: SCRAPE_TIMEOUT_MS }, '⏱️ Timeout no scraping');
        resolve(null);
      }, SCRAPE_TIMEOUT_MS);
    });

    const scrapePromise = scraper.scrape(url, expectedName).then((r: ScrapeResult | null) => { 
      if (timeoutId) clearTimeout(timeoutId); 
      return r; 
    });

    const res = await Promise.race([
      scrapePromise,
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);

    const duration = Math.round(performance.now() - startTime);
    if (res) {
      logger.info(
        { url, name: res.name, price: res.price, available: res.available, durationMs: duration },
        '✅ Scraping concluído'
      );
    } else {
      logger.warn({ url, durationMs: duration }, '❌ Scraping retornou null');
    }

    return res;
  });

  // 2. Salva no cache se o resultado for válido
  if (result) {
    scrapeCache.set(url, result);
  }

  return result;
}

/** Faz scraping de múltiplas URLs (a rate-limit por loja já é aplicada em scrapeUrl) */
export async function scrapeUrls(
  urls: string[]
): Promise<Map<string, ScrapeResult | null>> {
  const results = new Map<string, ScrapeResult | null>();

  // Processar em paralelo — o rate-limit por loja garante segurança
  const globalLimit = pLimit(4);
  await Promise.all(urls.map(url => globalLimit(async () => {
    const result = await scrapeUrl(url);
    results.set(url, result);
  })));

  return results;
}
