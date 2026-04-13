// ============================================
// Scraper — AliExpress Brasil
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice, extractCoupon } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';

export const aliexpressScraper: Scraper = {
  name: 'aliexpress',

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return (
      lower.includes('aliexpress.com') ||
      lower.includes('aliexpress.com.br') ||
      lower.includes('pt.aliexpress.com')
    );
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // AliExpress requires JS and a reliable element to indicate page load
      const html = await fetchHtml(
        url,
        false,
        true,
        1,
        'h1[data-pl="product-title"], .price-default--currentWrap--A_MNgCG, .product-price-value'
      );
      if (!html) return null;

      const $ = parseHtml(html);
      const coupon = extractCoupon(html);

      let name = '';
      let price: number | null = null;
      let originalPrice: number | null = null;
      let imageUrl = '';
      let available = true;

      // 1. Try to extract via LD+JSON (most stable if present)
      const ldJsonScripts = $('script[type="application/ld+json"]');
      ldJsonScripts.each((_, element) => {
        try {
          const content = $(element).html();
          if (!content) return;
          const json = JSON.parse(content);
          
          const products = Array.isArray(json) ? json : [json];
          const product = products.find((j: any) => j['@type'] === 'Product');

          if (product) {
            name = name || product.name;
            imageUrl = imageUrl || (Array.isArray(product.image) ? product.image[0] : product.image);
            
            if (product.offers) {
              const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              const priceVal = offers.price || offers.lowPrice;
              if (priceVal && price === null) {
                const parsed = parseFloat(String(priceVal).replace(',', '.'));
                if (!isNaN(parsed)) price = parsed;
              }
              
              if (offers.availability) {
                available = offers.availability.includes('InStock');
              }
            }
          }
        } catch (e) {
          // Ignore
        }
      });

      // 2. Fallback to CSS Selectors
      if (!name) {
        name = 
          $('h1[data-pl="product-title"]').text().trim() ||
          $('.title--text--S6vS_S2').text().trim() ||
          $('h1').first().text().trim() ||
          'Produto AliExpress';
      }

      if (!imageUrl) {
        imageUrl = 
          $('img.magnifier--image--G_A5z').attr('src') ||
          $('img.magnifier--image--RM17RL2').attr('src') ||
          $('.p-item-detail-main-img img').attr('src') ||
          $('.main-image img').attr('src') ||
          '';
      }

      // Robust price extraction
      if (price === null) {
        const text = 
          $('.price-default--current--F8OlYIo').text().trim() ||
          $('[class*="price-default--current"]').text().trim() ||
          $('.product-price-value').first().text().trim();
        
        if (text) {
          price = parsePrice(text);
        }
      }

      if (originalPrice === null) {
        const originalText = 
          $('.price-default--original--CWcHOit').text().trim() ||
          $('[class*="price-default--original"]').text().trim() ||
          $('.product-price-del del').text().trim() || 
          $('.product-price-original del').text().trim();

        if (originalText) {
          originalPrice = parsePrice(originalText);
        }
      }

      // Final availability check
      const outOfStockText = $('.product-status-wrap').text().toLowerCase();
      if (outOfStockText.includes('esgotado') || outOfStockText.includes('out of stock')) {
        available = false;
      }

      const hasBuyButton = 
        $('button.buy-now--buynow').length > 0 || 
        $('.buy-now--buynow--OH44OI8').length > 0 ||
        $('.comet-v2-btn-important').length > 0;
      
      if (!hasBuyButton && price === null) {
        available = false;
      }

      logger.debug({ name, price, available, store: 'aliexpress' }, 'AliExpress scrape result');

      return {
        name: name.substring(0, 200),
        price,
        available,
        originalPrice,
        imageUrl,
        coupon,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping AliExpress');
      return null;
    }
  },
};
