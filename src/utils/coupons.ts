import { Product, GenericCoupon } from '../types';

/**
 * Verifica se um produto é elegível para um determinado cupom.
 */
export function isProductEligible(product: Product, price: number, coupon: GenericCoupon): boolean {
  // 1. Loja deve bater (case insensitive)
  if (coupon.store.toLowerCase() !== product.store.toLowerCase()) return false;

  // 2. Se o cupom for específico de uma categoria, ela deve bater
  if (coupon.category && coupon.category.toLowerCase() !== product.category.toLowerCase()) {
    return false;
  }

  // 3. Valor mínimo de compra
  if (coupon.min_purchase && price < coupon.min_purchase) {
    return false;
  }

  // 4. Deve estar ativo
  if (coupon.active === 0) return false;

  return true;
}

/**
 * Encontra o melhor cupom aplicável para um produto e preço específicos.
 * Prioriza o maior desconto absoluto em Reais.
 */
export function findBestCoupon(product: Product, price: number, coupons: GenericCoupon[]): GenericCoupon | null {
  if (!coupons || coupons.length === 0) return null;

  const eligible = coupons.filter(coupon => isProductEligible(product, price, coupon));

  if (eligible.length === 0) return null;

  // Calcula o valor do desconto para cada e escolhe o maior
  let bestCoupon: GenericCoupon | null = null;
  let maxDiscount = -1;

  for (const coupon of eligible) {
    let discountValue = 0;

    if (coupon.discount_type === 'percent' && coupon.discount_value) {
      discountValue = price * (coupon.discount_value / 100);
    } else if (coupon.discount_type === 'fixed' && coupon.discount_value) {
      discountValue = coupon.discount_value;
    }

    if (discountValue > maxDiscount) {
      maxDiscount = discountValue;
      bestCoupon = coupon;
    }
  }

  return bestCoupon;
}

/**
 * Calcula o preço final com o cupom aplicado.
 */
export function calculateDiscountedPrice(price: number, coupon: GenericCoupon): number {
  let discount = 0;

  if (coupon.discount_type === 'percent' && coupon.discount_value) {
    discount = price * (coupon.discount_value / 100);
  } else if (coupon.discount_type === 'fixed' && coupon.discount_value) {
    discount = coupon.discount_value;
  }

  return Math.max(0, price - discount);
}
