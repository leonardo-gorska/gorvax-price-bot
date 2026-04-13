// ============================================
// Scraper — Pelando (Feed de Promoções)
// ============================================

import { fetchHtml, parseHtml, parsePrice } from './base';
import { ExternalPromo } from '../types';
import { logger } from '../utils/logger';

/**
 * Raspa a página de promoções recentes do Pelando
 */
export async function scrapePelando(): Promise<ExternalPromo[]> {
  try {
    const url = 'https://www.pelando.com.br/recentes';
    logger.debug({ url }, 'Iniciando raspagem robusta do Pelando');

    // Pelando exige JS e tem proteções, então forçamos o uso do browser via Puppeteer
    // Adicionamos um seletor de espera para garantir que os cards carregaram
    const html = await fetchHtml(url, true, true, 2, 'a[href*="/d/"]');

    if (!html) {
      logger.error('❌ Falha crítica ao obter HTML do Pelando após tentativas');
      return [];
    }

    const $ = parseHtml(html);
    const promos: ExternalPromo[] = [];

    // O Pelando organiza cada promoção em um container (geralmente article ou li).
    // Tentamos encontrar os containers primeiro para garantir que título e preço pertençam ao mesmo item.
    const containers = $('article, li').filter((_, el) => $(el).find('a[href*="/d/"]').length > 0);
    
    if (containers.length === 0) {
      logger.warn({ htmlLength: html.length }, '⚠️ Nenhum container de promoção encontrado. Tentando links diretos.');
      // Fallback para o comportamento anterior se não achar containers articulados
      const directLinks = $('a[href*="/d/"]');
      directLinks.each((_, el) => {
        const $el = $(el);
        processElement($el, promos);
      });
    } else {
      containers.each((_, el) => {
        const $el = $(el);
        const titleLink = $el.find('a[href*="/d/"]').first();
        const priceEl = $el.find('[class*="price"], [class*="Price"]').first();
        
        const title = titleLink.text().trim();
        const href = titleLink.attr('href');
        let priceText = priceEl.text().trim();

        if (title && href && title.length > 5 && !title.toLowerCase().includes('ver promoção')) {
          // Se o preço não foi achado no elemento dedicado, tenta no título (alguns layouts injetam lá)
          const price = parsePrice(priceText) || extractPriceFromTitle(title);
          const coupon = extractCouponFromText(title) || extractCouponFromText($el.text());

          const parts = href.split('-');
          const lastPart = parts.pop() || '';
          const external_id = lastPart.includes('/') ? lastPart.split('/').pop()! : lastPart;

          if (external_id && external_id.length >= 3) {
            const cleanHref = href.split('?')[0];
            const fullUrl = cleanHref.startsWith('http') ? cleanHref : `https://www.pelando.com.br${cleanHref}`;

            promos.push({
              source: 'pelando',
              external_id,
              title,
              url: fullUrl,
              price,
              coupon,
            });
          }
        }
      });
    }

    // Helper para processar links individuais se o layout de containers falhar
    function processElement($el: any, acc: ExternalPromo[]) {
      const title = $el.text().trim();
      const href = $el.attr('href');
      if (!title || !href || title.toLowerCase().includes('ver promoção') || title.length < 10) return;

      const price = extractPriceFromTitle(title);
      const coupon = extractCouponFromText(title);
      const parts = href.split('-');
      const lastPart = parts.pop() || '';
      const external_id = lastPart.includes('/') ? lastPart.split('/').pop()! : lastPart;

      const cleanHref = href.split('?')[0];
      const fullUrl = cleanHref.startsWith('http') ? cleanHref : `https://www.pelando.com.br${cleanHref}`;

      acc.push({ source: 'pelando', external_id, title, url: fullUrl, price, coupon });
    }

    // Remove duplicados e limpa lixo
    const uniquePromos = Array.from(new Map(promos.map(p => [p.external_id, p])).values())
      .filter(p => !p.title.toLowerCase().includes('ver mais') && p.title.length > 10);

    logger.info({ count: uniquePromos.length }, '📊 Promoções capturadas do Pelando');
    return uniquePromos;
  } catch (err: any) {
    logger.error({ error: err.message }, '⚠️ Erro fatal no scraper do Pelando');
    return [];
  }
}

/**
 * Extrai o preço do título (ex: "R$ 1.200")
 */
function extractPriceFromTitle(text: string): number | null {
  // Padronização via helper do base.ts para consistência
  const match = text.match(/R\$\s?([\d.]+,\d{2})/i);
  if (match) {
    return parsePrice(match[1]);
  }
  // Alternativa: apenas números seguidos de vírgula
  const genericMatch = text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
  if (genericMatch) {
    return parsePrice(genericMatch[1]);
  }
  return null;
}

/**
 * Extrai cupom do texto
 */
function extractCouponFromText(text: string): string | null {
  const match = text.match(/(?:cupom|código|cod)[:\s]+([A-Z0-9]{4,})/i);
  return match ? match[1].toUpperCase() : null;
}
