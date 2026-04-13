// ============================================
// Scraper — Amazon BR
// ============================================

import type { Scraper } from './base';
import { fetchHtml, parseHtml, parsePrice, extractCoupon, extractFirstPrice, extractAllPrices } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';
import { isProductRelevant } from '../utils/confidence';

export const amazonScraper: Scraper = {
  name: 'amazon',

  canHandle(url: string): boolean {
    const low = url.toLowerCase();
    return low.includes('amazon.com.br');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // Amazon tem anti-bot pesado — forçar Puppeteer
      const useBrowser = true; // Forçar uso de browser para Amazon
      const html = await fetchHtml(
        url, useBrowser, true, 3,
        '#productTitle, .s-result-item, .a-price',
        undefined, 90000
      );
      if (!html) return null;

      const $ = parseHtml(html);
      
      const bodyText = $('body').text().toLowerCase();
      const isBlocked = bodyText.includes('api-services-support@amazon.com') || 
                        bodyText.includes('robot check') || 
                        bodyText.includes('captcha') || 
                        $('title').text().toLowerCase().includes('robot check');
      
      if (isBlocked) {
        const titleText = $('title').text();
        logger.warn({ url, title: titleText }, 'Amazon bloqueio ou CAPTCHA detectado!');
        // Salvar HTML de bloqueio para debug se necessário
        return null;
      }

      const coupon = extractCoupon(html);

      const isSearch = url.includes('/s?') || url.includes('/s/');
      let firstResult: any = null;
      if (isSearch) {
         // Seletor mais amplo para itens de resultado
         const results = $('.s-result-item[data-component-type="s-search-result"], .s-result-item.s-asin');
         logger.debug({ count: results.length, url }, 'Amazon busca: itens encontrados');
         
         if (expectedName) {
            let bestScore = -1;
            results.each((i, el) => {
              const $el = $(el);
              const title = $el.find('h2').text().trim() || 
                           $el.find('h2 span').first().text().trim() ||
                           $el.find('.a-text-normal').first().text().trim() ||
                           $el.find('h2 a span').first().text().trim();
              
              if (!title) return;

              // Check relevance using the new global utility
              if (isProductRelevant(title, expectedName)) {
                // If relevant, still pick the one with highest similarity among relevant ones
                const { stringSimilarity } = require('../utils/confidence');
                const score = stringSimilarity(title, expectedName);
                if (score > bestScore) {
                  bestScore = score;
                  firstResult = $el;
                }
              }
            });
            logger.debug({ bestScore, found: !!firstResult }, 'Amazon busca: filtro de relevância aplicado');
         }
         
         // Fallback se não achou via similaridade ou não tinha expectedName
         if (!firstResult || firstResult.length === 0) {
           // Pega o primeiro que tenha um ASIN válido (evita widgets/propagandas vazias)
           firstResult = results.filter((i, el) => !!$(el).attr('data-asin')).first();
           logger.debug('Amazon busca: usando fallback para primeiro item com ASIN');
         }
      }

      let name = '';
      let imageUrl = '';
      let price: number | null = null;
      let originalPrice: number | null = null;
      let available = false;
      let productUrl = url;

      if (isSearch && firstResult) {
        // MODO BUSCA
        name = firstResult.find('h2').text().trim() || 
               firstResult.find('h2 span').first().text().trim() ||
               firstResult.find('h2 a span').first().text().trim() ||
               firstResult.find('.a-size-medium').first().text().trim() ||
               firstResult.find('.a-size-base-plus').first().text().trim() ||
               firstResult.find('a.a-link-normal .a-text-normal').first().text().trim();

        const href = firstResult.find('a.a-link-normal').has('h2').attr('href') ||
                    firstResult.find('h2 a').attr('href') || 
                    firstResult.find('a.a-link-normal').first().attr('href');

        // Clean URL even more
        if (href) {
          productUrl = href.startsWith('http') ? href : `https://www.amazon.com.br${href}`;
          // Extract only the essential part: /dp/ASIN or /gp/product/ASIN
          const dpMatch = productUrl.match(/(\/[dg]p\/[A-Z0-9]{10})/i);
          if (dpMatch) {
            productUrl = `https://www.amazon.com.br${dpMatch[1]}`;
          } else {
            productUrl = productUrl.split('?')[0].split('/ref=')[0];
          }
        }
        imageUrl = firstResult.find('img.s-image').attr('src') || '';
        
        const priceText = firstResult.find('.a-price .a-offscreen').first().text().trim() ||
                          firstResult.find('.a-price').first().text().trim();
        
        price = parsePrice(priceText);

        if (!price) {
          const whole = firstResult.find('.a-price-whole').first().text().replace(/[^\d]/g, '').trim();
          const fraction = firstResult.find('.a-price-fraction').first().text().replace(/[^\d]/g, '').trim();
          if (whole) {
            price = parseFloat(`${whole}.${fraction || '00'}`);
          }
        }
        available = price != null && price > 0;
      } else {
        // MODO PRODUTO
        const titleElem = $('#productTitle');
        const altTitleElem = $('#title');
        
        name = titleElem.text().trim()
          || altTitleElem.text().trim()
          || $('h1 span').first().text().trim()
          || $('.a-size-large.perf-title-main').text().trim()
          || 'Produto Amazon';

        if (name === 'Produto Amazon') {
          logger.debug({ url }, 'Amazon: Falha ao extrair título real, usando fallback');
        } else {
          logger.debug({ name: name.substring(0, 50) }, 'Amazon: Título extraído com sucesso');
        }

        imageUrl = $('#landingImage').attr('src') || $('img.a-dynamic-image').first().attr('src') || '';

        // Amazon estrutura: "R$" em .a-price-symbol, "1.234" em .a-price-whole, ",56" em .a-price-fraction
        const priceWholeElem = $('.a-price .a-price-whole').first();
        const whole = priceWholeElem.text().replace(/[^\d]/g, '').trim();
        const fraction = $('.a-price .a-price-fraction').first().text().trim();

        if (whole) {
          const priceStr = `${whole}.${fraction || '00'}`;
          price = parseFloat(priceStr);
          if (isNaN(price)) price = null;
        }

        // Fallback genérico e seletores modernos
        if (!price) {
          const accessibilityPrice = $('#apex-pricetopay-accessibility-label').text();
          if (accessibilityPrice) {
            price = parsePrice(accessibilityPrice);
            if (price) logger.debug({ price, method: 'accessibility-label' }, 'Amazon: Preço extraído via label de acessibilidade');
          }
          
          if (!price) {
            const priceText = $('.a-price.aok-align-center .a-offscreen').first().text()
              || $('#corePrice_feature_div .a-price .a-offscreen').first().text()
              || $('.a-price .a-offscreen').first().text()
              || $('#priceblock_ourprice').text()
              || $('#priceblock_dealprice').text();
            price = parsePrice(priceText);
          }
        }

        const originalText = $('[data-a-strike="true"] .a-offscreen').first().text()
          || $('.a-text-strike').first().text();
        originalPrice = parsePrice(originalText);

        const pageText = $('body').text().toLowerCase();
        available = !pageText.includes('currently unavailable')
          && !pageText.includes('indisponível')
          && !pageText.includes('esgotado')
          && price != null && price > 0;
      }

      const similarProducts: { name: string; url: string; price?: number | null }[] = [];
      $('.a-carousel-card').slice(0, 5).each((_, el) => {
        const titleElem = $(el).find('.p13n-sc-truncate').first();
        const linkElem = $(el).find('a.a-link-normal').first();
        const nameSim = titleElem.text().trim() || linkElem.text().trim();
        let href = linkElem.attr('href');
        
        if (href && !href.startsWith('http')) {
          href = `https://www.amazon.com.br${href}`;
        }

        const priceText = $(el).find('.a-price .a-offscreen').first().text();
        const priceSim = parsePrice(priceText);

        if (nameSim && href && (href.includes('/dp/') || href.includes('/gp/product/'))) {
          // Remove tracking query params
          const cleanUrl = href.split('?')[0];
          similarProducts.push({ name: nameSim.substring(0, 100), url: cleanUrl, price: priceSim });
        }
      });

      logger.debug({ name, price, available, similarCount: similarProducts.length }, 'Amazon scrape resultado');

      return {
        name: name.substring(0, 200),
        price,
        available,
        originalPrice,
        imageUrl,
        coupon,
        similarProducts,
        productUrl: productUrl !== url ? productUrl : undefined,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping Amazon');
      return null;
    }
  },
};
