// ============================================
// Service — Cross-Store Search
// ============================================

import { ALL_SCRAPERS, scrapeUrl } from '../scrapers/index';
import { ProductCategory } from '../types';
import { stringSimilarity } from '../utils/confidence';
import { logger } from '../utils/logger';

/** Interface para o resultado de busca cross-store */
export interface CrossSearchResult {
  store: string;
  url: string;
  name: string;
  price: number | null;
  similarity: number;
}

/** 
 * Constrói a URL de busca para cada loja suportada.
 */
function getSearchUrl(store: string, query: string): string | null {
  const encoded = encodeURIComponent(query);
  const patterns: Record<string, string> = {
    kabum: `https://www.kabum.com.br/busca/${encoded}`,
    pichau: `https://www.pichau.com.br/search?q=${encoded}`,
    terabyte: `https://www.terabyteshop.com.br/busca?str=${encoded}`,
    amazon: `https://www.amazon.com.br/s?k=${encoded}`,
    mercadolivre: `https://lista.mercadolivre.com.br/${encoded.replace(/%20/g, '-')}`,
    magazineluiza: `https://www.magazineluiza.com.br/busca/${encoded}`,
    aliexpress: `https://pt.aliexpress.com/w/wholesale-${encoded.replace(/%20/g, '-')}.html`,
    shopee: `https://shopee.com.br/search?keyword=${encoded}`,
    gkinfostore: `https://www.gkinfostore.com.br/busca?str=${encoded}`,
    zoom: `https://www.zoom.com.br/search?q=${encoded}`,
    buscape: `https://www.buscape.com.br/search?q=${encoded}`,
  };
  return patterns[store] || null;
}

/**
 * Realiza uma busca do produto em todas as lojas cadastradas (exceto a de origem).
 */
export async function performCrossStoreSearch(
  productName: string,
  category: ProductCategory,
  excludeStore: string
): Promise<CrossSearchResult[]> {
  logger.info({ productName, category, excludeStore }, '🔍 Iniciando busca cross-store...');

  const results: CrossSearchResult[] = [];
  
  // Filtra os scrapers para não buscar na mesma loja e evitar scrapers de comparadores (Zoom/Buscapé) para auto-add
  const targetScrapers = ALL_SCRAPERS.filter(s => s.name !== excludeStore && s.name !== 'zoom' && s.name !== 'buscape');

  const searchPromises = targetScrapers.map(async (scraper) => {
    const searchUrl = getSearchUrl(scraper.name, productName);
    if (!searchUrl) return;

    try {
      // O scrapeUrl já lida com rate limiting por loja
      const res = await scrapeUrl(searchUrl, productName);
      
      if (res && res.name && res.price) {
        const similarity = stringSimilarity(res.name, productName);
        
        // Threshold de similaridade para auto-add (70%)
        if (similarity >= 0.7) {
          results.push({
            store: scraper.name,
            url: res.productUrl || searchUrl,
            name: res.name,
            price: res.price,
            similarity
          });
          logger.info({ store: scraper.name, similarity, name: res.name }, '✅ Produto similar encontrado');
        } else {
          logger.debug({ store: scraper.name, similarity, name: res.name }, '⚠️ Produto ignorado (baixa similaridade)');
        }
      }
    } catch (err) {
      logger.error({ store: scraper.name, error: (err as Error).message }, 'Erro na busca cross-store');
    }
  });

  // Aguarda todos os scrapings terminarem (limitados individualmente em scrapeUrl)
  await Promise.allSettled(searchPromises);
  
  return results;
}
