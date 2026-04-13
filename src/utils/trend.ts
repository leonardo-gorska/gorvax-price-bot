import type { TrendPoint, TrendInfo } from '../types';

/**
 * Calcula a tendência de preço baseada no histórico (últimos 30 dias).
 */
export function calculateTrend(history: TrendPoint[], currentPrice: number): TrendInfo {
  if (history.length < 2) {
    return { direction: 'neutral', changePercent: 0, isLowestStable: false };
  }

  // Ordenar por data crescente (mais antigo primeiro)
  const sorted = [...history].sort((a, b) => 
    new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
  );

  const now = new Date().getTime();
  const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);

  // 1. Verificar se é Menor Preço Estável (> 48h no mínimo histórico)
  const minPrice = Math.min(...sorted.map(h => h.price), currentPrice);
  const isCurrentlyMin = currentPrice <= minPrice;
  
  const pointsAtMin = sorted.filter(h => h.price <= minPrice * 1.01); // 1% de margem
  const firstPointAtMin = pointsAtMin.length > 0 ? pointsAtMin[0] : null;
  const isStable = firstPointAtMin && new Date(firstPointAtMin.checked_at).getTime() <= fortyEightHoursAgo;

  const isLowestStable = !!(isCurrentlyMin && isStable);

  // 2. Analisar Médias para Trajetória (7 dias vs Anterior)
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  const recentHistory = sorted.filter(h => new Date(h.checked_at).getTime() >= sevenDaysAgo);
  const olderHistory = sorted.filter(h => new Date(h.checked_at).getTime() < sevenDaysAgo);

  if (recentHistory.length > 0 && olderHistory.length > 0) {
    const avgRecent = ([...recentHistory.map(h => h.price), currentPrice].reduce((a, b) => a + b, 0)) / (recentHistory.length + 1);
    const avgOlder = olderHistory.map(h => h.price).reduce((a, b) => a + b, 0) / olderHistory.length;

    const diffPercent = ((avgRecent - avgOlder) / avgOlder) * 100;

    if (diffPercent <= -5) {
      return { direction: 'down', changePercent: diffPercent, isLowestStable };
    } else if (diffPercent >= 5) {
      return { direction: 'up', changePercent: diffPercent, isLowestStable };
    }
  }

  // 3. Fallback para Estabilidade se não houver tendência clara
  if (isLowestStable) {
    return { direction: 'stable_low', changePercent: 0, isLowestStable: true };
  }

  return { direction: 'neutral', changePercent: 0, isLowestStable: false };
}
