import { BaseCouponScraper } from './base';
import { fetchHtml, parseHtml } from '../base';
import { GenericCoupon } from '../../types';
import { logger } from '../../utils/logger';

export class AliexpressCouponScraper extends BaseCouponScraper {
  name = 'aliexpress';
  // Foca na home onde os banners de cupons globais costumam aparecer
  url = 'https://www.aliexpress.com/';

  async scrape(): Promise<Partial<GenericCoupon>[]> {
    try {
      // AliExpress requer Puppeteer Stealth e espera para carregar banners
      const html = await fetchHtml(this.url, true, true, 3);
      if (!html) return [];

      const $ = parseHtml(html);
      const coupons: Partial<GenericCoupon>[] = [];

      // Seletores baseados na inspeção do subagent (banners n4_b2)
      $('a.n4_b2, .coupon-item').each((_, el) => {
        const item = $(el);
        const text = item.text();
        
        // Procura padrão "Código: XXXXX" ou "Code: XXXXX"
        const codeMatch = text.match(/(?:Código|Code|Cupom|CUPOM):\s*([A-Z0-9]{4,20})\b/i);
        if (codeMatch) {
          const code = codeMatch[1].toUpperCase();
          const description = text.replace(codeMatch[0], '').trim().substring(0, 100);
          const { value, type } = this.parseDiscount(text);

          coupons.push({
            store: 'aliexpress',
            code,
            description,
            discount_value: value,
            discount_type: type,
            active: 1
          });
        }
      });

      logger.info({ store: this.name, count: coupons.length }, 'Coupom scraping concluído');
      return coupons;
    } catch (err: any) {
      logger.error({ store: this.name, error: err.message }, 'Erro no coupon scraping');
      return [];
    }
  }
}

export const aliexpressCouponScraper = new AliexpressCouponScraper();
