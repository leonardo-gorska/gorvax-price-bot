import { BaseCouponScraper } from './base';
import { fetchHtml, parseHtml } from '../base';
import { GenericCoupon } from '../../types';
import { logger } from '../../utils/logger';

export class MercadoLivreCouponScraper extends BaseCouponScraper {
  name = 'mercadolivre';
  url = 'https://www.mercadolivre.com.br/cupons';

  async scrape(): Promise<Partial<GenericCoupon>[]> {
    try {
      // O Mercado Livre exige Puppeteer para renderizar o grid de cupons (Andes UI)
      const html = await fetchHtml(this.url, true, true, 1, '.andes-card, [data-testid="coupon-item"]');
      if (!html) return [];

      const $ = parseHtml(html);
      const coupons: Partial<GenericCoupon>[] = [];

      // Seletores baseados no Andes Design System e data-testid
      const couponCards = $('[data-testid="coupon-item"], .andes-card').filter((_, el) => {
        return $(el).find('[data-testid="coupon-code"], .coupon-code').length > 0;
      });

      couponCards.each((_, el) => {
        const $el = $(el);
        
        const code = $el.find('[data-testid="coupon-code"], .coupon-code').first().text().trim() || 
                     $el.find('button.andes-button--loud span').first().text().trim();
        
        const description = $el.find('[data-testid="coupon-description"], .andes-list__item-title').first().text().trim() ||
                            $el.find('.andes-list__item-text span').first().text().trim();
        
        const amountText = $el.find('[data-testid="coupon-amount"], .andes-list__item-primary').first().text().trim();
        const minPurchaseText = $el.find('[data-testid="coupon-minimum-purchase"], .andes-list__item-secondary').first().text().trim();

        if (code && code.length >= 4) {
          const { value, type } = this.parseDiscount(amountText || description);
          
          let minPurchase: number | null = null;
          if (minPurchaseText) {
            const match = minPurchaseText.match(/R\$\s?([\d.]+,\d{2})/i);
            if (match) {
              const cleaned = match[1].replace(/\./g, '').replace(',', '.');
              minPurchase = parseFloat(cleaned);
            }
          }

          coupons.push({
            store: 'mercadolivre',
            code: code.toUpperCase(),
            description: description || 'Cupom Mercado Livre',
            discount_value: value,
            discount_type: type,
            min_purchase: minPurchase,
            active: 1
          });
        }
      });

      // Fallback: se não encontrar cards estruturados, tenta regex no body
      if (coupons.length === 0) {
        logger.debug('Nenhum card de cupom estruturado encontrado no ML. Tentando fallback via Regex...');
        const bodyText = $('body').text();
        const matches = bodyText.matchAll(/(?:Cupom|CUPOM|Código|CÓDIGO|CUPON):\s*([A-Z0-9]{4,20})\b/gi);
        
        for (const match of matches) {
          coupons.push({
            store: 'mercadolivre',
            code: match[1].toUpperCase(),
            active: 1
          });
        }
      }

      // Remover duplicados por código
      const uniqueCoupons = Array.from(new Map(coupons.map(c => [c.code, c])).values());

      logger.info({ store: this.name, count: uniqueCoupons.length }, 'Coupom scraping do Mercado Livre concluído');
      return uniqueCoupons;
    } catch (err: any) {
      logger.error({ store: this.name, error: err.message }, 'Erro no coupon scraping do Mercado Livre');
      return [];
    }
  }
}

export const mercadolivreCouponScraper = new MercadoLivreCouponScraper();
