// ============================================
// Scraper — Magazine Luiza (Magalu)
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';

export const magazineluizaScraper: Scraper = {
  name: 'magazineluiza',

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('magazineluiza.com.br') || lower.includes('magalu.com');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // Magalu é SPA Next.js — forçar Puppeteer
      const html = await fetchHtml(
        url, false, true, 1,
        'h1, [data-testid="price-value"], [class*="price"]'
      );
      if (!html) return null;

      const $ = parseHtml(html);
      
      let name = '';
      let price: number | null = null;
      let originalPrice: number | null = null;
      let available = false;
      let imageUrl: string | null = null;
      let variations: ScrapeResult['variations'] = [];

      // ─── ESTRATÉGIA 1: __NEXT_DATA__ (JSON) ───
      const nextDataStr = $('#__NEXT_DATA__').html();
      const nextData = nextDataStr ? JSON.parse(nextDataStr) : null;

      if (nextData && nextData.props?.pageProps?.data) {
        const data = nextData.props.pageProps.data;
        const item = data.item || data.product;

        if (item) {
          name = item.title || item.name || '';
          imageUrl = item.image || (item.media?.images?.[0]) || null;
          available = item.available === true;
          
          // Extrair variações
          if (item.attributes && Array.isArray(item.attributes)) {
            for (const attr of item.attributes) {
              const label = attr.label;
              if (attr.values && Array.isArray(attr.values)) {
                for (const val of attr.values) {
                  variations.push({
                    label,
                    value: val.value,
                    url: val.path ? `https://www.magazineluiza.com.br${val.path}` : '',
                    available: val.available !== false,
                  });
                }
              }
            }
          }

          // Pegar preço de item.offers[0] (novo padrão)
          if (item.offers && Array.isArray(item.offers) && item.offers.length > 0) {
            const firstOffer = item.offers[0];
            
            // Pix ou preço à vista costuma estar em bestPrice
            if (firstOffer.bestPrice) {
              price = firstOffer.bestPrice.totalAmount || firstOffer.price || null;
            } else {
              price = firstOffer.price || null;
            }

            originalPrice = firstOffer.listPrice || null;
            
            if (firstOffer.seller?.available !== undefined) {
              available = firstOffer.seller.available;
            }
          }
        }

        // Fallback Legado: BuyBox
        if (price === null && data.buyBox) {
          const buyBox = data.buyBox;
          price = buyBox.price || null;
          originalPrice = buyBox.oldPrice || null;
          if (buyBox.isAvailable !== undefined) available = buyBox.isAvailable;
        }
      }

      // ─── ESTRATÉGIA 2: DOM FALLBACK ───
      if (!name) {
        name = $('h1[data-testid="heading-product-title"]').text().trim()
          || $('h1').first().text().trim()
          || 'Produto Magazine Luiza';
      }

      if (price === null) {
        const priceText = $('[data-testid="price-value"]').first().text()
          || $('[class*="price"]').first().text()
          || $('p[class*="price"]').text();
        price = parsePrice(priceText);
      }

      if (!originalPrice) {
        const originalText = $('[data-testid="price-original"]').first().text()
          || $('del').first().text();
        originalPrice = parsePrice(originalText);
      }

      if (!imageUrl) {
        imageUrl = $('[data-testid="image-header-product"]').first().attr('src')
          || $('img[class*="image"]').first().attr('src') || null;
      }

      // Se o JSON não definiu disponibilidade de forma clara
      if (!available && price !== null) {
        const bodyText = $('body').text().toLowerCase();
        available = !bodyText.includes('produto indisponível')
          && !bodyText.includes('esgotado');
      }

      logger.debug({ name, price, available, variationsCount: variations.length }, 'Magazine Luiza scrape resultado');

      return {
        name: name.substring(0, 200),
        price,
        available,
        originalPrice,
        imageUrl,
        variations: variations.length > 0 ? variations : undefined,
        productUrl: url,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping Magazine Luiza');
      return null;
    }
  },
};
