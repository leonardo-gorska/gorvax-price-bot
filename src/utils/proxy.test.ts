import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyManager } from './proxy';

// Mock do config ANTES de importar qualquer coisa que o use
vi.mock('../config', () => ({
  getConfig: vi.fn(() => ({})),
  randomUserAgent: vi.fn(),
  scrapeDelay: vi.fn(),
}));

// Mock do logger para evitar poluição nos testes
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

import { getConfig } from '../config';

describe('ProxyManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar lista de proxies separada por vírgula', () => {
    (getConfig as any).mockReturnValue({
      PROXY_LIST: 'http://p1:80, http://p2:80',
      PROXY_URL: undefined
    });

    const manager = new ProxyManager();
    expect(manager.hasProxies()).toBe(true);
    expect(manager.getNextProxy()).toBe('http://p1:80');
    expect(manager.getNextProxy()).toBe('http://p2:80');
    expect(manager.getNextProxy()).toBe('http://p1:80'); // Volta ao início
  });

  it('deve carregar proxy único se PROXY_LIST estiver ausente', () => {
    (getConfig as any).mockReturnValue({
      PROXY_LIST: undefined,
      PROXY_URL: 'http://single:80'
    });

    const manager = new ProxyManager();
    expect(manager.getNextProxy()).toBe('http://single:80');
    expect(manager.getNextProxy()).toBe('http://single:80');
  });

  it('deve retornar null se nenhum proxy estiver configurado', () => {
    (getConfig as any).mockReturnValue({
      PROXY_LIST: undefined,
      PROXY_URL: undefined
    });

    const manager = new ProxyManager();
    expect(manager.hasProxies()).toBe(false);
    expect(manager.getNextProxy()).toBeNull();
  });
});
