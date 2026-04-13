import { BaseCouponScraper } from './base';
import { fetchHtml, parseHtml } from '../base';
import { GenericCoupon } from '../../types';
import { logger } from '../../utils/logger';

export class AmazonCouponScraper extends BaseCouponScraper {
  name = 'amazon';
  url = 'https://www.amazon.com.br/cupons';

  async scrape(): Promise<Partial<GenericCoupon>[]> {
    try {
      // Amazon costuma pedir JS para renderizar cupons
      const html = await fetchHtml(this.url, true, true, 1);
      if (!html) return [];

      const $ = parseHtml(html);
      const coupons: Partial<GenericCoupon>[] = [];

      // A Amazon pode redirecionar para landing pages específicas ou mostrar grid
      // Estratégia baseada na pesquisa do subagent: "Cupom: QUARTOUU"
      const bodyText = $('body').text();
      const codeMatch = bodyText.match(/(?:Cupom|CUPOM|Código|CÓDIGO):\s*([A-Z0-9]{4,20})\b/i);
      
      if (codeMatch) {
         const code = codeMatch[1].toUpperCase();
         const description = $('h1').first().text().trim() || 'Promoção Amazon';
         const { value, type } = this.parseDiscount(description);

         coupons.push({
           store: 'amazon',
           code,
           description,
           discount_value: value,
           discount_type: type,
           active: 1
         });
      }

      // Fallback para grid de cupons padrão se houver
      $('.coupon-code-label').each((_, el) => {
         const code = $(el).text().trim();
         if (code) {
           coupons.push({
             store: 'amazon',
             code,
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

export const amazonCouponScraper = new AmazonCouponScraper();
