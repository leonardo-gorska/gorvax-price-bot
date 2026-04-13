import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';

/**
 * Scraper for GKInfoStore (https://www.gkinfostore.com.br)
 * Platform: Tray
 */
export const gkinfostoreScraper: Scraper = {
  name: 'gkinfostore',

  canHandle(url: string): boolean {
    return url.includes('gkinfostore.com.br');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    logger.info({ url }, 'Scraping GKInfoStore');

    try {
      // Force Puppeteer and wait for main content
      const html = await fetchHtml(url, true, true, 1, '#produto_comprar, .componente-produto, .fundo-busca');
      if (!html) return null;

      const $ = parseHtml(html);

      // 1. Try LD+JSON (Structured Data)
      const ldJsonScripts = $('script[type="application/ld+json"]').toArray();
      let result: ScrapeResult | null = null;
      
      for (const element of ldJsonScripts) {
        try {
          const content = $(element).html();
          if (!content) continue;
          const ldData = JSON.parse(content) as any;
          
          if (ldData && ldData['@type'] === 'Product' && ldData.name && ldData.offers) {
            const offers = Array.isArray(ldData.offers) ? ldData.offers[0] : (ldData.offers.offers ? (Array.isArray(ldData.offers.offers) ? ldData.offers.offers[0] : ldData.offers.offers) : ldData.offers);
            
            logger.debug({ offers, url }, 'LD+JSON Offers found');
            const price = parseFloat(offers.price || '0');
            const availability = offers.availability?.includes('InStock') || offers.availability === 'http://schema.org/InStock';

            result = {
              name: String(ldData.name).replace(/\s+/g, ' ').trim(),
              price: price || null,
              available: availability,
              productUrl: url,
            };
            break;
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      if (result) {
        logger.info({ url, name: result.name, price: result.price }, 'Found data via LD+JSON');
        return result;
      }

      // 2. Fallback to Microdata (itemprop) - Common in Tray
      // Identify main container to avoid picking up metadata from featured/related products
      const isProductPage = $('.secao-principal .produto').length > 0 || $('h1.nome-produto').length > 0;
      const $mainContainer = isProductPage ? ($('.secao-principal .produto').length > 0 ? $('.secao-principal .produto').first() : $('body')) : $('.componente-produto').first();

      const name = ($mainContainer.find('[itemprop="name"]').text() || 
                    $mainContainer.find('h1.nome-produto').text() || 
                    $('.produto-sobrepor').first().attr('title') || '').replace(/\s+/g, ' ').trim();

      const microPrice = $mainContainer.find('[itemprop="price"]').attr('content') || 
                         $mainContainer.find('[itemprop="offers"] [itemprop="price"]').attr('content');
      
      const microAvailability = $mainContainer.find('[itemprop="availability"]').attr('content') || 
                                $mainContainer.find('[itemprop="offers"] [itemprop="availability"]').attr('content');

      if (name && microPrice && isProductPage) {
        logger.info({ url, name, price: microPrice }, 'Found data via Microdata (scoped)');
        return {
          name,
          price: parseFloat(microPrice) || null,
          available: microAvailability?.includes('InStock') || false,
          productUrl: url,
        };
      }

      // 3. Last Resort: CSS Selectors (Scoped)
      const $container = $mainContainer;

      // Price: Try to find the most specific price in the container
      let priceTextRaw = '';
      if (isProductPage) {
        priceTextRaw = $container.find('.desconto-a-vista').first().text().trim() ||
                       $container.find('.preco-promocional').first().text().trim() ||
                       $container.find('.preco-pix').first().text().trim() || 
                       $container.find('.preco-cartao').first().text().trim();
      } else {
        priceTextRaw = $container.find('.preco-pix').text().trim() || 
                       $container.find('.preco-cartao').text().trim() ||
                       $container.find('.preco-venda').text().trim();
      }

      logger.debug({ url, isProductPage, priceTextRaw }, 'CSS Price text found (scoped resort)');

      const hasBuyButton = $container.find('.botao-comprar').length > 0 || $container.find('.tag-comprar').length > 0;
      const isUnavailable = $container.find('.avise-me-list-btn').length > 0 || 
                            html.toLowerCase().includes('produto indisponível') ||
                            html.toLowerCase().includes('indisponível');
      
      const available = hasBuyButton && !isUnavailable;

      if (!name || name.length < 3) {
        logger.debug({ url, name }, 'GKInfoStore element extraction failed: name not found or too short');
        return null;
      }

      const price = parsePrice(priceTextRaw);

      return {
        name,
        price: price || (microPrice ? parseFloat(microPrice) : null),
        available: available || microAvailability?.includes('InStock') || false,
        productUrl: url,
      };
    } catch (error) {
      logger.error({ url, error }, 'Error scraping GKInfoStore');
      return null;
    }
  }
};
