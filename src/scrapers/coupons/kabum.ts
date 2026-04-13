import { BaseCouponScraper } from './base';
import { fetchHtml, parseHtml } from '../base';
import { GenericCoupon } from '../../types';
import { logger } from '../../utils/logger';

export class KabumCouponScraper extends BaseCouponScraper {
  name = 'kabum';
  url = 'https://www.kabum.com.br/hotsite/cupons/';

  async scrape(): Promise<Partial<GenericCoupon>[]> {
    try {
      const html = await fetchHtml(this.url, false, true, 1, '.uk-card');
      if (!html) return [];

      const $ = parseHtml(html);
      const coupons: Partial<GenericCoupon>[] = [];

      $('.uk-card').each((_, el) => {
        const card = $(el);
        
        // O código costuma estar em um span dentro do botão azul
        const code = card.find('span').filter((_, s) => {
          const txt = $(s).text().trim();
          return txt.length >= 4 && /^[A-Z0-9]+$/.test(txt);
        }).first().text().trim();

        if (!code) return;

        const description = card.find('p').first().text().trim() || 
                           card.find('.uk-card-title').text().trim();
        
        const { value, type } = this.parseDiscount(description);
        
        // Tenta pegar validade do countdown (ex: "Acaba em 306 h")
        const expiresText = card.find('.uk-countdown-number, p').text().trim();

        coupons.push({
          store: 'kabum',
          code,
          description,
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

export const kabumCouponScraper = new KabumCouponScraper();
