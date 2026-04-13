import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performCrossStoreSearch } from './crossSearch';
import * as scraperIndex from '../scrapers/index';

// Mock do logger para não poluir o console
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('CrossStoreSearch Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar resultados quando a similaridade é alta', async () => {
    // Mock do scrapeUrl para retornar um produto similar
    const spy = vi.spyOn(scraperIndex, 'scrapeUrl').mockImplementation(async (url) => {
      if (url.includes('pichau')) {
        return {
          name: 'Processador AMD Ryzen 5 7600 3.8GHz',
          price: 1250,
          available: true,
          productUrl: 'https://pichau.com.br/ryzen-5-7600'
        };
      }
      return null;
    });

    const results = await performCrossStoreSearch('AMD Ryzen 5 7600', 'cpu', 'kabum');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].store).toBe('pichau');
    expect(results[0].similarity).toBeGreaterThan(0.7);
    expect(spy).toHaveBeenCalled();
  });

  it('deve ignorar produtos com baixa similaridade', async () => {
    vi.spyOn(scraperIndex, 'scrapeUrl').mockImplementation(async (url) => {
      if (url.includes('pichau')) {
        return {
          name: 'Teclado Mecânico Gamer',
          price: 200,
          available: true,
          productUrl: 'https://pichau.com.br/teclado'
        };
      }
      return null;
    });

    const results = await performCrossStoreSearch('AMD Ryzen 5 7600', 'cpu', 'kabum');
    expect(results.length).toBe(0);
  });

  it('deve excluir a loja de origem da busca', async () => {
    const spy = vi.spyOn(scraperIndex, 'scrapeUrl');
    await performCrossStoreSearch('Product', 'cpu', 'pichau');
    
    // Verifica que nenhuma URL da pichau foi chamada
    const calls = spy.mock.calls;
    for (const [url] of calls) {
      expect(url).not.toContain('pichau.com.br');
    }
  });
});
