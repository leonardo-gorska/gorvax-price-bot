// ============================================
// Scraper — Buscapé
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice, extractCoupon } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';

export const buscapeScraper: Scraper = {
  name: 'buscape',

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('buscape.com.br');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // Buscapé e Zoom usam a mesma plataforma (Mosaico)
      const html = await fetchHtml(
        url,
        false,
        true,
        1,
        'h1, [class*="PriceWrapper"], [class*="ProductCard"]'
      );
      if (!html) return null;

      const $ = parseHtml(html);
      const coupon = extractCoupon(html);

      let name = '';
      let price: number | null = null;
      let imageUrl = '';
      let available = true;

      // 1. Tentar extrair via LD+JSON
      const ldJsonScripts = $('script[type="application/ld+json"]');
      ldJsonScripts.each((_, element) => {
        try {
          const json = JSON.parse($(element).html() || '{}');
          const items = Array.isArray(json) ? json : [json];
          
          for (const item of items) {
            if (item['@type'] === 'Product') {
              name = name || item.name;
              imageUrl = imageUrl || item.image;
              if (item.offers) {
                const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                const p = offers.lowPrice || offers.price;
                if (p) price = parseFloat(p);
                
                if (offers.availability) {
                  available = offers.availability.includes('InStock');
                }
              }
            }
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      });

      // 2. Fallback para Seletores CSS (Página de Produto)
      if (!name) {
        name = $('h1[class*="Title"]').first().text().trim() || 
               $('h1').first().text().trim();
      }

      if (price === null) {
        const priceText = $('[class*="OfferPrice_PriceWrapper"] span').first().text() || 
                          $('[class*="PriceWrapper"]').first().text();
        price = parsePrice(priceText);
      }

      // 3. Fallback para Seletores CSS (Página de Busca - primeiro resultado)
      if (!name || (price === null)) {
         const firstCard = $('a[class^="ClickableArea_OrqProductCard"]').first();
         if (firstCard.length > 0) {
            name = name || firstCard.find('h2').text().trim();
            const cardPriceText = firstCard.find('strong').text();
            if (price === null) price = parsePrice(cardPriceText);
            
            if (!imageUrl) {
               imageUrl = firstCard.find('img').attr('src') || '';
            }
         }
      }

      if (!imageUrl) {
        imageUrl = $('[class*="ImageWrapper"] img').first().attr('src') || '';
      }

      // Verificação de disponibilidade extra
      const bodyText = $('body').text().toLowerCase();
      if (bodyText.includes('produto indisponível') || bodyText.includes('esgotado')) {
        available = false;
      }

      logger.debug({ name, price, available, store: 'buscape' }, 'Buscapé scrape resultado');

      return {
        name: name.substring(0, 200),
        price,
        available,
        imageUrl,
        coupon,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping Buscapé');
      return null;
    }
  },
};
