// ============================================
// Tests — Formatação (format.ts)
// ============================================

import { describe, it, expect } from 'vitest';
import {
  formatBRL, formatDate, priceChangeEmoji, categoryEmoji,
  storeEmoji, discountPercent, detectStore,
} from '../utils/format';

describe('formatBRL', () => {
  it('formata valores positivos em Reais', () => {
    const result = formatBRL(1234.56);
    expect(result).toContain('1.234,56');
    expect(result).toContain('R$');
  });

  it('retorna N/A para null', () => {
    expect(formatBRL(null)).toBe('N/A');
  });

  it('retorna N/A para undefined', () => {
    expect(formatBRL(undefined)).toBe('N/A');
  });

  it('formata zero', () => {
    const result = formatBRL(0);
    expect(result).toContain('0,00');
  });

  it('formata centavos', () => {
    const result = formatBRL(0.99);
    expect(result).toContain('0,99');
  });
});

describe('formatDate', () => {
  it('formata data ISO corretamente', () => {
    const result = formatDate('2026-01-15T14:30:00');
    expect(result).toContain('15');
    expect(result).toContain('01');
    expect(result).toContain('2026');
  });

  it('retorna Nunca para null', () => {
    expect(formatDate(null)).toBe('Nunca');
  });

  it('retorna Nunca para undefined', () => {
    expect(formatDate(undefined)).toBe('Nunca');
  });
});

describe('priceChangeEmoji', () => {
  it('retorna 📉 quando preço caiu', () => {
    expect(priceChangeEmoji(100, 80)).toBe('📉');
  });

  it('retorna 📈 quando preço subiu', () => {
    expect(priceChangeEmoji(80, 100)).toBe('📈');
  });

  it('retorna ➡️ quando preço igual', () => {
    expect(priceChangeEmoji(100, 100)).toBe('➡️');
  });
});

describe('categoryEmoji', () => {
  it('retorna emoji correto para cpu', () => {
    expect(categoryEmoji('cpu')).toBe('🧠');
  });

  it('retorna emoji correto para gpu', () => {
    expect(categoryEmoji('gpu')).toBe('🎮');
  });

  it('retorna 📦 para categoria desconhecida', () => {
    expect(categoryEmoji('unknown')).toBe('📦');
  });

  it('retorna emoji correto para chair', () => {
    expect(categoryEmoji('chair')).toBe('💺');
  });
});

describe('storeEmoji', () => {
  it('retorna emoji correto para kabum', () => {
    expect(storeEmoji('kabum')).toBe('🟠 📦');
  });

  it('retorna ⚪ ❓ para loja desconhecida', () => {
    expect(storeEmoji('aliexpress_errada')).toBe('⚪ ❓');
  });
});

describe('discountPercent', () => {
  it('calcula desconto corretamente', () => {
    expect(discountPercent(100, 80)).toBe('-20%');
  });

  it('retorna vazio quando não há desconto', () => {
    expect(discountPercent(80, 100)).toBe('');
  });

  it('retorna vazio quando preço é igual', () => {
    expect(discountPercent(100, 100)).toBe('');
  });

  it('retorna vazio para original <= 0', () => {
    expect(discountPercent(0, 50)).toBe('');
  });
});

describe('detectStore', () => {
  it('detecta Kabum', () => {
    expect(detectStore('https://www.kabum.com.br/produto/123')).toBe('kabum');
  });

  it('detecta Pichau', () => {
    expect(detectStore('https://www.pichau.com.br/search?q=test')).toBe('pichau');
  });

  it('detecta Terabyte', () => {
    expect(detectStore('https://www.terabyteshop.com.br/busca?str=test')).toBe('terabyte');
  });

  it('detecta Amazon BR', () => {
    expect(detectStore('https://www.amazon.com.br/dp/B0123')).toBe('amazon');
  });

  it('detecta Mercado Livre', () => {
    expect(detectStore('https://produto.mercadolivre.com.br/MLB-123')).toBe('mercadolivre');
  });

  it('detecta Magazine Luiza', () => {
    expect(detectStore('https://www.magazineluiza.com.br/produto/123')).toBe('magazineluiza');
  });

  it('detecta Magalu (domínio alternativo)', () => {
    expect(detectStore('https://www.magalu.com/produto/123')).toBe('magazineluiza');
  });

  it('detecta AliExpress', () => {
    expect(detectStore('https://pt.aliexpress.com/item/123.html')).toBe('aliexpress');
  });

  it('retorna null para loja não suportada', () => {
    expect(detectStore('https://www.ebay.com/itm/123')).toBeNull();
  });
});
