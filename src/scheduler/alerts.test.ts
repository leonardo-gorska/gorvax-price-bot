import { describe, it, expect } from 'vitest';
import { evaluateAlerts } from './alerts';
import type { Product, ScrapeResult } from '../types';

describe('evaluateAlerts', () => {
  const mockProduct: Product = {
    id: 1,
    url: 'https://example.com/item',
    store: 'kabum',
    category: 'gpu',
    name: 'RTX 4060',
    current_price: 2000,
    lowest_price: 1900,
    target_price: 1800,
    last_available: 1,
    active: 1,
    consecutive_failures: 0,
    created_at: new Date().toISOString()
  };

  it('should trigger restock alert when product becomes available', () => {
    const unavailableProduct = { ...mockProduct, last_available: 0 };
    const result: ScrapeResult = {
      name: 'RTX 4060',
      price: 2100,
      available: true
    };
    const alerts = evaluateAlerts(unavailableProduct, result);
    expect(alerts.some(a => a.text.includes('VOLTOU AO ESTOQUE'))).toBe(true);
  });

  it('should trigger target price alert', () => {
    const result: ScrapeResult = {
      name: 'RTX 4060',
      price: 1750, // Below 1800
      available: true
    };
    const alerts = evaluateAlerts(mockProduct, result);
    expect(alerts.some(a => a.text.includes('[ALVO ALCANÇADO]'))).toBe(true);
    expect(alerts[0].priority).toBe('high');
  });

  it('should trigger all-time low alert', () => {
    const result: ScrapeResult = {
      name: 'RTX 4060',
      price: 1850, // Below 1900 (lowest) but above 1800 (target)
      available: true
    };
    const alerts = evaluateAlerts(mockProduct, result);
    expect(alerts.some(a => a.text.includes('Menor Preço Histórico!'))).toBe(true);
    expect(alerts[0].priority).toBe('high');
  });

  it('should trigger high priority drop alert (> 10%)', () => {
    const result: ScrapeResult = {
      name: 'RTX 4060',
      price: 1790, // From 2000, drop is > 10% (below 1800 target too, so target takes priority)
      available: true
    };
    // Target price (1800) is hit, so that should be the alert
    const alerts = evaluateAlerts(mockProduct, result);
    expect(alerts.some(a => a.text.includes('[ALVO ALCANÇADO]'))).toBe(true);
  });

  it('should trigger high priority drop alert (> 10%) when no target', () => {
    const noTargetProduct = { ...mockProduct, target_price: null, lowest_price: 1800 };
    const result: ScrapeResult = {
      name: 'RTX 4060', // Current 2000
      price: 1700, // 15% drop
      available: true
    };
    const alerts = evaluateAlerts(noTargetProduct, result);
    // Em caso de ambos, o bot prioriza o Alerta de Menor Preço Histórico (conforme ROADMAP 4.1)
    expect(alerts.some(a => a.text.includes('Menor Preço Histórico!'))).toBe(true);
    expect(alerts[0].priority).toBe('high');
  });

  it('should trigger high priority drop alert (> 10%) without being all-time low', () => {
    const highLowProduct = { ...mockProduct, target_price: null, lowest_price: 1500 };
    const result: ScrapeResult = {
      name: 'RTX 4060', // Current 2000
      price: 1700, // 15% drop, but still above 1500 (lowest)
      available: true
    };
    const alerts = evaluateAlerts(highLowProduct, result);
    expect(alerts.some(a => a.text.includes('Queda Bruta'))).toBe(true);
    expect(alerts[0].priority).toBe('high');
  });

  it('should trigger normal drop alert', () => {
    const result: ScrapeResult = {
      name: 'RTX 4060',
      price: 1930, // From 2000, 3.5% drop (above lowest 1900)
      available: true
    };
    const alerts = evaluateAlerts(mockProduct, result);
    expect(alerts.some(a => a.text.includes('Queda de Preço no Site!'))).toBe(true);
    expect(alerts[0].priority).toBe('normal');
  });

  it('should handle kit badges', () => {
    const result: ScrapeResult = {
      name: 'Combo RTX 4060 + PSU',
      price: 2200,
      available: true
    };
    const unavailableProduct = { ...mockProduct, last_available: 0 };
    const alerts = evaluateAlerts(unavailableProduct, result);
    expect(alerts[0].text.includes('[KIT/COMBO]')).toBe(true);
  });
});
