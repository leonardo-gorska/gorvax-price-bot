import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoHunterService } from './autoHunter';
import * as crossSearch from './crossSearch';
import { HUNTER_TARGETS } from '../config/hunter_targets';

vi.mock('../utils/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('../db/queries', () => ({
  getSetting: vi.fn(() => '123456789'),
}));

describe('AutoHunter Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve detectar um outlier com desconto real (>= 18% abaixo da mediana)', async () => {
    // Mock de resultados: Mediana é 1050 ((1000+1100)/2)
    const mockResults: crossSearch.CrossSearchResult[] = [
      { store: 'Amazon', url: 'URL1', name: 'NVIDIA GeForce RTX 4060 8GB', price: 1000, similarity: 1 },
      { store: 'Kabum', url: 'URL2', name: 'NVIDIA GeForce RTX 4060 8GB', price: 1100, similarity: 1 },
      { store: 'Pichau', url: 'URL3', name: 'NVIDIA GeForce RTX 4060 8GB', price: 1050, similarity: 1 },
      { store: 'Shopee', url: 'URL4', name: 'NVIDIA GeForce RTX 4060 8GB', price: 800, similarity: 0.95 }, // Outlier! (~24% off)
    ];

    const target = HUNTER_TARGETS.find(t => t.query === 'RTX 4060')!;
    const hits = (autoHunterService as any).detectOutliers(target, mockResults);

    expect(hits.length).toBe(1);
    expect(hits[0].price).toBe(800);
    expect(hits[0].store).toBe('Shopee');
    expect(hits[0].savingsPercent).toBeGreaterThan(20);
  });

  it('deve ignorar itens com baixa similaridade (falsos positivos)', async () => {
    const mockResults: crossSearch.CrossSearchResult[] = [
      { store: 'A', url: 'U1', name: 'RTX 4060 8GB', price: 1000, similarity: 1 },
      { store: 'B', url: 'U2', name: 'RTX 4060 8GB', price: 1050, similarity: 1 },
      { store: 'C', url: 'U3', name: 'Adaptador de Tomada para RTX', price: 50, similarity: 0.3 }, // Similaridade baixa
    ];

    const target = HUNTER_TARGETS.find(t => t.query === 'RTX 4060')!;
    const hits = (autoHunterService as any).detectOutliers(target, mockResults);

    expect(hits.length).toBe(0);
  });

  it('deve ignorar preços absurdamente baixos (erros de scraping/centavos)', async () => {
    const mockResults: crossSearch.CrossSearchResult[] = [
      { store: 'A', url: 'U1', name: 'RTX 4060 8GB', price: 1000, similarity: 1 },
      { store: 'B', url: 'U2', name: 'RTX 4060 8GB', price: 1050, similarity: 1 },
      { store: 'C', url: 'U3', name: 'RTX 4060 8GB', price: 10, similarity: 1 }, // 99% off (provável bug)
    ];

    const target = HUNTER_TARGETS.find(t => t.query === 'RTX 4060')!;
    const hits = (autoHunterService as any).detectOutliers(target, mockResults);

    expect(hits.length).toBe(0); // Regra de savings <= 75%
  });
});
