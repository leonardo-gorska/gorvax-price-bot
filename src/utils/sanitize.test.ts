// ============================================
// Tests — Sanitização (sanitize.ts)
// ============================================

import { describe, it, expect } from 'vitest';
import { isValidHttpUrl, isSafeUrl, escapeMarkdownV2 } from './sanitize';

describe('isValidHttpUrl', () => {
  it('aceita URL HTTPS válida', () => {
    expect(isValidHttpUrl('https://www.kabum.com.br/produto/123')).toBe(true);
  });

  it('aceita URL HTTP válida', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
  });

  it('rejeita URL sem protocolo', () => {
    expect(isValidHttpUrl('www.kabum.com.br')).toBe(false);
  });

  it('rejeita file://', () => {
    expect(isValidHttpUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejeita string vazia', () => {
    expect(isValidHttpUrl('')).toBe(false);
  });

  it('rejeita texto aleatório', () => {
    expect(isValidHttpUrl('não é uma url')).toBe(false);
  });

  it('rejeita ftp://', () => {
    expect(isValidHttpUrl('ftp://server.com/file')).toBe(false);
  });
});

describe('isSafeUrl', () => {
  it('aceita URLs de lojas reais', () => {
    expect(isSafeUrl('https://www.kabum.com.br/busca/ryzen')).toBe(true);
    expect(isSafeUrl('https://www.amazon.com.br/dp/B0123')).toBe(true);
  });

  it('bloqueia localhost', () => {
    expect(isSafeUrl('http://localhost:3000')).toBe(false);
  });

  it('bloqueia 127.0.0.1', () => {
    expect(isSafeUrl('http://127.0.0.1:8080')).toBe(false);
  });

  it('bloqueia IPs internos 192.168.x.x', () => {
    expect(isSafeUrl('http://192.168.1.1')).toBe(false);
  });

  it('bloqueia IPs internos 10.x.x.x', () => {
    expect(isSafeUrl('http://10.0.0.1')).toBe(false);
  });

  it('bloqueia URLs muito longas', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    expect(isSafeUrl(longUrl)).toBe(false);
  });
});

describe('escapeMarkdownV2', () => {
  it('escapa caracteres especiais', () => {
    expect(escapeMarkdownV2('preço_teste')).toBe('preço\\_teste');
    expect(escapeMarkdownV2('100.00')).toBe('100\\.00');
  });

  it('escapa parênteses', () => {
    expect(escapeMarkdownV2('(teste)')).toBe('\\(teste\\)');
  });

  it('não modifica texto sem caracteres especiais', () => {
    expect(escapeMarkdownV2('texto simples')).toBe('texto simples');
  });
});
