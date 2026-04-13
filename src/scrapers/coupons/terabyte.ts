import { BaseCouponScraper } from './base';
import { fetchHtml, parseHtml } from '../base';
import { GenericCoupon } from '../../types';
import { logger } from '../../utils/logger';

export class TerabyteCouponScraper extends BaseCouponScraper {
  name = 'terabyte';
  url = 'https://landing.terabyteshop.com.br/cupons/';

  async scrape(): Promise<Partial<GenericCoupon>[]> {
    try {
      // Terabyte landing page pode precisar de um pouco de espera ou ser estática
      const html = await fetchHtml(this.url, false, true, 2, 'div.bg-card');
      if (!html) return [];

      const $ = parseHtml(html);
      const coupons: Partial<GenericCoupon>[] = [];

      $('div.rounded-lg.border.bg-card').each((_, el) => {
        const card = $(el);
        
        // Código: button[id^='rewardId-'] span
        const code = card.find("button[id^='rewardId-'] span").text().trim();
        if (!code) return;

        const discountText = card.find('div.text-emerald-500').text().trim();
        const description = card.find('div.text-sm.font-semibold.leading-tight').text().trim();
        
        const { value, type } = this.parseDiscount(discountText || description);

        coupons.push({
          store: 'terabyte',
          code: code.toUpperCase(),
          description: description || discountText,
          discount_value: value,
          discount_type: type,
          active: 1
        });
      });

      logger.info({ store: this.name, count: coupons.length }, 'Coupom scraping concluído');
      return coupons;
    } catch (err: any) {
      logger.error({ store: this.name, error: err.message }, 'Erro no coupon scraping');
      return [];
    }
  }
}

export const terabyteCouponScraper = new TerabyteCouponScraper();
