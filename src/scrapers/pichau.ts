// ============================================
// Scraper — Pichau
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice, extractCoupon, extractFirstPrice, extractAllPrices } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';
import { stringSimilarity, isProductRelevant } from '../utils/confidence';

/**
 * Seleciona o preço real (não parcela) de uma lista de preços.
 * Em lojas BR: "R$ 705,87 A vista no PIX — ou 12x de R$ 58,82"
 * extractAllPrices retorna [58.82, 705.87] ascendente
 * A parcela é sempre muito menor que o preço real (ratio > 3x)
 */
function pickRealPrice(prices: number[]): number | null {
  if (prices.length === 0) return null;
  if (prices.length === 1) return prices[0];
  
  const smallest = prices[0];
  const largest = prices[prices.length - 1];
  
  // Se o maior é 3x+ o menor, o menor é parcela → retornar o maior
  if (largest / smallest > 3) {
    return largest;
  }
  
  // Se são próximos (preço à vista vs preço cheio), retornar o menor (desconto PIX)
  return smallest;
}

export const pichauScraper: Scraper = {
  name: 'pichau',

  canHandle(url: string): boolean {
    return url.toLowerCase().includes('pichau.com.br');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // Pichau é SPA React — forçar Puppeteer
      // Espera elementos de preço ou cards de produto renderizarem
      const html = await fetchHtml(
        url, false, true, 1,
        'a[href*="/produto/"], [data-cy="list-product"], [class*="MuiCardContent"]'
      );
      if (!html) return null;

      const $ = parseHtml(html);
      const coupon = extractCoupon(html);

      let name = '';
      let price: number | null = null;
      let originalPrice: number | null = null;
      let imageUrl = '';
      let productUrl = '';

      // ─── ESTRATÉGIA 1: JSON-LD schema.org ───
      let jsonBestScore = -1;
      try {
        const jsonLd = $('script[type="application/ld+json"]').toArray();
        for (const script of jsonLd) {
          try {
            const data = JSON.parse($(script).html() || '');
            const products = Array.isArray(data) 
              ? data.filter((d: Record<string, unknown>) => d['@type'] === 'Product') 
              : (data['@type'] === 'Product' ? [data] : []);
            
            for (const product of products) {
              const productName = product.name || '';
              let score = 1;

              if (expectedName && url.includes('search?q=')) {
                if (!isProductRelevant(productName, expectedName)) continue;
                score = stringSimilarity(productName, expectedName);
              }

              // Threshold de 0.8 para busca via JSON-LD (muito rigoroso)
              const threshold = url.includes('search?q=') ? 0.7 : 0.3;

              if (score > jsonBestScore && score >= threshold) {
                jsonBestScore = score;
                name = productName;
                const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                const jsonPrice = parseFloat(offer?.price);
                if (!isNaN(jsonPrice) && jsonPrice > 5) {
                  price = jsonPrice;
                }
                imageUrl = product.image || '';
              }
            }
          } catch { /* continua */ }
        }
      } catch {
        logger.debug({ url }, 'Falha ao extrair JSON-LD, usando DOM');
      }

      // ─── ESTRATÉGIA 2: DOM CSS + regex ───
      if (!name || price === null) {
        // Buscar o primeiro card de produto com link para /produto/
        const productLinks = $('a[href*="/produto/"]').toArray();
        let firstCard: ReturnType<typeof $> | null = null;
        
        if (expectedName && url.includes('search?q=')) {
          let bestScore = -1;
          for (const link of productLinks) {
            const parent = $(link).closest('div').parent();
            if (parent.length && parent.text().includes('R$')) {
              // Filtrar Patrocinados e Relevância (comum na Pichau em grids de busca)
              const cardText = parent.text().toLowerCase();
              const isSponsored = cardText.includes('patrocinado') || 
                                  cardText.includes('anúncio') || 
                                  cardText.includes('anuncio') ||
                                  parent.find('[class*="tag"]').length > 0 ||
                                  parent.find('[class*="badge"]').length > 0;
              
              if (isSponsored) continue;

              const title = parent.find('h2').first().text().trim() ||
                            parent.find('a[href*="/produto/"]').first().text().trim() ||
                            parent.find('img').first().attr('alt') || '';
              
              if (!isProductRelevant(title, expectedName)) continue;

              const score = stringSimilarity(title, expectedName);

              if (score > bestScore) {
                bestScore = score;
                firstCard = parent;
                productUrl = $(link).attr('href') || '';
              }
            }
          }

          // Threshold aumentado para 0.6 para maior precisão em modo de busca
          if (bestScore >= 0 && bestScore < 0.6) {
            logger.warn({ url, expectedName, bestScore }, 'Pichau: nenhum resultado relevante encontrado na busca (score baixo)');
            return null; 
          }
        }

        // Fallback apenas para páginas de produto direto, não para busca
        if (!firstCard && !url.includes('search?q=')) {
          for (const link of productLinks) {
            const parent = $(link).closest('div').parent();
            if (parent.length && parent.text().includes('R$')) {
              firstCard = parent;
              productUrl = $(link).attr('href') || '';
              break;
            }
          }
        }


        if (firstCard && firstCard.length && url.includes('search?q=')) {
          // Modo Busca
          name = name || firstCard.find('h2').first().text().trim()
            || firstCard.find('a[href*="/produto/"]').first().text().trim()
            || firstCard.find('img').first().attr('alt') || '';
          
          // Extrair preço real usando heurístico anti-parcela
          if (price === null) {
            const cardText = firstCard.text();
            const prices = extractAllPrices(cardText);
            price = pickRealPrice(prices);
          }
          
          const oldText = firstCard.find('del, s').first().text();
          if (!originalPrice) originalPrice = extractFirstPrice(oldText);
          
          imageUrl = imageUrl || firstCard.find('img').first().attr('src') || '';
        } else {
          // Página do produto individual
          name = name || $('h1').first().text().trim();

          if (price === null) {
            // Tenta: texto próximo a "PIX" ou "à vista"
            const bodyText = $('body').text();
            const pixMatch = bodyText.match(/R\$\s*([\d.]+,\d{2})\s*(?:A vista|à vista|no PIX)/i);
            if (pixMatch) {
              price = parsePrice(pixMatch[1]);
            }
            
            // Fallback: preço real do conteúdo principal
            if (price === null) {
              const mainText = $('main, [class*="product"]').first().text();
              const prices = extractAllPrices(mainText);
              price = pickRealPrice(prices);
            }
          }

          const origText = $('del, s, [class*="oldPrice"]').first().text();
          if (!originalPrice) originalPrice = extractFirstPrice(origText);
          
          imageUrl = imageUrl || $('img[alt]').first().attr('src') || '';
        }
      }

      if (!name || name.length < 5) name = 'Produto Pichau';

      // Sanity check: preços abaixo de R$ 5 são erro de parsing
      if (price !== null && price < 5) {
        logger.warn({ url, parsedPrice: price }, 'Pichau: preço muito baixo, descartando');
        price = null;
      }

      const bodyText = $('body').text().toLowerCase();
      const available = !bodyText.includes('indisponível')
        && !bodyText.includes('esgotado')
        && !bodyText.includes('fora de estoque')
        && price != null;

      logger.debug({ name, price, available }, 'Pichau scrape resultado');

      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://www.pichau.com.br' + productUrl;
      }

      return {
        name: name.substring(0, 200),
        price,
        available,
        originalPrice,
        pixPrice: price,
        imageUrl,
        coupon,
        productUrl,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping Pichau');
      return null;
    }
  },
};
