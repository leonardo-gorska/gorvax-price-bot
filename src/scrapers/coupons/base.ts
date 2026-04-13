import * as cheerio from 'cheerio';
import { GenericCoupon } from '../../types';
import { parseHtml, parsePrice, extractFirstPrice } from '../base';

export interface CouponScraper {
  name: string;
  url: string;
  scrape(): Promise<Partial<GenericCoupon>[]>;
}

export abstract class BaseCouponScraper implements CouponScraper {
  abstract name: string;
  abstract url: string;
  abstract scrape(): Promise<Partial<GenericCoupon>[]>;

  /**
   * Tenta extrair o valor do desconto e o tipo (porcentagem ou fixo)
   * Ex: "10% OFF", "R$ 50 de desconto"
   */
  protected parseDiscount(text: string): { value: number | null, type: 'percent' | 'fixed' | null } {
    const percentMatch = text.match(/(\d+)\s*%/);
    if (percentMatch) {
      return { value: parseInt(percentMatch[1]), type: 'percent' };
    }

    const fixedMatch = extractFirstPrice(text);
    if (fixedMatch) {
      return { value: fixedMatch, type: 'fixed' };
    }

    return { value: null, type: null };
  }
}
