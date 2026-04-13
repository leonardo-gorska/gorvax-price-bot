import { describe, it, expect } from 'vitest';
import { isProductEligible, findBestCoupon, calculateDiscountedPrice } from '../utils/coupons';
import { Product, GenericCoupon } from '../types';

describe('Coupon Matching Logic', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'RTX 4060 Ti',
    store: 'kabum',
    category: 'gpu',
    current_price: 2500,
    lowest_price: 2500,
    target_price: 2300,
    url: 'https://kabum.com.br/gpu',
    active: 1,
    consecutive_failures: 0,
    created_at: new Date().toISOString()
  };

  const coupon10Percent: GenericCoupon = {
    id: 1,
    store: 'kabum',
    code: 'GPU10',
    discount_value: 10,
    discount_type: 'percent',
    category: 'gpu',
    active: 1,
    discovered_at: new Date().toISOString()
  };

  const couponFixed: GenericCoupon = {
    id: 2,
    store: 'kabum',
    code: 'FIXED100',
    discount_value: 100,
    discount_type: 'fixed',
    active: 1,
    discovered_at: new Date().toISOString()
  };

  const couponMinPurchase: GenericCoupon = {
    id: 3,
    store: 'kabum',
    code: 'BIG3000',
    discount_value: 500,
    discount_type: 'fixed',
    min_purchase: 3000,
    active: 1,
    discovered_at: new Date().toISOString()
  };

  it('should identify eligible product for category coupon', () => {
    expect(isProductEligible(mockProduct, 2500, coupon10Percent)).toBe(true);
  });

  it('should reject coupon with different store', () => {
    const pichauCoupon = { ...coupon10Percent, store: 'pichau' };
    expect(isProductEligible(mockProduct, 2500, pichauCoupon)).toBe(false);
  });

  it('should reject coupon for different category', () => {
    const cpuCoupon = { ...coupon10Percent, category: 'cpu' };
    expect(isProductEligible(mockProduct, 2500, cpuCoupon)).toBe(false);
  });

  it('should reject coupon if min_purchase not met', () => {
    expect(isProductEligible(mockProduct, 2500, couponMinPurchase)).toBe(false);
  });

  it('should accept generic coupon (no category)', () => {
    expect(isProductEligible(mockProduct, 2500, couponFixed)).toBe(true);
  });

  it('should calculate discounted price correctly (percent)', () => {
    expect(calculateDiscountedPrice(2500, coupon10Percent)).toBe(2250);
  });

  it('should calculate discounted price correctly (fixed)', () => {
    expect(calculateDiscountedPrice(2500, couponFixed)).toBe(2400);
  });

  it('should find the best coupon among multiple options', () => {
    // 10% de 2500 = 250 (GPU10)
    // Fixo 100 (FIXED100)
    // O melhor deve ser 10%
    const best = findBestCoupon(mockProduct, 2500, [coupon10Percent, couponFixed]);
    expect(best?.code).toBe('GPU10');
  });

  it('should respect min_purchase when finding best coupon', () => {
    // Se o preço fosse 3500:
    // 10% de 3500 = 350
    // Fixo 100
    // BIG3000 = 500
    // O melhor deve ser BIG3000 (500 > 350)
    const best = findBestCoupon(mockProduct, 3500, [coupon10Percent, couponFixed, couponMinPurchase]);
    expect(best?.code).toBe('BIG3000');
  });
});
