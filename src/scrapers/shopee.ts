import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';

export const shopeeScraper: Scraper = {
  name: 'shopee',

  canHandle(url: string): boolean {
    return url.includes('shopee.com.br');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    logger.info({ url }, 'Scraping Shopee');

    try {
      const shopeeCookieInfo = process.env.SHOPEE_COOKIE;
      const customCookies = [];
      if (shopeeCookieInfo) {
         customCookies.push({
           name: 'SPC_EC',
           value: shopeeCookieInfo,
           domain: '.shopee.com.br'
         });
      }

      const blockStrings = [
        'Página indisponível',
        'buyer/login',
        'captcha',
        'Too many requests',
        'Número de telefone',
        'verify with a simple puzzle',
        'verify you are human'
      ];

      // Shopee requires JS and often specific stealth
      let html = await fetchHtml(
        url,
        false, // useBrowser fallback if needed
        true,  // jsRequired
        3,     // retryCount (increased)
        '[data-sqe="item"], [data-sqe="name"], .shopee-search-item-result__item, div.product-briefing, .product-briefing',
        customCookies,
        undefined,
        blockStrings
      );

      // Se falhou ou foi bloqueado, tentar busca como fallback se tivermos expectedName
      if (!html || blockStrings.some(s => html?.includes(s))) {
        if (expectedName) {
          logger.info({ url, expectedName }, '⚠️ Shopee bloqueado ou indisponível. Tentando busca como fallback...');
          const searchUrl = `https://shopee.com.br/search?keyword=${encodeURIComponent(expectedName)}`;
          html = await fetchHtml(
            searchUrl,
            false,
            true,
            2,
            '[data-sqe="item"], [data-sqe="name"], .shopee-search-item-result__item',
            customCookies,
            undefined,
            blockStrings
          );
        }
      }

      if (!html) return null;

      const $ = parseHtml(html);

      // 1. Try LD+JSON (Structured Data) - Works best for product pages
      const ldJsonScripts = $('script[type="application/ld+json"]');
      let result: ScrapeResult | null = null;

      ldJsonScripts.each((_, element) => {
        try {
          const content = $(element).html();
          if (!content) return;
          const ldData = JSON.parse(content);
          
          if (ldData && ldData['@type'] === 'Product' && ldData.name && ldData.offers) {
            const price = parseFloat(ldData.offers.lowPrice || ldData.offers.price || '0');
            const availability = ldData.offers.availability?.includes('InStock') || ldData.offers.availability === 'http://schema.org/InStock';

            result = {
              name: ldData.name,
              price: price || null,
              available: availability,
              productUrl: url,
            };
            return false; // break loop
          }
        } catch (e) {
          // ignore parse errors
        }
      });

      if (result) return result;

      // 2. Fallback to CSS Selectors - Essential for search/list pages and blocked product pages
      // Based on browser analysis: [data-sqe="name"] is stable.
      // We look for the first item in the search results
      const firstItem = $('.shopee-search-item-result__item, [data-sqe="item"], .shopee_product__content').first();
      
      const name = firstItem.find('[data-sqe="name"]').text().trim() || 
                   $('[data-sqe="name"]').first().text().trim() || 
                   $('h1').first().text().trim();
      
      // Price extraction: Shopee list view uses [data-sqe="price"]
      let priceText = '';
      const priceContainer = firstItem.find('[data-sqe="price"]').first() || $('[data-sqe="price"]').first();
      
      if (priceContainer.length > 0) {
        // Shopee often has multiple spans inside [data-sqe="price"] for R$ and value
        priceText = priceContainer.text().trim();
      } else {
        // Fallback for product page or different layout
        priceText = $('.product-price').first().text().trim() ||
                    $('.Y-7A8s').first().text().trim() ||
                    $('[data-sqe="price"]').first().text().trim();
      }
      
      if (!name) {
        logger.debug({ url }, 'Shopee element extraction failed: name not found');
        return null;
      }

      const price = parsePrice(priceText);

      return {
        name,
        price,
        available: !!price,
        productUrl: url,
      };
    } catch (error) {
      logger.error({ url, error }, 'Error scraping Shopee');
      return null;
    }
  }
};
