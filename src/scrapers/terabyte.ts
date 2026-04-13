// ============================================
// Scraper — Terabyteshop
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice, extractCoupon, extractFirstPrice, extractAllPrices } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';
import { stringSimilarity, isProductRelevant } from '../utils/confidence';

/**
 * Seleciona o preço real (não parcela) de uma lista de preços.
 * O menor preço pode ser parcela de cartão, o maior é o preço cheio.
 */
function pickRealPrice(prices: number[]): number | null {
  if (prices.length === 0) return null;
  if (prices.length === 1) return prices[0];
  
  const smallest = prices[0];
  const largest = prices[prices.length - 1];
  
  if (largest / smallest > 3) return largest;
  return smallest;
}

export const terabyteScraper: Scraper = {
  name: 'terabyte',

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('terabyte') || lower.includes('terabyteshop');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // Terabyte usa JS — forçar Puppeteer
      // Espera cards de produto reais renderizarem (pbox e product-item__grid são comuns)
      const html = await fetchHtml(
        url, false, true, 3,
        '.product-item__grid, .pbox, #listagem_produtos .product-item, .prod-new-price',
        undefined, 90000
      );
      if (!html) return null;

      const $ = parseHtml(html);
      const coupon = extractCoupon(html);

      let name = '';
      let price: number | null = null;
      let originalPrice: number | null = null;
      let imageUrl = '';
      let productUrl = '';

      // ─── ESTRATÉGIA 1: JSON-LD ───
      try {
        const jsonLd = $('script[type="application/ld+json"]').toArray();
        for (const script of jsonLd) {
          try {
            const data = JSON.parse($(script).html() || '');
            const product = Array.isArray(data) 
              ? data.find((d: Record<string, unknown>) => d['@type'] === 'Product') 
              : (data['@type'] === 'Product' ? data : null);
            if (product) {
              name = product.name || '';
              const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              const jsonPrice = parseFloat(offer?.price);
              if (!isNaN(jsonPrice) && jsonPrice > 5) {
                price = jsonPrice;
              }
              imageUrl = product.image || '';
              break;
            }
          } catch { /* continua */ }
        }
      } catch {
        logger.debug({ url }, 'Falha ao extrair JSON-LD, usando DOM');
      }

      // ─── ESTRATÉGIA 2: DOM CSS + regex ───
      if (!name || price === null) {
        let bestScore = -1;
        let foundValid = false;
        let firstCard = $('.pbox').first().length
          ? $('.pbox').first()
          : ($('.product-item__main-content').first().length 
            ? $('.product-item__main-content').first() 
            : $('.commerce_columns_item_inner').first());

        if (expectedName && (url.includes('busca?str=') || url.includes('pesquisa?t='))) {
            const cards = $('.product-item__grid').length
              ? $('.product-item__grid')
              : ($('.pbox').length 
                 ? $('.pbox') 
                 : ($('.product-item__main-content').length ? $('.product-item__main-content') : $('.commerce_columns_item_inner')));
            
            logger.debug({ url, cardCount: cards.length }, 'Terabyte: buscando produtos');

            cards.each((i, el) => {
              const link = $(el).find('a[title]').first().length ? $(el).find('a[title]').first() : $(el).find('a').first();
              const title = link.attr('title') ||
                            $(el).find('.product-item__name').text().trim() ||
                            $(el).find('.prod-name').text().trim() ||
                            $(el).find('h2').text().trim() || '';
              
              if (!isProductRelevant(title, expectedName)) return;

              const score = stringSimilarity(title, expectedName);
              if (score > bestScore) {
                bestScore = score;
                firstCard = $(el);
                foundValid = true;
              }
            });

            if (!foundValid) {
              // Tenta alternar entre busca antiga e nova pesquisa
              if (url.includes('busca?str=')) {
                logger.debug({ url }, 'Terabyte: busca antiga falhou ou irrelevante, tentando pesquisa?t=');
                const newQuery = url.split('busca?str=')[1];
                const newUrl = `https://www.terabyteshop.com.br/pesquisa?t=${newQuery}`;
                return this.scrape(newUrl, expectedName);
              }
              logger.warn({ url, expectedName, bestScore, cardCount: cards.length }, 'Terabyte: nenhum resultado relevante encontrado na busca');
              return null;
            }
        }

        if (firstCard.length && (url.includes('busca?str=') || url.includes('pesquisa?t='))) {
          productUrl = firstCard.find('a[href*="/produto/"]').first().attr('href') || '';
          // Modo Busca
          name = name || firstCard.find('.product-item__name').text().trim()
            || firstCard.find('.prod-name').text().trim()
            || firstCard.find('h2').first().text().trim() 
            || firstCard.find('a[title]').attr('title') || '';
          
          if (price === null) {
            // Tenta seletor direto primeiro (atualizados para o novo layout)
            const priceDirectText = firstCard.find('.product-item__new-price').text().trim() 
              || firstCard.find('.prod-new-price').text().trim() 
              || firstCard.find('.pprice').text().trim() 
              || firstCard.find('[class*="new-price"]').text().trim()
              || firstCard.find('[class*="price"]').text().trim();
            
            price = extractFirstPrice(priceDirectText);
            
            // Fallback: regex com heurístico anti-parcela
            if (price === null) {
              const cardText = firstCard.text();
              const prices = extractAllPrices(cardText);
              price = pickRealPrice(prices);
            }
          }
          
          const oldText = firstCard.find('.prod-old-price, del').first().text();
          if (!originalPrice) originalPrice = extractFirstPrice(oldText);
          
          imageUrl = imageUrl || firstCard.find('.product-item__image img').attr('src')
            || firstCard.find('img[src*="produtos"]').attr('src')
            || firstCard.find('.prod-img img').attr('src')
            || firstCard.find('img').first().attr('src') || '';
        } else {
          // Produto Individual
          name = name || $('h1').first().text().trim();

          if (price === null) {
            const priceText = $('.prod-new-price').first().text()
              || $('[class*="preco"]').first().text();
            price = extractFirstPrice(priceText);
            
            if (price === null) {
              const mainText = $('[class*="prod-info"], main').first().text();
              const prices = extractAllPrices(mainText);
              price = pickRealPrice(prices);
            }
          }

          const origText = $('.prod-old-price, del').first().text();
          if (!originalPrice) originalPrice = extractFirstPrice(origText);
          
          imageUrl = imageUrl || $('#prod-default-img').attr('src')
            || $('.product-item__image img').attr('src')
            || $('img[src*="produtos"]').first().attr('src')
            || $('img[alt]').first().attr('src') || '';
        }
      }

      // Não usar título da página de busca como nome de produto
      if (!name || name.length < 5 
          || name.toLowerCase().startsWith('resultado') 
          || name.toLowerCase().includes('busca por')
          || name.toLowerCase().includes('terabyte')) {
        name = name || 'Produto Terabyte';
      }

      // Sanity check
      if (price !== null && price < 5) {
        logger.warn({ url, parsedPrice: price }, 'Terabyte: preço muito baixo, descartando');
        price = null;
      }

      const bodyText = $('body').text().toLowerCase();
      const available = !bodyText.includes('indisponível')
        && !bodyText.includes('esgotado')
        && price != null;

      logger.debug({ name, price, available }, 'Terabyte scrape resultado');

      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://www.terabyteshop.com.br' + productUrl;
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
      logger.error({ url, error: message }, 'Erro scraping Terabyte');
      return null;
    }
  },
};
