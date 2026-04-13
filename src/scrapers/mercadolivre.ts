// ============================================
// Scraper — Mercado Livre
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice, extractCoupon, extractFirstPrice } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';
import { isProductRelevant, stringSimilarity } from '../utils/confidence';

export const mercadolivreScraper: Scraper = {
  name: 'mercadolivre',

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('mercadolivre.com.br') || lower.includes('produto.mercadolivre');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      const isSearch = url.includes('/s?') || url.includes('listado.mercadolivre.com.br');

      // ML é SPA pesada — forçar Puppeteer e esperar seletores de preço/título
      const html = await fetchHtml(
        url,
        false,
        true,
        1,
        isSearch ? '.ui-search-result__content, .ui-search-layout' : 'h1.ui-pdp-title, .ui-pdp-price__part--number, .price-tag-fraction'
      );
      if (!html) return null;

      const $ = parseHtml(html);
      const coupon = extractCoupon(html);

      let name = '';
      let price: number | null = null;
      let imageUrl = '';
      let available = true;
      let productUrl = url;
      let freeShipping = false;

      if (isSearch) {
        const results = $('.ui-search-result__wrapper');
        logger.debug({ count: results.length, url }, 'Mercado Livre busca: itens encontrados');

        let firstResult: any = null;
        if (expectedName) {
          let bestScore = -1;
          results.each((i, el) => {
            const title = $(el).find('.ui-search-item__title').text().trim() ||
                         $(el).find('h2').text().trim();
            
            if (!title) return;

            if (isProductRelevant(title, expectedName || '')) {
              const score = stringSimilarity(title, expectedName);
              if (score > bestScore) {
                bestScore = score;
                firstResult = $(el);
              }
            }
          });
          logger.debug({ bestScore, found: !!firstResult }, 'Mercado Livre busca: filtro de relevância aplicado');
        }

        if (!firstResult) {
          firstResult = results.first();
        }

        if (firstResult && firstResult.length > 0) {
          name = firstResult.find('.ui-search-item__title').text().trim() || firstResult.find('h2').text().trim();
          imageUrl = firstResult.find('img.ui-search-result-image__element').attr('data-src') || 
                     firstResult.find('img.ui-search-result-image__element').attr('src') || '';
          
          const href = firstResult.find('a.ui-search-link').attr('href');
          if (href) productUrl = href.split('#')[0];

          const priceText = firstResult.find('.ui-search-price__part--number').first().text() ||
                            firstResult.find('.price-tag-fraction').first().text();
          price = parsePrice(priceText);

          freeShipping = firstResult.find('.ui-search-item__shipping--free').length > 0 ||
                         firstResult.text().toLowerCase().includes('frete grátis');
        } else {
          logger.warn({ url }, 'Mercado Livre busca: nenhum resultado encontrado');
          return null;
        }
      } else {
        // MODO PRODUTO
        // 1. Tentar extrair via LD+JSON (mais robusto se disponível)
        const ldJsonScripts = $('script[type="application/ld+json"]');
        ldJsonScripts.each((_, element) => {
          try {
            const json = JSON.parse($(element).html() || '{}');
            if (json['@type'] === 'Product') {
              name = name || json.name;
              imageUrl = imageUrl || json.image;
              if (json.offers) {
                const offers = Array.isArray(json.offers) ? json.offers[0] : json.offers;
                if (offers.price) price = parseFloat(offers.price);
                if (offers.availability) {
                  available = offers.availability.includes('InStock');
                }
              }
            }
          } catch (e) {
            // Ignorar erros de parse em scripts individuais
          }
        });

        // 2. Fallback para Seletores CSS se LD+JSON falhar ou estiver incompleto
        if (!name) {
          name =
            $('h1.ui-pdp-title').text().trim() ||
            $('h1').first().text().trim() ||
            'Produto Mercado Livre';
        }

        if (!imageUrl) {
          imageUrl =
            $('.ui-pdp-gallery__figure img').first().attr('src') ||
            $('img.ui-pdp-image.ui-pdp-gallery__figure__image').attr('src') ||
            '';
        }

        if (price === null) {
          const priceText =
            $('meta[itemprop="price"]').attr('content') ||
            $('.ui-pdp-price__part--number').first().text() ||
            $('[class*="price-tag-fraction"]').first().text() ||
            $('[class*="price"]').first().text();

          price = parsePrice(priceText);

          // ML às vezes usa centavos separados em spans (ex: 1.250 + 90)
          if (price && price > 0) {
            const centsText =
              $('.ui-pdp-price__part--decimal').first().text().trim() ||
              $('[class*="price-tag-cents"]').first().text().trim();
            
            if (centsText) {
              const centsDigits = centsText.replace(/[^\d]/g, '');
              if (centsDigits) {
                const centsValue = parseInt(centsDigits, 10) / Math.pow(10, centsDigits.length);
                price = Math.floor(price) + centsValue;
              }
            }
          }
        }

        // Detecção de Frete Grátis
        freeShipping = 
          $('.ui-pdp-media__title--success').text().toLowerCase().includes('frete grátis') ||
          $('.ui-pdp-color--GREEN').text().toLowerCase().includes('frete grátis') ||
          $('.ui-pdp-shipping-promise').text().toLowerCase().includes('grátis');

        const originalText =
          $('.ui-pdp-price__original-value .and-price__value').text() ||
          $('del [class*="price-tag-fraction"]').first().text() ||
          $('s').first().text();
        const originalPrice = parsePrice(originalText);

        const bodyText = $('body').text().toLowerCase();
        const isPaused = bodyText.includes('publicação pausada') || 
                         bodyText.includes('produto não disponível') ||
                         bodyText.includes('anúncio, pois o produto que queria visitar finalizou');
        const hasBuyButton = $('.ui-pdp-actions__container, #buy-now').length > 0;

        if (isPaused || (!hasBuyButton && price === null)) {
          available = false;
        }
      }

      logger.debug({ name, price, available }, 'Mercado Livre scrape resultado');

      return {
        name: name.substring(0, 200),
        price,
        available,
        imageUrl,
        coupon,
        freeShipping,
        productUrl: productUrl !== url ? productUrl : undefined,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping Mercado Livre');
      return null;
    }
  },
};
