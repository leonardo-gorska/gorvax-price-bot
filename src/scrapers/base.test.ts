// ============================================
// Tests — Scraper Base (parsePrice, extractCoupon)
// ============================================

import { describe, it, expect } from 'vitest';
import { parsePrice, extractCoupon } from '../scrapers/base';

describe('parsePrice', () => {
  it('parseia formato brasileiro: R$ 1.234,56', () => {
    expect(parsePrice('R$ 1.234,56')).toBe(1234.56);
  });

  it('parseia valor simples: R$ 99,90', () => {
    expect(parsePrice('R$ 99,90')).toBe(99.9);
  });

  it('parseia sem R$: 1.500,00', () => {
    expect(parsePrice('1.500,00')).toBe(1500);
  });

  it('parseia sem centavos: R$ 800', () => {
    expect(parsePrice('R$ 800')).toBe(800);
  });

  it('ignora texto ao redor: "por apenas R$ 799,99 no PIX"', () => {
    expect(parsePrice('por apenas R$ 799,99 no PIX')).toBe(799.99);
  });

  it('retorna null para string vazia', () => {
    expect(parsePrice('')).toBeNull();
  });

  it('retorna null para null', () => {
    expect(parsePrice(null)).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(parsePrice(undefined)).toBeNull();
  });

  it('retorna null para texto sem números', () => {
    expect(parsePrice('Indisponível')).toBeNull();
  });

  it('retorna null para preço zero ou negativo', () => {
    expect(parsePrice('R$ 0,00')).toBeNull();
    expect(parsePrice('R$ -10')).toBeNull();
  });

  it('parseia valores grandes: R$ 15.999,99', () => {
    expect(parsePrice('R$ 15.999,99')).toBe(15999.99);
  });
});

describe('extractCoupon', () => {
  it('encontra cupom em texto simples', () => {
    expect(extractCoupon('<p>Use o cupom: SAVE10 para desconto</p>')).toBe('SAVE10');
  });

  it('encontra cupom com "código"', () => {
    expect(extractCoupon('<span>Código: PROMO2026</span>')).toBe('PROMO2026');
  });

  it('ignora words falso-positivas', () => {
    expect(extractCoupon('<p>Cupom: APLICADO</p>')).toBeNull();
    expect(extractCoupon('<p>Cupom: DESCONTO</p>')).toBeNull();
  });

  it('retorna null se nenhum cupom encontrado', () => {
    expect(extractCoupon('<p>Produto em promoção</p>')).toBeNull();
  });

  it('não encontra cupons dentro de scripts', () => {
    expect(extractCoupon('<script>var cupom = "CODE123";</script><p>Sem cupom aqui</p>')).toBeNull();
  });

  it('encontra cupom case-insensitive', () => {
    expect(extractCoupon('<p>CUPOM: MEGA50OFF</p>')).toBe('MEGA50OFF');
  });
});
