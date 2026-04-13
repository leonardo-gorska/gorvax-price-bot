// ============================================
// Scraper — KaBuM!
// ============================================

import type { Scraper } from './base';
import { extractCoupon, extractFirstPrice, extractAllPrices, parseHtml } from './base';
import type { ScrapeResult } from '../types';
import { logger } from '../utils/logger';
import { isProductRelevant, stringSimilarity } from '../utils/confidence';
import axios from 'axios';

export const kabumScraper: Scraper = {
  name: 'kabum',

  canHandle(url: string): boolean {
    return url.toLowerCase().includes('kabum.com.br');
  },

  async scrape(url: string, expectedName?: string): Promise<ScrapeResult | null> {
    try {
      // ─── ESTRATÉGIA 1: AXIOS ───
      // Kabum bloqueia Puppeteer (Cloudflare) mas permite Axios com headers corretos!
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
        timeout: 15000
      });

      if (!html) return null;
      logger.debug({ url, htmlLength: html.length }, 'Kabum: HTML recebido');

      const $ = parseHtml(html);
      const nextDataStr = $('#__NEXT_DATA__').html();
      const nextData = nextDataStr ? JSON.parse(nextDataStr) : null;
      
      const coupon = extractCoupon(html);

      let name = '';
      let price: number | null = null;
      let originalPrice: number | null = null;
      let imageUrl = '';
      let available = false;
      let productUrl = '';
      const similarProducts: { name: string; url: string; price?: number | null }[] = [];

      // ─── ESTRATÉGIA 1.1: __NEXT_DATA__ JSON (o mais confiável) ───
      if (nextData) {
        try {
          const pageProps = nextData?.props?.pageProps;
          
          if (pageProps) {
            // Suporte para Diferentes Modelos da KaBuM
            const product = pageProps?.product || pageProps?.productData || pageProps?.catalogProduct;
            
            if (product) {
              name = product.title || product.name || '';
              
              // Tenta pegar o preço com desconto (PIX) primariamente
              const prices = product.prices || product.informativeValues || product;
              price = prices.priceWithDiscount || prices.discountPrice || prices.price || null;
              originalPrice = prices.oldPrice || prices.price || null;
              
              // Se o original for igual ao com desconto, zera o original
              if (originalPrice === price) originalPrice = null;

              imageUrl = product.thumbnail || product.photos?.[0] || product.image || (product.medias?.[0]?.images?.g) || '';
              available = product.available !== false && (product.status === 'active' || !!price || product.flags?.isAvailable);
              
              logger.debug({ name, price, source: 'JSON:product' }, 'Kabum: Dados extraídos via pageProps');
            }

            // Busca (Modelo 1: SSR data)
            let catalogServer = pageProps?.data?.catalogServer || pageProps?.catalogServer || pageProps?.data?.catalog;
            
            // Busca (Modelo 2: SSR fallback)
            if (!catalogServer && pageProps?.fallback) {
              const searchKey = Object.keys(pageProps.fallback).find(k => k.includes('search'));
              if (searchKey) {
                catalogServer = pageProps.fallback[searchKey]?.catalogServer || pageProps.fallback[searchKey]?.data?.catalog;
              }
            }

            const searchData = catalogServer?.products || catalogServer?.data || pageProps?.products || pageProps?.data?.products;
            
            if (searchData && Array.isArray(searchData) && searchData.length > 0 && !name) {
              let selectedProduct = searchData[0];
              let productUrl = selectedProduct.code ? `https://www.kabum.com.br/produto/${selectedProduct.code}` : '';
              
              if (expectedName && url.includes('/busca')) {
                let bestScore = -1;
                let foundValid = false;

                for (const item of searchData) {
                  const title = item.name || item.title || '';
                  if (!isProductRelevant(title, expectedName || '')) continue;

                  const score = stringSimilarity(title, expectedName);
                  if (score > bestScore) {
                    bestScore = score;
                    selectedProduct = item;
                    productUrl = item.code ? `https://www.kabum.com.br/produto/${item.code}` : '';
                    foundValid = true;
                  }
                }

                if (!foundValid) {
                  logger.warn({ url, expectedName, bestScore }, 'Kabum: nenhum produto relevante encontrado em __NEXT_DATA__');
                  return null;
                }
              }

              const first = selectedProduct;
              name = first.name || first.title || '';
              price = first.priceWithDiscount || first.price || first.offer?.price || null;
              originalPrice = first.oldPrice || first.priceWithoutDiscount || null;
              imageUrl = first.image || first.imageUrl || '';
              available = first.available !== false;
            }
            
            // Produto individual
            if (!name && pageProps?.data?.name) {
              name = pageProps.data.name;
              price = pageProps.data.priceWithDiscount || pageProps.data.price || null;
              originalPrice = pageProps.data.oldPrice || null;
              imageUrl = pageProps.data.photos?.[0] || pageProps.data.image || '';
              available = pageProps.data.available !== false;
            }
          }
        } catch {
          logger.debug({ url }, 'Falha ao parsear __NEXT_DATA__, seguindo...');
        }
      }
      // ─── ESTRATÉGIA 1.1.2: productSchema LD+JSON (Novo e muito confiável para busca) ───
      if (!name || price === null) {
        try {
          // Tentar encontrar o schema correto (pode não ter ID ou ter ID diferente)
          let schemaScript = $('#productSchema').html();
          if (!schemaScript) {
            $('script[type="application/ld+json"]').each((_, el) => {
              const content = $(el).html();
              if (content && content.includes('"@type":"Product"')) {
                schemaScript = content;
              }
            });
          }

          if (schemaScript) {
            const schemaData = JSON.parse(schemaScript);
            const products = Array.isArray(schemaData) ? schemaData : (schemaData['@type'] === 'ItemList' ? schemaData.itemListElement.map((e: any) => e.item || e) : [schemaData]);
            
            if (products.length > 0) {
              let selectedProduct = null;
              let bestScore = -1;
              
              for (const item of products) {
                const title = item.name || '';
                if (!isProductRelevant(title, expectedName || '')) continue;

                const score = expectedName ? stringSimilarity(title, expectedName) : 0.5;
                if (score > bestScore) {
                  bestScore = score;
                  selectedProduct = item;
                }
              }

              if (selectedProduct) {
                logger.debug({ name: selectedProduct.name, score: bestScore }, 'Produto selecionado via LD+JSON');
                name = name || selectedProduct.name || '';
                price = price || selectedProduct.offers?.price || null;
                imageUrl = imageUrl || selectedProduct.image || '';
                productUrl = productUrl || selectedProduct.offers?.url || '';
                available = true;
              }
            }
          }
        } catch (e) {
          logger.debug({ url, error: (e as Error).message }, 'Falha ao parsear productSchema, seguindo...');
        }
      }

      // ─── ESTRATÉGIA 1.2: DOM CSS ───
      if (!name || price === null) {
        let firstCard = $('article').first();

        if (url.includes('/busca') && expectedName) {
           let bestScore = -1;
           let foundValid = false;

           $('article').each((i, el) => {
             const title = $(el).find('.productLink h3 span').first().text().trim() ||
                           $(el).find('h3').first().text().trim();
             
             if (!isProductRelevant(title, expectedName || '')) return;

             const score = stringSimilarity(title, expectedName);
             if (score > bestScore) {
               bestScore = score;
               firstCard = $(el);
               foundValid = true;
             }
           });

           if (!foundValid) {
             logger.warn({ url, expectedName, bestScore }, 'Kabum: nenhum produto relevante encontrado em DOM');
             return null;
           }
        }

        if (firstCard.length && url.includes('/busca')) {
          productUrl = firstCard.find('a[href*="/produto/"]').first().attr('href') || '';
          name = name || firstCard.find('.productLink h3 span').first().text().trim()
            || firstCard.find('[class*="productLink"] h3 span').first().text().trim()
            || firstCard.find('h3 span').first().text().trim()
            || firstCard.find('h3').first().text().trim();
          
          if (price === null) {
            const cardText = firstCard.text();
            const prices = extractAllPrices(cardText);
            if (prices.length > 0) {
              price = prices[prices.length - 1]; // Maior = real
              if (prices.length >= 2 && prices[prices.length - 1] / prices[0] < 3) {
                price = prices[0]; // Se forem próximos, menor é PIX
              } else if (prices.length >= 2) {
                price = prices[prices.length - 1]; // Se > 3x, menor é parcela, maior é real
              }
            }
          }
          
          const oldPriceText = firstCard.find('del, s, [class*="oldPrice"]').first().text();
          if (!originalPrice) originalPrice = extractFirstPrice(oldPriceText);
          imageUrl = imageUrl || firstCard.find('img').first().attr('src') || '';
        } else {
          name = name || $('h1').first().text().trim();

          if (price === null) {
            const priceElements = $('h4.finalPrice, [class*="finalPrice"], [class*="priceCard"]');
            const prices = extractAllPrices(priceElements.text());
            // Prioriza o preço real, ignorando parcelas (ratio > 5x)
            const cardPrice = prices.length > 0 ? (prices.length > 1 && prices[prices.length-1] / prices[0] > 5 ? prices[prices.length-1] : prices[0]) : null;
            
            if (cardPrice && cardPrice > 5) {
              price = cardPrice;
            } else {
              const mainText = $('main, [class*="product"]').first().text();
              const pricesFromMain = extractAllPrices(mainText);
              if (pricesFromMain.length > 0) {
                price = pricesFromMain.length >= 2 && (pricesFromMain[pricesFromMain.length - 1] / pricesFromMain[0] > 3)
                  ? pricesFromMain[pricesFromMain.length - 1]
                  : pricesFromMain[0];
              }
            }
          }

          const origText = $('span.oldPrice, [class*="oldPrice"], del').first().text();
          if (!originalPrice) originalPrice = extractFirstPrice(origText);
          imageUrl = imageUrl || $('img.mainMedia, img[alt]').first().attr('src') || '';
        }
      }

      // Fallbacks e verificações finais
      if (!name || name.length < 5) name = 'Produto Kabum';

      if (price !== null && price < 5) {
        logger.warn({ url, parsedPrice: price }, 'Kabum: preço muito baixo (erro parsing)');
        price = null;
      }

      // Verifica disponibilidade (se JSON não definiu)
      if (!available) {
        const unavailableText = $('body').text().toLowerCase();
        available = !unavailableText.includes('produto indisponível')
          && !unavailableText.includes('esgotado')
          && price != null;
      }

      logger.debug({ name, price, available }, 'Kabum scrape resultado');

      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://www.kabum.com.br' + productUrl;
      }

      return {
        name: name.substring(0, 200),
        price,
        available,
        originalPrice,
        pixPrice: price,
        imageUrl,
        coupon,
        similarProducts,
        productUrl,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: message }, 'Erro scraping Kabum');
      return null;
    }
  },
};
